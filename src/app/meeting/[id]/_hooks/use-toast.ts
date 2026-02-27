import { useState, useEffect } from "react";

export interface ToastData {
  message: string;
  type: "success" | "error";
}

export function useToast(duration = 3500) {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timer);
  }, [toast, duration]);

  return {
    toast,
    showToast: (data: ToastData) => setToast(data),
    dismissToast: () => setToast(null),
  };
}
