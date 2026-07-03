import { useState } from "react";
import "../styles/GameBoardStyles.css";
import Cell from "./Cell";

import { initialBoard, emptyCell, rowLabels } from "../utils/chessConstants";
import type { Position, ValidPosition } from "../utils/chessTypes";

import { showAvailableMoves } from "../utils/chessMoves";
import { isSameColorPiece, isMoveAvailable } from "../utils/chessHelpers";

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
    if (!isMoveAvailable(availableMoves, column, row)) {
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
   <div className="game-container">
   
     <div className="board-container">
       <ul className="row-index">
            {board.map((column, columnIndex) => (
              <li  key={`column-${columnIndex}`}>{-1 * (columnIndex-8)}</li>
            ))}
        </ul>
        
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
    </div>
    
    <ul className="column-index">
        {
        
        rowLabels.map((row, rowIndex) => (
          <li key={`column-${rowIndex}`}>{row}</li>
        ))}
    </ul>
   </div>
  );
}

export default GameBoard;
