"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar";
import {
  IconCalendarEvent,
  IconLayoutDashboard,
  IconHome,
  IconLogin,
  IconLogout,
  IconSettings,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/contexts/user-context";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/contexts/theme-context";

const NAV_LINKS = [
  {
    label: "首頁",
    href: "/",
    icon: <IconHome className={cn("h-5 w-5 shrink-0")} />,
    requiresAuth: false,
  },
  {
    label: "儀表板",
    href: "/dashboard",
    icon: <IconLayoutDashboard className={cn("h-5 w-5 shrink-0")} />,
    requiresAuth: true,
  },
  {
    label: "會議排程",
    href: "/meetings",
    icon: <IconCalendarEvent className={cn("h-5 w-5 shrink-0")} />,
    requiresAuth: true,
  },
  {
    label: "設定",
    href: "/settings",
    icon: <IconSettings className={cn("h-5 w-5 shrink-0")} />,
    requiresAuth: true,
  },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className={cn("flex flex-col md:flex-row h-screen w-full overflow-hidden")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className={cn("justify-between gap-10")}>
          <div className={cn("flex flex-1 flex-col overflow-y-auto overflow-x-hidden")}>
            {/* Logo */}
            {open ? <Logo /> : <LogoIcon />}

            {/* Navigation */}
            <nav className={cn("mt-8 flex flex-col gap-1")}>
              {NAV_LINKS.map((link) => {
                // 未登入且該連結需要登入 → 導向 Discord 授權
                const href =
                  link.requiresAuth && !user
                    ? `/api/auth/discord?redirect=dashboard`
                    : link.href;

                return (
                  <SidebarLink
                    key={link.href}
                    link={{ ...link, href }}
                    active={pathname === link.href}
                  />
                );
              })}
            </nav>
          </div>

          {/* Bottom: Theme toggle + User status */}
          <div className={cn("flex flex-col gap-2")}>
            <ThemeToggle />
            <UserStatus />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main content */}
      <main className={cn("flex-1 overflow-y-auto")}>
        {children}
      </main>
    </div>
  );
}

const Logo = () => {
  return (
    <Link
      href="/"
      className={cn("relative z-20 flex items-center gap-2 py-1 text-sm font-medium text-text-primary")}
    >
      <div className={cn("h-6 w-6 shrink-0 rounded-md bg-accent flex items-center justify-center")}>
        <IconCalendarEvent className={cn("h-4 w-4 text-accent-foreground")} />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("whitespace-pre font-semibold")}
      >
        GDG Scheduler
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/"
      className={cn("relative z-20 flex items-center justify-center py-1")}
    >
      <div className={cn("h-6 w-6 shrink-0 rounded-md bg-accent flex items-center justify-center")}>
        <IconCalendarEvent className={cn("h-4 w-4 text-accent-foreground")} />
      </div>
    </Link>
  );
};

/** 深淺色切換按鈕 */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { open, animate } = useSidebar();
  const showLabel = animate ? open : true;

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-2 py-2 rounded-lg transition-colors cursor-pointer",
        "text-text-muted hover:text-text-primary hover:bg-sidebar-hover",
        showLabel ? "justify-start px-2" : "justify-center px-0"
      )}
    >
      {theme === "dark" ? (
        <IconSun className={cn("h-5 w-5 shrink-0 text-amber-400")} />
      ) : (
        <IconMoon className={cn("h-5 w-5 shrink-0 text-indigo-500")} />
      )}
      {showLabel && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("text-sm whitespace-pre")}
        >
          {theme === "dark" ? "淺色模式" : "深色模式"}
        </motion.span>
      )}
    </button>
  );
}

/** 側邊欄底部：使用者登入狀態 */
function UserStatus() {
  const { user, loading, logout } = useUser();
  const { open, animate } = useSidebar();
  const showLabel = animate ? open : true;

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-2")}>
        <div className={cn("h-8 w-8 rounded-full animate-pulse")} />
      </div>
    );
  }

  if (!user) {
    return (
      <a
        href="/api/auth/discord"
        className={cn(
          "flex items-center gap-2 py-2 rounded-lg transition-colors",
          "text-text-muted hover:text-text-primary hover:bg-sidebar-hover",
          showLabel ? "justify-start px-2" : "justify-center px-0"
        )}
      >
        <IconLogin className={cn("h-5 w-5 shrink-0 text-accent")} />
        {showLabel && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn("text-sm whitespace-pre")}
          >
            登入 Discord
          </motion.span>
        )}
      </a>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1")}>
      {/* User info */}
      <div
        className={cn(
          "flex items-center gap-2 py-2 rounded-lg",
          showLabel ? "justify-start px-2" : "justify-center px-0"
        )}
      >
        <Image
          src={user.avatar_url}
          alt={user.username}
          width={28}
          height={28}
          className={cn("rounded-full shrink-0 ring-2 ring-accent-ring")}
          unoptimized
        />
        {showLabel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn("flex flex-col min-w-0")}
          >
            <span className={cn("text-sm font-medium truncate text-text-primary")}>
              {user.username}
            </span>
            <span className={cn("text-[10px] truncate text-text-faint")}>
              已連結 Discord
            </span>
          </motion.div>
        )}
      </div>

      {/* Logout button */}
      {showLabel && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={logout}
          className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-xs cursor-pointer text-text-faint hover:text-danger hover:bg-danger-bg")}
        >
          <IconLogout className={cn("h-4 w-4 shrink-0")} />
          登出
        </motion.button>
      )}
    </div>
  );
}
