import type { Severity, Vector } from "./types";

/** FNV-1a. Small, stable, and good enough for layout jitter. */
export function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${DATE_FORMAT.format(new Date(iso))} · ${TIME_FORMAT.format(new Date(iso))} UTC`;
}

export function formatShortTime(iso: string): string {
  return TIME_FORMAT.format(new Date(iso));
}

const VECTOR_LABELS: Readonly<Record<Vector, string>> = {
  "web-server": "Web server",
  "certificate-authority": "Certificate authority",
  "supply-chain": "Supply chain",
  hosting: "Hosting",
  identity: "Identity",
  browser: "Browser",
  runtime: "Runtime",
  network: "Network",
  endpoint: "Endpoint",
  banking: "Banking",
  "ai-agent": "AI agent",
  ransomware: "Ransomware",
  "state-actor": "State actor",
  "data-breach": "Data breach",
};

export function vectorLabel(vector: Vector): string {
  return VECTOR_LABELS[vector];
}

export function severityLabel(severity: Severity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
