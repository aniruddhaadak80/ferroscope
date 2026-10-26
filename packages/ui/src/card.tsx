import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative border border-line bg-surface text-ink", className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-line px-5 py-4", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-line px-5 py-3 text-xs text-muted", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  children,
  as: Tag = "h3",
}: {
  className?: string;
  children: ReactNode;
  as?: "h2" | "h3" | "h4";
}) {
  return (
    <Tag className={cn("font-display text-xl leading-tight text-ink", className)}>{children}</Tag>
  );
}

export function CardMeta({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("font-mono text-[10px] uppercase tracking-[0.22em] text-muted", className)}
      {...props}
    />
  );
}

export function CardIndex({ value, className }: { value: string | number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute right-3 top-3 font-mono text-[10px] tracking-[0.2em] text-faint",
        className,
      )}
    >
      {String(value).padStart(2, "0")}
    </span>
  );
}

/** A card with four hairline corner ticks — the editorial "framed" treatment. */
export function FramedCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative border border-line bg-surface p-5", className)} {...props}>
      <span
        aria-hidden
        className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l border-t border-amber"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-px -top-px h-3 w-3 border-r border-t border-amber"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b border-l border-amber"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b border-r border-amber"
      />
      {children}
    </div>
  );
}
