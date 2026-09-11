import { useMemo, useState } from 'react';
import { MediaFileList } from '#/modules/media/media-file-list';
import { MediaFolderTree } from '#/modules/media/media-folder-tree';
import { MediaGrid } from '#/modules/media/media-grid';
import { MediaLibraries } from '#/modules/media/media-libraries';
import { MediaPreview } from '#/modules/media/media-preview';
import { MediaToolbar } from '#/modules/media/media-toolbar';
import { PHOTO_FOLDERS, PHOTO_ITEMS, findFolder } from '#/modules/media/media-data';

const MediaScreen = () => {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [zoom, setZoom] = useState(31);
  const [selectedFolderId, setSelectedFolderId] = useState('macintosh-hd');
  const [selectedLibraryId, setSelectedLibraryId] = useState('all');
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

  const gridPhotos = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const searched = PHOTO_ITEMS.filter((photo) => photo.name.toLowerCase().includes(needle));
    if (selectedLibraryId === 'recent') {
      return searched.slice(-3);
    }
    if (selectedLibraryId === 'favorites' || selectedLibraryId === 'keywords') {
      return [];
    }
    return searched;
  }, [query, selectedLibraryId]);

  const visiblePhotos = view === 'list' ? listPhotos : gridPhotos;
  const selectedPhotoIdIsVisible =
    selectedPhotoId !== null &&
    (listPhotos.some((photo) => photo.id === selectedPhotoId) ||
      gridPhotos.some((photo) => photo.id === selectedPhotoId));
  const activePhotoId = selectedPhotoIdIsVisible
    ? selectedPhotoId
    : (listPhotos[0]?.id ?? gridPhotos[0]?.id ?? null);
  const selectedPhoto =
    listPhotos.find((photo) => photo.id === activePhotoId) ??
    gridPhotos.find((photo) => photo.id === activePhotoId) ??
    null;

  const selectRelative = (offset: number) => {
    if (visiblePhotos.length === 0) {
      return;
    }
    const currentIndex = visiblePhotos.findIndex((photo) => photo.id === activePhotoId);
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + offset + visiblePhotos.length) % visiblePhotos.length;
    setSelectedPhotoId(visiblePhotos[nextIndex].id);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex min-h-0 flex-[1.15] border-b border-border">
        <div className="flex min-h-0 min-w-0 flex-[1.25] flex-col">
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
        <MediaPreview
          photo={selectedPhoto}
          onPrevious={() => selectRelative(-1)}
          onNext={() => selectRelative(1)}
        />
      </div>
      <div className="flex min-h-0 flex-1">
        <MediaLibraries selectedId={selectedLibraryId} onSelect={setSelectedLibraryId} />
        <MediaGrid
          photos={gridPhotos}
          selectedPhotoId={activePhotoId}
          onSelectPhoto={setSelectedPhotoId}
          zoom={zoom}
        />
      </div>
    </div>
  );
};

export default MediaScreen;
