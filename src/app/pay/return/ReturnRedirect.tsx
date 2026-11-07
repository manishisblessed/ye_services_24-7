"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Client component for the `/pay/return?ref=...` page.
 *
 * Behaviour:
 *   - If opened as a top-level page (Comet gateway — full redirect), it
 *     automatically navigates to the wallet page after a short delay.
 *   - If loaded inside an iframe (Star gateway — embedded checkout), it
 *     stays put and shows the "Verifying…" card so the parent page can
 *     react to postMessage or refetch status.
 */
export default function ReturnRedirect() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  const [inIframe, setInIframe] = useState(false);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    try {
      setInIframe(window.self !== window.top);
    } catch {
      setInIframe(true);
    }
  }, []);

  useEffect(() => {
    if (inIframe || !ref) return;

    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          window.location.assign(`/dashboard/wallet?topup=${ref}`);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [inIframe, ref]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm max-w-sm w-full">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <h2 className="text-lg font-semibold">Verifying payment…</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {ref ? `Reference: ${ref}` : "Processing your payment"}
        </p>
        {!inIframe && ref && countdown > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Redirecting in {countdown}s…
          </p>
        )}
        {inIframe && (
          <p className="mt-3 text-xs text-muted-foreground">
            You can close this window once your payment is confirmed.
          </p>
        )}
      </div>
    </div>
  );
}
