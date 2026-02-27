import Image from "next/image";
import { IconCheck, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface LoginStatusProps {
  discordId: string;
  username: string;
  avatarUrl: string;
}

export function LoginStatus({ discordId, username, avatarUrl }: LoginStatusProps) {
  if (discordId) {
    return (
      <div className={cn("max-w-6xl mx-auto mb-6")}>
        <div
          className={cn("glass-card p-4 flex items-center gap-3 border-accent-border-subtle bg-accent-bg-subtle")}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              width={24}
              height={24}
              className={cn("rounded-full shrink-0 ring-2 ring-accent-ring")}
              unoptimized
            />
          ) : (
            <IconCheck className={cn("h-5 w-5 text-accent")} />
          )}
          <span className={cn("text-sm text-text-secondary")}>
            已登入為{" "}
            <strong className={cn("text-text-primary")}>{username}</strong>
            ，點選下方時段標記你的可用時間。
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-6xl mx-auto mb-6")}>
      <div
        className={cn("glass-card p-4 flex items-center gap-3 border-warning-border bg-warning-bg")}
      >
        <IconClock className={cn("h-5 w-5 text-warning")} />
        <span className={cn("text-sm text-text-secondary")}>
          你目前是以訪客身分瀏覽。如需填寫時段，請透過 Discord 指令中的按鈕登入。
        </span>
      </div>
    </div>
  );
}
