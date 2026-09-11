import { useMemo, useState } from 'react';
import { MediaFileList } from '#/modules/media/media-file-list';
import { MediaFolderTree } from '#/modules/media/media-folder-tree';
import { MediaToolbar } from '#/modules/media/media-toolbar';
import { PHOTO_FOLDERS, PHOTO_ITEMS, findFolder } from '#/modules/media/media-data';

const MediaScreen = () => {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [zoom, setZoom] = useState(31);
  const [selectedFolderId, setSelectedFolderId] = useState('macintosh-hd');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>('p1');
  const [folderTreeCollapsed, setFolderTreeCollapsed] = useState(false);

  const selectedFolder = findFolder(PHOTO_FOLDERS, selectedFolderId);
  const childFolders = selectedFolder?.children ?? [];

  const listPhotos = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return PHOTO_ITEMS.filter(
      (photo) => photo.folderId === selectedFolderId && photo.name.toLowerCase().includes(needle)
    );
  }, [query, selectedFolderId]);

  const activePhotoId =
    selectedPhotoId !== null && listPhotos.some((photo) => photo.id === selectedPhotoId)
      ? selectedPhotoId
      : (listPhotos[0]?.id ?? null);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <MediaToolbar
        query={query}
        onQueryChange={setQuery}
        view={view}
        onViewChange={setView}
        zoom={zoom}
        onZoomChange={setZoom}
        folderTreeCollapsed={folderTreeCollapsed}
        onToggleFolderTree={() => setFolderTreeCollapsed((current) => !current)}
        currentFolderName={selectedFolder?.name ?? 'Media Storage'}
      />
      <div className="flex min-h-0 flex-1">
        <MediaFolderTree
          folders={PHOTO_FOLDERS}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          collapsed={folderTreeCollapsed}
        />
        <MediaFileList
          folders={childFolders}
          photos={listPhotos}
          selectedPhotoId={activePhotoId}
          onSelectPhoto={setSelectedPhotoId}
          onSelectFolder={setSelectedFolderId}
        />
      </div>
    </div>
  );
};

export default MediaScreen;
