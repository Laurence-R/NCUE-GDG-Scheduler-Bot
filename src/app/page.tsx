import Link from "next/link";
import {
  IconCalendarEvent,
  IconBrandDiscord,
  IconUsers,
  IconClock,
  IconArrowRight,
  IconTerminal2,
  IconMouse,
  IconChartBar,
} from "@tabler/icons-react";

export default function Home() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10">
      {/* Hero — 直接、有個性 */}
      <section className="max-w-3xl mx-auto mt-8 sm:mt-14 md:mt-20 mb-14 sm:mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-bg-medium)" }}
          >
            <IconBrandDiscord className="h-5 w-5 text-[#5865f2]" />
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--text-faint)" }}>
            GDG on Campus — NCUE
          </span>
        </div>

        <h1
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5"
          style={{ color: "var(--text-primary)" }}
        >
          找到大家都有空的
          <br />
          <span className="text-[#5865f2]">那個時間。</span>
        </h1>

        <p
          className="text-base sm:text-lg leading-relaxed max-w-xl mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          不用再一個一個問。在 Discord 裡建立排程，
          每個人各自填寫可用時段，馬上看到最佳交集。
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="group flex items-center justify-center gap-2 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold py-3 px-7 rounded-xl transition-all duration-200 cursor-pointer"
          >
            開啟儀表板
            <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/api/auth/discord"
            className="flex items-center justify-center gap-2 glass-card px-7 py-3 font-semibold transition-all duration-200 cursor-pointer"
            style={{ color: "var(--text-primary)", borderRadius: "0.75rem" }}
          >
            <IconBrandDiscord className="h-5 w-5 text-[#5865f2]" />
            以 Discord 登入
          </Link>
        </div>
      </section>

      {/* 怎麼用 — 三步驟，用指令面板模擬風格 */}
      <section className="max-w-3xl mx-auto mb-14 sm:mb-20">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: "var(--text-faint)" }}
        >
          三步完成
        </h2>

        <div className="grid gap-3">
          {/* Step 1 */}
          <div className="glass-card p-5 sm:p-6 flex gap-4 items-start cursor-pointer">
            <div
              className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center mt-0.5"
              style={{ background: "var(--accent-bg-medium)" }}
            >
              <IconTerminal2 className="h-4 w-4 text-[#5865f2]" />
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                在 Discord 輸入指令
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                使用{" "}
                <code
                  className="px-1.5 py-0.5 rounded text-xs font-mono"
                  style={{ background: "var(--code-bg)", color: "var(--code-text)" }}
                >
                  /scheduler meeting
                </code>
                ，填寫名稱、人數和日期範圍，Bot 會直接建立並推送到頻道。
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-5 sm:p-6 flex gap-4 items-start cursor-pointer">
            <div
              className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center mt-0.5"
              style={{ background: "var(--success-bg-medium)" }}
            >
              <IconMouse className="h-4 w-4" style={{ color: "var(--success-text)" }} />
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                每人各自勾選時段
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                點擊 Bot 發送的按鈕，透過 OAuth2 登入，在 When2Meet 風格的時間表上
                拖曳標記你有空的時間。
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-5 sm:p-6 flex gap-4 items-start cursor-pointer">
            <div
              className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center mt-0.5"
              style={{ background: "var(--warning-bg-medium)" }}
            >
              <IconChartBar className="h-4 w-4" style={{ color: "var(--warning-text)" }} />
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                查看熱力圖結果
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                顏色越深代表越多人有空。一眼找到最佳時段，不用來回協調。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 社群資訊底欄 */}
      <section className="max-w-3xl mx-auto mb-10">
        <div
          className="glass-card p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{
                  background: "var(--accent-bg-medium)",
                  color: "var(--accent)",
                  borderColor: "var(--background)",
                }}
              >
                G
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{
                  background: "var(--success-bg-medium)",
                  color: "var(--success-text)",
                  borderColor: "var(--background)",
                }}
              >
                D
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                style={{
                  background: "var(--warning-bg-medium)",
                  color: "var(--warning-text)",
                  borderColor: "var(--background)",
                }}
              >
                G
              </div>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                GDG on Campus — NCUE
              </p>
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                Google Developer Groups · 彰化師範大學
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <IconCalendarEvent className="h-3.5 w-3.5" />
              排程工具
            </span>
            <span className="flex items-center gap-1.5">
              <IconUsers className="h-3.5 w-3.5" />
              社群協作
            </span>
            <span className="flex items-center gap-1.5">
              <IconClock className="h-3.5 w-3.5" />
              即時同步
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
