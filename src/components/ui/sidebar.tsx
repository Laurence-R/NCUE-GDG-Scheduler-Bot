"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col w-[300px] shrink-0",
        "backdrop-blur-xl",
        className
      )}
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 flex flex-row md:hidden items-center justify-between",
          "backdrop-blur-xl w-full"
        )}
        style={{
          background: "var(--sidebar-bg)",
          borderBottom: "1px solid var(--sidebar-border)",
        }}
        {...props}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 shrink-0 rounded-md bg-[#5865f2] flex items-center justify-center">
            <IconMenu2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>GDG Scheduler</span>
        </div>
        <IconMenu2
          className="cursor-pointer h-5 w-5"
          style={{ color: "var(--text-secondary)" }}
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 p-6 pt-5 z-[100] flex flex-col justify-between md:hidden",
              "backdrop-blur-xl",
              className
            )}
            style={{ background: "var(--mobile-overlay)" }}
          >
            <div
              className="absolute right-6 top-5 z-50 cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setOpen(!open)}
            >
              <IconX className="h-5 w-5" />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  active = false,
  ...props
}: {
  link: Links;
  className?: string;
  active?: boolean;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-2 group/sidebar py-2 rounded-lg transition-colors",
        !open && animate ? "justify-center px-0" : "justify-start px-2",
        className
      )}
      style={{
        color: active ? "var(--text-primary)" : "var(--text-muted)",
        background: active ? "var(--sidebar-active)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = "var(--text-primary)";
          e.currentTarget.style.background = "var(--sidebar-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.background = "transparent";
        }
      }}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm whitespace-pre transition duration-150 group-hover/sidebar:translate-x-1"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
