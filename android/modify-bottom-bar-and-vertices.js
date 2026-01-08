import fs from 'fs';
import path from 'path';

// 1. Update the TriangleCanvas.tsx file to make vertices 3x larger
const canvasPath = path.join(process.cwd(), '..', 'components', 'TriangleCanvas.tsx');
let canvasContent = fs.readFileSync(canvasPath, 'utf8');

// Increase vertex size from w-5 h-5 -ml-2.5 -mt-2.5 to w-15 h-15 -ml-7.5 -mt-7.5
canvasContent = canvasContent.replace('w-5 h-5 -ml-2.5 -mt-2.5', 'w-15 h-15 -ml-7.5 -mt-7.5');

// Increase the text size from text-[8px] to text-[16px]
canvasContent = canvasContent.replace('text-[8px]', 'text-[16px]');

// Save the changes to TriangleCanvas.tsx
fs.writeFileSync(canvasPath, canvasContent);
console.log('Increased vertex size to 3x successfully!');

// 2. Remove the bottom info bar from App.tsx using simple string replacement
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Find the start and end positions of the bottom info bar
const bottomBarStartStr = '<div className={`${themeColors.header} border-t px-4 py-1.5 flex items-center justify-between text-xs`}>';
const bottomBarEndStr = '</div>\n    </div>';

const startIndex = appContent.indexOf(bottomBarStartStr);
const endIndex = appContent.indexOf(bottomBarEndStr, startIndex) + bottomBarEndStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  // Remove the bottom info bar by slicing the string
  const beforeBar = appContent.slice(0, startIndex);
  const afterBar = appContent.slice(endIndex);
  appContent = beforeBar + afterBar;
  
  // Save the changes to App.tsx
  fs.writeFileSync(appPath, appContent);
  console.log('Removed bottom info bar successfully!');
} else {
  console.log('Bottom info bar not found, skipping removal.');
}
