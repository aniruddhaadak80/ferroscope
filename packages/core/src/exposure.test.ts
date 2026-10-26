import { describe, expect, it } from "vitest";
import { computeExposure, mitigationFor, riskBand } from "./exposure";
import type { ExposureProfile, Incident, StackItem } from "./types";

const STACK: readonly StackItem[] = [
  {
    id: "ca-emudhra",
    label: "eMudhra",
    vendor: "eMudhra",
    category: "certificate",
    riskWeight: 0.9,
    note: "compromised root",
    defaultOn: true,
  },
  {
    id: "acct-bank-sbi",
    label: "SBI banking",
    vendor: "SBI",
    category: "account",
    riskWeight: 0.95,
    note: "money",
    defaultOn: true,
  },
  {
    id: "runtime-php",
    label: "PHP",
    vendor: "PHP Group",
    category: "runtime",
    riskWeight: 0.85,
    note: "server",
    defaultOn: false,
  },
];

function incident(
  partial: Partial<Incident> & Pick<Incident, "slug" | "name" | "severity" | "vector" | "affected">,
): Incident {
  return {
    headline: partial.headline ?? partial.name,
    summary: "fixture",
    cvss: null,
    status: "active",
    regions: ["global"],
    disclosedAt: "2026-10-21T09:00:00Z",
    window: "48h",
    mitigations: [],
    sources: [],
    iocs: [],
    exposureNote: "fixture",
    timeline: [],
    ...partial,
  };
}

const INCIDENTS: readonly Incident[] = [
  incident({
    slug: "emudhra",
    name: "eMudhra root keys",
    severity: "critical",
    vector: "certificate-authority",
    affected: ["ca-emudhra"],
  }),
  incident({
    slug: "sbi",
    name: "SBI breach",
    severity: "high",
    vector: "banking",
    affected: ["acct-bank-sbi"],
    regions: ["IN"],
  }),
  incident({
    slug: "php2shell",
    name: "PHP2Shell",
    severity: "critical",
    vector: "web-server",
    affected: ["runtime-php"],
  }),
  incident({
    slug: "california",
    name: "California students",
    severity: "critical",
    vector: "data-breach",
    affected: [],
    regions: ["US"],
  }),
];

const PROFILE: ExposureProfile = {
  stack: ["ca-emudhra", "acct-bank-sbi"],
  region: "IN",
  bank: true,
  passwordManager: false,
  twoFactor: false,
  autoUpdates: false,
};

describe("computeExposure", () => {
  it("matches only declared attack surface", () => {
    const report = computeExposure(PROFILE, INCIDENTS, STACK);
    expect(report.exposed.map((match) => match.incident.slug)).toEqual(["emudhra", "sbi"]);
    expect(report.totalIncidents).toBe(4);
    expect(report.examinedStack).toBe(2);
  });

  it("produces a risk in the exposed band for two serious matches", () => {
    const report = computeExposure(PROFILE, INCIDENTS, STACK);
    expect(report.risk).toBeGreaterThan(45);
    expect(report.risk).toBeLessThan(70);
    expect(report.band).toBe("exposed");
    expect(report.score).toBe(100 - report.risk);
  });

  it("sums contributions to the overall risk", () => {
    const report = computeExposure(PROFILE, INCIDENTS, STACK);
    const sum = report.exposed.reduce((total, match) => total + match.contribution, 0);
    expect(Math.abs(sum - report.risk)).toBeLessThanOrEqual(1);
  });

  it("returns a fortified report for an empty stack", () => {
    const report = computeExposure({ ...PROFILE, stack: [] }, INCIDENTS, STACK);
    expect(report.exposed).toHaveLength(0);
    expect(report.risk).toBe(0);
    expect(report.band).toBe("fortified");
    expect(report.summary).toContain("None of the 4 incidents");
  });

  it("adds a regional incident only inside its region", () => {
    const outside = computeExposure(PROFILE, INCIDENTS, STACK);
    expect(outside.exposed.map((match) => match.incident.slug)).not.toContain("california");

    const inside = computeExposure({ ...PROFILE, region: "US" }, INCIDENTS, STACK);
    expect(inside.exposed.map((match) => match.incident.slug)).toContain("california");
  });

  it("never scores above 100 or below 0", () => {
    const report = computeExposure(
      { ...PROFILE, stack: STACK.map((item) => item.id) },
      INCIDENTS,
      STACK,
    );
    expect(report.risk).toBeGreaterThanOrEqual(0);
    expect(report.risk).toBeLessThanOrEqual(100);
  });

  it("downgrades effective severity when mitigation is strong", () => {
    const report = computeExposure(
      { ...PROFILE, twoFactor: true, passwordManager: true, autoUpdates: true },
      INCIDENTS,
      STACK,
    );
    const sbi = report.exposed.find((match) => match.incident.slug === "sbi");
    expect(sbi?.effectiveSeverity).toBe("medium");
  });
});

describe("mitigationFor", () => {
  it("stacks independent hygiene controls", () => {
    const value = mitigationFor(
      { ...PROFILE, twoFactor: true, passwordManager: true, autoUpdates: true },
      INCIDENTS[0] as Incident,
    );
    expect(value).toBeCloseTo(0.25, 2);
  });

  it("never exceeds the conservative cap", () => {
    const value = mitigationFor(
      { ...PROFILE, twoFactor: true, passwordManager: true, autoUpdates: true },
      INCIDENTS[1] as Incident,
    );
    expect(value).toBeLessThanOrEqual(0.8);
  });
});

describe("riskBand", () => {
  it.each([
    [0, "fortified"],
    [19, "fortified"],
    [20, "watchful"],
    [44, "watchful"],
    [45, "exposed"],
    [69, "exposed"],
    [70, "critical"],
    [100, "critical"],
  ] as const)("maps %i to %s", (risk, band) => {
    expect(riskBand(risk)).toBe(band);
  });
});
