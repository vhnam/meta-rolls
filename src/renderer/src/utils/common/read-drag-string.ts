export const readDragString = (value: unknown, key: string) => {
  if (value === null || typeof value !== 'object') {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  return typeof record[key] === 'string' ? record[key] : undefined;
};
