"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const GlassCard = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6",
        "shadow-[0_0_15px_rgba(0,0,0,0.1)]",
        "transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassCardHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
};

export const GlassCardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  );
};

export const GlassCardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("text-neutral-400", className)}>
      {children}
    </div>
  );
};
