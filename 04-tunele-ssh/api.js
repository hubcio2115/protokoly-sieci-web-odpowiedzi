import express from 'express';
import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

const createContext = ({ req, res }) => ({});
const t = initTRPC.context().create();

const appRouter = t.router({
  hello: t.procedure.query(() => 'hello'),
  bye: t.procedure.mutation(() => 'działa'),
});

const app = express();

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({ router: appRouter, createContext }),
);

// Wersja gdzie api znajduje się na serwerze lokalnym, dla komunikacji w drugą stronę wystarczy podmienić port
app.listen(8080);
