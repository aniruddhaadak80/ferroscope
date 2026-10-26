import type { ReactNode } from "react";
import { cn } from "./cn";

export function Meter({
  value,
  tone = "amber",
  label,
  hint,
  className,
}: {
  value: number;
  tone?: "amber" | "rust" | "moss" | "ink";
  label?: string;
  hint?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const showHeader = Boolean(label || hint);
  const tones = {
    amber: "bg-amber",
    rust: "bg-rust",
    moss: "bg-moss",
    ink: "bg-ink",
  } as const;

  return (
    <div className={cn("w-full", className)}>
      {showHeader ? (
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {label}
          </span>
          <span className="font-mono text-[10px] tabular-nums text-faint">
            {hint ?? `${clamped}%`}
          </span>
        </div>
      ) : (
        <span className="sr-only">{clamped}%</span>
      )}
      {/* The bar repeats a number that is already in the text above, so it is
          decorative rather than a second meter landmark. */}
      <div aria-hidden="true" className="h-1.5 w-full overflow-hidden bg-line">
        <div
          className={cn("h-full transition-[width] duration-700 ease-out", tones[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function Ring({
  value,
  label,
  size = 132,
  tone = "amber",
}: {
  value: number;
  label?: string;
  size?: number;
  tone?: "amber" | "rust" | "moss";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const tones = {
    amber: "stroke-amber",
    rust: "stroke-rust",
    moss: "stroke-moss",
  } as const;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="2" className="stroke-line" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-out", tones[tone])}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl tabular-nums leading-none text-ink">{clamped}</span>
        {label ? (
          <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.22em] text-faint">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function Sparkline({
  values,
  width = 160,
  height = 44,
  tone = "amber",
  className,
}: {
  values: readonly number[];
  width?: number;
  height?: number;
  tone?: "amber" | "rust" | "moss";
  className?: string;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M0,${height} L${line.replace(/ /g, " L")} L${width},${height} Z`;
  const tones = {
    amber: "stroke-amber fill-amber",
    rust: "stroke-rust fill-rust",
    moss: "stroke-moss fill-moss",
  } as const;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full", className)}
      role="img"
      aria-label="trend"
    >
      <path d={area} className={cn("opacity-[0.08]", tones[tone].split(" ")[1])} stroke="none" />
      <polyline
        points={line}
        fill="none"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        className={tones[tone].split(" ")[0]}
      />
    </svg>
  );
}

export function Bars({
  data,
  tone = "amber",
  className,
}: {
  data: readonly { label: string; value: number }[];
  tone?: "amber" | "rust";
  className?: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const fill = tone === "rust" ? "bg-rust" : "bg-amber";
  return (
    <ul className={cn("space-y-2.5", className)}>
      {data.map((item) => (
        <li key={item.label} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {item.label}
          </span>
          <span className="h-1 bg-line">
            <span
              className={cn("block h-full transition-[width] duration-700", fill)}
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </span>
          <span className="text-right font-mono text-[10px] tabular-nums text-faint">
            {item.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function HeatCell({
  intensity,
  label,
  className,
}: {
  intensity: number;
  label: string;
  className?: string;
}) {
  const alpha = 0.04 + Math.max(0, Math.min(1, intensity)) * 0.72;
  return (
    <span
      title={label}
      className={cn("block h-6 w-full border border-line", className)}
      style={{ backgroundColor: `rgba(232, 163, 61, ${alpha.toFixed(3)})` }}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-line px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-faint",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-line/60 px-3 py-3 align-top text-muted", className)}>
      {children}
    </td>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}
