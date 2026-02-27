"use client";

/**
 * 最頂層全域錯誤邊界
 *
 * 當 root layout 本身拋出錯誤時，Next.js 會渲染此元件。
 * 必須包含完整的 <html> + <body>，因為 root layout 已經失效。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-TW">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            ⚠️ 應用程式發生嚴重錯誤
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#a1a1aa",
              marginBottom: "1.5rem",
            }}
          >
            {error.message || "根佈局載入失敗，請重新整理頁面。"}
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#71717a",
                fontFamily: "monospace",
                marginBottom: "1rem",
              }}
            >
              錯誤代碼：{error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.625rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#fff",
              backgroundColor: "#dc2626",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            重新整理
          </button>
        </div>
      </body>
    </html>
  );
}
