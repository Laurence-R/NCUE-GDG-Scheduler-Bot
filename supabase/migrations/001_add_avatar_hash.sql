-- 為 meeting_responses 新增 avatar_hash 欄位
-- 用來儲存 Discord 頭像 hash，以便在網頁上顯示用戶頭像
ALTER TABLE meeting_responses ADD COLUMN IF NOT EXISTS avatar_hash TEXT;
