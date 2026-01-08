import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Update autoFitZoom function to handle portrait orientation
const oldAutoFit = `  const autoFitZoom = useCallback((vertices: Point[]) => {
    // 调整边距和尺寸，更适合横屏显示
    const margin = 80;
    // 横屏模式下，属性面板放在右侧，所以调整可用宽度
    const width = window.innerWidth - (mode === CalculationMode.STRUCTURED ? 384 : 0);
    // 横屏模式下，高度更充足，所以减少垂直边距
    const height = window.innerHeight - 80;
    
    const minX = Math.min(...vertices.map(v => v.x));
    const maxX = Math.max(...vertices.map(v => v.x));
    const minY = Math.min(...vertices.map(v => v.y));
    const maxY = Math.max(...vertices.map(v => v.y));
    
    const triWidth = maxX - minX || 1;
    const triHeight = maxY - minY || 1;
    
    // 根据横屏宽高比调整缩放
    const targetPPU = Math.min((width - margin * 2) / triWidth, (height - margin * 2) / triHeight);
    const newZoomPercent = (targetPPU / BASE_PIXELS_PER_UNIT) * 100;
    setZoom(Math.max(MIN_ZOOM, Math.min(newZoomPercent, MAX_ZOOM)));
  }, [mode]);`;

const newAutoFit = `  const autoFitZoom = useCallback((vertices: Point[]) => {
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
  }, [mode]);`;

content = content.replace(oldAutoFit, newAutoFit);

// 2. Update property input panel position and size
content = content.replace('absolute right-8 top-1/2 -translate-y-1/2 w-96', 'absolute z-20 md:right-8 md:top-1/2 md:-translate-y-1/2 md:w-96 bottom-0 left-0 right-0 w-full');
content = content.replace('style={{ maxHeight: \'80vh\' }}', 'style={{ maxHeight: \'50vh\' }}');

// 3. Update zoom control position for portrait mode
content = content.replace('bottom-8 left-8', 'bottom-20 left-8 md:bottom-8');

// Save the changes
fs.writeFileSync(appPath, content);
console.log('Responsive design added successfully!');
