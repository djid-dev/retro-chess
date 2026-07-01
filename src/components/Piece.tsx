interface PieceProps {
  cell: string;
}

function Piece({ cell }: PieceProps) {
  if (cell === "●") {
    return null;
  }
  const isBlack = cell.startsWith("B");
  return (
    <span className={`piece ${isBlack ? "black-piece" : "white-piece"}`}>
      <img src={`src/assets/pieces/${cell}.png`} alt={cell} />
    </span>
  );
}

export default Piece;
