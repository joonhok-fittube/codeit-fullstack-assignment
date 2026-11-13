# SSE로 실시간 공지 보내기 — 교재와 실습 코드

> 코드잇 풀스택 단기심화 부트캠프 주강사 사전과제 · 실시간 통신 1차시
> **SSE(Server-Sent Events): 서버에서 클라이언트로 실시간 알림 보내기와 연결 수명 주기 관리**

부트캠프 **실시간 공지 알림**이라는 하나의 사례로 SSE의 원리부터 연결 관리, 자동 재접속, 놓친 이벤트 이어받기까지 다뤄요.

## 교재

| 문서 | 대상 | 내용 |
|---|---|---|
| [📘 개념 설명](./docs/01-concept.md) | 수강생 | 폴링의 한계 → SSE 동작 원리 → Express 연결 관리 → React 수신 → 재접속과 `Last-Event-ID` |
| [📝 실습 문제](./docs/02-practice.md) | 수강생 | 30분 실습: 학습 목표, 환경과 시작 코드, TODO 4개, 완료 조건 6개, 힌트, 도전 과제 |
| [🔑 실습 답안 및 해설](./docs/03-solution.md) | 강사 | 출제 의도, 예시 풀이와 이유, 자주 하는 실수, 결과 해석, 수업 운영 가이드 |

## 저장소 구조

```text
.
├── docs/                 # 교재 (마크다운)
├── starter/              # 수강생에게 주는 시작 코드 (TODO 주석)
│   ├── server/           # Express 5 + TypeScript
│   └── client/           # Next.js 16 (App Router)
└── solution/             # 강사용 예시 풀이 (starter와 같은 구조, TODO만 채워져 있어요)
    ├── server/
    └── client/
```

## 실행 방법

`starter`(실습용)와 `solution`(예시 풀이)은 같은 방법으로 실행해요. 둘을 동시에 켜면 포트가 겹치니 하나만 실행하세요.

```bash
# 서버 (http://localhost:4000)
cd solution/server
npm install
npm run dev

# 클라이언트 (http://localhost:3000) — 다른 터미널에서
cd solution/client
npm install
npm run dev
```

- 수강생 화면: http://localhost:3000
- 관리자 화면: http://localhost:3000/admin
- 서버 자동 확인: 서버를 켠 상태에서 `cd solution/server && npm run check`
- 개념 설명 2장 예제: `cd solution/server && npx tsx examples/hello-sse.ts` → `curl -N http://localhost:4001/time` 또는 http://localhost:4001

## 검증 환경

교재의 실행 결과, 로그, 화면은 모두 아래 환경에서 직접 실행해 확인했어요.

- Node.js 24.21 / npm 11.19
- Express 5.3, TypeScript 5.9, tsx 4.23
- Next.js 16.4, React 19.3
- Chrome (macOS)
