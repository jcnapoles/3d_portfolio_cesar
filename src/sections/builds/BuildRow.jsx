import { ArrowUpRight } from "lucide-react";
import Chip from "@/components/ui/Chip";
import ExternalLink from "@/components/ui/ExternalLink";
import Picture from "@/components/ui/Picture";
import RevealItem from "@/components/ui/RevealItem";
import StatusDot from "@/components/ui/StatusDot";
import { projectShots } from "@/assets/media";

/**
 * One build. A card below 1024 px (inline screenshot), a typographic index row from 1024 px whose
 * screenshot lives in the sticky BuildPreview next to the list (grid areas in builds.css).
 * The row is a <div> grid with two sibling anchors, never nested: the main link stretches over the
 * whole row through an ::after overlay, and "View code" sits above that overlay (relative z-[2]).
 * `active` (desktop only) marks the row the preview is showing.
 */
export default function BuildRow({ build, index, active = false }) {
  const { key, name, sector, status, href, code, description, stack, lead } = build;
  const live = status === "LIVE";
  const shot = projectShots[key];

  return (
    <RevealItem as="li" className="h-full">
      <div className="build-row group/row" data-build-key={key} data-active={active ? "true" : undefined} data-cursor="lock">
        <span aria-hidden="true" className="build-index font-mono text-[13px] tabular text-ink-3">
          {String(index + 1).padStart(2, "0")}
        </span>

        <h3 className="build-name text-h3 stretch-112 text-ink-1">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="build-link after:absolute after:inset-0 after:z-[1] after:content-['']"
          >
            <span className="sr-only">{live ? "Visit " : "Open "}</span>
            <span className="build-name-text">{name}</span>
            <span className="sr-only">{live ? " live site (opens in a new tab)" : " preview (opens in a new tab)"}</span>
          </a>
        </h3>

        <p className="build-desc max-w-[46ch] text-small text-ink-2">{description}</p>

        <div className="build-meta">
          <p className="build-sector flex flex-wrap gap-1.5">
            <span className="sr-only">Sector: </span>
            <Chip>{sector}</Chip>
            {lead ? (
              <>
                <span className="sr-only">, </span>
                <Chip tone="ion">Platform I lead</Chip>
              </>
            ) : null}
          </p>
          <div className="build-stack">
            <span className="sr-only">{lead ? "Stack: " : "Built with: "}</span>
            <ul className="flex flex-wrap gap-1.5">
              {stack.slice(0, 3).map((tech) => (
                <li key={tech}>
                  <Chip className="px-2 py-0.5 text-[12px]">{tech}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {code ? (
          <p className="build-code">
            <ExternalLink
              href={code}
              srHint={`for ${name} (opens in a new tab)`}
              className="relative z-[2] inline-flex items-center text-small coarse:min-h-11"
            >
              View code
            </ExternalLink>
          </p>
        ) : null}

        <p className="build-status flex items-center gap-2 font-mono text-[12px] uppercase leading-none tracking-[0.14em]">
          <span className="sr-only">Status: </span>
          {live ? (
            <>
              <StatusDot />
              <span className="text-ink-1">Live</span>
            </>
          ) : (
            <>
              <span aria-hidden="true" className="inline-block size-2 shrink-0 rounded-full border border-ink-3" />
              <span className="text-ink-3">Preview</span>
            </>
          )}
        </p>

        <ArrowUpRight
          size={20}
          strokeWidth={1.75}
          aria-hidden="true"
          className="build-arrow text-ink-3 transition-colors duration-ui ease-ui"
        />

        {/* Card image (< 1024 only; display:none above, so the lazy image is never fetched on desktop,
            where the sticky preview shows it). */}
        <div className="build-media">
          <Picture
            image={shot}
            alt={`${name} screenshot`}
            sizes="(min-width: 640px) calc(50vw - 44px), calc(100vw - 58px)"
            className="block size-full"
            imgClassName="size-full object-cover object-top"
          />
        </div>
      </div>
    </RevealItem>
  );
}
