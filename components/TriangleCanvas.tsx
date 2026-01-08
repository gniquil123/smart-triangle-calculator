
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { TriangleState, Point, HistoryEntry } from '../types';
import { getCentroid } from '../utils/geometry';
import { BASE_PIXELS_PER_UNIT } from '../constants';

interface ThemeColors {
  side: string;
  angle: string;
  bg: string;
  panel: string;
  header: string;
  input: string;
  grid: string;
}

interface TriangleCanvasProps {
  state: TriangleState;
  zoom: number; 
  viewVersion: number; 
  interactive: boolean;
  onUpdateValue: (entry: HistoryEntry) => void;
  onVertexDrag: (newVertices: Point[]) => void;
  themeColors: ThemeColors;
  isDark: boolean;
}

const TriangleCanvas: React.FC<TriangleCanvasProps> = ({ 
  state, 
  zoom, 
  viewVersion,
  interactive,
  onUpdateValue,
  onVertexDrag,
  themeColors,
  isDark
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingVertex, setDraggingVertex] = useState<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [editingValue, setEditingValue] = useState<{ type: 'side' | 'angle', index: number, displayValue: number, currentValue: string } | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const hasInitialCentered = useRef(false);

  const scale = useMemo(() => (zoom / 100) * BASE_PIXELS_PER_UNIT, [zoom]);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const centroid = getCentroid(state.vertices);
      setOffset({ 
        x: width / 2 - centroid.x * scale, 
        y: height / 2 - centroid.y * scale 
      });
      hasInitialCentered.current = true;
    }
  }, [viewVersion, scale]);

  const screenPoints = useMemo(() => {
    return state.vertices.map(v => ({
      x: v.x * scale + offset.x,
      y: v.y * scale + offset.y
    }));
  }, [state.vertices, scale, offset]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    lastMousePos.current = { x: clientX, y: clientY };
    if (draggingVertex === null && editingValue === null) setIsPanning(true);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    if (draggingVertex !== null && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = (clientX - rect.left - offset.x) / scale;
      const newY = (clientY - rect.top - offset.y) / scale;
      const newVertices = [...state.vertices];
      newVertices[draggingVertex] = { x: newX, y: newY };
      onVertexDrag(newVertices);
    } else if (isPanning) {
      const dx = clientX - lastMousePos.current.x;
      const dy = clientY - lastMousePos.current.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: clientX, y: clientY };
    }
  };

  const handleMouseUp = () => { setDraggingVertex(null); setIsPanning(false); };

  const labels = useMemo(() => {
    const pts = screenPoints;
    const sideLabels = pts.map((p, i) => ({
      x: (pts[(i + 1) % 3].x + pts[(i + 2) % 3].x) / 2,
      y: (pts[(i + 1) % 3].y + pts[(i + 2) % 3].y) / 2,
      value: state.sides[i], index: i
    }));
    const angleLabels = pts.map((p, i) => {
      const pPrev = pts[(i + 2) % 3], pNext = pts[(i + 1) % 3];
      const v1 = { x: pPrev.x - p.x, y: pPrev.y - p.y }, v2 = { x: pNext.x - p.x, y: pNext.y - p.y };
      const mag1 = Math.sqrt(v1.x**2 + v1.y**2) || 1, mag2 = Math.sqrt(v2.x**2 + v2.y**2) || 1;
      const dirX = (v1.x / mag1 + v2.x / mag2), dirY = (v1.y / mag1 + v2.y / mag2);
      const magDir = Math.sqrt(dirX**2 + dirY**2) || 1;
      // 缩小角度标签偏移量，从45px改为22px，缩小50%
      return { x: p.x + (dirX / magDir) * 66, y: p.y + (dirY / magDir) * 66, value: state.angles[i], index: i };
    });
    return { sideLabels, angleLabels };
  }, [screenPoints, state]);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full relative select-none touch-none overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
      onMouseDown={handleMouseDown} onTouchStart={handleMouseDown} onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchEnd={handleMouseUp}
    >
      <svg className="w-full h-full pointer-events-none">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" /><feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer><feFuncA type="linear" slope={isDark ? "0.4" : "0.2"} /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        
        <path 
          d={`M ${screenPoints[0].x} ${screenPoints[0].y} L ${screenPoints[1].x} ${screenPoints[1].y} L ${screenPoints[2].x} ${screenPoints[2].y} Z`}
          fill={`${themeColors.side}${isDark ? '44' : '22'}`} stroke={themeColors.side} strokeWidth="3" strokeLinejoin="round"
          className="transition-all duration-300 ease-out"
        />

        {screenPoints.map((p, i) => {
          const p1 = screenPoints[(i + 2) % 3], p2 = screenPoints[(i + 1) % 3];
          const a1 = Math.atan2(p1.y - p.y, p1.x - p.x), a2 = Math.atan2(p2.y - p.y, p2.x - p.x);
          // 缩小角度圆弧半径，从35改为17，缩小50%
          const radius = 17;
          const start = { x: p.x + radius * Math.cos(a1), y: p.y + radius * Math.sin(a1) };
          const end = { x: p.x + radius * Math.cos(a2), y: p.y + radius * Math.sin(a2) };
          return <path key={`arc-${i}`} d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`} fill="none" stroke={themeColors.angle} strokeWidth="1.5" strokeDasharray="2 1" className="opacity-60" />;
        })}
      </svg>

      {interactive && screenPoints.map((p, i) => (
        <div key={`vertex-${i}`} className="absolute w-15 h-15 -ml-7.5 -mt-7.5 rounded-full border-2 shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-150 z-10 flex items-center justify-center" style={{ left: p.x, top: p.y, backgroundColor: themeColors.side, borderColor: isDark ? '#1e293b' : 'white' }} onMouseDown={(e) => { e.stopPropagation(); setDraggingVertex(i); }} onTouchStart={(e) => { e.stopPropagation(); setDraggingVertex(i); }}>
          <span className="text-white text-[16px] font-bold uppercase">{['A', 'B', 'C'][i]}</span>
        </div>
      ))}

      {labels.angleLabels.map((l, i) => (
        <div key={`angle-label-${i}`} className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: l.x, top: l.y }}>
          {editingValue?.type === 'angle' && editingValue.index === i ? (
            <input 
              autoFocus type="number" value={editingValue?.currentValue || ''} onFocus={(e) => e.target.select()}
              onChange={(e) => setEditingValue(prev => prev ? { ...prev, currentValue: e.target.value } : null)}
              onBlur={(e) => {
                const newValue = Number(e.target.value);
                // 角度使用 1 位小数比较
                const formattedNewValue = parseFloat(newValue.toFixed(1));
                const formattedDisplayValue = parseFloat(editingValue!.displayValue.toFixed(1));
                if (formattedNewValue !== formattedDisplayValue) {
                  onUpdateValue({ type: 'angle', index: i, value: newValue });
                }
                setEditingValue(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingValue(null); }}
              className={`w-20 h-9 text-center border-2 rounded-xl shadow-lg font-mono text-sm font-bold outline-none ring-4 ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}
              style={{ borderColor: themeColors.angle, ringColor: `${themeColors.angle}33` } as any}
            />
          ) : (
            <button disabled={!interactive} onClick={() => setEditingValue({ type: 'angle', index: i, displayValue: l.value, currentValue: l.value.toFixed(1) })} className={`px-2 py-0.75 backdrop-blur-sm border-1 rounded-lg shadow-sm font-mono text-xs font-bold transition-all ${isDark ? 'bg-slate-900/80' : 'bg-white/90'} ${interactive ? 'hover:scale-110 cursor-pointer' : ''}`} style={{ borderColor: `${themeColors.angle}66`, color: themeColors.angle }}>
              {['α', 'β', 'γ'][i]} {l.value.toFixed(1)}°
            </button>
          )}
        </div>
      ))}

      {labels.sideLabels.map((l, i) => (
        <div key={`side-label-${i}`} className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: l.x, top: l.y }}>
          {editingValue?.type === 'side' && editingValue.index === i ? (
            <input 
              autoFocus type="number" value={editingValue?.currentValue || ''} onFocus={(e) => e.target.select()}
              onChange={(e) => setEditingValue(prev => prev ? { ...prev, currentValue: e.target.value } : null)}
              onBlur={(e) => {
                const newValue = Number(e.target.value);
                // 边长使用 2 位小数比较
                const formattedNewValue = parseFloat(newValue.toFixed(2));
                const formattedDisplayValue = parseFloat(editingValue!.displayValue.toFixed(2));
                if (formattedNewValue !== formattedDisplayValue) {
                  onUpdateValue({ type: 'side', index: i, value: newValue });
                }
                setEditingValue(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingValue(null); }}
              className={`w-20 h-9 text-center border-2 rounded-xl shadow-lg font-mono text-sm font-bold outline-none ring-4 ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}
              style={{ borderColor: themeColors.side, ringColor: `${themeColors.side}33` } as any}
            />
          ) : (
            <button disabled={!interactive} onClick={() => setEditingValue({ type: 'side', index: i, displayValue: l.value, currentValue: l.value.toFixed(2) })} className={`px-2 py-0.75 backdrop-blur-sm border-1 rounded-lg shadow-sm font-mono text-xs font-bold transition-all ${isDark ? 'bg-slate-900/80' : 'bg-white/90'} ${interactive ? 'hover:scale-110 cursor-pointer' : ''}`} style={{ borderColor: `${themeColors.side}66`, color: themeColors.side }}>
              {['a', 'b', 'c'][i]} = {l.value.toFixed(2)}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TriangleCanvas;
