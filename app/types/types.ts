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
  
  export type { Piece, Board, Position, TileProps, PieceProp };
  
  // To satisfy expo-router needing a default export
  export default function nullComponent() {
    return null;
  }
  