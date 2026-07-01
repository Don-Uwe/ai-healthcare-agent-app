import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, '..');

function checkCommand(cmd: string): string | null {
  try {
    return execSync(`${cmd} --version`, {stdio: 'pipe'}).toString().trim();
  } catch {
    return null;
  }
}

console.log('== UltimateHealth frontend preflight ==');

console.log('node:', checkCommand('node') ?? 'NOT FOUND');
console.log('npm:', checkCommand('npm') ?? 'NOT FOUND');
console.log('yarn:', checkCommand('yarn') ?? 'NOT FOUND (optional)');

const pkgPath = path.join(frontendRoot, 'package.json');
const nodeModulesPath = path.join(frontendRoot, 'node_modules');

if (!fs.existsSync(pkgPath)) {
  console.error('Error: package.json not found in frontend/');
  process.exitCode = 2;
} else {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {name?: string};
  console.log('package.json found. name:', pkg.name ?? '(unknown)');
}

console.log('node_modules:', fs.existsSync(nodeModulesPath) ? 'present' : 'missing');
console.log('\nNext steps:');
console.log('  npm install');
console.log('  npm run start');
console.log('  npm run validate (from repository root)');
