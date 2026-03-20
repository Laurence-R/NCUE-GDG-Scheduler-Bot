import { NextResponse } from "next/server";

/** Discord REST API base URL */
const DISCORD_API = "https://discord.com/api/v10";

/** 允許發起會議的角色名稱（不區分大小寫） */
const ALLOWED_ROLE_NAMES = ["lead", "組長"];

/**
 * 透過 Discord REST API 取得伺服器所有角色
 */
async function fetchGuildRoles(
  guildId: string,
  botToken: string
): Promise<Record<string, string>> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!res.ok) return {};
  const roles: Array<{ id: string; name: string }> = await res.json();
  const map: Record<string, string> = {};
  for (const r of roles) {
    map[r.id] = r.name;
  }
  return map;
}

/**
 * /meeting build @身分組 → 驗證權限後回傳 Modal（type: 9）
 *
 * @param interaction Discord interaction payload
 * @param roleId 使用者指定的身分組 ID
 */
export async function handleMeetingCommand(
  interaction: Record<string, unknown>,
  roleId: string
) {
  // 取得發起人的角色清單
  const member = interaction.member as {
    roles?: string[];
    user?: { id: string };
  } | undefined;
  const userRoles = member?.roles ?? [];

  const guildId = interaction.guild_id as string | undefined;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  // 取得伺服器完整角色對照表（resolved.roles 只有指令參數中提到的角色，
  // 不含使用者身上的其他角色，因此需要向 Discord API 取得完整清單）
  let allRoles: Record<string, string> = {};
  if (guildId && botToken) {
    allRoles = await fetchGuildRoles(guildId, botToken);
  } else {
    // Fallback: 只用 resolved（可能不完整）
    const guild = interaction.data as {
      resolved?: { roles?: Record<string, { name: string }> };
    };
    for (const [id, role] of Object.entries(guild.resolved?.roles ?? {})) {
      allRoles[id] = role.name;
    }
  }

  // 被選擇的目標角色名稱
  const targetRoleName = allRoles[roleId] ?? "unknown";

  // 檢查發起人是否擁有 ALLOWED_ROLE_NAMES 中任一角色
  const hasPermission = userRoles.some((rId) => {
    const roleName = allRoles[rId]?.toLowerCase();
    return roleName && ALLOWED_ROLE_NAMES.includes(roleName);
  });

  if (!hasPermission) {
    return NextResponse.json({
      type: 4,
      data: {
        content: "❌ 你沒有權限建立會議。需要擁有 `@Lead` 或 `@組長` 身份。",
        flags: 64,
      },
    });
  }

  // 將 roleId 與 roleName 嵌入 Modal custom_id 以便 submit 時取得
  return NextResponse.json({
    type: 9, // MODAL
    data: {
      custom_id: `meeting_build_modal:${roleId}:${targetRoleName}`,
      title: "建立會議排程",
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_name",
              label: "會議名稱",
              style: 1,
              placeholder: "例如：GDG 週會",
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_date_range",
              label: "日期範圍（起始 ~ 結束）",
              style: 1,
              placeholder: "例如：2025-01-20 ~ 2025-01-25",
              required: true,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_duration",
              label: "會議時長（分鐘）",
              style: 1,
              placeholder: "例如：60、90、120（預設 60）",
              required: false,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: "meeting_description",
              label: "會議描述（選填）",
              style: 2,
              placeholder: "會議議程或備註...",
              required: false,
            },
          ],
        },
      ],
    },
  });
}
