import { emptyCell } from "./chessConstants";
import { findKingPosition, isKingInCheck } from "./chessMoves";
import type { CastlingRights, ColorTurn, ValidPosition } from "./chessTypes";

// Verifica si una posición está atacada por una pieza enemiga
function isSquareAttacked(
  board: string[][],
  square: ValidPosition,
  kingColor: ColorTurn,
) {
  const simulatedBoard = board.map((column) => [...column]);

  const kingPosition = findKingPosition(simulatedBoard, kingColor);

  if (!kingPosition) return true;

  simulatedBoard[kingPosition.column][kingPosition.row] = emptyCell;
  simulatedBoard[square.column][square.row] = `${kingColor}K`;

  return isKingInCheck(simulatedBoard, kingColor);
}

// Calcula los movimientos legales del enroque
export function getCastlingMoves(
  board: string[][],
  color: ColorTurn,
  castlingRights: CastlingRights,
): ValidPosition[] {
  const moves: ValidPosition[] = [];

  const row = color === "W" ? 7 : 0;
  const kingStart: ValidPosition = { column: 4, row };

  const kingPiece = `${color}K`;
  const rookPiece = `${color}R`;

  const rights = castlingRights[color];

  if (rights.kingMoved) return moves;

  if (board[kingStart.column][kingStart.row] !== kingPiece) {
    return moves;
  }

  if (isKingInCheck(board, color)) {
    return moves;
  }

  // Enroque corto: rey va de column 4 a column 6
  const rightRookPosition: ValidPosition = { column: 7, row };

  const canCastleRight =
    !rights.rightRookMoved &&
    board[rightRookPosition.column][rightRookPosition.row] === rookPiece &&
    board[5][row] === emptyCell &&
    board[6][row] === emptyCell &&
    !isSquareAttacked(board, { column: 5, row }, color) &&
    !isSquareAttacked(board, { column: 6, row }, color);

  if (canCastleRight) {
    moves.push({ column: 6, row });
  }

  // Enroque largo: rey va de column 4 a column 2
  const leftRookPosition: ValidPosition = { column: 0, row };

  const canCastleLeft =
    !rights.leftRookMoved &&
    board[leftRookPosition.column][leftRookPosition.row] === rookPiece &&
    board[1][row] === emptyCell &&
    board[2][row] === emptyCell &&
    board[3][row] === emptyCell &&
    !isSquareAttacked(board, { column: 3, row }, color) &&
    !isSquareAttacked(board, { column: 2, row }, color);

  if (canCastleLeft) {
    moves.push({ column: 2, row });
  }

  return moves;
}

// Determina si un movimiento es enroque
export function isCastlingMove(
  piece: string,
  from: ValidPosition,
  to: ValidPosition,
) {
  return piece[1] === "K" && Math.abs(to.column - from.column) === 2;
}

// Simula el movimiento del rey al hacer enroque
export function simulateMoveWithCastling(
  board: string[][],
  from: ValidPosition,
  to: ValidPosition,
): string[][] {
  const newBoard = board.map((column) => [...column]);

  const piece = newBoard[from.column][from.row];

  newBoard[to.column][to.row] = piece;
  newBoard[from.column][from.row] = emptyCell;

  if (isCastlingMove) {
    const row = from.row;

    if (to.column === 6) {
      /// Enroque largo
      newBoard[5][row] = newBoard[7][row];
      newBoard[7][row] = emptyCell;
    } else if (to.column === 2) {
      // Enroque Corto
      newBoard[3][row] = newBoard[0][row];
      newBoard[0][row] = emptyCell;
    }
  }

  return newBoard;
}

// Actualiza los derechos al enroque ( si una de las torres o el rey se movió)
export function updateCastlingRightsAfterMove(
  castlingRights: CastlingRights,
  piece: string,
  from: ValidPosition,
): CastlingRights {
  const color = piece[0] as ColorTurn;
  const newRights = {
    W: {
      ...castlingRights.W,
    },
    B: {
      ...castlingRights.B,
    },
  };

  if (piece[1] === "K") {
    newRights[color].kingMoved = true;
  }

  if (piece[1] === "R") {
    const startRow = color === "W" ? 7 : 0;

    //La torre que se mueve es la torre de la izquierda (Enroque Largo)
    if (from.row === startRow && from.column === 0) {
      newRights[color].leftRookMoved = true;
    }

    //La torre que se mueve es la torre de la derecha (Enroque Corto)
    if (from.row === startRow && from.column === 7) {
      newRights[color].rightRookMoved = true;
    }
  }

  return newRights;
}

export function updateCastlingRightsAfterCapture(
  castlingRights: CastlingRights,
  capturedPiece: string,
  capturePosition: ValidPosition,
): CastlingRights {
  if (capturedPiece[1] !== "R") return castlingRights;

  const color = capturedPiece[0] as ColorTurn;
  const startRow = color === "W" ? 7 : 0;

  const newRights = {
    W: {
      ...castlingRights.W,
    },
    B: {
      ...castlingRights.B,
    },
  };

  // Si la torre de la izquierda es capturada
  if (capturePosition.row === startRow && capturePosition.column === 0)
    newRights[color].leftRookMoved = true;

  // Si la torre de la derecha es capturada
  if( capturePosition.row === startRow && capturePosition.column === 7)
    newRights[color].rightRookMoved = true;

  return newRights;
}
