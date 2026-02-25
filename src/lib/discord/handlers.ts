import type { ChatInputCommandInteraction } from "discord.js";
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

/**
 * 處理 /scheduler meeting — 彈出 Modal 讓 Leader 填寫會議資訊
 */
export async function handleSchedulerMeeting(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId("scheduler_meeting_modal")
    .setTitle("建立會議排程");

  const nameInput = new TextInputBuilder()
    .setCustomId("meeting_name")
    .setLabel("會議名稱")
    .setPlaceholder("例如：GDG 週會")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const participantsInput = new TextInputBuilder()
    .setCustomId("meeting_participants")
    .setLabel("預計參與人數")
    .setPlaceholder("例如：10")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const dateRangeInput = new TextInputBuilder()
    .setCustomId("meeting_date_range")
    .setLabel("日期範圍（起始 ~ 結束）")
    .setPlaceholder("例如：2025-01-20 ~ 2025-01-25")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const descriptionInput = new TextInputBuilder()
    .setCustomId("meeting_description")
    .setLabel("會議描述（選填）")
    .setPlaceholder("會議議程或備註...")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(participantsInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(dateRangeInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
  );

  await interaction.showModal(modal);
}

/**
 * 處理 /scheduler dashboard — 回傳 OAuth2 連結導向 Web 儀表板
 */
export async function handleSchedulerDashboard(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const clientId = process.env.DISCORD_APP_ID;

  if (!clientId) {
    await interaction.reply({
      content: "❌ Bot 尚未完成設定，請聯繫管理員。",
      ephemeral: true,
    });
    return;
  }

  const oauthUrl =
    `https://discord.com/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&scope=identify` +
    `&redirect_uri=${encodeURIComponent(`${appUrl}/api/auth/callback`)}` +
    `&state=dashboard` +
    `&prompt=none`;

  const embed = new EmbedBuilder()
    .setTitle("📊 GDG 會議排程儀表板")
    .setDescription("透過 Discord 帳號登入即可查看你的會議歷史與目前排程。")
    .setColor(0x5865f2)
    .setFooter({ text: "GDG Scheduler Bot" });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("開啟儀表板")
      .setStyle(ButtonStyle.Link)
      .setURL(oauthUrl)
      .setEmoji("🔗")
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

/**
 * 處理 Modal 提交 — 建立會議後發送 Embedded 訊息含填寫按鈕
 */
export async function handleMeetingModalSubmit(
  interaction: {
    customId: string;
    user: { id: string; username: string };
    fields: { getTextInputValue: (id: string) => string };
    reply: (options: Record<string, unknown>) => Promise<void>;
  }
): Promise<void> {
  const meetingName = interaction.fields.getTextInputValue("meeting_name");
  const participants = interaction.fields.getTextInputValue("meeting_participants");
  const dateRange = interaction.fields.getTextInputValue("meeting_date_range");
  const description = interaction.fields.getTextInputValue("meeting_description") || "無描述";

  const meetingId = `MTG-${Date.now().toString(36).toUpperCase()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // TODO: 將會議資料儲存到 Supabase

  const embed = new EmbedBuilder()
    .setTitle(`📅 ${meetingName}`)
    .setDescription(description)
    .addFields(
      { name: "📋 會議 ID", value: meetingId, inline: true },
      { name: "👥 預計人數", value: participants, inline: true },
      { name: "📆 日期範圍", value: dateRange, inline: false },
      { name: "👤 發起人", value: `<@${interaction.user.id}>`, inline: true }
    )
    .setColor(0x00d26a)
    .setTimestamp()
    .setFooter({ text: "點擊下方按鈕填寫你的可用時間" });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("填寫可用時間")
      .setStyle(ButtonStyle.Link)
      .setURL(`${appUrl}/meeting/${meetingId}`)
      .setEmoji("✏️")
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
  });
}
