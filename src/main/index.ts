import { join } from 'path';

import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { app, shell, BrowserWindow } from 'electron';

import { APP_ICON_PATH } from './app/icon';
import { handleMediaProtocol, registerMediaScheme } from './app/media-protocol';
import { APP_NAME, setupAppMenu } from './app/menu';
import { registerAllIpcHandlers } from './ipc';
import { endExifTool } from './services/exif-reader';

registerMediaScheme();
app.setName(APP_NAME);

const icon = APP_ICON_PATH;

if (process.env['REMOTE_DEBUGGING_PORT']) {
  app.commandLine.appendSwitch('remote-debugging-port', process.env['REMOTE_DEBUGGING_PORT']);
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: process.platform !== 'darwin',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  void mainWindow.webContents.setVisualZoomLevelLimits(1, 1);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load the Vite dev server URL in development, or the built HTML file in production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  setupAppMenu();
  electronApp.setAppUserModelId('com.electron.meta-rolls');
  if (process.platform === 'darwin') {
    app.dock?.setIcon(icon);
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  registerAllIpcHandlers();
  handleMediaProtocol();

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  void endExifTool();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
