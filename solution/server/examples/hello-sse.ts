// ─────────────────────────────────────────────────────────────
// 가장 작은 SSE 서버: 1초마다 현재 시각을 보내요. (교재 2장 예제)
//
//   실행:  npx tsx examples/hello-sse.ts
//   확인 1: 다른 터미널에서  curl -N http://localhost:4001/time
//          (-N: 받은 데이터를 모아 두지 않고 바로바로 출력하는 옵션)
//   확인 2: 브라우저에서 http://localhost:4001 접속 → EventSource로 받는 모습
// ─────────────────────────────────────────────────────────────
import express from "express";

const app = express();

app.get("/time", (req, res) => {
  // 1) "이 응답은 이벤트 스트림이에요"라고 알리고 헤더를 바로 보내요.
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  console.log("클라이언트 연결됨");

  // 2) res.end()를 부르지 않고, 1초마다 이벤트를 하나씩 write() 해요.
  let count = 0;
  const timer = setInterval(() => {
    count++;
    res.write(`id: ${count}\n`);
    res.write(`data: ${new Date().toLocaleTimeString("ko-KR")}\n\n`);
  }, 1000);

  // 3) 클라이언트가 떠나면 타이머를 정리해요. (안 하면 끊긴 연결에 계속 write 해요)
  res.on("close", () => {
    clearInterval(timer);
    console.log(`클라이언트 연결 종료 → 타이머 정리 (보낸 이벤트 ${count}개)`);
  });
});

// 브라우저에서 EventSource로 받아 보는 페이지 (같은 출처라서 CORS 설정이 필요 없어요)
app.get("/", (_req, res) => {
  res.send(`<!doctype html>
<meta charset="utf-8" />
<title>hello-sse</title>
<h1>hello-sse</h1>
<p>상태: <b id="status">연결 중</b> <button id="close">연결 닫기</button></p>
<ul id="log"></ul>
<script>
  const es = new EventSource("/time");
  const status = document.getElementById("status");
  const log = document.getElementById("log");

  es.onopen = () => (status.textContent = "연결됨 (readyState: " + es.readyState + ")");
  es.onmessage = (event) => {
    const li = document.createElement("li");
    li.textContent = "id " + event.lastEventId + " → " + event.data;
    log.prepend(li);
  };
  es.onerror = () => (status.textContent = "에러 (readyState: " + es.readyState + ")");
  document.getElementById("close").onclick = () => {
    es.close();
    status.textContent = "닫힘 (readyState: " + es.readyState + ")";
  };
</script>`);
});

app.listen(4001, () => {
  console.log("hello-sse 실행 중: http://localhost:4001  또는  curl -N http://localhost:4001/time");
});
