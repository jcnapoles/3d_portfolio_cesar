import { cn } from "@/lib/cn";

const CORNER = "absolute size-2.5 border-gold";

/**
 * Four static 10 px gold corner brackets (1.5 px) offset 6 px outside the box. Services tile A only.
 * With children it wraps them; without children pass className="absolute inset-0" to overlay a box.
 */
export default function HudFrame({ className, children }) {
  return (
    <div className={cn("pointer-events-none relative", children && "pointer-events-auto", className)}>
      {children}
      <span aria-hidden="true" className={cn(CORNER, "-left-1.5 -top-1.5 border-l-[1.5px] border-t-[1.5px]")} />
      <span aria-hidden="true" className={cn(CORNER, "-right-1.5 -top-1.5 border-r-[1.5px] border-t-[1.5px]")} />
      <span aria-hidden="true" className={cn(CORNER, "-bottom-1.5 -left-1.5 border-b-[1.5px] border-l-[1.5px]")} />
      <span aria-hidden="true" className={cn(CORNER, "-bottom-1.5 -right-1.5 border-b-[1.5px] border-r-[1.5px]")} />
    </div>
  );
}
