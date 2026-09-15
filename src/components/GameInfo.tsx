import useChessStore from "../utils/globalStates";
import "../styles/GameInfoStyles.css";
import type { GameStatus } from "../utils/chessTypes";

const STATUS_LABELS: Record<GameStatus, string> = {
  playing: "En juego",
  check: "Jaque",
  checkmate: "Jaque mate",
  stalemate: "Tablas",
};

// Reutiliza las clases .neon-* ya definidas en index.css para que cada
// estado del juego tenga un color distinto y consistente con el resto de la UI
const STATUS_COLORS: Record<GameStatus, string> = {
  playing: "neon-green",
  check: "neon-orange",
  checkmate: "neon-red",
  stalemate: "neon-magenta",
};

function GameInfo() {
  const store = useChessStore();

  const gameState = store((state) => state.gameState);
  const winner = store((state) => state.winner);
  const colorTurn = store((state) => state.colorTurn);
  const round = store((state) => state.round);

  const turnColorClass = colorTurn === "W" ? "neon-cyan" : "neon-magenta";
  const winnerColorClass = winner ? "neon-green" : "";

  return (
    <div className="game-info">
      <h2 className="game-status">
        <span className="info-label">Estado del juego</span>
        <span className={`info-value ${STATUS_COLORS[gameState]}`}>
          {STATUS_LABELS[gameState]}
        </span>
      </h2>

      <h2 className="game-winner">
        <span className="info-label">Ganador</span>
        <span className={`info-value ${winnerColorClass}`}>{winner ?? "—"}</span>
      </h2>

      <h2 className="game-turn">
        <span className="info-label">Turno</span>
        <span className={`info-value ${turnColorClass}`}>
          {colorTurn === "W" ? "Blancas" : "Negras"}
        </span>
      </h2>

      <h2 className="game-round">
        <span className="info-label">Ronda</span>
        <span className="info-value">{round}</span>
      </h2>
    </div>
  );
}

export default GameInfo;
