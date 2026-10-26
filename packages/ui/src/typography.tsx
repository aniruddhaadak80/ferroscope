import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function Kicker({
  children,
  className,
  index,
}: {
  children: ReactNode;
  className?: string | undefined;
  index?: string | number | undefined;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-amber",
        className,
      )}
    >
      {index !== undefined ? (
        <>
          <span className="tabular-nums text-faint">{String(index).padStart(2, "0")}</span>
          <span aria-hidden className="h-px w-6 bg-amber/50" />
        </>
      ) : null}
      <span>{children}</span>
    </p>
  );
}

export interface PageHeaderProps {
  kicker: string;
  index?: string | number;
  title: ReactNode;
  lede?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  kicker,
  index,
  title,
  lede,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("border-b border-line pb-10 pt-10 sm:pt-14", className)}>
      <Kicker index={index}>{kicker}</Kicker>
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-[clamp(2.6rem,6.4vw,5.4rem)] leading-[0.94] tracking-[-0.025em] text-ink">
            {title}
          </h1>
          {lede ? (
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {lede}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {meta ? (
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
          {meta}
        </div>
      ) : null}
    </header>
  );
}

export function SectionHeader({
  index,
  title,
  lede,
  right,
  className,
}: {
  index?: string | number;
  title: ReactNode;
  lede?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {index !== undefined ? <Kicker index={index}>Section</Kicker> : null}
        <h2
          className={cn(
            "font-display text-3xl leading-tight text-ink sm:text-4xl",
            index !== undefined && "mt-3",
          )}
        >
          {title}
        </h2>
        {lede ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{lede}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function Stat({
  value,
  label,
  hint,
  tone = "ink",
  className,
}: {
  value: ReactNode;
  label: string;
  hint?: ReactNode;
  tone?: "ink" | "amber" | "rust" | "moss";
  className?: string;
}) {
  const tones = {
    ink: "text-ink",
    amber: "text-amber",
    rust: "text-rust",
    moss: "text-moss",
  } as const;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "font-display text-4xl leading-none tabular-nums tracking-[-0.02em] sm:text-5xl",
          tones[tone],
        )}
      >
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</span>
      {hint ? <span className="text-xs leading-relaxed text-faint">{hint}</span> : null}
    </div>
  );
}

export function Quote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="border-l border-amber pl-5">
      <blockquote className="font-display text-xl italic leading-snug text-ink sm:text-2xl">
        {children}
      </blockquote>
      {cite ? (
        <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
          {cite}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function Callout({
  title,
  tone = "amber",
  children,
  className,
}: {
  title: string;
  tone?: "amber" | "rust" | "moss" | "neutral";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    amber: "border-amber/40 bg-amber/[0.06]",
    rust: "border-rust/40 bg-rust/[0.06]",
    moss: "border-moss/40 bg-moss/[0.06]",
    neutral: "border-line bg-surface-2",
  } as const;

  return (
    <aside className={cn("border-l-2 p-4", tones[tone], className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </aside>
  );
}

export function EmptyState({
  title,
  detail,
  action,
  className,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 border border-dashed border-line-strong px-6 py-14 text-center",
        className,
      )}
    >
      <p className="font-display text-2xl text-ink">{title}</p>
      {detail ? <p className="max-w-md text-sm leading-relaxed text-muted">{detail}</p> : null}
      {action}
    </div>
  );
}

export function Prose({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "space-y-4 text-sm leading-relaxed text-muted [&_a]:text-amber [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-ink [&_strong]:text-ink",
        className,
      )}
      {...props}
    />
  );
}
