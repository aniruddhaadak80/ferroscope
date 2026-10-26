export interface NavItem {
  href: string;
  label: string;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { href: "/atlas", label: "Atlas" },
  { href: "/blast-radius", label: "Blast radius" },
  { href: "/planner", label: "Planner" },
  { href: "/ledger", label: "Trust ledger" },
  { href: "/playbooks", label: "Playbooks" },
];

export const SECONDARY_NAV: readonly NavItem[] = [
  { href: "/profile", label: "Your stack" },
  { href: "/cascade", label: "Cascade" },
  { href: "/timeline", label: "Timeline" },
  { href: "/matrix", label: "Matrix" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/supply-chain", label: "Supply chain" },
  { href: "/report", label: "Report" },
  { href: "/stats", label: "Stats" },
  { href: "/method", label: "Method" },
  { href: "/glossary", label: "Glossary" },
];

export const FOOTER_NAV: readonly { title: string; items: readonly NavItem[] }[] = [
  {
    title: "Observatory",
    items: [
      { href: "/atlas", label: "Incident atlas" },
      { href: "/timeline", label: "48-hour timeline" },
      { href: "/matrix", label: "Risk matrix" },
      { href: "/stats", label: "Dataset stats" },
    ],
  },
  {
    title: "Your exposure",
    items: [
      { href: "/profile", label: "Declare your stack" },
      { href: "/blast-radius", label: "Blast radius" },
      { href: "/cascade", label: "Cascade simulator" },
      { href: "/planner", label: "Remediation planner" },
    ],
  },
  {
    title: "Reference",
    items: [
      { href: "/ledger", label: "Certificate ledger" },
      { href: "/playbooks", label: "Playbooks" },
      { href: "/method", label: "Scoring method" },
      { href: "/glossary", label: "Glossary" },
    ],
  },
  {
    title: "Project",
    items: [
      { href: "/about", label: "About" },
      { href: "/changelog", label: "Changelog" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/settings", label: "Settings" },
    ],
  },
];
