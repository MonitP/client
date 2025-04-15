export const STRINGS = {
  serverCard: {
    title: '서버 상태 보기',
  },
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
        title: '리소스 사용량 추이',
        cpu: 'CPU 사용률',
        memory: '메모리 사용률'
      }
    },
  },
  notification: {
    types: {
      cpu: 'CPU 사용량',
      memory: '메모리 사용량',
      connection: '연결 상태',
      default: '일반'
    },
    page: {
      title: '알림',
      searchPlaceholder: '서버 이름 또는 내용 검색',
      markAllAsRead: '모두 읽음으로 표시',
      markAsRead: '읽음으로 표시',
      noNotifications: '새로운 알림이 없습니다.',
      noSearchResults: '검색 결과가 없습니다.'
    }
  },
  home: {
    title: '홈',
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
  },
  add: {
    title: '서버 추가',
    form: {
      required: '이 입력란을 작성하세요',
      serverName: {
        label: '서버 이름',
        placeholder: '서버 이름을 입력하세요'
      },
      serverIp: {
        label: '서버 IP',
        placeholder: '서버 IP를 입력하세요',
        error: {
          korean: '한글은 입력할 수 없습니다.'
        }
      },
      port: {
        label: '포트',
        placeholder: '포트를 입력하세요',
        error: {
          number: '숫자만 입력할 수 있습니다.'
        }
      },
      submit: '서버 추가',
      success: '서버가 추가되었습니다.',
    }
  },
  dialog: {
    confirm: '확인',
    cancel: '취소',
  },
  list: {
    edit: '수정',
    delete: '삭제',
    confirmDelete: '정말로 삭제하시겠습니까?',
    serverEdit: '서버 수정',
    editSuccess: '서버가 수정되었습니다.',
    deleteSuccess: '서버가 삭제되었습니다.'
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