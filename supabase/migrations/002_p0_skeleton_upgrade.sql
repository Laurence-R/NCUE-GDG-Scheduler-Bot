-- P0 Migration: 基礎骨架改造
-- 對應 task-plan.md 任務 0-1, 0-2, 0-3, 0-4

-- 移除 participants_count 欄位（改由 meeting_members 動態計算）
ALTER TABLE meetings DROP COLUMN IF EXISTS participants_count;

-- 0-2: meetings 表新增 duration_minutes 欄位（會議預計時長）
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60;

-- 0-3: meetings 表新增 role_id 欄位（目標身分組 ID）
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS role_id TEXT;

-- 0-1: 新增 meeting_members 表（會議建立時的成員快照）
CREATE TABLE IF NOT EXISTS meeting_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_hash TEXT,
  is_organizer BOOLEAN NOT NULL DEFAULT FALSE,
  filled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(meeting_id, discord_id)
);

CREATE INDEX IF NOT EXISTS idx_members_meeting ON meeting_members(meeting_id);
CREATE INDEX IF NOT EXISTS idx_members_discord ON meeting_members(discord_id);

-- 0-4: 既有 available_slots JSONB 資料遷移（hour → hour + minute）
-- 將現有的 { date, hour } 格式轉換為 { date, hour, minute: 0 }
UPDATE meeting_responses
SET available_slots = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'date', slot->>'date',
        'hour', (slot->>'hour')::int,
        'minute', 0
      )
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(available_slots) AS slot
)
WHERE jsonb_array_length(available_slots) > 0;
