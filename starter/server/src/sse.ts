import type { Request, Response } from "express";
import { getNoticesAfter, type Notice } from "./notice-store.js";

// ─────────────────────────────────────────────────────────────
// 연결된 클라이언트 목록
//   key   : 연결마다 붙이는 번호 (clientId)
//   value : 그 연결의 응답 객체 (res)
// 공지를 보낼 때 이 목록을 돌면서 각 res에 write() 해요.
// ─────────────────────────────────────────────────────────────
const clients = new Map<number, Response>();
let nextClientId = 1;

/** 연결이 끊겼을 때 브라우저가 다시 접속하기까지 기다릴 시간(ms) */
const RETRY_MS = 3000;

/**
 * [TODO 2-1] 공지 하나를 SSE 이벤트 형식으로 써 보내요.
 *
 *   아래 모양이 되도록 res.write()로 써 보세요.
 *
 *   id: 3
 *   event: notice
 *   data: {"id":3,"message":"...","createdAt":"..."}
 *   (빈 줄)
 *
 *   힌트: 각 줄은 \n으로 끝나요. data에는 문자열만 쓸 수 있으니 객체는 JSON.stringify()로 바꿔요.
 */
function sendNotice(res: Response, notice: Notice) {
  // 여기에 작성하세요.
}

/** GET /events : SSE 연결을 열고, 클라이언트가 떠날 때까지 유지해요. */
export function handleEvents(req: Request, res: Response) {
  // [TODO 1-1] 이 응답이 '이벤트 스트림'이라고 알리는 헤더 3개를 설정하고, 헤더를 바로 보내요.
  //   Content-Type: text/event-stream
  //   Cache-Control: no-cache
  //   Connection: keep-alive
  //   힌트: res.set({ ... }), res.flushHeaders()

  // (제공) 연결이 끊기면 RETRY_MS 뒤에 다시 접속하라고 브라우저에게 알려줘요.
  res.write(`retry: ${RETRY_MS}\n\n`);

  // [TODO 4] ⚠️ TODO 1~3을 모두 마친 뒤에 하세요.
  //   재접속이라면, 끊긴 사이에 놓친 공지를 먼저 보내줘요.
  //   - 브라우저는 자동 재접속할 때 마지막으로 받은 이벤트 id를 Last-Event-ID 헤더에 담아 보내요.
  //   - 그 id보다 큰 공지를 sendNotice()로 보내 주세요.
  //   힌트: req.get("Last-Event-ID"), getNoticesAfter(id)
  //   주의: 처음 연결할 때는 이 헤더가 없어요. 헤더 값은 문자열이에요.

  // [TODO 1-2] 연결 번호(clientId)를 하나 발급해서 clients에 등록해요.
  //   힌트: nextClientId++, clients.set()
  //   연결 수를 console.log로 남겨 두면 나중에 확인하기 좋아요.

  // [TODO 1-3] 연결이 닫히면(탭 닫기, 새로고침, 네트워크 끊김 등) clients에서 지워요.
  //   힌트: res.on("close", () => { ... })
}

/** [TODO 2-2] 연결된 모든 클라이언트에게 공지를 보내요. */
export function broadcast(notice: Notice) {
  // 힌트: clients.values()를 돌면서 sendNotice()를 호출해요.
}

// ─────────────────────────────────────────────────────────────
// 아래는 실습 결과를 확인하기 위한 개발용 기능이에요. 수정하지 않아도 돼요.
// ─────────────────────────────────────────────────────────────

/** 현재 열려 있는 SSE 연결 수 */
export function getConnectionCount() {
  return clients.size;
}

/**
 * 열려 있는 모든 SSE 연결을 서버 쪽에서 끊어요. (네트워크 끊김 흉내)
 * 이번 한 번만 재접속 간격을 retryMs로 늘려서, 끊긴 사이에 공지를 올릴 시간을 벌어요.
 */
export function dropAllConnections(retryMs: number) {
  const count = clients.size;
  for (const res of clients.values()) {
    res.write(`retry: ${retryMs}\n\n`);
    res.end();
  }
  return count;
}
