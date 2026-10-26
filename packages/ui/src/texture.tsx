import { cn } from "./cn";

/**
 * A fixed, non-interactive grain layer. Kept at very low opacity so it reads
 * as paper texture rather than a filter. Hidden from assistive tech.
 */
export function Noise({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-multiply dark:mix-blend-screen",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="ferroscope-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ferroscope-grain)" />
      </svg>
    </div>
  );
}

export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        "bg-[linear-gradient(to_right,var(--grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid)_1px,transparent_1px)] bg-[size:64px_64px]",
        "mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)",
        className,
      )}
    />
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-px w-full bg-line", className)} />;
}

export function CornerTick({ position = "tl" }: { position?: "tl" | "tr" | "bl" | "br" }) {
  const positions = {
    tl: "-left-px -top-px border-l border-t",
    tr: "-right-px -top-px border-r border-t",
    bl: "-bottom-px -left-px border-b border-l",
    br: "-bottom-px -right-px border-b border-r",
  } as const;
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute h-3 w-3 border-amber", positions[position])}
    />
  );
}
