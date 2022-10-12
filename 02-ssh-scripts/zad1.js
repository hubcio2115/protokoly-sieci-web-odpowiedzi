import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

(async () => {
  try {
    await ssh.connect({
      host: 'sigma.ug.edu.pl',
      username: '', // put your username here
      privateKeyPath: '', // put your absolute path to your ssh private sigma key
      port: 22,
    });

    console.log(await ssh.exec('who | cut -d " " -f 1 | uniq | wc -l', []));

    process.exit();
  } catch (e) {
    console.error(e);
  }
})();
