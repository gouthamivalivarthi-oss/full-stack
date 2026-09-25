const { spawn, exec } = require('child_process');
const path = require('path');

console.log('======================================================================');
console.log('  🚀 Project Collaboration Platform Dev Servers');
console.log('======================================================================');
console.log('  🌐 Frontend Application : http://localhost:5173');
console.log('  🔌 Backend API Server   : http://localhost:5000');
console.log('  📦 Database             : MongoDB Atlas Cloud Connected');
console.log('======================================================================\n');

const rootDir = path.resolve(__dirname, '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const backend = spawn(process.execPath, [path.join(rootDir, 'backend', 'server.js')], {
  stdio: 'inherit',
  cwd: rootDir,
});

const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  cwd: rootDir,
  shell: process.platform === 'win32',
});

const cleanup = () => {
  console.log('\nShutting down dev servers...');
  if (process.platform === 'win32') {
    if (backend.pid) exec(`taskkill /pid ${backend.pid} /T /F`, () => {});
    if (frontend.pid) exec(`taskkill /pid ${frontend.pid} /T /F`, () => {});
  } else {
    backend.kill();
    frontend.kill();
  }
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

