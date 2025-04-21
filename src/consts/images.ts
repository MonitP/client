import cardGrid from '../assets/images/card_grid.svg';
import listView from '../assets/images/list_view.svg';
import detail from '../assets/images/detail.svg';
import home from '../assets/images/home.svg';
import notification from '../assets/images/notification.svg';
import notificationEnabled from '../assets/images/notification_enable.svg';
import add from '../assets/images/add.svg';
import command from '../assets/images/command.svg';
import close from '../assets/images/close.svg';
import file from '../assets/images/file.svg';
import save from '../assets/images/save.svg';

export const IMAGES = {
  cardGrid,
  listView,
  detail,
  home,
  notification,
  notificationEnabled,
  add,
  command,
  close,
  file,
  save,
} as const;

export type ImageKey = keyof typeof IMAGES; 