import { describe, expect, it } from "vitest";
import { assessTrust, trustByStore } from "./trust";
import type { CertificateRecord } from "./types";

const RECORDS: readonly CertificateRecord[] = [
  {
    id: "emsign-g1",
    commonName: "emSign Root CA - G1",
    owner: "eMudhra",
    status: "blocked-in-browsers",
    systemStore: true,
    pythonBundle: true,
    nodeBundle: false,
    note: "",
  },
  {
    id: "isrg-x1",
    commonName: "ISRG Root X1",
    owner: "ISRG",
    status: "trusted",
    systemStore: true,
    pythonBundle: true,
    nodeBundle: true,
    note: "",
  },
];

describe("assessTrust", () => {
  it("flags roots blocked in browsers but trusted elsewhere", () => {
    const assessment = assessTrust(RECORDS, ["ca-emudhra"]);
    expect(assessment.atRisk.map((record) => record.id)).toEqual(["emsign-g1"]);
    expect(assessment.emudhraDeclared).toBe(true);
    expect(assessment.score).toBeLessThanOrEqual(60);
  });

  it("scores higher when the compromised root is not declared", () => {
    const withRoot = assessTrust(RECORDS, ["ca-emudhra"]);
    const withoutRoot = assessTrust(RECORDS, []);
    expect(withoutRoot.score).toBeGreaterThan(withRoot.score);
  });

  it("counts each store independently", () => {
    const stores = trustByStore(RECORDS);
    expect(stores.system).toHaveLength(2);
    expect(stores.python).toHaveLength(2);
    expect(stores.node).toHaveLength(1);
  });

  it("returns a clean note when nothing is at risk", () => {
    const assessment = assessTrust([RECORDS[1] as CertificateRecord], []);
    expect(assessment.atRisk).toHaveLength(0);
    expect(assessment.note).toContain("No compromised root");
    expect(assessment.score).toBe(100);
  });
});
