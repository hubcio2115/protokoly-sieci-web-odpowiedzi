import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

(async () => {
  try {
    await ssh.connect({
      host: 'sigma.ug.edu.pl',
      username: 'hkowalski',
      privateKeyPath: '/Users/hubertkowalski/.ssh/sigma',
      port: 22,
    });

    console.log(await ssh.exec('users | tr " "  "\n" | sort -u | wc -l', []));
    process.exit();
  } catch (e) {
    console.error(e);
  }
})();
