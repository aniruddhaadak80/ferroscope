import { INCIDENTS } from "@ferroscope/seed";
import { jsonOk } from "@/lib/server";

// Query filters live in the request URL, so this handler must run per request.
// A static handler would serve the build-time response and silently ignore
// `?severity=`, `?vector=`, and `?window=`.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const severity = url.searchParams.get("severity");
  const vector = url.searchParams.get("vector");
  const window = url.searchParams.get("window");

  const incidents = INCIDENTS.filter((incident) => {
    if (severity && incident.severity !== severity) return false;
    if (vector && incident.vector !== vector) return false;
    if (window && incident.window !== window) return false;
    return true;
  });

  return jsonOk({ incidents, total: incidents.length, dataset: INCIDENTS.length });
}
