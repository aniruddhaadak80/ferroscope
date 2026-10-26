import { expect, test } from "@playwright/test";

const ROUTES = [
  { path: "/", h1: /blast radius/i },
  { path: "/atlas", h1: /27 incidents/i },
  { path: "/atlas/emudhra", h1: /emudhra/i },
  { path: "/atlas/php2shell", h1: /php2shell/i },
  { path: "/profile", h1: /tell the instrument/i },
  { path: "/blast-radius", h1: /shortest honest/i },
  { path: "/cascade", h1: /one disclosure/i },
  { path: "/planner", h1: /fix the cheapest thing/i },
  { path: "/ledger", h1: /a root can be blocked/i },
  { path: "/supply-chain", h1: /you do not have to click/i },
  { path: "/scenarios", h1: /four profiles/i },
  { path: "/timeline", h1: /forty-eight hours/i },
  { path: "/playbooks", h1: /procedures, not/i },
  { path: "/playbooks/stop-the-bleed", h1: /./ },
  { path: "/compare", h1: /which change/i },
  { path: "/settings", h1: /local by/i },
  { path: "/report", h1: /a document you can/i },
  { path: "/matrix", h1: /where the wave/i },
  { path: "/stats", h1: /the numbers behind/i },
  { path: "/glossary", h1: /precision is/i },
  { path: "/method", h1: /every number here/i },
  { path: "/changelog", h1: /small surface/i },
  { path: "/roadmap", h1: /what ships next/i },
  { path: "/about", h1: /built after a week/i },
] as const;

test.describe("routes", () => {
  for (const route of ROUTES) {
    test(`${route.path} renders`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${route.path} status`).toBeLessThan(400);

      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveText(route.h1);
    });
  }

  test("unknown route serves the 404 file", async ({ page }) => {
    const response = await page.goto("/atlas/this-incident-does-not-exist");
    // Next serves the not-found page; the status is 404 and the copy is ours.
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/no incident/i).first()).toBeVisible();
  });

  test("metadata, sitemap, robots, and manifest exist", async ({ request }) => {
    for (const path of ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
    }

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/atlas/emudhra");
    expect(sitemap).toContain("/playbooks/");

    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.name).toContain("Ferroscope");
  });
});
