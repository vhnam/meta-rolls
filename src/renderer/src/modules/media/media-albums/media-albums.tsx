import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { cn } from 'cn';
import { useState } from 'react';

import { Button } from '#/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '#/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { type AlbumSchema } from '#/schemas/album.schema';
import { useAlbumStore } from '#/stores/album.store';
import { getActivePhotoId, useMediaPoolStore } from '#/stores/media-pool.store';
import { type Album } from '#/types';
import { toPhotoItem } from '#/utils';

import { MediaAlbumsAlbumDialog } from './media-albums-album-dialog';
import { MediaAlbumsGrid } from './media-albums-grid';
import { MediaAlbumsToolbar } from './media-albums-toolbar';

export const MediaAlbums = () => {
  const store = useMediaPoolStore();
  const albums = useAlbumStore((state) => state.albums);
  const selectedId = useAlbumStore((state) => state.activeAlbumId);
  const view = useAlbumStore((state) => state.view);
  const zoom = useAlbumStore((state) => state.zoom);
  const albumListCollapsed = useAlbumStore((state) => state.albumListCollapsed);
  const onSelect = useAlbumStore((state) => state.setActiveAlbumId);
  const onViewChange = useAlbumStore((state) => state.setView);
  const onZoomChange = useAlbumStore((state) => state.setZoom);
  const onToggleAlbumList = useAlbumStore((state) => state.toggleAlbumList);
  const addAlbum = useAlbumStore((state) => state.addAlbum);
  const renameAlbum = useAlbumStore((state) => state.renameAlbum);
  const removeAlbum = useAlbumStore((state) => state.removeAlbum);
  const currentAlbum = albums.find((album) => album.id === selectedId);
  const albumPhotos = currentAlbum?.photos ?? [];
  const activePhotoId = getActivePhotoId(store, albumPhotos.map(toPhotoItem));
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  const closeAlbumDialog = () => {
    setAlbumDialogOpen(false);
    setEditingAlbum(null);
  };

  const handleAlbumDialogOpenChange = (open: boolean) => {
    if (open) {
      setAlbumDialogOpen(true);
      return;
    }
    closeAlbumDialog();
  };

  const handleSaveAlbum = async (album: AlbumSchema) => {
    if (editingAlbum) {
      await renameAlbum(editingAlbum.id, album.name);
    } else {
      await addAlbum(album.name);
    }
    closeAlbumDialog();
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-border">
      <MediaAlbumsToolbar
        view={view}
        zoom={zoom}
        folderTreeCollapsed={albumListCollapsed}
        onViewChange={onViewChange}
        onZoomChange={onZoomChange}
        onToggleFolderTree={onToggleAlbumList}
      />
      <div className="flex min-h-0 min-w-0 flex-1">
        <aside
          className={cn(
            'flex min-h-0 shrink-0 flex-col border-r border-sidebar-border bg-sidebar',
            albumListCollapsed ? 'hidden' : 'w-52'
          )}
        >
          <div className="flex h-7 shrink-0 items-center justify-end border-b border-border bg-sidebar-accent px-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Add album"
                    onClick={() => {
                      setEditingAlbum(null);
                      setAlbumDialogOpen(true);
                    }}
                  />
                }
              >
                <IconPlus />
              </TooltipTrigger>
              <TooltipContent>
                <p>Add album</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {albums.length > 0 ? (
            <div className="min-h-0 flex-1 scroll-fade overflow-auto py-1">
              {albums.map((item) => (
                <ContextMenu key={item.id}>
                  <ContextMenuTrigger
                    render={
                      <button
                        type="button"
                        className={cn(
                          'flex h-6 w-full items-center px-3 text-left text-[11px] text-sidebar-foreground hover:bg-sidebar-accent',
                          selectedId === item.id
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-muted-foreground hover:text-sidebar-foreground'
                        )}
                        onClick={() => onSelect(item.id)}
                      />
                    }
                  >
                    {item.name}
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        setEditingAlbum(item);
                        setAlbumDialogOpen(true);
                      }}
                    >
                      <IconEdit />
                      Rename album
                    </ContextMenuItem>
                    <ContextMenuItem
                      variant="destructive"
                      onClick={() => void removeAlbum(item.id)}
                    >
                      <IconTrash />
                      Remove album
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sidebar-foreground">
              <p className="text-xs text-muted-foreground">No albums found</p>
            </div>
          )}
        </aside>

        {view === 'grid' && currentAlbum && (
          <MediaAlbumsGrid
            album={currentAlbum}
            photos={albumPhotos}
            selectedPhotoId={activePhotoId}
            onSelectPhoto={store.setSelectedPhotoId}
            zoom={zoom}
          />
        )}
      </div>

      <MediaAlbumsAlbumDialog
        open={albumDialogOpen}
        album={editingAlbum}
        onOpenChange={handleAlbumDialogOpenChange}
        onSaveAlbum={handleSaveAlbum}
      />
    </div>
  );
};
