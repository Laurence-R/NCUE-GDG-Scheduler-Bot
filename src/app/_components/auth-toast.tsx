"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const AUTH_MESSAGES: Record<string, string> = {
  "login=success": "已成功透過 Discord 登入！",
  "logged_out=1": "已成功登出",
};

export function AuthToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    for (const [param, msg] of Object.entries(AUTH_MESSAGES)) {
      const [key, value] = param.split("=");
      if (searchParams.get(key) === value) {
        setMessage(msg);

        // 清除 URL 參數，避免重新整理時再次觸發
        const next = new URLSearchParams(searchParams.toString());
        next.delete(key);
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

        const timer = setTimeout(() => setMessage(null), 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, router, pathname]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg backdrop-blur-md border animate-toast-in",
        "bg-success-bg border-success-border text-success-strong"
      )}
    >
      <IconCheck className={cn("h-4 w-4 shrink-0")} />
      <span className={cn("text-sm font-medium")}>{message}</span>
      <button
        onClick={() => setMessage(null)}
        className={cn("ml-1 opacity-60 hover:opacity-100 transition-opacity")}
      >
        <IconX className={cn("h-3.5 w-3.5")} />
      </button>
    </div>
  );
}
