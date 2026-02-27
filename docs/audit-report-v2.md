# 🔍 GDG Scheduler Bot — 六維度專業審計報告 v2

> **審計日期**：2026-02-28（第二輪全新審計）
> **專案版本**：0.1.0
> **審計範圍**：`src/` 目錄下全部原始碼檔案 + 設定檔 + 基礎設施

---

## 📋 專案概覽

| 指標 | 數值 |
|------|------|
| **框架** | Next.js 16.1.6（App Router） |
| **語言** | TypeScript 5.x（`strict: true`） |
| **前端** | React 19.2.3 + Tailwind CSS v4 + Motion (Framer Motion) |
| **後端** | Next.js Route Handlers（Serverless） |
| **資料庫** | Supabase（PostgreSQL + RLS） |
| **認證** | Discord OAuth2 + httpOnly Cookie + HMAC-SHA256 Stateless State |
| **Bot 整合** | Discord.js 14（SlashCommandBuilder + REST）+ TweetNaCl（Ed25519） |
| **UI 工具** | `clsx` + `tailwind-merge`（`cn()` 封裝）、`@tabler/icons-react` |
| **動畫** | Motion（Framer Motion）— AnimatePresence + motion.div |
| **CI** | GitHub Actions（lint → type-check → build） |
| **生產依賴** | 11 個套件 |
| **開發依賴** | 11 個套件 |
| **估計總行數** | ~4,000+ 行 TypeScript / CSS |

---

## 一、技術堆疊與依賴對應分析

### 生產依賴（dependencies）— 11 個

| 套件 | 版本 | 用途 | 合理性 |
|------|------|------|--------|
| `next` | 16.1.6 | 全棧框架：SSR + API Routes + App Router | ✅ 極合理 — 前後端統一，適合 Serverless |
| `react` / `react-dom` | 19.2.3 | UI 渲染引擎 | ✅ 必要 — Next.js 核心依賴 |
| `@supabase/supabase-js` | ^2.97.0 | PostgreSQL 客戶端 SDK | ✅ 合理 — 零運維 DBaaS，提供 RLS + 即時 API |
| `discord.js` | ^14.25.1 | Discord Bot API（Slash Command 定義 + REST 註冊） | ⚠️ **過重** — 僅使用 `SlashCommandBuilder` 和 REST API，未使用 Gateway/WebSocket。完整 SDK ~15MB，可改用 `@discordjs/builders` + `@discordjs/rest` |
| `tweetnacl` | ^1.0.3 | Ed25519 簽名驗證（Discord Interaction） | ✅ 合理 — 體積小（~20KB），零依賴。替代方案：Node.js 原生 `crypto.verify('Ed25519', ...)` |
| `clsx` | ^2.1.1 | 條件式 CSS class 合併 | ✅ 合理 — 業界標準 |
| `tailwind-merge` | ^3.5.0 | Tailwind class 衝突解析 | ✅ 合理 — 搭配 `clsx` 組成 `cn()` |
| `motion` | ^12.34.3 | 動畫庫（Sidebar 展開/收合、overlay 進出） | ✅ 合理 — 若追求極致輕量可改用 CSS transition，但 DX 差異大 |
| `@tabler/icons-react` | ^3.37.1 | 圖示庫（Sidebar、AuthGuard、各頁面） | ✅ 合理 — tree-shakeable，僅引入使用到的圖示 |
| `server-only` | ^0.0.1 | 防止 server 模組被引入 client bundle | ✅ 良好實踐 — 保護 Supabase service_role key |

### 開發依賴（devDependencies）— 11 個

| 套件 | 版本 | 用途 | 合理性 |
|------|------|------|--------|
| `@next/bundle-analyzer` | ^16.1.6 | Bundle 分析工具 | ✅ 良好 — `ANALYZE=true` 可視化 bundle |
| `tailwindcss` | ^4 | 原子化 CSS 框架 | ✅ 必要 |
| `@tailwindcss/postcss` | ^4 | PostCSS 插件 | ✅ 必要 |
| `tw-animate-css` | ^1.4.0 | Tailwind 動畫預設 | ✅ 合理 |
| `typescript` | ^5 | 型別系統 | ✅ 必要 |
| `eslint` / `eslint-config-next` | ^9 / 16.1.6 | 程式碼品質 | ✅ 必要 |
| `tsx` | ^4.21.0 | TypeScript 直接執行器 | ✅ 合理 — 用於 `scripts/register-commands.ts` |
| `dotenv` | ^17.3.1 | 環境變數載入 | ✅ 合理 — standalone script 使用 |
| `shadcn` | ^3.8.5 | shadcn/ui CLI 工具 | ⚠️ **可移除** — 未使用 shadcn 元件體系，僅引入了 CSS import，CLI 本身不影響 bundle 但增加多餘的 devDep |
| `@types/*` | — | TypeScript 型別定義 | ✅ 必要 |

### 技術選型總評

#### ✅ 選型優勢

| 決策 | 理由 |
|------|------|
| **Next.js 全棧** | 前後端統一框架，Discord webhook + OAuth callback 直接用 Route Handlers。免除 CORS、跨服務部署 |
| **Supabase DBaaS** | 零運維 PostgreSQL + RLS + 即時 API。小型專案不需 DBA |
| **Tailwind CSS v4 + CSS Variables** | ~80 個 design token 組成完整設計系統，`@theme inline` 編譯時安全，zero-runtime 主題切換 |
| **HMAC Stateless OAuth** | 無需 Redis/session store，加密簽名傳遞 state，完美適配 serverless |
| **TypeScript Strict** | 100% TypeScript，`strict: true`，完整 `database.types.ts` 型別定義 |
| **`server-only` 保護** | 確保 Supabase service_role key 不會洩漏到 client bundle |

#### ⚠️ 可優化之處

| 項目 | 問題 | 建議 | 優先級 |
|------|------|------|--------|
| `discord.js` 完整 SDK | ~15MB，僅使用 `SlashCommandBuilder` + REST | 改用 `@discordjs/builders` + `@discordjs/rest` | P2 |
| `shadcn` devDep | CLI 不再使用，佔位 | 移除 `shadcn` 依賴 | P3 |
| `tweetnacl` vs 原生 | Node.js 18+ 支援原生 Ed25519 | 可替換為 `crypto.verify`，但非必要 | P3 |
| 無測試框架 | 缺少 vitest/jest/playwright | 引入 `vitest` 覆蓋核心邏輯 | P1 |
| 無 ORM | Supabase SDK 直接 query，無 migration 管理 | 若擴展到 5+ 資料表建議引入 Drizzle | P3 |

#### 🔢 依賴精簡度

| 指標 | 評價 |
|------|------|
| **生產依賴** | 11 個 — ⭐⭐⭐⭐ 精簡（`discord.js` 可瘦身） |
| **開發依賴** | 11 個 — ⭐⭐⭐⭐⭐ 極精簡 |
| **未使用依賴** | 1 個（`shadcn` CLI） |
| **可替換/瘦身** | 1~2 個（`discord.js` 瘦身、`tweetnacl` 可改原生） |

---

## 二、架構與程式碼品質分析

### 檔案結構

```
src/
├── app/
│   ├── layout.tsx                          # Root layout（Theme + User + Sidebar）
│   ├── globals.css                         # ~80 個 design tokens + glass-morphism
│   ├── page.tsx                            # Landing page（純靜態，三步驟 Timeline）
│   ├── error.tsx                           # 頁面層級錯誤邊界
│   ├── global-error.tsx                    # 根層級錯誤邊界（含自帶 <html>）
│   ├── dashboard/page.tsx                  # 儀表板（AuthGuard 保護）
│   ├── meetings/page.tsx                   # 會議列表（AuthGuard + 搜尋篩選）
│   ├── settings/page.tsx                   # 設定頁（主題/帳號/關於）
│   ├── meeting/[id]/
│   │   ├── page.tsx                        # Suspense wrapper
│   │   ├── _components/                    # 8 個子元件
│   │   │   ├── meeting-content.tsx         # 主要邏輯編排器
│   │   │   ├── meeting-header.tsx          # 會議標題
│   │   │   ├── time-grid.tsx              # 時間格（keyboard nav + a11y）
│   │   │   ├── grid-legend.tsx            # 圖例
│   │   │   ├── login-status.tsx           # 登入狀態提示
│   │   │   ├── responses-summary.tsx      # 回應摘要
│   │   │   ├── save-button.tsx            # 儲存按鈕
│   │   │   └── toast-notification.tsx     # Toast 通知（aria-live）
│   │   ├── _hooks/                         # 3 個自訂 hooks
│   │   │   ├── use-meeting-data.ts        # 會議資料 fetch
│   │   │   ├── use-time-grid.ts           # 拖曳/觸控選取邏輯
│   │   │   └── use-toast.ts               # Toast 狀態管理
│   │   └── _utils/
│   │       └── date-helpers.ts            # 日期/時間工具（HOUR_START/HOUR_END 可設定）
│   └── api/
│       ├── auth/
│       │   ├── callback/route.ts           # OAuth2 callback（HMAC 驗證 + cookie 設定）
│       │   ├── discord/route.ts            # OAuth2 入口（簽名 state 生成）
│       │   ├── logout/route.ts             # 清除 session cookie
│       │   └── me/route.ts                 # 當前使用者查詢
│       ├── discord/
│       │   └── interactions/
│       │       ├── route.ts               # Discord webhook（Ed25519 驗籤 + 分發）
│       │       └── handlers/              # 模組化 command handlers
│       │           ├── index.ts
│       │           ├── meeting-command.ts
│       │           ├── dashboard-command.ts
│       │           └── modal-submit.ts
│       └── meetings/
│           ├── route.ts                    # GET（分頁+快取）/ POST（建立）
│           └── [id]/
│               ├── route.ts               # GET 單一會議（公開）
│               └── respond/route.ts        # POST 時段回覆（session 認證）
├── components/
│   ├── auth-guard.tsx                      # 客戶端路由守衛（loading/login/children）
│   ├── layout/
│   │   └── app-sidebar.tsx                 # 側邊欄（Nav + Theme + User）
│   └── ui/
│       ├── sidebar.tsx                     # Sidebar UI（hover 展開 + mobile overlay + focus trap）
│       └── error-banner.tsx                # 可重用錯誤提示（retry 按鈕）
├── contexts/
│   ├── theme-context.tsx                   # useSyncExternalStore 主題管理（FOUC-free）
│   └── user-context.tsx                    # 使用者狀態（fetch + refresh + logout）
├── hooks/
│   └── use-meetings.ts                     # 共用會議列表 fetch hook
└── lib/
    ├── auth.ts                             # httpOnly cookie 管理 + requireSession()
    ├── api-response.ts                     # apiOk / apiError / parsePagination
    ├── avatar.ts                           # Discord 頭像 URL 生成
    ├── env.ts                              # requireEnv() 環境變數驗證
    ├── oauth-state.ts                      # HMAC-SHA256 + timingSafeEqual
    ├── utils.ts                            # cn() 工具函數
    ├── discord/
    │   ├── commands.ts                     # Slash command 定義
    │   ├── register.ts                     # 命令註冊（standalone script）
    │   ├── verify.ts                       # Ed25519 驗簽
    │   └── index.ts                        # Barrel export
    └── supabase/
        ├── client.ts                       # server-only + service_role 單例
        ├── database.types.ts               # 完整 DB 型別定義
        └── index.ts                        # Barrel export
```

### ✅ 架構優點

| 面向 | 細節 |
|------|------|
| **關注點分離優秀** | Components / Hooks / Utils / API Routes / Contexts / Lib 分層清晰，會議頁面拆成 8 元件 + 3 hooks + 1 util |
| **模組化程度高** | Discord 相關拆為 `commands` / `register` / `verify`；Supabase 拆為 `client` / `types`；Interactions 拆為 `handlers/` 目錄 |
| **TypeScript 嚴格模式** | `strict: true`，`database.types.ts` 定義完整的 Row / Insert / Update 型別 + `TimeSlot` 介面 |
| **API 回應格式統一** | 所有 API 路由使用 `apiOk()` / `apiError()` 標準化回應格式，含分頁 meta |
| **Context 設計精巧** | `ThemeProvider` 使用 `useSyncExternalStore` 避免 tearing；`UserProvider` 含 `refresh` / `logout` 方法 |
| **AuthGuard 模式** | 客戶端路由守衛統一處理 loading → login → children 三態，Dashboard / Meetings / Settings 頁面複用 |
| **命名一致性** | 檔案 `kebab-case`、元件 `PascalCase`、hooks `use-` 前綴、Next.js colocation（`_components/`、`_hooks/`） |
| **Barrel Exports** | `discord/index.ts` 和 `supabase/index.ts` 提供統一出口，隱藏內部模組結構 |
| **環境變數驗證** | `env.ts` 在模組載入時驗證所有必要的 server-side 環境變數 |
| **錯誤邊界完整** | `error.tsx`（頁面級）+ `global-error.tsx`（根級）雙層捕獲 |

### ⚠️ 待改進事項

| # | 問題 | 位置 | 嚴重度 | 說明 |
|---|------|------|--------|------|
| 1 | **POST /api/meetings 無認證守衛** | `api/meetings/route.ts` POST handler | 🔴 高 | `GET` 有 `requireSession()` 但 `POST` 完全跳過認證 — 任何人可建立會議。雖然此端點主要由 Discord Interaction 呼叫（用 service_role），但外部也可直接打 API |
| 2 | **Sidebar 重定向硬編碼** | `app-sidebar.tsx:74` | 🟡 中 | 未登入點擊任何需認證的連結，一律重定向到 `?redirect=dashboard`，應使用該連結對應的實際路徑（如 `?redirect=meetings`） |
| 3 | **error.tsx 未使用 design token** | `src/app/error.tsx` | 🟡 中 | 使用硬編碼 Tailwind 紅色系（`border-red-200`、`bg-red-50`），而非設計系統的 `--danger-*` 變數。破壞 token 一致性 |
| 4 | **Dashboard 頁面偏長** | `dashboard/page.tsx` (280 行) | 🟢 低 | 包含 stats 卡片、會議列表、空狀態等，可考慮拆出 `StatCards` / `MeetingList` 子元件 |
| 5 | **日期解析脆弱性** | `handlers/meeting-command.ts` | 🟢 低 | Discord modal 提交的日期範圍 `split("~")` 解析缺乏格式驗證 |
| 6 | **README 為模板預設** | `README.md` | 🟢 低 | 仍為 `create-next-app` 的預設內容，應更新為專案實際的 setup 說明 |

---

## 三、安全性分析

### ✅ 安全良好實踐

| 實踐 | 實作位置 | 說明 |
|------|----------|------|
| **httpOnly Cookie** | `lib/auth.ts` | Session cookie 設為 `httpOnly: true`，XSS 無法竊取 |
| **Session 身分認證** | `lib/auth.ts → requireSession()` | GET /api/meetings 和 POST respond 端點均從 server-side session 取得身分，不信任 request body |
| **HMAC-SHA256 Stateless State** | `lib/oauth-state.ts` | OAuth2 state 含 redirect + nonce + timestamp，使用 Web Crypto API 簽名，10 分鐘 TTL |
| **timingSafeEqual** | `lib/oauth-state.ts` | HMAC 驗證使用 `timingSafeEqual` 防止 timing attack |
| **Ed25519 簽名驗證** | `lib/discord/verify.ts` | 使用 tweetnacl 正確驗證 Discord Interaction webhook |
| **RLS 策略** | `supabase/schema.sql` | 讀取開放、寫入限 `service_role`，防止 anon key 直接寫入 |
| **server-only 保護** | `lib/supabase/client.ts` | 引入 `server-only` 防止 service_role key 洩漏到 client |
| **Cookie 安全屬性** | `lib/auth.ts` | `sameSite: "lax"` + `secure: true`（生產環境）|
| **環境變數驗證** | `lib/env.ts` | 模組載入時驗證所有必要的 server 環境變數，缺少即 throw |
| **統一錯誤回應** | `lib/api-response.ts` | `apiError()` 避免洩漏內部錯誤細節（雖然目前 Supabase `error.message` 直接透傳，見下方） |

### ⚠️ 安全風險

| # | 風險等級 | 問題 | 位置 | 說明 | 建議 |
|---|----------|------|------|------|------|
| 1 | 🔴 **高** | **POST /api/meetings 無認證** | `api/meetings/route.ts` | POST handler 未呼叫 `requireSession()`。外部請求可偽造 `creator_discord_id` 和 `creator_username` 建立會議 | 加入 `requireSession()` 或改為限制僅 Discord Interaction 呼叫 |
| 2 | 🟡 **中** | **無 Rate Limiting** | 所有 API routes | 完全沒有速率限制。攻擊者可暴力遍歷會議 ID、大量建立會議、觸發 Supabase 配額耗盡 | 加入 IP-based rate limiting（如 `next-rate-limit` 或 Vercel Edge Middleware） |
| 3 | 🟡 **中** | **Supabase 錯誤訊息透傳** | `api/meetings/route.ts` 等 | `apiError(error.message, 500)` 直接將 Supabase 錯誤訊息回傳給客戶端，可能洩漏資料庫 schema 資訊 | 生產環境應回傳通用錯誤訊息，將 `error.message` 記入日誌 |
| 4 | 🟡 **中** | **無 CSRF Token** | POST routes | 雖然 `sameSite: "lax"` 提供基本 CSRF 防護，但 `lax` 允許 top-level navigation 的 GET 請求帶 cookie。POST 路由較安全，但若未來有 GET mutation 會有風險 | 目前可接受，但應避免任何 GET 路由產生副作用 |
| 5 | 🟡 **中** | **無 CSP Header** | `next.config.ts` | 未設定 Content-Security-Policy，若出現 XSS 漏洞無額外防線 | 加入 CSP header（至少 `script-src 'self'`） |
| 6 | 🟢 **低** | **會議連結公開存取** | `api/meetings/[id]/route.ts` | GET 單一會議無需認證（設計上需要，因為是分享連結），但暴露了 UUID 猜測問題 | UUID v4 的碰撞率極低，目前可接受 |
| 7 | 🟢 **低** | **無日誌框架** | 全專案 | 僅使用 `console.error`，無結構化日誌，難以在生產環境追蹤安全事件 | 可引入 `pino` 或依賴 Vercel 內建日誌 |

### 安全性修復優先級

```
[P0] POST /api/meetings 加入認證守衛     → 防止未授權建立會議
[P1] Rate limiting 加入核心 API           → 防止暴力攻擊與配額耗盡
[P1] Supabase 錯誤訊息不直接回傳          → 防止資料庫 schema 洩漏
[P2] CSP Header                          → XSS 額外防線
[P3] 結構化日誌                           → 安全事件追蹤
```

---

## 四、UI/UX 分析

### ✅ UI/UX 優點

| 面向 | 細節 |
|------|------|
| **主題切換零閃爍** | `<head>` blocking script + CSS Variables + `useSyncExternalStore` 三層防護，首次渲染即正確主題 |
| **完整 Design Token 系統** | `globals.css` 定義 ~80 個 CSS 變數，涵蓋 text / surface / border / accent / status / grid / scrollbar / code / badge，light/dark 對稱 |
| **Sidebar 互動精緻** | 桌面 hover 展開（60px → 300px，`motion.div` 流暢動畫）+ 行動裝置全螢幕 overlay（AnimatePresence） |
| **Focus Trap** | Mobile sidebar 開啟時 Tab 鍵被限制在 overlay 內，支援 Escape 關閉、`aria-modal="true"` |
| **Time Grid 完整 a11y** | `role="grid"` + `role="gridcell"` + `aria-label` + `aria-selected`，支援方向鍵 / Enter / Space / Home / End 鍵盤導覽 |
| **觸控支援** | Time grid 支援 `onTouchStart` / `onTouchMove`，拖曳選取在行動裝置正常運作 |
| **Toast 無障礙** | `role="status"` + `aria-live="polite"`，螢幕閱讀器自動朗讀 |
| **Glass Morphism + 回退** | `backdrop-filter: blur()` + `@supports not (backdrop-filter: blur(1px))` 回退方案 |
| **Reduced Motion 支持** | `prefers-reduced-motion` 關閉 blur 動畫和降低視覺效果 |
| **AuthGuard UX** | Loading spinner → Lock icon + Discord 登入按鈕 → 正常內容，漸進式體驗 |
| **Empty State CTA** | Dashboard 空狀態有「前往 Discord」按鈕，引導使用者開始建立會議 |
| **Loading / Error 完整** | 所有受保護頁面有 loading skeleton、error banner + retry 按鈕、Suspense fallback |
| **Settings 頁面** | 提供實際功能：主題切換（light/dark 按鈕化）、帳號資訊顯示、系統版本 |
| **熱力圖視覺化** | Time grid 用漸層色溫（0.2 → 0.8 opacity）直觀呈現多人可用時段 |

### ⚠️ 待改進事項

| # | 問題 | 嚴重度 | 說明 | 建議 |
|---|------|--------|------|------|
| 1 | **`text-faint` = `text-muted` in light mode** | 🔴 高 | 兩者在 light mode 均為 `#6b7280`，語意區分失效。`text-faint` 應比 `text-muted` 更淡。Dark mode 正確（`#a3a3a3` vs `#8b8b8b`） | 將 light mode `text-faint` 改為 `#9ca3af` 或 `#94a3b8` |
| 2 | **Color Contrast 不足** | 🟡 中 | `text-faint`（`#6b7280`）在 light background（`#f5f7fa`）上的對比度 ~4.5:1 剛好達標，但 `text-muted` 在某些 surface 上可能低於 WCAG AA | 確認所有 text-faint / text-muted 與其背景組合均達 4.5:1 |
| 3 | **Sidebar 重定向不精確** | 🟡 中 | 未登入使用者點擊 Meetings / Settings 連結，一律重定向到 `?redirect=dashboard` 而非目標頁面 | 改為 `?redirect=${link.href.slice(1)}` |
| 4 | **無 skip-to-content** | 🟡 中 | 鍵盤使用者必須 Tab 通過整個 Sidebar 才能到達主內容區 | 加入 `<a href="#main" class="sr-only focus:not-sr-only">` |
| 5 | **Time Grid focus 視覺回饋** | 🟡 中 | 雖有 keyboard navigation 但 focused cell 缺少明顯的 outline/ring 視覺指示 | 加入 `focus-visible:ring-2 ring-accent` 樣式 |
| 6 | **error.tsx 硬編碼顏色** | 🟢 低 | 使用 `border-red-200`、`bg-red-50` 等 Tailwind 直接顏色而非 `--danger-*` design token | 改用 `border-danger-border bg-danger-bg text-danger-text` |
| 7 | **AuthGuard 不傳遞目標 URL** | 🟢 低 | AuthGuard 的「登入」按鈕導向 `/api/auth/discord?redirect=${pageName}` 但 `pageName` 是 prop 字串而非 URL path | 確保 redirect 參數準確反映當前 URL |
| 8 | **無 Breadcrumb** | 🟢 低 | 進入 `/meeting/[id]` 後沒有返回導覽 | 可在 meeting-header 加入回上一頁的 breadcrumb |
| 9 | **中文硬編碼** | 🟢 低 | 所有 UI 文字硬編碼為繁體中文，無 i18n 架構 | 若需多語系支援，可引入 `next-intl`。目前純中文使用場景可接受 |

---

## 五、效能與渲染分析

### ✅ 效能良好實踐

| 面向 | 細節 |
|------|------|
| **Blocking 主題腳本** | `<head>` script 在 paint 前設定 `<html>` class，零 FOUC |
| **CSS Variables 主題切換** | 切換僅改 `<html>` class → CSS 變數立即切換，零 JS re-render |
| **`useMemo` / `useCallback`** | `slotCounts`（`useMemo`）、`moveFocus` / `handleGridKeyDown`（`useCallback`）避免不必要重渲染 |
| **Next.js Image** | Avatar 使用 `<Image>` 元件（搭配 `unoptimized`，避免 Discord CDN 引起的 optimization 問題） |
| **分頁機制** | GET /api/meetings 支援 `limit` / `offset` 分頁，`DEFAULT_LIMIT=50`，`MAX_LIMIT=100` |
| **Cache-Control** | GET /api/meetings 設定 `private, max-age=30, stale-while-revalidate=60` |
| **Bundle Analyzer** | `@next/bundle-analyzer` 已配置（`ANALYZE=true`），可量化依賴大小 |
| **serverExternalPackages** | `next.config.ts` 將 `discord.js` 設為 server external，不會被 webpack bundle |
| **Supabase 單例** | 全域 `createClient()` 避免重複初始化 |
| **Glass Morphism 回退** | `@supports not (backdrop-filter)` + `prefers-reduced-motion` 降低低端裝置負擔 |
| **Geist Font 最佳化** | 使用 `next/font/local` 的 `variable` 模式，font display swap |

### ⚠️ 效能改進空間

| # | 問題 | 嚴重度 | 說明 | 建議 |
|---|------|--------|------|------|
| 1 | **UserContext 無快取** | 🟡 中 | `UserProvider` 每次 mount 都 fetch `/api/auth/me`，頁面切換時重複請求 | 考慮 SWR/React Query 或 localStorage 短暫快取 |
| 2 | **前端未使用分頁** | 🟡 中 | API 支援分頁，但 Dashboard / Meetings 前端仍一次載入所有會議（`useMeetings` hook 預設 `limit=50`） | 實作前端分頁/無限捲動 |
| 3 | **Landing Page 非靜態** | 🟢 低 | `page.tsx` 是純展示頁面但未標記 `export const dynamic = "force-static"`，每次請求都走 SSR | 明確設定為靜態生成 |
| 4 | **Avatar `unoptimized`** | 🟢 低 | Time grid 中的 avatar 使用 `unoptimized`，跳過 Next.js Image 最佳化 | 可設定 `remotePatterns` 並移除 `unoptimized` 以利用 Image Optimization（已有 Discord CDN pattern 配置） |
| 5 | **Time Grid DOM 量** | 🟢 低 | 15 小時 × N 天 = 潛在大量 DOM 節點。日常使用（7 天 = 105 cells）可控 | 若支援 30+ 天，考慮 virtualized grid |
| 6 | **`discord.js` 在 `node_modules`** | 🟢 低 | 雖然 `serverExternalPackages` 阻止 client bundle，但 `discord.js` 完整 SDK (~15MB) 仍佔據 `node_modules` 和部署大小 | 改用 `@discordjs/builders` + `@discordjs/rest` |

---

## 六、可維護性與擴展性分析

### ✅ 可維護性優點

| 面向 | 細節 |
|------|------|
| **CI Pipeline** | GitHub Actions 設定 lint → type-check → build 三階段自動檢查 |
| **`.env.example`** | 列出所有必要的環境變數與說明 |
| **JSDoc 完整** | API routes、lib 函式、hooks 均有中文 JSDoc 註解，說明參數和回傳值 |
| **Design Token 文件化** | `globals.css` 結構清晰，有明確的分區註解（Text / Surface / Border / Grid 等） |
| **資料庫文件** | `docs/database-schema.md` 有完整的 ERD + 欄位說明 |
| **錯誤邊界** | `error.tsx` + `global-error.tsx` 雙層捕獲，避免白螢幕 |
| **Path Alias** | `@/*` path alias，import 路徑清晰 |
| **Barrel Export** | `discord/index.ts`、`supabase/index.ts` 統一出口 |
| **`cn()` 統一管理** | 所有 `className` 透過 `cn()` 管理，保持一致性 |
| **Interactions Handler 模組化** | Discord webhook 邏輯拆分至 `handlers/` 目錄，每個 command 獨立檔案 |
| **Database Types** | `database.types.ts` 提供完整的 Row / Insert / Update 型別 + `TimeSlot` 介面 |
| **環境變數安全** | `env.ts` 統一驗證 + `server-only` 防洩漏 |
| **Migration SQL** | `supabase/schema.sql` 可重現資料庫結構 |

### ⚠️ 待改進事項

| # | 問題 | 嚴重度 | 說明 | 建議 |
|---|------|--------|------|------|
| 1 | **無測試框架** | 🔴 高 | 完全沒有 vitest / jest / playwright。無法驗證 `oauth-state.ts`、API routes、`date-helpers.ts` 等核心邏輯 | 引入 `vitest` + React Testing Library，至少覆蓋 lib/ 和 API routes |
| 2 | **README 為模板** | 🟡 中 | `README.md` 仍是 `create-next-app` 預設內容，缺少專案描述、安裝步驟、架構說明 | 撰寫專案專屬的 README |
| 3 | **無 pre-commit hooks** | 🟡 中 | 沒有 husky / lint-staged，可能推上不合格的程式碼 | 加入 `husky` + `lint-staged`（lint + type-check on commit） |
| 4 | **硬編碼時區** | 🟡 中 | Time grid 使用本地瀏覽器時區，多時區成員看到不同時間 | 在 meeting 建立時記錄時區，或在 UI 顯示 UTC offset |
| 5 | **無 API 文件** | 🟢 低 | 缺少 OpenAPI/Swagger 或至少 Markdown API 文件 | 至少在 README 或 docs/ 中列出所有 API 端點 |
| 6 | **無 Contribution Guide** | 🟢 低 | 缺乏開發者 onboarding 指南 | 建立 CONTRIBUTING.md |
| 7 | **Migration 管理薄弱** | 🟢 低 | 僅有 `schema.sql` 和一個 `001_add_avatar_hash.sql`，無自動化 migration 工具 | 若表結構頻繁變動，引入 Supabase CLI migration 或 Drizzle |

---

## 📊 總結評分

| 維度 | 評分 | 等級 | 較上次變化 |
|------|------|------|-----------|
| **技術堆疊與依賴** | 8.5 / 10 | ⭐⭐⭐⭐☆ | ↔ 持平（`discord.js` 仍可瘦身） |
| **架構與程式碼品質** | 8.5 / 10 | ⭐⭐⭐⭐☆ | ↑ 上升（API 格式統一、handler 模組化、提取共用 hook/元件） |
| **安全性** | 7.5 / 10 | ⭐⭐⭐⭐☆ | ↑↑ 大幅上升（httpOnly ✓、session 身分 ✓、timingSafeEqual ✓、RLS ✓），POST meetings 仍缺守衛 |
| **UI/UX** | 8.5 / 10 | ⭐⭐⭐⭐☆ | ↑ 上升（keyboard nav ✓、aria ✓、AuthGuard ✓），`text-faint`/`text-muted` 語意衝突待修 |
| **效能與渲染** | 8.0 / 10 | ⭐⭐⭐⭐☆ | ↑ 上升（分頁 ✓、快取 ✓、bundle analyzer ✓），前端分頁未銜接 |
| **可維護性與擴展性** | 8.0 / 10 | ⭐⭐⭐⭐☆ | ↑ 上升（CI ✓、.env.example ✓、error boundary ✓），仍缺測試 |
| **綜合** | **8.2 / 10** | ⭐⭐⭐⭐☆ | 從 ~7.3 上升至 8.2，進步顯著 |

---

## 🎯 改善建議（依優先級排列）

### P0 — 必須立即修復

| # | 改善項目 | 影響 | 預估工作量 |
|---|---------|------|-----------|
| 1 | POST /api/meetings 加入 `requireSession()` 認證 | 防止未授權建立會議 | 5 分鐘 |

### P1 — 短期改善

| # | 改善項目 | 影響 | 預估工作量 |
|---|---------|------|-----------|
| 2 | 引入 `vitest` + 核心邏輯測試（oauth-state, auth, api-response, date-helpers） | 長期品質保障 | 2-3 小時 |
| 3 | Rate limiting on API routes | 防暴力攻擊、配額耗盡 | 1 小時 |
| 4 | 修復 `text-faint` = `text-muted` 色彩衝突 | 設計系統一致性 | 5 分鐘 |
| 5 | Supabase error message 不直接回傳客戶端 | 防 schema 洩漏 | 30 分鐘 |

### P2 — 中期優化

| # | 改善項目 | 影響 | 預估工作量 |
|---|---------|------|-----------|
| 6 | Sidebar 重定向使用實際目標路徑 | UX 精確性 | 10 分鐘 |
| 7 | 加入 skip-to-content + Time grid focus 視覺回饋 | 無障礙完整性 | 30 分鐘 |
| 8 | error.tsx 改用 design token | 設計系統一致性 | 15 分鐘 |
| 9 | 撰寫專案 README | 團隊協作 | 30 分鐘 |
| 10 | CSP Header | 安全深度防禦 | 30 分鐘 |
| 11 | `discord.js` → `@discordjs/builders` + `@discordjs/rest` | 減少 ~15MB | 1 小時 |

### P3 — 長期完善

| # | 改善項目 | 影響 | 預估工作量 |
|---|---------|------|-----------|
| 12 | pre-commit hooks（husky + lint-staged） | 防止推上不合格碼 | 20 分鐘 |
| 13 | 前端分頁/無限捲動 | 大量會議時效能 | 1-2 小時 |
| 14 | UserContext 加入快取（SWR / localStorage） | 減少重複 API 請求 | 30 分鐘 |
| 15 | Landing page force-static | SSR → SSG 減少計算 | 5 分鐘 |
| 16 | 時區處理 | 跨時區使用者正確顯示 | 2 小時 |
| 17 | 結構化日誌（pino） | 生產環境監控 | 1 小時 |
| 18 | 移除 `shadcn` devDep | 精簡依賴 | 5 分鐘 |

---

## 📝 審計結論

此專案在經過先前的改善週期後，整體品質已達到 **生產就緒的門檻**。核心安全問題（httpOnly cookie、session 身分認證、timing-safe 比較、RLS 收緊）均已妥善修復，架構清晰度和可維護性也有顯著提升。

**最關鍵的單一問題**是 `POST /api/meetings` 缺少認證守衛 — 這是唯一仍存在的 P0 安全漏洞，修復僅需 5 分鐘。

**最大的結構性缺口**是完全沒有自動化測試 — 建議優先引入 `vitest` 並覆蓋 lib/ 目錄的核心邏輯。

其餘問題均為 P2-P3 等級的漸進式優化，不影響功能正確性和基本安全性。
