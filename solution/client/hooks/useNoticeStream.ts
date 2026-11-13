"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import type { ConnectionStatus, Notice } from "@/lib/types";

/** 서버의 SSE 스트림(GET /events)에 연결해서 실시간 공지를 받아요. */
export function useNoticeStream() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastEventId, setLastEventId] = useState<string>("");

  useEffect(() => {
    // [TODO 3-1] SSE 연결을 열어요.
    const eventSource = new EventSource(`${API_URL}/events`);

    // [TODO 3-2] 연결 상태가 바뀔 때마다 화면 상태를 갱신해요.
    eventSource.onopen = () => {
      setStatus("open");
    };
    eventSource.onerror = () => {
      // onerror가 호출됐다고 끝난 게 아니에요.
      // 브라우저가 다시 접속하려는 중이면 readyState가 CONNECTING이에요.
      setStatus(
        eventSource.readyState === EventSource.CLOSED ? "closed" : "reconnecting"
      );
    };

    // [TODO 3-3] 서버가 보낸 'notice' 이벤트를 받아서 목록 맨 앞에 추가해요.
    //   event: notice 처럼 이름이 붙은 이벤트는 onmessage가 아니라 addEventListener로 받아요.
    eventSource.addEventListener("notice", (event) => {
      const notice: Notice = JSON.parse(event.data);
      setNotices((prev) => [notice, ...prev]);
      setLastEventId(event.lastEventId);
    });

    // [TODO 3-4] 컴포넌트가 사라질 때 연결을 닫아요.
    return () => {
      eventSource.close();
    };
  }, []);

  return { notices, status, lastEventId };
}
