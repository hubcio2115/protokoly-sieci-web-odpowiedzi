import readline from 'readline';
import { readFileSync } from 'fs';
import { stdin as input, stdout as output } from 'process';
import Client from 'ssh2-sftp-client';

const config = {
  host: '10.211.55.3',
  username: 'hkowalski',
  privateKey: readFileSync('/Users/hubertkowalski/.ssh/arch_vm'),
};

const sftp = new Client('client');

const rl = readline.createInterface({ input, output });

const program = () => {
  rl.question(
    'Choose what direction you want to copy the directory\n"1" for remote to local with file name\n"2" for local to remote with file name\n(default=1):',
    (option) => {
      if (!['', '1', '2'].includes(option)) program();

      const [computerOne, computerTwo] =
        option === '' || option === '1'
          ? ['remote', 'local']
          : ['local', 'remote'];

      rl.question(`${computerOne} path: `, (pathOne) => {
        rl.question(`${computerTwo} path: `, (pathTwo) => {
          (async () => {
            try {
              await sftp.connect(config);

              option === '2'
                ? await sftp.fastPut(pathOne, pathTwo)
                : await sftp.fastGet(pathOne, pathTwo);

              process.exit();
            } catch (e) {
              console.error(e);
            }
          })();
        });
      });
    },
  );
};

program();
