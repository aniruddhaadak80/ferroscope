import type { Incident } from "@ferroscope/core";

/**
 * The 48-hour wave. Seeded from the public reporting snapshot of
 * 2026-10-23, then normalised into Ferroscope's exposure model.
 *
 * This file is data, not truth: every incident carries its own sources so a
 * reader can check the claim. The dataset is versioned in git and reviewed
 * like code.
 */
export const INCIDENTS_48H: readonly Incident[] = [
  {
    slug: "php2shell",
    name: "PHP2Shell",
    headline: "A hole in the runtime behind roughly 70% of the web",
    summary:
      "Two chained bugs in PHP's multipart form parser let an unauthenticated request reach remote code execution on default configurations. Governments took sites offline rather than patch in public.",
    severity: "critical",
    cvss: 9.8,
    status: "patched",
    vector: "web-server",
    regions: ["global"],
    disclosedAt: "2026-10-21T06:10:00Z",
    window: "48h",
    affected: ["runtime-php", "server-apache", "server-nginx", "svc-wordpress"],
    mitigations: ["act-php-audit", "act-nginx-patch", "act-wordpress-update"],
    sources: [
      { label: "NVD — CVE-2026-109618", url: "https://nvd.nist.gov/vuln/detail/CVE-2026-109618" },
      { label: "PHP security advisories", url: "https://www.php.net/security/" },
    ],
    iocs: [
      "103.216.220.92",
      "31.223.184.166",
      "37.19.200.5",
      "134.209.159.64",
      "103.114.163.188",
      "95.217.98.37",
    ],
    exposureNote:
      "Only matters if you operate a PHP runtime or a web server that fronts one. A laptop with no PHP and no listening server has no attack surface here.",
    timeline: [
      {
        at: "2026-10-21T06:10:00Z",
        label: "Disclosure",
        detail: "PHP publishes fixed builds: 8.2.35, 8.3.36, 8.4.27, 8.5.12.",
      },
      {
        at: "2026-10-21T11:40:00Z",
        label: "Mass scanning",
        detail:
          "Honeypots see exploitation attempts against multipart endpoints within five hours.",
      },
      {
        at: "2026-10-22T02:00:00Z",
        label: "Governments offline",
        detail: "Several public-sector sites are pulled down instead of emergency-patched.",
      },
    ],
  },
  {
    slug: "emudhra",
    name: "eMudhra root keys",
    headline: "The keys that prove a website is real were cracked",
    summary:
      "Eight intermediate CA certificates were generated with P-384 private keys that were tiny integers — one was literally 4. Anyone could reconstruct the key and mint a trusted certificate for any domain.",
    severity: "critical",
    cvss: 9.5,
    status: "contained",
    vector: "certificate-authority",
    regions: ["global", "IN"],
    disclosedAt: "2026-10-21T09:30:00Z",
    window: "48h",
    affected: ["ca-emudhra"],
    mitigations: ["act-certifi", "act-windows-update"],
    sources: [
      {
        label: "Red Hat — RHSB-2026-012",
        url: "https://access.redhat.com/security/vulnerabilities/RHSB-2026-012",
      },
      { label: "CVE-2026-111943", url: "https://nvd.nist.gov/vuln/detail/CVE-2026-111943" },
    ],
    iocs: [],
    exposureNote:
      "Browsers blocked the intermediates within hours, but non-browser TLS stacks — Python's certifi bundle, Java trust stores, embedded clients — can keep trusting the root for months.",
    timeline: [
      {
        at: "2026-10-21T09:30:00Z",
        label: "Key recovery",
        detail: "Researchers factor the weak P-384 keys in under a second each.",
      },
      {
        at: "2026-10-21T14:15:00Z",
        label: "Browser block",
        detail: "Chrome and Firefox ship OneCRL updates blocking the affected intermediates.",
      },
      {
        at: "2026-10-23T02:10:00Z",
        label: "Distrust wave",
        detail: "Linux distributions begin removing the eMudhra roots from ca-certificates.",
      },
    ],
  },
  {
    slug: "california-students",
    name: "California student data",
    headline: "Every public school student since 2023, including disability status",
    summary:
      "A state education platform exposed records covering every public-school student enrolled since 2023. The dataset includes disability classifications and other special-category data.",
    severity: "critical",
    cvss: null,
    status: "active",
    vector: "data-breach",
    regions: ["US"],
    disclosedAt: "2026-10-21T15:00:00Z",
    window: "48h",
    affected: [],
    mitigations: ["act-identity-monitoring"],
    sources: [{ label: "California Department of Education", url: "https://www.cde.ca.gov/" }],
    iocs: [],
    exposureNote:
      "Regional and sector-specific. Relevant to US students and their families; not to an adult developer in India.",
    timeline: [
      {
        at: "2026-10-21T15:00:00Z",
        label: "Notification",
        detail: "Districts begin notifying families of the exposure window.",
      },
      {
        at: "2026-10-22T09:00:00Z",
        label: "Scope confirmed",
        detail: "Records from 2023 onward are confirmed in the exposed dataset.",
      },
      {
        at: "2026-10-23T00:30:00Z",
        label: "Attorney general",
        detail: "State regulators open an inquiry into retention and access controls.",
      },
    ],
  },
  {
    slug: "railway",
    name: "Railway",
    headline: "Customer secret keys stolen from a hosting platform",
    summary:
      "Attackers reached Railway's internal secret store and exfiltrated customer credentials. Any project that trusted Railway-held secrets should assume those values are public.",
    severity: "critical",
    cvss: null,
    status: "active",
    vector: "hosting",
    regions: ["global"],
    disclosedAt: "2026-10-21T18:20:00Z",
    window: "48h",
    affected: ["svc-railway"],
    mitigations: ["act-rotate-ci-secrets", "act-audit-workflows"],
    sources: [{ label: "Railway security", url: "https://railway.com/security" }],
    iocs: [],
    exposureNote:
      "If you never connected a Railway project, there is nothing of yours to steal. If you did, every secret in that project is now a rotation task.",
    timeline: [
      {
        at: "2026-10-21T18:20:00Z",
        label: "Incident confirmed",
        detail: "Railway confirms unauthorised access to its secret store.",
      },
      {
        at: "2026-10-21T21:00:00Z",
        label: "Key rotation",
        detail: "Platform tokens are invalidated; customer-held secrets are not.",
      },
      {
        at: "2026-10-22T10:45:00Z",
        label: "Customer notice",
        detail: "Affected projects are told to rotate every injected variable.",
      },
    ],
  },
  {
    slug: "zeabur",
    name: "Zeabur",
    headline: "321,810 accounts breached; the company is shutting down",
    summary:
      "Zeabur disclosed a breach covering 321,810 accounts and announced it is winding down operations. Credentials, project metadata, and deployment secrets are all in scope.",
    severity: "critical",
    cvss: null,
    status: "active",
    vector: "hosting",
    regions: ["global"],
    disclosedAt: "2026-10-21T20:00:00Z",
    window: "48h",
    affected: ["svc-zeabur"],
    mitigations: ["act-rotate-ci-secrets", "act-password-manager"],
    sources: [{ label: "Zeabur blog", url: "https://zeabur.com/blog" }],
    iocs: [],
    exposureNote:
      "No Zeabur account means no exposure. If you had one, assume both the password and every environment variable in every project are compromised.",
    timeline: [
      {
        at: "2026-10-21T20:00:00Z",
        label: "Breach disclosed",
        detail: "321,810 accounts confirmed in the exposed dataset.",
      },
      {
        at: "2026-10-22T04:00:00Z",
        label: "Shutdown announced",
        detail: "The company says it will not continue operating the platform.",
      },
      {
        at: "2026-10-22T16:30:00Z",
        label: "Export window",
        detail: "Customers are given a short window to retrieve data before deletion.",
      },
    ],
  },
  {
    slug: "litellm",
    name: "LiteLLM",
    headline: "An AI package downloaded 3.4 million times a day, poisoned",
    summary:
      "A compromised release of the LiteLLM Python package shipped a credential stealer. The package runs inside application processes, so it can read every key the process can read.",
    severity: "critical",
    cvss: 9.1,
    status: "patched",
    vector: "supply-chain",
    regions: ["global"],
    disclosedAt: "2026-10-21T22:10:00Z",
    window: "48h",
    affected: ["pkg-litellm"],
    mitigations: ["act-litellm-remove", "act-rotate-ci-secrets", "act-verify-downloads"],
    sources: [
      { label: "LiteLLM security", url: "https://github.com/BerriAI/litellm/security" },
      { label: "PyPI advisory", url: "https://pypi.org/help/#security" },
    ],
    iocs: [],
    exposureNote:
      "Only installs that pulled the poisoned version are affected. A repository that merely mentions LiteLLM in a dependency list never executed it.",
    timeline: [
      {
        at: "2026-10-21T22:10:00Z",
        label: "Poisoned release",
        detail: "A malicious build is published to the package index.",
      },
      {
        at: "2026-10-22T01:25:00Z",
        label: "Yanked",
        detail: "The release is removed after maintainers review the diff.",
      },
      {
        at: "2026-10-22T08:00:00Z",
        label: "Credential sweep",
        detail: "Reports of stolen cloud keys begin arriving from CI runners.",
      },
    ],
  },
  {
    slug: "gitlab-onigmo",
    name: "GitLab Onigmo RCE",
    headline: "A 10-out-of-10 hole in every self-managed version since 2014",
    summary:
      "An integer overflow in GitLab's bundled Onigmo regex compiler allows unauthenticated remote code execution. GitLab.com was patched before disclosure; self-managed instances were not.",
    severity: "critical",
    cvss: 10,
    status: "patched",
    vector: "web-server",
    regions: ["global"],
    disclosedAt: "2026-10-22T00:00:00Z",
    window: "48h",
    affected: ["svc-gitlab"],
    mitigations: ["act-gitlab-patch"],
    sources: [
      {
        label: "GitLab patch release 19.5.1",
        url: "https://docs.gitlab.com/releases/patches/patch-release-gitlab-19-5-1-released/",
      },
    ],
    iocs: [],
    exposureNote:
      "This is a sysadmin emergency, not a user emergency. If you only use gitlab.com, you were never exposed; if you run your own instance, patch now.",
    timeline: [
      {
        at: "2026-10-22T00:00:00Z",
        label: "Patch release",
        detail: "19.5.1, 19.4.3, 19.3.6, 19.2.9, 19.1.9, 19.0.10 and 18.11.13 ship the fix.",
      },
      {
        at: "2026-10-22T00:05:00Z",
        label: "SaaS confirmed",
        detail: "GitLab states that GitLab.com already runs the patched build.",
      },
      {
        at: "2026-10-22T12:00:00Z",
        label: "Exploit chatter",
        detail: "Public proof-of-concept discussion appears; no confirmed mass exploitation.",
      },
    ],
  },
  {
    slug: "cairn",
    name: "Cairn",
    headline: "An AI hacking tool broke into 100+ companies",
    summary:
      "Criminal operators used an autonomous attack tool to chain reconnaissance, credential stuffing, and lateral movement across more than a hundred organisations.",
    severity: "high",
    cvss: null,
    status: "active",
    vector: "state-actor",
    regions: ["global"],
    disclosedAt: "2026-10-22T03:30:00Z",
    window: "48h",
    affected: [],
    mitigations: ["act-2fa", "act-password-manager"],
    sources: [
      {
        label: "CISA advisories",
        url: "https://www.cisa.gov/news-events/cybersecurity-advisories",
      },
    ],
    iocs: [],
    exposureNote:
      "Enterprise-targeted intrusion. Individuals are collateral only if their credentials unlock a corporate perimeter — which is exactly why reused passwords matter.",
    timeline: [
      {
        at: "2026-10-22T03:30:00Z",
        label: "Campaign observed",
        detail: "Telemetry links more than 100 intrusions to one toolchain.",
      },
      {
        at: "2026-10-22T14:00:00Z",
        label: "Tooling analysed",
        detail: "Analysts describe an autonomous loop of recon, credential replay, and escalation.",
      },
      {
        at: "2026-10-23T01:00:00Z",
        label: "Guidance",
        detail: "Agencies urge phishing-resistant MFA and fast credential rotation.",
      },
    ],
  },
  {
    slug: "ahold-delhaize",
    name: "Ahold Delhaize",
    headline: "The owner of Food Lion and Stop & Shop knocked offline",
    summary:
      "A ransomware-style intrusion took core retail systems offline across several grocery brands, disrupting ordering, payment, and pharmacy workflows.",
    severity: "high",
    cvss: null,
    status: "active",
    vector: "ransomware",
    regions: ["US", "EU"],
    disclosedAt: "2026-10-22T05:00:00Z",
    window: "48h",
    affected: [],
    mitigations: ["act-offline-backup"],
    sources: [{ label: "Ahold Delhaize", url: "https://www.aholddelhaize.com/" }],
    iocs: [],
    exposureNote:
      "Retail infrastructure. The only personal action is indirect: keep an offline backup and don't trust order-status emails sent during the outage.",
    timeline: [
      {
        at: "2026-10-22T05:00:00Z",
        label: "Outage",
        detail: "Ordering and pharmacy systems go offline across multiple brands.",
      },
      {
        at: "2026-10-22T13:30:00Z",
        label: "Containment",
        detail: "Stores shift to manual procedures while responders isolate systems.",
      },
      {
        at: "2026-10-23T06:00:00Z",
        label: "Phishing wave",
        detail: "Fake refund messages impersonating the brands begin circulating.",
      },
    ],
  },
  {
    slug: "onamae",
    name: "Onamae",
    headline: "Malware planted on up to 26,739 customer servers in Japan",
    summary:
      "Attackers compromised the hosting provider's control plane and pushed malicious code to as many as 26,739 customer servers. Control-plane trust turned into mass remote execution.",
    severity: "critical",
    cvss: null,
    status: "active",
    vector: "hosting",
    regions: ["JP"],
    disclosedAt: "2026-10-22T07:40:00Z",
    window: "48h",
    affected: ["svc-onamae"],
    mitigations: ["act-rebuild-host", "act-rotate-ci-secrets"],
    sources: [{ label: "Onamae", url: "https://www.onamae.com/" }],
    iocs: [],
    exposureNote:
      "Relevant only to customers of that Japanese host. The lesson generalises: whoever can push code to your server effectively owns it.",
    timeline: [
      {
        at: "2026-10-22T07:40:00Z",
        label: "Discovery",
        detail: "Customers report unexpected processes on managed servers.",
      },
      {
        at: "2026-10-22T15:20:00Z",
        label: "Scope",
        detail: "Up to 26,739 servers are believed to have received the payload.",
      },
      {
        at: "2026-10-23T03:00:00Z",
        label: "Rebuild guidance",
        detail: "The provider tells customers to rebuild from clean images, not clean in place.",
      },
    ],
  },
];
