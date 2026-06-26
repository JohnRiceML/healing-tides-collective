import { test, expect } from "@playwright/test";

import { SEED } from "./fixtures";
import { signInAs, signOut } from "./_auth";

// All practitioner specs need the seeded DB.
const hasDb = Boolean(process.env.TEST_DATABASE_URL);

test.describe("Practitioner area — the Clerk bypass in action", () => {
  test.beforeEach(() => {
    test.skip(!hasDb, "set TEST_DATABASE_URL to run DB-backed specs");
  });

  test("a signed-out visitor is asked to sign in", async ({ page, context }) => {
    await signOut(context);
    await page.goto("/practitioner");
    await expect(page.getByText(/not signed in/i)).toBeVisible();
  });

  test("a signed-in practitioner lands on their dashboard", async ({ page, context }) => {
    await signInAs(context, SEED.published);
    await page.goto("/practitioner");
    // "Welcome back, {firstName}" — firstName is the first word of the display name.
    await expect(page.getByRole("heading", { name: /Welcome back, River/i })).toBeVisible();
    await expect(page.getByText("Profile strength")).toBeVisible();
  });

  test("a signed-in seeker is invited to set up a practice (no auto-promotion)", async ({
    page,
    context,
  }) => {
    await signInAs(context, SEED.seeker);
    await page.goto("/practitioner");
    await expect(page.getByText("Set up your practitioner profile")).toBeVisible();
  });

  test("the profile editor opens for a signed-in practitioner", async ({ page, context }) => {
    await signInAs(context, SEED.published);
    const res = await page.goto("/practitioner/edit");
    expect(res?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/practitioner\/edit/);
  });
});
