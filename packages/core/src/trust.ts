import type { CertificateRecord } from "./types";

export interface TrustAssessment {
  readonly total: number;
  readonly systemTrusted: number;
  readonly pythonTrusted: number;
  readonly atRisk: readonly CertificateRecord[];
  /** 0..100, higher is safer. */
  readonly score: number;
  readonly emudhraDeclared: boolean;
  readonly note: string;
}

/**
 * The trust ledger does not guess whether a root is "bad". It reports the
 * mechanical facts: is it in the OS store, is it in the Python bundle, is it
 * in Node, and what is the browser status. The person decides.
 */
export function assessTrust(
  records: readonly CertificateRecord[],
  profileStack: readonly string[],
): TrustAssessment {
  const systemTrusted = records.filter((record) => record.systemStore).length;
  const pythonTrusted = records.filter((record) => record.pythonBundle).length;
  const atRisk = records.filter(
    (record) =>
      record.status === "blocked-in-browsers" && (record.systemStore || record.pythonBundle),
  );
  const emudhraDeclared = profileStack.includes("ca-emudhra");

  const penalty = atRisk.length * 18 + (emudhraDeclared ? 22 : 0);
  const score = Math.max(0, 100 - penalty);

  const note =
    atRisk.length === 0
      ? "No compromised root is present in the stores this ledger tracks."
      : `${atRisk.length} compromised root${atRisk.length === 1 ? "" : "s"} still trusted by at least one non-browser store. Browsers are not the whole story.`;

  return {
    total: records.length,
    systemTrusted,
    pythonTrusted,
    atRisk,
    score,
    emudhraDeclared,
    note,
  };
}

export function trustByStore(records: readonly CertificateRecord[]) {
  return {
    system: records.filter((record) => record.systemStore),
    python: records.filter((record) => record.pythonBundle),
    node: records.filter((record) => record.nodeBundle),
  };
}
