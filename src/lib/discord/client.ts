import { Client, GatewayIntentBits, Events } from "discord.js";

/**
 * 建立並設定 Discord Bot Client
 * 使用 Singleton 模式確保只有一個 Client 實例
 */

let client: Client | null = null;

export function getDiscordClient(): Client {
  if (!client) {
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.MessageContent,
      ],
    });

    client.once(Events.ClientReady, (readyClient) => {
      console.log(`✅ Bot 已上線！登入身份：${readyClient.user.tag}`);
    });
  }

  return client;
}

/**
 * 啟動 Discord Bot
 */
export async function startBot(): Promise<void> {
  const botClient = getDiscordClient();
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    throw new Error("❌ 缺少 DISCORD_BOT_TOKEN 環境變數");
  }

  if (!botClient.isReady()) {
    await botClient.login(token);
    console.log("🤖 Discord Bot 正在啟動...");
  }
}
