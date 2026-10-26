import type { Incident } from "@ferroscope/core";

/**
 * Month-scale incidents: serious enough to lead a normal month, but not part
 * of the 48-hour cascade. They stay in the atlas because the exposure model
 * should not forget them just because the news cycle did.
 */
export const INCIDENTS_MONTH: readonly Incident[] = [
  {
    slug: "signal-mic-camera",
    name: "Signal call-state bug",
    headline: "A bug could leave your mic and camera on after you hang up",
    summary:
      "A call-state race in Signal left capture devices active after a call ended under specific teardown conditions. The fix shipped in a mobile release.",
    severity: "high",
    cvss: 7.1,
    status: "patched",
    vector: "endpoint",
    regions: ["global"],
    disclosedAt: "2026-10-18T08:00:00Z",
    window: "month",
    affected: ["svc-signal"],
    mitigations: ["act-signal-update", "act-phone-update"],
    sources: [{ label: "Signal blog", url: "https://signal.org/blog/" }],
    iocs: [],
    exposureNote:
      "Requires the app to be installed. Updating the app and the OS closes the window; the OS-level mic indicator is your audit trail.",
    timeline: [
      {
        at: "2026-10-18T08:00:00Z",
        label: "Reported",
        detail: "Users notice the capture indicator persisting after calls.",
      },
      {
        at: "2026-10-19T12:00:00Z",
        label: "Fixed",
        detail: "A mobile release corrects the teardown path.",
      },
      {
        at: "2026-10-20T09:00:00Z",
        label: "Advisory",
        detail: "Users are urged to update and review OS permission grants.",
      },
    ],
  },
  {
    slug: "nginx",
    name: "NGINX",
    headline: "Three critical holes in software running a third of the web",
    summary:
      "Three memory-safety flaws in NGINX's HTTP/2 and upstream modules allow remote crashes and, in one configuration, code execution. Fixed releases are available for every supported branch.",
    severity: "critical",
    cvss: 9.2,
    status: "patched",
    vector: "web-server",
    regions: ["global"],
    disclosedAt: "2026-10-18T10:30:00Z",
    window: "month",
    affected: ["server-nginx"],
    mitigations: ["act-nginx-patch"],
    sources: [
      { label: "NGINX security advisories", url: "https://nginx.org/en/security_advisories.html" },
    ],
    iocs: [],
    exposureNote:
      "You need to be running NGINX to care. Static hosts and serverless platforms patch their own edge.",
    timeline: [
      {
        at: "2026-10-18T10:30:00Z",
        label: "Advisories",
        detail: "Three CVEs published with fixed branches.",
      },
      {
        at: "2026-10-19T06:00:00Z",
        label: "Scanning",
        detail: "Internet-wide probes for the HTTP/2 crash begin.",
      },
      {
        at: "2026-10-21T16:00:00Z",
        label: "Exploit",
        detail: "A working denial-of-service sequence is published.",
      },
    ],
  },
  {
    slug: "http3-crash",
    name: "HTTP/3 transport",
    headline: "One connection can crash 7 of 10 tested web servers",
    summary:
      "A malformed QUIC frame sequence triggers unbounded allocation in several HTTP/3 implementations, taking servers down with a single connection.",
    severity: "high",
    cvss: 7.5,
    status: "active",
    vector: "network",
    regions: ["global"],
    disclosedAt: "2026-10-18T14:00:00Z",
    window: "month",
    affected: ["server-nginx", "server-apache", "server-iis", "server-caddy", "svc-cloudflare"],
    mitigations: ["act-nginx-patch", "act-disable-http3"],
    sources: [
      { label: "IETF QUIC working group", url: "https://datatracker.ietf.org/wg/quic/about/" },
    ],
    iocs: [],
    exposureNote:
      "A server-side availability issue. If you don't terminate HTTP/3 yourself, your provider does — check their status page, not your laptop.",
    timeline: [
      {
        at: "2026-10-18T14:00:00Z",
        label: "Research",
        detail: "Seven of ten tested implementations crash on the same frame.",
      },
      {
        at: "2026-10-19T09:00:00Z",
        label: "Mitigation",
        detail: "Vendors publish rate limits and frame-size caps.",
      },
      {
        at: "2026-10-22T11:00:00Z",
        label: "Still patchy",
        detail: "Several small hosts remain unpatched a week later.",
      },
    ],
  },
  {
    slug: "plex",
    name: "Plex Media Server",
    headline: "Attackers are breaking into home media servers",
    summary:
      "Internet-exposed Plex servers are being compromised through a combination of stale versions and weak remote-access configuration. The result is a residential foothold that survives reboots.",
    severity: "high",
    cvss: 8.1,
    status: "active",
    vector: "endpoint",
    regions: ["global"],
    disclosedAt: "2026-10-18T17:20:00Z",
    window: "month",
    affected: ["svc-plex"],
    mitigations: ["act-plex-patch", "act-network-audit"],
    sources: [{ label: "Plex security", url: "https://www.plex.tv/security/" }],
    iocs: [],
    exposureNote:
      "Only relevant if you run Plex and expose it beyond your LAN. The fix is a patch plus not port-forwarding the admin interface.",
    timeline: [
      {
        at: "2026-10-18T17:20:00Z",
        label: "Telemetry",
        detail: "A cluster of residential intrusions shares Plex as the entry point.",
      },
      {
        at: "2026-10-19T10:00:00Z",
        label: "Patch",
        detail: "A server release closes the remote-access path.",
      },
      {
        at: "2026-10-21T20:00:00Z",
        label: "Persistence",
        detail: "Responders find scheduled tasks surviving reboots.",
      },
    ],
  },
  {
    slug: "safepay",
    name: "SafePay ransomware",
    headline: "The FBI warns of 600+ critical-infrastructure victims",
    summary:
      "SafePay operators have hit more than 600 critical-infrastructure organisations, favouring stolen VPN credentials and unpatched edge devices over novel exploits.",
    severity: "high",
    cvss: null,
    status: "active",
    vector: "ransomware",
    regions: ["global"],
    disclosedAt: "2026-10-19T00:00:00Z",
    window: "month",
    affected: [],
    mitigations: ["act-offline-backup", "act-2fa", "act-network-audit"],
    sources: [{ label: "FBI cyber advisories", url: "https://www.ic3.gov/PSA" }],
    iocs: [],
    exposureNote:
      "Organisational targeting. Individuals matter when their credentials are the way in, or when their backup is the only copy.",
    timeline: [
      {
        at: "2026-10-19T00:00:00Z",
        label: "Advisory",
        detail: "600+ victims across critical infrastructure are attributed to one crew.",
      },
      {
        at: "2026-10-20T08:00:00Z",
        label: "Initial access",
        detail: "Stolen VPN credentials remain the dominant entry path.",
      },
      {
        at: "2026-10-22T18:00:00Z",
        label: "Guidance",
        detail: "Offline backups and phishing-resistant MFA are the top recommendations.",
      },
    ],
  },
  {
    slug: "palo-alto",
    name: "Palo Alto edge",
    headline: "Ransomware gangs are breaking in through company firewalls",
    summary:
      "An authentication bypass in an internet-facing management interface is being used to deploy ransomware inside networks that believed the perimeter was safe.",
    severity: "critical",
    cvss: 9.3,
    status: "patched",
    vector: "network",
    regions: ["global"],
    disclosedAt: "2026-10-19T06:00:00Z",
    window: "month",
    affected: ["svc-paloalto"],
    mitigations: ["act-network-audit", "act-2fa"],
    sources: [
      { label: "Palo Alto security advisories", url: "https://security.paloaltonetworks.com/" },
    ],
    iocs: [],
    exposureNote:
      "Enterprise firewall appliance. Irrelevant to a home laptop unless your employer's network is the thing being defended.",
    timeline: [
      {
        at: "2026-10-19T06:00:00Z",
        label: "Advisory",
        detail: "An authentication bypass is confirmed in the wild.",
      },
      {
        at: "2026-10-20T11:00:00Z",
        label: "Ransomware",
        detail: "Multiple intrusions escalate to encryption within 48 hours.",
      },
      {
        at: "2026-10-22T09:00:00Z",
        label: "Hunt",
        detail: "Organisations are told to audit management-plane logs.",
      },
    ],
  },
  {
    slug: "bullhorn",
    name: "Bullhorn",
    headline: "A platform used by 10,000+ companies knocked offline",
    summary:
      "A cyber incident forced Bullhorn to take its staffing and CRM platform offline, disrupting hiring pipelines for more than ten thousand customers.",
    severity: "medium",
    cvss: null,
    status: "contained",
    vector: "supply-chain",
    regions: ["global"],
    disclosedAt: "2026-10-19T12:30:00Z",
    window: "month",
    affected: ["svc-bullhorn"],
    mitigations: ["act-rotate-ci-secrets", "act-2fa"],
    sources: [{ label: "Bullhorn", url: "https://www.bullhorn.com/" }],
    iocs: [],
    exposureNote:
      "Relevant to recruiters and staffing firms. For a developer, the only risk is a phishing wave that borrows the brand.",
    timeline: [
      {
        at: "2026-10-19T12:30:00Z",
        label: "Offline",
        detail: "The platform goes down for customers worldwide.",
      },
      {
        at: "2026-10-20T15:00:00Z",
        label: "Containment",
        detail: "The company says it isolated affected systems.",
      },
      {
        at: "2026-10-22T10:00:00Z",
        label: "Phishing",
        detail: "Fake 'account restore' emails target customers.",
      },
    ],
  },
  {
    slug: "medi-cal",
    name: "Medi-Cal",
    headline: "970,000 patients' data stolen",
    summary:
      "A vendor breach exposed the records of roughly 970,000 Medi-Cal members, including identifiers used for benefits and billing.",
    severity: "high",
    cvss: null,
    status: "active",
    vector: "data-breach",
    regions: ["US"],
    disclosedAt: "2026-10-19T18:00:00Z",
    window: "month",
    affected: [],
    mitigations: ["act-identity-monitoring"],
    sources: [{ label: "California DHCS", url: "https://www.dhcs.ca.gov/" }],
    iocs: [],
    exposureNote:
      "US healthcare members only. If you are not a Medi-Cal member, this is not your breach — but it is a reminder to freeze credit where offered.",
    timeline: [
      {
        at: "2026-10-19T18:00:00Z",
        label: "Notification",
        detail: "Members begin receiving breach letters.",
      },
      {
        at: "2026-10-21T09:00:00Z",
        label: "Scope",
        detail: "970,000 members confirmed.",
      },
      {
        at: "2026-10-22T14:00:00Z",
        label: "Remediation",
        detail: "Free credit monitoring is offered to affected members.",
      },
    ],
  },
  {
    slug: "wordpress-plugin",
    name: "WordPress plugin supply chain",
    headline: "Hackers stole a plugin maker's keys and planted backdoors",
    summary:
      "Attackers compromised a plugin vendor's release signing keys and pushed a backdoored update to thousands of WordPress sites. The update looked legitimate because it was signed.",
    severity: "critical",
    cvss: 9.0,
    status: "patched",
    vector: "supply-chain",
    regions: ["global"],
    disclosedAt: "2026-10-20T07:00:00Z",
    window: "month",
    affected: ["svc-wordpress", "runtime-php"],
    mitigations: ["act-wordpress-update", "act-verify-downloads", "act-rebuild-host"],
    sources: [{ label: "WordPress news", url: "https://wordpress.org/news/" }],
    iocs: [],
    exposureNote:
      "Self-hosted WordPress only. If you don't run PHP or WordPress, a signed backdoor on someone else's site cannot reach you.",
    timeline: [
      {
        at: "2026-10-20T07:00:00Z",
        label: "Backdoored release",
        detail: "A signed plugin update ships malicious code.",
      },
      {
        at: "2026-10-20T19:00:00Z",
        label: "Pulled",
        detail: "The release is removed from the directory.",
      },
      {
        at: "2026-10-22T08:00:00Z",
        label: "Cleanup",
        detail: "Site owners are told to compare files against a known-good copy.",
      },
    ],
  },
  {
    slug: "aomei",
    name: "AOMEI backup updater",
    headline: "Backup software's update server handed out a backdoor",
    summary:
      "A compromised update channel delivered a signed backdoor to users of a Windows backup tool, proving that update mechanisms are a supply chain of their own.",
    severity: "critical",
    cvss: 9.4,
    status: "contained",
    vector: "supply-chain",
    regions: ["global"],
    disclosedAt: "2026-10-20T11:15:00Z",
    window: "month",
    affected: ["svc-aomei"],
    mitigations: ["act-aomei-remove", "act-windows-update", "act-offline-backup"],
    sources: [{ label: "AOMEI", url: "https://www.aomeitech.com/" }],
    iocs: [],
    exposureNote:
      "Only machines running the affected updater. A backup tool is a high-value target because it sees every file you have.",
    timeline: [
      {
        at: "2026-10-20T11:15:00Z",
        label: "Anomaly",
        detail: "Users report an unexpected binary after an update.",
      },
      {
        at: "2026-10-20T20:00:00Z",
        label: "Channel offline",
        detail: "The vendor takes the update server offline.",
      },
      {
        at: "2026-10-22T06:00:00Z",
        label: "Forensics",
        detail: "The backdoor is confirmed to have shipped to a subset of users.",
      },
    ],
  },
  {
    slug: "meta-muse",
    name: "Meta Muse",
    headline: "Meta's AI agent exposed users' personal and business secrets",
    summary:
      "A retrieval flaw in Meta's Muse agent surfaced other users' context — including business documents and personal details — in generated answers. The exact scope is still unverified.",
    severity: "high",
    cvss: null,
    status: "unverified",
    vector: "ai-agent",
    regions: ["global"],
    disclosedAt: "2026-10-21T10:00:00Z",
    window: "month",
    affected: ["ai-meta"],
    mitigations: ["act-ai-data-audit", "act-2fa"],
    sources: [{ label: "Meta security", url: "https://www.meta.com/security/" }],
    iocs: [],
    exposureNote:
      "Only relevant if you used the affected agent and pasted secrets into it. No local scanner can prove or disprove cloud-side exposure.",
    timeline: [
      {
        at: "2026-10-21T10:00:00Z",
        label: "Reports",
        detail: "Users report seeing unrelated business context in answers.",
      },
      {
        at: "2026-10-21T22:00:00Z",
        label: "Investigation",
        detail: "Meta says it is investigating retrieval isolation.",
      },
      {
        at: "2026-10-23T04:00:00Z",
        label: "Unverified",
        detail: "No official scope or root cause has been published.",
      },
    ],
  },
  {
    slug: "tor-relays",
    name: "Tor exit relays",
    headline: "333 relays hijacked to steal logins",
    summary:
      "A coordinated set of malicious Tor exit relays performed TLS stripping and credential capture against users who treated the network as anonymity without integrity.",
    severity: "medium",
    cvss: null,
    status: "contained",
    vector: "network",
    regions: ["global"],
    disclosedAt: "2026-10-21T13:00:00Z",
    window: "month",
    affected: ["svc-tor"],
    mitigations: ["act-2fa", "act-network-audit"],
    sources: [{ label: "Tor Project blog", url: "https://blog.torproject.org/" }],
    iocs: [],
    exposureNote:
      "Only Tor users. Exit relays can see plaintext HTTP and can strip TLS if you click through warnings — which is why HSTS and 2FA matter.",
    timeline: [
      {
        at: "2026-10-21T13:00:00Z",
        label: "Detection",
        detail: "Researchers flag 333 relays sharing infrastructure.",
      },
      {
        at: "2026-10-21T23:00:00Z",
        label: "Removal",
        detail: "The relays are dropped from the consensus.",
      },
      {
        at: "2026-10-22T15:00:00Z",
        label: "Advice",
        detail: "Users are told to rotate credentials used over Tor.",
      },
    ],
  },
  {
    slug: "tidb-cloud",
    name: "TiDB Cloud",
    headline: "A database company's cloud was breached",
    summary:
      "TiDB Cloud confirmed unauthorised access to part of its control plane. Customers are being told to rotate connection strings and audit cluster access.",
    severity: "high",
    cvss: null,
    status: "active",
    vector: "hosting",
    regions: ["global"],
    disclosedAt: "2026-10-21T16:40:00Z",
    window: "month",
    affected: ["svc-tidb"],
    mitigations: ["act-rotate-ci-secrets", "act-network-audit"],
    sources: [{ label: "TiDB security", url: "https://www.pingcap.com/security/" }],
    iocs: [],
    exposureNote:
      "Only TiDB Cloud customers. The blast radius is the set of credentials stored in the control plane, not your local machine.",
    timeline: [
      {
        at: "2026-10-21T16:40:00Z",
        label: "Breach confirmed",
        detail: "The company discloses unauthorised access.",
      },
      {
        at: "2026-10-22T02:00:00Z",
        label: "Rotation",
        detail: "Customers are advised to rotate cluster credentials.",
      },
      {
        at: "2026-10-22T18:00:00Z",
        label: "Audit",
        detail: "Access logs are made available for review.",
      },
    ],
  },
];
