import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

type ConfigFile = Record<string, unknown>;

const isEnoent = (error: unknown) =>
  Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT');

const readConfig = async (filePath: string): Promise<ConfigFile> => {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ConfigFile;
    }
    return {};
  } catch (error) {
    if (isEnoent(error)) {
      return {};
    }
    throw error;
  }
};

const writeConfig = async (filePath: string, config: ConfigFile) => {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
};

export const getConfigItem = async (filePath: string, name: string): Promise<string | null> => {
  const config = await readConfig(filePath);
  if (!(name in config)) {
    return null;
  }
  const value = config[name];
  return typeof value === 'string' ? value : JSON.stringify(value);
};

export const setConfigItem = async (
  filePath: string,
  name: string,
  value: string
): Promise<void> => {
  const config = await readConfig(filePath);
  try {
    config[name] = JSON.parse(value);
  } catch {
    config[name] = value;
  }
  await writeConfig(filePath, config);
};

export const removeConfigItem = async (filePath: string, name: string): Promise<void> => {
  const config = await readConfig(filePath);
  if (!(name in config)) {
    return;
  }
  delete config[name];
  await writeConfig(filePath, config);
};
