import fs from 'fs';
import path from 'path';

// Read the App.tsx file
const appPath = path.join(process.cwd(), '..', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Move the zoom control to the far left and bottom
const oldZoomPosition = 'absolute bottom-20 left-8 md:bottom-8';
const newZoomPosition = 'absolute bottom-4 left-4';

content = content.replace(oldZoomPosition, newZoomPosition);

// Save the changes to App.tsx
fs.writeFileSync(appPath, content);
console.log('Moved zoom controls to left edge and bottom!');

// Update Android styles for fullscreen mode without status bar
const stylesPath = path.join(process.cwd(), 'app', 'src', 'main', 'res', 'values', 'styles.xml');
let stylesContent = fs.readFileSync(stylesPath, 'utf8');

// Ensure fullscreen theme hides status bar completely
const fullscreenThemeStart = '<style name="AppTheme.Fullscreen" parent="AppTheme.NoActionBar">';
const fullscreenThemeEnd = '</style>';

const fullscreenThemeIndex = stylesContent.indexOf(fullscreenThemeStart);
if (fullscreenThemeIndex !== -1) {
  const fullscreenThemeEndIndex = stylesContent.indexOf(fullscreenThemeEnd, fullscreenThemeIndex);
  if (fullscreenThemeEndIndex !== -1) {
    const oldFullscreenTheme = stylesContent.slice(fullscreenThemeIndex, fullscreenThemeEndIndex + fullscreenThemeEnd.length);
    const newFullscreenTheme = `    <style name="AppTheme.Fullscreen" parent="AppTheme.NoActionBar">
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
        <item name="android:windowTranslucentStatus">false</item>
        <item name="android:windowTranslucentNavigation">false</item>
        <item name="android:fitsSystemWindows">false</item>
        <item name="android:windowDrawsSystemBarBackgrounds">false</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
    </style>`;
    
    stylesContent = stylesContent.replace(oldFullscreenTheme, newFullscreenTheme);
    fs.writeFileSync(stylesPath, stylesContent);
    console.log('Updated fullscreen theme to hide status bar completely!');
  }
}
