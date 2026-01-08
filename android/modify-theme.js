import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Modify the theme colors to use light green for triangle sides and angles
content = content.replace(/return \{ side: isDark \? '#60a5fa' : '#3b82f6', angle: isDark \? '#fb923c' : '#f97316' \};/g,
  'return { side: \'#10b981\', angle: \'#10b981\' };');

// Save the changes
fs.writeFileSync(appPath, content);
console.log('Theme colors modified successfully!');
