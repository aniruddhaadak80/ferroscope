import type { ExposureProfile, ExposureReport } from "@ferroscope/core";
import { describe, expect, it, vi } from "vitest";
import { FerroscopeClient, FerroscopeError } from "./client";
import { cascadeRequestSchema, plannerRequestSchema, profileSchema } from "./schemas";

const PROFILE: ExposureProfile = {
  stack: ["ca-emudhra", "acct-bank-sbi"],
  region: "IN",
  bank: true,
  passwordManager: false,
  twoFactor: false,
  autoUpdates: false,
};

const REPORT = { risk: 56, score: 44, band: "exposed" } as unknown as ExposureReport;

describe("FerroscopeClient", () => {
  it("posts a profile to the exposure endpoint", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ report: REPORT }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );

    const client = new FerroscopeClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const result = await client.exposure(PROFILE);

    expect(result.report.risk).toBe(56);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/exposure");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({ profile: PROFILE });
  });

  it("throws a typed error for a failure envelope", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            error: { code: "invalid_profile", message: "Region must be ISO-3166" },
          }),
          {
            status: 400,
            headers: { "content-type": "application/json" },
          },
        ),
    );

    const client = new FerroscopeClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(client.exposure(PROFILE)).rejects.toBeInstanceOf(FerroscopeError);
    await expect(client.exposure(PROFILE)).rejects.toMatchObject({
      code: "invalid_profile",
      status: 400,
    });
  });

  it("honours a base URL", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ status: "ok", incidents: 27, seed: 2718 }), { status: 200 }),
    );
    const client = new FerroscopeClient({
      baseUrl: "https://ferroscope.example/",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await client.health();
    expect(fetchImpl).toHaveBeenCalledWith("https://ferroscope.example/api/healthz");
  });

  it("omits ticks when not provided", async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ result: {} }), { status: 200 }),
    );
    const client = new FerroscopeClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await client.cascade(PROFILE, "emudhra");
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ profile: PROFILE, incidentSlug: "emudhra" });
  });
});

describe("wire schemas", () => {
  it("accepts a valid profile", () => {
    expect(profileSchema.parse(PROFILE)).toEqual(PROFILE);
  });

  it("rejects a non-ISO region", () => {
    expect(() => profileSchema.parse({ ...PROFILE, region: "IND" })).toThrow();
  });

  it("rejects an unknown boolean field type", () => {
    expect(() => profileSchema.parse({ ...PROFILE, twoFactor: "yes" })).toThrow();
  });

  it("defaults completed to an empty array", () => {
    const parsed = plannerRequestSchema.parse({ profile: PROFILE });
    expect(parsed.completed).toEqual([]);
  });

  it("bounds the cascade tick count", () => {
    expect(() =>
      cascadeRequestSchema.parse({ profile: PROFILE, incidentSlug: "emudhra", ticks: 99 }),
    ).toThrow();
  });
});
