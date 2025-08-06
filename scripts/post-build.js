#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Copy built assets from dist/public to server/public for deployment
const sourceDir = path.join(projectRoot, 'dist', 'public');
const targetDir = path.join(projectRoot, 'server', 'public');

console.log('Post-build: Copying static assets for production deployment...');

try {
  // Ensure source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory does not exist: ${sourceDir}`);
    process.exit(1);
  }

  // Create target directory if it doesn't exist
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy all files from source to target
  function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    
    if (stats.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src);
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry);
        const destPath = path.join(dest, entry);
        copyRecursive(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  copyRecursive(sourceDir, targetDir);
  console.log('Post-build: Static assets copied successfully');
  console.log(`Files available in: ${targetDir}`);
  
} catch (error) {
  console.error('Post-build: Failed to copy static assets:', error);
  process.exit(1);
}