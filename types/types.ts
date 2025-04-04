import { serverTimestamp } from "firebase/firestore";

// Firebase types
export interface Game {
  createdAt: number;
  status: "waiting" | "active" | "completed";
  currentTurn: "white" | "black";
  whitePlayer: string; // uid
  blackPlayer: string | null; // uid
  board: string; // FEN string
  moves: Move[];
  winner: "white" | "black" | "draw" | null;
  lastActivity: number;
  allowSpectators: boolean;
  spectators?: string[];
  gameCode: string; // Unique code for joining/spectating games
};

export interface Move {
  from: string;
  to: string;
  piece: Piece;
  player: "white" | "black";
  timestamp: number;
  promotion?: "q" | "r" | "b" | "n";
};

// Chess types
export type Piece = {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  color: "white" | "black";
} | null;

export type Board = Piece[][];

export type Position = { row: number; col: number };

// Board compoenent interfaces
export interface TileProps {
  isLight: boolean;
  position: {
    row: number;
    col: number;
  };
  piece: Piece | null;
}

export interface PieceProp {
  type: string;
  color: string;
}

// Auth component interfaces
export interface AlertConfig {
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress?: () => void;
  }>;
}

export interface UserData {
  username: string;
  email: string | null;
  createdAt: ReturnType<typeof serverTimestamp>;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  eloRating: number;
}