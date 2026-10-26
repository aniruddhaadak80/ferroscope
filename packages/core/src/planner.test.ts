import { describe, expect, it } from "vitest";
import { computeExposure } from "./exposure";
import { nextBestAction, rankActions, residualRisk, totalMinutes } from "./planner";
import type { ExposureProfile, Incident, RemediationAction, StackItem } from "./types";

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
];

function incident(
  partial: Pick<Incident, "slug" | "name" | "severity" | "vector" | "affected">,
): Incident {
  return {
    headline: partial.name,
    summary: "",
    cvss: null,
    status: "active",
    regions: ["global"],
    disclosedAt: "2026-10-21T09:00:00Z",
    window: "48h",
    mitigations: [],
    sources: [],
    iocs: [],
    exposureNote: "",
    timeline: [],
    ...partial,
  };
}

const INCIDENTS: readonly Incident[] = [
  incident({
    slug: "emudhra",
    name: "eMudhra",
    severity: "critical",
    vector: "certificate-authority",
    affected: ["ca-emudhra"],
  }),
  incident({
    slug: "sbi",
    name: "SBI",
    severity: "high",
    vector: "banking",
    affected: ["acct-bank-sbi"],
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

function action(
  partial: Partial<RemediationAction> &
    Pick<RemediationAction, "id" | "minutes" | "reduces" | "vectors">,
): RemediationAction {
  return {
    title: partial.id,
    detail: "",
    category: "identity",
    incidentSlugs: [],
    steps: [],
    ...partial,
  };
}

const ACTIONS: readonly RemediationAction[] = [
  action({
    id: "act-certifi",
    minutes: 3,
    reduces: 0.85,
    vectors: ["certificate-authority"],
  }),
  action({
    id: "act-rotate-bank",
    minutes: 20,
    reduces: 0.8,
    vectors: ["banking"],
  }),
  action({
    id: "act-2fa",
    minutes: 12,
    reduces: 0.6,
    vectors: ["banking", "identity"],
  }),
  action({
    id: "act-offline-backup",
    minutes: 30,
    reduces: 0.5,
    vectors: ["ransomware"],
  }),
];

describe("rankActions", () => {
  const report = computeExposure(PROFILE, INCIDENTS, STACK);

  it("ranks the cheapest high-impact fix first", () => {
    const plans = rankActions(ACTIONS, report);
    expect(plans[0]?.action.id).toBe("act-certifi");
  });

  it("sorts unfinished actions by efficiency, descending", () => {
    const plans = rankActions(ACTIONS, report);
    const efficiencies = plans.map((plan) => plan.efficiency);
    expect(efficiencies).toEqual([...efficiencies].sort((a, b) => b - a));
  });

  it("keeps irrelevant actions last", () => {
    const plans = rankActions(ACTIONS, report);
    expect(plans[plans.length - 1]?.action.id).toBe("act-offline-backup");
    expect(plans[plans.length - 1]?.relevant).toHaveLength(0);
  });

  it("never removes more risk than exists", () => {
    const plans = rankActions(ACTIONS, report);
    for (const plan of plans) {
      expect(plan.riskReduced).toBeLessThanOrEqual(report.risk);
      expect(plan.riskReduced).toBeGreaterThanOrEqual(0);
    }
  });

  it("marks completed actions and moves them down", () => {
    const plans = rankActions(ACTIONS, report, ["act-certifi"]);
    const certifi = plans.find((plan) => plan.action.id === "act-certifi");
    expect(certifi?.completed).toBe(true);
    expect(plans[0]?.action.id).not.toBe("act-certifi");
  });

  it("computes a multiplicative residual risk", () => {
    const plans = rankActions(ACTIONS, report, ["act-certifi", "act-rotate-bank"]);
    const residual = residualRisk(report, plans);
    expect(residual).toBeGreaterThanOrEqual(0);
    expect(residual).toBeLessThan(report.risk);
  });

  it("drives residual risk low without going negative", () => {
    const everything = ACTIONS.map((item) => item.id);
    const plans = rankActions(ACTIONS, report, everything);
    const residual = residualRisk(report, plans);
    expect(residual).toBeGreaterThanOrEqual(0);
    expect(residual).toBeLessThan(10);
  });

  it("totals only unfinished minutes", () => {
    const plans = rankActions(ACTIONS, report, ["act-certifi"]);
    const expected = ACTIONS.filter((item) => item.id !== "act-certifi").reduce(
      (sum, item) => sum + item.minutes,
      0,
    );
    expect(totalMinutes(plans)).toBe(expected);
  });

  it("picks the next best relevant action", () => {
    const plans = rankActions(ACTIONS, report, ["act-certifi"]);
    expect(nextBestAction(plans)?.action.id).not.toBe("act-offline-backup");
  });
});
