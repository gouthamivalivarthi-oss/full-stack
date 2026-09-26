const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const frontendDist = path.join(frontendDir, 'dist');
const rootDist = path.join(rootDir, 'dist');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('======================================================================');
console.log('  🚀 Full-Stack Monorepo Vercel & Production Build');
console.log('======================================================================\n');

try {
  console.log('📦 Step 1: Installing frontend dependencies...');
  execSync(`${npmCmd} install`, { cwd: frontendDir, stdio: 'inherit', shell: true });

  console.log('\n⚙️ Step 2: Running Vite build with ThreeUI Kage Landing Page...');
  execSync(`${npmCmd} run build`, { cwd: frontendDir, stdio: 'inherit', shell: true });

  console.log('\n📁 Step 3: Mirroring frontend/dist -> ./dist for Vercel Output Directory...');
  if (fs.existsSync(frontendDist)) {
    fs.mkdirSync(rootDist, { recursive: true });
    fs.cpSync(frontendDist, rootDist, { recursive: true });
    const items = fs.readdirSync(rootDist);
    console.log(`✓ Successfully mirrored to ./dist (${items.length} root items: ${items.join(', ')})`);
  } else {
    throw new Error('frontend/dist was not produced by Vite build.');
  }

  console.log('\n======================================================================');
  console.log('  ✓ Production build completed successfully!');
  console.log('======================================================================');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
