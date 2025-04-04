import { StyleSheet, View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Tile } from "./Tile";
import { useGame } from "@/context/GameContext";
import { Board } from "@/types/types";
import { convertFENToBoardArray } from "@/utils/chessUtils";

export const GameBoard = () => {
  const {
    chessBoard,
    playerColor,
    isMyTurn,
    gameData,
    isGameOver,
    isSpectator,
    gameCode,
  } = useGame();

  const [boardState, setBoardState] = useState<Board>([]);

  // Convert FEN representation to 2D board array
  useEffect(() => {
    if (!chessBoard) return;

    const newBoard = convertFENToBoardArray(chessBoard);

    setBoardState(newBoard);
  }, [chessBoard]);

  // Flip board based on player color
  const renderBoard = () => {
    if (boardState.length === 0) return null;

    // Determine board orientation based on player color
    const isFlipped = playerColor === "black";
    let displayBoard = [...boardState];

    if (isFlipped) {
      // Flip the board for black player
      displayBoard = displayBoard
        .slice()
        .reverse()
        .map((row) => row.slice().reverse());
    }

    const board = [];
    for (let row = 0; row < 8; row++) {
      const rowSquares = [];
      for (let col = 0; col < 8; col++) {
        const isLightSquare = (row + col) % 2 === 0;
        const piece = displayBoard[row][col];

        // Convert display coordinates to real coordinates
        const realRow = isFlipped ? 7 - row : row;
        const realCol = isFlipped ? 7 - col : col;

        rowSquares.push(
          <Tile
            key={`${row}-${col}`}
            isLight={isLightSquare}
            position={{ row: realRow, col: realCol }}
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

  const renderStatus = () => {
    if (isGameOver) {
      if (isSpectator) {
        if (gameData?.winner === "draw") {
          return <Text style={styles.statusText}>Game ended in a draw</Text>;
        } else {
          return (
            <Text style={styles.statusText}>
              {gameData?.winner === "white" ? "White won!" : "Black won!"}
            </Text>
          );
        }
      } else if (gameData?.winner === playerColor) {
        return <Text style={styles.statusText}>You won!</Text>;
      } else if (gameData?.winner === "draw") {
        return <Text style={styles.statusText}>Game ended in a draw</Text>;
      } else {
        return <Text style={styles.statusText}>You lost</Text>;
      }
    } else if (isSpectator) {
      return (
        <Text style={styles.statusText}>
          {gameData?.currentTurn === "white" ? "White's turn" : "Black's turn"}
        </Text>
      );
    } else if (isMyTurn) {
      return <Text style={styles.statusText}>Your turn</Text>;
    } else {
      return <Text style={styles.statusText}>Opponent's turn</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {isSpectator && <Text style={styles.spectating}>SPECTATIING</Text>}
      {renderStatus()}
      <View style={styles.board}>{renderBoard()}</View>
      <Text style={styles.gameCode}>Game Code: {gameCode}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  board: {
    aspectRatio: 1,
    maxWidth: 400,
    width: "100%",
    borderWidth: 2,
    borderColor: "#000",
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  gameCode: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  spectating: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
});
