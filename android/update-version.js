import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the root directory of the project
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const packageFilePath = path.join(rootDir, 'package.json');

// Read the current package.json content
let packageContent = fs.readFileSync(packageFilePath, 'utf8');
let packageJson = JSON.parse(packageContent);

// Update the version number
const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.').map(Number);
versionParts[2] += 1; // Increment patch version
const newVersion = versionParts.join('.');
packageJson.version = newVersion;

// Write the updated content back to the file
packageContent = JSON.stringify(packageJson, null, 2);
fs.writeFileSync(packageFilePath, packageContent, 'utf8');

console.log(`版本号已从 ${currentVersion} 更新为 ${newVersion}`);
