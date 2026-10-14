import { useEffect, useState } from "react";
import useInViewport from "@/hooks/useInViewport";
import { getBrandIcons, loadBrandIcons } from "@/lib/brandIcons";

/**
 * useBrandIcons(ref, { rootMargin = '100% 0px' }) => map | null
 *
 * The react-icons/si brand glyphs are decorative (every one sits next to, or stands in for, plain text
 * that carries the meaning) and heavy, so they live in their own chunk. It loads once `ref` is about one
 * viewport away (or immediately if it is already above the bottom of the viewport at mount); until then
 * the hook returns null and consumers keep the icon slot's size, so nothing shifts when the glyphs arrive.
 */
export default function useBrandIcons(ref, { rootMargin = "100% 0px" } = {}) {
  const near = useInViewport(ref, { rootMargin, once: true, attr: false });
  const [icons, setIcons] = useState(getBrandIcons);

  useEffect(() => {
    if (icons || !near) return undefined;
    let alive = true;
    loadBrandIcons()
      .then((map) => {
        if (alive) setIcons(map);
      })
      .catch(() => {
        /* decorative only: the text already carries the content */
      });
    return () => {
      alive = false;
    };
  }, [near, icons]);

  return icons;
}
