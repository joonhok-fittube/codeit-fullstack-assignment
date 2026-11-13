"use client";

import { useNoticeStream } from "@/hooks/useNoticeStream";
import type { ConnectionStatus } from "@/lib/types";

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: "연결 중",
  open: "연결됨",
  reconnecting: "재연결 중",
  closed: "연결 끊김",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function NoticeFeed() {
  const { notices, status, lastEventId } = useNoticeStream();

  return (
    <section className="card">
      <div className="status-bar">
        <span className={`status status-${status}`}>
          <span className="dot" aria-hidden />
          {STATUS_LABEL[status]}
        </span>
        <span className="muted">
          마지막으로 받은 이벤트 ID: <code>{lastEventId || "없음"}</code>
        </span>
      </div>

      <h2>실시간 공지 ({notices.length})</h2>

      {notices.length === 0 ? (
        <p className="empty">
          아직 받은 공지가 없어요. <a href="/admin" target="_blank">관리자 화면</a>
          에서 공지를 보내 보세요.
        </p>
      ) : (
        <ul className="notice-list">
          {notices.map((notice) => (
            // 서버를 재시작하면 공지 번호가 1부터 다시 시작해서, id만으로는 key가 겹칠 수 있어요.
            <li key={`${notice.id}-${notice.createdAt}`} className="notice">
              <span className="notice-id">#{notice.id}</span>
              <p className="notice-message">{notice.message}</p>
              <time className="muted">{formatTime(notice.createdAt)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
