import Piece from "./Piece";
import "../styles/CellStyles.css";

interface CellProps {
  cell: string;
  columnIndex: number;
  rowIndex: number;
  isActive: boolean;
  isAvailableMove: boolean;
  setActiveCell: (column: number, row: number) => void;
}

function Cell({
  cell,
  columnIndex,
  rowIndex,
  isActive,
  isAvailableMove,
  setActiveCell,
}: CellProps) {
  
  const handleSquareClick = () => {
    setActiveCell(columnIndex, rowIndex);
  }

  return (
    <li
      className={`
        square
        ${(columnIndex + rowIndex) % 2 === 0 ? "white-square" : "black-square"}
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
