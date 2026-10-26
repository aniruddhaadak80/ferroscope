"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "./cn";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Auto" },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <fieldset className={cn("inline-flex border border-line bg-surface p-0", className)}>
      <legend className="sr-only">Color theme</legend>
      {OPTIONS.map((option) => {
        const active = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={active}
            className={cn(
              "px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors",
              active ? "bg-ink text-canvas" : "text-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
