import { emptyCell } from "./chessConstants";

/** Comprueba que unas coordenadas de columna/fila caen dentro del tablero de 8x8. */
const isInsideBoard = (column: number, row: number) => {
  return column >= 0 && column <= 7 && row >= 0 && row <= 7;
};

/** Devuelve el color ("W"/"B") de una pieza, o null si la casilla está vacía. */
const getPieceColor = (piece: string) => {
  if (piece === emptyCell) return null;
  return piece[0];
};

/** true si `target` es una pieza rival capturable por `piece` (nunca el rey). */
const isEnemyPiece = (piece: string, target: string) => {
  if (piece === emptyCell || target === emptyCell) return false;
  if (target == getPieceColor(target)?.concat("K")) return false;
  return getPieceColor(piece) !== getPieceColor(target);
};

/** true si ambas casillas contienen piezas del mismo color. */
const isSameColorPiece = (piece: string, target: string) => {
  if (piece === emptyCell || target === emptyCell) return false;
  return getPieceColor(piece) === getPieceColor(target);
};

/** true si `column`/`row` está entre los movimientos disponibles calculados. */
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
