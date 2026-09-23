import { registerAlbumsIpc } from './albums';
import { registerDeliverIpc } from './deliver';
import { registerMediaIpc } from './media';
import { registerRollsIpc } from './rolls';
import { registerSettingsIpc } from './settings';
import { registerWindowIpc } from './window';

export const registerAllIpcHandlers = () => {
  registerSettingsIpc();
  registerMediaIpc();
  registerAlbumsIpc();
  registerWindowIpc();
  registerDeliverIpc();
  registerRollsIpc();
};
