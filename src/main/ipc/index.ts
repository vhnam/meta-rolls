import { registerAlbumsIpc } from './albums';
import { registerMediaIpc } from './media';
import { registerSettingsIpc } from './settings';

export const registerAllIpcHandlers = () => {
  registerSettingsIpc();
  registerMediaIpc();
  registerAlbumsIpc();
};
