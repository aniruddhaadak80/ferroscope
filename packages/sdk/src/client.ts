import type {
  ActionPlan,
  BlastGraph,
  CascadeResult,
  CertificateRecord,
  ExposureProfile,
  ExposureReport,
  Incident,
} from "@ferroscope/core";

export interface FerroscopeClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export class FerroscopeError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "FerroscopeError";
    this.code = code;
    this.status = status;
  }
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let code = "http_error";
    let message = `Request failed with ${response.status}`;
    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } };
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      // Keep the status-based fallback.
    }
    throw new FerroscopeError(code, message, response.status);
  }
  return (await response.json()) as T;
}

/**
 * A deliberately small client. It has no runtime dependency on React and can
 * be used from a script, a test, or a server component.
 */
export class FerroscopeClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: FerroscopeClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await this.fetchImpl(this.url(path), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return parse<T>(response);
  }

  async health(): Promise<{ status: string; incidents: number; seed: number }> {
    return parse(await this.fetchImpl(this.url("/api/healthz")));
  }

  async incidents(): Promise<{ incidents: readonly Incident[]; total: number }> {
    return parse(await this.fetchImpl(this.url("/api/incidents")));
  }

  async incident(slug: string): Promise<{ incident: Incident }> {
    return parse(await this.fetchImpl(this.url(`/api/incidents/${encodeURIComponent(slug)}`)));
  }

  async exposure(profile: ExposureProfile): Promise<{ report: ExposureReport }> {
    return this.post("/api/exposure", { profile });
  }

  async blastRadius(profile: ExposureProfile): Promise<{ graph: BlastGraph }> {
    return this.post("/api/blast-radius", { profile });
  }

  async cascade(
    profile: ExposureProfile,
    incidentSlug: string,
    ticks?: number,
  ): Promise<{ result: CascadeResult }> {
    return this.post(
      "/api/cascade",
      ticks === undefined ? { profile, incidentSlug } : { profile, incidentSlug, ticks },
    );
  }

  async planner(
    profile: ExposureProfile,
    completed: readonly string[] = [],
  ): Promise<{ plans: readonly ActionPlan[]; residualRisk: number }> {
    return this.post("/api/planner", { profile, completed });
  }

  async ledger(): Promise<{ certificates: readonly CertificateRecord[] }> {
    return parse(await this.fetchImpl(this.url("/api/ledger")));
  }
}
