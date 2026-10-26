import { INCIDENTS } from "@ferroscope/seed";
import { jsonError, jsonOk } from "@/lib/server";

export function generateStaticParams() {
  return INCIDENTS.map((incident) => ({ slug: incident.slug }));
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const incident = INCIDENTS.find((item) => item.slug === slug);

  if (!incident) {
    return jsonError("incident_not_found", `No incident is filed under "${slug}".`, 404);
  }

  return jsonOk({ incident });
}
