import { join } from 'path';
import { pathToFileURL } from 'url';

import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { app, shell, BrowserWindow } from 'electron';

import { APP_ICON_PATH } from './app/icon';
import { handleMediaProtocol, registerMediaScheme } from './app/media-protocol';
import { APP_NAME, setupAppMenu } from './app/menu';
import { registerAllIpcHandlers } from './ipc';
import { closeAppDatabase } from './services/app-database';
import { endExifTool } from './services/exif-reader';

registerMediaScheme();
app.setName(APP_NAME);

const icon = APP_ICON_PATH;

// Only honor a remote-debugging request in development — accepting it from a
// packaged app's environment would let anything on the machine attach a
// devtools protocol client and drive the renderer/main process.
if (is.dev && process.env['REMOTE_DEBUGGING_PORT']) {
  app.commandLine.appendSwitch('remote-debugging-port', process.env['REMOTE_DEBUGGING_PORT']);
}

const isExternalHttpUrl = (url: string): boolean => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

const rendererEntryPath = join(__dirname, '../renderer/index.html');
const rendererEntryPathname = pathToFileURL(rendererEntryPath).pathname;

const isAppNavigationUrl = (url: string): boolean => {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    return url.startsWith(process.env['ELECTRON_RENDERER_URL']);
  }
  // Scope to the app's own built index.html specifically — allowing any
  // file: URL would let a compromised renderer navigate to arbitrary local
  // files (e.g. file:///etc/passwd) instead of just reloading itself.
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'file:' && parsed.pathname === rendererEntryPathname;
  } catch {
    return false;
  }
};

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    // Below this the resizable browser/preview/albums panels have nowhere
    // left to shrink into and start overlapping/clipping their content.
    minWidth: 760,
    minHeight: 480,
    show: false,
    fullscreenable: true,
    autoHideMenuBar: process.platform !== 'darwin',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  void mainWindow.webContents.setVisualZoomLevelLimits(1, 1);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (isExternalHttpUrl(details.url)) {
      shell.openExternal(details.url);
    }
    return { action: 'deny' };
  });

  // Block in-page navigation to anything but the app's own renderer entry —
  // a compromised/loaded remote page could otherwise navigate the window
  // itself instead of going through setWindowOpenHandler.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAppNavigationUrl(url)) {
      event.preventDefault();
    }
  });

  // Load the Vite dev server URL in development, or the built HTML file in production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(rendererEntryPath);
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
  closeAppDatabase();
  void endExifTool();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
