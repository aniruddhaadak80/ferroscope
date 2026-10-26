import type { CertificateRecord } from "@ferroscope/core";

/**
 * The trust ledger. This is a snapshot of the roots that matter to a typical
 * developer machine, not a complete CA inventory. The point is to make the
 * invisible visible: a root can be blocked in Chrome and still be trusted by
 * Python six months later.
 */
export const CERTIFICATES: readonly CertificateRecord[] = [
  {
    id: "emsign-g1",
    commonName: "emSign Root CA - G1",
    owner: "eMudhra Technologies Limited",
    status: "blocked-in-browsers",
    systemStore: true,
    pythonBundle: true,
    nodeBundle: false,
    note: "Compromised intermediates chain to this root. Browsers block the intermediates; certifi still ships the root.",
  },
  {
    id: "emsign-g3",
    commonName: "emSign ECC Root CA - G3",
    owner: "eMudhra Technologies Limited",
    status: "blocked-in-browsers",
    systemStore: true,
    pythonBundle: true,
    nodeBundle: false,
    note: "The ECC sibling. Same story: blocked at the intermediate layer, trusted at the root layer.",
  },
  {
    id: "isrg-x1",
    commonName: "ISRG Root X1",
    owner: "Internet Security Research Group",
    status: "trusted",
    systemStore: true,
    pythonBundle: true,
    nodeBundle: true,
    note: "The Let's Encrypt root. Widely trusted and not implicated in the October wave.",
  },
  {
    id: "digicert-g2",
    commonName: "DigiCert Global Root G2",
    owner: "DigiCert",
    status: "trusted",
    systemStore: true,
    pythonBundle: true,
    nodeBundle: true,
    note: "Commercial root with broad enterprise deployment.",
  },
  {
    id: "amazon-root-1",
    commonName: "Amazon Root CA 1",
    owner: "Amazon",
    status: "trusted",
    systemStore: true,
    pythonBundle: true,
    nodeBundle: true,
    note: "Used by AWS endpoints and many IoT devices.",
  },
];

export const CERTIFICATES_BY_ID: ReadonlyMap<string, CertificateRecord> = new Map(
  CERTIFICATES.map((record) => [record.id, record]),
);
