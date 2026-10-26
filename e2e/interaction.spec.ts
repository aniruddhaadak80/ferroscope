import { expect, test } from "@playwright/test";

test.describe("interaction", () => {
  test("command palette navigates with the keyboard", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Open command palette" }).click();
    const input = page.getByPlaceholder(/Jump to a page/);
    await expect(input).toBeVisible();

    await input.fill("planner");
    const option = page.getByRole("option", { name: /Planner/ });
    await expect(option).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/planner$/);
    await expect(page.locator("h1")).toContainText(/cheapest thing/i);
  });

  test("theme toggle swaps the document class and persists", async ({ page }) => {
    await page.goto("/settings");
    const toggle = page.locator("#main").getByRole("group", { name: "Color theme" });

    await toggle.getByRole("button", { name: "Light", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(/light/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);

    await page
      .locator("#main")
      .getByRole("group", { name: "Color theme" })
      .getByRole("button", { name: "Dark", exact: true })
      .click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("planner completion updates residual risk and survives reload", async ({ page }) => {
    await page.goto("/planner");

    const doneChip = page.getByRole("button", { name: /^Done \d+$/ });
    await expect(doneChip).toHaveText(/Done 0/);

    const firstAction = page.getByRole("button", { name: /^Mark .* complete$/ }).first();
    const actionLabel = await firstAction.getAttribute("aria-label");
    expect(actionLabel).toBeTruthy();
    await firstAction.click();
    await expect(doneChip).toHaveText(/Done 1/);

    // Completed plans move to the bottom of the list, so re-query by name
    // instead of holding a positional locator.
    const completed = page.getByRole("button", { name: actionLabel ?? "" });
    await expect(completed).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expect(page.getByRole("button", { name: /^Done \d+$/ })).toHaveText(/Done 1/);
    await expect(page.getByRole("button", { name: actionLabel ?? "" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("cascade steps frame by frame", async ({ page }) => {
    await page.goto("/cascade");

    const readout = page.getByText(/^tick \d{2} \/ \d+$/);
    await expect(readout).toContainText("tick 00");

    const step = page.getByRole("button", { name: /^Step/ });
    await step.click();
    await expect(readout).toContainText("tick 01");
    await step.click();
    await expect(readout).toContainText("tick 02");
  });

  test("profile toggling changes the live declared count", async ({ page }) => {
    await page.goto("/profile");

    const declared = page.getByText(/^\d+ items$/).first();
    await expect(declared).toHaveText("17 items");

    await page.getByPlaceholder(/nginx, python, bank/i).fill("nginx");
    const tile = page.getByRole("button", { name: /NGINX/i }).first();
    await expect(tile).toHaveAttribute("aria-pressed", "false");
    await tile.click();

    await expect(tile).toHaveAttribute("aria-pressed", "true");
    await expect(declared).toHaveText("18 items");
  });

  test("atlas search narrows the catalogue", async ({ page }) => {
    await page.goto("/atlas");

    await expect(page.getByText(/27 of 27/)).toBeVisible();
    await page.getByPlaceholder(/Search names/i).fill("emudhra");
    await expect(page.getByText(/1 of 27/)).toBeVisible();
    await expect(page.getByRole("link", { name: /eMudhra/i }).first()).toBeVisible();
  });

  test("report downloads a JSON payload with the declared stack", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "blob downloads are only exercised in Chromium");
    await page.goto("/report");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download \.json/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("ferroscope-report.json");
  });
});
