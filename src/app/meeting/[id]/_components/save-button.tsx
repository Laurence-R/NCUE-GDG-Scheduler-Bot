import { IconLoader2, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}

export function SaveButton({ saving, saved, onSave }: SaveButtonProps) {
  return (
    <button
      onClick={onSave}
      disabled={saving}
      className={cn("w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-foreground font-semibold transition-all hover:scale-[1.02]")}
    >
      {saving ? (
        <IconLoader2 className={cn("h-4 w-4 animate-spin")} />
      ) : saved ? (
        <IconCheck className={cn("h-4 w-4")} />
      ) : null}
      {saving ? "儲存中..." : saved ? "已儲存" : "儲存可用時段"}
    </button>
  );
}
