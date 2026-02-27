"use client";

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  /** 錯誤訊息文字 */
  message: string;
  /** 重試回呼（若提供則顯示重試按鈕） */
  onRetry?: () => void;
  /** 額外 className */
  className?: string;
}

/**
 * 共用錯誤橫幅元件
 *
 * 統一 Dashboard / Meetings 等頁面的錯誤呈現樣式。
 */
export function ErrorBanner({ message, onRetry, className }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "glass-card p-4 flex items-center justify-between gap-3 border-danger-border bg-danger-bg",
        className
      )}
    >
      <div className={cn("flex items-center gap-3")}>
        <IconAlertTriangle className={cn("h-5 w-5 shrink-0 text-danger")} />
        <span className={cn("text-sm text-danger")}>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg",
            "transition-colors cursor-pointer text-accent hover:bg-accent-bg-subtle"
          )}
        >
          <IconRefresh className={cn("h-3.5 w-3.5")} />
          重試
        </button>
      )}
    </div>
  );
}
