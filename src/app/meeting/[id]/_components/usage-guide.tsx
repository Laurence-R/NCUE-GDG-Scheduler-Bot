"use client";

import { useState } from "react";
import { IconChevronDown, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function UsageGuide({ durationMinutes }: { durationMinutes: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("max-w-6xl mx-auto mb-4 sm:mb-6")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 text-xs sm:text-sm text-text-muted hover:text-text-secondary transition-colors"
        )}
      >
        <IconInfoCircle className={cn("h-4 w-4 shrink-0")} />
        <span>如何使用此頁面？</span>
        <IconChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className={cn("mt-2 glass-card p-4 sm:p-5 text-xs sm:text-sm text-text-secondary space-y-3")}>
          <div>
            <p className={cn("font-semibold text-text-primary mb-1")}>選取可用時段</p>
            <p>在時間格子上<strong>點擊</strong>或<strong>拖曳</strong>來標記你可以參加的時段，再次點擊可取消選取。手機上支援滑動選取。</p>
          </div>
          <div>
            <p className={cn("font-semibold text-text-primary mb-1")}>熱力圖顏色</p>
            <p>格子的<strong>綠色深淺</strong>代表該時段有多少人可用——顏色越深表示越多人選擇了這個時段，方便大家一眼看出最佳時間。</p>
          </div>
          <div>
            <p className={cn("font-semibold text-text-primary mb-1")}>半透明（淡化）格子</p>
            <p>
              此會議需要連續 <strong>{durationMinutes} 分鐘</strong>的時間。
              如果被選的時段無法組成足夠長度的連續區間，這些「零散」的格子會以<strong>半透明</strong>顯示，提醒你它們目前無法滿足會議時長需求。
            </p>
          </div>
          <div>
            <p className={cn("font-semibold text-text-primary mb-1")}>發起人標記</p>
            <p>帶有<strong>琥珀色邊框</strong>的格子表示會議發起人也可用該時段，作為排程時的優先參考。</p>
          </div>
          <div>
            <p className={cn("font-semibold text-text-primary mb-1")}>儲存回覆</p>
            <p>選好時段後，點擊下方的<strong>「儲存我的回覆」</strong>按鈕。你可以隨時重新調整並再次儲存。</p>
          </div>
        </div>
      )}
    </div>
  );
}
