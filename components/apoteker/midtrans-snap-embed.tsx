"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    snap?: {
      pay: (
        snapToken: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
      hide?: () => void;
    };
  }
}

type MidtransSnapLauncherProps = {
  clientKey: string;
  snapScriptUrl: string;
  snapToken: string;
  launchKey: number;
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
  onReadyChange?: (ready: boolean) => void;
};

const SNAP_SCRIPT_SELECTOR = "script[data-midtrans-snap-script='true']";

export default function MidtransSnapLauncher({
  clientKey,
  snapScriptUrl,
  snapToken,
  launchKey,
  onSuccess,
  onPending,
  onError,
  onClose,
  onReadyChange,
}: MidtransSnapLauncherProps) {
  const [ready, setReady] = useState(false);
  const launchedRef = useRef<string | null>(null);

  useEffect(() => {
    const setScriptReady = () => setReady(true);
    const setScriptFailed = () => setReady(false);

    const existing = document.querySelector<HTMLScriptElement>(SNAP_SCRIPT_SELECTOR);
    const needsReplacement =
      !!existing &&
      (existing.src !== snapScriptUrl || existing.getAttribute("data-client-key") !== clientKey);

    if (needsReplacement) {
      existing?.remove();
      try {
        delete window.snap;
      } catch {
        window.snap = undefined;
      }
    }

    if (window.snap) {
      setReady(true);
      return;
    }

    const reusableScript = needsReplacement
      ? null
      : document.querySelector<HTMLScriptElement>(SNAP_SCRIPT_SELECTOR);

    if (reusableScript) {
      reusableScript.addEventListener("load", setScriptReady);
      reusableScript.addEventListener("error", setScriptFailed);
      return () => {
        reusableScript.removeEventListener("load", setScriptReady);
        reusableScript.removeEventListener("error", setScriptFailed);
      };
    }

    const script = document.createElement("script");
    script.src = snapScriptUrl;
    script.async = true;
    script.setAttribute("data-client-key", clientKey);
    script.setAttribute("data-midtrans-snap-script", "true");
    script.addEventListener("load", setScriptReady);
    script.addEventListener("error", setScriptFailed);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", setScriptReady);
      script.removeEventListener("error", setScriptFailed);
    };
  }, [clientKey, snapScriptUrl]);

  useEffect(() => {
    onReadyChange?.(ready);
  }, [onReadyChange, ready]);

  useEffect(() => {
    if (!ready || !window.snap || !snapToken || launchKey <= 0) {
      return;
    }

    const requestKey = `${snapToken}:${launchKey}`;
    if (launchedRef.current === requestKey) {
      return;
    }

    launchedRef.current = requestKey;

    try {
      window.snap.hide?.();
    } catch {
      // Ignore cleanup errors from stale Snap state.
    }

    try {
      window.snap.pay(snapToken, {
        onSuccess,
        onPending,
        onError,
        onClose: () => {
          try {
            window.snap?.hide?.();
          } catch {
            // Ignore cleanup errors from stale Snap state.
          }
          onClose?.();
        },
      });
    } catch (error) {
      onError?.(error);
    }
  }, [launchKey, onClose, onError, onPending, onSuccess, ready, snapToken]);

  useEffect(() => {
    return () => {
      try {
        window.snap?.hide?.();
      } catch {
        // Ignore cleanup errors during unmount.
      }
    };
  }, []);

  return null;
}
