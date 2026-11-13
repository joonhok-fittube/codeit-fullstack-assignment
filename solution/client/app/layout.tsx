import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "부트캠프 실시간 공지",
  description: "SSE 실습: 서버에서 클라이언트로 실시간 공지 보내기",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <header className="app-header">
          <a href="/" className="app-title">
            📢 부트캠프 실시간 공지
          </a>
          <nav>
            <a href="/">수강생 화면</a>
            <a href="/admin">관리자 화면</a>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
