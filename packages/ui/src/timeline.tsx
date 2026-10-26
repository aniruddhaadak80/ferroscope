import type { ReactNode } from "react";
import { cn } from "./cn";

export function Timeline({ children, className }: { children: ReactNode; className?: string }) {
  return <ol className={cn("relative space-y-6", className)}>{children}</ol>;
}

export function TimelineEntry({
  marker,
  title,
  meta,
  children,
  last = false,
  tone = "amber",
}: {
  marker?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  last?: boolean;
  tone?: "amber" | "rust" | "moss" | "muted";
}) {
  const tones = {
    amber: "border-amber text-amber",
    rust: "border-rust text-rust",
    moss: "border-moss text-moss",
    muted: "border-line-strong text-muted",
  } as const;

  return (
    <li className="relative grid grid-cols-[1.25rem_1fr] gap-4">
      <span className="relative flex justify-center">
        <span
          aria-hidden
          className={cn(
            "z-10 mt-1 flex h-3 w-3 items-center justify-center rounded-full border bg-canvas",
            tones[tone],
          )}
        >
          <span className="h-1 w-1 bg-current" />
        </span>
        {!last ? (
          <span aria-hidden className="absolute bottom-[-1.5rem] top-4 w-px bg-line" />
        ) : null}
      </span>
      <div className="min-w-0 pb-1">
        {meta ? (
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">{meta}</p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-sm font-medium text-ink">{title}</h3>
          {marker}
        </div>
        {children ? (
          <div className="mt-1.5 text-sm leading-relaxed text-muted">{children}</div>
        ) : null}
      </div>
    </li>
  );
}
