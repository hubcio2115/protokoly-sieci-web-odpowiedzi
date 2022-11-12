import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import {
  botMove,
  checkIfGameExists,
  checkIfGameFinished,
  checkIfMoveIsValid,
  createNewBoardWithChangedValue,
} from './utils.js';
import type { PointValue } from './types.js';

const games = new Map<string, PointValue[][]>();

const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  startGame: publicProcedure.query(() => {
    const newGameId = uuid();
    const newGameBoard = [...Array(3).keys()].map((_) => {
      return [...Array(3).keys()].map((_): PointValue => {
        return 0;
      });
    });

    games.set(newGameId, newGameBoard);
    return { id: newGameId, board: newGameBoard };
  }),

  endGame: publicProcedure.input(z.string().uuid()).query(({ input: id }) => {
    games.delete(id);

    return 'Thanks for playing :D';
  }),

  turn: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        move: z.number().int().min(0).max(10),
      }),
    )
    .query(({ input: { id, move: index } }) => {
      const game = checkIfMoveIsValid(id, games, index);

      const newBoard = createNewBoardWithChangedValue(game, index, 1);

      if (checkIfGameFinished(newBoard, 'human'))
        return 'game ended you win :)';

      if (newBoard.flat().every((el) => el === 0))
        return 'game ended in a draw :)';

      games.set(id, botMove(newBoard));

      if (checkIfGameFinished(games.get(id)!, 'computer'))
        return 'game ended you lose :(';

      return { id, board: games.get(id)! };
    }),

  deleteMove: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        move: z.number().int().min(0).max(10),
      }),
    )
    .query(({ input: { id, move: index } }) => {
      const game = checkIfGameExists(id, games);

      const newBoard = createNewBoardWithChangedValue(game, index, 0);

      games.set(id, newBoard);
      return { id, board: newBoard };
    }),

  moveMove: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        coords: z.number().int().min(0).max(10),
        newCoords: z.number().int().min(0).max(10),
      }),
    )
    .query(({ input: { id, coords, newCoords } }) => {
      const game = checkIfGameExists(id, games);

      const point = game.flat()[coords];

      const pointToBeSwapped = game.flat()[newCoords];

      const newBoard = createNewBoardWithChangedValue(
        createNewBoardWithChangedValue(game, coords, pointToBeSwapped),
        newCoords,
        point,
      );

      games.set(id, newBoard);

      return { id, board: newBoard };
    }),
});
export type AppRouter = typeof appRouter;

createHTTPServer({
  router: appRouter,
  createContext() {
    return {};
  },
}).listen(3000);
