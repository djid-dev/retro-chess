import Piece from "./Piece";
import "../styles/CellStyles.css";

interface CellProps {
  cell: string;
  cellIndex: number;
  rowIndex: number;
  isActive: boolean;
  isAvailableMove: boolean;
  setActiveCell: (row: number, cell: number) => void;
}

function Cell({
  cell,
  cellIndex,
  rowIndex,
  isActive,
  isAvailableMove,
  setActiveCell,
}: CellProps) {
  function handleSquareClick() {
    setActiveCell(rowIndex, cellIndex);
  }

  return (
    <li
      className={`
        square
        ${(cellIndex + rowIndex) % 2 === 1 ? "white-square" : "black-square"}
        ${cell === "●" ? "empty-cell" : cell}
        ${isActive ? "selected" : ""}
        ${isAvailableMove ? "available-move" : ""}
      `}
      onClick={handleSquareClick}
    >
      <Piece cell={cell} />
    </li>
  );
}

export default Cell;