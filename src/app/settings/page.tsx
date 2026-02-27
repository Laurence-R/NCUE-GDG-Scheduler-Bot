"use client";

import { IconSettings } from "@tabler/icons-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3"
            style={{ color: "var(--text-primary)" }}
          >
            <IconSettings className="h-6 w-6 sm:h-7 sm:w-7 text-accent" />
            設定
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            管理你的偏好設定。
          </p>
        </div>

        {/* Placeholder */}
        <div className="glass-card p-8 text-center">
          <p style={{ color: "var(--text-muted)" }}>
            設定功能開發中，敬請期待。
          </p>
        </div>
      </div>
    </div>
  );
}
