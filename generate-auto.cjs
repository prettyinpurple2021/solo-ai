const { spawn } = require('child_process');
const child = spawn('npx.cmd', ['drizzle-kit', 'generate'], { stdio: ['pipe', 'inherit', 'inherit'] });
const interval = setInterval(() => {
  if (!child.killed) {
    child.stdin.write('\n');
  } else {
    clearInterval(interval);
  }
}, 500);

child.on('exit', () => {
    clearInterval(interval);
    process.exit(0);
});
