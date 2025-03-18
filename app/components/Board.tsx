import { StyleSheet, View } from "react-native";
import React from "react";
import Tile from "./Tile";
import useGameContext from "../context/GameContext";

const Board = () => {
  const { state } = useGameContext();

  const renderBoard = () => {
    const board = [];
    for (let row = 0; row < 8; row++) {
      const rowSquares = [];
      for (let col = 0; col < 8; col++) {
        const isLightSquare = (row + col) % 2 === 0;
        const piece = state.board[row][col];

        rowSquares.push(
          <Tile
            key={`${row}-${col}`}
            isLight={isLightSquare}
            position={{ row, col }}
            piece={piece}
          />
        );
      }
      board.push(
        <View key={`row-${row}`} style={styles.row}>
          {rowSquares}
        </View>
      );
    }
    return board;
  };

  return <View style={styles.board}>{renderBoard()}</View>;
};

export default Board;

const styles = StyleSheet.create({
  board: {
    width: "100%",
    aspectRatio: 1, // Keeps the board square
    maxWidth: 400,
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
});
