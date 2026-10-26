import type { Playbook } from "@ferroscope/core";

/**
 * Playbooks are the human-readable counterpart to the action catalogue.
 * Each one is short enough to finish in a sitting and specific enough to
 * follow without a security background.
 */
export const PLAYBOOKS: readonly Playbook[] = [
  {
    slug: "stop-the-bleed",
    title: "Stop the bleed",
    kicker: "15 minutes · do this first",
    summary:
      "When a platform you use confirms a breach, the first hour is about closing access, not understanding it. Rotate the keys that can spend money or publish code.",
    forVectors: ["identity", "supply-chain", "hosting"],
    steps: [
      {
        title: "Change the password from a different device",
        detail:
          "If you think the machine is infected, do not type the new password into it. Use your phone or another computer.",
        minutes: 4,
      },
      {
        title: "Revoke sessions and tokens",
        detail:
          "Changing a password often leaves API tokens and active sessions alive. Revoke them explicitly.",
        minutes: 5,
      },
      {
        title: "Rotate the secrets that can spend money",
        detail:
          "Cloud keys, payment provider keys, and deployment tokens first. Read-only keys can wait an hour.",
        minutes: 5,
      },
      {
        title: "Check the audit log for actions you did not take",
        detail:
          "Look for new repositories, new deploy keys, new members, and unusual regions. Screenshot what you find.",
        minutes: 3,
      },
    ],
  },
  {
    slug: "certificate-trust",
    title: "Fix certificate trust",
    kicker: "10 minutes · the invisible one",
    summary:
      "A compromised root can survive in non-browser trust stores long after browsers block it. Update every store your code actually uses.",
    forVectors: ["certificate-authority"],
    steps: [
      {
        title: "Update the Python bundle",
        detail: "certifi is vendored. pip install --upgrade certifi is the whole fix.",
        minutes: 2,
      },
      {
        title: "Update Windows and restart",
        detail:
          "Root distrust ships through Windows Update, and it often needs a restart to take effect.",
        minutes: 5,
      },
      {
        title: "Check Java and Node separately",
        detail:
          "Java has its own cacerts. Node bundles its own roots. Neither follows the Windows store automatically.",
        minutes: 3,
      },
      {
        title: "Search your projects for pinned CA files",
        detail:
          "A vendored cacert.pem in a repository will not update itself. Replace it with a runtime-loaded bundle.",
        minutes: 5,
      },
    ],
    command: 'rg -l "BEGIN CERTIFICATE" --glob "*.pem" --glob "*.crt"',
  },
  {
    slug: "browser-hygiene",
    title: "Browser hygiene",
    kicker: "20 minutes · highest leverage",
    summary:
      "Your browser is the session layer for everything. Move passwords out of it, update it, and remove extensions you cannot justify.",
    forVectors: ["browser", "identity"],
    steps: [
      {
        title: "Export and delete saved passwords",
        detail:
          "Import them into a manager with a master password, then remove the browser copies.",
        minutes: 8,
      },
      {
        title: "Audit extensions",
        detail:
          "Every extension can read every page. Remove anything you have not used in a month.",
        minutes: 4,
      },
      {
        title: "Force an update",
        detail: "Chromium browsers update on restart, but only if you actually restart them.",
        minutes: 2,
      },
      {
        title: "Turn on safe browsing and HTTPS-only mode",
        detail: "Both are one toggle and both block real attacks.",
        minutes: 3,
      },
    ],
  },
  {
    slug: "bank-safety",
    title: "Bank safety after a breach",
    kicker: "15 minutes · money",
    summary:
      "A bank breach is followed by phishing that quotes the breach. Change credentials inside the official app and verify every inbound call.",
    forVectors: ["banking"],
    steps: [
      {
        title: "Open the official app, not a link",
        detail:
          "Type the address or use the app you already installed. Never use a link from a message.",
        minutes: 3,
      },
      {
        title: "Change the password and UPI PIN",
        detail: "Do both. A new password with an old PIN is half a fix.",
        minutes: 4,
      },
      {
        title: "Review 30 days of transactions",
        detail: "Look for small test charges before large ones.",
        minutes: 5,
      },
      {
        title: "Agree a code word with your family",
        detail: "Any caller claiming to be the bank must know it. If not, hang up.",
        minutes: 3,
      },
    ],
  },
  {
    slug: "supply-chain",
    title: "Supply-chain sweep",
    kicker: "45 minutes · CI and packages",
    summary:
      "Most developer compromises arrive through a dependency, a workflow, or an update channel. Audit the three places secrets are exposed.",
    forVectors: ["supply-chain"],
    steps: [
      {
        title: "Pin third-party GitHub Actions to SHAs",
        detail: "A tag can be moved. A commit SHA cannot.",
        minutes: 15,
      },
      {
        title: "Set GITHUB_TOKEN to read-only by default",
        detail: "Then grant write only in the job that needs it.",
        minutes: 5,
      },
      {
        title: "Find packages that run install scripts",
        detail: "npm install is executable code. Know which dependencies execute on install.",
        minutes: 15,
      },
      {
        title: "Rotate anything a compromised package could read",
        detail: "Environment variables, cloud keys, and SSH agents are all in scope.",
        minutes: 10,
      },
    ],
    command: "npm query ':attr(scripts)' 2>$null",
  },
  {
    slug: "web-server",
    title: "Web server emergency",
    kicker: "30 minutes · if you terminate traffic",
    summary:
      "PHP2Shell, NGINX, and HTTP/3 all land on the same surface. Patch, cap, and remove what you do not need.",
    forVectors: ["web-server", "network"],
    steps: [
      {
        title: "Inventory what is actually listening",
        detail: "You cannot patch a service you forgot you run.",
        minutes: 5,
      },
      {
        title: "Patch PHP and NGINX to fixed branches",
        detail: "Use the distribution packages, not a source build you will forget.",
        minutes: 12,
      },
      {
        title: "Disable HTTP/3 until the QUIC fixes are confirmed",
        detail: "It is a valid temporary mitigation for a single-connection crash.",
        minutes: 4,
      },
      {
        title: "Remove or firewall admin panels",
        detail: "The internet does not need your dashboard.",
        minutes: 9,
      },
    ],
  },
  {
    slug: "device-update",
    title: "Device update pass",
    kicker: "20 minutes · phone and laptop",
    summary:
      "The phone is the second factor and the laptop is the session store. Update both before you audit anything else.",
    forVectors: ["endpoint", "browser", "runtime"],
    steps: [
      {
        title: "Install OS updates and restart",
        detail: "A pending restart means the patch is not active.",
        minutes: 8,
      },
      {
        title: "Update banking, UPI, and authenticator apps",
        detail: "These are the apps most worth attacking.",
        minutes: 4,
      },
      {
        title: "Review notification access",
        detail: "Notification readers can steal OTPs without a rooted phone.",
        minutes: 4,
      },
      {
        title: "Check microphone and camera permissions",
        detail: "Revoke anything you cannot explain.",
        minutes: 4,
      },
    ],
  },
  {
    slug: "family-plan",
    title: "Family plan",
    kicker: "25 minutes · multiply the effect",
    summary:
      "The people around you are the softest target. A code word and a callback rule are more effective than a lecture.",
    forVectors: ["banking", "identity", "state-actor"],
    steps: [
      {
        title: "Agree a code word that is not online",
        detail: "Not a pet name, not a birthday. Something only the family knows.",
        minutes: 5,
      },
      {
        title: "Write the callback rule on paper",
        detail: "Hang up, then dial the number on the card. No exceptions.",
        minutes: 5,
      },
      {
        title: "Turn on 2FA for the family email accounts",
        detail: "Email is the reset path for everything else.",
        minutes: 10,
      },
      {
        title: "Practise one phishing message together",
        detail: "Recognition beats warning. Walk through a real example.",
        minutes: 5,
      },
    ],
  },
];

export const PLAYBOOKS_BY_SLUG: ReadonlyMap<string, Playbook> = new Map(
  PLAYBOOKS.map((playbook) => [playbook.slug, playbook]),
);
