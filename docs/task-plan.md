# GDGoC 會議排程系統 — 任務計畫

> 基於 [user_story.md](./user_story.md) 拆分的開發階段與任務清單。
> 最後更新：2026-03-16 (P2 完成)

## 階段總覽

| 階段 | 名稱 | 目標 | 狀態 |
|:----:|------|------|:----:|
| P0 | 基礎骨架改造 | DB 擴充、TimeSlot 30min、指令重構 | ✅ 完成 |
| P1 | 核心業務邏輯 | 成員快照、權限控管、發起人權重算法 | ✅ 完成 |
| P2 | 前端 UI 適配 | 時間格 30min 重寫、連續時段過濾 UI、成員狀態 | ✅ 完成 |
| P3 | 自動化與通知 | 自動催促 Nudge、Status Card 動態更新 | ⬜ 未開始 |
| P4 | 優化與收尾 | 歷史紀錄完善、效能調校、文件更新 | ⬜ 未開始 |

---

## P0 — 基礎骨架改造

> 目標：讓資料庫與核心資料結構能支撐新的 user story 需求。
> 對應 User Story：US-01, US-03, US-05

| # | 任務 | 說明 | 對應 US | 狀態 |
|:-:|------|------|:-------:|:----:|
| 0-1 | DB: 新增 `meeting_members` 表 | `(meeting_id, discord_id, username, avatar_hash, is_organizer, filled_at)` — 儲存會議建立時的成員快照 | US-01 | ✅ |
| 0-2 | DB: `meetings` 表新增 `duration_minutes` 欄位 | 會議預計時長（分鐘），用於連續時段過濾 | US-03 | ✅ |
| 0-3 | DB: `meetings` 表新增 `role_id` 欄位 | 記錄 `/meeting build @身分組` 的目標身分組 ID | US-01 | ✅ |
| 0-4 | DB: `TimeSlot` 型別擴充為 30 分鐘 | `{ date, hour, minute }` 或使用 block index，更新 `database.types.ts` | US-05 | ✅ |
| 0-5 | DB: 撰寫 Migration 腳本 | 包含 schema 變更與既有資料轉換（`available_slots` JSONB 遷移） | — | ✅ |
| 0-6 | 更新 `database-schema.md` | 反映新的表結構與關聯 | — | ✅ |

---

## P1 — 核心業務邏輯

> 目標：實作 Discord 指令重構、成員快照、權限驗證、權重算法。
> 對應 User Story：US-01, US-02, US-03, US-04

| # | 任務 | 說明 | 對應 US | 狀態 |
|:-:|------|------|:-------:|:----:|
| 1-1 | Discord: 重新設計 Slash Command 結構 | `/meeting build @身分組` 取代 `/scheduler meeting`，新增 `role` 參數 | US-01 | ✅ |
| 1-2 | Discord: 實作權限驗證 | 驗證發起人是否具備 `@Lead` 或 `@組長` 身份 | US-01 | ✅ |
| 1-3 | Discord: 實作成員快照 | 呼叫 Discord REST API 取得身分組成員清單，寫入 `meeting_members` | US-01 | ✅ |
| 1-4 | API: 成員存取控制 | `POST /api/meetings/[id]/respond` 驗證使用者是否在 `meeting_members` 中 | US-04 | ✅ |
| 1-5 | API: Modal 新增「會議時長」欄位 | Discord Modal 加入 `duration_minutes` 輸入欄位 | US-03 | ✅ |
| 1-6 | 演算法: 發起人權重最佳時段計算 | 最佳時段必須落在發起人可用區間內；無交集時回傳次佳解 | US-02 | ✅ |
| 1-7 | 演算法: 連續時段過濾 | 掃描所有可能的連續 N 分鐘區間，排除不足時長的選項 | US-03 | ✅ |
| 1-8 | API: 輸入驗證補強 | `available_slots` 內容驗證（date 格式、hour/minute 範圍、去重、日期範圍內） | — | ✅ |

---

## P2 — 前端 UI 適配

> 目標：時間格改為 30 分鐘顆粒度，新增成員狀態與連續時段視覺化。
> 對應 User Story：US-05, US-06, US-02, US-03

| # | 任務 | 說明 | 對應 US | 狀態 |
|:-:|------|------|:-------:|:----:|
| 2-1 | 時間格: 30 分鐘顆粒度重寫 | `HOURS` → `TIME_BLOCKS`，slot key 改為 `date-hour-minute`，渲染行數翻倍 | US-05 | ✅ |
| 2-2 | 時間格: 拖曳邏輯適配 | `use-time-grid.ts` 適配新的 slot 結構，確保拖曳/觸控/鍵盤仍正常運作 | US-05 | ✅ |
| 2-3 | 熱力圖: 發起人權重視覺化 | 標示哪些時段涵蓋發起人，區分「發起人可用」vs「發起人不可用」的色彩 | US-02, US-06 | ✅ |
| 2-4 | 連續時段 UI: 灰顯不符合時長的區間 | 不滿足 `duration_minutes` 的零散時段灰顯或標記 | US-03 | ✅ |
| 2-5 | 成員狀態列表 | 顯示「已填寫 / 尚未填寫」的成員清單（基於 `meeting_members`） | US-01, US-07 | ✅ |
| 2-6 | 存取控制 UI | 非快照內成員看到「你不在受邀名單中」的提示，而非直接可操作 | US-04 | ✅ |
| 2-7 | 時間格效能優化 | 格子數翻倍後確保渲染效能（虛擬滾動或分區渲染） | — | ✅ |

---

## P3 — 自動化與通知

> 目標：Bot 主動推播催促與進度追蹤。
> 對應 User Story：US-07

| # | 任務 | 說明 | 對應 US | 狀態 |
|:-:|------|------|:-------:|:----:|
| 3-1 | Cron Job: Vercel Cron 或外部 Scheduler 設定 | 定時檢查未填寫成員並觸發通知 | US-07 | ⬜ |
| 3-2 | Discord: Nudge 通知 | Bot 使用 REST API 主動在頻道中 tag 未填寫成員 | US-07 | ⬜ |
| 3-3 | Discord: Status Card 動態更新 | 儲存原始 Embed 的 `message_id`，定期 edit message 更新填寫進度 | US-07 | ⬜ |
| 3-4 | DB: `meetings` 表新增 `message_id` 欄位 | 儲存 Bot 發送的訊息 ID 以便後續更新 | US-07 | ⬜ |

---

## P4 — 優化與收尾

> 目標：完善歷史紀錄、效能、文件。
> 對應 User Story：US-08

| # | 任務 | 說明 | 對應 US | 狀態 |
|:-:|------|------|:-------:|:----:|
| 4-1 | 歷史會議紀錄 UI 完善 | Dashboard/Meetings 列表完善已完成與進行中的分類與篩選 | US-08 | ⬜ |
| 4-2 | 分頁功能 | `useMeetings()` 與 UI 支援 50+ 筆會議的分頁載入 | US-08 | ⬜ |
| 4-3 | 舊指令清理 | 反註冊 `/scheduler` 指令，確保只有 `/meeting` 生效 | — | ⬜ |
| 4-4 | 錯誤提示統一 | 全面使用 Toast 取代 `alert()` 和原始 JSON 回應 | — | ⬜ |
| 4-5 | 文件更新 | 更新 README、database-schema.md，新增部署指南 | — | ⬜ |

---

## 進度統計

| 階段 | 任務數 | 完成 | 進度 |
|:----:|:------:|:----:|:----:|
| P0 | 6 | 6 | 100% |
| P1 | 8 | 8 | 100% |
| P2 | 7 | 7 | 100% |
| P3 | 4 | 0 | 0% |
| P4 | 5 | 0 | 0% |
| **總計** | **30** | **21** | **70%** |

---

## 備註

- 各階段有前後依賴關係：P0 → P1 → P2 → P3 → P4（P3/P4 可部分並行）
- P0 是地基，必須先完成才能進行後續任務
- 可複用的現有模組：OAuth2 認證、Session 管理、Layout/Sidebar、Theme 系統、AuthToast、Supabase Client、Vercel 部署架構
