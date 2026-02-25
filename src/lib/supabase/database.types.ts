/**
 * Supabase Database 型別定義
 *
 * 對應的 SQL schema：
 *
 * CREATE TABLE meetings (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   description TEXT,
 *   participants_count INTEGER NOT NULL DEFAULT 0,
 *   date_range_start DATE NOT NULL,
 *   date_range_end DATE NOT NULL,
 *   creator_discord_id TEXT NOT NULL,
 *   creator_username TEXT NOT NULL,
 *   guild_id TEXT,
 *   channel_id TEXT,
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 * );
 *
 * CREATE TABLE meeting_responses (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
 *   discord_id TEXT NOT NULL,
 *   username TEXT NOT NULL,
 *   available_slots JSONB NOT NULL DEFAULT '[]',
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   UNIQUE(meeting_id, discord_id)
 * );
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      meetings: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          participants_count: number;
          date_range_start: string;
          date_range_end: string;
          creator_discord_id: string;
          creator_username: string;
          guild_id: string | null;
          channel_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          participants_count?: number;
          date_range_start: string;
          date_range_end: string;
          creator_discord_id: string;
          creator_username: string;
          guild_id?: string | null;
          channel_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          participants_count?: number;
          date_range_start?: string;
          date_range_end?: string;
          creator_discord_id?: string;
          creator_username?: string;
          guild_id?: string | null;
          channel_id?: string | null;
          updated_at?: string;
        };
      };
      meeting_responses: {
        Row: {
          id: string;
          meeting_id: string;
          discord_id: string;
          username: string;
          available_slots: TimeSlot[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          discord_id: string;
          username: string;
          available_slots?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          meeting_id?: string;
          discord_id?: string;
          username?: string;
          available_slots?: Json;
          updated_at?: string;
        };
      };
    };
  };
};

/**
 * 時段型別 — When2Meet 風格的可用時段
 * date: "2025-01-20"
 * hour: 9 (= 09:00 ~ 10:00)
 */
export interface TimeSlot {
  date: string;
  hour: number;
}

// 便捷型別
export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
export type MeetingInsert = Database["public"]["Tables"]["meetings"]["Insert"];
export type MeetingResponse = Database["public"]["Tables"]["meeting_responses"]["Row"];
export type MeetingResponseInsert = Database["public"]["Tables"]["meeting_responses"]["Insert"];
