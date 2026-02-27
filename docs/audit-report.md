# 🔍 GDG Scheduler Bot — 六維度專業審計報告

> **審計日期**：2026-02-28
> **專案版本**：0.1.0
> **審計範圍**：`src/` 目錄下全部 43 個原始碼檔案（~3,200 行 TypeScript）

---

## 📋 專案概覽

| 指標 | 數值 |
|------|------|
| **框架** | Next.js 16.1.6（App Router） |
| **語言** | TypeScript 5.x（`strict: true`） |
| **前端** | React 19 + Tailwind CSS v4 + Motion (Framer Motion) |
| **後端** | Next.js Route Handlers（Serverless） |
| **資料庫** | Supabase（PostgreSQL） |
| **認證** | Discord OAuth2 + HMAC-signed Stateless State |
| **Bot 整合** | Discord.js 14 + TweetNaCl（Ed25519 簽名驗證） |
| **UI 管理** | `clsx` + `tailwind-merge`（`cn()` 統一封裝） |
| **動畫** | Motion（原 Framer Motion）— AnimatePresence + motion.div |
| **原始碼檔案數** | ~43 檔 |
| **估計總行數** | ~3,200 行 |

---

## 一、技術堆疊與依賴對應分析

### 依賴清單與用途對應

#### 生產依賴（dependencies）

| 套件 | 版本 | 用途 | 合理性評估 |
|------|------|------|-----------|
| `next` | 16.1.6 | 全棧框架：SSR/SSG + API Routes + App Router | ✅ **極合理** — 一個框架同時處理前端渲染與後端 API，免除額外架設 Express/Fastify 的複雜度。App Router 的 `route.ts` 非常適合 webhook/API 場景 |
| `react` / `react-dom` | 19.2.3 | UI 渲染引擎 | ✅ **必要** — Next.js 的核心依賴 |
| `@supabase/supabase-js` | ^2.97.0 | Supabase 客戶端 SDK（PostgreSQL 操作） | ✅ **合理** — 免除自建資料庫伺服器與 ORM，提供即時 API + Auth + RLS。對於小型專案，Supabase 的 DX（開發體驗）遠優於自己架設 PostgreSQL + Prisma |
| `discord.js` | ^14.25.1 | Discord Bot API 互動（Slash Command 定義與註冊） | ⚠️ **可優化** — 實際僅使用 `SlashCommandBuilder` 和 REST API 註冊命令，未使用 Gateway（WebSocket）。可改用更輕量的 `@discordjs/rest` + `@discordjs/builders`，減少 ~15MB 的 bundle 大小 |
| `tweetnacl` | ^1.0.3 | Ed25519 數位簽名驗證（Discord Interaction 驗簽） | ✅ **合理** — Discord 官方推薦的驗簽方案，體積極小（~20KB），零依賴。替代方案為 Node.js 原生 `crypto.verify`（不需額外依賴），但 tweetnacl 的 API 更直觀 |
| `clsx` | ^2.1.1 | 條件式 CSS class 合併 | ✅ **合理** — 業界標準，搭配 `tailwind-merge` 組成 `cn()` 工具函數 |
| `tailwind-merge` | ^3.5.0 | Tailwind class 衝突解析 | ✅ **合理** — 解決 Tailwind class 覆蓋優先級問題。與 `clsx` 組合是 shadcn/ui 社群的最佳實踐 |
| `motion` | ^12.34.3 | 動畫庫（Sidebar 展開/收合、元素進出場） | ✅ **合理** — 僅用於 Sidebar 的 `AnimatePresence` 和 `motion.div` 展開動畫，提供流暢的互動體驗。若追求極致輕量化，可改用純 CSS `transition` + `@starting-style`，但開發效率會下降 |

#### 開發依賴（devDependencies）

| 套件 | 版本 | 用途 | 合理性評估 |
|------|------|------|-----------|
| `tailwindcss` | ^4 | 原子化 CSS 框架 | ✅ **合理** — v4 使用 `@theme inline` 設計系統，搭配 CSS 變數實現完整的 light/dark 主題切換 |
| `@tailwindcss/postcss` | ^4 | Tailwind 的 PostCSS 插件 | ✅ **必要** — Next.js 整合 Tailwind 的標準方式 |
| `tw-animate-css` | ^1.4.0 | Tailwind 動畫預設 | ✅ **合理** — 提供 `animate-spin` 等常用動畫 class |
| `shadcn` | ^3.8.5 | shadcn/ui CLI 工具 | ⚠️ **可移除** — 目前僅在初始化時使用 CLI 產生設定，實際元件並未使用 shadcn/ui 的 Radix 體系，而是手寫 Sidebar 元件。保留 CLI 不影響 bundle，但可精簡 devDependencies |
| `typescript` | ^5 | 型別系統 | ✅ **必要** — `strict: true` 確保型別安全 |
| `eslint` / `eslint-config-next` | ^9 / 16.1.6 | 程式碼品質檢查 | ✅ **必要** — Next.js 內建的 ESLint 規則 |
| `tsx` | ^4.21.0 | TypeScript 執行器 | ✅ **合理** — 用於 `scripts/register-commands.ts` 的直接執行 |
| `dotenv` | ^17.3.1 | 環境變數載入 | ✅ **合理** — 用於 standalone script（註冊命令時讀取 `.env`） |
| `@types/node` / `@types/react` / `@types/react-dom` | — | TypeScript 型別定義 | ✅ **必要** |

### 技術選型合理性總評

#### ✅ 選型優勢

| 決策 | 理由 |
|------|------|
| **Next.js 全棧** | 前後端統一框架，避免 CORS、部署複雜度。Discord webhook 和 OAuth callback 直接用 Route Handlers 處理，非常適合 |
| **Supabase > 自建 DB** | 零運維 PostgreSQL + 內建 RLS + 即時 API。專案規模小，不需要 DBA 維護成本 |
| **Tailwind CSS v4 + CSS Variables** | 完整的 design token 系統（~80 個 CSS 變數），搭配 `@theme inline` 實現編譯時安全的主題切換，避免 CSS-in-JS 的 runtime 成本 |
| **HMAC Stateless OAuth State** | 無需 Redis/session store，利用加密簽名在 URL 中傳遞安全的 state，適合 serverless 架構 |
| **TypeScript Strict Mode** | 100% TypeScript，`strict: true`，完整的 `database.types.ts` 型別定義，最大化型別安全 |

#### ⚠️ 選型可優化之處

| 決策 | 問題 | 建議 |
|------|------|------|
| **完整版 `discord.js`** | 引入了含 Gateway/WebSocket 的完整 SDK（~15MB），但僅使用 `SlashCommandBuilder` | 改用 `@discordjs/builders` + `@discordjs/rest`，或直接使用 Discord REST API |
| **`tweetnacl` vs 原生** | Node.js 18+ 已支援 `crypto.verify('Ed25519', ...)`，可零依賴驗簽 | 可將 `tweetnacl` 替換為原生 `crypto` 模組（但 DX 差異不大，非必要） |
| **`motion`（Framer Motion）** | 僅用於 Sidebar 開合動畫（~3 處 `motion.div`），引入了 ~40KB 的動畫庫 | 對於此用途可改用 CSS `transition` + `@starting-style`，但若未來需更複雜動畫則保留合理 |
| **無 ORM** | 直接使用 Supabase JS SDK query，缺少 migration 管理工具（雖有手寫 SQL） | 若專案擴展到 5+ 資料表，建議引入 Drizzle ORM 或繼續使用 Supabase CLI 管理 migration |
| **無測試框架** | 完全沒有 `vitest` / `jest` / `playwright` 等測試工具 | 建議至少加入 `vitest` 覆蓋 API routes 和核心邏輯 |

#### 🔢 依賴精簡度評分

| 指標 | 評價 |
|------|------|
| **生產依賴數量** | 9 個 — ⭐⭐⭐⭐⭐ 極精簡 |
| **未使用依賴** | 0 個 — 每個依賴都有對應的程式碼使用 |
| **可移除/替換** | 1~2 個（`discord.js` 可瘦身、`tweetnacl` 可改原生） |
| **整體評估** | 依賴選型高度合理，後續成長空間充足 |

---

## 二、架構與程式碼品質分析

### 優點 ✅

| 面向 | 細節 |
|------|------|
| **關注點分離** | Components / Hooks / Utils / API Routes 分層清晰。會議頁面拆成 7 個元件 + 3 個 hooks + 1 個 util |
| **TypeScript 嚴格模式** | `strict: true`，有完整的型別定義（`database.types.ts` 含 `TimeSlot` 介面） |
| **模組化** | Discord 相關分 `commands` / `register` / `verify`；Supabase 分 `client` / `types` / `index`（barrel exports） |
| **命名一致性** | 檔案用 `kebab-case`，元件用 `PascalCase`，hooks 用 `use-` 前綴 |
| **Context 設計** | `ThemeProvider` 使用 `useSyncExternalStore` 避免 tearing；`UserProvider` 設計簡潔，含 `refresh` 和 `logout` |
| **Sidebar 元件** | 桌面（hover 展開 60px → 300px）+ 行動裝置漢堡選單，有 focus trap、Escape 關閉、`aria-modal` |
| **CSS 設計系統** | `globals.css` 定義 ~80 個 CSS 變數，light/dark 完整對稱。`@theme inline` 讓 Tailwind 編譯時驗證 token 名稱 |

### 待改進 ⚠️

| 問題 | 說明 | 建議 |
|------|------|------|
| **重複的 fetch 邏輯** | Dashboard 和 Meetings 頁面有幾乎相同的 `fetchMeetings` + error/loading state 邏輯 | 抽取為 `useMeetings()` 共用 hook |
| **重複的 error banner UI** | 兩個頁面的錯誤提示 UI 結構完全相同 | 抽取為 `<ErrorBanner />` 共用元件 |
| **日期範圍解析脆弱** | `interactions/route.ts` 用 `split("~")` 解析使用者輸入的日期範圍，無格式驗證 | 加入正規表達式驗證或使用 `date-fns` 解析 |
| **API 回應格式不一致** | 有的回傳 `{ meetings: [...] }`，有的回傳 `{ meeting: {...} }`，有的回傳 `{ error: "..." }` | 統一為 `{ data, error, meta }` 格式 |
| **缺少全域錯誤邊界** | 無 `error.tsx` 或 `global-error.tsx`，未捕獲的錯誤會顯示 Next.js 預設錯誤頁面 | 新增 `src/app/error.tsx` 和 `src/app/global-error.tsx` |
| **魔術數字** | 時間格的 `HOURS` 範圍（8~22）硬編碼在 `date-helpers.ts` | 可做為會議設定使其可配置 |

### 檔案結構

```
src/
├── app/
│   ├── layout.tsx                          # Root layout（Theme + User context）
│   ├── globals.css                         # ~80 個 design tokens + glass-morphism
│   ├── page.tsx                            # Landing page（純靜態）
│   ├── dashboard/page.tsx                  # 儀表板（含 error/loading/empty 狀態）
│   ├── meetings/page.tsx                   # 所有會議列表（含搜尋）
│   ├── settings/page.tsx                   # 設定頁（主題/帳號/關於）
│   ├── meeting/[id]/
│   │   ├── page.tsx                        # Suspense wrapper
│   │   ├── _components/                    # 7 個子元件
│   │   │   ├── meeting-content.tsx
│   │   │   ├── meeting-header.tsx
│   │   │   ├── time-grid.tsx
│   │   │   ├── grid-legend.tsx
│   │   │   ├── login-status.tsx
│   │   │   ├── responses-summary.tsx
│   │   │   ├── save-button.tsx
│   │   │   └── toast-notification.tsx
│   │   ├── _hooks/                         # 3 個自訂 hooks
│   │   │   ├── use-meeting-data.ts
│   │   │   ├── use-time-grid.ts
│   │   │   └── use-toast.ts
│   │   └── _utils/
│   │       └── date-helpers.ts
│   └── api/
│       ├── auth/
│       │   ├── callback/route.ts           # OAuth2 callback
│       │   ├── discord/route.ts            # OAuth2 入口
│       │   ├── logout/route.ts             # 清除 session
│       │   └── me/route.ts                 # 當前使用者
│       ├── discord/
│       │   └── interactions/route.ts       # Discord webhook（321 行，最複雜）
│       └── meetings/
│           ├── route.ts                    # GET 列出 / POST 建立
│           └── [id]/
│               ├── route.ts               # GET 單一會議
│               └── respond/route.ts        # POST 時段回覆
├── components/
│   ├── layout/app-sidebar.tsx              # 側邊欄（Nav + Theme + User）
│   └── ui/sidebar.tsx                      # Sidebar UI 元件（focus trap）
├── contexts/
│   ├── theme-context.tsx                   # useSyncExternalStore 主題管理
│   └── user-context.tsx                    # 使用者狀態管理
└── lib/
    ├── auth.ts                             # Cookie 管理
    ├── avatar.ts                           # Discord 頭像 URL 生成
    ├── oauth-state.ts                      # HMAC-SHA256 Stateless State
    ├── utils.ts                            # cn() 工具函數
    ├── discord/
    │   ├── commands.ts                     # Slash command 定義
    │   ├── register.ts                     # 命令註冊
    │   ├── verify.ts                       # Ed25519 驗簽
    │   └── index.ts                        # Barrel export
    └── supabase/
        ├── client.ts                       # Supabase 單例
        ├── database.types.ts               # 型別定義
        └── index.ts                        # Barrel export
```

---

## 三、安全性分析

### 高風險 🔴

| # | 問題 | 位置 | 說明 |
|---|------|------|------|
| 1 | **Cookie `httpOnly: false`** | `src/lib/auth.ts` | Session cookie（`discord_user`）設為 `httpOnly: false`，任何 XSS 都可竊取使用者身分。檔案註解寫「Client 端也需要讀取」，但實際 client 端已透過 `/api/auth/me` 取得使用者資訊，不需要直接讀 cookie |
| 2 | **API Routes 無認證** | `src/app/api/meetings/route.ts` | `GET /api/meetings` 無需登入即可列出所有會議；`POST /api/meetings` 無需驗證身分即可建立會議。任何人可遍歷/建立任意會議 |
| 3 | **回應端點可偽造身分** | `src/app/api/meetings/[id]/respond/route.ts` | `POST respond` 完全信任 request body 中的 `discord_id` 和 `username`。攻擊者可偽造任何人的回應。應從 server-side session 取得身分 |
| 4 | **URL 洩漏身分資訊** | `src/app/api/auth/callback/route.ts` | OAuth callback 後將 `discord_id`、`username`、`avatar` 塞進 redirect URL query string，可被瀏覽器歷史紀錄或 HTTP Referrer Header 取得 |

### 中風險 🟡

| # | 問題 | 位置 | 說明 |
|---|------|------|------|
| 5 | **HMAC Timing Attack** | `src/lib/oauth-state.ts` | `signature !== expected` 使用 `!==` 直接比對而非 `crypto.timingSafeEqual`，理論上可被 timing attack 暴力推算簽名 |
| 6 | **RLS 全部寬鬆** | `supabase/schema.sql` | 所有 RLS policy 均為 `USING(true)` / `WITH CHECK(true)`，等於無保護。若 Supabase anon key 洩漏，任何人可直接操作所有資料 |
| 7 | **Supabase anon key 暴露於 client** | `src/lib/supabase/client.ts` | 使用 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`，搭配寬鬆 RLS 等於資料庫全開放 |
| 8 | **環境變數用 `!` 斷言** | `src/app/api/auth/callback/route.ts` | `process.env.DISCORD_CLIENT_SECRET!` 等使用 non-null assertion，若未設定會導致 runtime crash |

### 良好實踐 ✅

| 實踐 | 細節 |
|------|------|
| HMAC-SHA256 Stateless State | 防止 OAuth CSRF，含 10 分鐘 TTL + nonce |
| Ed25519 簽名驗證 | 使用 tweetnacl 正確驗證 Discord interaction webhook |
| Cookie `sameSite: lax` | 防止 CSRF |
| Cookie `secure` in production | 防止 HTTP 明文傳輸 |

### 修復優先級

```
[P0] Cookie httpOnly: true     → 直接改，零影響
[P0] respond 端點身分驗證       → 從 session 取得 discord_id
[P1] API routes 加權限控制      → session guard middleware
[P1] timingSafeEqual            → 一行程式碼替換
[P2] RLS 收緊                   → 配合 API 認證方案調整
[P2] URL 身分資訊               → 改存入 cookie 而非 query string
```

---

## 四、UI/UX 分析

### 優點 ✅

| 面向 | 細節 |
|------|------|
| **主題切換零閃爍** | Blocking script + CSS Variables + `useSyncExternalStore` 三層防護 |
| **Sidebar 互動** | 桌面 hover 展開（60px → 300px）+ 手機漢堡選單 + AnimatePresence 動畫 |
| **When2Meet Grid** | 拖曳選擇、觸控支援、avatar 頭像、即時色溫計算（熱力圖） |
| **Timeline 引導** | Landing page 三步驟垂直時間線設計清晰 |
| **Glass Morphism** | `backdrop-filter: blur()` 搭配 light/dark 模式對稱的 CSS Variables |
| **Toast 通知** | 操作回饋即時，含進入動畫 |
| **Loading / Error 狀態** | Dashboard 和 Meetings 頁面有完整的 loading skeleton、error banner + 重試按鈕 |
| **Mobile Focus Trap** | 手機 sidebar 開啟時 Tab 鍵被限制在 overlay 內，Escape 可關閉 |
| **設定頁面** | 含主題切換、帳號資訊、系統資訊等實際功能 |

### 待改進 ⚠️

| 問題 | 說明 | 建議 |
|------|------|------|
| **Glass Morphism 效能** | `backdrop-filter: blur()` 在 Firefox 舊版/低端裝置效能差 | ✅ **已修復** — 加入 `@supports not (backdrop-filter)` 回退 + `prefers-reduced-motion` 降低 blur 值 |
| **Time Grid 鍵盤存取** | 格子無 `tabIndex`、無 `role`、無鍵盤操作支援 | 加入 `role="grid"` + `aria-label` + 方向鍵導覽 |
| **螢幕閱讀器支援** | 缺乏 `aria-label` 描述 grid 內容、Toast 未使用 `aria-live` | 加入 `role="status"` / `aria-live="polite"` 至 Toast |
| **Color Contrast** | 部分 `text-text-faint`（`#9ca3af` on `#f5f7fa`）對比度僅 ~3.1:1，低於 WCAG AA 標準（4.5:1） | 提升 faint 文字的對比度或放大字體 |
| **Empty State 引導** | Dashboard 空狀態只顯示 `/scheduler meeting` 指令，未提供直接操作的 CTA 按鈕 | 加入「前往 Discord」的快捷連結 |

---

## 五、效能分析

### 優點 ✅

| 面向 | 細節 |
|------|------|
| **阻斷式主題腳本** | `<head>` 中的 blocking script 在 paint 前設定主題，零 FOUC |
| **`useCallback` / `useMemo`** | 避免不必要的重渲染，`slotCounts` 等計算使用 `useMemo` |
| **Next.js Image** | Avatar 使用 `<Image>` 元件，自動最佳化 |
| **Supabase 單例** | 全域 `createClient` 避免重複初始化 |
| **CSS Variables** | 主題切換僅修改 `<html>` class，無 JS re-render 成本 |
| **Glass Morphism 回退** | `@supports` 回退 + `prefers-reduced-motion` 減低 blur |

### 待改進 ⚠️

| 問題 | 嚴重度 | 說明 | 建議 |
|------|--------|------|------|
| **無分頁** | 中 | `GET /api/meetings` 和前端均載入全部會議 | 加入 `limit` / `offset` 或遊標分頁 |
| **無快取策略** | 低 | 無 HTTP cache headers、無 `revalidate` 設定。每次頁面載入都重新 fetch | 對會議列表加入 `Cache-Control` 或使用 `stale-while-revalidate` |
| **Bundle 分析** | 低 | 未設定 `@next/bundle-analyzer`，無法量化 `discord.js` 等大型依賴的影響 | 安裝 bundle analyzer 並確認 `discord.js` 未被拉入 client bundle |
| **Time Grid 大量 DOM** | 低 | 15 小時 × N 天（若跨 30 天 = 450 個 cell），但量級尚可 | 超過 14 天可考慮虛擬化（virtual scroll） |
| **Font 載入** | 低 | Geist Sans/Mono 透過 `next/font` 載入，正確使用 `variable` 模式 | 已最佳化 ✅ |

---

## 六、可維護性與擴展性分析

### 優點 ✅

| 面向 | 細節 |
|------|------|
| **JSDoc 註解** | API 路由和 lib 函式都有中文 JSDoc 註解 |
| **資料庫文件** | `docs/database-schema.md` 有完整的 ERD + 欄位說明 |
| **Design Token 體系** | ~80 個 CSS 變數，語意化命名（`--text-primary`、`--surface-raised`），易於擴展新主題 |
| **`cn()` 統一管理** | 所有 `className` 均透過 `cn()` 管理，動態/靜態一致 |
| **Migration 檔案** | 有 `supabase/schema.sql` + `migrations/001_add_avatar_hash.sql` |
| **Path Alias** | 使用 `@/*` path alias，import 結構清晰 |
| **Barrel Exports** | `discord/index.ts` 和 `supabase/index.ts` 提供統一出口 |

### 待改進 ⚠️

| 問題 | 嚴重度 | 說明 | 建議 |
|------|--------|------|------|
| **無測試** | 高 | 完全沒有測試（無 `__tests__/`、無 `.test.ts`、無 vitest/jest） | 至少加入 `vitest` 覆蓋 API routes 和 `oauth-state.ts` 的核心邏輯 |
| **無 `.env.example`** | 中 | 沒有文件化需要哪些環境變數。新成員 onboarding 困難 | 建立 `.env.example` 列出所有需要的環境變數 |
| **無 CI/CD** | 中 | 沒有 GitHub Actions、沒有自動化部署/檢查 | 加入 lint + type-check + build 的 CI pipeline |
| **無 Error Boundary** | 中 | 缺少 `error.tsx` / `global-error.tsx` | 新增全域錯誤頁面 |
| **Interactions Route 過長** | 低 | `interactions/route.ts` 有 321 行，包含所有 slash command、modal、button 處理 | 拆分為 `handlers/` 目錄，每個 command 一個檔案 |
| **硬編碼時區** | 低 | 時間格使用本地時區，多時區使用者會看到不同的時間 | 可加入時區選擇或在 UI 中顯示 UTC 偏移 |

---

## 📊 總結評分

| 維度 | 評分 | 等級 |
|------|------|------|
| **技術堆疊與依賴** | 9 / 10 | ⭐⭐⭐⭐⭐ 依賴精簡，選型高度合理 |
| **架構與程式碼品質** | 8 / 10 | ⭐⭐⭐⭐ 模組化佳，有少量重複 |
| **安全性** | 5 / 10 | ⭐⭐⭐ 有 4 個高風險問題待修復 |
| **UI/UX** | 8 / 10 | ⭐⭐⭐⭐ 視覺完成度高，a11y 待加強 |
| **效能** | 7 / 10 | ⭐⭐⭐⭐ 基礎良好，缺分頁與快取 |
| **可維護性與擴展性** | 7 / 10 | ⭐⭐⭐⭐ 文件充足，缺測試與 CI |

### 🎯 最高優先改善建議（Top 5）

| 優先級 | 改善項目 | 預計影響 |
|--------|---------|---------|
| **P0** | Cookie 設為 `httpOnly: true` | 消除 XSS session 竊取風險 |
| **P0** | `respond` 端點從 session 取得身分 | 防止身分偽造 |
| **P1** | API routes 加入 session guard | 完整的認證授權 |
| **P1** | 加入 `vitest` 測試框架 + 核心邏輯測試 | 長期品質保障 |
| **P2** | API 加入分頁 + `.env.example` + CI pipeline | 可擴展性 + 團隊協作 |
