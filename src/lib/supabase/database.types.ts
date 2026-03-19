/**
 * Supabase Database 型別定義
 *
 * 對應 SQL schema 請參閱 supabase/schema.sql
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
          duration_minutes: number;
          date_range_start: string;
          date_range_end: string;
          creator_discord_id: string;
          creator_username: string;
          role_id: string | null;
          role_name: string | null;
          guild_id: string | null;
          channel_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          duration_minutes?: number;
          date_range_start: string;
          date_range_end: string;
          creator_discord_id: string;
          creator_username: string;
          role_id?: string | null;
          role_name?: string | null;
          guild_id?: string | null;
          channel_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          date_range_start?: string;
          date_range_end?: string;
          creator_discord_id?: string;
          creator_username?: string;
          role_id?: string | null;
          role_name?: string | null;
          guild_id?: string | null;
          channel_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      meeting_responses: {
        Row: {
          id: string;
          meeting_id: string;
          discord_id: string;
          username: string;
          avatar_hash: string | null;
          available_slots: TimeSlot[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          discord_id: string;
          username: string;
          avatar_hash?: string | null;
          available_slots?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          meeting_id?: string;
          discord_id?: string;
          username?: string;
          avatar_hash?: string | null;
          available_slots?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meeting_responses_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
        ];
      };
      meeting_members: {
        Row: {
          id: string;
          meeting_id: string;
          discord_id: string;
          username: string;
          avatar_hash: string | null;
          is_organizer: boolean;
          filled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          discord_id: string;
          username: string;
          avatar_hash?: string | null;
          is_organizer?: boolean;
          filled_at?: string | null;
          created_at?: string;
        };
        Update: {
          meeting_id?: string;
          discord_id?: string;
          username?: string;
          avatar_hash?: string | null;
          is_organizer?: boolean;
          filled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "meeting_members_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/**
 * 時段型別 — When2Meet 風格的可用時段（30 分鐘顆粒度）
 * date: "2025-01-20"
 * hour: 9 (0~23)
 * minute: 0 | 30
 */
export interface TimeSlot {
  date: string;
  hour: number;
  minute: number;
}

// 便捷型別
export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
export type MeetingInsert = Database["public"]["Tables"]["meetings"]["Insert"];
export type MeetingResponse = Database["public"]["Tables"]["meeting_responses"]["Row"];
export type MeetingResponseInsert = Database["public"]["Tables"]["meeting_responses"]["Insert"];
export type MeetingMember = Database["public"]["Tables"]["meeting_members"]["Row"];
export type MeetingMemberInsert = Database["public"]["Tables"]["meeting_members"]["Insert"];
