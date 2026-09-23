import { writeFile } from 'node:fs/promises';

import { BrowserWindow, dialog, ipcMain, shell } from 'electron';

import { IpcChannel } from '../../../shared/ipc';
import { parseDeliverPdfExportRequest } from '../../../shared/print';
import { renderDeliverPdf } from '../app/pdf-export';

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

// Only paths this session actually wrote via exportPdf may be opened —
// deliverOpenExportedFile must not become an arbitrary shell.openPath proxy.
const exportedFilePaths = new Set<string>();

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
    exportedFilePaths.add(result.filePath);
    return result.filePath;
  });

  ipcMain.handle(IpcChannel.deliverOpenExportedFile, async (_event, filePath: unknown) => {
    if (typeof filePath !== 'string' || !exportedFilePaths.has(filePath)) {
      return false;
    }
    const error = await shell.openPath(filePath);
    return error === '';
  });
};
