import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const astroCli = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const child = spawn(process.execPath, [astroCli, 'preview', '--host', '127.0.0.1', '--port', '4322'], {
  env: { ...process.env, ASTRO_PREVIEW_BACKGROUND: '0' },
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
