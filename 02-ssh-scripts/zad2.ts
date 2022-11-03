import { NodeSSH } from 'node-ssh';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleError = (e: unknown) => {
  const message = e instanceof Error ? e.message : String(e);

  message.split(':')[2] === ' No such file or directory'
    ? console.error('There is no such file on provided path')
    : console.error(message);

  process.exit();
};

const ssh = new NodeSSH();

(async () => {
  try {
    await ssh.connect({
      host: 'sigma.ug.edu.pl',
      username: 'hkowalski',
      privateKeyPath: '/Users/hubertkowalski/.ssh/sigma',
      port: 22,
    });

    rl.question('Please insert the absolute path to the file: ', (filePath) => {
      (async () => {
        try {
          if (!filePath) throw new Error('Path cannot be empty');

          const res = await ssh.exec(`cat ${filePath}`, []);
          console.log(res);
          rl.close();

          process.exit();
        } catch (e) {
          handleError(e);
        }
      })();
    });
  } catch (e) {
    handleError(e);
  }
})();
