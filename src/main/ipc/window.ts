import { app, BrowserWindow, ipcMain } from 'electron';

import { IpcChannel } from '../../../shared/ipc';

const photoFullScreenWindows = new WeakSet<BrowserWindow>();

const windowFromEvent = (event: Electron.IpcMainInvokeEvent) =>
  BrowserWindow.fromWebContents(event.sender);

const listenForLeaveFullScreen = (window: BrowserWindow) => {
  window.on('leave-full-screen', () => {
    photoFullScreenWindows.delete(window);
    window.webContents.send(IpcChannel.windowLeaveFullScreen);
  });
};

export const registerWindowIpc = () => {
  for (const window of BrowserWindow.getAllWindows()) {
    listenForLeaveFullScreen(window);
  }

  app.on('browser-window-created', (_, window) => {
    listenForLeaveFullScreen(window);
  });

  ipcMain.handle(IpcChannel.windowSetFullScreen, (event, enabled: unknown) => {
    if (typeof enabled !== 'boolean') {
      throw new Error('Full screen flag must be a boolean');
    }

    const window = windowFromEvent(event);
    if (!window) {
      return;
    }

    if (enabled) {
      if (!window.isFullScreen()) {
        photoFullScreenWindows.add(window);
        window.setFullScreen(true);
      }
      return;
    }

    if (photoFullScreenWindows.has(window) && window.isFullScreen()) {
      photoFullScreenWindows.delete(window);
      window.setFullScreen(false);
    }
  });
};
