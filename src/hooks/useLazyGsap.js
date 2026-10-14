// src/hooks/useLazyGsap.js
import { useEffect } from "react";
import { gsapReady, requestRefresh } from "@/lib/gsap";
import useMotionPreference from "@/hooks/useMotionPreference";
export default function useLazyGsap(scopeRef, setup, deps = []) {
  const { reduced } = useMotionPreference();
  useEffect(() => {
    if (reduced || !scopeRef.current) return undefined;
    let ctx; let cleanup; let cancelled = false;
    gsapReady.then((api) => {
      if (cancelled || !scopeRef.current) return;
      ctx = api.gsap.context(() => { cleanup = setup(api); }, scopeRef.current);
      requestRefresh();
    });
    return () => { cancelled = true; if (typeof cleanup === "function") cleanup(); ctx?.revert(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps]);
}
