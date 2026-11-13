// 서버의 Notice 타입과 같은 모양이에요. (server/src/notice-store.ts)
export type Notice = {
  id: number;
  message: string;
  createdAt: string;
};

/**
 * 화면에 표시할 연결 상태
 * - connecting   : 처음 연결하는 중
 * - open         : 연결됨 (이벤트를 받을 수 있는 상태)
 * - reconnecting : 연결이 끊겨서 브라우저가 다시 접속하려는 중
 * - closed       : 연결이 완전히 닫힘 (브라우저가 더 이상 재접속하지 않음)
 */
export type ConnectionStatus = "connecting" | "open" | "reconnecting" | "closed";
