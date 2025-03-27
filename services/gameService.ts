import {
  ref,
  onValue,
  set,
  push,
  get,
  update,
  Unsubscribe,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { db, auth } from "@/config/firebase";
import { Game, Move } from "@/types/types";
import { Chess } from "chess.js";

// Generate a random game code (6 characters, alphanumeric)
const generateGameCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if a game code is already in use
const isGameCodeUnique = async (code: string): Promise<boolean> => {
  try {
    const gamesRef = ref(db, "games");
    const gamesQuery = query(gamesRef, orderByChild("gameCode"), equalTo(code));
    const snapshot = await get(gamesQuery);
    return !snapshot.exists();
  } catch (error) {
    console.error("Error checking game code uniqueness:", error);
    return false; // If there's an error, assume the code is not unique
  }
};

// Generate a unique game code
const generateUniqueGameCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateGameCode();
    isUnique = await isGameCodeUnique(code);
    attempts++;
  }

  if (!isUnique) {
    throw new Error(
      "Failed to generate unique game code after multiple attempts"
    );
  }

  return code!;
};

// Look up a game by its code
export const getGameByCode = async (code: string): Promise<Game | null> => {
  const gamesRef = ref(db, "games");
  const gamesQuery = query(gamesRef, orderByChild("gameCode"), equalTo(code));
  const snapshot = await get(gamesQuery);

  if (!snapshot.exists()) {
    return null;
  }

  // Get the first (and should be only) game with this code
  const gameData = Object.values(snapshot.val())[0] as Game;
  return gameData;
};

export const createGame = async (allowSpectators: boolean) => {
  const userId = auth.currentUser?.uid;

  if (!userId) throw new Error("User not authenticated");

  const startingFEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  // Generate a unique game code
  const gameCode = await generateUniqueGameCode();

  // Create the game with a push
  const gameRef = push(ref(db, "games"));

  // Create the game data
  const gameData = {
    createdAt: Date.now(),
    status: "waiting",
    currentTurn: "white",
    whitePlayer: userId,
    blackPlayer: null,
    board: startingFEN,
    moves: [],
    winner: null,
    lastActivity: Date.now(),
    allowSpectators: allowSpectators,
    spectators: [],
    gameCode: gameCode,
  };

  // Set the game data
  await set(gameRef, gameData);

  return gameRef.key;
};

export const spectateGame = async (gameId: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const gameRef = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);
  const game: Game = snapshot.val();

  if (!game) throw new Error("Game not found");

  // Check if spectating is allowed
  if (!game.allowSpectators)
    throw new Error("This game does not allow spectators");

  // Check if user is already a player
  if (game.whitePlayer === userId || game.blackPlayer === userId) {
    return; // No need to add as spectator if already a player
  }

  // Add user to spectators list if not already there
  const spectators = game.spectators || [];
  if (!spectators.includes(userId)) {
    spectators.push(userId);
    await update(gameRef, { spectators });
  }
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

export const joinGameByCode = async (gameCode: string) => {
  const game = await getGameByCode(gameCode);
  if (!game) throw new Error("Game not found");

  // Get the game ID from the game object
  const gamesRef = ref(db, "games");
  const gamesQuery = query(
    gamesRef,
    orderByChild("gameCode"),
    equalTo(gameCode)
  );
  const snapshot = await get(gamesQuery);
  const gameId = Object.keys(snapshot.val())[0];

  return joinGame(gameId);
};

export const spectateGameByCode = async (gameCode: string) => {
  const game = await getGameByCode(gameCode);
  if (!game) throw new Error("Game not found");

  // Get the game ID from the game object
  const gamesRef = ref(db, "games");
  const gamesQuery = query(
    gamesRef,
    orderByChild("gameCode"),
    equalTo(gameCode)
  );
  const snapshot = await get(gamesQuery);
  const gameId = Object.keys(snapshot.val())[0];

  await spectateGame(gameId);
  return gameId;
};

export const makeMove = async (gameId: string, move: Move) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  console.log("Making move:", move);

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
    const moveOptions: any = {
      from: move.from,
      to: move.to,
    };

    // Only include promotion if it exists
    if (move.promotion) {
      moveOptions.promotion = move.promotion;
    }

    chess.move(moveOptions);
  } catch (error) {
    throw new Error("Invalid move");
  }

  // Get the new FEN after move
  const newFEN = chess.fen();

  // Add move to history - create a clean object without undefined values
  const moveToStore: Partial<Move> = {
    from: move.from,
    to: move.to,
    piece: move.piece,
    player: isWhite ? "white" : "black",
    timestamp: Date.now(),
  };

  // Only add promotion if it exists
  if (move.promotion) {
    moveToStore.promotion = move.promotion;
  }

  const newMoveRef = push(ref(db, `games/${gameId}/moves`));
  await set(newMoveRef, moveToStore);

  // Prepare update object
  const updateData: Partial<Game> = {
    board: newFEN,
    currentTurn: game.currentTurn === "white" ? "black" : "white",
    lastActivity: Date.now(),
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
      promotion: move.promotion,
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

  if (!isWhite && !isBlack)
    throw new Error("You are not a player in this game");

  // Set the other player as winner
  await update(gameRef, {
    status: "completed",
    winner: isWhite ? "black" : "white",
    lastActivity: Date.now(),
  });
};

interface GameUpdateCallback {
  (gameData: Game): void;
}

// Subscribe to game updates
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
