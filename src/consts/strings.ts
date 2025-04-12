export const STRINGS = {
  server: {
    status: {
      connected: '연결됨',
      disconnected: '연결 끊김',
    },
    process: {
      running: '실행 중',
      stopped: '중지됨',
    },
    resources: {
      cpu: 'CPU',
      ram: 'RAM',
      disk: 'D드라이브',
    },
  },
} as const;

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type StringKey = NestedKeyOf<typeof STRINGS> | string;

export const getString = (path: StringKey): string => {
  const keys = path.split('.');
  return keys.reduce((obj: any, key) => obj[key], STRINGS) as string;
}; 