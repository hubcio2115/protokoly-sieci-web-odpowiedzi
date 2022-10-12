import { NodeSSH } from 'node-ssh';
import readline from 'readline';

// Interface necessary for reading inputs in node
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// This line checks if instance of e is of Error object or is it a string and then logs it in the console
const handleError = (e) => {
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
      username: '', // put your username here
      privateKeyPath: '', // put your absolute path to your ssh private sigma key
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
