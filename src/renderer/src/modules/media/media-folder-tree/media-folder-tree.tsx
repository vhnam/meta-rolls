import { cn } from 'cn';

import { type PhotoFolder } from '#/types';

import MediaFolderItem from './media-folder-item';

type MediaFolderTreeProps = {
  folders: PhotoFolder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  collapsed?: boolean;
};

const MediaFolderTree = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  collapsed = false
}: MediaFolderTreeProps) => {
  return (
    <aside
      className={cn(
        'flex min-h-0 shrink-0 flex-col border-inline-end border-sidebar-border bg-sidebar',
        collapsed ? 'hidden' : 'w-52'
      )}
    >
      <div className="min-h-0 flex-1 scroll-fade overflow-auto">
        {folders.map((folder) => (
          <MediaFolderItem
            key={folder.id}
            folder={folder}
            depth={0}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
          />
        ))}
      </div>
    </aside>
  );
};

export default MediaFolderTree;
