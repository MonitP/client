export const COLORS = {
    main: '#4A78DC',
    black: '#000000',
  } as const;
  

  export const getColor = {
    text: (color: keyof typeof COLORS) => `text-[${COLORS[color]}]`,
    bg: (color: keyof typeof COLORS) => `bg-[${COLORS[color]}]`,
    border: (color: keyof typeof COLORS) => `border-[${COLORS[color]}]`,
  } as const;
  
  export type ColorKey = keyof typeof COLORS; 