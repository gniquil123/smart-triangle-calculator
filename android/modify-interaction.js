import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Remove the INTERACTIVE mode button, keep only STRUCTURED mode button
content = content.replace(`          <div className={\`flex p-1 rounded-lg \${isDark ? 'bg-slate-800' : 'bg-slate-100'}\`}>
            <button onClick={() => setMode(CalculationMode.INTERACTIVE)} className={\`px-3 py-1.5 rounded-md text-sm font-medium transition-all \${mode === CalculationMode.INTERACTIVE ? (isDark ? 'bg-slate-700 text-blue-400' : 'bg-white shadow-sm text-blue-600') : 'text-slate-500 hover:text-slate-700'}\`}>交互模式</button>
            <button onClick={() => setMode(CalculationMode.STRUCTURED)} className={\`px-3 py-1.5 rounded-md text-sm font-medium transition-all \${mode === CalculationMode.STRUCTURED ? (isDark ? 'bg-slate-700 text-blue-400' : 'bg-white shadow-sm text-blue-600') : 'text-slate-500 hover:text-slate-700'}\`}>录入模式</button>
          </div>`, 
          `<div className={\`flex p-1 rounded-lg \${isDark ? 'bg-slate-800' : 'bg-slate-100'}\`}>
            <button onClick={() => setMode(CalculationMode.STRUCTURED)} className={\`px-3 py-1.5 rounded-md text-sm font-medium transition-all \${mode === CalculationMode.STRUCTURED ? (isDark ? 'bg-slate-700 text-blue-400' : 'bg-white shadow-sm text-blue-600') : 'text-slate-500 hover:text-slate-700'}\`}>录入模式</button>
          </div>`);

// 2. Add onClick event to the main content area to switch back to INTERACTIVE mode when clicking on blank area
content = content.replace(`      <div className={\`flex-1 relative transition-all duration-300\`} style={{ backgroundImage: \`radial-gradient(\${themeColors.grid} 1px, transparent 1px)\`, backgroundSize: '24px 24px' }}>`, 
      `<div className={\`flex-1 relative transition-all duration-300\`} style={{ backgroundImage: \`radial-gradient(\${themeColors.grid} 1px, transparent 1px)\`, backgroundSize: '24px 24px' }} onClick={(e) => {
        // Check if the click was on a blank area (not on any interactive element)
        if (e.target === e.currentTarget) {
          setMode(CalculationMode.INTERACTIVE);
        }
      }}>`);

// Save the changes
fs.writeFileSync(appPath, content);
console.log('Interaction mode modified successfully!');
