import cardGrid from '../assets/images/card_grid.svg';
import listView from '../assets/images/list_view.svg';

export const IMAGES = {
  cardGrid,
  listView,
} as const;

export type ImageKey = keyof typeof IMAGES; 