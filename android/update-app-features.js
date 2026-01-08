import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the root directory of the project
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appFilePath = path.join(rootDir, 'App.tsx');

// Read the current App.tsx content
let appContent = fs.readFileSync(appFilePath, 'utf8');

console.log('开始修改App.tsx文件...');

// 1. 添加localStorage记忆功能 - 修改useState初始值
appContent = appContent.replace(
  /const \[colorTheme, setColorTheme\] = useState<ColorTheme>\(ColorTheme\.STANDARD\);\n  const \[themeMode, setThemeMode\] = useState<ThemeMode>\(ThemeMode\.LIGHT\);/, 
  `const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
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
  }, [themeMode]);`
);

// 2. 修改APP标题
appContent = appContent.replace(
  /<h1 className="text-xl font-bold">三角形计算器<\/h1>/,
  '<h1 className="text-xl font-bold">三角计算器</h1>'
);

// 3. 修改"录入模式"按钮文本为"录入"
appContent = appContent.replace(
  /录入模式/,
  '录入'
);

// 4-6. 修改录入模式下的夹角标签
appContent = appContent.replace(
  /夹角 A/,
  '夹角 α'
);
appContent = appContent.replace(
  /夹角 B/,
  '夹角 β'
);
appContent = appContent.replace(
  /夹角 C/,
  '夹角 γ'
);

// Write the updated content back to the file
fs.writeFileSync(appFilePath, appContent, 'utf8');

console.log('App.tsx文件修改完成！');
console.log('已实现的功能：');
console.log('1. 添加了localStorage记忆功能，保存色盲模式和深色模式设置');
console.log('2. 修改APP标题为"三角计算器"');
console.log('3. 将"录入模式"按钮文本改为"录入"');
console.log('4. 将录入模式下的"夹角 A"改为"夹角 α"');
console.log('5. 将录入模式下的"夹角 B"改为"夹角 β"');
console.log('6. 将录入模式下的"夹角 C"改为"夹角 γ"');