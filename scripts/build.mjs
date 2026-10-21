import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const portalDir = path.join(rootDir, 'portal');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 [1/3] Building portal React/Vite app...');
execSync('npm --prefix portal run build', { cwd: rootDir, stdio: 'inherit' });

console.log('📁 [2/3] Assembling unified distribution folder...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy root static files
const rootStaticFiles = [
  'index.html',
  'style.css',
  'app.js',
  'projects.json',
  'categories.json',
  'firestore.rules',
];

for (const file of rootStaticFiles) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, file));
  }
}

// Copy assets
const srcAssets = path.join(rootDir, 'assets');
const dstAssets = path.join(distDir, 'assets');
if (fs.existsSync(srcAssets)) {
  fs.cpSync(srcAssets, dstAssets, { recursive: true });
}

// Copy portal build into dist/portal
const srcPortalDist = path.join(portalDir, 'dist');
const dstPortal = path.join(distDir, 'portal');
if (fs.existsSync(srcPortalDist)) {
  fs.cpSync(srcPortalDist, dstPortal, { recursive: true });
}

console.log('✅ [3/3] Build finished successfully! Unified site ready in /dist');
