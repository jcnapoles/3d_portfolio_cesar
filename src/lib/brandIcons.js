// Lazy loader for the brand glyph map (src/lib/brandIconMap.js). One shared promise for the page.
let cache = null;
let promise = null;

/** The loaded map, or null while it is not loaded yet. */
export const getBrandIcons = () => cache;

/** Starts (once) and returns the load of the brand glyph map: Promise<{ [name]: IconComponent }>. */
export function loadBrandIcons() {
  if (!promise) {
    promise = import("@/lib/brandIconMap").then((mod) => {
      cache = mod.BRAND_ICONS;
      return cache;
    });
    // Let a failed load (offline, deploy swap) be retried by the next consumer.
    promise.catch(() => {
      promise = null;
    });
  }
  return promise;
}
