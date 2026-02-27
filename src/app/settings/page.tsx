"use client";

import { IconSettings, IconSun, IconMoon, IconDeviceDesktop, IconBell, IconUser, IconBrandDiscord, IconLogout, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";
import { useUser } from "@/contexts/user-context";
import { AuthGuard } from "@/components/auth-guard";
import Image from "next/image";

export default function SettingsPage() {
  return (
    <AuthGuard pageName="設定">
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const { user, loading, logout } = useUser();

  const themeOptions: { value: "light" | "dark"; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "淺色", icon: <IconSun className={cn("h-4 w-4")} /> },
    { value: "dark", label: "深色", icon: <IconMoon className={cn("h-4 w-4")} /> },
  ];

  return (
    <div className={cn("min-h-screen p-4 sm:p-6 md:p-10")}>
      <div className={cn("max-w-3xl mx-auto")}>
        {/* Header */}
        <div className={cn("mb-8")}>
          <h1 className={cn("text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3 text-text-primary")}>
            <IconSettings className={cn("h-6 w-6 sm:h-7 sm:w-7 text-accent")} />
            設定
          </h1>
          <p className={cn("text-text-muted")}>
            管理你的偏好設定。
          </p>
        </div>

        <div className={cn("space-y-6")}>
          {/* Theme settings */}
          <section className={cn("glass-card p-5 sm:p-6")}>
            <h2 className={cn("text-sm font-semibold uppercase tracking-widest text-text-faint mb-4")}>
              外觀
            </h2>
            <div className={cn("space-y-4")}>
              <div>
                <label className={cn("text-sm font-medium text-text-primary mb-3 block")}>
                  主題模式
                </label>
                <div className={cn("grid grid-cols-2 gap-3")}>
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all cursor-pointer text-sm font-medium",
                        theme === opt.value
                          ? "border-accent bg-accent-bg-subtle text-accent"
                          : "border-border hover:border-border-hover text-text-muted hover:text-text-primary"
                      )}
                    >
                      {opt.icon}
                      {opt.label}
                      {theme === opt.value && (
                        <IconCheck className={cn("h-3.5 w-3.5 ml-1")} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Account */}
          <section className={cn("glass-card p-5 sm:p-6")}>
            <h2 className={cn("text-sm font-semibold uppercase tracking-widest text-text-faint mb-4")}>
              帳號
            </h2>
            {loading ? (
              <div className={cn("flex items-center gap-3 py-2")}>
                <div className={cn("h-10 w-10 rounded-full animate-pulse bg-surface-hover")} />
                <div className={cn("space-y-2")}>
                  <div className={cn("h-4 w-28 rounded animate-pulse bg-surface-hover")} />
                  <div className={cn("h-3 w-20 rounded animate-pulse bg-surface-hover")} />
                </div>
              </div>
            ) : user ? (
              <div className={cn("space-y-4")}>
                <div className={cn("flex items-center gap-4")}>
                  <Image
                    src={user.avatar_url}
                    alt={user.username}
                    width={40}
                    height={40}
                    className={cn("rounded-full ring-2 ring-accent-ring")}
                    unoptimized
                  />
                  <div>
                    <p className={cn("font-medium text-text-primary")}>
                      {user.username}
                    </p>
                    <p className={cn("text-xs text-text-faint flex items-center gap-1")}>
                      <IconBrandDiscord className={cn("h-3 w-3")} />
                      已連結 Discord
                    </p>
                  </div>
                </div>
                <div className={cn("pt-2 border-t border-border-subtle")}>
                  <button
                    onClick={logout}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                      "text-danger hover:bg-danger-bg"
                    )}
                  >
                    <IconLogout className={cn("h-4 w-4")} />
                    登出 Discord
                  </button>
                </div>
              </div>
            ) : (
              <div className={cn("flex flex-col items-start gap-3")}>
                <p className={cn("text-sm text-text-muted")}>
                  尚未登入，登入後可填寫會議時段。
                </p>
                <a
                  href="/api/auth/discord"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    "bg-accent text-accent-foreground hover:bg-accent-hover"
                  )}
                >
                  <IconBrandDiscord className={cn("h-4 w-4")} />
                  登入 Discord
                </a>
              </div>
            )}
          </section>

          {/* About */}
          <section className={cn("glass-card p-5 sm:p-6")}>
            <h2 className={cn("text-sm font-semibold uppercase tracking-widest text-text-faint mb-4")}>
              關於
            </h2>
            <div className={cn("space-y-2 text-sm text-text-muted")}>
              <div className={cn("flex justify-between")}>
                <span>版本</span>
                <span className={cn("text-text-primary font-mono")}>1.0.0</span>
              </div>
              <div className={cn("flex justify-between")}>
                <span>框架</span>
                <span className={cn("text-text-primary font-mono")}>Next.js + Discord.js</span>
              </div>
              <div className={cn("flex justify-between")}>
                <span>資料庫</span>
                <span className={cn("text-text-primary font-mono")}>Supabase</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
