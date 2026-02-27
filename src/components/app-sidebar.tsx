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
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/contexts/user-context";
import { useSidebar } from "@/components/ui/sidebar";

const NAV_LINKS = [
  {
    label: "首頁",
    href: "/",
    icon: <IconHome className="h-5 w-5 shrink-0 text-neutral-400" />,
  },
  {
    label: "儀表板",
    href: "/dashboard",
    icon: <IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-400" />,
  },
  {
    label: "會議排程",
    href: "/meetings",
    icon: <IconCalendarEvent className="h-5 w-5 shrink-0 text-neutral-400" />,
  },
  {
    label: "設定",
    href: "/settings",
    icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-400" />,
  },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-[#0a0a0f]">
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

          {/* Bottom: User status */}
          <div>
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
      className="relative z-20 flex items-center gap-2 py-1 text-sm font-medium text-white"
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

/** 側邊欄底部：使用者登入狀態 */
function UserStatus() {
  const { user, loading, logout } = useUser();
  const { open, animate } = useSidebar();
  const showLabel = animate ? open : true;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <a
        href="/api/auth/discord"
        className={`flex items-center gap-2 py-2 rounded-lg transition-colors text-neutral-400 hover:text-white hover:bg-white/5 ${
          !showLabel ? "justify-center px-0" : "justify-start px-2"
        }`}
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
          className="rounded-full shrink-0 ring-2 ring-[#5865f2]/40"
          unoptimized
        />
        {showLabel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-w-0"
          >
            <span className="text-sm font-medium text-white truncate">
              {user.username}
            </span>
            <span className="text-[10px] text-neutral-500 truncate">
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
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs cursor-pointer"
        >
          <IconLogout className="h-4 w-4 shrink-0" />
          登出
        </motion.button>
      )}
    </div>
  );
}
