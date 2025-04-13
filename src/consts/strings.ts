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
      memory: '메모리',
      disk: '디스크',
    },
    detail: {
      title: '서버 상세 정보',
      status: '서버 상태',
      resources: '리소스 사용량',
      processes: '실행 중인 프로세스',
      history: {
        title: '리소스 사용량 추이 (24시간)',
        cpu: 'CPU 사용량 (%)',
        memory: '메모리 사용량 (%)'
      }
    },
  },
  home: {
    summary: {
      totalServers: '전체 서버',
      connectedServers: '정상 서버',
      disconnectedServers: '장애 서버',
      totalProcesses: '전체 프로세스',
      unit: '대',
    },
    resources: {
      title: '시스템 리소스 현황',
      avgCpu: {
        title: '평균 CPU 사용률',
        description: '전체 서버 평균'
      },
      avgMemory: {
        title: '평균 메모리 사용량',
        description: '전체 서버 평균'
      }
    },
    issues: {
      title: '문제 발생 서버',
      stats: {
        cpu: 'CPU',
        memory: '메모리'
      },
      noIssues: '문제가 발생한 서버가 없습니다.'
    },
    warnings: {
      title: '경고 상태 서버',
      noWarnings: '경고 상태의 서버가 없습니다.'
    }
  }
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