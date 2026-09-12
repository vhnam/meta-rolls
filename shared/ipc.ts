export const IpcChannel = {
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  settingsRemove: 'settings:remove',
  mediaListVolumes: 'media:list-volumes',
  mediaListFolder: 'media:list-folder',
  mediaReadExif: 'media:read-exif',
  albumsList: 'albums:list',
  albumsCreate: 'albums:create',
  albumsRename: 'albums:rename',
  albumsRemove: 'albums:remove',
  menuOpenPreferences: 'menu:open-preferences'
} as const;
