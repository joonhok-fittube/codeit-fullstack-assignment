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
    // [TODO 3-1] `${API_URL}/events`로 SSE 연결을 열어요.
    //   힌트: new EventSource(url)

    // [TODO 3-2] 연결 상태가 바뀔 때마다 setStatus()로 화면 상태를 갱신해요.
    //   - 연결되면 (onopen)  → "open"
    //   - 에러가 나면 (onerror) → readyState가 EventSource.CLOSED면 "closed", 아니면 "reconnecting"

    // [TODO 3-3] 서버가 보내는 'notice' 이벤트를 받아서
    //   - event.data(JSON 문자열)를 Notice 객체로 바꿔 목록 맨 앞에 추가하고 (setNotices)
    //   - event.lastEventId를 setLastEventId()로 저장해요.
    //   힌트: 서버에서 event: notice 처럼 이름을 붙인 이벤트는 어떻게 받아야 할까요?

    // [TODO 3-4] 컴포넌트가 사라질 때 연결을 닫는 cleanup 함수를 반환해요.
  }, []);

  return { notices, status, lastEventId };
}
