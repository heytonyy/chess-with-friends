import { StyleSheet, View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import Tile from "./Tile";
import { useGame } from "../context/GameContext";
import { Piece } from "../types/types";

const Board = () => {
  const { 
    chessBoard, 
    playerColor,
    isMyTurn,
    gameData,
    isGameOver
  } = useGame();
  
  const [boardState, setBoardState] = useState<Array<Array<Piece | null>>>([]);
  
  // Convert FEN representation to 2D board array
  useEffect(() => {
    if (!chessBoard) return;
    
    const newBoard: Array<Array<Piece | null>> = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Get all squares to iterate through
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']; // Reversed for display
    
    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const square = `${files[fileIndex]}${ranks[rankIndex]}`;
        const squareTyped = square as any; // Type casting for chess.js
        
        const piece = chessBoard.get(squareTyped);
        if (piece) {
          newBoard[rankIndex][fileIndex] = {
            type: getPieceType(piece.type),
            color: piece.color === 'w' ? 'white' : 'black'
          };
        }
      }
    }
    
    setBoardState(newBoard);
  }, [chessBoard]);
  
  // Convert chess.js piece type to our app's type
  const getPieceType = (chessPieceType: string): "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" => {
    switch (chessPieceType) {
      case 'p': return 'pawn';
      case 'r': return 'rook';
      case 'n': return 'knight';
      case 'b': return 'bishop';
      case 'q': return 'queen';
      case 'k': return 'king';
      default: return 'pawn'; // Fallback
    }
  };

  // Flip board based on player color
  const renderBoard = () => {
    if (boardState.length === 0) return null;
    
    // Determine board orientation based on player color
    const isFlipped = playerColor === 'black';
    let displayBoard = [...boardState];
    
    if (isFlipped) {
      // Flip the board for black player
      displayBoard = displayBoard.slice().reverse().map(row => row.slice().reverse());
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
      if (gameData?.winner === playerColor) {
        return <Text style={styles.statusText}>You won!</Text>;
      } else if (gameData?.winner === 'draw') {
        return <Text style={styles.statusText}>Game ended in a draw</Text>;
      } else {
        return <Text style={styles.statusText}>You lost</Text>;
      }
    } else if (isMyTurn) {
      return <Text style={styles.statusText}>Your turn</Text>;
    } else {
      return <Text style={styles.statusText}>Opponent's turn</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderStatus()}
      <View style={styles.board}>{renderBoard()}</View>
    </View>
  );
};

export default Board;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  board: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#000',
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  }
});