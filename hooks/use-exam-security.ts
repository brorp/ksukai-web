"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const BLOCKED_COMBO_KEYS = new Set(["a", "c", "p", "s", "u", "v", "x"]);

export function useExamSecurity(enabled: boolean) {
  const lastToastAtRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const showWarning = (key: string, description: string) => {
      const now = Date.now();
      if (now - (lastToastAtRef.current[key] ?? 0) < 1200) {
        return;
      }

      lastToastAtRef.current[key] = now;
      toast.warning("Aksi diblokir", {
        description,
      });
    };

    const preventAction = (event: Event, key: string, description: string) => {
      event.preventDefault();
      event.stopPropagation();
      showWarning(key, description);
    };

    const handleClipboardAction = (event: Event) => {
      preventAction(
        event,
        event.type,
        "Copy, paste, dan pemilihan teks dinonaktifkan selama sesi ujian.",
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && BLOCKED_COMBO_KEYS.has(key)) {
        preventAction(
          event,
          `shortcut-${key}`,
          "Shortcut salin, tempel, cetak, dan simpan dinonaktifkan selama ujian.",
        );
        return;
      }

      if (
        event.key === "PrintScreen" ||
        event.key === "F12" ||
        ((event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          ["c", "i", "j"].includes(key))
      ) {
        preventAction(
          event,
          `system-${key}`,
          "Mode ujian sedang aktif. Pengambilan konten dibatasi sebisa mungkin.",
        );

        if (event.key === "PrintScreen" && navigator.clipboard?.writeText) {
          void navigator.clipboard.writeText("");
        }
      }
    };

    document.body.classList.add("exam-secure-mode");

    document.addEventListener("copy", handleClipboardAction, true);
    document.addEventListener("cut", handleClipboardAction, true);
    document.addEventListener("paste", handleClipboardAction, true);
    document.addEventListener("selectstart", handleClipboardAction, true);
    document.addEventListener("contextmenu", handleClipboardAction, true);
    document.addEventListener("dragstart", handleClipboardAction, true);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.classList.remove("exam-secure-mode");

      document.removeEventListener("copy", handleClipboardAction, true);
      document.removeEventListener("cut", handleClipboardAction, true);
      document.removeEventListener("paste", handleClipboardAction, true);
      document.removeEventListener("selectstart", handleClipboardAction, true);
      document.removeEventListener("contextmenu", handleClipboardAction, true);
      document.removeEventListener("dragstart", handleClipboardAction, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled]);
}
