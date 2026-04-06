import { useEffect, useRef } from "react";

/**
 * Shows a custom in-app exit modal on browser Back (popstate).
 * For refresh/close, browsers do not allow custom modals — we can only trigger the native confirm.
 */
export function useExitIntentGuard({ enabled, onAttemptExit }) {
  const hasPushedRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const pushGuardState = () => {
      // Push a guard state so the first Back triggers popstate while staying on the page.
      window.history.pushState({ __authExitGuard: true }, "", window.location.href);
      hasPushedRef.current = true;
    };

    if (!hasPushedRef.current) {
      pushGuardState();
    }

    const handlePopState = () => {
      if (lockRef.current) return;
      lockRef.current = true;

      if (typeof onAttemptExit === "function") {
        onAttemptExit();
      }

      // Re-add the guard entry to keep the user on the page until they confirm leaving.
      pushGuardState();

      // Release on next tick to avoid rapid back presses causing loops.
      setTimeout(() => {
        lockRef.current = false;
      }, 0);
    };

    const handleBeforeUnload = (e) => {
      // Custom UI is not permitted here; this triggers the native browser confirmation.
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, onAttemptExit]);
}
