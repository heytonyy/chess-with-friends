import React, { createContext, useState, useEffect, useContext } from "react";
import {
  subscribeToGame,
  makeMove,
  createGame,
  resignGame,
  joinGameByCode,
  spectateGameByCode,
} from "@/services/gameService";
import { auth } from "@/config/firebase";
import { Game, Move, Piece } from "@/types/types";
import { ReactNode } from "react";
import { Chess, Square } from "chess.js";

interface GameContextType {
  gameId: string | null;
  gameCode: string | null;
  gameData: Game | null;
  playerColor: "white" | "black" | null;
  chessBoard: Chess | null;
  isMyTurn: boolean;
  isGameOver: boolean;
  validMoves: Record<string, string[]>; // From square -> array of valid destinations
  startNewGame: (allowSpectating: boolean) => Promise<string>;
  joinExistingGame: (gameCode: string) => Promise<void>;
  movePiece: (
    from: string,
    to: string,
    promotion?: "q" | "r" | "b" | "n"
  ) => Promise<void>;
  resignCurrentGame: () => Promise<void>;
  getPieceAt: (square: string) => Piece;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isSpectator: boolean;
  allowSpectators: boolean;
  spectateGame: (gameCode: string) => Promise<void>;
  selectedSquare: string | null;
  selectSquare: (square: string | null) => void;
}

const GameContext = createContext<GameContextType>({
  gameId: null,
  gameCode: null,
  gameData: null,
  playerColor: null,
  chessBoard: null,
  isMyTurn: false,
  isGameOver: false,
  validMoves: {},
  startNewGame: async () => "",
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
  selectedSquare: null,
  selectSquare: () => {},
});

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(
    null
  );
  const [chessBoard, setChessBoard] = useState<Chess | null>(null);
  const [validMoves, setValidMoves] = useState<Record<string, string[]>>({});
  const [isCheck, setIsCheck] = useState(false);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [allowSpectators, setAllowSpectators] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // Subscribe to game updates when gameId changes
  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, (data) => {
      setGameData(data);
      setGameCode(data.gameCode); // Set gameCode from the game data

      // Update local chess.js instance based on FEN
      if (data.board) {
        try {
          const chess = new Chess(data.board);
          setChessBoard(chess);

          // Calculate valid moves for all pieces
          const moves: Record<string, string[]> = {};

          // Get all squares with pieces on them
          const squares = getAllSquares();

          squares.forEach((square) => {
            // Convert string to Square type
            const typedSquare = square as Square;
            const piece = chess.get(typedSquare);

            if (
              piece &&
              piece.color === (playerColor === "white" ? "w" : "b")
            ) {
              const destinations = chess
                .moves({
                  square: typedSquare,
                  verbose: true,
                })
                .map((move) => move.to);

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

  useEffect(() => {
    if (!gameData || !auth.currentUser) return;

    const userId = auth.currentUser.uid;
    if (gameData.whitePlayer === userId) {
      setPlayerColor("white");
      setIsSpectator(false);
    } else if (gameData.blackPlayer === userId) {
      setPlayerColor("black");
      setIsSpectator(false);
    } else {
      setPlayerColor(null); // Spectator
      setIsSpectator(true);
    }

    setAllowSpectators(gameData.allowSpectators || false);
  }, [gameData]);

  const startNewGame = async (allowSpectating: boolean): Promise<string> => {
    try {
      const id = await createGame(allowSpectating);
      if (!id) throw new Error("Failed to create game: No game ID returned");
      setGameId(id);
      setPlayerColor("white");
      return id;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  };

  const joinExistingGame = async (gameCode: string) => {
    try {
      const gameId = await joinGameByCode(gameCode);
      if (!gameId) throw new Error("Failed to join game: No game ID returned");
      setGameId(gameId);
    } catch (error) {
      console.error("Error joining game:", error);
      throw error;
    }
  };

  const spectateExistingGame = async (gameCode: string) => {
    try {
      const gameId = await spectateGameByCode(gameCode);
      setGameId(gameId);
      setIsSpectator(true);
      setPlayerColor(null); // Spectators don't have a color
    } catch (error) {
      console.error("Error spectating game:", error);
      throw error;
    }
  };

  const movePiece = async (
    from: string,
    to: string,
    promotion?: "q" | "r" | "b" | "n"
  ) => {
    if (!gameId || !chessBoard || !playerColor) return;

    try {
      // Convert string to Square type
      const fromSquare = from as Square;

      // Get piece information
      const piece = chessBoard.get(fromSquare);
      if (!piece) throw new Error("No piece at this position");

      // Create move object - only include promotion if it has a value
      const moveData: Move = {
        from,
        to,
        piece: {
          type: getPieceType(piece.type),
          color: piece.color === "w" ? "white" : "black",
        },
        player: playerColor,
        timestamp: Date.now(),
      };

      // Only add promotion if it has a value
      if (promotion) {
        moveData.promotion = promotion;
      }

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
      color: piece.color === "w" ? "white" : "black",
    };
  };

  // Helper function: convert chess.js piece type to Piece type
  const getPieceType = (
    chessPieceType: string
  ): "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" => {
    switch (chessPieceType) {
      case "p":
        return "pawn";
      case "r":
        return "rook";
      case "n":
        return "knight";
      case "b":
        return "bishop";
      case "q":
        return "queen";
      case "k":
        return "king";
      default:
        return "pawn"; // Shouldn't happen
    }
  };

  // Helper function: to get all squares on the board
  const getAllSquares = (): string[] => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const squares: string[] = [];

    for (const file of files) {
      for (const rank of ranks) {
        squares.push(file + rank);
      }
    }

    return squares;
  };

  const isGameOver = gameData?.status === "completed";
  const isMyTurn =
    !isSpectator &&
    playerColor !== null &&
    gameData?.currentTurn === playerColor;

  const selectSquare = (square: string | null) => {
    setSelectedSquare(square);
  };

  return (
    <GameContext.Provider
      value={{
        gameId,
        gameCode,
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
        selectedSquare,
        selectSquare,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
