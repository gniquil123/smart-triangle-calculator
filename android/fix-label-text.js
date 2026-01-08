import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Modify the label text according to requirements
// 1. Change '角度 β' to '夹角 β'
// 2. Change lowercase a, b, c to uppercase A, B, C for side labels
const oldLabelLogic = '{key === \'alpha\' ? \'夹角 α\' : key === \'beta\' ? \'角度 β\' : key === \'gamma\' ? \'角度 γ\' : key === \'a\' ? \'公共边 a\' : `边长 ${key}`}';
const newLabelLogic = '{key === \'alpha\' ? \'夹角 α\' : key === \'beta\' ? \'夹角 β\' : key === \'gamma\' ? \'夹角 γ\' : key === \'a\' ? \'公共边 A\' : `边长 ${key.toUpperCase()}`}';

content = content.replace(oldLabelLogic, newLabelLogic);

// Save the changes
fs.writeFileSync(appPath, content);
console.log('Label text modified successfully!');
