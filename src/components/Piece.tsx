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
      {/* draggable=false evita que el navegador arrastre la imagen por su cuenta;
          el arrastre de la pieza lo controla la casilla (<Cell>) que la contiene */}
      <img src={`src/assets/pieces/${cell}.png`} alt={cell} draggable={false} />
    </span>
  );
}

export default Piece;
