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
      ram: 'RAM',
      disk: '디스크',
      gpu: 'GPU',
      network: '네트워크',
    },
    detail: {
      title: '서버 상세 정보',
      status: '서버 상태',
      resources: '리소스 사용량',
      processes: '실행 중인 프로세스',
      history: {
        title: '리소스 사용량 추이',
        cpu: 'CPU 사용률',
        ram: 'RAM 사용률',
        gpu: 'GPU 사용률',
        network: '네트워크 사용률'
      }
    },
  },
  notification: {
    types: {
      cpu: 'CPU 사용량',
      ram: 'RAM 사용량',
      connection: '연결 상태',
      default: '일반'
    },
    page: {
      title: '알림',
      searchPlaceholder: '검색하기',
      markAsRead: '읽음 처리',
      markAllAsRead: '모두 읽음 처리',
      noNotifications: '알림이 없습니다.',
      deleteAll: '알림 모두 삭제',
    },
    delete: {
      success: '알림이 삭제되었습니다.',
      error: '알림 삭제에 실패했습니다.',
      all: {
        success: '모든 알림이 삭제되었습니다.',
        error: '알림 전체 삭제에 실패했습니다.',
      },
    },
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
      avgRAM: {
        title: '평균 RAM 사용량',
        description: '전체 서버 평균'
      },
      avgGpu: {
        title: '평균 GPU 사용량',
        description: '전체 서버 평균'
      },
      avgNetwork: {
        title: '평균 네트워크 사용량',
        description: '전체 서버 평균'
      }
    },
    issues: {
      title: '문제 발생 서버',
      stats: {
        cpu: 'CPU',
        ram: 'RAM',
        disk: '디스크',
        gpu: 'GPU',
        network: '네트워크'
      },
      noIssues: '문제가 발생한 서버가 없습니다.',
      noServers: '등록한 서버가 없습니다.',
    },
    warnings: {
      title: '경고 상태 서버',
      noWarnings: '경고 상태의 서버가 없습니다.'
    },
    stoppedProcesses: {
      title: '중지된 프로세스',
      noStoppedProcesses: '중지된 프로세스가 없습니다.'
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
      serverCode: {
        label: '서버 코드',
        placeholder: '서버 코드를 입력하세요'
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
  command: {
    title: '명령어 실행',
    selectServer: '서버 선택',
    selectServerPlaceholder: '서버를 선택하세요',
    commandInput: '명령어 입력',
    commandPlaceholder: '실행할 명령어를 입력하세요',
    execute: '실행',
    history: '명령어 실행 기록',
    noHistory: '실행된 명령어가 없습니다.',
    error: {
      empty: '서버와 명령어를 모두 입력해주세요.',
      serverNotFound: '서버를 찾을 수 없습니다.'
    }
  },
  file: {
    page: {
      title: '파일 관리',
      description: '파일 관리 페이지입니다.',
    },
    form: {
      server: '서버 선택',
      selectServer: '서버를 선택하세요',
      filePath: '파일 경로',
      filePathPlaceholder: '다운로드할 파일의 경로를 입력하세요',
      download: '다운로드',
      saveAs: '저장할 파일 이름 (선택)',
      saveAsPlaceholder: '파일 저장할 이름을 입력하세요.',
    },
    error: {
      required: '서버와 파일 경로를 모두 입력해주세요.',
      serverNotFound: '서버를 찾을 수 없습니다.',
      download: '파일 다운로드에 실패했습니다.',
    },
    success: {
      download: '파일이 성공적으로 다운로드되었습니다.',
    },
  },
  mail: {
    page: {
      title: '메일 수신자 관리',
    },
    form: {
      email: {
        label: '이메일 주소',
        placeholder: '이메일 주소를 입력하세요',
      },
      submit: '추가',
    },
    list: {
      title: '등록된 이메일 목록',
      noEmails: '등록된 이메일이 없습니다.',
      delete: '삭제',
    },
    add: {
      success: '이메일이 등록되었습니다.',
      error: '이메일 등록에 실패했습니다.',
    },
    delete: {
      success: '이메일이 삭제되었습니다.',
      error: '이메일 삭제에 실패했습니다.',
    },
    load: {
      error: '메일 목록을 불러오는데 실패했습니다.',
    },
    validation: {
      required: '이메일 주소를 입력해주세요.',
      invalid: '올바른 이메일 주소를 입력해주세요.',
    },
  },
  log: {
    page: {
      title: '로그',
    },
    form: {
      server: '서버 선택',
    },
    list: {
      title: '로그 목록',
      noLogs: '로그가 없습니다.',
    },
    filter: {
      all: '전체',
      type: '타입',
      searchPlaceholder: '로그 내용 검색',
    },
    type: {
      error: '오류',
      warning: '경고',
      info: '정보',
    },
    pagination: {
      loading: '로딩 중...',
      total: '총 {total}개의 로그 중 {start} - {end}',
      prev: '이전',
      next: '다음',
    },
  },
  nav: {
    title: '서버 모니터링',
    servers: '서버',
    notification: '알림',
    mail: '메일',
    log: '로그',
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