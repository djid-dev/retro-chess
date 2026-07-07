import { create } from "zustand";

import { initialBoard } from "./chessConstants";
import type { Position, GameStatus, ColorTurn } from "./chessTypes";

type ChessStoreState = {
  board: string[][];
  setBoard: (board: string[][]) => void;

  colorTurn: ColorTurn;
  setTurn: (colorTurn: ColorTurn) => void;

  round: number;
  setRound: (round: number) => void;
  incrementRound: () => void;

  kingsPositions: {
    W: Position;
    B: Position;
  };
  setKingsPosition: (kingsPositions: { W: Position; B: Position }) => void;

  gameState: GameStatus;
  setGameState: (gameState: GameStatus) => void;

  winner: ColorTurn | null;
  setWinner: (winner: ColorTurn | null) => void;
};

const useChessStore = create<ChessStoreState>((set) => ({
  board: initialBoard,
  setBoard: (board: string[][]) => set({ board }),


  colorTurn: "W",
  setTurn: (colorTurn: "W" | "B") => set({ colorTurn }),

  round: 0,
  setRound: (round: number) => set({ round }),
  incrementRound: () => set((state) => ({ round: state.round + 1 })),

  kingsPositions: {
    W: { column: 0, row: 4 },
    B: { column: 7, row: 4 },
  },
  setKingsPosition: (kingsPositions: { W: Position; B: Position }) =>
    set({ kingsPositions }),

  gameState: "playing",
  setGameState: (gameState: GameStatus) => set({ gameState }),

  winner: null,
  setWinner: (winner: ColorTurn | null) => set({ winner }),
}));

function GlobalContext() {
  return useChessStore;
}

export default GlobalContext;
