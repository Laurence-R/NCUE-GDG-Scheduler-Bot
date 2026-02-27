"use client";

import { IconBrandDiscord, IconLock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";

interface AuthGuardProps {
  children: React.ReactNode;
  /** 顯示在引導登入畫面的頁面名稱 */
  pageName?: string;
}

/**
 * 前端 Auth Guard
 *
 * 包裹需要登入才能瀏覽的頁面。
 * - loading 時顯示骨架
 * - 未登入時顯示引導登入畫面
 * - 已登入時正常渲染 children
 */
export function AuthGuard({ children, pageName = "此頁面" }: AuthGuardProps) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center")}>
        <div className={cn("flex flex-col items-center gap-3")}>
          <div className={cn("h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin")} />
          <span className={cn("text-sm text-text-faint")}>載入中…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-4")}>
        <div className={cn("glass-card p-8 sm:p-10 max-w-sm w-full text-center")}>
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-accent/10")}>
            <IconLock className={cn("h-7 w-7 text-accent")} />
          </div>
          <h2 className={cn("text-xl font-bold mb-2 text-text-primary")}>
            需要登入
          </h2>
          <p className={cn("text-sm mb-6 text-text-muted")}>
            {pageName}需要透過 Discord 帳號登入後才能使用。
          </p>
          <a
            href="/api/auth/discord"
            className={cn(
              "inline-flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-medium rounded-xl transition-colors",
              "bg-accent text-accent-foreground hover:bg-accent-hover"
            )}
          >
            <IconBrandDiscord className={cn("h-5 w-5")} />
            使用 Discord 登入
          </a>
          <p className={cn("text-xs mt-4 text-text-faint")}>
            登入後將自動返回{pageName}。
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
