import "server-only";

import type { TimeSlot, MeetingResponse } from "./supabase/database.types";

/**
 * 時段計算結果
 */
export interface BestSlotResult {
  /** 起始 slot */
  start: TimeSlot;
  /** 結束 slot（不含） */
  end: TimeSlot;
  /** 可出席的成員 discord_id 列表 */
  availableMembers: string[];
  /** 總可出席人數 */
  count: number;
  /** 發起人是否可出席 */
  organizerAvailable: boolean;
}

/**
 * 將 TimeSlot 轉換為可排序的分鐘數（自 date 起始 00:00 的偏移）
 */
function slotToKey(slot: TimeSlot): string {
  return `${slot.date}-${String(slot.hour).padStart(2, "0")}-${String(slot.minute).padStart(2, "0")}`;
}

/**
 * 將 TimeSlot 轉換為絕對分鐘數（用於排序與連續性檢查）
 */
function slotToAbsoluteMinutes(slot: TimeSlot): number {
  // 以 2000-01-01 為基準日計算絕對分鐘數
  const daysSinceEpoch = Math.floor(
    (Date.parse(slot.date) - Date.parse("2000-01-01")) / 86400000
  );
  return daysSinceEpoch * 1440 + slot.hour * 60 + slot.minute;
}

/**
 * 從絕對分鐘數還原為 TimeSlot
 */
function absoluteMinutesToSlot(absMinutes: number): TimeSlot {
  const baseDateMs = Date.parse("2000-01-01");
  const totalDays = Math.floor(absMinutes / 1440);
  const remaining = absMinutes - totalDays * 1440;
  const hour = Math.floor(remaining / 60);
  const minute = remaining % 60;

  const dateMs = baseDateMs + totalDays * 86400000;
  const d = new Date(dateMs);
  const date = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

  return { date, hour, minute };
}

/**
 * 建立每個 slot 的可用成員 Map
 *
 * @returns Map<slotKey, Set<discord_id>>
 */
function buildAvailabilityMap(
  responses: Pick<MeetingResponse, "discord_id" | "available_slots">[]
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const resp of responses) {
    for (const slot of resp.available_slots) {
      const key = slotToKey(slot);
      let set = map.get(key);
      if (!set) {
        set = new Set();
        map.set(key, set);
      }
      set.add(resp.discord_id);
    }
  }

  return map;
}

/**
 * 收集所有出現過的 slot，依時間排序
 */
function collectSortedSlots(
  responses: Pick<MeetingResponse, "available_slots">[]
): TimeSlot[] {
  const seen = new Set<string>();
  const slots: TimeSlot[] = [];

  for (const resp of responses) {
    for (const slot of resp.available_slots) {
      const key = slotToKey(slot);
      if (!seen.has(key)) {
        seen.add(key);
        slots.push(slot);
      }
    }
  }

  return slots.sort(
    (a, b) => slotToAbsoluteMinutes(a) - slotToAbsoluteMinutes(b)
  );
}

/**
 * 找出最佳連續時段（考慮發起人權重）
 *
 * 演算法：
 * 1. 收集所有 slot 並建立可用成員 Map
 * 2. 掃描所有連續 N 分鐘的視窗
 * 3. 計算每個視窗的「分數」：
 *    - 發起人可用 → 分數 = memberCount * 10000（絕對優先）
 *    - 發起人不可用 → 分數 = memberCount
 * 4. 回傳分數最高的視窗，若同分則取最早的
 *
 * @param responses  所有回覆（含 available_slots）
 * @param organizerId  發起人 discord_id
 * @param durationMinutes  需要的連續時段長度（分鐘）
 * @returns 排序後的最佳時段列表（最多 10 個）
 */
export function findBestSlots(
  responses: Pick<MeetingResponse, "discord_id" | "available_slots">[],
  organizerId: string,
  durationMinutes: number
): BestSlotResult[] {
  if (responses.length === 0) return [];

  const availMap = buildAvailabilityMap(responses);
  const allSlots = collectSortedSlots(responses);

  if (allSlots.length === 0) return [];

  // 需要的連續 30 分鐘 block 數量
  const blocksNeeded = Math.ceil(durationMinutes / 30);
  const results: BestSlotResult[] = [];

  // 滑動視窗
  for (let i = 0; i <= allSlots.length - blocksNeeded; i++) {
    const windowSlots = allSlots.slice(i, i + blocksNeeded);

    // 檢查是否連續（每個 slot 間隔恰好 30 分鐘）
    let continuous = true;
    for (let j = 1; j < windowSlots.length; j++) {
      const prev = slotToAbsoluteMinutes(windowSlots[j - 1]);
      const curr = slotToAbsoluteMinutes(windowSlots[j]);
      if (curr - prev !== 30) {
        continuous = false;
        break;
      }
    }
    if (!continuous) continue;

    // 找出所有 block 都可用的成員（交集）
    let commonMembers: Set<string> | null = null;
    for (const slot of windowSlots) {
      const members = availMap.get(slotToKey(slot));
      if (!members || members.size === 0) {
        commonMembers = new Set();
        break;
      }
      if (commonMembers === null) {
        commonMembers = new Set(members);
      } else {
        for (const id of commonMembers) {
          if (!members.has(id)) commonMembers.delete(id);
        }
      }
    }

    if (!commonMembers || commonMembers.size === 0) continue;

    const endSlot = absoluteMinutesToSlot(
      slotToAbsoluteMinutes(windowSlots[windowSlots.length - 1]) + 30
    );

    results.push({
      start: windowSlots[0],
      end: endSlot,
      availableMembers: Array.from(commonMembers),
      count: commonMembers.size,
      organizerAvailable: commonMembers.has(organizerId),
    });
  }

  // 排序：發起人可用 > 人數多 > 時間早
  results.sort((a, b) => {
    // 發起人權重最高
    if (a.organizerAvailable !== b.organizerAvailable) {
      return a.organizerAvailable ? -1 : 1;
    }
    // 同等權重下比人數
    if (a.count !== b.count) return b.count - a.count;
    // 同人數比時間先後
    return (
      slotToAbsoluteMinutes(a.start) - slotToAbsoluteMinutes(b.start)
    );
  });

  return results.slice(0, 10);
}
