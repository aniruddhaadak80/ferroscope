import { Github } from "lucide-react";
import Link from "next/link";
import { FerroMark } from "@/components/ferro-mark";
import { FOOTER_NAV } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-3 text-ink">
              <FerroMark size={30} />
              <span className="font-mono text-[13px] uppercase tracking-[0.34em]">Ferroscope</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              A personal exposure observatory. Declare what you actually run, see which incidents
              touch it, and fix the cheapest thing first.
            </p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              Deterministic · offline-first · zero API keys
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://github.com/aniruddhaadak80/ferroscope"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center border border-line text-muted hover:border-amber hover:text-amber"
                aria-label="GitHub"
              >
                <Github size={14} />
              </a>
              <a
                href="https://dev.to/aniruddhaadak"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted hover:text-amber"
              >
                DEV
              </a>
              <a
                href="https://x.com/asi369_"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted hover:text-amber"
              >
                X
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
                  {group.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-muted hover:text-ink">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
            MIT © 2026 Aniruddha Adak · Kolkata, India
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
            27 incidents seeded · seed 2718 · no telemetry
          </p>
        </div>
      </div>
    </footer>
  );
}
