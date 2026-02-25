/**
 * 註冊 Slash Commands 腳本
 *
 * 使用方式：npx tsx scripts/register-commands.ts
 */
import { config } from "dotenv";
import { resolve } from "path";

// 優先讀取 .env.local，fallback 到 .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { registerCommands } from "../src/lib/discord/register";

async function main() {
  console.log("🚀 開始註冊 Discord Slash Commands...\n");

  try {
    await registerCommands();
    console.log("\n🎉 全部完成！指令可能需要最多 1 小時才會在所有伺服器中生效。");
  } catch (error) {
    console.error("\n💥 註冊失敗：", error);
    process.exit(1);
  }
}

main();
