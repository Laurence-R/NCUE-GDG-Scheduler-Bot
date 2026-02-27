# GDG Discord Scheduler Bot — 專案規格文件

> **版本**：1.0.0  
> **最後更新**：2025-07-14  
> **狀態**：Production-ready  
> **文件類型**：完整專案規格（Full Project Specification）

---

## 目錄

1. [專案概述](#1-專案概述)
2. [技術棧總覽](#2-技術棧總覽)
3. [系統架構](#3-系統架構)
4. [目錄結構](#4-目錄結構)
5. [資料庫設計](#5-資料庫設計)
6. [API 端點規格](#6-api-端點規格)
7. [認證與授權機制](#7-認證與授權機制)
8. [Discord Bot 互動流程](#8-discord-bot-互動流程)
9. [前端頁面與元件架構](#9-前端頁面與元件架構)
10. [設計系統與主題](#10-設計系統與主題)
11. [環境變數參考](#11-環境變數參考)
12. [部署指南](#12-部署指南)
13. [CI/CD 管線](#13-cicd-管線)
14. [安全模型](#14-安全模型)
15. [效能與最佳化](#15-效能與最佳化)
16. [已知限制與未來規劃](#16-已知限制與未來規劃)

---

## 1. 專案概述

### 1.1 產品定位

**GDG Discord Scheduler Bot** 是一個結合 Discord Bot 與 Web 應用的會議排程系統，類似 When2Meet。使用者可透過 Discord Slash Command 建立會議，系統自動產生回覆連結，團隊成員透過 Web 介面選擇可用時段，並以視覺化熱力圖呈現最佳共同時間。

### 1.2 核心功能

| 功能 | 說明 |
|------|------|
| 📅 建立會議 | 透過 Discord `/scheduler meeting` 指令，填寫 Modal 表單建立排程 |
| ✏️ 填寫時段 | OAuth2 登入後，在 Web 頁面以拖曳式時間格點選擇可用時段 |
| 📊 熱力圖 | 即時視覺化所有成員的可用時段重疊情況 |
| 🏠 儀表板 | 個人會議列表，區分「進行中」與「已結束」|
| 🔍 會議搜尋 | 全域會議列表，支援名稱 / ID 搜尋過濾 |
| 🌙 深色/淺色主題 | localStorage 持久化的主題切換 |
| 🔐 Discord OAuth2 | 無需獨立註冊，直接使用 Discord 帳號認證 |

### 1.3 使用者流程

```
使用者在 Discord 發送 /scheduler meeting
         │
         ▼
  Bot 彈出 Modal 表單（名稱、人數、日期、描述）
         │
         ▼
  使用者填寫後提交 → Bot 儲存到 Supabase
         │
         ▼
  Bot 回覆 Embed + 「填寫可用時間」按鈕（OAuth2 Link）
         │
         ▼
  成員點擊按鈕 → Discord OAuth2 → 導向 /meeting/[id]
         │
         ▼
  在 Web 時間格點選可用時段 → POST /api/meetings/[id]/respond
         │
         ▼
  熱力圖即時更新，顯示最佳共同時間
```

---

## 2. 技術棧總覽

### 2.1 核心框架

| 技術 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.1.6 | React 全端框架（App Router） |
| **React** | 19.2.3 | UI 函式庫 |
| **TypeScript** | ^5 | 靜態型別，strict mode |
| **Tailwind CSS** | v4 | 原子化 CSS（`@theme inline` 語法） |

### 2.2 後端服務

| 技術 | 版本 | 用途 |
|------|------|------|
| **Supabase** | @supabase/supabase-js ^2.97.0 | PostgreSQL 資料庫 + REST API |
| **discord.js** | ^14.25.1 | Slash Command 註冊（REST API only） |
| **tweetnacl** | ^1.0.3 | Ed25519 簽名驗證（Discord Interaction） |

### 2.3 前端附加

| 技術 | 版本 | 用途 |
|------|------|------|
| **@tabler/icons-react** | ^3.37.1 | SVG 圖示庫 |
| **motion** | ^12.34.3 | 動畫庫（Framer Motion） |
| **clsx** + **tailwind-merge** | ^2.1.1 / ^3.5.0 | `cn()` 工具函式，合併 class |
| **tw-animate-css** | ^1.4.0 | Tailwind 動畫 CSS 擴充 |

### 2.4 開發工具

| 技術 | 用途 |
|------|------|
| **ESLint** (v9) + eslint-config-next | 程式碼品質 |
| **@next/bundle-analyzer** | 打包分析 |
| **tsx** | TypeScript 腳本執行（指令註冊） |
| **dotenv** | .env 檔案載入 |
| **shadcn** (v3.8.5) | UI 元件腳手架 |

### 2.5 部署平台

| 平台 | 用途 |
|------|------|
| **Vercel** | Next.js 應用託管（Serverless） |
| **Supabase Cloud** | PostgreSQL 資料庫託管 |
| **GitHub Actions** | CI/CD 持續整合 |

---

## 3. 系統架構

### 3.1 架構圖

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Discord Platform                            │
│                                                                      │
│  User ─── /scheduler meeting ──► Discord API ──► Webhook POST ──┐   │
│  User ─── /scheduler dashboard ─► Discord API ──► Webhook POST ──┤   │
│                                                                  │   │
└──────────────────────────────────────────────────────────────────┼───┘
                                                                   │
                                                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     Vercel (Next.js 16 App Router)                    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ API Routes (Server-side, Edge Runtime capable)                  │ │
│  │                                                                 │ │
│  │  POST /api/discord/interactions   ← Ed25519 verification       │ │
│  │    ├── handleMeetingCommand()     → Modal (type: 9)            │ │
│  │    ├── handleDashboardCommand()   → Embed + Button (type: 4)   │ │
│  │    └── handleModalSubmit()        → Supabase INSERT + Embed    │ │
│  │                                                                 │ │
│  │  GET  /api/auth/discord           → Discord OAuth2 redirect    │ │
│  │  GET  /api/auth/callback          → Token exchange + Cookie    │ │
│  │  POST /api/auth/logout            → Clear Cookie               │ │
│  │  GET  /api/auth/me                → Read session from Cookie   │ │
│  │                                                                 │ │
│  │  GET  /api/meetings               → List meetings (paginated)  │ │
│  │  POST /api/meetings               → Create meeting (web)       │ │
│  │  GET  /api/meetings/[id]          → Meeting detail + responses │ │
│  │  POST /api/meetings/[id]/respond  → Submit available slots     │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Pages (Client-side React, CSR)                                  │ │
│  │                                                                 │ │
│  │  /                    Landing page (public)                     │ │
│  │  /dashboard           會議儀表板 (AuthGuard)                     │ │
│  │  /meetings            所有會議列表 (AuthGuard)                    │ │
│  │  /settings            使用者設定 (AuthGuard)                      │ │
│  │  /meeting/[id]        個別會議頁面 (public, 登入後可填寫)          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     Supabase Cloud (PostgreSQL)                       │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────────────┐               │
│  │    meetings       │◄──│   meeting_responses       │               │
│  │  (TEXT PK)        │    │  (UUID PK, FK→meetings)  │               │
│  └──────────────────┘    └──────────────────────────┘               │
│                                                                      │
│  RLS: DISABLED（由 API 層 requireSession() 負責權限控制）             │
│  連線方式: SUPABASE_SERVICE_ROLE_KEY（繞過 RLS）                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 資料流

| 路徑 | 說明 |
|------|------|
| Discord → Vercel → Supabase | 使用者透過 Slash Command 建立會議 |
| Browser → Vercel → Supabase | 使用者透過 Web 填寫時段 / 查看會議 |
| Discord → Vercel → Discord OAuth2 → Vercel → Browser | 認證流程（OAuth2 授權碼模式） |

---

## 4. 目錄結構

```
discord-scheduler-bot/
├── .github/
│   ├── prompts/
│   │   └── ui-ux-pro-max.prompt.md      # UI/UX 設計 AI Prompt
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI
│
├── docs/
│   └── PROJECT_SPECIFICATION.md          # 本規格文件
│
├── scripts/
│   └── register-commands.ts              # Discord Slash Command 註冊腳本
│
├── supabase/
│   ├── schema.sql                        # 資料庫 DDL
│   └── migrations/
│       └── 001_create_tables.sql         # 初始遷移
│
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root Layout (ThemeProvider, UserProvider)
│   │   ├── page.tsx                      # Landing Page (/)
│   │   ├── globals.css                   # Tailwind v4 + CSS 變數 (383 行)
│   │   ├── error.tsx                     # 頁面層級錯誤邊界
│   │   ├── global-error.tsx              # Root Layout 層級錯誤邊界
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # 儀表板頁面
│   │   │
│   │   ├── meetings/
│   │   │   └── page.tsx                  # 所有會議列表頁面
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx                  # 使用者設定頁面
│   │   │
│   │   ├── meeting/[id]/
│   │   │   ├── page.tsx                  # 會議詳細頁面入口
│   │   │   ├── _components/
│   │   │   │   ├── meeting-content.tsx   # 主要內容容器
│   │   │   │   ├── meeting-header.tsx    # 會議標題資訊
│   │   │   │   ├── time-grid.tsx         # 時間格點（核心互動元件）
│   │   │   │   ├── grid-legend.tsx       # 格點圖例
│   │   │   │   ├── login-status.tsx      # 登入狀態提示
│   │   │   │   ├── save-button.tsx       # 儲存按鈕
│   │   │   │   ├── responses-summary.tsx # 回覆成員列表
│   │   │   │   └── toast-notification.tsx# Toast 通知
│   │   │   ├── _hooks/
│   │   │   │   ├── use-meeting-data.ts   # 載入會議 + 回覆資料
│   │   │   │   ├── use-time-grid.ts      # 拖曳選取邏輯
│   │   │   │   └── use-toast.ts          # Toast 狀態管理
│   │   │   └── _utils/
│   │   │       └── date-helpers.ts       # 日期範圍 / 格式化工具
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── discord/route.ts      # OAuth2 授權入口
│   │       │   ├── callback/route.ts     # OAuth2 回呼
│   │       │   ├── logout/route.ts       # 登出
│   │       │   └── me/route.ts           # 取得目前使用者
│   │       ├── meetings/
│   │       │   ├── route.ts              # 會議列表 + 建立 (GET/POST)
│   │       │   └── [id]/
│   │       │       ├── route.ts          # 會議詳情 (GET)
│   │       │       └── respond/route.ts  # 提交可用時段 (POST)
│   │       └── discord/
│   │           └── interactions/
│   │               ├── route.ts          # Discord Webhook 入口
│   │               └── handlers/
│   │                   ├── index.ts      # Barrel export
│   │                   ├── meeting-command.ts    # /scheduler meeting
│   │                   ├── dashboard-command.ts  # /scheduler dashboard
│   │                   └── modal-submit.ts       # Modal 表單提交
│   │
│   ├── components/
│   │   ├── auth-guard.tsx                # 認證守衛元件
│   │   └── ui/
│   │       ├── app-sidebar.tsx           # 左側導航欄
│   │       ├── sidebar.tsx               # Sidebar 原子元件
│   │       └── error-banner.tsx          # 錯誤橫幅
│   │
│   ├── contexts/
│   │   ├── theme-context.tsx             # 深色/淺色主題 Context
│   │   └── user-context.tsx              # 使用者狀態 Context
│   │
│   ├── hooks/
│   │   └── use-meetings.ts              # 會議列表 Hook
│   │
│   └── lib/
│       ├── api-response.ts              # 統一 API 回應格式
│       ├── auth.ts                      # Session Cookie 管理
│       ├── avatar.ts                    # Discord 大頭貼 URL 產生
│       ├── env.ts                       # 環境變數集中驗證
│       ├── oauth-state.ts              # HMAC-SHA256 OAuth State
│       ├── utils.ts                    # cn() 工具函式
│       ├── supabase/
│       │   ├── client.ts              # Supabase 客戶端（Proxy 延遲初始化）
│       │   ├── database.types.ts      # TypeScript 型別定義
│       │   └── index.ts               # Barrel export
│       └── discord/
│           ├── commands.ts            # Slash Command 定義
│           ├── register.ts            # Command 註冊邏輯
│           ├── verify.ts             # Ed25519 驗證
│           └── index.ts              # Barrel export
│
├── public/                            # 靜態資源（favicon 等）
├── .env.example                       # 環境變數範本
├── .gitignore
├── components.json                    # shadcn/ui 設定
├── next.config.ts                     # Next.js 設定（images domains）
├── package.json
├── postcss.config.mjs                 # PostCSS + Tailwind
├── tsconfig.json                      # TypeScript 設定（strict, paths）
└── eslint.config.mjs                  # ESLint 9 flat config
```

---

## 5. 資料庫設計

### 5.1 ER 圖

```
┌─────────────────────────────────────────┐
│                meetings                  │
├─────────────────────────────────────────┤
│ id                TEXT        PK         │
│ name              TEXT        NOT NULL   │
│ description       TEXT        NULLABLE   │
│ participants_count INTEGER    DEFAULT 0  │
│ date_range_start  DATE       NOT NULL    │
│ date_range_end    DATE       NOT NULL    │
│ creator_discord_id TEXT      NOT NULL    │
│ creator_username  TEXT       NOT NULL    │
│ guild_id          TEXT       NULLABLE    │
│ channel_id        TEXT       NULLABLE    │
│ created_at        TIMESTAMPTZ DEFAULT NOW()│
│ updated_at        TIMESTAMPTZ DEFAULT NOW()│
└────────────────────┬────────────────────┘
                     │ 1
                     │
                     │ ✱ (ON DELETE CASCADE)
                     │
┌────────────────────┴────────────────────┐
│           meeting_responses              │
├─────────────────────────────────────────┤
│ id                UUID       PK (auto)   │
│ meeting_id        TEXT       FK→meetings │
│ discord_id        TEXT       NOT NULL    │
│ username          TEXT       NOT NULL    │
│ avatar_hash       TEXT       NULLABLE    │
│ available_slots   JSONB      DEFAULT '[]'│
│ created_at        TIMESTAMPTZ DEFAULT NOW()│
│ updated_at        TIMESTAMPTZ DEFAULT NOW()│
├─────────────────────────────────────────┤
│ UNIQUE(meeting_id, discord_id)           │
└─────────────────────────────────────────┘
```

### 5.2 索引

| 索引名稱 | 欄位 | 用途 |
|----------|------|------|
| `idx_meetings_creator` | `meetings(creator_discord_id)` | 快速查詢使用者建立的會議 |
| `idx_meetings_created_at` | `meetings(created_at DESC)` | 排序最新會議 |
| `idx_responses_meeting` | `meeting_responses(meeting_id)` | 查詢會議的所有回覆 |
| `idx_responses_discord` | `meeting_responses(discord_id)` | 查詢使用者的所有回覆 |

### 5.3 Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

- `meetings_updated_at` — BEFORE UPDATE ON meetings
- `meeting_responses_updated_at` — BEFORE UPDATE ON meeting_responses

### 5.4 `available_slots` JSONB 結構

```json
[
  { "date": "2025-01-20", "hour": 9 },
  { "date": "2025-01-20", "hour": 10 },
  { "date": "2025-01-21", "hour": 14 }
]
```

TypeScript 型別：
```typescript
export interface TimeSlot {
  date: string;  // YYYY-MM-DD
  hour: number;  // 8-22 (整點)
}
```

### 5.5 Meeting ID 格式

會議 ID 採用自訂格式：`MTG-{timestamp_base36}`

範例：`MTG-1P5A2B3C`

由 `Date.now().toString(36).toUpperCase()` 產生，確保唯一性。

### 5.6 RLS 策略

**目前狀態：已停用（DISABLED）**

安全性由應用層的 `requireSession()` 函式負責，Supabase 使用 `service_role` key 連線，本就繞過 RLS。

---

## 6. API 端點規格

### 6.1 概覽

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| GET | `/api/auth/discord` | ✗ | Discord OAuth2 授權入口 |
| GET | `/api/auth/callback` | ✗ | OAuth2 回呼（Token 交換） |
| POST | `/api/auth/logout` | ✗ | 清除 Session Cookie |
| GET | `/api/auth/me` | ✗ | 取得目前登入使用者 |
| GET | `/api/meetings` | ✓ requireSession | 會議列表（分頁） |
| POST | `/api/meetings` | ✓ requireSession | 建立會議（Web） |
| GET | `/api/meetings/[id]` | ✗ | 會議詳情 + 回覆 |
| POST | `/api/meetings/[id]/respond` | ✓ getSessionUser | 提交可用時段 |
| POST | `/api/discord/interactions` | ✓ Ed25519 | Discord Webhook |

### 6.2 詳細規格

#### `GET /api/auth/discord`

OAuth2 授權入口，重新導向至 Discord 授權頁面。

**Query Parameters：**
| 參數 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `redirect` | string | `"dashboard"` | 授權後的導向目標（`dashboard` 或 `MTG-xxx`）|

**回應：** 302 Redirect → Discord OAuth2 URL

**State 參數：** 使用 HMAC-SHA256 簽章，包含 redirect 目標、nonce、過期時間（10 分鐘）。

---

#### `GET /api/auth/callback`

Discord OAuth2 回呼端點。

**Query Parameters：**
| 參數 | 型別 | 說明 |
|------|------|------|
| `code` | string | Discord 授權碼 |
| `state` | string | HMAC 簽章的 state 參數 |

**流程：**
1. 驗證 state 的 HMAC 簽章與過期時間
2. 用 authorization code 交換 access token
3. 取得 Discord 使用者資訊（`/users/@me`）
4. 寫入 `discord_user` httpOnly Cookie（7 天有效）
5. 根據 state 中的 redirect 目標重新導向

**回應：** 302 Redirect → `/dashboard?login=success` 或 `/meeting/{id}`

**錯誤回應：**
| 狀態碼 | 說明 |
|--------|------|
| 400 | 缺少授權碼 |
| 401 | Token 交換失敗 / 無法取得使用者資訊 |
| 403 | 無效或過期的 state |

---

#### `GET /api/auth/me`

取得目前登入使用者的資訊。

**回應：**
```json
{
  "data": {
    "user": {
      "id": "123456789",
      "username": "使用者名稱",
      "avatar": "abc123hash",
      "avatar_url": "https://cdn.discordapp.com/avatars/123456789/abc123hash.png"
    }
  }
}
```

未登入時 `user` 為 `null`。

---

#### `POST /api/auth/logout`

清除 Session Cookie。

**回應：**
```json
{ "data": { "success": true } }
```

---

#### `GET /api/meetings`

取得會議列表（需登入，支援分頁）。

**Query Parameters：**
| 參數 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `discord_id` | string | — | 篩選特定使用者的會議 |
| `limit` | number | 50 | 每頁筆數（上限 100） |
| `offset` | number | 0 | 偏移量 |

**回應：**
```json
{
  "data": { "meetings": [...] },
  "pagination": { "total": 42, "limit": 50, "offset": 0 }
}
```

**快取：** `Cache-Control: private, max-age=30, stale-while-revalidate=60`

---

#### `POST /api/meetings`

透過 Web 介面建立會議（需登入）。

**Request Body：**
```json
{
  "id": "MTG-ABC123",
  "name": "GDG 週會",
  "description": "每週例行會議",
  "participants_count": 10,
  "date_range_start": "2025-01-20",
  "date_range_end": "2025-01-25",
  "guild_id": "optional",
  "channel_id": "optional"
}
```

> **安全性：** `creator_discord_id` 與 `creator_username` 從 Session 取得，不信任 Request Body。

**回應：** 201 Created
```json
{ "data": { "meeting": { ... } } }
```

---

#### `GET /api/meetings/[id]`

取得單一會議詳情與所有回覆（不需登入）。

**回應：**
```json
{
  "data": {
    "meeting": { ... },
    "responses": [
      {
        "id": "uuid",
        "discord_id": "123",
        "username": "user",
        "avatar_hash": "hash",
        "available_slots": [{ "date": "2025-01-20", "hour": 9 }]
      }
    ]
  }
}
```

---

#### `POST /api/meetings/[id]/respond`

提交或更新個人可用時段（需登入）。

**Request Body：**
```json
{
  "available_slots": [
    { "date": "2025-01-20", "hour": 9 },
    { "date": "2025-01-20", "hour": 10 }
  ]
}
```

> **安全性：** 使用者身分從 httpOnly Cookie 取得，`discord_id` / `username` / `avatar_hash` 不由客戶端傳入。

**Upsert 策略：** 以 `(meeting_id, discord_id)` 為衝突鍵，同一使用者只能有一筆回覆。

**回應：**
```json
{ "data": { "response": { ... } } }
```

---

#### `POST /api/discord/interactions`

Discord Interaction Webhook 端點。

**驗證：** 使用 tweetnacl 驗證 Ed25519 簽名（`X-Signature-Ed25519` + `X-Signature-Timestamp`）。

**處理的互動類型：**

| Type | 說明 | 處理函式 |
|------|------|----------|
| 1 | PING | 回傳 `{ type: 1 }` |
| 2 | Application Command | `handleApplicationCommand()` |
| 5 | Modal Submit | `handleModalSubmit()` |

**子指令路由：**

| 子指令 | 回應 |
|--------|------|
| `/scheduler meeting` | Modal（type: 9）— 建立會議表單 |
| `/scheduler dashboard` | Embed + Link Button（type: 4）— OAuth2 登入連結 |

### 6.3 統一回應格式

所有 API 回應遵循統一格式，由 `apiOk()` / `apiError()` 產生：

**成功回應：**
```json
{
  "data": { ... },
  "pagination": { "total": 0, "limit": 50, "offset": 0 }  // optional
}
```

**錯誤回應：**
```json
{
  "error": "錯誤訊息"
}
```

---

## 7. 認證與授權機制

### 7.1 認證流程概覽

```
┌────────┐   GET /api/auth/discord    ┌──────────────┐
│ Browser │ ──────────────────────────► │ Vercel API   │
│         │                            │              │
│         │ ◄─── 302 Redirect ──────── │ createState()│
│         │      (Discord OAuth URL)   └──────────────┘
│         │
│         │   使用者授權               ┌──────────────┐
│         │ ──────────────────────────► │ Discord OAuth │
│         │                            │              │
│         │ ◄─── 302 + code + state ── │              │
│         │                            └──────────────┘
│         │
│         │   GET /api/auth/callback   ┌──────────────┐
│         │ ──────────────────────────► │ Vercel API   │
│         │                            │              │
│         │                            │ verifyState()│
│         │                            │ exchangeToken│
│         │                            │ fetchUser()  │
│         │                            │ setCookie()  │
│         │ ◄─── 302 + Set-Cookie ──── │              │
└────────┘      (discord_user)         └──────────────┘
```

### 7.2 Session 管理

| 項目 | 值 |
|------|-----|
| Cookie 名稱 | `discord_user` |
| 格式 | JSON `{ id, username, avatar }` |
| httpOnly | ✓ |
| secure | 生產環境 ✓ |
| sameSite | `lax` |
| maxAge | 7 天（604800 秒） |
| path | `/` |

### 7.3 CSRF 防護（OAuth State）

OAuth State 參數使用 HMAC-SHA256 簽章機制：

```typescript
// State 結構
interface StatePayload {
  redirect: string;   // "dashboard" 或 "MTG-xxx"
  nonce: string;      // 16 bytes hex
  exp: number;        // Unix timestamp (10 分鐘後過期)
}

// 簽章格式：base64url(payload).base64url(hmac-sha256(payload))
// Key: DISCORD_CLIENT_SECRET
```

**驗證流程：**
1. Base64URL 解碼 payload 與 signature
2. 重新計算 HMAC-SHA256，比對簽名
3. 檢查 `exp` 是否過期（10 分鐘有效期）

### 7.4 權限控制層級

| 層級 | 機制 | 適用端點 |
|------|------|----------|
| Discord Webhook | Ed25519 簽名驗證 | `/api/discord/interactions` |
| API 層 — 強制登入 | `requireSession()` | `GET/POST /api/meetings` |
| API 層 — 取用身分 | `getSessionUser()` | `POST /api/meetings/[id]/respond` |
| 前端元件 | `<AuthGuard>` | Dashboard, Meetings, Settings |
| 資料庫層 | RLS 已停用 | — |

### 7.5 AuthGuard 元件

```tsx
// 前端認證守衛：攔截未登入使用者，顯示 Discord 登入按鈕
<AuthGuard pageName="儀表板">
  <DashboardContent />
</AuthGuard>
```

狀態機：
- `loading` → 顯示 Spinner
- `未登入` → 顯示登入卡片（Discord OAuth 按鈕）
- `已登入` → 渲染子元件

---

## 8. Discord Bot 互動流程

### 8.1 Slash Command 定義

```typescript
// /scheduler meeting  — 建立會議
// /scheduler dashboard — 開啟儀表板
const schedulerCommand = new SlashCommandBuilder()
  .setName("scheduler")
  .setDescription("GDG 會議排程工具")
  .addSubcommand(sub => sub
    .setName("meeting")
    .setDescription("建立新的會議排程"))
  .addSubcommand(sub => sub
    .setName("dashboard")
    .setDescription("開啟你的會議儀表板"));
```

### 8.2 指令註冊

```bash
npm run register
# 等同於：npx tsx scripts/register-commands.ts
```

使用 discord.js 的 `REST` API 向 Discord 應用程式全域註冊指令。需要 `DISCORD_APP_ID` 與 `DISCORD_BOT_TOKEN`。

### 8.3 /scheduler meeting 流程

```
1. 使用者輸入 /scheduler meeting
2. Discord 發送 POST → /api/discord/interactions (type: 2)
3. handleMeetingCommand() 回傳 Modal (type: 9)
4. Discord 顯示 Modal 表單：
   ┌─────────────────────────────────────┐
   │  建立會議排程                        │
   │                                     │
   │  會議名稱: [                    ]    │
   │  預計參與人數: [                ]    │
   │  日期範圍: [                    ]    │
   │  會議描述: [                    ]    │
   │                                     │
   │        [取消]    [提交]              │
   └─────────────────────────────────────┘
5. 使用者填寫並提交
6. Discord 發送 POST → /api/discord/interactions (type: 5)
7. handleModalSubmit() 執行：
   a. 解析 Modal 欄位
   b. 驗證日期格式 (YYYY-MM-DD ~ YYYY-MM-DD)
   c. 插入 Supabase meetings 表
   d. 產生 OAuth2 登入 URL（含 HMAC State）
   e. 回傳 Embed + "填寫可用時間" Link Button
8. Discord 顯示 Embed：
   ┌─────────────────────────────────────┐
   │  📅 GDG 週會                        │
   │  每週例行會議                        │
   │                                     │
   │  📋 會議 ID: MTG-1P5A2B3C          │
   │  👥 預計人數: 10                    │
   │  📆 日期範圍: 2025-01-20 ~ 01-25   │
   │  👤 發起人: @user                   │
   │                                     │
   │  [✏️ 填寫可用時間]                  │
   └─────────────────────────────────────┘
```

### 8.4 /scheduler dashboard 流程

```
1. 使用者輸入 /scheduler dashboard
2. Discord 發送 POST → /api/discord/interactions (type: 2)
3. handleDashboardCommand() 回傳 Embed (type: 4, ephemeral)
4. Discord 顯示 Ephemeral 訊息：
   ┌─────────────────────────────────────┐
   │  📊 GDG 會議排程儀表板              │
   │  透過 Discord 帳號登入即可查看       │
   │  你的會議歷史與目前排程。            │
   │                                     │
   │  [🔗 開啟儀表板]                    │
   └─────────────────────────────────────┘
```

### 8.5 Interaction 安全驗證

```typescript
// Ed25519 簽名驗證（tweetnacl）
function verifyKey(body: string, signature: string, timestamp: string): boolean {
  const message = Buffer.from(timestamp + body);
  const sig = Buffer.from(signature, "hex");
  const pubKey = Buffer.from(DISCORD_PUBLIC_KEY, "hex");
  return nacl.sign.detached.verify(message, sig, pubKey);
}
```

---

## 9. 前端頁面與元件架構

### 9.1 頁面總覽

| 路徑 | 認證 | 描述 |
|------|------|------|
| `/` | 公開 | Landing Page — 產品介紹、功能特色、CTA 按鈕 |
| `/dashboard` | AuthGuard | 儀表板 — 統計指標、進行中/已結束會議卡片 |
| `/meetings` | AuthGuard | 全部會議列表 — 搜尋、篩選 |
| `/settings` | AuthGuard | 設定 — 主題切換、帳號資訊、登出 |
| `/meeting/[id]` | 公開（登入可編輯） | 會議詳情 — 時間格、熱力圖、回覆列表 |

### 9.2 元件樹狀結構

```
RootLayout
├── ThemeProvider (Context)
├── UserProvider (Context)
├── AppSidebar
│   ├── SidebarHeader (Logo + Branding)
│   ├── SidebarContent
│   │   ├── SidebarMenu
│   │   │   ├── MenuItem: 儀表板 (/dashboard)
│   │   │   ├── MenuItem: 會議 (/meetings)
│   │   │   └── MenuItem: 設定 (/settings)
│   │   └── SidebarMenu (外部連結)
│   │       └── MenuItem: GitHub ↗
│   └── SidebarFooter (UserCard / LoginButton)
│
├── Landing Page (/)
│   ├── Hero Section (漸層背景、CTA)
│   ├── Features Grid (3 列功能卡片)
│   └── How It Works (3 步驟說明)
│
├── Dashboard (/dashboard) [AuthGuard]
│   ├── Stats Row (3 指標：進行中/總數/已結束)
│   ├── Current Meetings (MeetingCard[])
│   └── Past Meetings (MeetingCard[])
│
├── Meetings (/meetings) [AuthGuard]
│   ├── Search Bar
│   └── Meeting List (Link→/meeting/[id])
│
├── Settings (/settings) [AuthGuard]
│   ├── Theme Section (淺色/深色切換)
│   ├── Account Section (Discord 帳號資訊、登出)
│   └── About Section (版本資訊)
│
└── Meeting Detail (/meeting/[id])
    ├── MeetingHeader (名稱、日期、人數)
    ├── LoginStatus (登入/訪客提示)
    ├── TimeGrid (核心互動 — 拖曳選取)
    ├── GridLegend (圖例)
    ├── SaveButton (儲存可用時段)
    ├── ResponsesSummary (已回覆成員)
    └── ToastNotification (固定底部通知)
```

### 9.3 核心元件 — TimeGrid

**功能：** 類似 When2Meet 的時間格點，支援拖曳選取/取消。

**互動方式：**
- **滑鼠拖曳：** mousedown 開始 → mouseenter 延伸 → mouseup 結束
- **觸控拖曳：** touchstart → touchmove (elementFromPoint) → touchend
- **鍵盤操控：** 方向鍵移動焦點、Enter/Space 切換選取

**視覺化：**
- 已選取格子：顯示使用者 Discord 大頭貼或 ✓
- 其他人可用：熱力圖色彩（opacity 0.2~0.8，依人數比例）
- 無人選擇：空白格子

**時間範圍：** 08:00 ~ 22:00（每小時一個格子，共 15 小時/日）

**ARIA 無障礙：**
- `role="grid"`, `role="row"`, `role="gridcell"`
- `aria-selected`, `aria-label`
- 完整的鍵盤導航（Arrow, Home, End, Enter, Space）

### 9.4 狀態管理

| Context / Hook | 用途 | 持久化 |
|----------------|------|--------|
| `ThemeProvider` | 深色/淺色主題切換 | `localStorage("theme")` |
| `UserProvider` | 登入使用者資訊 | httpOnly Cookie → `/api/auth/me` |
| `useMeetings()` | 會議列表（全域） | 記憶體（每次 mount 重新拉取） |
| `useMeetingData()` | 單一會議 + 回覆 | 記憶體 |
| `useTimeGrid()` | 拖曳選取狀態 | 記憶體 |
| `useToast()` | Toast 通知（3.5 秒自動消失） | 記憶體 |

### 9.5 Sidebar 元件系統

基於 compound component 模式建構：

```tsx
<Sidebar>
  <SidebarHeader />
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel />
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
  <SidebarFooter />
</Sidebar>
```

特點：
- 桌面端：固定左側（寬 256px）
- 行動端：抽屜式（overlay）
- `SidebarProvider` 管理展開/收合狀態
- `SidebarTrigger` 觸發行動端選單

---

## 10. 設計系統與主題

### 10.1 主題架構

使用 Tailwind CSS v4 的 `@theme inline` 定義 CSS 變數，搭配 `data-theme` 屬性切換：

```css
:root {
  /* 預設淺色主題 */
  --background: #f8f9fc;
  --accent: #5865f2;
  --text-primary: #1a1a2e;
  /* ... 共 ~80 個變數 */
}

[data-theme="dark"] {
  --background: #0a0a0f;
  --accent: #7289da;
  --text-primary: #e8e8f0;
  /* ... */
}
```

### 10.2 設計語言

| 特徵 | 實現 |
|------|------|
| **玻璃態 (Glassmorphism)** | `.glass-card` — `backdrop-filter: blur(12px)`, 半透明背景 |
| **圓角** | 大範圍 `rounded-2xl`（16px）|
| **陰影** | 多層 box-shadow + 微妙的 inset glow |
| **色彩** | 以 Discord Blurple (`#5865F2`) 為主色調 |
| **字型** | 系統字型堆疊（無外部字型載入） |
| **動畫** | `tw-animate-css` 提供過渡動畫 |

### 10.3 CSS 變數分類

| 分類 | 變數前綴 | 數量 | 範例 |
|------|----------|------|------|
| 背景 | `--background`, `--surface-*` | ~6 | `--surface-hover`, `--glass-bg` |
| 文字 | `--text-*` | ~5 | `--text-primary`, `--text-muted`, `--text-faint` |
| 強調色 | `--accent*` | ~8 | `--accent`, `--accent-hover`, `--accent-ring` |
| 邊框 | `--border*` | ~4 | `--border`, `--border-hover`, `--border-subtle` |
| 狀態色 | `--success-*`, `--warning-*`, `--danger-*` | ~15 | `--success-bg`, `--danger-border` |
| 格點 | `--grid-*` | ~4 | `--grid-heat-color`, `--grid-cell-bg` |
| 程式碼 | `--code-*` | ~2 | `--code-bg`, `--code` |
| 側邊欄 | `--sidebar-*` | ~8 | `--sidebar-bg`, `--sidebar-accent` |

### 10.4 自訂 CSS Class

```css
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px -4px var(--card-shadow), ...;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.meeting-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 32px -4px var(--card-shadow-hover);
  border-color: var(--card-border-hover);
}

.time-grid-cell { /* 互動式格子樣式 */ }
.time-grid-cell.selected { border: 2px solid var(--accent); }
```

---

## 11. 環境變數參考

### 11.1 必要變數（伺服器端）

| 變數 | 說明 | 範例 |
|------|------|------|
| `DISCORD_APP_ID` | Discord Application ID | `1234567890` |
| `DISCORD_PUBLIC_KEY` | Discord 公鑰（Ed25519 驗證） | `abcdef...` |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 Client Secret | `secret...` |
| `DISCORD_REDIRECT_URI` | OAuth2 回呼 URL | `https://example.com/api/auth/callback` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key（繞過 RLS） | `eyJ...` |

### 11.2 必要變數（公開/雙端）

| 變數 | 說明 | 範例 |
|------|------|------|
| `NEXT_PUBLIC_APP_URL` | 應用程式基礎 URL | `https://example.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key | `eyJ...` |

### 11.3 選用變數

| 變數 | 說明 | 用途 |
|------|------|------|
| `DISCORD_BOT_TOKEN` | Discord Bot Token | 僅用於指令註冊腳本 |
| `SUPABASE_URL` | Supabase URL（覆蓋 NEXT_PUBLIC_） | Server-only 使用 |

### 11.4 變數載入時機

| 模組 | 載入時機 | 驗證方式 |
|------|----------|----------|
| `lib/env.ts` | import 時（eager） | `requireEnv()` → 缺少則 throw |
| `lib/supabase/client.ts` | 首次使用時（lazy） | Proxy + `getSupabase()` |

> **重要：** Supabase 客戶端使用 Proxy 延遲初始化，避免 Next.js build 階段因缺少環境變數而失敗。

---

## 12. 部署指南

### 12.1 前置需求

1. **Discord Application** — [Discord Developer Portal](https://discord.com/developers/applications)
   - 建立應用程式，取得 App ID、Public Key、Client Secret
   - 設定 OAuth2 Redirect URI
   - 設定 Bot Token（用於指令註冊）
   - 設定 Interactions Endpoint URL → `https://{your-domain}/api/discord/interactions`

2. **Supabase 專案** — [Supabase Dashboard](https://supabase.com/dashboard)
   - 建立專案，取得 URL、Anon Key、Service Role Key
   - 在 SQL Editor 中執行 `supabase/schema.sql`

3. **Vercel 帳號** — [Vercel Dashboard](https://vercel.com)

### 12.2 Vercel 部署步驟

```bash
# 1. 連結 GitHub Repository
# 2. 在 Vercel Dashboard → Settings → Environment Variables 設定所有必要變數：
#    DISCORD_APP_ID
#    DISCORD_PUBLIC_KEY
#    DISCORD_CLIENT_SECRET
#    DISCORD_REDIRECT_URI=https://{your-domain}/api/auth/callback
#    NEXT_PUBLIC_APP_URL=https://{your-domain}
#    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
#    SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← 關鍵！缺少此項會導致會議無法建立
# 3. Deploy
```

### 12.3 Discord Bot 設定

```bash
# 註冊 Slash Command（一次性操作）
npm run register

# 需要在 .env.local 中設定：
# DISCORD_APP_ID
# DISCORD_BOT_TOKEN
```

### 12.4 本地開發

```bash
# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env.local
# 編輯 .env.local 填入所有變數

# 啟動開發伺服器
npm run dev

# 資料庫（在 Supabase SQL Editor 中）
# 執行 supabase/schema.sql
```

### 12.5 常見部署問題

| 問題 | 原因 | 解決方案 |
|------|------|----------|
| 資料庫寫入失敗 | `SUPABASE_SERVICE_ROLE_KEY` 未設定 | 在 Vercel 環境變數中加入 |
| Discord 指令無回應 | Interactions Endpoint URL 未設定 | Discord Developer Portal → General → Interactions Endpoint URL |
| OAuth2 loop | `DISCORD_REDIRECT_URI` 不匹配 | 確保與 Discord OAuth2 設定完全一致 |
| Build 失敗 | 環境變數缺少 | 確認所有 `NEXT_PUBLIC_*` 變數已設定 |

---

## 13. CI/CD 管線

### 13.1 GitHub Actions 工作流程

```yaml
name: CI
on:
  push: [main]
  pull_request: [main]

jobs:
  ci:
    name: Lint → Type-check → Build
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Node.js 20 (npm cache)
      - npm ci
      - npm run lint        # ESLint 9
      - npx tsc --noEmit    # TypeScript 嚴格型別檢查
      - npm run build       # Next.js 生產建置（含 placeholder env vars）
```

### 13.2 CI 環境變數

CI 使用 placeholder 值，僅供 build 通過（不執行 runtime 功能）：

```yaml
env:
  DISCORD_APP_ID: ci-placeholder
  DISCORD_PUBLIC_KEY: ci-placeholder
  DISCORD_CLIENT_SECRET: ci-placeholder
  DISCORD_REDIRECT_URI: http://localhost:3000/api/auth/callback
  NEXT_PUBLIC_APP_URL: http://localhost:3000
  NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ci-placeholder
```

> **注意：** `SUPABASE_SERVICE_ROLE_KEY` 不在 CI 中設定，因為 Supabase 客戶端使用 Proxy 延遲初始化，build 時不會觸發環境變數檢查。

---

## 14. 安全模型

### 14.1 安全措施總覽

```
┌───────────────────────────────────────────────────────┐
│                    Security Layers                     │
│                                                       │
│  Layer 1: Discord Webhook                             │
│  ├── Ed25519 簽名驗證 (tweetnacl)                     │
│  └── 防止偽造 Discord 互動請求                         │
│                                                       │
│  Layer 2: OAuth2 State                                │
│  ├── HMAC-SHA256 簽章 (DISCORD_CLIENT_SECRET)         │
│  ├── 10 分鐘過期                                      │
│  └── 一次性 nonce 防止重放攻擊                         │
│                                                       │
│  Layer 3: Session Cookie                              │
│  ├── httpOnly (防 XSS)                                │
│  ├── secure (生產環境 HTTPS-only)                     │
│  ├── sameSite: lax (防 CSRF)                          │
│  └── 7 天自動過期                                     │
│                                                       │
│  Layer 4: API Route Guards                            │
│  ├── requireSession() — 401 for unauthenticated       │
│  ├── 身分從 Cookie 取得，不信任 Request Body            │
│  └── POST /api/meetings → session.id as creator       │
│                                                       │
│  Layer 5: Frontend Guards                             │
│  ├── AuthGuard 元件攔截未登入使用者                    │
│  └── UserContext 同步 session 狀態                     │
│                                                       │
│  Layer 6: Supabase                                    │
│  ├── service_role key (server-only, 透過 Proxy)       │
│  ├── `server-only` 模組防止客戶端引入                  │
│  └── RLS disabled (由 API 層負責權限)                  │
│                                                       │
│  Layer 7: Build-time                                  │
│  ├── env.ts 啟動時驗證必要環境變數                     │
│  └── TypeScript strict mode 編譯時檢查                │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### 14.2 身分信任邊界

| 端點 | 身分來源 | 說明 |
|------|----------|------|
| `POST /api/meetings` | `session.id` / `session.username` | 不信任 request body 中的 creator 欄位 |
| `POST /api/meetings/[id]/respond` | `sessionUser.id/username/avatar` | 完全從 Cookie 取得 |
| `handleModalSubmit()` | `interaction.member.user.id` | Discord 保證的身分 |

### 14.3 Secrets 管理

| Secret | 存儲位置 | 開發 | 生產 |
|--------|----------|------|------|
| `DISCORD_CLIENT_SECRET` | `.env.local` / Vercel | 手動設定 | Vercel env vars |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` / Vercel | 手動設定 | Vercel env vars |
| `DISCORD_BOT_TOKEN` | `.env.local` only | 手動設定 | 不需要（僅用於指令註冊） |

### 14.4 `server-only` 保護

`src/lib/supabase/client.ts` 匯入 `server-only` 套件，確保：
- Supabase 客戶端不會被打包進 client-side JavaScript
- `SUPABASE_SERVICE_ROLE_KEY` 不會外洩到瀏覽器

---

## 15. 效能與最佳化

### 15.1 Current Optimizations

| 優化項目 | 實現方式 |
|----------|----------|
| **API 快取** | `GET /api/meetings` — `max-age=30, stale-while-revalidate=60` |
| **Lazy Supabase** | Proxy 延遲初始化，避免 cold start 浪費 |
| **Image Optimization** | Next.js `<Image>` + `unoptimized`（Discord CDN 已優化） |
| **Client-side Rendering** | 所有頁面 `"use client"` — 互動優先 |
| **Tree Shaking** | Barrel exports + ESM |
| **Bundle Analysis** | `@next/bundle-analyzer` 可用 |
| **CSS v4** | Tailwind v4 原生 CSS（無需 PostCSS 轉換，更少 CSS 產出）|
| **Turbopack** | Next.js 16 開發模式使用 Turbopack（更快的 HMR）|

### 15.2 Next.js 設定

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },
};
```

### 15.3 TypeScript 設定

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## 16. 已知限制與未來規劃

### 16.1 已知限制

| 限制 | 說明 | 影響 |
|------|------|------|
| **單一 Cookie Session** | `discord_user` Cookie 為純 JSON，無加密 | 理論上可被篡改（建議未來加密或使用 JWT） |
| **無即時同步** | 多人同時填寫不會即時更新他人畫面 | 需要重新載入才能看到最新回覆 |
| **時段粒度** | 固定 1 小時（08:00~22:00） | 無法選擇半小時或 15 分鐘時段 |
| **無通知機制** | 會議建立後無自動提醒 | 依賴 Discord 訊息的可見度 |
| **無分頁 UI** | API 支援分頁但前端未實作 | 大量會議時可能效能下降 |
| **無測試** | 未配置任何測試框架 | 依賴 TypeScript + ESLint 靜態檢查 |
| **無 Rate Limiting** | API 端點無速率限制 | 可能被濫用（依賴 Vercel 的內建保護） |

### 16.2 建議改進

| 優先級 | 項目 | 說明 |
|--------|------|------|
| P0 | Cookie 加密 | 使用 `iron-session` 或 JWT 加密 Session Cookie |
| P1 | 即時更新 | Supabase Realtime 或 SSE 推送時段變更 |
| P1 | 單元測試 | Vitest + React Testing Library |
| P1 | Rate Limiting | API 端點加入速率限制中間件 |
| P2 | 時段粒度 | 支援 30 分鐘 / 15 分鐘時段 |
| P2 | 會議提醒 | Discord Bot 定時提醒未填寫成員 |
| P2 | 最佳時段推薦 | 自動計算並推薦最多人可用的時段 |
| P3 | 國際化 (i18n) | 支援多語言（目前為繁體中文 only） |
| P3 | 會議匯出 | 匯出 .ics 日曆檔案 |
| P3 | 管理員功能 | 會議編輯、刪除、鎖定 |

---

## 附錄

### A. 完整 API 回應型別

```typescript
// 成功回應
interface ApiOkResponse<T> {
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

// 錯誤回應
interface ApiErrorResponse {
  error: string;
}
```

### B. Discord Interaction Types

| Type | 名稱 | 本系統使用 |
|------|------|------------|
| 1 | PING | ✓ 回傳 ACK |
| 2 | APPLICATION_COMMAND | ✓ Slash Command |
| 3 | MESSAGE_COMPONENT | ✗ |
| 4 | APPLICATION_COMMAND_AUTOCOMPLETE | ✗ |
| 5 | MODAL_SUBMIT | ✓ Modal 表單提交 |

### C. Discord Response Types

| Type | 名稱 | 本系統使用 |
|------|------|------------|
| 1 | PONG | ✓ |
| 4 | CHANNEL_MESSAGE_WITH_SOURCE | ✓ Embed |
| 9 | MODAL | ✓ Modal 表單 |

### D. 全部 NPM Scripts

| Script | 指令 | 說明 |
|--------|------|------|
| `dev` | `next dev` | 開發伺服器（Turbopack） |
| `build` | `next build` | 生產建置 |
| `start` | `next start` | 啟動生產伺服器 |
| `lint` | `eslint` | ESLint 檢查 |
| `register` | `npx tsx scripts/register-commands.ts` | 註冊 Discord Slash Commands |

### E. 檔案總數

| 類別 | 數量 |
|------|------|
| TypeScript 原始碼 | ~45 檔案 |
| CSS | 1 檔案（383 行） |
| SQL | 2 檔案 |
| 設定檔 | ~10 檔案 |
| CI/CD | 1 檔案 |
| **總計** | **~65 檔案** |

---

> **文件維護者：** AI-assisted generation  
> **最後審閱：** 2025-07-14  
> **對應 commit：** 基於最新 `main` 分支
