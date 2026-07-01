import {
  isInsideBoard,
  isEnemyPiece
} from "./chessHelpers";
import type { ValidPosition } from "./chessTypes";

import { emptyCell } from "./chessConstats";

// Reglas de movimiento
export function showAvailableMoves(
  piece: string,
  moveFrom: ValidPosition,
  board: string[][],
) {
  const moves: ValidPosition[] = [];

  const currentPiece = board[moveFrom.column][moveFrom.row];
  const color = currentPiece[0];

  const addMoveIfValid = (column: number, row: number) => {
    if (!isInsideBoard(column, row)) return false;

    const target = board[column][row];

    if (target === emptyCell) {
      moves.push({ column, row });
      return true;
    }

    if (isEnemyPiece(currentPiece, target)) {
      moves.push({ column, row });
    }

    return false;
  };

  const addSlidingMoves = (directions: ValidPosition[]) => {
    directions.forEach((direction) => {
      let nextColumn = moveFrom.column + direction.column;
      let nextRow = moveFrom.row + direction.row;

      while (isInsideBoard(nextColumn, nextRow)) {
        const target = board[nextColumn][nextRow];

        if (target === emptyCell) {
          moves.push({
            column: nextColumn,
            row: nextRow,
          });
        } else {
          if (isEnemyPiece(currentPiece, target)) {
            moves.push({
              column: nextColumn,
              row: nextRow,
            });
          }

          break;
        }

        nextColumn += direction.column;
        nextRow += direction.row;
      }
    });
  };

  switch (piece) {
    case "R": {
      addSlidingMoves([
        { column: 1, row: 0 },
        { column: -1, row: 0 },
        { column: 0, row: 1 },
        { column: 0, row: -1 },
      ]);
      break;
    }

    case "N": {
      const knightMoves = [
        { column: 2, row: 1 },
        { column: 2, row: -1 },
        { column: -2, row: 1 },
        { column: -2, row: -1 },
        { column: 1, row: 2 },
        { column: 1, row: -2 },
        { column: -1, row: 2 },
        { column: -1, row: -2 },
      ];

      knightMoves.forEach((move) => {
        addMoveIfValid(moveFrom.column + move.column, moveFrom.row + move.row);
      });

      break;
    }

    case "B": {
      addSlidingMoves([
        { column: 1, row: 1 },
        { column: 1, row: -1 },
        { column: -1, row: 1 },
        { column: -1, row: -1 },
      ]);
      break;
    }

    case "Q": {
      addSlidingMoves([
        { column: 1, row: 0 },
        { column: -1, row: 0 },
        { column: 0, row: 1 },
        { column: 0, row: -1 },
        { column: 1, row: 1 },
        { column: 1, row: -1 },
        { column: -1, row: 1 },
        { column: -1, row: -1 },
      ]);
      break;
    }

    case "K": {
      const kingMoves = [
        { column: 1, row: 0 },
        { column: -1, row: 0 },
        { column: 0, row: 1 },
        { column: 0, row: -1 },
        { column: 1, row: 1 },
        { column: 1, row: -1 },
        { column: -1, row: 1 },
        { column: -1, row: -1 },
      ];

      kingMoves.forEach((move) => {
        addMoveIfValid(moveFrom.column + move.column, moveFrom.row + move.row);
      });

      break;
    }

    case "P": {
      const direction = color === "W" ? -1 : 1;
      const startRow = color === "W" ? 6 : 1;

      const oneStepRow = moveFrom.row + direction;

      // Movimiento normal hacia adelante
      if (
        isInsideBoard(moveFrom.column, oneStepRow) &&
        board[moveFrom.column][oneStepRow] === emptyCell
      ) {
        moves.push({
          column: moveFrom.column,
          row: oneStepRow,
        });

        const twoStepRow = moveFrom.row + direction * 2;

        // Movimiento doble solo desde la fila inicial
        if (
          moveFrom.row === startRow &&
          isInsideBoard(moveFrom.column, twoStepRow) &&
          board[moveFrom.column][twoStepRow] === emptyCell
        ) {
          moves.push({
            column: moveFrom.column,
            row: twoStepRow,
          });
        }
      }

      // Captura diagonal izquierda
      const leftCaptureColumn = moveFrom.column - 1;
      const leftCaptureRow = moveFrom.row + direction;

      if (isInsideBoard(leftCaptureColumn, leftCaptureRow)) {
        const target = board[leftCaptureColumn][leftCaptureRow];

        if (isEnemyPiece(currentPiece, target)) {
          moves.push({
            column: leftCaptureColumn,
            row: leftCaptureRow,
          });
        }
      }

      // Captura diagonal derecha
      const rightCaptureColumn = moveFrom.column + 1;
      const rightCaptureRow = moveFrom.row + direction;

      if (isInsideBoard(rightCaptureColumn, rightCaptureRow)) {
        const target = board[rightCaptureColumn][rightCaptureRow];

        if (isEnemyPiece(currentPiece, target)) {
          moves.push({
            column: rightCaptureColumn,
            row: rightCaptureRow,
          });
        }
      }

      break;
    }

    default:
      break;
  }

  return moves;
}