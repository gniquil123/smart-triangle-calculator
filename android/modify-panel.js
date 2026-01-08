import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Modify the property input panel size and position
content = content.replace(/<div className=\`\$\{themeColors.panel\}\` style=\{\{ maxHeight: '80vh' \}\}>/g,
  '<div className={`\${themeColors.panel}`} style={{ maxHeight: '90vh' }}>');

// Save the changes
fs.writeFileSync(appPath, content);
console.log('Property panel modified successfully!');