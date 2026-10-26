import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type Tone = "neutral" | "amber" | "rust" | "moss" | "ink" | "outline";

const TONES: Record<Tone, string> = {
  neutral: "border-line bg-surface-2 text-muted",
  amber: "border-amber/35 bg-amber/10 text-amber",
  rust: "border-rust/35 bg-rust/10 text-rust",
  moss: "border-moss/35 bg-moss/10 text-moss",
  ink: "border-ink bg-ink text-canvas",
  outline: "border-line-strong bg-transparent text-ink",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em]",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span aria-hidden className="h-1 w-1 bg-current" /> : null}
      {children}
    </span>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
