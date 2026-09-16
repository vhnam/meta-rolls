import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

type ConfigFile = Record<string, unknown>;

const fileLocks = new Map<string, Promise<void>>();

const isEnoent = (error: unknown) =>
  Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT');

const isPlainObject = (value: unknown): value is ConfigFile =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const parseFirstJsonObject = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) {
    return {};
  }

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(trimmed.slice(0, index + 1));
        } catch {
          return {};
        }
      }
    }
  }

  return {};
};

const withFileLock = async <T>(filePath: string, task: () => Promise<T>): Promise<T> => {
  const previous = fileLocks.get(filePath) ?? Promise.resolve();
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  fileLocks.set(
    filePath,
    previous.then(() => gate)
  );

  await previous;
  try {
    return await task();
  } finally {
    release();
  }
};

const readConfig = async (filePath: string): Promise<ConfigFile> => {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = parseFirstJsonObject(raw);
    return isPlainObject(parsed) ? parsed : {};
  } catch (error) {
    if (isEnoent(error)) {
      return {};
    }
    throw error;
  }
};

const writeConfig = async (filePath: string, config: ConfigFile) => {
  await mkdir(dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  await rename(tempPath, filePath);
};

export const getConfigItem = async (filePath: string, name: string): Promise<string | null> =>
  withFileLock(filePath, async () => {
    const config = await readConfig(filePath);
    if (!(name in config)) {
      return null;
    }
    const value = config[name];
    return typeof value === 'string' ? value : JSON.stringify(value);
  });

export const setConfigItem = async (filePath: string, name: string, value: string): Promise<void> =>
  withFileLock(filePath, async () => {
    const config = await readConfig(filePath);
    try {
      config[name] = JSON.parse(value);
    } catch {
      config[name] = value;
    }
    await writeConfig(filePath, config);
  });

export const removeConfigItem = async (filePath: string, name: string): Promise<void> =>
  withFileLock(filePath, async () => {
    const config = await readConfig(filePath);
    if (!(name in config)) {
      return;
    }
    delete config[name];
    await writeConfig(filePath, config);
  });
