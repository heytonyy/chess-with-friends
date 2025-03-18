import React, { createContext, useContext, useReducer } from "react";
import { initialBoardState } from "../utils/boardSetup";
import { Board } from "../types/types";
import { calculateValidMoves } from "../utils/moveCalculator";

type GameState = {
  board: Board;
  selectedPiece: { row: number; col: number } | null;
  validMoves: { row: number; col: number }[];
  currentPlayer: "white" | "black";
};

const initialGameState: GameState = {
  board: initialBoardState,
  selectedPiece: null,
  validMoves: [],
  currentPlayer: "white",
};

type GameAction =
  | {
      type: "SELECT_PIECE";
      payload: {
        position: {
          row: number;
          col: number;
        } | null;
      };
    }
  | {
      type: "MOVE_PIECE";
      payload: {
        from: {
          row: number;
          col: number;
        };
        to: {
          row: number;
          col: number;
        };
      };
    };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_PIECE":
      if (action.payload.position != null) {
        const position = action.payload.position;
        const piece = state.board[position.row][position.col];

        // Only allow selecting pieces of current player's color
        if (piece && piece.color === state.currentPlayer) {
          // Calculate valid moves for the selected piece
          const validMoves = calculateValidMoves(
            state.board,
            position,
            state.currentPlayer
          );

          return {
            ...state,
            selectedPiece: position,
            validMoves,
          };
        }
        return state; // Don't change state if not selecting own piece
      } else {
        return {
          ...state,
          selectedPiece: null,
          validMoves: [],
        };
      }

    case "MOVE_PIECE":
      const { from, to } = action.payload;

      // Check if move is valid
      const isValidMove = state.validMoves.some(
        (move) => move.row === to.row && move.col === to.col
      );

      if (!isValidMove) {
        return state;
      }

      const newBoard = [...state.board.map((row) => [...row])]; // Deep copy

      // Move the piece
      newBoard[to.row][to.col] = newBoard[from.row][from.col];
      newBoard[from.row][from.col] = null;

      // Toggle player
      const nextPlayer: "white" | "black" =
        state.currentPlayer === "white" ? "black" : "white";

      return {
        ...state,
        board: newBoard,
        selectedPiece: null,
        validMoves: [],
        currentPlayer: nextPlayer,
      };

    default:
      return state;
  }
}

const GameContext = createContext<
  | {
      state: typeof initialGameState;
      dispatch: React.Dispatch<GameAction>;
    }
  | undefined
>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // TypeScript: be explicit with useReducer types
  const [state, dispatch] = useReducer<React.Reducer<GameState, GameAction>>(
    gameReducer,
    initialGameState
  );

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export default function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
