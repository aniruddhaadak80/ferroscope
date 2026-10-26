import type { Incident } from "@ferroscope/core";
import { INCIDENTS_48H } from "./incidents-48h";
import { INCIDENTS_MONTH } from "./incidents-month";
import { INCIDENTS_WATCHLIST } from "./incidents-watchlist";

/**
 * The canonical order is the reporting order: 48-hour wave first, then the
 * month-scale incidents, then the watchlist. The UI sorts by date when it
 * needs a chronology; the atlas preserves this editorial order.
 */
export const INCIDENTS: readonly Incident[] = [
  ...INCIDENTS_48H,
  ...INCIDENTS_MONTH,
  ...INCIDENTS_WATCHLIST,
];

export const INCIDENTS_BY_SLUG: ReadonlyMap<string, Incident> = new Map(
  INCIDENTS.map((incident) => [incident.slug, incident]),
);

export const INCIDENT_COUNT = INCIDENTS.length;
