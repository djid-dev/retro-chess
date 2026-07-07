import useChessStore from "../utils/globalStates";

function GameInfo() {
    const store = useChessStore();

    const gameState = store((state) => state.gameState);
    const winner = store((state) => state.winner);
    const colorTurn = store((state) => state.colorTurn);
    const round = store((state) => state.round);



  return (
    <div className="game-info">
      <div className="game-status">
        <h2>Estado del Juego: {gameState}</h2>
      </div>
      <div className="game-winner">
        <h2>Ganador: {winner}</h2>
      </div>
      <div className="game-turn">
        <h2>Turno: {colorTurn}</h2>
      </div>
      <div className="game-round">
        <h2>Ronda: {round}</h2>
      </div>
    </div>
  );
}

export default GameInfo;
