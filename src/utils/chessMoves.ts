import { isInsideBoard, isEnemyPiece } from "./chessHelpers";
import type { CastlingRights, ValidPosition } from "./chessTypes";

import {
  emptyCell,
  ROOK_DIRECTIONS,
  BISHOP_DIRECTIONS,
  QUEEN_DIRECTIONS,
  KNIGHT_OFFSETS,
  KING_OFFSETS,
} from "./chessConstants";

import { getCastlingMoves } from "./chessCastling";

/**
 * Recorre un conjunto de direcciones hasta salirse del tablero o chocar con
 * una pieza, invocando `onSquare` por cada casilla encontrada en el camino.
 * Es la base compartida de las piezas deslizantes (torre, alfil, dama) tanto
 * para calcular movimientos como para calcular casillas atacadas.
 */
function walkDirections(
  from: ValidPosition,
  directions: ValidPosition[],
  board: string[][],
  onSquare: (square: ValidPosition, target: string) => "stop" | "continue",
) {
  directions.forEach((direction) => {
    let column = from.column + direction.column;
    let row = from.row + direction.row;

    while (isInsideBoard(column, row)) {
      const target = board[column][row];

      if (onSquare({ column, row }, target) === "stop") break;

      column += direction.column;
      row += direction.row;
    }
  });
}

/** Calcula los movimientos legales de una pieza sin tener en cuenta si dejan al propio rey en jaque. */
export function ShowAvailableMoves(
  piece: string,
  moveFrom: ValidPosition,
  board: string[][],
) {
  const moves: ValidPosition[] = [];

  const currentPiece = board[moveFrom.column][moveFrom.row];
  const color = currentPiece[0];

  const addSlidingMoves = (directions: ValidPosition[]) => {
    walkDirections(moveFrom, directions, board, (square, target) => {
      if (target === emptyCell) {
        moves.push(square);
        return "continue";
      }

      if (isEnemyPiece(currentPiece, target)) {
        moves.push(square);
      }

      return "stop";
    });
  };

  const addJumpMoves = (offsets: ValidPosition[]) => {
    offsets.forEach(({ column, row }) => {
      const target: ValidPosition = {
        column: moveFrom.column + column,
        row: moveFrom.row + row,
      };

      if (!isInsideBoard(target.column, target.row)) return;

      const targetPiece = board[target.column][target.row];

      if (targetPiece === emptyCell || isEnemyPiece(currentPiece, targetPiece)) {
        moves.push(target);
      }
    });
  };

  switch (piece) {
    case "R":
      addSlidingMoves(ROOK_DIRECTIONS);
      break;

    case "B":
      addSlidingMoves(BISHOP_DIRECTIONS);
      break;

    case "Q":
      addSlidingMoves(QUEEN_DIRECTIONS);
      break;

    case "N":
      addJumpMoves(KNIGHT_OFFSETS);
      break;

    case "K":
      addJumpMoves(KING_OFFSETS);
      break;

    case "P": {
      const direction = color === "W" ? -1 : 1;
      const startRow = color === "W" ? 6 : 1;

      const oneStepRow = moveFrom.row + direction;

      // Avance de una casilla (solo si está libre)
      if (
        isInsideBoard(moveFrom.column, oneStepRow) &&
        board[moveFrom.column][oneStepRow] === emptyCell
      ) {
        moves.push({ column: moveFrom.column, row: oneStepRow });

        // Avance doble, solo permitido desde la fila inicial del peón
        const twoStepRow = moveFrom.row + direction * 2;

        if (
          moveFrom.row === startRow &&
          isInsideBoard(moveFrom.column, twoStepRow) &&
          board[moveFrom.column][twoStepRow] === emptyCell
        ) {
          moves.push({ column: moveFrom.column, row: twoStepRow });
        }
      }

      // Capturas diagonales (izquierda y derecha)
      [-1, 1].forEach((columnOffset) => {
        const column = moveFrom.column + columnOffset;
        const row = oneStepRow;

        if (!isInsideBoard(column, row)) return;

        const target = board[column][row];

        if (isEnemyPiece(currentPiece, target)) {
          moves.push({ column, row });
        }
      });

      break;
    }

    default:
      break;
  }

  return moves;
}

/** Devuelve una copia del tablero con la pieza movida de `from` a `to` (sin reglas especiales como el enroque). */
export function simulateMove(board: string[][], from: ValidPosition, to: ValidPosition) {
  const newBoard = board.map((row) => [...row]);

  newBoard[to.column][to.row] = newBoard[from.column][from.row];
  newBoard[from.column][from.row] = emptyCell;

  return newBoard;
}

/**
 * Movimientos realmente legales de una pieza: sus movimientos "básicos"
 * (más el enroque si es el rey) filtrados para descartar aquellos que
 * dejarían al propio rey en jaque.
 */
export function getLegalMoves(
  pieceType: string,
  moveFrom: ValidPosition,
  castlingRights: CastlingRights,
  board: string[][]
): ValidPosition[] {
  const currentPiece = board[moveFrom.column][moveFrom.row];

  if (!currentPiece || currentPiece === emptyCell) {
    return [];
  }

  const color = currentPiece[0] as "W" | "B";

  let availableMoves = ShowAvailableMoves(pieceType, moveFrom, board);

  if (pieceType === "K") {
    const castlingMoves = getCastlingMoves(board, color, castlingRights);
    availableMoves = [...availableMoves, ...castlingMoves];
  }

  return availableMoves.filter((move) => {
    const simulatedBoard = simulateMove(board, moveFrom, move);
    return !isKingInCheck(simulatedBoard, color);
  });
}

/** Busca la posición del rey de `color` en el tablero. */
export function findKingPosition(board: string[][], color: "W" | "B") {
  for (let column = 0; column < 8; column++) {
    for (let row = 0; row < 8; row++) {
      const piece = board[column][row];

      if (piece === `${color}K`) {
        return { column, row };
      }
    }
  }
}

/**
 * Casillas que una pieza amenaza, ignorando si el movimiento es legal o si
 * la casilla de destino tiene una pieza propia. Se usa para detectar jaque,
 * por lo que a diferencia de ShowAvailableMoves incluye la primera pieza
 * bloqueante de cada dirección (amiga o enemiga) y, para el peón, sus dos
 * diagonales de ataque estén o no ocupadas.
 */
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

  const color = currentPiece[0];

  const addSlidingAttacks = (directions: ValidPosition[]) => {
    walkDirections(moveFrom, directions, board, (square, target) => {
      attackedSquares.push(square);
      return target === emptyCell ? "continue" : "stop";
    });
  };

  const addJumpAttacks = (offsets: ValidPosition[]) => {
    offsets.forEach(({ column, row }) => {
      const target: ValidPosition = {
        column: moveFrom.column + column,
        row: moveFrom.row + row,
      };

      if (isInsideBoard(target.column, target.row)) {
        attackedSquares.push(target);
      }
    });
  };

  switch (pieceType) {
    case "R":
      addSlidingAttacks(ROOK_DIRECTIONS);
      break;

    case "B":
      addSlidingAttacks(BISHOP_DIRECTIONS);
      break;

    case "Q":
      addSlidingAttacks(QUEEN_DIRECTIONS);
      break;

    case "N":
      addJumpAttacks(KNIGHT_OFFSETS);
      break;

    case "K":
      addJumpAttacks(KING_OFFSETS);
      break;

    case "P": {
      const direction = color === "W" ? -1 : 1;

      addJumpAttacks([
        { column: -1, row: direction },
        { column: 1, row: direction },
      ]);

      break;
    }

    default:
      break;
  }

  return attackedSquares;
}

/** Indica si el rey de `kingColor` está siendo atacado por alguna pieza enemiga. */
export function isKingInCheck(board: string[][], kingColor: "W" | "B"): boolean {
  const kingPosition = findKingPosition(board, kingColor);

  if (!kingPosition) {
    return false;
  }

  const enemyColor = kingColor === "W" ? "B" : "W";

  for (let column = 0; column < 8; column++) {
    for (let row = 0; row < 8; row++) {
      const piece = board[column][row];

      if (piece === emptyCell || !piece.startsWith(enemyColor)) continue;

      const attackedSquares = getAttackedSquares(piece[1], { column, row }, board);

      const kingIsAttacked = attackedSquares.some(
        (square) => square.column === kingPosition.column && square.row === kingPosition.row,
      );

      if (kingIsAttacked) {
        return true;
      }
    }
  }

  return false;
}
