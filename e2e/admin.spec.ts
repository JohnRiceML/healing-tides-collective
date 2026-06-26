import { test, expect } from "@playwright/test";

import { SEED } from "./fixtures";
import { signInAs } from "./_auth";

const hasDb = Boolean(process.env.TEST_DATABASE_URL);

test.describe("Admin — gated by requireAdmin, reached via the bypass", () => {
  test.beforeEach(() => {
    test.skip(!hasDb, "set TEST_DATABASE_URL to run DB-backed specs");
  });

  test("a non-admin gets a 404 at /admin", async ({ page, context }) => {
    await signInAs(context, SEED.seeker);
    const res = await page.goto("/admin");
    expect(res?.status()).toBe(404);
  });

  test("an admin reaches the overview with the admin nav", async ({ page, context }) => {
    await signInAs(context, SEED.admin);
    const res = await page.goto("/admin");
    expect(res?.status()).toBe(200);
    // The admin chrome (tabs) only renders for admins.
    await expect(page.getByRole("link", { name: "Feedback" })).toBeVisible();
  });

  test("the feedback queue surfaces seeded feedback", async ({ page, context }) => {
    await signInAs(context, SEED.admin);
    await page.goto("/admin/feedback");
    await expect(page.getByText(/E2E seeded feedback/i)).toBeVisible();
  });
});
