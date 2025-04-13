import cardGrid from '../assets/images/card_grid.svg';
import listView from '../assets/images/list_view.svg';
import detail from '../assets/images/detail.svg';
import home from '../assets/images/home.svg';
export const IMAGES = {
  cardGrid,
  listView,
  detail,
  home,
} as const;

export type ImageKey = keyof typeof IMAGES; 