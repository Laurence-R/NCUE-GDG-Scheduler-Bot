import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

/**
 * /scheduler 指令 — GDG 會議排程機器人
 *
 * 子指令：
 *   /scheduler meeting  → 建立新的會議排程（觸發 Modal 填寫名稱、人數、日期範圍）
 *   /scheduler dashboard → 查看會議歷史與當前排程（透過 OAuth2 導向 Web 儀表板）
 */
export const schedulerCommand = new SlashCommandBuilder()
  .setName("scheduler")
  .setDescription("GDG 會議排程工具")
  .addSubcommand((sub) =>
    sub
      .setName("meeting")
      .setDescription("建立新的會議排程（When2Meet 風格）")
  )
  .addSubcommand((sub) =>
    sub
      .setName("dashboard")
      .setDescription("查看會議歷史與目前排程")
  );

/**
 * 所有要註冊的指令清單
 */
export const ALL_COMMANDS = [schedulerCommand];

/**
 * 指令處理器類型
 */
export type CommandHandler = (
  interaction: ChatInputCommandInteraction
) => Promise<void>;
