import cors from "cors";
import express from "express";
import { addNotice, getNotices } from "./notice-store.js";
import {
  broadcast,
  dropAllConnections,
  getConnectionCount,
  handleEvents,
} from "./sse.js";

const PORT = 4000;
const CLIENT_ORIGIN = "http://localhost:3000"; // Next.js 개발 서버 주소

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// 공지 목록 조회
app.get("/notices", (_req, res) => {
  res.json(getNotices());
});

// 공지 등록 → 연결된 모든 클라이언트에게 실시간으로 전송
app.post("/notices", (req, res) => {
  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) {
    res.status(400).json({ error: "공지 내용을 입력해 주세요." });
    return;
  }

  const notice = addNotice(message);
  broadcast(notice);
  res.status(201).json(notice);
});

// SSE 연결
app.get("/events", handleEvents);

// ── 개발용: 실습 결과 확인에 사용해요 ──────────────────────────
const DROP_RETRY_MS = 10_000;

// 현재 SSE 연결 수 확인
app.get("/dev/stats", (_req, res) => {
  res.json({ connections: getConnectionCount() });
});

// 모든 SSE 연결 끊기 (10초 뒤 재접속)
app.post("/dev/drop-connections", (_req, res) => {
  const dropped = dropAllConnections(DROP_RETRY_MS);
  console.log(
    `[DEV] SSE 연결 ${dropped}개를 끊었어요. ${DROP_RETRY_MS / 1000}초 뒤 재접속해요.`
  );
  res.json({ dropped, retryAfterMs: DROP_RETRY_MS });
});

app.listen(PORT, () => {
  console.log(`공지 서버 실행 중: http://localhost:${PORT}`);
});
