import { assessTrust } from "@ferroscope/core";
import { CERTIFICATES, DEFAULT_PROFILE } from "@ferroscope/seed";
import { jsonOk } from "@/lib/server";

export const dynamic = "force-static";

export async function GET() {
  const assessment = assessTrust(CERTIFICATES, DEFAULT_PROFILE.stack);
  return jsonOk({ certificates: CERTIFICATES, assessment });
}
