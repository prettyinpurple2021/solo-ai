const { spawn } = require('child_process');

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(cmd, ['drizzle-kit', 'generate'], { stdio: ['pipe', 'inherit', 'inherit'] });

child.on('error', (err) => {
  console.error('Spawn failed:', err);
  process.exit(1);
});

const interval = setInterval(() => {
  try {
    if (child.stdin && child.stdin.writable) {
      child.stdin.write('\n');
    } else {
      clearInterval(interval);
    }
  } catch (err) {
    console.error("Interval error:", err);
    clearInterval(interval);
  }
}, 500);

child.on('exit', (code) => {
  clearInterval(interval);
  process.exit(code === null ? 1 : code);
});
