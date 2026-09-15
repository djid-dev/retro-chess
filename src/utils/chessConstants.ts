// Casilla vacía del tablero
const emptyCell = "●";

// Tablero inicial: cada sub-array es una columna (file a-h), de la fila 0 (negras) a la 7 (blancas)
const initialBoard = [
  ["BR", "BP", emptyCell, emptyCell, emptyCell, emptyCell, "WP", "WR"],
  ["BN", "BP", emptyCell, emptyCell, emptyCell, emptyCell, "WP", "WN"],
  ["BB", "BP", emptyCell, emptyCell, emptyCell, emptyCell, "WP", "WB"],
  ["BQ", "BP", emptyCell, emptyCell, emptyCell, emptyCell, "WP", "WQ"],
  ["BK", "BP", emptyCell, emptyCell, emptyCell, emptyCell, "WP", "WK"],
  ["BB", "BP", emptyCell, emptyCell, emptyCell, emptyCell, "WP", "WB"],
  ["BN", "BP", emptyCell, emptyCell, emptyCell, emptyCell, "WP", "WN"],
  ["BR", "BP", emptyCell, emptyCell, emptyCell, emptyCell, "WP", "WR"],
];

const rowLabels = ['a','b','c','d','e','f','g','h'];

// Direcciones de desplazamiento reutilizadas por las piezas "deslizantes" (torre, alfil, dama)
// y offsets fijos para las piezas de salto (caballo, rey). Definidas una sola vez para que
// ShowAvailableMoves y getAttackedSquares (chessMoves.ts) no dupliquen las mismas listas.
const ROOK_DIRECTIONS = [
  { column: 1, row: 0 },
  { column: -1, row: 0 },
  { column: 0, row: 1 },
  { column: 0, row: -1 },
];

const BISHOP_DIRECTIONS = [
  { column: 1, row: 1 },
  { column: 1, row: -1 },
  { column: -1, row: 1 },
  { column: -1, row: -1 },
];

const QUEEN_DIRECTIONS = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];

const KNIGHT_OFFSETS = [
  { column: 2, row: 1 },
  { column: 2, row: -1 },
  { column: -2, row: 1 },
  { column: -2, row: -1 },
  { column: 1, row: 2 },
  { column: 1, row: -2 },
  { column: -1, row: 2 },
  { column: -1, row: -2 },
];

// El rey se mueve como la dama, pero una sola casilla
const KING_OFFSETS = QUEEN_DIRECTIONS;

export {
  initialBoard,
  emptyCell,
  rowLabels,
  ROOK_DIRECTIONS,
  BISHOP_DIRECTIONS,
  QUEEN_DIRECTIONS,
  KNIGHT_OFFSETS,
  KING_OFFSETS,
};