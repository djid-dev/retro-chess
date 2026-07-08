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

export type CastlingRights = {
  W: {
    kingMoved: boolean;
    leftRookMoved: boolean;
    rightRookMoved: boolean;
  };
  B: {
    kingMoved: boolean;
    leftRookMoved: boolean;
    rightRookMoved: boolean;
  };
};