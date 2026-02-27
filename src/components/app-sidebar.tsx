"use client";

import React, { useState } from "react";
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
    icon: <IconHome className="h-5 w-5 shrink-0" style={{ color: "var(--text-muted)" }} />,
  },
  {
    label: "儀表板",
    href: "/dashboard",
    icon: <IconLayoutDashboard className="h-5 w-5 shrink-0" style={{ color: "var(--text-muted)" }} />,
  },
  {
    label: "會議排程",
    href: "/meetings",
    icon: <IconCalendarEvent className="h-5 w-5 shrink-0" style={{ color: "var(--text-muted)" }} />,
  },
  {
    label: "設定",
    href: "/settings",
    icon: <IconSettings className="h-5 w-5 shrink-0" style={{ color: "var(--text-muted)" }} />,
  },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            {open ? <Logo /> : <LogoIcon />}

            {/* Navigation */}
            <nav className="mt-8 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <SidebarLink
                  key={link.href}
                  link={link}
                  active={pathname === link.href}
                />
              ))}
            </nav>
          </div>

          {/* Bottom: Theme toggle + User status */}
          <div className="flex flex-col gap-2">
            <ThemeToggle />
            <UserStatus />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center gap-2 py-1 text-sm font-medium"
      style={{ color: "var(--text-primary)" }}
    >
      <div className="h-6 w-6 shrink-0 rounded-md bg-[#5865f2] flex items-center justify-center">
        <IconCalendarEvent className="h-4 w-4 text-white" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-semibold"
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
      className="relative z-20 flex items-center justify-center py-1"
    >
      <div className="h-6 w-6 shrink-0 rounded-md bg-[#5865f2] flex items-center justify-center">
        <IconCalendarEvent className="h-4 w-4 text-white" />
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
      className="flex items-center gap-2 py-2 rounded-lg transition-colors cursor-pointer"
      style={{
        color: "var(--text-muted)",
        justifyContent: !showLabel ? "center" : "flex-start",
        paddingInline: !showLabel ? "0" : "0.5rem",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.background = "var(--sidebar-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-muted)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {theme === "dark" ? (
        <IconSun className="h-5 w-5 shrink-0 text-amber-400" />
      ) : (
        <IconMoon className="h-5 w-5 shrink-0 text-indigo-500" />
      )}
      {showLabel && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm whitespace-pre"
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
      <div className="flex items-center justify-center py-2">
        <div className="h-8 w-8 rounded-full animate-pulse" style={{ background: "var(--surface-hover)" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <a
        href="/api/auth/discord"
        className={`flex items-center gap-2 py-2 rounded-lg transition-colors ${
          !showLabel ? "justify-center px-0" : "justify-start px-2"
        }`}
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
          e.currentTarget.style.background = "var(--sidebar-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <IconLogin className="h-5 w-5 shrink-0 text-[#5865f2]" />
        {showLabel && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm whitespace-pre"
          >
            登入 Discord
          </motion.span>
        )}
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* User info */}
      <div
        className={`flex items-center gap-2 py-2 rounded-lg ${
          !showLabel ? "justify-center px-0" : "justify-start px-2"
        }`}
      >
        <Image
          src={user.avatar_url}
          alt={user.username}
          width={28}
          height={28}
          className="rounded-full shrink-0"
          style={{ boxShadow: "0 0 0 2px var(--accent-ring)" }}
          unoptimized
        />
        {showLabel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-w-0"
          >
            <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {user.username}
            </span>
            <span className="text-[10px] truncate" style={{ color: "var(--text-faint)" }}>
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
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-xs cursor-pointer"
          style={{ color: "var(--text-faint)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--danger-text)";
            e.currentTarget.style.background = "var(--danger-bg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-faint)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <IconLogout className="h-4 w-4 shrink-0" />
          登出
        </motion.button>
      )}
    </div>
  );
}
