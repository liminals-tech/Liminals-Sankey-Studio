import { supabase } from "@/lib/supabase";

// A minimal, self-hosted error log (own Supabase table, write-only) instead
// of a third-party monitoring service: no external API receives visitors'
// stack traces, and it's the same infrastructure already approved for the
// gallery rather than a new one. Never throws -- error reporting must never
// itself become a source of errors.
export function reportClientError(error: unknown, source: string) {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    void supabase.rpc("report_client_error", {
      p_message: message,
      p_stack: stack ?? null,
      p_source: source,
      p_page_path: typeof window !== "undefined" ? window.location.pathname : null,
      p_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch {
    // Reporting is best-effort only.
  }
}

let installed = false;

// Catches errors outside React's render tree (async code, event handlers)
// that an ErrorBoundary would never see. Safe to call more than once.
export function installGlobalErrorReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (event) => {
    reportClientError(event.error ?? event.message, "window.onerror");
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportClientError(event.reason, "unhandledrejection");
  });
}
