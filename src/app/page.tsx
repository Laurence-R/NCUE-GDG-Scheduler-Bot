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
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className={cn("min-h-screen p-4 sm:p-6 md:p-10")}>
      {/* Hero — 直接、有個性 */}
      <section className={cn("max-w-3xl mx-auto mt-8 sm:mt-14 md:mt-20 mb-14 sm:mb-20")}>
        <div className={cn("flex items-center gap-3 mb-6")}>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-accent-bg-medium")}>
            <IconBrandDiscord className={cn("h-5 w-5 text-accent")} />
          </div>
          <span className={cn("text-sm font-medium text-text-faint")}>
            GDG on Campus — NCUE
          </span>
        </div>

        <h1 className={cn("text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5 text-text-primary")}>
          找到大家都有空的
          <br />
          <span className={cn("text-accent")}>那個時間。</span>
        </h1>

        <p className={cn("text-base sm:text-lg leading-relaxed max-w-xl mb-8 text-text-muted")}>
          不用再一個一個問。在 Discord 裡建立排程，
          每個人各自填寫可用時段，馬上看到最佳交集。
        </p>

        <div className={cn("flex flex-col sm:flex-row gap-3")}>
          <Link
            href="/dashboard"
            className={cn("group flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-foreground font-semibold py-3 px-7 rounded-xl transition-all duration-200 cursor-pointer")}
          >
            開啟儀表板
            <IconArrowRight className={cn("h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5")} />
          </Link>
          <Link
            href="/api/auth/discord"
            className={cn("flex items-center justify-center gap-2 glass-card px-7 py-3 font-semibold transition-all duration-200 cursor-pointer text-text-primary rounded-xl")}
          >
            <IconBrandDiscord className={cn("h-5 w-5 text-accent")} />
            以 Discord 登入
          </Link>
        </div>
      </section>

      {/* 怎麼用 — 三步驟 Timeline */}
      <section className={cn("max-w-3xl mx-auto mb-14 sm:mb-20")}>
        <h2 className={cn("text-xs font-semibold uppercase tracking-widest mb-8 text-text-faint")}>
          三步完成
        </h2>

        <div className={cn("relative pl-8 sm:pl-10")}>
          {/* 時間線主軸 */}
          <div className={cn("absolute left-[15px] sm:left-[19px] top-0 bottom-0 w-px bg-border")} />

          {/* Step 1 */}
          <div className={cn("relative pb-10")}>
            <div className={cn("absolute -left-8 sm:-left-10 top-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-accent-bg-medium ring-4 ring-background")}>
              <IconTerminal2 className={cn("h-4 w-4 text-accent")} />
            </div>
            <div className={cn("pt-0.5")}>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest text-accent")}>
                Step 1
              </span>
              <h3 className={cn("font-semibold mt-1 mb-1.5 text-text-primary")}>
                在 Discord 輸入指令
              </h3>
              <p className={cn("text-sm leading-relaxed text-text-muted")}>
                使用{" "}
                <code className={cn("px-1.5 py-0.5 rounded text-xs font-mono bg-code-bg text-code")}>
                  /scheduler meeting
                </code>
                ，填寫名稱、人數和日期範圍，Bot 會直接建立並推送到頻道。
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className={cn("relative pb-10")}>
            <div className={cn("absolute -left-8 sm:-left-10 top-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-success-bg-medium ring-4 ring-background")}>
              <IconMouse className={cn("h-4 w-4 text-success")} />
            </div>
            <div className={cn("pt-0.5")}>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest text-success")}>
                Step 2
              </span>
              <h3 className={cn("font-semibold mt-1 mb-1.5 text-text-primary")}>
                每人各自勾選時段
              </h3>
              <p className={cn("text-sm leading-relaxed text-text-muted")}>
                點擊 Bot 發送的按鈕，透過 OAuth2 登入，在 When2Meet 風格的時間表上
                拖曳標記你有空的時間。
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className={cn("relative pb-2")}>
            <div className={cn("absolute -left-8 sm:-left-10 top-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-warning-bg-medium ring-4 ring-background")}>
              <IconChartBar className={cn("h-4 w-4 text-warning")} />
            </div>
            <div className={cn("pt-0.5")}>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest text-warning")}>
                Step 3
              </span>
              <h3 className={cn("font-semibold mt-1 mb-1.5 text-text-primary")}>
                查看熱力圖結果
              </h3>
              <p className={cn("text-sm leading-relaxed text-text-muted")}>
                顏色越深代表越多人有空。一眼找到最佳時段，不用來回協調。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 社群資訊底欄 */}
      <section className={cn("max-w-3xl mx-auto mb-10")}>
        <div className={cn("glass-card p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4")}>
          <div className={cn("flex items-center gap-3")}>
            <div className={cn("flex -space-x-2")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-accent-bg-medium text-accent border-background")}>
                G
              </div>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-success-bg-medium text-success border-background")}>
                D
              </div>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-warning-bg-medium text-warning border-background")}>
                G
              </div>
            </div>
            <div>
              <p className={cn("text-sm font-medium text-text-primary")}>
                GDG on Campus — NCUE
              </p>
              <p className={cn("text-xs text-text-faint")}>
                Google Developer Groups · 彰化師範大學
              </p>
            </div>
          </div>
          <div className={cn("flex items-center gap-4 text-sm text-text-muted")}>
            <span className={cn("flex items-center gap-1.5")}>
              <IconCalendarEvent className={cn("h-3.5 w-3.5")} />
              排程工具
            </span>
            <span className={cn("flex items-center gap-1.5")}>
              <IconUsers className={cn("h-3.5 w-3.5")} />
              社群協作
            </span>
            <span className={cn("flex items-center gap-1.5")}>
              <IconClock className={cn("h-3.5 w-3.5")} />
              即時同步
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
