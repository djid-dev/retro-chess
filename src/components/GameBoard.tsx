import { useRef, useState } from "react";
import "../styles/GameBoardStyles.css";
import Cell from "./Cell";
import Piece from "./Piece";

import { emptyCell, rowLabels } from "../utils/chessConstants";
import type { Position, ValidPosition } from "../utils/chessTypes";

import { getLegalMoves, simulateMove } from "../utils/chessMoves";
import { isMoveAvailable } from "../utils/chessHelpers";

import useChessStore from "../utils/globalStates";
import { getGameStatus } from "../utils/chessGameStatus";
import { isCastlingMove, simulateMoveWithCastling, updateCastlingRightsAfterCapture, updateCastlingRightsAfterMove } from "../utils/chessCastling";

// Distancia mínima (px) que debe moverse el puntero antes de considerar que
// el usuario está arrastrando la pieza en vez de simplemente haciendo click
const DRAG_START_THRESHOLD = 4;

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

  // Pieza que se está arrastrando visualmente (se "despega" de su casilla y
  // sigue al cursor mediante el elemento fantasma de más abajo)
  const [draggingPiece, setDraggingPiece] = useState<{ column: number; row: number; cell: string } | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  // Un click que sucede justo después de soltar un arrastre real no debe
  // volver a procesarse como si fuera un click independiente
  const suppressNextClickRef = useRef(false);

  const positionGhost = (x: number, y: number) => {
    if (ghostRef.current) {
      ghostRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1.1)`;
    }
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
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

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

  // Empieza a "levantar" una pieza propia con el puntero. Mientras el
  // movimiento del puntero se mantenga por debajo del umbral se trata como
  // un click normal (lo maneja handleCellClick); al superarlo, la pieza se
  // despega de su casilla y sigue al cursor hasta que se suelta.
  const handlePiecePointerDown = (column: number, row: number, event: React.PointerEvent) => {
    const piece = board[column][row];

    if (piece === emptyCell || !piece.startsWith(colorTurn)) return;

    const pieceType = piece[1];
    const legalMoves = getLegalMoves(pieceType, { column, row }, castlingRights, board);

    const startX = event.clientX;
    const startY = event.clientY;
    let isDragging = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDragging) {
        const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
        if (distance < DRAG_START_THRESHOLD) return;

        isDragging = true;
        setMoveFrom({ column, row });
        setActiveCell({ column, row });
        setAvailableMoves(legalMoves);
        setDraggingPiece({ column, row, cell: piece });
        document.body.style.cursor = "grabbing";
      }

      positionGhost(moveEvent.clientX, moveEvent.clientY);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      if (!isDragging) return;

      document.body.style.cursor = "";
      setDraggingPiece(null);
      suppressNextClickRef.current = true;

      const dropSquare = document
        .elementFromPoint(upEvent.clientX, upEvent.clientY)
        ?.closest<HTMLElement>("[data-column][data-row]");

      if (dropSquare) {
        const toColumn = Number(dropSquare.dataset.column);
        const toRow = Number(dropSquare.dataset.row);
        const droppedOnOrigin = toColumn === column && toRow === row;

        if (!droppedOnOrigin && isMoveAvailable(legalMoves, toColumn, toRow)) {
          movePiece({ column, row }, { column: toColumn, row: toRow });
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
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

                const isBeingDragged =
                  draggingPiece?.column === columnIndex && draggingPiece?.row === rowIndex;

                return (
                  <Cell
                    key={`cell-${columnIndex}-${rowIndex}`}
                    cell={cell}
                    columnIndex={columnIndex}
                    rowIndex={rowIndex}
                    isActive={isActive}
                    isAvailableMove={isAvailableMove}
                    isBeingDragged={isBeingDragged}
                    setActiveCell={handleCellClick}
                    onPiecePointerDown={handlePiecePointerDown}
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

      {/* Pieza "fantasma" que sigue al cursor mientras se arrastra; se mantiene
          siempre montada (oculta por CSS) para que el ref esté listo desde el
          primer movimiento del puntero */}
      <div ref={ghostRef} className={`drag-ghost ${draggingPiece ? "active" : ""}`}>
        {draggingPiece && <Piece cell={draggingPiece.cell} />}
      </div>
    </div>
  );
}

export default GameBoard;
