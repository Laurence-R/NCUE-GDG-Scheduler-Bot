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
  IconBrandDiscord,
  IconSettings,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";

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

          {/* Bottom: Discord link */}
          <div>
            <SidebarLink
              link={{
                label: "Discord 頻道",
                href: "#",
                icon: (
                  <IconBrandDiscord className="h-5 w-5 shrink-0 text-[#5865f2]" />
                ),
              }}
            />
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
