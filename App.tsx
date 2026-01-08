
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  TriangleState, 
  CalculationMode, 
  HistoryEntry, 
  StructuredType,
  Point,
  ColorTheme,
  ThemeMode
} from './types';
import { 
  DEFAULT_TRIANGLE, 
  MIN_ZOOM,
  MAX_ZOOM,
  BASE_PIXELS_PER_UNIT
} from './constants';
import { 
  isValidTriangle, 
  calculateAnglesFromSides, 
  generateVertices, 
  solveSAS, 
  degToRad, 
  getDistance,
  updateStateFromVertices
} from './utils/geometry';
import TriangleCanvas from './components/TriangleCanvas';

const App: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>(CalculationMode.INTERACTIVE);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('colorTheme');
    return saved ? (saved as ColorTheme) : ColorTheme.STANDARD;
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return saved ? (saved as ThemeMode) : ThemeMode.LIGHT;
  });

  // Save theme settings to localStorage
  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);
  const [triangle, setTriangle] = useState<TriangleState>(DEFAULT_TRIANGLE);
  const [zoom, setZoom] = useState(100); 
  const [viewVersion, setViewVersion] = useState(0); 
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  const [sas, setSas] = useState({ b: 10, alpha: 60, c: 10 });
  const [asa, setAsa] = useState({ beta: 60, a: 10, gamma: 60 });
  const [structuredType, setStructuredType] = useState<StructuredType>(StructuredType.SAS);

  const isDark = themeMode === ThemeMode.DARK;

  // Theme-specific colors and UI styles
  const themeColors = useMemo(() => {
    const palette = (() => {
      switch (colorTheme) {
        case ColorTheme.DEUTERANOPIA:
          return { side: '#0072B2', angle: isDark ? '#FFF200' : '#E69F00' };
        case ColorTheme.TRITANOPIA:
          return { side: '#009E73', angle: '#CC79A7' };
        default:
          return { side: '#10b981', angle: '#10b981' };
      }
    })();

    return {
      ...palette,
      bg: isDark ? 'bg-slate-950' : 'bg-slate-50',
      panel: isDark ? 'bg-slate-900/90 border-slate-700 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-800',
      header: isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-b text-slate-800',
      input: isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
      grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
    };
  }, [colorTheme, themeMode, isDark]);

  useEffect(() => {
    if (structuredType === StructuredType.SAS) {
      setSas({
        b: Number(triangle.sides[1].toFixed(2)),
        alpha: Number(triangle.angles[0].toFixed(1)),
        c: Number(triangle.sides[2].toFixed(2))
      });
    } else {
      setAsa({
        beta: Number(triangle.angles[1].toFixed(1)),
        a: Number(triangle.sides[0].toFixed(2)),
        gamma: Number(triangle.angles[2].toFixed(1))
      });
    }
  }, [triangle, structuredType]);

  const autoFitZoom = useCallback((vertices: Point[]) => {
    // Check if we're in portrait mode
    const isPortrait = window.innerHeight > window.innerWidth;
    
    // Adjust margin based on orientation
    const margin = isPortrait ? 60 : 80;
    
    // Calculate available space considering orientation and mode
    let availableWidth = window.innerWidth;
    let availableHeight = window.innerHeight - 80;
    
    if (isPortrait && mode === CalculationMode.STRUCTURED) {
      // In portrait mode, property panel is at bottom, so reduce height available for triangle
      availableHeight = window.innerHeight - 320;
    } else if (!isPortrait && mode === CalculationMode.STRUCTURED) {
      // In landscape mode, property panel is at right, so reduce width available for triangle
      availableWidth = window.innerWidth - 384;
    }
    
    const minX = Math.min(...vertices.map(v => v.x));
    const maxX = Math.max(...vertices.map(v => v.x));
    const minY = Math.min(...vertices.map(v => v.y));
    const maxY = Math.max(...vertices.map(v => v.y));
    
    const triWidth = maxX - minX || 1;
    const triHeight = maxY - minY || 1;
    
    // Calculate zoom based on available space
    const targetPPU = Math.min((availableWidth - margin * 2) / triWidth, (availableHeight - margin * 2) / triHeight);
    const newZoomPercent = (targetPPU / BASE_PIXELS_PER_UNIT) * 100;
    setZoom(Math.max(MIN_ZOOM, Math.min(newZoomPercent, MAX_ZOOM)));
  }, [mode]);

  const reset = useCallback(() => {
    setTriangle(DEFAULT_TRIANGLE);
    setHistory([]);
    setError(null);
    setZoom(100);
    setViewVersion(v => v + 1);
  }, []);

  const validateAndUpdate = useCallback((newSides: number[], fixedVertexIndex: number = 0) => {
    const [a, b, c] = newSides;
    if (isValidTriangle(a, b, c)) {
      const angles = calculateAnglesFromSides(a, b, c);
      const standardVertices = generateVertices(a, b, c);
      const oldPos = triangle.vertices[fixedVertexIndex];
      const newStandardPos = standardVertices[fixedVertexIndex];
      const shiftX = oldPos.x - newStandardPos.x;
      const shiftY = oldPos.y - newStandardPos.y;
      const adjustedVertices = standardVertices.map(v => ({ x: v.x + shiftX, y: v.y + shiftY }));
      setTriangle({ sides: newSides, angles, vertices: adjustedVertices });
      setError(null);
      return true;
    } else {
      setError('不满足组成三角形的条件');
      return false;
    }
  }, [triangle.vertices]);

  const handleInteractiveInput = useCallback((entry: HistoryEntry) => {
    const last = history[history.length - 1];
    const newSides = [...triangle.sides];
    const anchorIndex = entry.index;
    if (!last) {
      if (entry.type === 'side') {
        newSides[entry.index] = entry.value;
        if (validateAndUpdate(newSides, anchorIndex)) setHistory([entry]);
      } else {
        const angleIdx = entry.index;
        const newOppSide = solveSAS(triangle.sides[(angleIdx + 1) % 3], triangle.sides[(angleIdx + 2) % 3], entry.value);
        newSides[angleIdx] = newOppSide;
        if (validateAndUpdate(newSides, anchorIndex)) setHistory([entry]);
      }
      return;
    }
    const h1 = last;
    const h2 = entry;
    if (h1.type === 'side' && h2.type === 'side') {
      const otherSIdx = [0, 1, 2].find(i => i !== h1.index && i !== h2.index)!;
      const angleBetween = triangle.angles[[0, 1, 2].find(i => i !== h1.index && i !== h2.index)!];
      newSides[h1.index] = h1.value;
      newSides[h2.index] = h2.value;
      newSides[otherSIdx] = solveSAS(h1.value, h2.value, angleBetween);
      if (validateAndUpdate(newSides, anchorIndex)) setHistory([h1, h2]);
    } else if (h1.type === 'angle' && h2.type === 'angle') {
      const a3Val = 180 - h1.value - h2.value;
      if (a3Val > 0) {
        const commonSideIdx = [0, 1, 2].find(i => i !== h1.index && i !== h2.index)!;
        const ratio = triangle.sides[commonSideIdx] / Math.sin(degToRad(a3Val));
        newSides[h1.index] = ratio * Math.sin(degToRad(h1.value));
        newSides[h2.index] = ratio * Math.sin(degToRad(h2.value));
        if (validateAndUpdate(newSides, anchorIndex)) setHistory([h1, h2]);
      } else setError('角度之和必须小于 180°');
    } else {
      const sideEntry = h1.type === 'side' ? h1 : h2;
      const angleEntry = h1.type === 'angle' ? h1 : h2;
      if (sideEntry.index !== angleEntry.index) {
        const otherAdjSideIdx = [0, 1, 2].find(i => i !== angleEntry.index && i !== sideEntry.index)!;
        newSides[angleEntry.index] = solveSAS(sideEntry.value, triangle.sides[otherAdjSideIdx], angleEntry.value);
        newSides[sideEntry.index] = sideEntry.value;
        if (validateAndUpdate(newSides, anchorIndex)) setHistory([h1, h2]);
      } else {
        if (h2.type === 'angle') {
          const adj1 = (angleEntry.index + 1) % 3;
          const adj2 = (angleEntry.index + 2) % 3;
          newSides[angleEntry.index] = solveSAS(triangle.sides[adj1], triangle.sides[adj2], angleEntry.value);
          if (validateAndUpdate(newSides, anchorIndex)) setHistory([h1, h2]);
        } else {
          const ratio = sideEntry.value / Math.sin(degToRad(triangle.angles[angleEntry.index]));
          newSides[angleEntry.index] = sideEntry.value;
          newSides[(angleEntry.index + 1) % 3] = ratio * Math.sin(degToRad(triangle.angles[(angleEntry.index + 1) % 3]));
          newSides[(angleEntry.index + 2) % 3] = ratio * Math.sin(degToRad(triangle.angles[(angleEntry.index + 2) % 3]));
          if (validateAndUpdate(newSides, anchorIndex)) setHistory([h1, h2]);
        }
      }
    }
  }, [history, triangle, validateAndUpdate]);

  const handleStructuredCalculate = useCallback(() => {
    let newSides: number[] = [];
    if (structuredType === StructuredType.SAS) {
      if (sas.alpha >= 180 || sas.alpha <= 0) { setError('角度必须在 0 到 180 之间'); return; }
      newSides = [solveSAS(sas.b, sas.c, sas.alpha), sas.b, sas.c]; 
    } else {
      const alpha = 180 - asa.beta - asa.gamma;
      if (alpha <= 0) { setError('角度之和必须小于 180°'); return; }
      const ratio = asa.a / Math.sin(degToRad(alpha));
      newSides = [asa.a, ratio * Math.sin(degToRad(asa.beta)), ratio * Math.sin(degToRad(asa.gamma))];
    }
    if (isValidTriangle(newSides[0], newSides[1], newSides[2])) {
      const vertices = generateVertices(newSides[0], newSides[1], newSides[2]);
      setTriangle({ sides: newSides, angles: calculateAnglesFromSides(newSides[0], newSides[1], newSides[2]), vertices });
      autoFitZoom(vertices); setViewVersion(v => v + 1); setError(null);
    } else setError('不满足组成三角形的条件');
  }, [structuredType, sas, asa, autoFitZoom]);

  const handleVertexDrag = useCallback((newVertices: Point[]) => {
    const newState = updateStateFromVertices(newVertices);
    if (isValidTriangle(newState.sides[0], newState.sides[1], newState.sides[2])) { setTriangle(newState); setError(null); } 
    else setError('不满足组成三角形的条件');
  }, []);

  return (
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
        <div className={`absolute bottom-4 left-4 z-20 flex flex-col items-center gap-2 backdrop-blur-md p-3 rounded-2xl shadow-xl border ${themeColors.panel}`}>
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
                      {key === 'alpha' ? '夹角 α' : key === 'beta' ? '夹角 β' : key === 'gamma' ? '夹角 γ' : key === 'a' ? '公共边 A' : `边长 ${key.toUpperCase()}`}
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

export default App;
