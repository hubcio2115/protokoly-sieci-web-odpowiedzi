import { TRPCError } from '@trpc/server';
import type { PointValue, Board } from './types';

export const createNewBoardWithChangedValue = (
  game: Board,
  index: number,
  value: PointValue,
) => {
  return [
    ...game.board.flat().slice(0, index),
    value,
    ...game.board.flat().slice(index + 1),
  ].reduce((acc: PointValue[][], el, idx) => {
    const currentRow = Math.floor(idx / 3);

    if (!acc[currentRow]) {
      return [...acc, [el]];
    }

    return [...acc, [...acc[currentRow], el]];
  }, []);
};

export const checkIfGameExists = (id: string, games: Map<string, Board>) => {
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
  games: Map<string, Board>,
  index: number,
) => {
  const game = checkIfGameExists(id, games);

  const valueOnCoords = game.board.flat()[index];

  const isMoveValid = valueOnCoords === 0;
  if (!isMoveValid)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid move!',
    });

  return game;
};

export const checkIfGameFinished = (
  game: Board,
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
    const valueToLookFor = player === 'computer' ? 1 : 2;

    const flattenBoard = game.board.flat();

    const isWon =
      flattenBoard[first] === valueToLookFor &&
      flattenBoard[second] === valueToLookFor &&
      flattenBoard[last] === valueToLookFor;
    if (isWon) return true;

    return acc;
  }, false);
};

export const botMove = (game: Board): PointValue[][] => {
  const pointIdx = Math.floor(Math.random() * game.board.length);

  if (game.board.flat()[pointIdx] === 0) {
    const newBoard = createNewBoardWithChangedValue(game, pointIdx, 2);

    return newBoard;
  }

  return botMove(game);
};
