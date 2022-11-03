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
import type { Game, Point } from './types';

const games = new Map<string, Game>();

const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  startGame: publicProcedure.query(() => {
    const newGameId = uuid();
    const newGameBoard = [...Array(3).keys()]
      .map((y) => {
        return [...Array(3).keys()].map((x): Point => {
          return { value: 0, coords: { x, y } };
        });
      })
      .flat();

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
        move: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .query(({ input: { id, move: coords } }) => {
      const game = checkIfMoveIsValid(id, games, coords);

      const newBoard = createNewBoardWithChangedValue(game, coords, 1);

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
        move: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .query(({ input: { id, move: coords } }) => {
      const game = checkIfGameExists(id, games);

      const newBoard = createNewBoardWithChangedValue(game, coords, 0);

      games.set(id, { board: newBoard });
      return { id, board: newBoard };
    }),

  moveMove: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        coords: z.object({ x: z.number(), y: z.number() }),
        newCoords: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .query(({ input: { id, coords, newCoords } }) => {
      const game = checkIfGameExists(id, games);

      const point = game.board.find(
        (point) => point.coords.x === coords.x && point.coords.y === coords.y,
      )!;

      const pointToBeSwapped = game.board.find(
        (point) =>
          point.coords.x === newCoords.x && point.coords.y === newCoords.y,
      )!;

      const newBoard = createNewBoardWithChangedValue(
        {
          board: createNewBoardWithChangedValue(
            game,
            point.coords,
            pointToBeSwapped.value,
          ),
        },
        pointToBeSwapped.coords,
        point.value,
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
