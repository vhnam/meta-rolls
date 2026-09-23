import { join } from 'node:path';

import { BrowserWindow, app, dialog, ipcMain } from 'electron';

import { IpcChannel } from '../../../shared/ipc';
import { type GearKind, isRollStatus } from '../../../shared/rolls';
import { isImageFile } from '../services/media-library';
import {
  type CreateRollInput,
  type DevJobInput,
  type FramePatch,
  type GearInput,
  type RollPatch,
  addFrame,
  checkRollScans,
  archiveGear,
  createRolls,
  deleteDevJob,
  deleteRoll,
  linkScans,
  moveFrameScan,
  readSnapshot,
  removeLastFrame,
  saveDevJob,
  saveGear,
  setRollStatus,
  unlinkScans,
  updateFrames,
  updateRoll
} from '../services/roll-store';

const dbPath = () => join(app.getPath('userData'), 'meta-rolls.sqlite');

const assertId = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
};

const assertObject = <T>(value: unknown, label: string): T => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as T;
};

const assertGearKind = (value: unknown): GearKind => {
  if (value !== 'stock' && value !== 'camera' && value !== 'lens') {
    throw new Error('Gear kind must be stock, camera, or lens');
  }
  return value;
};

export const registerRollsIpc = () => {
  ipcMain.handle(IpcChannel.rollsSnapshot, () => readSnapshot(dbPath()));

  ipcMain.handle(IpcChannel.rollsSaveGear, (_event, input: unknown) =>
    saveGear(dbPath(), assertObject<GearInput>(input, 'Gear'))
  );

  ipcMain.handle(
    IpcChannel.rollsArchiveGear,
    (_event, kind: unknown, id: unknown, archived: unknown) =>
      archiveGear(dbPath(), assertGearKind(kind), assertId(id, 'Gear id'), archived === true)
  );

  ipcMain.handle(IpcChannel.rollsCreateRoll, (_event, input: unknown) => {
    const parsed = assertObject<CreateRollInput>(input, 'Roll');
    assertId(parsed.stockId, 'Stock id');
    return createRolls(dbPath(), parsed);
  });

  ipcMain.handle(IpcChannel.rollsUpdateRoll, (_event, rollId: unknown, patch: unknown) =>
    updateRoll(dbPath(), assertId(rollId, 'Roll id'), assertObject<RollPatch>(patch, 'Roll patch'))
  );

  ipcMain.handle(IpcChannel.rollsSetStatus, (_event, rollId: unknown, status: unknown) => {
    if (!isRollStatus(status)) {
      throw new Error('Invalid roll status');
    }
    return setRollStatus(dbPath(), assertId(rollId, 'Roll id'), status);
  });

  ipcMain.handle(IpcChannel.rollsDeleteRoll, (_event, rollId: unknown) =>
    deleteRoll(dbPath(), assertId(rollId, 'Roll id'))
  );

  ipcMain.handle(IpcChannel.rollsSaveDevJob, (_event, input: unknown) => {
    const parsed = assertObject<DevJobInput>(input, 'Dev job');
    assertId(parsed.rollId, 'Roll id');
    return saveDevJob(dbPath(), parsed);
  });

  ipcMain.handle(IpcChannel.rollsDeleteDevJob, (_event, id: unknown) =>
    deleteDevJob(dbPath(), assertId(id, 'Dev job id'))
  );

  ipcMain.handle(IpcChannel.rollsUpdateFrame, (_event, frameIds: unknown, patch: unknown) => {
    if (!Array.isArray(frameIds)) {
      throw new Error('Frame ids must be an array');
    }
    const framePatch = assertObject<FramePatch>(patch, 'Frame patch');
    // Scans are only ever image files; keep a compromised renderer from pointing a frame at anything else.
    if (typeof framePatch.scanPath === 'string' && !isImageFile(framePatch.scanPath)) {
      throw new Error('Scan path is not a recognized image file');
    }
    return updateFrames(
      dbPath(),
      frameIds.map((id) => assertId(id, 'Frame id')),
      framePatch
    );
  });

  ipcMain.handle(IpcChannel.rollsAddFrame, (_event, rollId: unknown) =>
    addFrame(dbPath(), assertId(rollId, 'Roll id'))
  );

  ipcMain.handle(IpcChannel.rollsRemoveFrame, (_event, rollId: unknown) =>
    removeLastFrame(dbPath(), assertId(rollId, 'Roll id'))
  );

  ipcMain.handle(IpcChannel.rollsChooseScanFolder, async (event) => {
    const options = { properties: ['openDirectory' as const], title: 'Choose scan folder' };
    const parent = BrowserWindow.fromWebContents(event.sender);
    const result = parent
      ? await dialog.showOpenDialog(parent, options)
      : await dialog.showOpenDialog(options);
    return result.canceled ? null : (result.filePaths[0] ?? null);
  });

  ipcMain.handle(
    IpcChannel.rollsLinkScans,
    (_event, rollId: unknown, folder: unknown, paths: unknown, addFrames: unknown) => {
      if (!Array.isArray(paths)) {
        throw new Error('Scan paths must be an array');
      }
      const scanPaths = paths.map((path) => assertId(path, 'Scan path'));
      if (!scanPaths.every((path) => isImageFile(path))) {
        throw new Error('Scan path is not a recognized image file');
      }
      return linkScans(
        dbPath(),
        assertId(rollId, 'Roll id'),
        assertId(folder, 'Scan folder'),
        scanPaths,
        addFrames === true
      );
    }
  );

  ipcMain.handle(IpcChannel.rollsUnlinkScans, (_event, rollId: unknown) =>
    unlinkScans(dbPath(), assertId(rollId, 'Roll id'))
  );

  ipcMain.handle(IpcChannel.rollsMoveFrameScan, (_event, fromId: unknown, toId: unknown) =>
    moveFrameScan(dbPath(), assertId(fromId, 'Frame id'), assertId(toId, 'Frame id'))
  );

  ipcMain.handle(IpcChannel.rollsCheckScans, (_event, rollId: unknown) =>
    checkRollScans(dbPath(), assertId(rollId, 'Roll id'))
  );
};
