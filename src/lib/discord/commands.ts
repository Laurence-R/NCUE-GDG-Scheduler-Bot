import {
  SlashCommandBuilder,
} from "discord.js";

/**
 * /meeting 指令 — GDG 會議排程機器人
 *
 * 子指令：
 *   /meeting build @身分組 → 建立新的會議排程（觸發 Modal 填寫名稱、日期範圍、時長、描述）
 *   /meeting dashboard     → 查看會議歷史與當前排程（透過 OAuth2 導向 Web 儀表板）
 */
export const meetingCommand = new SlashCommandBuilder()
  .setName("meeting")
  .setDescription("GDG 會議排程工具")
  .addSubcommand((sub) =>
    sub
      .setName("build")
      .setDescription("建立新的會議排程（When2Meet 風格）")
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription("選擇要邀請的身分組")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("dashboard")
      .setDescription("查看會議歷史與目前排程")
  );

/**
 * 所有要註冊的指令清單
 */
export const ALL_COMMANDS = [meetingCommand];
