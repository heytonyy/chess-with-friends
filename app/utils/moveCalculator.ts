import { Board, Position } from "../types/types";

// Check if a position is within the board boundaries
function isValidPosition(position: Position): boolean {
  return (
    position.row >= 0 &&
    position.row < 8 &&
    position.col >= 0 &&
    position.col < 8
  );
}

// Check if a position has an enemy piece
function hasEnemyPiece(
  board: Board,
  position: Position,
  playerColor: "white" | "black"
): boolean {
  const piece = board[position.row][position.col];
  return piece !== null && piece.color !== playerColor;
}

// Check if a position is empty
function isEmpty(board: Board, position: Position): boolean {
  return board[position.row][position.col] === null;
}

// Calculate valid moves for a specific piece
export function calculateValidMoves(
  board: Board,
  position: Position,
  currentPlayer: "white" | "black"
): Position[] {
  const { row, col } = position;
  const piece = board[row][col];

  if (!piece || piece.color !== currentPlayer) {
    return [];
  }

  const validMoves: Position[] = [];

  switch (piece.type) {
    case "pawn":
      calculatePawnMoves(board, position, piece.color, validMoves);
      break;
    case "rook":
      calculateRookMoves(board, position, piece.color, validMoves);
      break;
    case "knight":
      calculateKnightMoves(board, position, piece.color, validMoves);
      break;
    case "bishop":
      calculateBishopMoves(board, position, piece.color, validMoves);
      break;
    case "queen":
      calculateRookMoves(board, position, piece.color, validMoves);
      calculateBishopMoves(board, position, piece.color, validMoves);
      break;
    case "king":
      calculateKingMoves(board, position, piece.color, validMoves);
      break;
  }

  return validMoves;
}

// Calculate pawn moves
function calculatePawnMoves(
  board: Board,
  position: Position,
  color: "white" | "black",
  validMoves: Position[]
): void {
  const { row, col } = position;
  const direction = color === "white" ? -1 : 1; // White moves up, black moves down
  const startingRow = color === "white" ? 6 : 1;

  // Move forward one square
  const oneForward = { row: row + direction, col };
  if (isValidPosition(oneForward) && isEmpty(board, oneForward)) {
    validMoves.push(oneForward);

    // Move forward two squares from starting position
    if (row === startingRow) {
      const twoForward = { row: row + 2 * direction, col };
      if (isEmpty(board, twoForward)) {
        validMoves.push(twoForward);
      }
    }
  }

  // Capture diagonally
  const capturePositions = [
    { row: row + direction, col: col - 1 },
    { row: row + direction, col: col + 1 },
  ];

  for (const capturePos of capturePositions) {
    if (
      isValidPosition(capturePos) &&
      hasEnemyPiece(board, capturePos, color)
    ) {
      validMoves.push(capturePos);
    }
  }

  // TODO: En passant logic could be added here
}

// Calculate rook moves
function calculateRookMoves(
  board: Board,
  position: Position,
  color: "white" | "black",
  validMoves: Position[]
): void {
  const directions = [
    { rowDir: -1, colDir: 0 }, // up
    { rowDir: 1, colDir: 0 }, // down
    { rowDir: 0, colDir: -1 }, // left
    { rowDir: 0, colDir: 1 }, // right
  ];

  for (const dir of directions) {
    let currentPos = {
      row: position.row + dir.rowDir,
      col: position.col + dir.colDir,
    };

    while (isValidPosition(currentPos)) {
      if (isEmpty(board, currentPos)) {
        validMoves.push({ ...currentPos });
      } else if (hasEnemyPiece(board, currentPos, color)) {
        validMoves.push({ ...currentPos });
        break;
      } else {
        break; // Blocked by friendly piece
      }

      currentPos.row += dir.rowDir;
      currentPos.col += dir.colDir;
    }
  }
}

// Calculate bishop moves
function calculateBishopMoves(
  board: Board,
  position: Position,
  color: "white" | "black",
  validMoves: Position[]
): void {
  const directions = [
    { rowDir: -1, colDir: -1 }, // up-left
    { rowDir: -1, colDir: 1 }, // up-right
    { rowDir: 1, colDir: -1 }, // down-left
    { rowDir: 1, colDir: 1 }, // down-right
  ];

  for (const dir of directions) {
    let currentPos = {
      row: position.row + dir.rowDir,
      col: position.col + dir.colDir,
    };

    while (isValidPosition(currentPos)) {
      if (isEmpty(board, currentPos)) {
        validMoves.push({ ...currentPos });
      } else if (hasEnemyPiece(board, currentPos, color)) {
        validMoves.push({ ...currentPos });
        break;
      } else {
        break; // Blocked by friendly piece
      }

      currentPos.row += dir.rowDir;
      currentPos.col += dir.colDir;
    }
  }
}

// Calculate knight moves
function calculateKnightMoves(
  board: Board,
  position: Position,
  color: "white" | "black",
  validMoves: Position[]
): void {
  const knightMoves = [
    { row: position.row - 2, col: position.col - 1 },
    { row: position.row - 2, col: position.col + 1 },
    { row: position.row - 1, col: position.col - 2 },
    { row: position.row - 1, col: position.col + 2 },
    { row: position.row + 1, col: position.col - 2 },
    { row: position.row + 1, col: position.col + 2 },
    { row: position.row + 2, col: position.col - 1 },
    { row: position.row + 2, col: position.col + 1 },
  ];

  for (const move of knightMoves) {
    if (
      isValidPosition(move) &&
      (isEmpty(board, move) || hasEnemyPiece(board, move, color))
    ) {
      validMoves.push(move);
    }
  }
}

// Calculate king moves
function calculateKingMoves(
  board: Board,
  position: Position,
  color: "white" | "black",
  validMoves: Position[]
): void {
  const directions = [
    { row: -1, col: -1 },
    { row: -1, col: 0 },
    { row: -1, col: 1 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
  ];

  for (const dir of directions) {
    const newPos = {
      row: position.row + dir.row,
      col: position.col + dir.col,
    };

    if (
      isValidPosition(newPos) &&
      (isEmpty(board, newPos) || hasEnemyPiece(board, newPos, color))
    ) {
      validMoves.push(newPos);
    }
  }

  // TODO: add Castling logic
}

// To satisfy expo-router needing a default export
export default calculateValidMoves;
