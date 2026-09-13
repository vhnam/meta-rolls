import { registerAlbumsIpc } from './albums';
import { registerMediaIpc } from './media';
import { registerSettingsIpc } from './settings';
import { registerWindowIpc } from './window';

export const registerAllIpcHandlers = () => {
  registerSettingsIpc();
  registerMediaIpc();
  registerAlbumsIpc();
  registerWindowIpc();
};
