/*
  Simple preflight environment checker for the frontend workspace.
  Run: node ./scripts/check-environment.js
*/
const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

function checkCommand(cmd) {
  try {
    const out = execSync(`${cmd} --version`, {stdio: 'pipe'}).toString().trim();
    return out;
  } catch (e) {
    return null;
  }
}

console.log('== Frontend preflight check ==');

const node = checkCommand('node');
console.log('node:', node || 'NOT FOUND');

const npm = checkCommand('npm');
console.log('npm:', npm || 'NOT FOUND');

const yarn = checkCommand('yarn');
console.log('yarn:', yarn || 'NOT FOUND (optional)');

const expo = checkCommand('expo');
console.log('expo-cli:', expo || 'NOT FOUND (optional for bare workflow)');

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules');

if (!fs.existsSync(pkgPath)) {
  console.error('Error: package.json not found in frontend/');
  process.exitCode = 2;
} else {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  console.log('package.json found. name:', pkg.name || '(unknown)');
}

console.log('node_modules:', fs.existsSync(nodeModulesPath) ? 'present' : 'missing');

console.log('\nNext steps:');
console.log('  - Run `npm install` or `yarn` inside frontend/ to install dependencies.');
console.log('  - Use `npm run start` or `expo start` to run the app.');
console.log('  - For push notifications, run on a physical device and configure FCM on Android.');
