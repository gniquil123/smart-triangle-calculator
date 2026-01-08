import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Modify the top header to reduce height
content = content.replace(/<div className={`\${themeColors.header} border-b px-6 py-4 flex items-center justify-between shadow-sm z-10`}>/g,
  '<div className={`\${themeColors.header} border-b px-4 py-2 flex items-center justify-between shadow-sm z-10`}>');

// Modify the bottom status bar to reduce height
content = content.replace(/<div className={`\${themeColors.header} border-t px-6 py-3 flex items-center justify-between text-sm`}>/g,
  '<div className={`\${themeColors.header} border-t px-4 py-1.5 flex items-center justify-between text-xs`}>');

// Save the changes
fs.writeFileSync(appPath, content);
console.log('App.tsx modified successfully!');