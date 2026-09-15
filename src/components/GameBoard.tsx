import { useState } from "react";
import "../styles/GameBoardStyles.css";
import Cell from "./Cell";

import { emptyCell, rowLabels } from "../utils/chessConstants";
import type { Position, ValidPosition } from "../utils/chessTypes";

import { getLegalMoves, simulateMove } from "../utils/chessMoves";
import { isMoveAvailable } from "../utils/chessHelpers";

import useChessStore from "../utils/globalStates";
import { getGameStatus } from "../utils/chessGameStatus";
import { isCastlingMove, simulateMoveWithCastling, updateCastlingRightsAfterCapture, updateCastlingRightsAfterMove } from "../utils/chessCastling";

function GameBoard() {
  const chessStore = useChessStore();

  const board = chessStore((state) => state.board);
  const colorTurn = chessStore((state) => state.colorTurn);
  const setBoard = chessStore((state) => state.setBoard);

  const setTurn = chessStore((state) => state.setTurn);
  const incrementRound = chessStore((state) => state.incrementRound);
  const setGameState = chessStore((state) => state.setGameState);
  const setWinner = chessStore((state) => state.setWinner);

  const castlingRights = chessStore((state) => state.castlingRights);
  const setCastlingRights = chessStore((state) => state.setCastlingRights);

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

  // Pasa el turno al otro jugador; al volver a blancas se completa una ronda
  const changeTurn = () => {
    if (colorTurn === "W") {
      setTurn("B");
    } else {
      setTurn("W");
      incrementRound();
    }
  };

  const hasPieceSelected = moveFrom.column !== null && moveFrom.row !== null;

  // Selecciona una pieza propia y calcula sus movimientos legales para resaltarlos
  const selectPiece = (position: ValidPosition, piece: string) => {
    const pieceType = piece[1];
    const legalMoves = getLegalMoves(pieceType, position, castlingRights, board);

    setMoveFrom(position);
    setActiveCell(position);
    setAvailableMoves(legalMoves);
  };

  // Mueve la pieza seleccionada (`from`) a la casilla elegida (`to`) y actualiza
  // el estado de la partida: tablero, derechos de enroque, turno y resultado
  const movePiece = (from: ValidPosition, to: ValidPosition) => {
    const movingPiece = board[from.column][from.row];
    const capturedPiece = board[to.column][to.row];
    const enemyColor = colorTurn === "W" ? "B" : "W";

    const newBoard = isCastlingMove(movingPiece, from, to)
      ? simulateMoveWithCastling(board, from, to)
      : simulateMove(board, from, to);

    setBoard(newBoard);

    let newCastlingRights = updateCastlingRightsAfterMove(castlingRights, movingPiece, from);
    newCastlingRights = updateCastlingRightsAfterCapture(newCastlingRights, capturedPiece, to);
    setCastlingRights(newCastlingRights);

    const status = getGameStatus(newBoard, newCastlingRights, enemyColor);

    if (status === "checkmate") {
      setWinner(colorTurn);
    } else if (status === "stalemate") {
      setWinner(null);
    }

    setGameState(status);

    changeTurn();
    clearSelection();
  };

  const handleCellClick = (column: number, row: number) => {
    const clickedPosition: ValidPosition = { column, row };
    const clickedPiece = board[column][row];

    // Click sobre la pieza ya seleccionada: la deselecciona
    if (column === moveFrom.column && row === moveFrom.row) {
      clearSelection();
      return;
    }

    // Click sobre una pieza propia: la selecciona (o cambia la selección)
    if (clickedPiece !== emptyCell && clickedPiece.startsWith(colorTurn)) {
      selectPiece(clickedPosition, clickedPiece);
      return;
    }

    // Sin pieza seleccionada todavía, un click en vacío/rival no hace nada
    if (!hasPieceSelected) {
      return;
    }

    // Click sobre un destino no permitido para la pieza seleccionada
    if (!isMoveAvailable(availableMoves, column, row)) {
      return;
    }

    movePiece({ column: moveFrom.column!, row: moveFrom.row! }, clickedPosition);
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
                    columnIndex={columnIndex}
                    rowIndex={rowIndex}
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
