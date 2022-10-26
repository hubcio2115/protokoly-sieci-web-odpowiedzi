import express from 'express';
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

/* Wrzuciłem jako ts nie bez powodu. Nie można tego przetranspilować na jsa.
Żeby odpalić trzeba zainstalować ts-node i uruchomić w konsoli "ts-node-esm ./api.ts"
*/

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});
type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const appRouter = t.router({
  hello: t.procedure.query(() => 'hello'),
  bye: t.procedure.mutation(() => 'działa'),
});
export type AppRouter = typeof appRouter;

const app = express();

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({ router: appRouter, createContext }),
);

// Wersja gdzie api znajduje się na serwerze lokalnym, dla komunikacji w drugą stronę wystarczy podmienić port
app.listen(8080);
