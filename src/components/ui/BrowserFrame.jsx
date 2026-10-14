import { cn } from "@/lib/cn";

/** Minimal browser chrome around a screenshot: 28 px bar, three 8 px dots, mono URL pill. */
export default function BrowserFrame({ url, className, children }) {
  return (
    <div className={cn("overflow-clip rounded-md border border-line bg-space-900", className)}>
      <div className="flex h-7 items-center gap-3 border-b border-line px-3">
        <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#3A3F4E]" />
          <span className="size-2 rounded-full bg-[#3A3F4E]" />
          <span className="size-2 rounded-full bg-[#3A3F4E]" />
        </span>
        {url ? (
          <span className="min-w-0 truncate rounded-pill bg-space-700 px-2.5 py-0.5 font-mono text-[11px] leading-[1.3] text-ink-3">
            {url}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
