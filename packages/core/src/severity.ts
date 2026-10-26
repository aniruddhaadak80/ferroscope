import type { Severity } from "./types";
import { SEVERITIES } from "./types";

/** Higher is worse. Used for sorting and for "worst severity" rollups. */
export const SEVERITY_RANK: Readonly<Record<Severity, number>> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/** Normalised 0..1 weight used by the risk maths. */
export const SEVERITY_WEIGHT: Readonly<Record<Severity, number>> = {
  critical: 1,
  high: 0.7,
  medium: 0.42,
  low: 0.18,
};

export const SEVERITY_LABEL: Readonly<Record<Severity, string>> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_RANK[b] - SEVERITY_RANK[a];
}

export function isSeverity(value: string): value is Severity {
  return (SEVERITIES as readonly string[]).includes(value);
}

export function worstSeverity(values: readonly Severity[]): Severity {
  let worst: Severity = "low";
  for (const value of values) {
    if (SEVERITY_RANK[value] > SEVERITY_RANK[worst]) worst = value;
  }
  return worst;
}

/** One step down, but never below low. Used when a mitigation is present. */
export function downgrade(value: Severity): Severity {
  switch (value) {
    case "critical":
      return "high";
    case "high":
      return "medium";
    case "medium":
      return "low";
    case "low":
      return "low";
  }
}
