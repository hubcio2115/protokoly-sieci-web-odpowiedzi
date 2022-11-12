import { TRPCError } from '@trpc/server';
import type { PointValue } from './types';

export const createNewBoardWithChangedValue = (
  game: PointValue[][],
  index: number,
  value: PointValue,
) => {
  return [
    ...game.flat().slice(0, index),
    value,
    ...game.flat().slice(index + 1),
  ].reduce(
    (acc: PointValue[][], el, idx) => {
      const currentRow = Math.floor(idx / 3);

      acc[currentRow] = acc[currentRow].concat(el);
      return acc;
    },
    [[], [], []],
  );
};

export const checkIfGameExists = (
  id: string,
  games: Map<string, PointValue[][]>,
) => {
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
  games: Map<string, PointValue[][]>,
  index: number,
) => {
  const game = checkIfGameExists(id, games);

  const valueOnCoords = game.flat()[index];

  const isMoveValid = valueOnCoords === 0;
  if (!isMoveValid)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid move!',
    });

  return game;
};

export const checkIfGameFinished = (
  game: PointValue[][],
  player: 'computer' | 'human',
) => {
  const winingVariations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winingVariations.reduce((acc, variation) => {
    const [first, second, last] = variation;
    const valueToLookFor = player === 'human' ? 1 : 2;

    const flattenBoard = game.flat();

    const isWon =
      flattenBoard[first] === valueToLookFor &&
      flattenBoard[second] === valueToLookFor &&
      flattenBoard[last] === valueToLookFor;
    if (isWon) return true;

    return acc;
  }, false);
};

export const botMove = (game: PointValue[][]): PointValue[][] => {
  const freeIndexes = game.flat().reduce((acc: number[], el, index) => {
    return el === 0 ? [...acc, index] : acc;
  }, []);

  const pointIdx = freeIndexes[Math.floor(Math.random() * freeIndexes.length)];

  const newBoard = createNewBoardWithChangedValue(game, pointIdx, 2);

  return newBoard;
};
