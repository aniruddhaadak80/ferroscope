"use client";

import { INCIDENTS } from "@ferroscope/seed";
import { Command } from "cmdk";
import { Moon, Search, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/lib/nav";

const goItems = [...PRIMARY_NAV, ...SECONDARY_NAV, { href: "/", label: "Home" }];

export function CommandTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("ferroscope:command"))}
      className="flex h-8 items-center gap-2 border border-line px-2.5 text-muted transition-colors hover:border-amber hover:text-amber"
      aria-label="Open command palette"
    >
      <Search size={12} />
      <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] md:inline">
        Search
      </span>
      <kbd className="hidden border border-line px-1 py-0.5 font-mono text-[8px] text-faint md:inline">
        ⌘K
      </kbd>
    </button>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ferroscope:command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ferroscope:command", onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command palette" loop>
      <Command.Input
        placeholder="Jump to a page, incident, or action…"
        className="h-12 w-full border-b border-line bg-transparent px-4 font-mono text-xs uppercase tracking-[0.14em] text-ink outline-none placeholder:text-faint"
      />
      <Command.List className="max-h-[52vh] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
          No matches.
        </Command.Empty>

        <Command.Group
          heading="Navigate"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-faint"
        >
          {goItems.map((item) => (
            <Command.Item
              key={item.href}
              value={`${item.label} ${item.href}`}
              onSelect={() => go(item.href)}
              className="cursor-pointer px-3 py-2 text-sm text-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink"
            >
              {item.label}
              <span className="ml-2 font-mono text-[9px] text-faint">{item.href}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group
          heading="Incidents"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-faint"
        >
          {INCIDENTS.map((incident) => (
            <Command.Item
              key={incident.slug}
              value={`${incident.name} ${incident.vector} ${incident.severity}`}
              onSelect={() => go(`/atlas/${incident.slug}`)}
              className="flex cursor-pointer items-center justify-between gap-4 px-3 py-2 text-sm text-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink"
            >
              <span className="truncate">{incident.name}</span>
              <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                {incident.severity}
              </span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group
          heading="Actions"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-faint"
        >
          <Command.Item
            value="dark theme"
            onSelect={() => {
              setTheme("dark");
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink"
          >
            <Moon size={12} /> Dark theme
          </Command.Item>
          <Command.Item
            value="light theme"
            onSelect={() => {
              setTheme("light");
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink"
          >
            <Sun size={12} /> Light theme
          </Command.Item>
        </Command.Group>
      </Command.List>
      <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
        <span>↑↓ navigate · ↵ open · esc close</span>
        <span>Ferroscope</span>
      </div>
    </Command.Dialog>
  );
}
