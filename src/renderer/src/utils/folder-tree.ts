import { FOLDER_TREE_DEPTH_STEP, FOLDER_TREE_PADDING_START } from '#/constants/media';

export const folderTreePaddingLeft = (depth: number) =>
  FOLDER_TREE_PADDING_START + depth * FOLDER_TREE_DEPTH_STEP;
