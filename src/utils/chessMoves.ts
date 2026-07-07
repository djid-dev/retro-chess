import { isInsideBoard, isEnemyPiece } from "./chessHelpers";
import type { ValidPosition } from "./chessTypes";

import { emptyCell } from "./chessConstants";


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

export function simulateMove( board: string[][], from: ValidPosition, to: ValidPosition){
  const newBoard = board.map((row) => [...row]);

  newBoard[to.column][to.row] = newBoard[from.column][from.row];
  newBoard[from.column][from.row] = emptyCell;

  return newBoard;
}

export function getLegalMoves(
  pieceType: string,
  moveFrom: ValidPosition,
  board: string[][]
): ValidPosition[] {
  const currentPiece = board[moveFrom.column][moveFrom.row];

  if (!currentPiece || currentPiece === emptyCell) {
    return [];
  }

  const color = currentPiece[0] as "W" | "B";

  const availableMoves = showAvailableMoves(pieceType, moveFrom, board);

  const legalMoves = availableMoves.filter((move) => {
    const simulatedBoard = simulateMove(board, moveFrom, move);

    const kingStillInCheck = isKingInCheck(simulatedBoard, color);

    return !kingStillInCheck;
  });

  return legalMoves;
}

// Busca la posicion de los reyes y la guarda en los estados globales
export function findKingPosition(board: string[][], color: "W" | "B") {

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece === emptyCell) continue;
      if (piece[1] === "K" && piece[0] === color) {
        return { column: row, row: col };
      }
    }
  }
}

export function getAttackedSquares(
  pieceType: string,
  moveFrom: ValidPosition,
  board: string[][],
): ValidPosition[] {
  const attackedSquares: ValidPosition[] = [];

  const currentPiece = board[moveFrom.column][moveFrom.row];

  if (currentPiece === emptyCell) {
    return attackedSquares;
  }

  const color = currentPiece[0]; // Obtiene el color de la pieza

  // Agrega una posicion si esta dentro del tablero
  const addAttackIfInsideBoard = (column: number, row: number) => {
    if (!isInsideBoard(column, row)) return;

    attackedSquares.push({ column, row });
  };

  //
  const addSlidingAttacks = (directions: ValidPosition[]) => {
    directions.forEach((direction) => {
      let nextColumn = moveFrom.column + direction.column;
      let nextRow = moveFrom.row + direction.row;

      while (isInsideBoard(nextColumn, nextRow)) {
        attackedSquares.push({
          column: nextColumn,
          row: nextRow,
        });

        const target = board[nextColumn][nextRow];

        if (target !== emptyCell) {
          break;
        }

        nextColumn += direction.column;
        nextRow += direction.row;
      }
    });
  };

  switch (pieceType) {
    case "R": {
      addSlidingAttacks([
        { column: 1, row: 0 },
        { column: -1, row: 0 },
        { column: 0, row: 1 },
        { column: 0, row: -1 },
      ]);
      break;
    }

    case "B": {
      addSlidingAttacks([
        { column: 1, row: 1 },
        { column: 1, row: -1 },
        { column: -1, row: 1 },
        { column: -1, row: -1 },
      ]);
      break;
    }

    case "Q": {
      addSlidingAttacks([
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

    case "N": {
      const knightAttacks = [
        { column: 2, row: 1 },
        { column: 2, row: -1 },
        { column: -2, row: 1 },
        { column: -2, row: -1 },
        { column: 1, row: 2 },
        { column: 1, row: -2 },
        { column: -1, row: 2 },
        { column: -1, row: -2 },
      ];

      knightAttacks.forEach((move) => {
        addAttackIfInsideBoard(
          moveFrom.column + move.column,
          moveFrom.row + move.row,
        );
      });

      break;
    }

    case "K": {
      const kingAttacks = [
        { column: 1, row: 0 },
        { column: -1, row: 0 },
        { column: 0, row: 1 },
        { column: 0, row: -1 },
        { column: 1, row: 1 },
        { column: 1, row: -1 },
        { column: -1, row: 1 },
        { column: -1, row: -1 },
      ];

      kingAttacks.forEach((move) => {
        addAttackIfInsideBoard(
          moveFrom.column + move.column,
          moveFrom.row + move.row,
        );
      });

      break;
    }

    case "P": {
      const direction = color === "W" ? -1 : 1;

      addAttackIfInsideBoard(moveFrom.column - 1, moveFrom.row + direction);
      addAttackIfInsideBoard(moveFrom.column + 1, moveFrom.row + direction);

      break;
    }

    default:
      break;
  }

  return attackedSquares;
}

export function isKingInCheck(
  board: string[][],
  kingColor: "W" | "B",
): boolean {
  const kingPosition = findKingPosition(board, kingColor);

  if (!kingPosition) {
    return false;
  }

  const enemyColor = kingColor === "W" ? "B" : "W";

  for (let column = 0; column < 8; column++) {
    for (let row = 0; row < 8; row++) {
      const piece = board[column][row];

      if (piece === emptyCell) continue;
      if (!piece.startsWith(enemyColor)) continue;

      const pieceType = piece[1];

      const attackedSquares = getAttackedSquares(
        pieceType,
        { column, row },
        board,
      );

      const kingIsAttacked = attackedSquares.some(
        (square) =>
          square.column === kingPosition.column &&
          square.row === kingPosition.row,
      );

      if (kingIsAttacked) {
        return true;
      }
    }
  }

  return false;
}
