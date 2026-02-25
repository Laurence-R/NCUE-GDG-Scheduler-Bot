import { REST, Routes } from "discord.js";
import { ALL_COMMANDS } from "./commands";

/**
 * 向 Discord API 註冊所有 Slash Commands
 * 若有設定 DISCORD_GUILD_ID，則註冊為 Guild 指令（即時生效）
 * 否則註冊為全域指令（最多需 1 小時生效）
 */
export async function registerCommands(): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const appId = process.env.DISCORD_APP_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !appId) {
    throw new Error("❌ 缺少 DISCORD_BOT_TOKEN 或 DISCORD_APP_ID 環境變數");
  }

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log("🔄 開始註冊 Slash Commands...");
    console.log(`📝 即將註冊 ${ALL_COMMANDS.length} 個指令`);

    const route = guildId
      ? Routes.applicationGuildCommands(appId, guildId)
      : Routes.applicationCommands(appId);

    const data = await rest.put(route, {
      body: ALL_COMMANDS.map((cmd) => cmd.toJSON()),
    });

    const scope = guildId ? `Guild (${guildId})` : "全域";
    console.log(`✅ 成功註冊 ${(data as unknown[]).length} 個 ${scope} Slash Commands！`);
  } catch (error) {
    console.error("❌ 註冊 Slash Commands 失敗：", error);
    throw error;
  }
}
