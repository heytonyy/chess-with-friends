import { Board } from "@/types/types";
import { Chess } from "chess.js";

// Convert row/col coordinates to algebraic notation (e.g., "e4")
export const squareToAlgebraic = (row: number, col: number): string => {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  return `${files[col]}${ranks[row]}`;
};

// Convert chess.js piece type to our app's type
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
      return "pawn"; // Fallback
  }
};

export const convertFENToBoardArray = (chessBoard: Chess): Board => {
  const newBoard: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
    for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
      const square = squareToAlgebraic(rankIndex, fileIndex);
      const squareTyped = square as any; // Type casting for chess.js

      const piece = chessBoard.get(squareTyped);
      if (piece) {
        newBoard[rankIndex][fileIndex] = {
          type: getPieceType(piece.type),
          color: piece.color === "w" ? "white" : "black",
        };
      }
    }
  }

  return newBoard;
};
