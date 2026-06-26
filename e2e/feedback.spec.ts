import { test, expect, type Page, type Locator } from "@playwright/test";

const hasDb = Boolean(process.env.TEST_DATABASE_URL);

/**
 * Open the feedback widget and return its panel. Retries the click through React
 * hydration — in dev a click can land before the onClick handler is attached, so a
 * single click is lost. Retrying until the panel opens makes it deterministic.
 */
async function openWidget(page: Page): Promise<Locator> {
  const tab = page.getByRole("button", { name: "Share feedback" });
  await expect(tab).toBeVisible();
  const panel = page.getByRole("dialog", { name: "Share feedback" });
  await expect(async () => {
    await tab.click();
    await expect(panel).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 15000 });
  return panel;
}

test.describe("Feedback widget", () => {
  test("the tab opens the panel", async ({ page }) => {
    await page.goto("/crisis"); // any non-admin page mounts the widget
    const panel = await openWidget(page);
    await expect(panel.getByText("We'd love your thoughts")).toBeVisible();
  });

  test("the widget is hidden inside the admin area", async ({ page }) => {
    // /admin 404s for a signed-out visitor, but the widget must not mount there regardless.
    await page.goto("/admin");
    await expect(page.getByRole("button", { name: "Share feedback" })).toHaveCount(0);
  });

  test("submitting feedback thanks the sender", async ({ page }) => {
    test.skip(!hasDb, "set TEST_DATABASE_URL to run DB-backed specs");
    await page.goto("/crisis");
    const panel = await openWidget(page);
    await panel.getByLabel("Your feedback").fill("E2E: the crisis page was easy to find.");
    await panel.getByRole("button", { name: "Send" }).click();
    await expect(panel.getByText(/Thank you/i)).toBeVisible();
  });
});
