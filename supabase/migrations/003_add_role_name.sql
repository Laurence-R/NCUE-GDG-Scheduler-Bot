-- 003: 新增 role_name 欄位，用於前端顯示角色標籤
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS role_name TEXT;
