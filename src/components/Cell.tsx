import Piece from "./Piece";
import "../styles/CellStyles.css";

interface CellProps {
  cell: string;
  columnIndex: number;
  rowIndex: number;
  isActive: boolean;
  isAvailableMove: boolean;
  isBeingDragged: boolean;
  setActiveCell: (column: number, row: number) => void;
  onPiecePointerDown: (column: number, row: number, event: React.PointerEvent) => void;
}

function Cell({
  cell,
  columnIndex,
  rowIndex,
  isActive,
  isAvailableMove,
  isBeingDragged,
  setActiveCell,
  onPiecePointerDown,
}: CellProps) {

  const handleSquareClick = () => {
    setActiveCell(columnIndex, rowIndex);
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    onPiecePointerDown(columnIndex, rowIndex, event);
  };

  return (
    <li
      // data-column/data-row permiten ubicar la casilla bajo el cursor con
      // document.elementFromPoint al soltar una pieza arrastrada
      data-column={columnIndex}
      data-row={rowIndex}
      className={`
        square
        ${(columnIndex + rowIndex) % 2 === 0 ? "white-square" : "black-square"}
        ${cell === "●" ? "empty-cell" : cell}
        ${isActive ? "selected" : ""}
        ${isAvailableMove ? "available-move" : ""}
      `}
      onClick={handleSquareClick}
      onPointerDown={handlePointerDown}
    >
      {!isBeingDragged && <Piece cell={cell} />}
    </li>
  );
}

export default Cell;
