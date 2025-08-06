#!/usr/bin/env node

/**
 * Deployment preparation script for MEDILY
 * This script ensures the application is ready for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Preparing MEDILY for deployment...\n');

async function checkBuild() {
  console.log('1. Checking build configuration...');
  
  // Check if dist directory exists
  const distDir = path.join(projectRoot, 'dist');
  if (!fs.existsSync(distDir)) {
    console.log('   Building application...');
    try {
      await execPromise('npm run build', { cwd: projectRoot });
      console.log('   ✅ Build completed successfully');
    } catch (error) {
      console.error('   ❌ Build failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('   ✅ Build directory exists');
  }
}

async function prepareStaticFiles() {
  console.log('2. Preparing static files...');
  
  try {
    await execPromise('node scripts/post-build.js', { cwd: projectRoot });
    console.log('   ✅ Static files prepared for production');
  } catch (error) {
    console.error('   ❌ Failed to prepare static files:', error.message);
    process.exit(1);
  }
}

function checkEnvironmentVariables() {
  console.log('3. Checking environment variables...');
  
  const requiredVars = ['DATABASE_URL'];
  const optionalVars = ['PORT', 'NODE_ENV'];
  
  let hasAllRequired = true;
  
  console.log('   Required variables:');
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing (required for production)`);
      hasAllRequired = false;
    }
  }
  
  console.log('   Optional variables:');
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ⚠️  ${varName} will use default value`);
    }
  }
  
  if (!hasAllRequired) {
    console.log('\n❌ Missing required environment variables. Please set them before deployment.');
    return false;
  }
  
  return true;
}

function checkProductionFiles() {
  console.log('4. Verifying production files...');
  
  const requiredFiles = [
    'dist/index.js',
    'server/public/index.html',
    'server/public/assets'
  ];
  
  let allFilesExist = true;
  
  for (const filePath of requiredFiles) {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${filePath} exists`);
    } else {
      console.log(`   ❌ ${filePath} missing`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

function displayDeploymentInstructions() {
  console.log('\n📋 Deployment Instructions:');
  console.log('   1. Ensure all required environment variables are set as production secrets');
  console.log('   2. The application will start with: NODE_ENV=production node dist/index.js');
  console.log('   3. The server will listen on PORT environment variable (defaults to 5000)');
  console.log('   4. Database migrations will run automatically on startup');
  console.log('   5. Static files are served from server/public/ directory');
  console.log('\n🌐 Environment Variables Needed:');
  console.log('   - DATABASE_URL (required): PostgreSQL connection string');
  console.log('   - PORT (optional): Server port (default: 5000)');
  console.log('   - NODE_ENV (recommended): Set to "production"');
}

async function main() {
  try {
    await checkBuild();
    await prepareStaticFiles();
    
    const envCheck = checkEnvironmentVariables();
    const filesCheck = checkProductionFiles();
    
    console.log('\n📊 Deployment Readiness Summary:');
    console.log(`   Build: ✅ Complete`);
    console.log(`   Static Files: ✅ Prepared`);
    console.log(`   Environment Variables: ${envCheck ? '✅ Ready' : '❌ Missing Required Variables'}`);
    console.log(`   Production Files: ${filesCheck ? '✅ All Present' : '❌ Missing Files'}`);
    
    if (envCheck && filesCheck) {
      console.log('\n🎉 Application is ready for deployment!');
      displayDeploymentInstructions();
    } else {
      console.log('\n⚠️  Please fix the issues above before deploying.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Deployment preparation failed:', error.message);
    process.exit(1);
  }
}

main();