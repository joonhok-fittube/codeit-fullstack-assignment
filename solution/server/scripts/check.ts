// ─────────────────────────────────────────────────────────────
// 실습 자동 확인 스크립트
//   서버를 켜 둔 상태(npm run dev)에서, 다른 터미널에서 실행하세요.
//   $ npm run check
//
// 서버 쪽 TODO(1, 2, 4)가 제대로 동작하는지 확인해요.
// 클라이언트 쪽 TODO 3은 브라우저에서 직접 확인해요. (실습 문제의 '완료 조건' 참고)
// 확인 과정에서 '[자동 확인]' 공지가 몇 개 등록돼요. 브라우저에 보여도 놀라지 마세요!
// ─────────────────────────────────────────────────────────────

const BASE_URL = process.env.API_URL ?? "http://localhost:4000";
const TIMEOUT_MS = 2000;

type SseEvent = { id?: string; event: string; data: string };
type Notice = { id: number; message: string; createdAt: string };

/** SSE 스트림에 연결하고, 도착하는 이벤트를 events 배열에 쌓아요. */
async function connect(headers: Record<string, string> = {}) {
  const controller = new AbortController();
  // 응답 헤더가 TIMEOUT_MS 안에 오지 않으면 실패로 봐요.
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const res = await fetch(`${BASE_URL}/events`, { headers, signal: controller.signal });
  clearTimeout(timer);

  const events: SseEvent[] = [];
  readStream(res, events); // 백그라운드에서 계속 읽어요.
  return { res, events, close: () => controller.abort() };
}

/** text/event-stream을 읽어서 이벤트 단위로 나눠요. (빈 줄 = 이벤트 하나 끝) */
async function readStream(res: Response, events: SseEvent[]) {
  if (!res.body) return;
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for await (const chunk of res.body) {
      buffer += decoder.decode(chunk, { stream: true });
      let end: number;
      while ((end = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const event: SseEvent = { event: "message", data: "" };
        const dataLines: string[] = [];
        for (const line of block.split("\n")) {
          if (line === "" || line.startsWith(":")) continue; // 주석은 무시
          const colon = line.indexOf(":");
          const field = colon === -1 ? line : line.slice(0, colon);
          let value = colon === -1 ? "" : line.slice(colon + 1);
          if (value.startsWith(" ")) value = value.slice(1);
          if (field === "id") event.id = value;
          else if (field === "event") event.event = value;
          else if (field === "data") dataLines.push(value);
        }
        if (dataLines.length > 0) {
          event.data = dataLines.join("\n");
          events.push(event);
        }
      }
    }
  } catch {
    // close()로 연결을 끊으면 여기로 와요.
  }
}

async function waitFor(condition: () => boolean | Promise<boolean>) {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    if (await condition()) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
}

async function getConnectionCount(): Promise<number> {
  const res = await fetch(`${BASE_URL}/dev/stats`);
  return (await res.json()).connections;
}

async function postNotice(message: string): Promise<Notice> {
  const res = await fetch(`${BASE_URL}/notices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
}

function isNoticeEvent(event: SseEvent, notice: Notice) {
  if (event.event !== "notice" || event.id !== String(notice.id)) return false;
  try {
    return JSON.parse(event.data).message === notice.message;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────

type Check = { todo: string; title: string; hint: string; run: () => Promise<boolean> };

const opened: { close: () => void }[] = [];

const checks: Check[] = [
  {
    todo: "TODO 1",
    title: "GET /events가 text/event-stream으로 바로 응답해요",
    hint: "Content-Type 헤더를 설정하고 res.flushHeaders()로 헤더를 바로 보냈는지 확인하세요.",
    run: async () => {
      const conn = await connect();
      opened.push(conn);
      return (
        conn.res.status === 200 &&
        (conn.res.headers.get("content-type") ?? "").startsWith("text/event-stream")
      );
    },
  },
  {
    todo: "TODO 1",
    title: "연결하면 연결 목록에 등록되고, 끊으면 목록에서 지워져요",
    hint: "clients.set()으로 등록하고, res.on('close')에서 clients.delete()를 호출했는지 확인하세요.",
    run: async () => {
      const before = await getConnectionCount();
      const conn = await connect();
      const added = await waitFor(async () => (await getConnectionCount()) === before + 1);
      conn.close();
      const removed = await waitFor(async () => (await getConnectionCount()) === before);
      return added && removed;
    },
  },
  {
    todo: "TODO 2",
    title: "공지를 등록하면 연결된 모든 클라이언트가 같은 notice 이벤트를 받아요",
    hint: "sendNotice()에서 id / event: notice / data 줄을 쓰고 빈 줄(\\n\\n)로 끝냈는지, broadcast()가 모든 연결을 도는지 확인하세요.",
    run: async () => {
      const a = await connect();
      const b = await connect();
      opened.push(a, b);
      const notice = await postNotice("[자동 확인] 브로드캐스트 테스트");
      return waitFor(
        () =>
          a.events.some((e) => isNoticeEvent(e, notice)) &&
          b.events.some((e) => isNoticeEvent(e, notice))
      );
    },
  },
  {
    todo: "TODO 4",
    title: "Last-Event-ID를 보내면 그 뒤의 공지를 먼저 다시 보내줘요",
    hint: "req.get('Last-Event-ID')로 헤더를 읽고, getNoticesAfter()의 결과를 sendNotice()로 보냈는지 확인하세요.",
    run: async () => {
      const first = await postNotice("[자동 확인] 놓친 공지 1");
      const second = await postNotice("[자동 확인] 놓친 공지 2");
      const conn = await connect({ "Last-Event-ID": String(first.id - 1) });
      opened.push(conn);
      return waitFor(
        () =>
          conn.events.some((e) => isNoticeEvent(e, first)) &&
          conn.events.some((e) => isNoticeEvent(e, second))
      );
    },
  },
];

async function main() {
  console.log(`\nSSE 실습 자동 확인 (${BASE_URL})\n`);

  try {
    await fetch(`${BASE_URL}/dev/stats`);
  } catch {
    console.log("❌ 서버에 연결할 수 없어요. 먼저 다른 터미널에서 npm run dev로 서버를 켜 주세요.\n");
    process.exit(1);
  }

  let passed = 0;
  for (const check of checks) {
    let ok = false;
    try {
      ok = await check.run();
    } catch {
      ok = false; // 응답이 오지 않아 시간 초과된 경우 등
    }
    if (ok) {
      passed++;
      console.log(`✅ [${check.todo}] ${check.title}`);
    } else {
      console.log(`❌ [${check.todo}] ${check.title}`);
      console.log(`   💡 ${check.hint}`);
    }
  }

  opened.forEach((conn) => conn.close());
  console.log(`\n결과: ${checks.length}개 중 ${passed}개 통과${passed === checks.length ? " 🎉" : ""}\n`);
  process.exit(passed === checks.length ? 0 : 1);
}

main();
