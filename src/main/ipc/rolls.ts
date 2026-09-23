import { join } from 'node:path';

import { app, ipcMain } from 'electron';

import { IpcChannel } from '../../../shared/ipc';
import { type GearKind, isRollStatus } from '../../../shared/rolls';
import {
  type CreateRollInput,
  type DevJobInput,
  type FramePatch,
  type GearInput,
  type RollPatch,
  addFrame,
  archiveGear,
  createRolls,
  deleteDevJob,
  deleteRoll,
  readSnapshot,
  removeLastFrame,
  saveDevJob,
  saveGear,
  setRollStatus,
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
    return updateFrames(
      dbPath(),
      frameIds.map((id) => assertId(id, 'Frame id')),
      assertObject<FramePatch>(patch, 'Frame patch')
    );
  });

  ipcMain.handle(IpcChannel.rollsAddFrame, (_event, rollId: unknown) =>
    addFrame(dbPath(), assertId(rollId, 'Roll id'))
  );

  ipcMain.handle(IpcChannel.rollsRemoveFrame, (_event, rollId: unknown) =>
    removeLastFrame(dbPath(), assertId(rollId, 'Roll id'))
  );
};
