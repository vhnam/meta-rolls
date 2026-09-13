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
  albumsAddPhoto: 'albums:add-photo',
  albumsMovePhoto: 'albums:move-photo',
  menuOpenPreferences: 'menu:open-preferences',
  menuTogglePhotoFullscreen: 'menu:toggle-photo-fullscreen',
  windowSetFullScreen: 'window:set-full-screen',
  windowLeaveFullScreen: 'window:leave-full-screen'
} as const;
