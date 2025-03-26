// Convert row/col coordinates to algebraic notation (e.g., "e4")
export const squareToAlgebraic = (row: number, col: number): string => {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  return `${files[col]}${ranks[row]}`;
};

export default squareToAlgebraic;