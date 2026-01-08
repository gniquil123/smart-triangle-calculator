import fs from 'fs';
import path from 'path';

// Read the capacitor.config.ts file
const configPath = path.join(process.cwd(), '..', 'capacitor.config.ts');
let content = fs.readFileSync(configPath, 'utf8');

// Update config to include portrait orientation
content = content.replace('const config: CapacitorConfig = {\n  appId: \'com.example.smarttrianglecalculator\',\n  appName: \'smart-triangle-calculator\',\n  webDir: \'dist\'\n};', 
                         'const config: CapacitorConfig = {\n  appId: \'com.example.smarttrianglecalculator\',\n  appName: \'smart-triangle-calculator\',\n  webDir: \'dist\',\n  orientation: \'portrait\'\n};');

// Save the changes
fs.writeFileSync(configPath, content);
console.log('capacitor.config.ts updated successfully!');
