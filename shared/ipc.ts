export const IpcChannel = {
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  settingsRemove: 'settings:remove',
  mediaListVolumes: 'media:list-volumes',
  mediaListFolder: 'media:list-folder',
  mediaReadExif: 'media:read-exif',
  menuOpenPreferences: 'menu:open-preferences'
} as const;
