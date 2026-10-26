import { describe, expect, it } from "vitest";
import { simulateCascade } from "./cascade";
import type { ExposureProfile, Incident, StackItem } from "./types";

const STACK: readonly StackItem[] = [
  {
    id: "runtime-php",
    label: "PHP",
    vendor: "PHP Group",
    category: "runtime",
    riskWeight: 0.85,
    note: "",
    defaultOn: true,
  },
  {
    id: "server-nginx",
    label: "NGINX",
    vendor: "F5",
    category: "server",
    riskWeight: 0.8,
    note: "",
    defaultOn: true,
  },
  {
    id: "svc-wordpress",
    label: "WordPress",
    vendor: "WordPress",
    category: "service",
    riskWeight: 0.8,
    note: "",
    defaultOn: false,
  },
];

const INCIDENT: Incident = {
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
  affected: ["runtime-php", "server-nginx", "svc-wordpress"],
  mitigations: [],
  sources: [],
  iocs: [],
  exposureNote: "",
  timeline: [],
};

const PROFILE: ExposureProfile = {
  stack: ["runtime-php", "server-nginx"],
  region: "IN",
  bank: true,
  passwordManager: false,
  twoFactor: false,
  autoUpdates: false,
};

describe("simulateCascade", () => {
  it("returns a monotonic tick sequence", () => {
    const result = simulateCascade(INCIDENT, PROFILE, STACK);
    const ticks = result.frames.map((frame) => frame.tick);
    expect(ticks).toEqual([...ticks].sort((a, b) => a - b));
    expect(new Set(ticks).size).toBe(ticks.length);
  });

  it("activates only declared surfaces first", () => {
    const result = simulateCascade(INCIDENT, PROFILE, STACK);
    const frameOne = result.frames[1];
    expect(frameOne?.activeNodes).toContain("runtime-php");
    expect(frameOne?.activeNodes).not.toContain("svc-wordpress");
  });

  it("peaks and then recovers", () => {
    const result = simulateCascade(INCIDENT, PROFILE, STACK);
    const risks = result.frames.map((frame) => frame.risk);
    const peakIndex = risks.indexOf(Math.max(...risks));
    expect(peakIndex).toBeGreaterThan(0);
    expect(risks[risks.length - 1]).toBeLessThan(risks[peakIndex] as number);
  });

  it("keeps risk inside 0..100", () => {
    const result = simulateCascade(INCIDENT, PROFILE, STACK);
    for (const frame of result.frames) {
      expect(frame.risk).toBeGreaterThanOrEqual(0);
      expect(frame.risk).toBeLessThanOrEqual(100);
    }
  });

  it("uses the hypothetical path when nothing matches", () => {
    const result = simulateCascade(INCIDENT, { ...PROFILE, stack: [] }, STACK);
    expect(result.frames.length).toBeGreaterThanOrEqual(8);
    expect(result.frames[1]?.detail).toContain("blast path");
  });
});
