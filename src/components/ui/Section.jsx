import { forwardRef, useCallback, useRef } from "react";
import { cn } from "@/lib/cn";
import useInViewport from "@/hooks/useInViewport";
import Container from "@/components/ui/Container";
import Crosshair from "@/components/ui/Crosshair";

const TONES = {
  default: "py-section",
  band: "bg-space-900 border-y border-line py-16 lg:py-20",
  bare: "",
};

/** Blueprint frame (desktop >= 1024): two 1 px rails at the container edges + "+" at each top corner. */
function Rails() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="mx-auto h-full w-full max-w-container px-10">
        <div className="relative h-full border-x border-line">
          <Crosshair className="absolute -left-[5px] -top-[5px]" />
          <Crosshair className="absolute -right-[5px] -top-[5px]" />
        </div>
      </div>
    </div>
  );
}

/**
 * The root of every chapter section.
 * <section id aria-labelledby data-chapter-index class="relative z-content">.
 * Sets data-offscreen="true|false" (200 px margin) so CSS loops inside pause offscreen.
 * Never sets overflow. Forwards a ref to the <section> element (extra, optional).
 */
const Section = forwardRef(function Section(
  {
    id,
    chapter,
    labelledBy,
    tone = "default",
    rails = true,
    container = true,
    className,
    innerClassName,
    as: Tag = "section",
    children,
    ...rest
  },
  forwardedRef
) {
  const localRef = useRef(null);
  const setRef = useCallback(
    (node) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );
  const onScreen = useInViewport(localRef, { rootMargin: "200px 0px", once: false, attr: false, initial: true });

  return (
    <Tag
      ref={setRef}
      id={id}
      aria-labelledby={labelledBy}
      data-chapter-index={chapter}
      data-offscreen={onScreen ? "false" : "true"}
      className={cn("relative z-content", TONES[tone] ?? TONES.default, className)}
      {...rest}
    >
      {rails && <Rails />}
      {container ? <Container className={cn("relative", innerClassName)}>{children}</Container> : children}
    </Tag>
  );
});

export default Section;
