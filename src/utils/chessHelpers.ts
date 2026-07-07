import { emptyCell } from "./chessConstants";

const isInsideBoard = (column: number, row: number) => {
  return column >= 0 && column <= 7 && row >= 0 && row <= 7;
};

const getPieceColor = (piece: string) => {
  if (piece === emptyCell) return null;
  return piece[0]; // W o B
};

const isEnemyPiece = (piece: string, target: string) => {
  if (piece === emptyCell || target === emptyCell) return false;
  if (target == getPieceColor(target).concat("K")) return false;
  return getPieceColor(piece) !== getPieceColor(target);
};

const isSameColorPiece = (piece: string, target: string) => {
  if (piece === emptyCell || target === emptyCell) return false;
  return getPieceColor(piece) === getPieceColor(target);
};
const isMoveAvailable = (
  availableMoves: { column: number; row: number }[],
  column: number,
  row: number,
) => {
  return availableMoves.some(
    (move) => move.column === column && move.row === row,
  );
};
export {
  isInsideBoard,
  getPieceColor,
  isEnemyPiece,
  isSameColorPiece,
  isMoveAvailable,
};
