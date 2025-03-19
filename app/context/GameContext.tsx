import React, { createContext, useState, useEffect, useContext } from 'react';
import { subscribeToGame, makeMove, createGame, joinGame, resignGame, spectateGame } from '../services/gameService';
import { auth } from '../config/firebase';
import { Game, Move, Piece } from '../types/types';
import { ReactNode } from 'react';
import { Chess, Square } from 'chess.js';

interface GameContextType {
  gameId: string | null;
  gameData: Game | null;
  playerColor: "white" | "black" | null;
  chessBoard: Chess | null;
  isMyTurn: boolean;
  isGameOver: boolean;
  validMoves: Record<string, string[]>; // From square -> array of valid destinations
  startNewGame: () => Promise<string>;
  joinExistingGame: (id: string) => Promise<void>;
  movePiece: (from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n') => Promise<void>;
  resignCurrentGame: () => Promise<void>;
  getPieceAt: (square: string) => Piece;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isSpectator: boolean;
  allowSpectators: boolean;
  spectateGame: (id: string) => Promise<void>;
}

const GameContext = createContext<GameContextType>({
  gameId: null,
  gameData: null,
  playerColor: null,
  chessBoard: null,
  isMyTurn: false,
  isGameOver: false,
  validMoves: {},
  startNewGame: async () => '',
  joinExistingGame: async () => {},
  movePiece: async () => {},
  resignCurrentGame: async () => {},
  getPieceAt: () => null,
  isCheck: false,
  isCheckmate: false,
  isDraw: false,
  isSpectator: false,
  allowSpectators: false,
  spectateGame: async () => {},
});

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
  const [chessBoard, setChessBoard] = useState<Chess | null>(null);
  const [validMoves, setValidMoves] = useState<Record<string, string[]>>({});
  const [isCheck, setIsCheck] = useState(false);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [allowSpectators, setAllowSpectators] = useState(false);
  
  // Subscribe to game updates when gameId changes
  useEffect(() => {
    if (!gameId) return;
    
    const unsubscribe = subscribeToGame(gameId, (data) => {
      setGameData(data);
      
      // Update local chess.js instance based on FEN
      if (data.board) {
        try {
          const chess = new Chess(data.board);
          setChessBoard(chess);
          
          // Calculate valid moves for all pieces
          const moves: Record<string, string[]> = {};
          
          // Get all squares with pieces on them
          const squares = getAllSquares();
          
          squares.forEach(square => {
            // Convert string to Square type
            const typedSquare = square as Square;
            const piece = chess.get(typedSquare);
            
            if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
              const destinations = chess.moves({
                square: typedSquare,
                verbose: true
              }).map(move => move.to);
              
              if (destinations.length > 0) {
                moves[square] = destinations;
              }
            }
          });
          
          setValidMoves(moves);
          setIsCheck(chess.isCheck());
          setIsCheckmate(chess.isCheckmate());
          setIsDraw(chess.isDraw());
        } catch (error) {
          console.error("Error parsing FEN:", error);
        }
      }
    });
    
    return () => unsubscribe();
  }, [gameId, playerColor]);
  
  // Helper function to get all squares on the board
  const getAllSquares = (): string[] => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const squares: string[] = [];
    
    for (const file of files) {
      for (const rank of ranks) {
        squares.push(file + rank);
      }
    }
    
    return squares;
  };
  
  useEffect(() => {
    if (!gameData || !auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    if (gameData.whitePlayer === userId) {
      setPlayerColor('white');
      setIsSpectator(false);
    } else if (gameData.blackPlayer === userId) {
      setPlayerColor('black');
      setIsSpectator(false);
    } else {
      setPlayerColor(null); // Spectator
      setIsSpectator(true);
    }
    
    setAllowSpectators(gameData.allowSpectators || false);

  }, [gameData]);
  
  const startNewGame = async (allowSpectating: boolean = false): Promise<string> => {
    try {
      const id = await createGame(allowSpectating);
      if (!id) throw new Error("Failed to create game: No game ID returned");
      setGameId(id);
      setPlayerColor('white');
      return id;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  };
  
  const joinExistingGame = async (id: string) => {
    try {
      await joinGame(id);
      setGameId(id);
      // Color will be set by the useEffect that checks user ID against game data
    } catch (error) {
      console.error("Error joining game:", error);
      throw error;
    }
  };
  

  const spectateExistingGame = async (id: string) => {
    try {
      await spectateGame(id);
      setGameId(id);
      setIsSpectator(true);
      setPlayerColor(null); // Spectators don't have a color
    } catch (error) {
      console.error("Error spectating game:", error);
      throw error;
    }
  };
  
  const movePiece = async (from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n') => {
    if (!gameId || !chessBoard || !playerColor) return;
    
    try {
      // Convert string to Square type
      const fromSquare = from as Square;
      
      // Get piece information
      const piece = chessBoard.get(fromSquare);
      if (!piece) throw new Error("No piece at this position");
      
      // Create move object
      const moveData: Move = {
        from,
        to,
        piece: {
          type: getPieceType(piece.type),
          color: piece.color === 'w' ? 'white' : 'black'
        },
        player: playerColor,
        timestamp: Date.now(),
        promotion
      };
      
      await makeMove(gameId, moveData);
    } catch (error) {
      console.error("Error making move:", error);
      throw error;
    }
  };
  
  const resignCurrentGame = async () => {
    if (!gameId) return;
    
    try {
      await resignGame(gameId);
    } catch (error) {
      console.error("Error resigning game:", error);
      throw error;
    }
  };
  
  // Helper function: get piece at a specific square
  const getPieceAt = (square: string): Piece => {
    if (!chessBoard) return null;
    
    // Convert string to Square type
    const typedSquare = square as Square;
    
    const piece = chessBoard.get(typedSquare);
    if (!piece) return null;
    
    return {
      type: getPieceType(piece.type),
      color: piece.color === 'w' ? 'white' : 'black'
    };
  };
  
  // Helper function: convert chess.js piece type to our type
  const getPieceType = (chessPieceType: string): "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" => {
    switch (chessPieceType) {
      case 'p': return 'pawn';
      case 'r': return 'rook';
      case 'n': return 'knight';
      case 'b': return 'bishop';
      case 'q': return 'queen';
      case 'k': return 'king';
      default: return 'pawn'; // Shouldn't happen
    }
  };
  
  const isGameOver = gameData?.status === 'completed';
  const isMyTurn = playerColor !== null && gameData?.currentTurn === playerColor;
  
  return (
    <GameContext.Provider value={{
      gameId,
      gameData,
      playerColor,
      chessBoard,
      isMyTurn,
      isGameOver,
      validMoves,
      startNewGame,
      joinExistingGame,
      movePiece,
      resignCurrentGame,
      getPieceAt,
      isCheck,
      isCheckmate,
      isDraw,
      isSpectator,
      allowSpectators,
      spectateGame: spectateExistingGame,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);