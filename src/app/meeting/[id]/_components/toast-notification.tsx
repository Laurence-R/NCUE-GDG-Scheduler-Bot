import { IconCheck, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ToastData } from "../_hooks/use-toast";

interface ToastNotificationProps {
  toast: ToastData;
  onDismiss: () => void;
}

export function ToastNotification({ toast, onDismiss }: ToastNotificationProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg backdrop-blur-md border animate-toast-in",
        toast.type === "success"
          ? "bg-success-bg border-success-border text-success-strong"
          : "bg-danger-bg border-danger-border text-danger"
      )}
    >
      {toast.type === "success" ? (
        <IconCheck className={cn("h-4 w-4 shrink-0")} />
      ) : (
        <IconX className={cn("h-4 w-4 shrink-0")} />
      )}
      <span className={cn("text-sm font-medium")}>{toast.message}</span>
      <button
        onClick={onDismiss}
        className={cn("ml-1 opacity-60 hover:opacity-100 transition-opacity")}
      >
        <IconX className={cn("h-3.5 w-3.5")} />
      </button>
    </div>
  );
}
