import chalk from 'chalk';
import inquirer from 'inquirer';

import type { AppRouter } from 'server/src/index';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { printBoard } from './utils.js';
import { PointValue } from 'server/src/types.js';

process.removeAllListeners('warning');

(async () => {
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

  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000',
      }),
    ],
  });

  const startGame = async () => {
    await inquirer.prompt({
      name: 'starGame',
      type: 'input',
      message: 'Press enter to start a game...',
    });

    return client.startGame.query();
  };

  const game = await startGame();

  const gameOn = async (game: { id: string; board: PointValue[][] }) => {
    printBoard(game.board);

    const move = await inquirer.prompt({
      name: 'type',
      type: 'list',
      message: 'What to do?',
      choices: ['move', 'remove move', 'move move'],
    });

    const index = await inquirer
      .prompt({
        name: 'index',
        type: 'input',
        message: 'On which index you want to do that?',
      })
      .then((answer) => answer.index);

    if (move.type === 'move') {
      try {
        const turn = await client.turn.query({
          id: game.id,
          move: parseInt(index),
        });

        if (typeof turn === 'string') {
          console.log(turn);
          return;
        }

        await gameOn(turn);
      } catch (e) {
        console.log();
        // @ts-ignore
        console.error(e.shape.message!);
        await gameOn(game);
      }
    } else if (move.type === 'remove move') {
      const deleteMove = await client.deleteMove.query({
        id: game.id,
        move: parseInt(index),
      });

      await gameOn(deleteMove);
    } else if (move.type === 'move move') {
      const newIndex = await inquirer
        .prompt({
          name: 'newIndex',
          type: 'input',
          message: 'Where to put it?',
        })
        .then((answer) => answer.newIndex);

      const moveMove = await client.moveMove.query({
        id: game.id,
        coords: parseInt(index),
        newCoords: parseInt(newIndex),
      });

      await gameOn(moveMove);
    }
  };
  await gameOn(game);

  console.log(await client.endGame.query(game.id));
})();
