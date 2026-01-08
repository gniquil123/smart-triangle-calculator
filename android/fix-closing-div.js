import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Fix the missing closing div tag
const oldEnding = '      </div>\n\n      \n  );';
const newEnding = '      </div>\n    </div>\n  );';

content = content.replace(oldEnding, newEnding);

// Save the changes
fs.writeFileSync(appPath, content);
console.log('Fixed missing closing div tag in App.tsx!');
