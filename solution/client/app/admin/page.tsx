"use client";

// 관리자 화면: 공지를 등록하고, 실습 결과를 확인하는 개발용 도구를 제공해요.
// 이 파일은 실습에서 수정하지 않아도 돼요.

import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/config";
import type { Notice } from "@/lib/types";

const SAMPLE_MESSAGES = [
  "오늘 오후 3시에 현직자 특강이 있어요.",
  "점심시간이 12시 30분으로 바뀌었어요.",
  "주간 회고 설문을 오늘 6시까지 제출해 주세요.",
  "3층 강의실 에어컨 점검으로 2시부터 4층을 사용해요.",
  "프로젝트 팀 배정 결과가 공지 게시판에 올라왔어요.",
];

export default function AdminPage() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<Notice[]>([]);
  const [info, setInfo] = useState("");
  const [connections, setConnections] = useState<number | null>(null);
  const sampleIndex = useRef(0);

  async function sendNotice(text: string) {
    const res = await fetch(`${API_URL}/notices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      setInfo(data.error ?? "공지를 보내지 못했어요.");
      return;
    }
    setSent((prev) => [data, ...prev]);
    setInfo(`공지 #${data.id}를 보냈어요.`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await sendNotice(message);
    setMessage("");
  }

  async function handleSample() {
    // 예시 공지를 순서대로 돌아가며 보내요.
    const text = SAMPLE_MESSAGES[sampleIndex.current++ % SAMPLE_MESSAGES.length];
    await sendNotice(text);
  }

  async function handleDrop() {
    const res = await fetch(`${API_URL}/dev/drop-connections`, { method: "POST" });
    const data = await res.json();
    setInfo(
      `SSE 연결 ${data.dropped}개를 끊었어요. ${data.retryAfterMs / 1000}초 안에 공지를 보내 보세요!`
    );
  }

  // 개발용: 현재 SSE 연결 수를 2초마다 확인해요.
  // 개발자만 보는 정보라 조금 늦어도 괜찮아서, 간단하게 폴링으로 만들었어요.
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/dev/stats`);
        const data = await res.json();
        setConnections(data.connections);
      } catch {
        setConnections(null); // 서버가 꺼져 있으면 표시하지 않아요.
      }
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section className="card">
        <h2>공지 보내기</h2>
        <form onSubmit={handleSubmit} className="notice-form">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="수강생에게 보낼 공지를 입력하세요"
          />
          <button type="submit" disabled={!message.trim()}>
            보내기
          </button>
          <button type="button" className="secondary" onClick={handleSample}>
            예시 공지 보내기
          </button>
        </form>
        {info && <p className="info">{info}</p>}
      </section>

      <section className="card">
        <h2>🛠 개발 도구</h2>
        <p>
          현재 SSE 연결 수:{" "}
          <strong>{connections === null ? "확인 중…" : `${connections}개`}</strong>
          <span className="muted"> (2초마다 갱신)</span>
        </p>
        <button type="button" className="danger" onClick={handleDrop}>
          모든 연결 끊기 (10초 뒤 재접속)
        </button>
      </section>

      {sent.length > 0 && (
        <section className="card">
          <h2>보낸 공지</h2>
          <ul className="notice-list">
            {sent.map((notice) => (
              <li key={notice.id} className="notice">
                <span className="notice-id">#{notice.id}</span>
                <p className="notice-message">{notice.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
