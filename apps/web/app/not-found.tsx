import { ButtonLink, Kicker } from "@ferroscope/ui";
import Link from "next/link";
import { Container } from "@/components/container";

const ROUTES = [
  { href: "/atlas", label: "Incident atlas" },
  { href: "/blast-radius", label: "Blast radius" },
  { href: "/cascade", label: "Cascade" },
  { href: "/planner", label: "Planner" },
  { href: "/ledger", label: "Trust ledger" },
  { href: "/playbooks", label: "Playbooks" },
  { href: "/method", label: "Method" },
];

export default function NotFound() {
  return (
    <Container>
      <div className="grid min-h-[60vh] items-center py-16 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div>
          <Kicker index="404">Not filed</Kicker>
          <h1 className="mt-6 text-balance font-display text-[clamp(3rem,9vw,7rem)] leading-[0.86] tracking-[-0.04em] text-ink">
            No incident
            <br />
            under that <em className="text-amber">name</em>.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">
            The atlas holds twenty-seven files. This is not one of them. The link may be old, or the
            slug may have been renamed when the dataset was reviewed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/atlas" size="sm">
              Open the atlas
            </ButtonLink>
            <ButtonLink href="/" variant="outline" size="sm">
              Back to the instrument
            </ButtonLink>
          </div>
        </div>

        <nav aria-label="Popular routes" className="mt-12 lg:mt-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Try instead</p>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {ROUTES.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="flex items-center justify-between py-2.5 text-sm text-muted hover:text-amber"
                >
                  {route.label}
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Container>
  );
}
