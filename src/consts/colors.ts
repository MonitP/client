export const COLORS = {
    main: '#4A78DC',
    black: '#000000',
    // 서버 상태 색상
    red: '#EF4444',
    amber: '#F59E0B',
    emerald: '#10B981',
    gray: '#E5E7EB',
    darkGray: '#374151',
  } as const;
  

  export const getColor = {
    text: (color: keyof typeof COLORS) => `text-[${COLORS[color]}]`,
    bg: (color: keyof typeof COLORS) => `bg-[${COLORS[color]}]`,
    border: (color: keyof typeof COLORS) => `border-[${COLORS[color]}]`,
  } as const;
  
  export type ColorKey = keyof typeof COLORS; 