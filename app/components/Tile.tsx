import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import Piece from "./Piece";
import useGameContext from "../context/GameContext";
import { TileProps } from "../types/types";

const Tile = ({ isLight, position, piece }: TileProps) => {
  const { state, dispatch } = useGameContext();
  const { row, col } = position;

  // check if this tile is the selected piece
  const isSelected =
    state.selectedPiece?.row === row && state.selectedPiece?.col === col;

  // check if this is a tile for a valid move
  const isValidMove = state.validMoves.some(
    (move) => move.row === row && move.col === col
  );

  const handlePress = () => {
    // logic if this tile is selected
    if (state.selectedPiece) {
      // deselect the tile if it is already selected
      if (isSelected) {
        dispatch({
          type: "SELECT_PIECE",
          payload: { position: null },
        });
      }
      // move the piece if this tile is a valid move
      else if (isValidMove) {
        dispatch({
          type: "MOVE_PIECE",
          payload: {
            from: state.selectedPiece,
            to: { row, col },
          },
        });
      }
      // select new piece if new tile same color as current player
      else if (piece && piece.color === state.currentPlayer) {
        dispatch({
          type: "SELECT_PIECE",
          payload: { position: { row, col } },
        });
      }
      // deselect if clicked on a different piece
      else {
        dispatch({
          type: "SELECT_PIECE",
          payload: { position: null },
        });
      }
    }
    // no piece is selected and this tile had same color as current player
    else if (piece && piece.color === state.currentPlayer) {
      dispatch({
        type: "SELECT_PIECE",
        payload: { position: { row, col } },
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.tile,
        isLight ? styles.lightSquare : styles.darkSquare,
        isSelected && styles.selected,
        isValidMove && styles.validMove,
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
});
