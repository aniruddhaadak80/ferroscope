import type { RemediationAction } from "@ferroscope/core";

/**
 * The remediation catalogue. Minutes are for one competent person, not a
 * security team; `reduces` is the share of the relevant risk the action
 * removes when done properly. The planner ranks by risk-reduced-per-minute,
 * so a three-minute certificate fix can outrank a two-hour audit.
 */
export const ACTIONS: readonly RemediationAction[] = [
  {
    id: "act-certifi",
    title: "Refresh the Python CA bundle",
    detail:
      "certifi is a vendored trust store. It does not follow Windows Update, so a compromised root can survive there for months.",
    category: "certificates",
    minutes: 3,
    reduces: 0.85,
    vectors: ["certificate-authority"],
    incidentSlugs: ["emudhra"],
    steps: [
      "Run: pip install --upgrade certifi",
      "Confirm the version is 2026.10.23 or newer.",
      "Search the bundle for emSign and eMudhra; expect zero matches.",
    ],
    command:
      'pip install --upgrade certifi && python -c "import certifi; print(certifi.__version__)"',
  },
  {
    id: "act-windows-update",
    title: "Install every pending Windows update",
    detail:
      "Windows Update is also the delivery path for root-certificate distrust. Skipping it leaves compromised CAs trusted system-wide.",
    category: "patching",
    minutes: 15,
    reduces: 0.55,
    vectors: ["certificate-authority", "endpoint", "supply-chain"],
    incidentSlugs: ["emudhra", "aomei", "php2shell"],
    steps: [
      "Open Settings → Windows Update.",
      "Install all updates, including optional cumulative ones.",
      "Restart even if Windows says it is not required.",
    ],
  },
  {
    id: "act-2fa",
    title: "Turn on phishing-resistant 2FA",
    detail:
      "An authenticator app or passkey turns a stolen password into a dead end. SMS is better than nothing but is not phishing-resistant.",
    category: "identity",
    minutes: 12,
    reduces: 0.6,
    vectors: ["identity", "banking", "supply-chain", "ai-agent", "network", "state-actor"],
    incidentSlugs: ["sbi", "cairn", "meta-muse", "gitlab-onigmo", "north-korea"],
    steps: [
      "Start with email, then GitHub, then your bank.",
      "Prefer a passkey or an authenticator app over SMS.",
      "Save the recovery codes somewhere offline.",
    ],
  },
  {
    id: "act-rotate-bank",
    title: "Rotate SBI credentials and UPI PIN",
    detail:
      "A confirmed bank breach means the old password and PIN should be treated as public. Change both from the official app, never a link.",
    category: "banking",
    minutes: 10,
    reduces: 0.8,
    vectors: ["banking"],
    incidentSlugs: ["sbi"],
    steps: [
      "Open the official SBI app or type the URL yourself.",
      "Change the net-banking password and UPI PIN.",
      "Review the last 30 days of transactions line by line.",
      "Turn on transaction alerts if they are off.",
    ],
  },
  {
    id: "act-password-manager",
    title: "Move passwords into a real manager",
    detail:
      "Browser stores are convenient but tied to the OS session. A manager with a master password and generated secrets removes reuse at the root.",
    category: "identity",
    minutes: 25,
    reduces: 0.55,
    vectors: ["identity", "banking", "supply-chain", "ai-agent"],
    incidentSlugs: ["sbi", "zeabur", "cairn"],
    steps: [
      "Install Bitwarden or Proton Pass.",
      "Import from Edge and Brave, then delete the browser copies.",
      "Rotate email, GitHub, bank, and cloud keys first.",
    ],
  },
  {
    id: "act-audit-workflows",
    title: "Audit GitHub Actions across your repos",
    detail:
      "A malicious workflow can read every secret the repository can see. Pin third-party actions to commit SHAs and review anything with write tokens.",
    category: "supply-chain",
    minutes: 30,
    reduces: 0.6,
    vectors: ["supply-chain", "identity"],
    incidentSlugs: ["railway", "north-korea"],
    steps: [
      "List every .github/workflows file across your repositories.",
      "Pin third-party actions to a full commit SHA, not a tag.",
      "Set the default GITHUB_TOKEN permission to read-only.",
      "Remove workflow secrets that are no longer used.",
    ],
    command: 'rg --files -g ".github/workflows/*.yml" -g ".github/workflows/*.yaml"',
  },
  {
    id: "act-rotate-ci-secrets",
    title: "Rotate CI and hosting secrets",
    detail:
      "If a platform that held your secrets was breached, rotation is the only remediation. Deleting the old value is not enough if it is still valid elsewhere.",
    category: "supply-chain",
    minutes: 20,
    reduces: 0.7,
    vectors: ["hosting", "supply-chain"],
    incidentSlugs: ["railway", "zeabur", "onamae", "ovhcloud", "tidb-cloud", "litellm"],
    steps: [
      "Inventory every token in GitHub, Vercel, and any PaaS you used.",
      "Rotate the value at the source, then update the consumer.",
      "Revoke the old value and confirm it fails.",
    ],
  },
  {
    id: "act-litellm-remove",
    title: "Remove the poisoned LiteLLM release",
    detail:
      "If the malicious build ever ran, assume every key in that process is stolen. Uninstalling is step one; rotation is step two.",
    category: "supply-chain",
    minutes: 8,
    reduces: 0.9,
    vectors: ["supply-chain"],
    incidentSlugs: ["litellm"],
    steps: [
      "Run: pip show litellm to find the installed version.",
      "If it matches the poisoned range, uninstall it.",
      "Rotate every API key that process could read.",
      "Reinstall from a pinned, verified version.",
    ],
    command: "pip show litellm",
  },
  {
    id: "act-verify-downloads",
    title: "Verify signatures before installing",
    detail:
      "A valid signature only proves who signed the file, not that their build pipeline was honest. Check the publisher and the hash together.",
    category: "supply-chain",
    minutes: 5,
    reduces: 0.35,
    vectors: ["supply-chain"],
    incidentSlugs: ["litellm", "aomei", "ovhcloud", "wordpress-plugin", "north-korea"],
    steps: [
      "On Windows: Get-AuthenticodeSignature <file>.",
      "Compare the SHA-256 against the vendor's published hash.",
      "Refuse installers delivered by an update prompt you did not start.",
    ],
  },
  {
    id: "act-gitlab-patch",
    title: "Patch self-managed GitLab",
    detail:
      "CVE-2026-110264 is unauthenticated RCE. GitLab.com is already patched; only self-managed instances need action.",
    category: "patching",
    minutes: 25,
    reduces: 0.95,
    vectors: ["web-server", "supply-chain"],
    incidentSlugs: ["gitlab-onigmo"],
    steps: [
      "Check your version: it must be 19.5.1, 19.4.3, 19.3.6, 19.2.9, 19.1.9, 19.0.10, or 18.11.13.",
      "Take a backup before upgrading.",
      "Upgrade and confirm the version in the admin area.",
    ],
  },
  {
    id: "act-nginx-patch",
    title: "Patch NGINX and cap HTTP/3",
    detail:
      "Three memory-safety fixes plus a single-connection crash make this a one-afternoon job for anyone terminating traffic.",
    category: "patching",
    minutes: 20,
    reduces: 0.9,
    vectors: ["web-server", "network"],
    incidentSlugs: ["nginx", "http3-crash", "php2shell"],
    steps: [
      "Upgrade to the fixed branch for your distribution.",
      "Reload, do not restart, to keep connections alive.",
      "Disable HTTP/3 until the QUIC fixes are confirmed.",
      "Verify with nginx -v and an external banner check.",
    ],
  },
  {
    id: "act-php-audit",
    title: "Audit or retire PHP endpoints",
    detail:
      "PHP2Shell is only exploitable where PHP parses requests. If you do not need PHP, removing it is faster and safer than patching it.",
    category: "patching",
    minutes: 20,
    reduces: 0.95,
    vectors: ["web-server"],
    incidentSlugs: ["php2shell"],
    steps: [
      "List every service that runs PHP.",
      "Upgrade to 8.2.35, 8.3.36, 8.4.27, or 8.5.12.",
      "If PHP is not needed, uninstall it and close the port.",
    ],
  },
  {
    id: "act-wordpress-update",
    title: "Rebuild compromised WordPress files",
    detail:
      "A signed malicious plugin update means file comparison, not deletion, is the reliable cleanup. Reinstall core and plugins from clean copies.",
    category: "patching",
    minutes: 35,
    reduces: 0.8,
    vectors: ["supply-chain", "web-server"],
    incidentSlugs: ["wordpress-plugin", "php2shell"],
    steps: [
      "Export content, not code.",
      "Reinstall WordPress core and every plugin from the directory.",
      "Rotate database and admin credentials.",
      "Compare wp-config.php against a known-good copy.",
    ],
  },
  {
    id: "act-aomei-remove",
    title: "Remove the affected backup updater",
    detail:
      "Backup software runs with broad file access. If the update channel was compromised, rebuild rather than clean.",
    category: "supply-chain",
    minutes: 30,
    reduces: 0.85,
    vectors: ["supply-chain", "endpoint"],
    incidentSlugs: ["aomei"],
    steps: [
      "Uninstall the affected version.",
      "Scan with Defender offline scan.",
      "Rotate credentials that were present on the machine.",
      "Reinstall from a vendor hash you verified yourself.",
    ],
  },
  {
    id: "act-rebuild-host",
    title: "Rebuild the host from a clean image",
    detail:
      "When malware arrived through a trusted update channel, cleaning in place cannot prove the absence of a second stage. Rebuild is the honest option.",
    category: "patching",
    minutes: 90,
    reduces: 0.9,
    vectors: ["hosting", "supply-chain", "endpoint"],
    incidentSlugs: ["onamae", "ovhcloud", "wordpress-plugin"],
    steps: [
      "Snapshot data, not the operating system.",
      "Provision a fresh image from the vendor.",
      "Restore data after scanning it.",
      "Rotate every credential the old host could read.",
    ],
  },
  {
    id: "act-offline-backup",
    title: "Make one offline backup",
    detail:
      "Ransomware cannot encrypt a disk that is not plugged in. One disconnected copy is the difference between an incident and a catastrophe.",
    category: "patching",
    minutes: 30,
    reduces: 0.5,
    vectors: ["ransomware", "endpoint"],
    incidentSlugs: ["safepay", "ahold-delhaize", "aomei"],
    steps: [
      "Copy the irreplaceable files to an external disk.",
      "Disconnect the disk.",
      "Test that one file restores correctly.",
      "Store the disk somewhere that is not the same bag as the laptop.",
    ],
  },
  {
    id: "act-network-audit",
    title: "Close inbound ports you did not mean to open",
    detail:
      "Most home compromises start with an admin panel reachable from the internet. The fix is usually removing a port forward, not buying a firewall.",
    category: "network",
    minutes: 20,
    reduces: 0.55,
    vectors: ["network", "endpoint", "ransomware", "web-server"],
    incidentSlugs: ["plex", "palo-alto", "http3-crash", "tidb-cloud", "siemens", "safepay"],
    steps: [
      "List port forwards on the router.",
      "Remove anything you cannot name.",
      "Put admin panels behind a VPN or LAN-only binding.",
      "Disable UPnP if you do not need it.",
    ],
  },
  {
    id: "act-disable-http3",
    title: "Disable HTTP/3 until the QUIC fixes land",
    detail:
      "A single malformed connection can crash several implementations. Turning the protocol off is a valid temporary mitigation.",
    category: "network",
    minutes: 6,
    reduces: 0.7,
    vectors: ["network"],
    incidentSlugs: ["http3-crash"],
    steps: [
      "In NGINX: remove the listen ... quic directive.",
      "In Cloudflare: disable HTTP/3 in the network settings.",
      "Reload and verify with a QUIC probe.",
    ],
  },
  {
    id: "act-plex-patch",
    title: "Patch Plex and stop exposing the admin port",
    detail:
      "The media server is not the problem; the public admin interface is. Update, then bind it to the LAN.",
    category: "patching",
    minutes: 12,
    reduces: 0.85,
    vectors: ["endpoint"],
    incidentSlugs: ["plex"],
    steps: [
      "Update Plex Media Server to the current release.",
      "Remove the 32400 port forward unless you truly need it.",
      "Review authorised devices and remove old ones.",
    ],
  },
  {
    id: "act-signal-update",
    title: "Update Signal and check capture permissions",
    detail:
      "The call-state fix is in the app, but the OS permission list tells you whether anything else has the mic.",
    category: "device",
    minutes: 5,
    reduces: 0.7,
    vectors: ["endpoint"],
    incidentSlugs: ["signal-mic-camera"],
    steps: [
      "Update Signal from the official store.",
      "Open OS privacy settings and list microphone/camera access.",
      "Revoke anything you do not recognise.",
    ],
  },
  {
    id: "act-phone-update",
    title: "Update the phone and its banking apps",
    detail:
      "The phone is the second factor. An outdated OS undermines every account that relies on it.",
    category: "device",
    minutes: 12,
    reduces: 0.4,
    vectors: ["endpoint", "banking", "identity"],
    incidentSlugs: ["signal-mic-camera", "sbi"],
    steps: [
      "Install the latest OS update.",
      "Update banking, UPI, and authenticator apps.",
      "Review which apps can read notifications (OTP theft).",
    ],
  },
  {
    id: "act-ai-data-audit",
    title: "Audit what you have pasted into AI tools",
    detail:
      "Cloud agents retain context. If you pasted a key or a client document, rotating the key is the only action that helps.",
    category: "identity",
    minutes: 15,
    reduces: 0.5,
    vectors: ["ai-agent"],
    incidentSlugs: ["meta-muse"],
    steps: [
      "List the AI tools you use and whether they train on your data.",
      "Search your history for keys, tokens, and client names.",
      "Rotate anything sensitive that was pasted.",
      "Turn off training/retention where the option exists.",
    ],
  },
  {
    id: "act-identity-monitoring",
    title: "Freeze credit and enable breach alerts",
    detail:
      "For a data breach you cannot patch, monitoring and a credit freeze are the practical controls. They limit the damage rather than the exposure.",
    category: "identity",
    minutes: 20,
    reduces: 0.35,
    vectors: ["data-breach"],
    incidentSlugs: ["california-students", "medi-cal"],
    steps: [
      "Enable breach notifications with HaveIBeenPwned.",
      "Freeze credit with the major bureaus where available.",
      "Watch for new-account mail you did not request.",
    ],
  },
  {
    id: "act-phishing-drill",
    title: "Set a family code word and a callback rule",
    detail:
      "The breach will be followed by calls and messages that quote it. A code word and a call-back rule defeat most of them.",
    category: "identity",
    minutes: 10,
    reduces: 0.45,
    vectors: ["banking", "identity", "state-actor"],
    incidentSlugs: ["sbi", "north-korea"],
    steps: [
      "Agree on a word that is not on social media.",
      "Rule: bank calls are hung up and re-dialled from the card.",
      "Send the rule to the people who might act on your behalf.",
    ],
  },
];

export const ACTIONS_BY_ID: ReadonlyMap<string, RemediationAction> = new Map(
  ACTIONS.map((action) => [action.id, action]),
);
