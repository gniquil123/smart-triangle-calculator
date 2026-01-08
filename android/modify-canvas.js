import fs from 'fs';
import path from 'path';

// Read the TriangleCanvas.tsx file
const canvasPath = path.join(process.cwd(), '..', 'components', 'TriangleCanvas.tsx');
let content = fs.readFileSync(canvasPath, 'utf8');

// Use simple string replacement to modify the triangle path style
content = content.replace('fill={`${themeColors.side}${isDark ? \'33\' : \'1A\'}`} stroke={themeColors.side} strokeWidth="4" strokeLinejoin="round" filter="url(#shadow)"', 
                         'fill={`${themeColors.side}${isDark ? \'44\' : \'22\'}`} stroke={themeColors.side} strokeWidth="3" strokeLinejoin="round"');

// Save the changes
fs.writeFileSync(canvasPath, content);
console.log('TriangleCanvas.tsx modified successfully!');
