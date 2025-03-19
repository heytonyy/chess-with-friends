import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import Piece from "./Piece";
import { useGame } from "../context/GameContext";
import { TileProps } from "../types/types";

const Tile = ({ isLight, position, piece }: TileProps) => {
  const { 
    playerColor, 
    isMyTurn, 
    validMoves, 
    movePiece,
    gameData,
    isGameOver
  } = useGame();
  const { row, col } = position;
  
  // Convert row/col coordinates to algebraic notation (e.g., "e4")
  const squareToAlgebraic = (row: number, col: number): string => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return `${files[col]}${ranks[row]}`;
  };

  const algebraicSquare = squareToAlgebraic(row, col);
  
  // Check if this square is a valid move destination
  const isValidMoveDestination = validMoves[algebraicSquare]?.length > 0;
  
  // Check if this square is a selected piece
  const isSelected = Object.keys(validMoves).includes(algebraicSquare);
  
  // Check if player can interact with this piece (their color and their turn)
  const isPlayable = isMyTurn && 
                     piece?.color === playerColor &&
                     !isGameOver;

  const handlePress = () => {
    if (isGameOver || gameData?.status !== 'active') return;
    
    if (isSelected) {
      // Deselect the piece (no-op in this implementation as we handle selection differently)
      return;
    }
    
    // If we have a source square with this square as a valid destination
    for (const [sourceSquare, destinations] of Object.entries(validMoves)) {
      if (destinations.includes(algebraicSquare)) {
        // Make the move
        movePiece(sourceSquare, algebraicSquare);
        return;
      }
    }
    
    // If this square has a piece and it's the player's turn
    if (piece && piece.color === playerColor && isMyTurn) {
      // Let Firebase handling of validMoves handle this
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
        isPlayable && styles.playable
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
  }
});