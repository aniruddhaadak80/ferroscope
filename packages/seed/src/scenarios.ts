import type { ExposureProfile, Scenario } from "@ferroscope/core";
import { DEFAULT_STACK } from "./stack";

/**
 * The default profile is a real developer laptop, not a worst case. It
 * deliberately includes the eMudhra root and SBI banking so the first screen
 * has something true to say.
 */
export const DEFAULT_PROFILE: ExposureProfile = {
  stack: DEFAULT_STACK,
  region: "IN",
  bank: true,
  passwordManager: false,
  twoFactor: false,
  autoUpdates: false,
};

const hardenedStack = DEFAULT_STACK.filter((id) => id !== "ca-emudhra");

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "this-laptop",
    name: "This laptop",
    description:
      "The default developer profile: Windows, Edge and Brave, Node and Python, GitHub Actions, Vercel, the eMudhra root, and SBI banking.",
    profile: DEFAULT_PROFILE,
  },
  {
    id: "hardened",
    name: "Hardened",
    description:
      "Same stack after the fixes: eMudhra removed, a password manager, 2FA, and automatic updates. The delta is the point.",
    profile: {
      stack: hardenedStack,
      region: "IN",
      bank: true,
      passwordManager: true,
      twoFactor: true,
      autoUpdates: true,
    },
  },
  {
    id: "server-operator",
    name: "Server operator",
    description:
      "A small self-hosted stack: NGINX, PHP, WordPress, GitLab, and AWS on top of the laptop. This is where the incident wave actually bites.",
    profile: {
      stack: [
        ...DEFAULT_STACK,
        "server-nginx",
        "server-apache",
        "runtime-php",
        "svc-wordpress",
        "svc-gitlab",
        "svc-aws",
      ],
      region: "IN",
      bank: true,
      passwordManager: false,
      twoFactor: false,
      autoUpdates: false,
    },
  },
  {
    id: "phone-only",
    name: "Phone only",
    description:
      "No laptop, no CI, no server. Android, Chrome, Signal, Meta AI, and a bank account. The blast radius is smaller but not zero.",
    profile: {
      stack: [
        "os-android",
        "device-android",
        "browser-chrome",
        "svc-signal",
        "ai-meta",
        "acct-bank-sbi",
      ],
      region: "IN",
      bank: true,
      passwordManager: false,
      twoFactor: false,
      autoUpdates: false,
    },
  },
];

export const SCENARIOS_BY_ID: ReadonlyMap<string, Scenario> = new Map(
  SCENARIOS.map((scenario) => [scenario.id, scenario]),
);
