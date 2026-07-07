import { emptyCell } from "./chessConstants";
import { isKingInCheck, getLegalMoves } from "./chessMoves";
import type { ColorTurn, GameStatus } from "./chessTypes";


export function hasAnyLegalMove(
  board: string[][],
  color: ColorTurn
): boolean {
  for (let column = 0; column < 8; column++) {
    for (let row = 0; row < 8; row++) {
      const piece = board[column][row];

      if (piece === emptyCell) continue;
      if (!piece.startsWith(color)) continue;

      const pieceType = piece[1];

      const legalMoves = getLegalMoves(
        pieceType,
        { column, row },
        board
      );

      if (legalMoves.length > 0) {
        return true;
      }
    }
  }

  return false;
}

export function getGameStatus(
  board: string[][],
  colorToMove: ColorTurn
): GameStatus {
  const kingInCheck = isKingInCheck(board, colorToMove);
  const hasLegalMove = hasAnyLegalMove(board, colorToMove);

  if (kingInCheck && !hasLegalMove) {
    return "checkmate";
  }

  if (!kingInCheck && !hasLegalMove) {
    return "stalemate";
  }

  if (kingInCheck) {
    return "check";
  }

  return "playing";
}