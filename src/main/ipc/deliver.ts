import { writeFile } from 'node:fs/promises';

import { BrowserWindow, dialog, ipcMain, shell } from 'electron';

import { IpcChannel } from '../../../shared/ipc';
import { parseDeliverPdfExportRequest } from '../../../shared/print';
import { renderDeliverPdf } from '../services/pdf-export';

const windowFromEvent = (event: Electron.IpcMainInvokeEvent) =>
  BrowserWindow.fromWebContents(event.sender);

const toPdfStem = (name: string) => {
  const stem = name
    .trim()
    .replace(/[<>:"/\\|?*]/g, ' ')
    .split('')
    .map((char) => (char.charCodeAt(0) < 32 ? ' ' : char))
    .join('')
    .replace(/\s+/g, ' ')
    .slice(0, 80);
  return stem.length > 0 ? stem : 'Album';
};

export const registerDeliverIpc = () => {
  ipcMain.handle(IpcChannel.deliverExportPdf, async (event, payload: unknown) => {
    const request = parseDeliverPdfExportRequest(payload);
    if (!request) {
      throw new Error('PDF export request is invalid');
    }

    const parentWindow = windowFromEvent(event);
    const saveOptions = {
      title: 'Export PDF',
      defaultPath: `${toPdfStem(request.albumName)}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    };
    const result = parentWindow
      ? await dialog.showSaveDialog(parentWindow, saveOptions)
      : await dialog.showSaveDialog(saveOptions);
    if (result.canceled || !result.filePath) {
      return null;
    }

    const pdf = await renderDeliverPdf(request);
    await writeFile(result.filePath, pdf);
    return result.filePath;
  });

  ipcMain.handle(IpcChannel.deliverOpenExportedFile, async (_event, filePath: unknown) => {
    if (typeof filePath !== 'string') {
      return false;
    }
    const error = await shell.openPath(filePath);
    return error === '';
  });
};
