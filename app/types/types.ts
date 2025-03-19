// Type for a chess piece
type Piece = {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  color: "white" | "black";
} | null;

// Board type
type Board = Piece[][];

// Position type
type Position = { row: number; col: number };

// For Tile.tsx
interface TileProps {
  isLight: boolean;
  position: {
    row: number;
    col: number;
  };
  piece: Piece | null;
}

// For Piece.tsx
interface PieceProp {
  type: string;
  color: string;
}

// Firebase types
type Game = {
  createdAt: number;
  status: "waiting" | "active" | "completed";
  currentTurn: "white" | "black";
  whitePlayer: string; // use uid
  blackPlayer: string | null; // use uid
  board: string; // FEN string
  moves: Move[];
  winner: "white" | "black" | "draw" | null;
  lastActivity: number;
};

type Move = {
  from: string;
  to: string;
  piece: Piece;
  player: "white" | "black";
  timestamp: number;
  promotion?: 'q' | 'r' | 'b' | 'n';
};

export type { Piece, Board, Position, TileProps, PieceProp, Game, Move };

// To satisfy expo-router needing a default export
export default function nullComponent() {
  return null;
}