import fs from 'fs';
import path from 'path';

// Read the package.json file
const packagePath = path.join(process.cwd(), '..', 'package.json');
let content = fs.readFileSync(packagePath, 'utf8');

// Update version from 0.0.3 to 0.0.4
content = content.replace('"version": "0.0.3"', '"version": "0.0.4"');

// Save the changes
fs.writeFileSync(packagePath, content);
console.log('Version updated successfully from 0.0.3 to 0.0.4!');
