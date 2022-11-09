import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import fetch from 'node-fetch';

import type { AppRouter } from 'server/src/index';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const welcome = () => {
  console.log(`
  ${chalk.bgYellow('Welcome to a tic-tac-toe game!')}

    ${chalk.bgBlue('How to play?')}
    I'm a process on your computer that communicates with the
    backed that does all the logic for the game.
    If you loose I'll ${chalk.red('DIE!')}
    So please do your best :D

  `);
};

welcome();

const startGame = async () => {
  await inquirer.prompt({
    name: 'starGame',
    type: 'input',
    message: 'Press enter to start a game...',
  });

  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'localhost:3000',
      }),
    ],
  });

  const res = await client.startGame.query();

  console.log(res);
};

await startGame();
