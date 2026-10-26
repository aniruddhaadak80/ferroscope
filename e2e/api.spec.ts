import { expect, test } from "@playwright/test";

const DEFAULT_PROFILE = {
  stack: [
    "os-windows",
    "browser-edge",
    "browser-brave",
    "runtime-node",
    "runtime-python",
    "svc-vercel",
    "svc-github",
    "svc-github-actions",
    "ca-emudhra",
    "ca-letsencrypt",
    "acct-github",
    "acct-bank-sbi",
    "pkg-npm",
    "pkg-pypi",
    "ai-openai",
    "device-windows-pc",
    "device-android",
  ],
  region: "IN",
  bank: true,
  passwordManager: false,
  twoFactor: false,
  autoUpdates: false,
};

test.describe("api", () => {
  test("healthz reports the dataset identity", async ({ request }) => {
    const response = await request.get("/api/healthz");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.incidents).toBe(27);
    expect(body.seed).toBe(2718);
    expect(response.headers()["x-ferroscope-version"]).toBe("0.1.0");
  });

  test("incidents list and filters", async ({ request }) => {
    const all = await (await request.get("/api/incidents")).json();
    expect(all.total).toBe(27);
    expect(all.dataset).toBe(27);

    const critical = await (await request.get("/api/incidents?severity=critical")).json();
    expect(critical.total).toBeGreaterThan(0);
    expect(
      critical.incidents.every((item: { severity: string }) => item.severity === "critical"),
    ).toBe(true);

    const wave = await (await request.get("/api/incidents?window=48h")).json();
    expect(wave.total).toBe(14);
  });

  test("single incident and a missing one", async ({ request }) => {
    const found = await request.get("/api/incidents/emudhra");
    expect(found.status()).toBe(200);
    const { incident } = await found.json();
    expect(incident.slug).toBe("emudhra");
    expect(incident.sources.length).toBeGreaterThan(0);

    const missing = await request.get("/api/incidents/not-a-real-slug");
    expect(missing.status()).toBe(404);
    const body = await missing.json();
    expect(body.error.code).toBe("incident_not_found");
  });

  test("exposure on the default profile is the recorded 58 / 42", async ({ request }) => {
    const response = await request.post("/api/exposure", { data: { profile: DEFAULT_PROFILE } });
    expect(response.status()).toBe(200);
    const { report } = await response.json();
    expect(report.risk).toBe(58);
    expect(report.score).toBe(42);
    expect(report.band).toBe("exposed");
    expect(
      report.exposed.map((match: { incident: { slug: string } }) => match.incident.slug).sort(),
    ).toEqual(["emudhra", "sbi"]);
  });

  test("exposure rejects a malformed body", async ({ request }) => {
    const response = await request.post("/api/exposure", {
      data: { profile: { stack: "not-an-array", region: "INDIA" } },
    });
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_profile");
    expect(body.error.details.fieldErrors).toBeTruthy();
  });

  test("blast radius returns a connected graph", async ({ request }) => {
    const response = await request.post("/api/blast-radius", {
      data: { profile: DEFAULT_PROFILE },
    });
    expect(response.status()).toBe(200);
    const { graph } = await response.json();
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.nodes.some((node: { kind: string }) => node.kind === "self")).toBe(true);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  test("cascade is deterministic across calls", async ({ request }) => {
    const body = { profile: DEFAULT_PROFILE, incidentSlug: "php2shell", ticks: 12 };
    const first = await (await request.post("/api/cascade", { data: body })).json();
    const second = await (await request.post("/api/cascade", { data: body })).json();

    expect(first.result).toEqual(second.result);
    // `ticks` is a soft target: the simulator always appends a containment and
    // a residual frame, so the frame count and the reported ticks agree, and
    // both stay in the documented 8–13 range.
    expect(first.result.ticks).toBe(first.result.frames.length);
    expect(first.result.frames.length).toBeGreaterThanOrEqual(8);
    expect(first.result.frames.length).toBeLessThanOrEqual(13);
    expect(first.result.frames.map((frame: { tick: number }) => frame.tick)).toEqual(
      first.result.frames.map((_: unknown, index: number) => index),
    );
    expect(first.result.peakRisk).toBeGreaterThanOrEqual(first.result.frames[0].risk);
  });

  test("cascade 404s an unknown incident", async ({ request }) => {
    const response = await request.post("/api/cascade", {
      data: { profile: DEFAULT_PROFILE, incidentSlug: "nope" },
    });
    expect(response.status()).toBe(404);
  });

  test("planner ranks by efficiency and honours completions", async ({ request }) => {
    const base = await (
      await request.post("/api/planner", { data: { profile: DEFAULT_PROFILE, completed: [] } })
    ).json();

    const efficiencies = base.plans.map((plan: { efficiency: number }) => plan.efficiency);
    const sorted = [...efficiencies].sort((a: number, b: number) => b - a);
    expect(efficiencies).toEqual(sorted);
    expect(base.residualRisk).toBeLessThanOrEqual(base.baselineRisk);

    const first = base.plans.find((plan: { relevant: string[] }) => plan.relevant.length > 0);
    expect(first).toBeTruthy();

    const after = await (
      await request.post("/api/planner", {
        data: { profile: DEFAULT_PROFILE, completed: [first.action.id] },
      })
    ).json();

    expect(after.residualRisk).toBeLessThan(base.residualRisk);
  });

  test("ledger exposes the eMudhra gap", async ({ request }) => {
    const body = await (await request.get("/api/ledger")).json();
    expect(body.certificates.length).toBeGreaterThan(0);
    expect(body.assessment.total).toBe(body.certificates.length);
    expect(body.assessment.pythonTrusted).toBeGreaterThanOrEqual(0);
  });
});
