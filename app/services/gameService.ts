import {
  ref,
  onValue,
  set,
  push,
  get,
  update,
  Unsubscribe,
} from "firebase/database";
import { db, auth } from "../config/firebase";
import { Game, Move } from "../types/types";
import { Chess } from 'chess.js';

export const createGame = async () => {
  const userId = auth.currentUser?.uid;

  if (!userId) throw new Error("User not authenticated");

  const startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const gameRef = push(ref(db, "games"));
  await set(gameRef, {
    createdAt: Date.now(),
    status: "waiting",
    currentTurn: "white",
    whitePlayer: userId,
    blackPlayer: null,
    board: startingFEN,
    moves: [],
    winner: null,
    lastActivity: Date.now(),
  });

  return gameRef.key;
};

export const joinGame = async (gameId: string) => {
  const userId = auth.currentUser?.uid;

  if (!userId) throw new Error("User not authenticated");

  const gameRef = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);
  const game: Game = snapshot.val();

  if (!game) throw new Error("Game not found");
  if (game.status !== "waiting") throw new Error("Game already in progress");

  await update(gameRef, {
    blackPlayer: userId,
    status: "active",
  });

  return gameRef.key;
};

export const makeMove = async (gameId: string, move: Move) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const gameRef = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);
  const game = snapshot.val();

  if (!game) throw new Error("Game not found");
  if (game.status !== "active") throw new Error("Game not active");

  // Validate it's this player's turn
  const isWhite = game.whitePlayer === userId;
  const isBlack = game.blackPlayer === userId;

  if (
    (isWhite && game.currentTurn !== "white") ||
    (isBlack && game.currentTurn !== "black")
  ) {
    throw new Error("Not your turn");
  }

  // Initialize chess.js with current position
  const chess = new Chess(game.board);
  
  // Validate the move is legal
  try {
    chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion // Handle pawn promotion if present
    });
  } catch (error) {
    throw new Error("Invalid move");
  }
  
  // Get the new FEN after move
  const newFEN = chess.fen();
  
  // Add move to history
  const newMoveRef = push(ref(db, `games/${gameId}/moves`));
  await set(newMoveRef, {
    ...move,
    player: isWhite ? "white" : "black",
    timestamp: Date.now(),
  });

  // Prepare update object
  const updateData: Partial<Game> = {
    board: newFEN,
    currentTurn: game.currentTurn === "white" ? "black" : "white",
    lastActivity: Date.now()
  };

  // Check for game over
  if (chess.isGameOver()) {
    updateData.status = "completed";
    
    if (chess.isCheckmate()) {
      // Current player won since they just made the checkmate move
      updateData.winner = game.currentTurn;
    } else {
      // Game ended in draw
      updateData.winner = "draw";
    }
  }

  // Update game state
  await update(gameRef, updateData);
};

export const calculateNewFEN = (currentFEN: string, move: Move): string => {
  const chess = new Chess(currentFEN);
  try {
    chess.move({
      from: move.from, 
      to: move.to,
      promotion: move.promotion
    });
    return chess.fen();
  } catch (error) {
    throw new Error("Invalid move");
  }
};

export const isCheckmate = (fen: string): boolean => {
  const chess = new Chess(fen);
  return chess.isCheckmate();
};

export const isStalemate = (fen: string): boolean => {
  const chess = new Chess(fen);
  return chess.isStalemate();
};

export const isDraw = (fen: string): boolean => {
  const chess = new Chess(fen);
  return chess.isDraw();
};

export const getDrawReason = (fen: string): string | null => {
  const chess = new Chess(fen);
  if (chess.isStalemate()) return "stalemate";
  if (chess.isInsufficientMaterial()) return "insufficient material";
  if (chess.isThreefoldRepetition()) return "threefold repetition";
  if (chess.isDraw()) return "50-move rule";
  return null;
};

export const resignGame = async (gameId: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const gameRef = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);
  const game = snapshot.val();

  if (!game) throw new Error("Game not found");
  if (game.status !== "active") throw new Error("Game not active");

  const isWhite = game.whitePlayer === userId;
  const isBlack = game.blackPlayer === userId;

  if (!isWhite && !isBlack) throw new Error("You are not a player in this game");

  // Set the other player as winner
  await update(gameRef, {
    status: "completed",
    winner: isWhite ? "black" : "white",
    lastActivity: Date.now()
  });
};

// Subscribe to game updates
interface GameUpdateCallback {
  (gameData: Game): void;
}

export const subscribeToGame = (
  gameId: string,
  onUpdate: GameUpdateCallback
): Unsubscribe => {
  const gameRef = ref(db, `games/${gameId}`);
  return onValue(gameRef, (snapshot) => {
    const gameData: Game = snapshot.val();
    if (gameData) {
      onUpdate(gameData);
    }
  });
};