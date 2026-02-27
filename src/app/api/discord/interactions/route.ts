import { NextRequest, NextResponse } from "next/server";
import { verifyKey } from "@/lib/discord/verify";
import {
  handleMeetingCommand,
  handleDashboardCommand,
  handleModalSubmit,
} from "./handlers";

/**
 * Discord Interactions Endpoint
 * POST /api/discord/interactions
 *
 * 處理所有 Discord 互動：Slash Commands、Modal Submit、Button 等
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json(
      { error: "缺少簽名標頭" },
      { status: 401 }
    );
  }

  // 驗證請求是否來自 Discord
  const isValid = verifyKey(body, signature, timestamp);
  if (!isValid) {
    return NextResponse.json(
      { error: "無效的請求簽名" },
      { status: 401 }
    );
  }

  const interaction = JSON.parse(body);

  // 回應 PING（type: 1）
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // 處理 Application Command（type: 2）
  if (interaction.type === 2) {
    return await handleApplicationCommand(interaction);
  }

  // 處理 Modal Submit（type: 5）
  if (interaction.type === 5) {
    return await handleModalSubmit(interaction);
  }

  return NextResponse.json({ error: "未知的互動類型" }, { status: 400 });
}

/**
 * 處理 /scheduler 指令的子指令
 */
async function handleApplicationCommand(interaction: Record<string, unknown>) {
  const data = interaction.data as {
    name: string;
    options?: Array<{ name: string; type: number; options?: Array<{ name: string; value: string }> }>;
  };

  if (data.name !== "scheduler") {
    return NextResponse.json({
      type: 4,
      data: { content: `❓ 未知的指令：${data.name}` },
    });
  }

  const subcommand = data.options?.[0]?.name;

  switch (subcommand) {
    case "meeting":
      return handleMeetingCommand();
    case "dashboard":
      return await handleDashboardCommand(interaction);
    default:
      return NextResponse.json({
        type: 4,
        data: { content: `❓ 未知的子指令：${subcommand}` },
      });
  }
}
