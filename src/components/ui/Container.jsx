import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const SIZES = { default: "max-w-container", wide: "max-w-wide", prose: "max-w-prose" };

const Container = forwardRef(function Container({ as: Tag = "div", size = "default", className, children, ...rest }, ref) {
  return (
    <Tag ref={ref} className={cn("mx-auto w-full px-4 sm:px-6 lg:px-10", SIZES[size] || SIZES.default, className)} {...rest}>
      {children}
    </Tag>
  );
});

export default Container;
