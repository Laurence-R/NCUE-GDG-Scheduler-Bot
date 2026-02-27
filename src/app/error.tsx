"use client";

import { cn } from "@/lib/utils";

/**
 * 全域錯誤邊界（處理 layout 以下、頁面層級的 runtime 錯誤）
 *
 * Next.js App Router 會在任何 Server/Client Component 拋出
 * 未捕獲的錯誤時自動渲染此元件。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center"
      )}
    >
      <div
        className={cn(
          "rounded-2xl border border-red-200 bg-red-50 p-8 shadow-lg",
          "dark:border-red-900/50 dark:bg-red-950/30"
        )}
      >
        <h2
          className={cn(
            "mb-2 text-2xl font-bold text-red-700 dark:text-red-400"
          )}
        >
          發生了一些問題
        </h2>
        <p className={cn("mb-6 text-sm text-red-600/80 dark:text-red-300/70")}>
          {error.message || "應用程式遇到未預期的錯誤。"}
        </p>
        {error.digest && (
          <p
            className={cn(
              "mb-4 font-mono text-xs text-red-400 dark:text-red-500"
            )}
          >
            錯誤代碼：{error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className={cn(
            "rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white",
            "transition-colors hover:bg-red-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          )}
        >
          重試
        </button>
      </div>
    </div>
  );
}
