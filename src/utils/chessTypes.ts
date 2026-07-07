type Position = {
  column: number | null;
  row: number | null;
};

type ValidPosition = {
  column: number;
  row: number;
};

export type ColorTurn = "W" | "B";

export type {
  Position, ValidPosition
}

export type GameStatus =
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate";