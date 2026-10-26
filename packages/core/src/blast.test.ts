import { describe, expect, it } from "vitest";
import { blastEdgeKey, buildBlastGraph } from "./blast";
import { computeExposure } from "./exposure";
import type { ExposureProfile, Incident, StackItem } from "./types";

const STACK: readonly StackItem[] = [
  {
    id: "ca-emudhra",
    label: "eMudhra",
    vendor: "eMudhra",
    category: "certificate",
    riskWeight: 0.9,
    note: "",
    defaultOn: true,
  },
  {
    id: "acct-bank-sbi",
    label: "SBI",
    vendor: "SBI",
    category: "account",
    riskWeight: 0.95,
    note: "",
    defaultOn: true,
  },
  {
    id: "runtime-php",
    label: "PHP",
    vendor: "PHP Group",
    category: "runtime",
    riskWeight: 0.85,
    note: "",
    defaultOn: false,
  },
];

const INCIDENTS: readonly Incident[] = [
  {
    slug: "emudhra",
    name: "eMudhra",
    headline: "root",
    summary: "",
    severity: "critical",
    cvss: null,
    status: "active",
    vector: "certificate-authority",
    regions: ["global"],
    disclosedAt: "2026-10-21T09:00:00Z",
    window: "48h",
    affected: ["ca-emudhra"],
    mitigations: [],
    sources: [],
    iocs: [],
    exposureNote: "",
    timeline: [],
  },
  {
    slug: "php2shell",
    name: "PHP2Shell",
    headline: "php",
    summary: "",
    severity: "critical",
    cvss: 9.8,
    status: "patched",
    vector: "web-server",
    regions: ["global"],
    disclosedAt: "2026-10-21T06:00:00Z",
    window: "48h",
    affected: ["runtime-php"],
    mitigations: [],
    sources: [],
    iocs: [],
    exposureNote: "",
    timeline: [],
  },
];

const PROFILE: ExposureProfile = {
  stack: ["ca-emudhra", "acct-bank-sbi"],
  region: "IN",
  bank: true,
  passwordManager: false,
  twoFactor: false,
  autoUpdates: false,
};

describe("buildBlastGraph", () => {
  it("always contains a self node", () => {
    const report = computeExposure(PROFILE, INCIDENTS, STACK);
    const graph = buildBlastGraph(report, PROFILE, STACK);
    expect(graph.nodes.find((node) => node.id === "self")).toBeDefined();
    expect(graph.width).toBeGreaterThan(0);
    expect(graph.height).toBeGreaterThan(0);
  });

  it("draws one node per declared stack item and one per relevant incident", () => {
    const report = computeExposure(PROFILE, INCIDENTS, STACK);
    const graph = buildBlastGraph(report, PROFILE, STACK);
    expect(graph.nodes.filter((node) => node.kind === "stack")).toHaveLength(2);
    expect(graph.nodes.filter((node) => node.kind === "incident")).toHaveLength(2);
  });

  it("is deterministic for the same input", () => {
    const report = computeExposure(PROFILE, INCIDENTS, STACK);
    const first = buildBlastGraph(report, PROFILE, STACK);
    const second = buildBlastGraph(report, PROFILE, STACK);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("keeps every node inside the viewport", () => {
    const report = computeExposure(PROFILE, INCIDENTS, STACK);
    const graph = buildBlastGraph(report, PROFILE, STACK);
    for (const node of graph.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(graph.width);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(graph.height);
    }
  });

  it("creates a key for every edge", () => {
    const report = computeExposure(PROFILE, INCIDENTS, STACK);
    const graph = buildBlastGraph(report, PROFILE, STACK);
    const keys = graph.edges.map(blastEdgeKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
