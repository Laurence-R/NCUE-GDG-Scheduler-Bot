# 📦 資料庫結構說明

> GDG Scheduler Bot 使用 **Supabase (PostgreSQL)** 作為後端資料庫。  
> SQL Schema 檔案位於 `supabase/schema.sql`，TypeScript 型別定義位於 `src/lib/supabase/database.types.ts`。

---

## 資料表總覽

| 資料表 | 說明 | 主要用途 |
|--------|------|----------|
| `meetings` | 會議排程 | 儲存每場會議的基本資訊 |
| `meeting_responses` | 會議回覆（可用時段） | 每位使用者針對某場會議填寫的 When2Meet 可用時段 |

---

## `meetings` — 會議排程表

| 欄位 | 型別 | 必填 | 預設值 | 說明 |
|------|------|------|--------|------|
| `id` | `TEXT` | ✅ | — | **主鍵**。格式為 `MTG-{Base36時間戳}`，由 Bot 自動產生 |
| `name` | `TEXT` | ✅ | — | 會議名稱（例如「GDG 週會」） |
| `description` | `TEXT` | ❌ | `NULL` | 會議描述 / 議程備註 |
| `participants_count` | `INTEGER` | ✅ | `0` | 預計參與人數 |
| `date_range_start` | `DATE` | ✅ | — | 可選日期範圍的起始日 |
| `date_range_end` | `DATE` | ✅ | — | 可選日期範圍的結束日 |
| `creator_discord_id` | `TEXT` | ✅ | — | 發起人的 Discord User ID |
| `creator_username` | `TEXT` | ✅ | — | 發起人的 Discord 顯示名稱 |
| `guild_id` | `TEXT` | ❌ | `NULL` | 發起該會議的 Discord 伺服器 ID |
| `channel_id` | `TEXT` | ❌ | `NULL` | 發起該會議的 Discord 頻道 ID |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | 建立時間（自動） |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | 更新時間（自動由 Trigger 維護） |

### 索引

| 索引名稱 | 欄位 | 用途 |
|----------|------|------|
| `idx_meetings_creator` | `creator_discord_id` | 快速查詢某使用者建立的會議 |
| `idx_meetings_created_at` | `created_at DESC` | 依建立時間排序查詢 |

---

## `meeting_responses` — 會議回覆表

| 欄位 | 型別 | 必填 | 預設值 | 說明 |
|------|------|------|--------|------|
| `id` | `UUID` | ✅ | `gen_random_uuid()` | **主鍵**，自動產生 UUID |
| `meeting_id` | `TEXT` | ✅ | — | **外鍵** → `meetings(id)`，關聯的會議 ID |
| `discord_id` | `TEXT` | ✅ | — | 回覆者的 Discord User ID |
| `username` | `TEXT` | ✅ | — | 回覆者的 Discord 顯示名稱 |
| `available_slots` | `JSONB` | ✅ | `'[]'` | 可用時段陣列（見下方說明） |
| `created_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | 建立時間（自動） |
| `updated_at` | `TIMESTAMPTZ` | ✅ | `NOW()` | 更新時間（自動由 Trigger 維護） |

### 唯一約束

```
UNIQUE(meeting_id, discord_id)
```

每位使用者針對每場會議只能有一筆回覆（重複提交會 upsert 覆蓋）。

### 索引

| 索引名稱 | 欄位 | 用途 |
|----------|------|------|
| `idx_responses_meeting` | `meeting_id` | 快速查詢某場會議的所有回覆 |
| `idx_responses_discord` | `discord_id` | 快速查詢某使用者的所有回覆 |

---

## `available_slots` JSONB 格式

`available_slots` 欄位儲存的是一個 `TimeSlot[]` 陣列，每個元素代表一個「一小時」的可用時段：

```typescript
interface TimeSlot {
  date: string;  // 日期，格式 "YYYY-MM-DD"（例如 "2025-01-20"）
  hour: number;  // 小時，範圍 8~21（代表 08:00~09:00 到 21:00~22:00）
}
```

### 範例

```json
[
  { "date": "2025-01-20", "hour": 9 },
  { "date": "2025-01-20", "hour": 10 },
  { "date": "2025-01-20", "hour": 14 },
  { "date": "2025-01-21", "hour": 9 },
  { "date": "2025-01-21", "hour": 15 }
]
```

上面表示該使用者在：
- 1/20 的 09:00~11:00、14:00~15:00 有空
- 1/21 的 09:00~10:00、15:00~16:00 有空

---

## Row Level Security (RLS)

兩張資料表都啟用了 RLS，政策如下：

| 資料表 | 操作 | 政策名稱 | 規則 | 說明 |
|--------|------|----------|------|------|
| `meetings` | `SELECT` | `meetings_select_all` | `USING (true)` | 所有人可讀取所有會議 |
| `meetings` | `INSERT` | `meetings_insert_anon` | `WITH CHECK (true)` | 允許透過 API 新增會議 |
| `meeting_responses` | `SELECT` | `responses_select_all` | `USING (true)` | 所有人可讀取所有回覆 |
| `meeting_responses` | `INSERT` | `responses_insert_anon` | `WITH CHECK (true)` | 允許透過 API 新增回覆 |
| `meeting_responses` | `UPDATE` | `responses_update_own` | `USING (true)` | 允許更新回覆（upsert 用） |

> **備註**：目前 RLS 政策較為寬鬆（全部允許），是因為權限控制由 API Route 層處理。未來可依需求收緊。

---

## Trigger

| 觸發器名稱 | 資料表 | 事件 | 函式 | 說明 |
|------------|--------|------|------|------|
| `meetings_updated_at` | `meetings` | `BEFORE UPDATE` | `update_updated_at()` | 每次更新時自動設定 `updated_at = NOW()` |
| `meeting_responses_updated_at` | `meeting_responses` | `BEFORE UPDATE` | `update_updated_at()` | 每次更新時自動設定 `updated_at = NOW()` |

---

## 🗺️ 資料關聯圖

```
┌─────────────────────────┐
│       meetings          │
├─────────────────────────┤
│ id (PK)                 │◄──────┐
│ name                    │       │
│ description             │       │
│ participants_count      │       │
│ date_range_start        │       │
│ date_range_end          │       │
│ creator_discord_id      │       │
│ creator_username        │       │
│ guild_id                │       │
│ channel_id              │       │
│ created_at              │       │
│ updated_at              │       │
└─────────────────────────┘       │
                                  │ FK (ON DELETE CASCADE)
┌─────────────────────────┐       │
│   meeting_responses     │       │
├─────────────────────────┤       │
│ id (PK, UUID)           │       │
│ meeting_id (FK) ────────│───────┘
│ discord_id              │
│ username                │
│ available_slots (JSONB) │
│ created_at              │
│ updated_at              │
├─────────────────────────┤
│ UNIQUE(meeting_id,      │
│        discord_id)      │
└─────────────────────────┘
```

---

## TypeScript 便捷型別

定義於 `src/lib/supabase/database.types.ts`：

```typescript
type Meeting              // meetings 表的完整 Row（查詢結果）
type MeetingInsert        // meetings 表的 Insert 型別（新增時使用）
type MeetingResponse      // meeting_responses 表的完整 Row
type MeetingResponseInsert // meeting_responses 表的 Insert 型別
type TimeSlot             // { date: string; hour: number }
```
