import Link from "next/link";
import {
  IconCalendarEvent,
  IconBrandDiscord,
  IconUsers,
  IconClock,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";

export default function Home() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto mt-6 sm:mt-8 md:mt-16 mb-10 sm:mb-16">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="px-3 py-1 text-xs font-medium rounded-full"
            style={{
              background: "var(--accent-bg-medium)",
              color: "var(--accent)",
              border: "1px solid var(--accent-border-subtle)",
            }}
          >
            <IconSparkles className="inline h-3 w-3 mr-1" />
            GDG Community
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: "var(--text-primary)" }}>
          GDG Scheduler
          <br />
          <span style={{ color: "var(--text-muted)" }}>When2Meet 風格會議排程</span>
        </h1>

        <p className="text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl" style={{ color: "var(--text-muted)" }}>
          在 Discord 中使用{" "}
          <code
            className="px-2 py-0.5 rounded text-sm font-mono"
            style={{ background: "var(--code-bg)", color: "var(--code-text)" }}
          >
            /scheduler meeting
          </code>{" "}
          建立會議排程，透過 OAuth2 登入後在網頁上填寫你的可用時間，
          輕鬆找到所有人都能參加的最佳時段。
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold py-3 px-8 rounded-xl transition-all hover:scale-[1.02]"
          >
            開啟儀表板
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/api/auth/discord"
            className="flex items-center justify-center gap-2 glass-card px-8 py-3 font-semibold transition-all"
            style={{ color: "var(--text-primary)" }}
          >
            <IconBrandDiscord className="h-5 w-5 text-[#5865f2]" />
            以 Discord 登入
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
        <div className="glass-card p-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--accent-bg-medium)" }}>
            <IconCalendarEvent className="h-5 w-5 text-[#5865f2]" />
          </div>
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>建立會議</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            使用{" "}
            <code
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ background: "var(--code-bg)", color: "var(--code-text)" }}
            >
              /scheduler meeting
            </code>{" "}
            彈出 Modal 填寫會議名稱、人數、日期範圍
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--success-bg-medium)" }}>
            <IconUsers className="h-5 w-5" style={{ color: "var(--success-text)" }} />
          </div>
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>填寫時段</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Bot 發送含有「填寫可用時間」按鈕的 Embed，
            點擊後透過 OAuth2 登入並在 When2Meet 格式的時間表上勾選
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--warning-bg-medium)" }}>
            <IconClock className="h-5 w-5" style={{ color: "var(--warning-text)" }} />
          </div>
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>查看結果</h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            使用{" "}
            <code
              className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ background: "var(--code-bg)", color: "var(--code-text)" }}
            >
              /scheduler dashboard
            </code>{" "}
            開啟儀表板，檢視所有人的可用時段與最佳會議時間
          </p>
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6" style={{ color: "var(--text-primary)" }}>使用流程</h2>
        <div className="glass-card p-4 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 text-sm">
            <Step number={1} text="Leader 輸入 /scheduler meeting" />
            <Arrow />
            <Step number={2} text="填寫 Modal（名稱、人數、日期）" />
            <Arrow />
            <Step number={3} text="Bot 發送 Embed + 按鈕" />
            <Arrow />
            <Step number={4} text="OAuth2 登入 → 填寫時間" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm"
        style={{ background: "var(--accent-bg-medium)", color: "var(--accent)" }}
      >
        {number}
      </span>
      <span style={{ color: "var(--text-secondary)" }}>{text}</span>
    </div>
  );
}

function Arrow() {
  return (
    <IconArrowRight className="hidden md:block h-4 w-4 shrink-0" style={{ color: "var(--text-faint)" }} />
  );
}
