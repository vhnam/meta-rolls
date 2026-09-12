import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron';

import { IpcChannel } from '../../../shared/ipc';
import { APP_ICON_PATH } from './icon';

export const APP_NAME = 'Meta Rolls';

function openPreferences(): void {
  const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  if (!window) {
    return;
  }

  window.show();
  window.focus();
  window.webContents.send(IpcChannel.menuOpenPreferences);
}

const preferencesMenuItem: MenuItemConstructorOptions = {
  label: 'Preferences',
  accelerator: 'CommandOrControl+,',
  click: openPreferences
};

export function setupAppMenu(): void {
  app.setName(APP_NAME);

  app.setAboutPanelOptions({
    applicationName: APP_NAME,
    applicationVersion: app.getVersion(),
    copyright: 'Copyright © 2026',
    credits: 'Browse photos, manage album layouts, and print Instax.',
    iconPath: APP_ICON_PATH
  });

  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: APP_NAME,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              preferencesMenuItem,
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          } satisfies MenuItemConstructorOptions
        ]
      : []),
    {
      label: 'File',
      submenu: [isMac ? { role: 'close' } : { role: 'quit' }]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' },
    ...(!isMac
      ? [
          {
            label: 'Help',
            submenu: [{ role: 'about' }, { type: 'separator' }, preferencesMenuItem]
          } satisfies MenuItemConstructorOptions
        ]
      : [])
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
