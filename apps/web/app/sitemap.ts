import { INCIDENTS, PLAYBOOKS } from "@ferroscope/seed";
import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ferroscope.vercel.app";

const STATIC_ROUTES = [
  "",
  "/atlas",
  "/profile",
  "/blast-radius",
  "/cascade",
  "/planner",
  "/ledger",
  "/supply-chain",
  "/scenarios",
  "/timeline",
  "/playbooks",
  "/compare",
  "/settings",
  "/report",
  "/matrix",
  "/stats",
  "/glossary",
  "/method",
  "/changelog",
  "/roadmap",
  "/about",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-10-24T00:00:00Z");

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${BASE}${route}`,
      lastModified: now,
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/atlas" ? 0.9 : 0.7,
    })),
    ...INCIDENTS.map((incident) => ({
      url: `${BASE}/atlas/${incident.slug}`,
      lastModified: new Date(incident.disclosedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...PLAYBOOKS.map((playbook) => ({
      url: `${BASE}/playbooks/${playbook.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
