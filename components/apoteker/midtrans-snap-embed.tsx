"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    snap?: {
      embed: (
        snapToken: string,
        options: {
          embedId: string;
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

type MidtransSnapEmbedProps = {
  clientKey: string;
  snapScriptUrl: string;
  snapToken: string;
  active: boolean;
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
};

const SNAP_SCRIPT_SELECTOR = "script[data-midtrans-snap-script='true']";

export default function MidtransSnapEmbed({
  clientKey,
  snapScriptUrl,
  snapToken,
  active,
  onSuccess,
  onPending,
  onError,
  onClose,
}: MidtransSnapEmbedProps) {
  const rawId = useId();
  const embedId = useMemo(
    () => `midtrans-snap-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [rawId],
  );
  const [ready, setReady] = useState(false);
  const embeddedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (window.snap) {
      setReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(SNAP_SCRIPT_SELECTOR);
    if (existing) {
      const markReady = () => setReady(true);
      existing.addEventListener("load", markReady);
      return () => existing.removeEventListener("load", markReady);
    }

    const script = document.createElement("script");
    const markReady = () => setReady(true);
    script.src = snapScriptUrl;
    script.async = true;
    script.setAttribute("data-client-key", clientKey);
    script.setAttribute("data-midtrans-snap-script", "true");
    script.addEventListener("load", markReady);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", markReady);
    };
  }, [clientKey, snapScriptUrl]);

  useEffect(() => {
    if (!active || !ready || !window.snap || !snapToken) {
      return;
    }

    if (embeddedTokenRef.current === snapToken) {
      return;
    }

    const target = document.getElementById(embedId);
    if (target) {
      target.innerHTML = "";
    }

    embeddedTokenRef.current = snapToken;
    window.snap.embed(snapToken, {
      embedId,
      onSuccess,
      onPending,
      onError,
      onClose,
    });
  }, [active, embedId, onClose, onError, onPending, onSuccess, ready, snapToken]);

  useEffect(() => {
    embeddedTokenRef.current = null;
  }, [snapToken]);

  return <div id={embedId} className="min-h-96 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white" />;
}
