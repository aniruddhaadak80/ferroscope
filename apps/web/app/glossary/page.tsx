import { PageHeader, Prose } from "@ferroscope/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "The vocabulary Ferroscope uses precisely: blast radius, exposure, gap, near miss, control plane, trust store, and the difference between a breach and an intersection.",
};

interface Term {
  term: string;
  short: string;
  body: string;
  related?: readonly string[];
}

const TERMS: readonly Term[] = [
  {
    term: "Blast radius",
    short: "How much of your stack one incident can reach",
    body: "Not the number of affected users globally. The set of components you declared that sit on the incident's attack path, plus the neighbours those components can reach. It is a graph property, which is why the product draws one.",
    related: ["Exposure", "Cascade"],
  },
  {
    term: "Exposure",
    short: "Intersection between a threat and something you declared",
    body: "Exposure is not compromise. A laptop trusts the eMudhra root — that is exposure. Nobody has used the corresponding key against that laptop — that is the absence of compromise. Ferroscope only ever claims the first.",
    related: ["Intersection", "Breach"],
  },
  {
    term: "Intersection",
    short: "The matcher firing on a declared component",
    body: "An incident matches when at least one of its affected stack ids is present in your profile, or when it is region-scoped and your region matches. Everything else is context.",
    related: ["Near miss", "Confidence"],
  },
  {
    term: "Near miss",
    short: "One component away from an intersection",
    body: "An incident where you have zero affected items but two or fewer missing ones. The graph shows these at lower opacity because they are the honest answer to “what would installing this cost me?”.",
    related: ["Intersection"],
  },
  {
    term: "Confidence",
    short: "How much of an incident's surface you actually run",
    body: "Computed as 0.55 + 0.45 × (present ÷ affected). It is a coverage fraction, not a probability. Four of four surfaces present scores 1.0; one of four scores 0.66.",
    related: ["Intersection"],
  },
  {
    term: "Mitigation",
    short: "Impact removed by hygiene you already have",
    body: "2FA, a password manager, and automatic updates each subtract from an incident's raw weight, capped at 80%. The cap exists because partial controls are not a force field.",
    related: ["Residual risk"],
  },
  {
    term: "Residual risk",
    short: "What remains after completed actions",
    body: "Reductions compound multiplicatively with a 0.72 haircut per action, so residual risk approaches zero but the arithmetic never goes negative. The planner shows baseline and residual side by side for exactly this reason.",
    related: ["Efficiency"],
  },
  {
    term: "Efficiency",
    short: "Risk points removed per minute",
    body: "The planner's ranking key. A three-minute certificate refresh that removes 12 points scores 4.0/min; a ninety-minute rebuild that removes 20 scores 0.22/min. The first one wins, and that ordering is the product.",
    related: ["Residual risk"],
  },
  {
    term: "Cascade",
    short: "A deterministic twelve-frame narrative",
    body: "Primary surface, then same-category siblings, then peak, then containment. It is not a physics model. It is a communication device for the word “lateral”.",
    related: ["Blast radius"],
  },
  {
    term: "Trust store",
    short: "The list of roots a runtime will accept",
    body: "Windows, Firefox, Chrome, Java, Node, and Python each keep their own. Updating one does not update the others. certifi, Python's bundle, is vendored and follows PyPI, not Windows Update.",
    related: ["Root", "Intermediate"],
  },
  {
    term: "Root",
    short: "A self-signed CA certificate everything else chains to",
    body: "If a root is compromised, every certificate beneath it can be forged. Browser vendors can block the intermediate, but a non-browser store that still trusts the root remains exposed.",
    related: ["Trust store", "Intermediate"],
  },
  {
    term: "Intermediate",
    short: "A CA certificate signed by a root",
    body: "The eMudhra incident involved eight intermediates with trivially weak P-384 private keys. Browsers blocked those intermediates; the parent root stayed in several bundles.",
    related: ["Root"],
  },
  {
    term: "Control plane",
    short: "The layer that can push code to your servers",
    body: "Railway, Zeabur, Onamae, TiDB Cloud. If an attacker owns the control plane, they own every host beneath it — which is why hosting incidents have disproportionate blast radii.",
    related: ["Supply chain"],
  },
  {
    term: "Supply chain",
    short: "A compromise that arrives through a trusted channel",
    body: "An updater, a registry, a CI workflow, a vendor's signing pipeline. The victim does nothing wrong; the channel does. This is why signature verification is necessary but insufficient.",
    related: ["Control plane"],
  },
  {
    term: "Breach",
    short: "Confirmed unauthorised access to data or systems",
    body: "Reserved for incidents where a party has stated that access occurred. Ferroscope never upgrades an intersection to a breach. The gap between the two words is the product's entire ethical position.",
  },
  {
    term: "Hygiene",
    short: "Controls that reduce impact across many incidents",
    body: "2FA, password manager, automatic updates. They do not prevent a specific incident; they lower the weight of whole vector classes. That is why they are modelled separately from remediation actions.",
  },
  {
    term: "Deterministic",
    short: "Same input, same output, byte for byte",
    body: "No randomness at request time. Graph jitter comes from an FNV-1a hash of the node id. The seed exists so screenshots and tests agree with production.",
  },
  {
    term: "Seed 2718",
    short: "The dataset's identity, not a random number",
    body: "e ≈ 2.718, π ≈ 3.14. The seed is a constant in the repository, printed in the footer, and returned by /api/healthz so a deployment can be checked against the dataset it claims to serve.",
  },
];

const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));

export default function GlossaryPage() {
  return (
    <Container>
      <PageHeader
        index="12"
        kicker="Glossary"
        title={
          <>
            Precision is
            <br />a <em className="text-amber">feature</em>.
          </>
        }
        lede="Security language is loose in a way that flatters vendors. These definitions are the ones the code actually implements."
        meta={<span>{TERMS.length} terms</span>}
      />

      <div className="grid gap-10 py-10 lg:grid-cols-[1fr_16rem] lg:items-start">
        <dl className="divide-y divide-line border-y border-line">
          {sorted.map((entry) => (
            <div key={entry.term} className="grid gap-2 py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <dt>
                <p className="font-display text-xl leading-tight text-ink">{entry.term}</p>
                <p className="mt-1 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-amber">
                  {entry.short}
                </p>
              </dt>
              <dd>
                <Prose>
                  <p>{entry.body}</p>
                </Prose>
                {entry.related ? (
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                    See also: {entry.related.join(" · ")}
                  </p>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>

        <aside className="lg:sticky lg:top-24">
          <div className="border border-line bg-surface p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Jump</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 lg:grid-cols-1">
              {sorted.map((entry) => (
                <li key={entry.term}>
                  <a
                    href={`#${entry.term.toLowerCase().replaceAll(" ", "-")}`}
                    className="text-xs text-muted hover:text-amber"
                  >
                    {entry.term}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 border border-line bg-surface p-5">
            <p className="text-sm leading-relaxed text-muted">
              The scoring formulas behind these words are on the{" "}
              <Link href="/method" className="text-amber underline underline-offset-4">
                method page
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
