# 📋 GDG Scheduler Bot — 改善任務追蹤表

> **建立日期**：2026-02-28
> **資料來源**：[六維度審計報告](./audit-report.md)
> **狀態說明**：⬜ 未開始 ｜ 🔧 進行中 ｜ ✅ 已完成 ｜ ⏭️ 延後

---

## P0 — 關鍵安全修復（必須立即處理）

| # | 任務 | 維度 | 涉及檔案 | 狀態 | 完成日期 |
|---|------|------|---------|------|---------|
| 1 | Cookie 設為 `httpOnly: true` | 安全性 | `src/lib/auth.ts` | ✅ | 2026-02-28 |
| 2 | `respond` 端點從 session 取得身分，不信任 request body | 安全性 | `src/app/api/meetings/[id]/respond/route.ts` | ✅ | 2026-02-28 |
| 3 | 移除 OAuth callback redirect URL 中的身分資訊 | 安全性 | `src/app/api/auth/callback/route.ts` | ✅ | 2026-02-28 |
| 4 | 前端 `meeting-content.tsx` 停止透過 URL params 取得身分 | 安全性 | `src/app/meeting/[id]/_components/meeting-content.tsx` | ✅ | 2026-02-28 |

---

## P1 — 高優先級（影響安全性與長期品質）

| # | 任務 | 維度 | 涉及檔案 | 狀態 | 完成日期 |
|---|------|------|---------|------|---------|
| 5 | API routes 加入 session guard（認證中介層） | 安全性 | `src/app/api/meetings/route.ts`、`src/lib/auth.ts` | ✅ | 2026-02-28 |
| 6 | HMAC 簽名改用 `crypto.timingSafeEqual` | 安全性 | `src/lib/oauth-state.ts` | ✅ | 2026-02-28 |
| 7 | 環境變數 `!` non-null assertion 改為啟動時驗證 | 安全性 | `src/lib/env.ts`（新增）、`callback/route.ts`、`supabase/client.ts`、`verify.ts` | ✅ | 2026-02-28 |
| 8 | 加入 `vitest` 測試框架 + API routes 單元測試 | 可維護性 | — | ⏭️ | — |
| 9 | 新增全域錯誤邊界 `error.tsx` / `global-error.tsx` | 架構 | `src/app/error.tsx`、`src/app/global-error.tsx` | ✅ | 2026-02-28 |
| 10 | `interactions/route.ts` 日期範圍解析加入格式驗證 | 架構 | `src/app/api/discord/interactions/route.ts` | ✅ | 2026-02-28 |

---

## P2 — 中優先級（可擴展性與團隊協作）

| # | 任務 | 維度 | 涉及檔案 | 狀態 | 完成日期 |
|---|------|------|---------|------|---------|
| 11 | 收緊 Supabase RLS 政策 | 安全性 | `supabase/schema.sql` | ⬜ | — |
| 12 | Supabase client 改為 server-only（移除 `NEXT_PUBLIC_` 前綴） | 安全性 | `src/lib/supabase/client.ts`、`.env` | ⬜ | — |
| 13 | API 加入分頁（`limit` / `offset` 或遊標分頁） | 效能 | `src/app/api/meetings/route.ts`、前端頁面 | ⬜ | — |
| 14 | 建立 `.env.example` 文件化所有環境變數 | 可維護性 | `.env.example`（新增） | ⬜ | — |
| 15 | 加入 GitHub Actions CI pipeline（lint + type-check + build） | 可維護性 | `.github/workflows/ci.yml`（新增） | ⬜ | — |
| 16 | 抽取共用 `useMeetings()` hook（消除 Dashboard/Meetings 重複 fetch 邏輯） | 架構 | `src/hooks/use-meetings.ts`（新增） | ⬜ | — |
| 17 | 抽取共用 `<ErrorBanner />` 元件 | 架構 | `src/components/ui/error-banner.tsx`（新增） | ⬜ | — |
| 18 | 統一 API 回應格式為 `{ data, error, meta }` | 架構 | 所有 `src/app/api/**/route.ts` | ⬜ | — |

---

## P3 — 低優先級（體驗與品質精進）

| # | 任務 | 維度 | 涉及檔案 | 狀態 | 完成日期 |
|---|------|------|---------|------|---------|
| 19 | Time Grid 加入鍵盤導覽（`role="grid"` + 方向鍵） | UI/UX | `src/app/meeting/[id]/_components/time-grid.tsx` | ⬜ | — |
| 20 | Toast 加入 `aria-live="polite"` / `role="status"` | UI/UX | `src/app/meeting/[id]/_components/toast-notification.tsx` | ⬜ | — |
| 21 | `text-text-faint` 顏色對比度提升至 WCAG AA（≥ 4.5:1） | UI/UX | `src/app/globals.css` | ⬜ | — |
| 22 | Dashboard 空狀態加入「前往 Discord」CTA 按鈕 | UI/UX | `src/app/dashboard/page.tsx` | ⬜ | — |
| 23 | API 加入 HTTP 快取策略（`Cache-Control` / `stale-while-revalidate`） | 效能 | `src/app/api/meetings/route.ts` | ⬜ | — |
| 24 | 安裝 `@next/bundle-analyzer` 並確認 `discord.js` 不在 client bundle | 效能 | `next.config.ts`、`package.json` | ⬜ | — |
| 25 | `interactions/route.ts` 拆分為 `handlers/` 子模組 | 可維護性 | `src/app/api/discord/interactions/` | ⬜ | — |
| 26 | 時間格 `HOURS` 範圍改為可配置（移除魔術數字） | 架構 | `src/app/meeting/[id]/_utils/date-helpers.ts` | ⬜ | — |

---

## P4 — 可選優化（非必要但有價值）

| # | 任務 | 維度 | 涉及檔案 | 狀態 | 完成日期 |
|---|------|------|---------|------|---------|
| 27 | `discord.js` 瘦身為 `@discordjs/builders` + `@discordjs/rest` | 依賴 | `package.json`、`src/lib/discord/` | ⬜ | — |
| 28 | `tweetnacl` 替換為原生 `crypto.verify('Ed25519')` | 依賴 | `src/lib/discord/verify.ts`、`package.json` | ⬜ | — |
| 29 | 移除未使用的 `shadcn` devDependency | 依賴 | `package.json` | ⬜ | — |
| 30 | Time Grid 超過 14 天時啟用虛擬滾動 | 效能 | `src/app/meeting/[id]/_components/time-grid.tsx` | ⬜ | — |
| 31 | 時區感知（加入時區選擇或顯示 UTC 偏移） | UI/UX | `src/app/meeting/[id]/` 相關檔案 | ⬜ | — |

---

## 📊 進度統計

| 優先級 | 總任務 | ✅ 已完成 | ⬜ 未開始 | 完成率 |
|--------|--------|----------|----------|--------|
| **P0** | 4 | 4 | 0 | 100% |
| **P1** | 6 | 5 | 0 | 83%（1 延後） |
| **P2** | 8 | 0 | 8 | 0% |
| **P3** | 8 | 0 | 8 | 0% |
| **P4** | 5 | 0 | 5 | 0% |
| **總計** | **31** | **9** | **21** | **29%** |

---

## 📝 更新日誌

| 日期 | 變更 |
|------|------|
| 2026-02-28 | 初始建立任務表；P0 四項安全修復全數完成 |
| 2026-02-28 | P1 完成 5/6 項：timingSafeEqual、session guard、env 驗證、error boundaries、日期格式驗證；#8 vitest 延後 |
