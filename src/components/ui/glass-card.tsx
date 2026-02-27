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
      className={cn("glass-card p-6", className)}
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
    <h3
      className={cn("text-lg font-semibold", className)}
      style={{ color: "var(--text-primary)" }}
    >
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
    <div
      className={cn(className)}
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </div>
  );
};
