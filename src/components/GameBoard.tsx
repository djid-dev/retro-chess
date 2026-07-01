import { useState } from "react";
import "../styles/GameBoardStyles.css";
import Cell from "./Cell";

const emptyCell = "●";

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

type Position = {
  column: number | null;
  row: number | null;
};

type ValidPosition = {
  column: number;
  row: number;
};

type LastMove = {
  from: {
    column: number;
    row: number;
  };
  to: {
    column: number;
    row: number;
  };
} | null;

const isInsideBoard = (column: number, row: number) => {
  return column >= 0 && column <= 7 && row >= 0 && row <= 7;
};

const getPieceColor = (piece: string) => {
  if (piece === emptyCell) return null;
  return piece[0]; // W o B
};

const isEnemyPiece = (piece: string, target: string) => {
  if (piece === emptyCell || target === emptyCell) return false;
  return getPieceColor(piece) !== getPieceColor(target);
};

const isSameColorPiece = (piece: string, target: string) => {
  if (piece === emptyCell || target === emptyCell) return false;
  return getPieceColor(piece) === getPieceColor(target);
};

// Reglas de movimiento
function showAvailableMoves(
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

function GameBoard() {
  const [board, setBoard] = useState<string[][]>(initialBoard);
  const [colorTurn, setTurn] = useState<"W" | "B">("W");
  const [round, setRound] = useState<number>(0);

  const [activeCell, setActiveCell] = useState<Position>({
    column: null,
    row: null,
  });

  const [availableMoves, setAvailableMoves] = useState<ValidPosition[]>([]);

  const [moveFrom, setMoveFrom] = useState<Position>({
    column: null,
    row: null,
  });

  const isMoveAvailable = (column: number, row: number) => {
    return availableMoves.some(
      (move) => move.column === column && move.row === row,
    );
  };

  const clearSelection = () => {
    setActiveCell({ column: null, row: null });
    setMoveFrom({ column: null, row: null });
    setAvailableMoves([]);
  };

  const changeTurn = () => {
    if (colorTurn === "W") {
      setTurn("B");
    } else {
      setTurn("W");
      setRound((prevRound) => prevRound + 1);
    }
  };

  const handleCellClick = (column: number, row: number) => {
    const selectedCell = board[column][row];

    // Si hago click en la misma celda seleccionada, limpio la selección
    if (column === moveFrom.column && row === moveFrom.row) {
      clearSelection();
      return;
    }

    // Si hago click en una pieza de mi color, la selecciono
    if (selectedCell !== emptyCell && selectedCell.startsWith(colorTurn)) {
      const pieceType = selectedCell[1];

      const moves = showAvailableMoves(pieceType, { column, row }, board);

      setMoveFrom({ column, row });
      setActiveCell({ column, row });
      setAvailableMoves(moves);

      return;
    }

    // Si no tengo pieza seleccionada, no puedo mover
    if (moveFrom.column === null || moveFrom.row === null) {
      return;
    }

    // Si hago click en una pieza de mi mismo color, no puedo capturarla
    const movingPiece = board[moveFrom.column][moveFrom.row];

    if (isSameColorPiece(movingPiece, selectedCell)) {
      return;
    }

    // Si el movimiento no está permitido, no hago nada
    if (!isMoveAvailable(column, row)) {
      return;
    }

    // Mover o capturar pieza
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((boardRow) => [...boardRow]);

      newBoard[column][row] = prevBoard[moveFrom.column!][moveFrom.row!];
      newBoard[moveFrom.column!][moveFrom.row!] = emptyCell;

      return newBoard;
    });

    changeTurn();
    clearSelection();
  };

  return (
    <div className="game-board">
      {board.map((column, columnIndex) => (
        <ul className="column" key={`column-${columnIndex}`}>
          {column.map((cell, rowIndex) => {
            const isActive =
              activeCell.column === columnIndex && activeCell.row === rowIndex;

            const isAvailableMove = availableMoves.some(
              (move) => move.column === columnIndex && move.row === rowIndex,
            );

            return (
              <Cell
                key={`cell-${columnIndex}-${rowIndex}`}
                cell={cell}
                cellIndex={rowIndex}
                rowIndex={columnIndex}
                isActive={isActive}
                isAvailableMove={isAvailableMove}
                setActiveCell={handleCellClick}
              />
            );
          })}
        </ul>
      ))}
    </div>
  );
}

export default GameBoard;
