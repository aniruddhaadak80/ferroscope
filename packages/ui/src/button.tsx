import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[2px] font-mono text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:pointer-events-none disabled:opacity-45";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-amber text-ink-950 hover:bg-amber-bright",
  outline: "border border-line-strong text-ink hover:border-amber hover:text-amber",
  ghost: "text-muted hover:bg-surface-2 hover:text-ink",
  danger: "bg-rust text-white hover:bg-rust-bright",
  link: "px-0 text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-[12px]",
};

export function buttonClasses(options?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string | undefined;
}): string {
  const variant = options?.variant ?? "primary";
  const size = options?.size ?? "md";
  return cn(
    BASE,
    VARIANTS[variant],
    variant === "link" ? undefined : SIZES[size],
    options?.className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return <a className={buttonClasses({ variant, size, className })} {...props} />;
}
