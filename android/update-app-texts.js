import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the root directory of the project
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('开始修改应用文本...');

// 1. 修改TriangleCanvas.tsx中的边长标签，将小写字母改为大写字母
const triangleCanvasPath = path.join(rootDir, 'components', 'TriangleCanvas.tsx');
let canvasContent = fs.readFileSync(triangleCanvasPath, 'utf8');

canvasContent = canvasContent.replace(
  /\{\['a', 'b', 'c'\]\[i\]\} = \{l\.value\.toFixed\(2\)\}/,
  `{['A', 'B', 'C'][i]} = {l.value.toFixed(2)}`
);

fs.writeFileSync(triangleCanvasPath, canvasContent, 'utf8');
console.log('✓ TriangleCanvas.tsx 已修改：边长标签改为大写字母');

// 2. 修改App.tsx中的标题和按钮文本
const appFilePath = path.join(rootDir, 'App.tsx');
let appContent = fs.readFileSync(appFilePath, 'utf8');

// 修改标题
appContent = appContent.replace(
  /<h1 className="text-xl font-bold">三角计算器<\/h1>/,
  '<h1 className="text-xl font-bold">三角形计算器</h1>'
);

// 修改按钮文本
appContent = appContent.replace(
  /录入<\/button>/,
  '录入模式</button>'
);

fs.writeFileSync(appFilePath, appContent, 'utf8');
console.log('✓ App.tsx 已修改：标题和按钮文本已更新');

console.log('所有文本修改已完成！');
