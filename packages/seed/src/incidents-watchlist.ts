import type { Incident } from "@ferroscope/core";

/**
 * The watchlist. These four are either still developing, regionally specific,
 * or relevant enough to keep on the dashboard even after the news cycle moves.
 */
export const INCIDENTS_WATCHLIST: readonly Incident[] = [
  {
    slug: "sbi",
    name: "State Bank of India",
    headline: "India's biggest bank confirms a data breach",
    summary:
      "SBI confirmed that customer data was exposed. The bank has not published the full scope, but any confirmed banking breach means credentials and identifiers should be treated as suspect.",
    severity: "high",
    cvss: null,
    status: "active",
    vector: "banking",
    regions: ["IN"],
    disclosedAt: "2026-10-22T09:00:00Z",
    window: "48h",
    affected: ["acct-bank-sbi"],
    mitigations: ["act-rotate-bank", "act-2fa", "act-phishing-drill"],
    sources: [{ label: "State Bank of India", url: "https://sbi.co.in/" }],
    iocs: [],
    exposureNote:
      "If you bank with SBI, change the net-banking password and UPI PIN, and watch for phishing that quotes the breach. If you don't, this is not your incident.",
    timeline: [
      {
        at: "2026-10-22T09:00:00Z",
        label: "Confirmation",
        detail: "The bank confirms a data breach without publishing scope.",
      },
      {
        at: "2026-10-22T12:00:00Z",
        label: "Phishing wave",
        detail: "Fake 'breach compensation' messages begin targeting customers.",
      },
      {
        at: "2026-10-23T05:00:00Z",
        label: "Monitoring",
        detail: "Regulators ask the bank for a timeline and affected-record count.",
      },
    ],
  },
  {
    slug: "ovhcloud",
    name: "OVHcloud tooling",
    headline: "Hackers slipped a password stealer into a cloud company's official tool",
    summary:
      "A build pipeline compromise delivered a credential stealer inside an official OVHcloud client tool. Signed binaries are not automatically safe when the signing pipeline is shared.",
    severity: "high",
    cvss: 8.6,
    status: "contained",
    vector: "supply-chain",
    regions: ["global", "EU"],
    disclosedAt: "2026-10-22T11:00:00Z",
    window: "48h",
    affected: ["svc-ovh"],
    mitigations: ["act-rebuild-host", "act-rotate-ci-secrets", "act-verify-downloads"],
    sources: [{ label: "OVHcloud security", url: "https://www.ovhcloud.com/en/security/" }],
    iocs: [],
    exposureNote:
      "Only OVHcloud customers who installed the affected tool. Rebuild the machine rather than cleaning it, then rotate everything it could read.",
    timeline: [
      {
        at: "2026-10-22T11:00:00Z",
        label: "Detection",
        detail: "A build artifact is found to contain unexpected code.",
      },
      {
        at: "2026-10-22T17:00:00Z",
        label: "Withdrawal",
        detail: "The affected release is pulled from distribution.",
      },
      {
        at: "2026-10-23T08:00:00Z",
        label: "Rotation",
        detail: "Customers are told to rotate API credentials and SSH keys.",
      },
    ],
  },
  {
    slug: "siemens",
    name: "Siemens",
    headline: "A software hole being used to spread malware",
    summary:
      "An exploited flaw in Siemens industrial software is being used as an initial-access path, with malware moving from engineering workstations into operational networks.",
    severity: "high",
    cvss: 8.8,
    status: "active",
    vector: "endpoint",
    regions: ["global"],
    disclosedAt: "2026-10-22T13:30:00Z",
    window: "48h",
    affected: ["svc-siemens"],
    mitigations: ["act-network-audit", "act-2fa"],
    sources: [{ label: "Siemens ProductCERT", url: "https://cert-portal.siemens.com/" }],
    iocs: [],
    exposureNote:
      "Industrial engineering environments. Not a consumer laptop risk, but a reminder that operational technology is now a mainstream target.",
    timeline: [
      {
        at: "2026-10-22T13:30:00Z",
        label: "Advisory",
        detail: "Siemens confirms exploitation of a known flaw.",
      },
      {
        at: "2026-10-22T20:00:00Z",
        label: "Lateral movement",
        detail: "Responders observe movement from IT into OT segments.",
      },
      {
        at: "2026-10-23T09:00:00Z",
        label: "Mitigation",
        detail: "Network segmentation and patching guidance is published.",
      },
    ],
  },
  {
    slug: "north-korea",
    name: "North Korean campaign",
    headline: "State hackers launch a new attack campaign on South Korea",
    summary:
      "A state-linked group is running a fresh campaign against South Korean targets, combining spear-phishing with supply-chain intrusion into software vendors.",
    severity: "high",
    cvss: null,
    status: "active",
    vector: "state-actor",
    regions: ["KR"],
    disclosedAt: "2026-10-23T02:00:00Z",
    window: "48h",
    affected: [],
    mitigations: ["act-2fa", "act-phishing-drill", "act-verify-downloads"],
    sources: [{ label: "National Intelligence Service", url: "https://www.nis.go.kr/" }],
    iocs: [],
    exposureNote:
      "Region- and sector-targeted. The transferable lesson is the phishing playbook, not a specific vulnerability on your machine.",
    timeline: [
      {
        at: "2026-10-23T02:00:00Z",
        label: "Campaign detected",
        detail: "Targets in government and software supply chains are identified.",
      },
      {
        at: "2026-10-23T07:00:00Z",
        label: "TTPs published",
        detail: "Analysts release indicators and phishing lure patterns.",
      },
      {
        at: "2026-10-23T12:00:00Z",
        label: "Advisory",
        detail: "Organisations are urged to review vendor access.",
      },
    ],
  },
];
