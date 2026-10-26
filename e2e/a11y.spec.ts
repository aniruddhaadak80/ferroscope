import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/atlas", "/profile", "/planner", "/method", "/report"] as const;

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    test(`${route} has no critical axe violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load" });
      // `networkidle` never settles reliably in Firefox with Next's prefetch
      // requests, so wait for the document and the heading instead.
      await expect(page.locator("h1").first()).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const critical = results.violations.filter((violation) => violation.impact === "critical");
      if (critical.length > 0) {
        console.error(
          `${route} critical violations:\n${critical
            .map(
              (violation) => `${violation.id}: ${violation.help}\n${violation.nodes.length} nodes`,
            )
            .join("\n")}`,
        );
      }

      expect(critical, `${route} critical violations`).toEqual([]);
    });
  }
});
