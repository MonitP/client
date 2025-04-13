import cardGrid from '../assets/images/card_grid.svg';
import listView from '../assets/images/list_view.svg';
import detail from '../assets/images/detail.svg';
import home from '../assets/images/home.svg';
import notification from '../assets/images/notification.svg';
import notificationEnabled from '../assets/images/notification_enable.svg';

export const IMAGES = {
  cardGrid,
  listView,
  detail,
  home,
  notification,
  notificationEnabled,
} as const;

export type ImageKey = keyof typeof IMAGES; 