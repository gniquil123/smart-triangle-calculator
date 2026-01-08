import fs from 'fs';
import path from 'path';

// Read the package.json file
const packagePath = path.join(process.cwd(), '..', 'package.json');
let content = fs.readFileSync(packagePath, 'utf8');

// Update version from 0.0.0 to 0.0.1
content = content.replace('"version": "0.0.0"', '"version": "0.0.1"');

// Save the changes
fs.writeFileSync(packagePath, content);
console.log('Version updated successfully!');
