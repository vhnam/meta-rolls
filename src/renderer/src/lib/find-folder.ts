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
