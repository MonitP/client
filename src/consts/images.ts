import cardGrid from '../assets/images/card_grid.svg';
import listView from '../assets/images/list_view.svg';
import detail from '../assets/images/detail.svg';

export const IMAGES = {
  cardGrid,
  listView,
  detail,
} as const;

export type ImageKey = keyof typeof IMAGES; 