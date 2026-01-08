import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Update the input fields to be side by side and smaller
content = content.replace('<div className="space-y-4">', '<div className="grid grid-cols-2 gap-4">');

// 2. Adjust the property panel to give more space to the triangle
content = content.replace('style={{ maxHeight: \'50vh\' }}', 'style={{ maxHeight: \'40vh\' }}');

// 3. Add functionality to toggle structured mode when clicking the structured button again
// We'll use a simpler approach to avoid syntax issues
const oldButtonPattern = 'onClick={() => setMode(CalculationMode.STRUCTURED)}';
const newButtonPattern = 'onClick={() => setMode(prev => prev === CalculationMode.STRUCTURED ? CalculationMode.INTERACTIVE : CalculationMode.STRUCTURED)}';
content = content.replace(oldButtonPattern, newButtonPattern);

// Save the changes
fs.writeFileSync(appPath, content);
console.log('Property panel modified successfully!');
