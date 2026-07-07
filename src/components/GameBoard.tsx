import { useState } from "react";
import "../styles/GameBoardStyles.css";
import Cell from "./Cell";

import { emptyCell, rowLabels } from "../utils/chessConstants";
import type { Position, ValidPosition } from "../utils/chessTypes";

import { getLegalMoves } from "../utils/chessMoves";
import { isSameColorPiece, isMoveAvailable } from "../utils/chessHelpers";

import useChessStore from "../utils/globalStates";
import { getGameStatus } from "../utils/chessGameStatus";

function GameBoard() {
  const chessStore = useChessStore();
  const board = chessStore((state) => state.board);
  const colorTurn = chessStore((state) => state.colorTurn);
  const setBoard = chessStore((state) => state.setBoard);

  const setTurn = chessStore((state) => state.setTurn);
  const incrementRound = chessStore((state) => state.incrementRound);
  const setGameState = chessStore((state) => state.setGameState);
  const setWinner = chessStore((state) => state.setWinner);

  // Estados para el manejo de la selección de celdas
  const [activeCell, setActiveCell] = useState<Position>({
    column: null,
    row: null,
  });

  const [availableMoves, setAvailableMoves] = useState<ValidPosition[]>([]);

  const [moveFrom, setMoveFrom] = useState<Position>({
    column: null,
    row: null,
  });

  const clearSelection = () => {
    setActiveCell({ column: null, row: null });
    setMoveFrom({ column: null, row: null });
    setAvailableMoves([]);
  };
  // -----------------------------------------

  // Cambia el turno de los jugadores
  const changeTurn = () => {
    if (colorTurn === "W") {
      setTurn("B");
    } else {
      setTurn("W");
      incrementRound();
    }
  };

  const handleCellClick = (column: number, row: number) => {
    const selectedCell = board[column][row];

    // Si hago click en la misma celda seleccionada, limpio la selección
    if (column === moveFrom.column && row === moveFrom.row) {
      clearSelection();
      return;
    }
    const pieceType = selectedCell[1];

    const moves = getLegalMoves(pieceType, { column, row }, board);

    // Si hago click en una pieza de mi color, la selecciono
    if (selectedCell !== emptyCell && selectedCell.startsWith(colorTurn)) {
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
    if (!isMoveAvailable(availableMoves, column, row)) {
      return;
    }

    // Mover o capturar pieza

    const enemyColor = colorTurn === "W" ? "B" : "W";

    const newBoard = board.map((boardColumn) => [...boardColumn]);
    newBoard[column][row] = board[moveFrom.column!][moveFrom.row!];
    newBoard[moveFrom.column!][moveFrom.row!] = emptyCell;

    setBoard(newBoard);

    const status = getGameStatus(newBoard, enemyColor);

    // Detecta si alguien hizo un Jaque Mate o tablas por Rey ahogado.
    if (status === "checkmate") {
      setWinner(colorTurn);
    } else if (status === "stalemate") {
      setWinner(null);
    }

    setGameState(status);

    changeTurn();
    clearSelection();
  };

  return (
    <div className="game-container">
      <div className="board-container">
        <ul className="row-index">
          {board.map((_, columnIndex) => (
            <li key={`column-${columnIndex}`}>{-1 * (columnIndex - 8)}</li>
          ))}
        </ul>

        <div className="game-board">
          {board.map((column, columnIndex) => (
            <ul className="column" key={`column-${columnIndex}`}>
              {column.map((cell, rowIndex) => {
                const isActive =
                  activeCell.column === columnIndex &&
                  activeCell.row === rowIndex;

                const isAvailableMove = availableMoves.some(
                  (move) =>
                    move.column === columnIndex && move.row === rowIndex,
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
      </div>

      <ul className="column-index">
        {rowLabels.map((row, rowIndex) => (
          <li key={`column-${rowIndex}`}>{row}</li>
        ))}
      </ul>
    </div>
  );
}

export default GameBoard;
