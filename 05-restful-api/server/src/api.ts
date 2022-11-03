import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { uuid } from 'uuidv4';
import { z } from 'zod';
import {
  botMove,
  checkIfGameExists,
  checkIfGameFinished,
  checkIfMoveIsValid,
  createNewBoardWithChangedValue,
} from './utils';
import type { Board, PointValue } from './types';

const games = new Map<string, Board>();

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

    games.set(newGameId, { board: newGameBoard });
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

      games.set(id, { board: newBoard });

      if (checkIfGameFinished(game, 'human')) return 'game ended you win :)';

      games.set(id, { board: botMove(game) });

      if (checkIfGameFinished(game, 'computer'))
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

      games.set(id, { board: newBoard });
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

      const point = game.board.flat()[coords];

      const pointToBeSwapped = game.board.flat()[coords];

      const newBoard = createNewBoardWithChangedValue(
        {
          board: createNewBoardWithChangedValue(game, coords, pointToBeSwapped),
        },
        newCoords,
        point,
      );

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
