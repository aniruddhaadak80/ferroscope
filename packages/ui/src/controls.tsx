"use client";

import { type ReactNode, useEffect, useId, useState } from "react";
import { cn } from "./cn";

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-4", disabled && "opacity-50")}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 border transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
          checked ? "border-amber bg-amber" : "border-line-strong bg-surface-2",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] block h-3 w-3 transition-transform duration-200",
            checked ? "translate-x-[19px] bg-ink" : "translate-x-[3px] bg-muted",
          )}
        />
      </button>
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium text-ink">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  suffix,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
  label: string;
  suffix?: string;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
        >
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums text-amber">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-full cursor-pointer appearance-none bg-line accent-amber [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-amber"
      />
    </div>
  );
}

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items, initialId }: { items: readonly TabItem[]; initialId?: string }) {
  const [active, setActive] = useState(initialId ?? items[0]?.id ?? "");
  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <div>
      <div role="tablist" aria-label="views" className="flex flex-wrap gap-1 border-b border-line">
        {items.map((item) => {
          const selected = item.id === current?.id;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(item.id)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                selected
                  ? "border-amber text-amber"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-5">
        {current?.content}
      </div>
    </div>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 max-h-[88vh] w-full max-w-xl overflow-y-auto border border-line-strong bg-surface p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:max-w-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <h2 className="font-display text-2xl text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted hover:text-ink"
          >
            Close
          </button>
        </div>
        <div className="pt-5">{children}</div>
        {footer ? <div className="mt-6 border-t border-line pt-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-10 w-full border border-line bg-surface-2 px-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-amber"
      />
      {hint ? <p className="mt-1.5 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full appearance-none border border-line bg-surface-2 px-3 text-sm text-ink outline-none transition-colors focus:border-amber"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SelectableTile({
  selected,
  onSelect,
  title,
  meta,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  meta?: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group flex h-full w-full flex-col items-start gap-1 border p-3 text-left transition-colors",
        selected
          ? "border-amber bg-amber/[0.07]"
          : "border-line bg-surface hover:border-line-strong hover:bg-surface-2",
      )}
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className={cn("text-sm font-medium", selected ? "text-amber" : "text-ink")}>
          {title}
        </span>
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center border",
            selected ? "border-amber bg-amber" : "border-line-strong",
          )}
        >
          {selected ? <span className="h-1 w-1 bg-ink" /> : null}
        </span>
      </span>
      {meta ? (
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">{meta}</span>
      ) : null}
      {description ? (
        <span className="text-xs leading-relaxed text-muted">{description}</span>
      ) : null}
    </button>
  );
}
