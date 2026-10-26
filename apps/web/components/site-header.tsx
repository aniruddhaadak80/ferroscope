import { ThemeToggle } from "@ferroscope/ui";
import { Github } from "lucide-react";
import Link from "next/link";
import { CommandTrigger } from "@/components/command-palette";
import { FerroMark } from "@/components/ferro-mark";
import { PRIMARY_NAV } from "@/lib/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[80] border-b border-line bg-canvas/88 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="text-ink transition-colors group-hover:text-amber">
            <FerroMark />
          </span>
          <span className="font-mono text-[12px] uppercase tracking-[0.34em] text-ink">
            Ferroscope
          </span>
          <span className="hidden border border-amber/40 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-amber sm:inline">
            v0.1
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CommandTrigger />
          <ThemeToggle className="hidden sm:inline-flex" />
          <a
            href="https://github.com/aniruddhaadak80/ferroscope"
            target="_blank"
            rel="noreferrer"
            aria-label="Ferroscope on GitHub"
            className="hidden h-8 w-8 items-center justify-center border border-line text-muted transition-colors hover:border-amber hover:text-amber sm:flex"
          >
            <Github size={14} />
          </a>
          <details className="group relative lg:hidden">
            <summary className="flex h-8 cursor-pointer list-none items-center border border-line px-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted marker:content-none hover:text-ink">
              Menu
            </summary>
            <div className="absolute right-0 top-10 z-50 w-56 border border-line bg-surface p-2 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <nav aria-label="Mobile" className="flex flex-col">
                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted hover:bg-surface-2 hover:text-ink"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/profile"
                  className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-amber hover:bg-surface-2"
                >
                  Your stack
                </Link>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
