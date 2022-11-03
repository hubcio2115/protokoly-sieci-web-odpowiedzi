import { TRPCError } from '@trpc/server';
import type { Point, Game } from './types';

export const createNewBoardWithChangedValue = (
  game: Game,
  coords: Point['coords'],
  value: Point['value'],
) => {
  return [
    ...game.board.filter(
      ({ coords: elCoords }) =>
        coords.x === elCoords.x && elCoords.y === coords.y,
    ),
    { value, coords },
  ];
};

export const checkIfGameExists = (id: string, games: Map<string, Game>) => {
  const game = games.get(id);

  if (!game)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'There is no game of given id!',
    });

  return game;
};

export const checkIfMoveIsValid = (
  id: string,
  games: Map<string, Game>,
  coords: Point['coords'],
) => {
  const game = checkIfGameExists(id, games);

  const valueOnCoords = game.board.find(
    ({ coords: elCoords }) =>
      elCoords.x === coords.x && elCoords.y === coords.y,
  )?.value;

  const isMoveValid = valueOnCoords === 0;
  if (!isMoveValid)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid move!',
    });

  return game;
};

export const checkIfGameFinished = (
  game: Game,
  player: 'computer' | 'human',
) => {
  const winingVariations = [
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 0, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ],
  ];

  return winingVariations.reduce((acc, variation) => {
    const valuesInBoard = game.board.filter(({ coords }) =>
      variation.some((val) => coords.x === val.x && coords.y === val.y),
    );

    if (
      valuesInBoard.every((point) => {
        const whichValueToCheck = player === 'human' ? 1 : 2;
        return point.value === whichValueToCheck;
      })
    )
      return true;
    return acc;
  }, false);
};

export const botMove = (game: Game): Point[] => {
  const pointId = Math.floor(Math.random() * game.board.length);

  if (game.board[pointId].value === 0) {
    const newBoard = createNewBoardWithChangedValue(
      game,
      game.board[pointId].coords,
      2,
    );

    return newBoard;
  }

  return botMove(game);
};
