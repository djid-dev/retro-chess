import CRT from "./components/CRT";
import "./App.css";
import GameBoard from "./components/GameBoard";
import GameInfo from "./components/GameInfo";

function App() {

  return (
    <>
      <CRT>
        <GameBoard />
        <GameInfo/>
      </CRT>
    </>
  );
}

export default App
