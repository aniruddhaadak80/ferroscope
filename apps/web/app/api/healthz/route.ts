import { INCIDENT_COUNT, SEED } from "@ferroscope/seed";
import { jsonOk } from "@/lib/server";

export const dynamic = "force-static";

export async function GET() {
  return jsonOk({
    status: "ok",
    incidents: INCIDENT_COUNT,
    seed: SEED.seed,
    version: SEED.version,
    uptime: "static",
  });
}
