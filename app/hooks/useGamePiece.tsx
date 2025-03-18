import { ImageSourcePropType } from "react-native";
import { Piece } from "../types/types";

export default function useGamePiece(piece: Piece): ImageSourcePropType {
  // If the piece is null, return white pawn as default
  if (!piece) {
    return require("@/assets/pieces/white-pawn.png");
  }

  // Define types for our pieceImages object
  const pieceImages: Record<string, ImageSourcePropType> = {
    "white-pawn": require("@/assets/pieces/white-pawn.png"),
    "white-rook": require("@/assets/pieces/white-rook.png"),
    "white-knight": require("@/assets/pieces/white-knight.png"),
    "white-bishop": require("@/assets/pieces/white-bishop.png"),
    "white-queen": require("@/assets/pieces/white-queen.png"),
    "white-king": require("@/assets/pieces/white-king.png"),
    "black-pawn": require("@/assets/pieces/black-pawn.png"),
    "black-rook": require("@/assets/pieces/black-rook.png"),
    "black-knight": require("@/assets/pieces/black-knight.png"),
    "black-bishop": require("@/assets/pieces/black-bishop.png"),
    "black-queen": require("@/assets/pieces/black-queen.png"),
    "black-king": require("@/assets/pieces/black-king.png"),
  };

  const { type, color } = piece;

  const key = `${color}-${type}`;

  if (key in pieceImages) {
    return pieceImages[key];
  }

  console.warn(`Image not found for piece: ${key}`);
  return require("@/assets/pieces/white-pawn.png"); // Default fallback
}
