-- GDG Scheduler Bot — Supabase Schema
-- 在 Supabase Dashboard → SQL Editor 中執行此檔案

-- 會議資料表
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  participants_count INTEGER NOT NULL DEFAULT 0,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  creator_discord_id TEXT NOT NULL,
  creator_username TEXT NOT NULL,
  guild_id TEXT,
  channel_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 會議回覆資料表（When2Meet 風格的可用時段）
CREATE TABLE IF NOT EXISTS meeting_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_hash TEXT,
  available_slots JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(meeting_id, discord_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_meetings_creator ON meetings(creator_discord_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_meeting ON meeting_responses(meeting_id);
CREATE INDEX IF NOT EXISTS idx_responses_discord ON meeting_responses(discord_id);

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER meeting_responses_updated_at
  BEFORE UPDATE ON meeting_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS（Row Level Security）
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_responses ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取會議（公開）
CREATE POLICY "meetings_select_all" ON meetings
  FOR SELECT USING (true);

-- 允許所有人讀取回覆（公開）
CREATE POLICY "responses_select_all" ON meeting_responses
  FOR SELECT USING (true);

-- 透過 service role 或 anon key 新增（由 API 控制權限）
CREATE POLICY "meetings_insert_anon" ON meetings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "responses_insert_anon" ON meeting_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "responses_update_own" ON meeting_responses
  FOR UPDATE USING (true);
