import { test, expect } from "@playwright/test";

import { SEED } from "./fixtures";

// DB-backed specs skip green when no test DB is configured.
const hasDb = Boolean(process.env.TEST_DATABASE_URL);

test.describe("Public surfaces", () => {
  test("homepage responds and carries the brand", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(/Healing Tides/i);
  });

  // Regression: every landing CTA once pointed at mailto:nora@healingtidestherapy.com
  // (her private-practice domain), so /get-matched, /practitioners and /crisis were
  // unreachable from the front page. The product must be one click from the landing.
  test("homepage CTAs reach the product, not an inbox", async ({ page }) => {
    await page.goto("/");
    for (const href of ["/get-matched", "/for-practitioners", "/practitioners", "/crisis"]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
    }
  });

  test("crisis page lists the 988 lifeline", async ({ page }) => {
    await page.goto("/crisis");
    await expect(page.getByText("988 Suicide & Crisis Lifeline")).toBeVisible();
    // Exact — the disclaimer footer also mentions 988, so a loose match is ambiguous.
    await expect(page.getByText("Call or text 988.", { exact: true })).toBeVisible();
  });

  test.describe("directory + profile (needs DB)", () => {
    test.beforeEach(() => {
      test.skip(!hasDb, "set TEST_DATABASE_URL to run DB-backed specs");
    });

    test("the directory lists the published practitioner", async ({ page }) => {
      await page.goto("/practitioners");
      await expect(page.getByRole("heading", { name: "Meet the collective." })).toBeVisible();
      await expect(page.getByText(SEED.published.displayName)).toBeVisible();
    });

    test("a published profile page renders", async ({ page }) => {
      await page.goto(`/practitioners/${SEED.published.slug}`);
      await expect(
        page.getByRole("heading", { name: SEED.published.displayName }),
      ).toBeVisible();
    });

    test("an unknown profile slug 404s", async ({ page }) => {
      const res = await page.goto("/practitioners/no-such-practitioner-xyz");
      expect(res?.status()).toBe(404);
    });
  });
});
