// 공지 저장소 (메모리)
// 실습을 단순하게 하려고 DB 대신 배열에 저장해요.
// 서버를 재시작하면 모든 공지가 사라진다는 점을 기억해 두세요. (교재 5장 '한계' 참고)

export type Notice = {
  id: number; // 1부터 1씩 증가하는 공지 번호. SSE 이벤트의 id로도 그대로 사용해요.
  message: string;
  createdAt: string; // ISO 8601 문자열
};

const notices: Notice[] = [];
let lastId = 0;

/** 새 공지를 저장하고, 저장된 공지를 돌려줘요. */
export function addNotice(message: string): Notice {
  const notice: Notice = {
    id: ++lastId,
    message,
    createdAt: new Date().toISOString(),
  };
  notices.push(notice);
  return notice;
}

/** 저장된 공지 전체를 돌려줘요. */
export function getNotices(): Notice[] {
  return notices;
}

/** id가 afterId보다 큰 공지만 돌려줘요. (놓친 공지를 다시 보낼 때 사용) */
export function getNoticesAfter(afterId: number): Notice[] {
  return notices.filter((notice) => notice.id > afterId);
}
