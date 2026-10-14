import { useEffect, useState } from "react";

const get = (query) => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(query).matches;

/** matchMedia(query).matches, kept in sync with a change listener. */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => get(query));

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}
