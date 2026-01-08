import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8', { encoding: 'utf8' });

// Fix the JSX structure by removing the bottom bar and ensuring proper closing tags

// Find the start of the bottom bar
const bottomBarStart = '<div className={`${themeColors.header} border-t px-4 py-1.5 flex items-center justify-between text-xs`}>';
const bottomBarStartIndex = content.indexOf(bottomBarStart);

if (bottomBarStartIndex !== -1) {
  // Find the end of the bottom bar (the closing div tag)
  let bottomBarEndIndex = content.indexOf('</div>', bottomBarStartIndex);
  let divCount = 1;
  
  // Find the matching closing div for the bottom bar
  while (divCount > 0 && bottomBarEndIndex !== -1) {
    bottomBarEndIndex = content.indexOf('</div>', bottomBarEndIndex + 6);
    if (bottomBarEndIndex !== -1) {
      divCount--;
    }
  }
  
  if (bottomBarEndIndex !== -1) {
    // Remove the bottom bar
    const beforeBottomBar = content.slice(0, bottomBarStartIndex);
    const afterBottomBar = content.slice(bottomBarEndIndex + 6);
    
    // Ensure we have proper closing tags for the main div
    const fixedContent = beforeBottomBar + afterBottomBar;
    
    // Save the fixed content
    fs.writeFileSync(appPath, fixedContent);
    console.log('Fixed JSX structure by removing bottom bar!');
  } else {
    console.error('Could not find end of bottom bar');
  }
} else {
  console.error('Could not find bottom bar start');
}
