/**
 * Ferroscope domain types.
 *
 * Everything here is deliberately serialisable: the same shapes cross the
 * server/client boundary, land in JSON reports, and seed the deterministic
 * simulator. No class instances, no Date objects, no functions.
 */

export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const VECTORS = [
  "web-server",
  "certificate-authority",
  "supply-chain",
  "hosting",
  "identity",
  "browser",
  "runtime",
  "network",
  "endpoint",
  "banking",
  "ai-agent",
  "ransomware",
  "state-actor",
  "data-breach",
] as const;
export type Vector = (typeof VECTORS)[number];

export const INCIDENT_STATUSES = ["active", "contained", "patched", "unverified"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export type IncidentWindow = "48h" | "month";

export interface IncidentSource {
  readonly label: string;
  readonly url: string;
}

export interface IncidentTimelineEntry {
  /** ISO-8601 UTC timestamp. */
  readonly at: string;
  readonly label: string;
  readonly detail: string;
}

export interface Incident {
  readonly slug: string;
  readonly name: string;
  readonly headline: string;
  readonly summary: string;
  readonly severity: Severity;
  readonly cvss: number | null;
  readonly status: IncidentStatus;
  readonly vector: Vector;
  readonly regions: readonly string[];
  readonly disclosedAt: string;
  readonly window: IncidentWindow;
  /** Stack item ids that make a profile vulnerable. Empty means "context only". */
  readonly affected: readonly string[];
  /** Remediation action ids that reduce this incident. */
  readonly mitigations: readonly string[];
  readonly sources: readonly IncidentSource[];
  readonly iocs: readonly string[];
  readonly exposureNote: string;
  readonly timeline: readonly IncidentTimelineEntry[];
}

export const STACK_CATEGORIES = [
  "os",
  "browser",
  "runtime",
  "server",
  "service",
  "certificate",
  "account",
  "package",
  "ai",
  "device",
] as const;
export type StackCategory = (typeof STACK_CATEGORIES)[number];

export interface StackItem {
  readonly id: string;
  readonly label: string;
  readonly vendor: string;
  readonly category: StackCategory;
  /** 0..1 — how much a compromise of this item usually costs. */
  readonly riskWeight: number;
  readonly note: string;
  readonly defaultOn: boolean;
}

export interface ExposureProfile {
  /** Stack item ids the person actually runs. */
  readonly stack: readonly string[];
  /** ISO-3166 alpha-2 region used for regional incidents. */
  readonly region: string;
  readonly bank: boolean;
  readonly passwordManager: boolean;
  readonly twoFactor: boolean;
  readonly autoUpdates: boolean;
}

export type RiskBand = "fortified" | "watchful" | "exposed" | "critical";

export interface IncidentMatch {
  readonly incident: Incident;
  readonly matched: boolean;
  /** 0..1 — fraction of the incident's attack surface present in the profile. */
  readonly confidence: number;
  readonly reasons: readonly string[];
  /** Stack ids that, if added, would create exposure. */
  readonly missing: readonly string[];
  readonly effectiveSeverity: Severity;
  /** 0..100 contribution to the overall exposure score. */
  readonly contribution: number;
}

export interface VectorRollup {
  readonly vector: Vector;
  readonly count: number;
  readonly risk: number;
}

export interface ExposureReport {
  /** 0..100, higher is safer. Always the complement of `risk`. */
  readonly score: number;
  /** 0..100, higher is worse. */
  readonly risk: number;
  readonly band: RiskBand;
  readonly matches: readonly IncidentMatch[];
  readonly exposed: readonly IncidentMatch[];
  readonly counts: Readonly<Record<Severity, number>>;
  readonly vectors: readonly VectorRollup[];
  readonly totalIncidents: number;
  readonly examinedStack: number;
  readonly summary: string;
}

export type ActionCategory =
  | "identity"
  | "patching"
  | "network"
  | "supply-chain"
  | "certificates"
  | "banking"
  | "device";

export interface RemediationAction {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly category: ActionCategory;
  /** Realistic minutes for a competent adult, not a security team. */
  readonly minutes: number;
  /** 0..1 — share of the affected risk this action removes. */
  readonly reduces: number;
  readonly vectors: readonly Vector[];
  readonly incidentSlugs: readonly string[];
  readonly steps: readonly string[];
  readonly command?: string;
}

export interface ActionPlan {
  readonly action: RemediationAction;
  readonly relevant: readonly string[];
  /** Risk points removed if completed. */
  readonly riskReduced: number;
  /** Risk points removed per minute — the ranking key. */
  readonly efficiency: number;
  readonly completed: boolean;
}

export type BlastNodeKind = "self" | "stack" | "incident" | "action";

export interface BlastNode {
  readonly id: string;
  readonly label: string;
  readonly kind: BlastNodeKind;
  readonly severity: Severity | null;
  readonly x: number;
  readonly y: number;
  readonly weight: number;
}

export interface BlastEdge {
  readonly from: string;
  readonly to: string;
  readonly weight: number;
  readonly kind: "stack-incident" | "core-stack";
}

export interface BlastGraph {
  readonly nodes: readonly BlastNode[];
  readonly edges: readonly BlastEdge[];
  readonly width: number;
  readonly height: number;
}

export interface CascadeFrame {
  readonly tick: number;
  readonly activeNodes: readonly string[];
  readonly activeEdges: readonly string[];
  readonly risk: number;
  readonly headline: string;
  readonly detail: string;
}

export interface CascadeResult {
  readonly incident: Incident;
  readonly frames: readonly CascadeFrame[];
  readonly peakRisk: number;
  readonly ticks: number;
}

export type CertificateStatus = "trusted" | "distrusted" | "blocked-in-browsers" | "retired";

export interface CertificateRecord {
  readonly id: string;
  readonly commonName: string;
  readonly owner: string;
  readonly status: CertificateStatus;
  readonly systemStore: boolean;
  readonly pythonBundle: boolean;
  readonly nodeBundle: boolean;
  readonly note: string;
}

export interface PlaybookStep {
  readonly title: string;
  readonly detail: string;
  readonly minutes: number;
}

export interface Playbook {
  readonly slug: string;
  readonly title: string;
  readonly kicker: string;
  readonly summary: string;
  readonly forVectors: readonly Vector[];
  readonly steps: readonly PlaybookStep[];
  readonly command?: string;
}

export interface Scenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly profile: ExposureProfile;
}

export interface ScenarioComparison {
  readonly scenario: Scenario;
  readonly report: ExposureReport;
  readonly delta: number;
}
