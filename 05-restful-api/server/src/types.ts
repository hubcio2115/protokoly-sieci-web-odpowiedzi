export interface Point {
  value: 0 | 1 | 2;
  coords: {
    x: number;
    y: number;
  };
}

export interface Game {
  board: Point[];
}
