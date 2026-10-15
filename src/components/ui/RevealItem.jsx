import { forwardRef, useMemo } from "react";
import { m } from "motion/react";
import { fadeUp } from "@/lib/motion";
import useMediaQuery from "@/hooks/useMediaQuery";

/** Child of a stagger parent (<Reveal variants={staggerParent()}>). Inherits the parent's hidden/show state. */
const RevealItem = forwardRef(function RevealItem({ as = "div", variants, className, children, ...rest }, ref) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const resolved = useMemo(() => variants ?? fadeUp({ y: isMobile ? 12 : 16 }), [variants, isMobile]);
  const Comp = m[as];
  return (
    <Comp ref={ref} className={className} variants={resolved} {...rest}>
      {children}
    </Comp>
  );
});

export default RevealItem;
