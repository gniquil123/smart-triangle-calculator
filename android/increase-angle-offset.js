import fs from 'fs';
import path from 'path';

// Read the TriangleCanvas.tsx file
const canvasPath = path.join(process.cwd(), '..', 'components', 'TriangleCanvas.tsx');
let content = fs.readFileSync(canvasPath, 'utf8');

// Increase the angle label offset from 22px to 66px (3x larger)
content = content.replace('return { x: p.x + (dirX / magDir) * 22, y: p.y + (dirY / magDir) * 22, value: state.angles[i], index: i };', 
                         'return { x: p.x + (dirX / magDir) * 66, y: p.y + (dirY / magDir) * 66, value: state.angles[i], index: i };');

// Save the changes
fs.writeFileSync(canvasPath, content);
console.log('Increased angle label offset to 3x the original size!');
