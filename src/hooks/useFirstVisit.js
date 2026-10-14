import { useCallback, useMemo } from "react";
import { writeSession } from "@/lib/storage";

/**
 * { firstVisit, markLaunched() }
 * firstVisit comes from html[data-visit] (set before first paint). markLaunched() writes
 * sessionStorage['cn:launched'] = '1' and never changes data-visit during the session.
 */
export default function useFirstVisit() {
  const firstVisit = useMemo(
    () => typeof document !== "undefined" && document.documentElement.dataset.visit !== "repeat",
    []
  );
  const markLaunched = useCallback(() => writeSession("cn:launched", "1"), []);
  return { firstVisit, markLaunched };
}
