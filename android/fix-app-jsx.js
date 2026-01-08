import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Fix the JSX structure by adding the missing closing div tag
// The issue is that we removed the bottom bar but didn't fix the closing tags

// First, let's see what we have at the end of the file
const endOfFile = content.slice(content.length - 200);
console.log('Current end of file:', endOfFile);

// Fix the structure by ensuring we have the proper closing tags
// We need to replace the invalid structure with the correct one

// Find the position of the last return statement
const returnIndex = content.lastIndexOf('return (');
const beforeReturn = content.slice(0, returnIndex);
const afterReturn = content.slice(returnIndex);

// The afterReturn should contain the complete JSX structure
// Let's reconstruct it with proper closing tags
const fixedAfterReturn = `return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden transition-colors duration-300 ${themeColors.bg} relative`}>
      <div className={`${themeColors.header} border-b px-4 py-2 flex items-center justify-between shadow-sm z-10`}>
        <h1 className="text-xl font-bold">三角形计算器</h1>
        
        <div className="flex items-center gap-3">
          {/* Theme Mode Toggle */}
          <button 
            onClick={() => setThemeMode(prev => prev === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT)}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <div className={`flex p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
             <select 
               value={colorTheme} 
               onChange={(e) => setColorTheme(e.target.value as ColorTheme)}
               className="bg-transparent text-sm font-medium px-2 py-1 outline-none cursor-pointer"
             >
               <option value={ColorTheme.STANDARD}>默认色彩</option>
               <option value={ColorTheme.DEUTERANOPIA}>红绿色盲</option>
               <option value={ColorTheme.TRITANOPIA}>蓝黄色盲</option>
             </select>
          </div>

          <div className={`flex p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <button onClick={() => setMode(prev => prev === CalculationMode.STRUCTURED ? CalculationMode.INTERACTIVE : CalculationMode.STRUCTURED)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === CalculationMode.STRUCTURED ? (isDark ? 'bg-slate-700 text-blue-400' : 'bg-white shadow-sm text-blue-600') : 'text-slate-500 hover:text-slate-700'}`}>录入模式</button>
          </div>
          <button onClick={reset} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>重置</button>
        </div>
      </div>

      <div className={`flex-1 relative transition-all duration-300`} style={{ backgroundImage: `radial-gradient(${themeColors.grid} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} onClick={(e) => {
        // Check if the click was on a blank area (not on any interactive element)
        if (e.target === e.currentTarget) {
          setMode(CalculationMode.INTERACTIVE);
        }
      }}>
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-100 border border-red-200 text-red-600 rounded-full font-medium shadow-lg animate-bounce">
            {error}
          </div>
        )}

        <TriangleCanvas 
          state={triangle} zoom={zoom} viewVersion={viewVersion} interactive={mode === CalculationMode.INTERACTIVE}
          onUpdateValue={handleInteractiveInput} onVertexDrag={handleVertexDrag} themeColors={themeColors} isDark={isDark}
        />

        {/* 缩放控制按钮组，位置在左侧 */}
        <div className={`absolute bottom-20 left-8 md:bottom-8 z-20 flex flex-col items-center gap-2 backdrop-blur-md p-3 rounded-2xl shadow-xl border ${themeColors.panel}`}>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">缩放</span>
          
          <div className="flex flex-col items-center gap-2">
            {/* 放大按钮 */}
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 10, MAX_ZOOM))}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} shadow-lg active:scale-95`}
            >
              <span className="text-lg font-bold" style={{ color: themeColors.side }}>+</span>
            </button>
            
            {/* 当前缩放百分比 */}
            <span className="text-sm font-mono opacity-80 whitespace-nowrap">{Math.round(zoom)}%</span>
            
            {/* 缩小按钮 */}
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 10, MIN_ZOOM))}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} shadow-lg active:scale-95`}
            >
              <span className="text-lg font-bold" style={{ color: themeColors.side }}>-</span>
            </button>
            
            {/* 重置按钮 */}
            <button 
              onClick={() => setZoom(100)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} shadow-lg active:scale-95`}
              title="重置缩放"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ color: themeColors.side }}>
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* 属性录入面板，调整位置和大小，更适合横屏 */}
        {mode === CalculationMode.STRUCTURED && (
          <div className={`absolute z-20 md:right-8 md:top-1/2 md:-translate-y-1/2 md:w-96 bottom-0 left-0 right-0 w-full z-20 backdrop-blur-lg border rounded-3xl shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto ${themeColors.panel}`} style={{ maxHeight: '40vh' }}>
            <div>
              <h2 className="text-lg font-bold mb-4">属性录入</h2>
              <div className={`flex gap-2 p-1 rounded-xl mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button onClick={() => setStructuredType(StructuredType.SAS)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${structuredType === StructuredType.SAS ? (isDark ? 'bg-slate-700' : 'bg-white shadow-sm') : 'opacity-60'}`} style={{ color: structuredType === StructuredType.SAS ? themeColors.side : undefined }}>边角边</button>
                <button onClick={() => setStructuredType(StructuredType.ASA)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${structuredType === StructuredType.ASA ? (isDark ? 'bg-slate-700' : 'bg-white shadow-sm') : 'opacity-60'}`} style={{ color: structuredType === StructuredType.ASA ? themeColors.side : undefined }}>角边角</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(structuredType === StructuredType.SAS ? ['b', 'alpha', 'c'] : ['beta', 'a', 'gamma']).map((key) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                      {key === 'alpha' ? '夹角 α' : key === 'beta' ? '角度 β' : key === 'gamma' ? '角度 γ' : key === 'a' ? '公共边 a' : `边长 ${key}`}
                    </label>
                    <input 
                      type="number" value={((structuredType === StructuredType.SAS ? sas : asa) as any)[key]} onFocus={(e) => e.target.select()}
                      onChange={(e) => structuredType === StructuredType.SAS ? setSas({...sas, [key]: Number(e.target.value)}) : setAsa({...asa, [key]: Number(e.target.value)})}
                      className={`w-full mt-1 px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all text-lg font-mono ${themeColors.input}`}
                      style={{ focusRingColor: themeColors.side } as any}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleStructuredCalculate}
              className="mt-auto w-full py-4 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95"
              style={{ backgroundColor: themeColors.side }}
            >
              计算三角形
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;`;

// Combine the fixed parts
const fixedContent = beforeReturn + fixedAfterReturn;

// Save the fixed content
fs.writeFileSync(appPath, fixedContent);
console.log('App.tsx JSX structure fixed successfully!');
