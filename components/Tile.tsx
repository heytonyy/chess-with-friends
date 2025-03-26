import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import Piece from "./Piece";
import { useGame } from "../context/GameContext";
import { TileProps } from "../types/types";
import { squareToAlgebraic } from "../utils/chessUtils";

const Tile = ({ isLight, position, piece }: TileProps) => {
  const {
    playerColor,
    isMyTurn,
    validMoves,
    movePiece,
    gameData,
    isGameOver,
    selectedSquare,
    selectSquare,
  } = useGame();
  const { row, col } = position;

  const algebraicSquare = squareToAlgebraic(row, col);

  // Check if this square is the currently selected square
  const isSelected = selectedSquare === algebraicSquare;

  // Only show valid moves for the selected piece
  const isValidMoveDestination =
    selectedSquare && validMoves[selectedSquare]?.includes(algebraicSquare);

  // Check if this piece can be selected (player's piece and their turn)
  const isSelectablePiece =
    isMyTurn && 
    piece?.color === playerColor && 
    !isGameOver && 
    validMoves[algebraicSquare]?.length > 0;

  const handlePress = () => {
    if (isGameOver || gameData?.status !== "active") return;

    // If this is a valid destination for the selected piece, make the move
    if (
      selectedSquare &&
      validMoves[selectedSquare]?.includes(algebraicSquare)
    ) {
      movePiece(selectedSquare, algebraicSquare);
      selectSquare(null); // Clear selection after move
      return;
    }

    // If clicking on own piece that has valid moves
    if (piece && piece.color === playerColor && isMyTurn) {
      if (validMoves[algebraicSquare]?.length > 0) {
        // If already selected, deselect it
        if (isSelected) {
          selectSquare(null);
        } else {
          // Otherwise, select this piece
          selectSquare(algebraicSquare);
        }
      }
    } else {
      // Clicking on empty square or opponent's piece clears selection
      selectSquare(null);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.tile,
        isLight ? styles.lightSquare : styles.darkSquare,
        isSelected && styles.selected,
        isValidMoveDestination && styles.validMove,
        isSelectablePiece && styles.playable,
      ]}
    >
      {piece && <Piece {...piece} />}
    </TouchableOpacity>
  );
};

export default Tile;

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
  },
  lightSquare: {
    backgroundColor: "#f0d9b5", // Light square color
  },
  darkSquare: {
    backgroundColor: "#b58863", // Dark square color
  },
  selected: {
    backgroundColor: "#646f40", // Highlight selected piece
  },
  validMove: {
    backgroundColor: "#839669", // Highlight valid move destinations
  },
  playable: {
    // Optional: subtle indication that piece can be moved
    opacity: 1,
  },
});