import { forwardRef } from "react";

/**
 * <picture> with AVIF + WebP sources and an <img> fallback.
 * image: { avif?, webp?, src, width, height } (srcset strings, see src/assets/media.js).
 * Every image is lazy by default; no image is eager or high priority (the hero H1 / lead text is the LCP).
 * fetchPriority is written as the lowercase `fetchpriority` attribute (React 18.2 does not know the camelCase prop).
 */
const Picture = forwardRef(function Picture(
  { image, alt, sizes, loading = "lazy", fetchPriority, decoding = "async", className, imgClassName, ...imgProps },
  ref
) {
  if (!image) return null;
  const { avif, webp, src, width, height } = image;
  return (
    <picture className={className}>
      {avif ? <source type="image/avif" srcSet={avif} sizes={sizes} /> : null}
      {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
      <img
        ref={ref}
        src={src}
        width={width}
        height={height}
        alt={alt}
        loading={loading}
        decoding={decoding}
        fetchpriority={fetchPriority}
        className={imgClassName}
        {...imgProps}
      />
    </picture>
  );
});

export default Picture;
