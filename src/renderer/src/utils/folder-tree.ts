import { FOLDER_TREE_DEPTH_STEP, FOLDER_TREE_PADDING_START } from '#/constants/media';
import { type PhotoFolder } from '#/types';

export const folderTreePaddingLeft = (depth: number) =>
  FOLDER_TREE_PADDING_START + depth * FOLDER_TREE_DEPTH_STEP;

export const folderTreeChildren = (folder: PhotoFolder): PhotoFolder[] | null => {
  const hasChildren = folder.hasChildren ?? Boolean(folder.children?.length);
  if (!hasChildren) {
    return null;
  }
  return folder.children ?? [];
};
