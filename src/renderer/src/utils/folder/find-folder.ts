import { type PhotoFolder } from '#/types';

export const isFolderInPath = (folderId: string, selectedFolderId: string): boolean => {
  if (!folderId || !selectedFolderId) {
    return false;
  }
  if (selectedFolderId === folderId) {
    return true;
  }
  const separator = folderId.includes('\\') ? '\\' : '/';
  const prefix = folderId.endsWith(separator) ? folderId : `${folderId}${separator}`;
  return selectedFolderId.startsWith(prefix);
};

export const folderPathDepth = (folderId: string) => folderId.split(/[/\\]/).filter(Boolean).length;

export const folderAncestorIds = (folderId: string, volumeId: string): string[] => {
  if (!isFolderInPath(volumeId, folderId)) {
    return [];
  }
  if (folderId === volumeId) {
    return [volumeId];
  }

  const separator = volumeId.includes('\\') ? '\\' : '/';
  const volumePrefix = volumeId.endsWith(separator) ? volumeId : `${volumeId}${separator}`;
  const parts = folderId.slice(volumePrefix.length).split(/[/\\]/).filter(Boolean);
  const ids = [volumeId];
  let current = volumeId.endsWith(separator) ? volumeId.slice(0, -1) : volumeId;
  for (const part of parts) {
    current = `${current}${separator}${part}`;
    ids.push(current);
  }
  return ids;
};

export const findFolder = (folders: PhotoFolder[], folderId: string): PhotoFolder | undefined => {
  for (const folder of folders) {
    if (folder.id === folderId) {
      return folder;
    }
    if (folder.children) {
      const match = findFolder(folder.children, folderId);
      if (match) {
        return match;
      }
    }
  }
  return undefined;
};
