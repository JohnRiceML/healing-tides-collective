import { test, expect } from "@playwright/test";

import { SEED } from "./fixtures";
import { signInAs } from "./_auth";

const hasDb = Boolean(process.env.TEST_DATABASE_URL);

test.describe("Matching workspace (Phase 2 — admin curates a shortlist)", () => {
  test.beforeEach(({ context }) => {
    test.skip(!hasDb, "set TEST_DATABASE_URL to run DB-backed specs");
    return signInAs(context, SEED.admin);
  });

  test("the queue links into the workspace for a seeded intake", async ({ page }) => {
    await page.goto("/admin/seekers");
    // Other specs submit their own intakes into the same DB, so scope to this seeker's card.
    const card = page.getByRole("listitem").filter({ hasText: SEED.intake.name });
    await expect(card).toBeVisible();
    await card.getByRole("link", { name: /Open workspace/ }).click();
    // The workspace reads the seeker's story first.
    await expect(page.getByText(/trauma-informed support that isn't just talk therapy/)).toBeVisible();
  });

  test("an admin adds a candidate, writes a why, and it persists", async ({ page }) => {
    await page.goto("/admin/seekers/e2e-intake-1");

    // The seeded published practitioner shows as a candidate.
    await expect(page.getByRole("link", { name: SEED.published.displayName }).first()).toBeVisible();

    // Add to shortlist — first interaction can race hydration, so retry until it lands.
    await expect(async () => {
      await page.getByRole("button", { name: "Add to shortlist" }).click();
      await expect(page.getByRole("button", { name: /On shortlist/ })).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // Write the "why I thought of them" note and save it.
    const reason = "Somatic, trauma-informed — fits the 'not just talk therapy' ask.";
    await page.getByPlaceholder(/Why I thought of them/).fill(reason);
    await page.getByRole("button", { name: "Save note" }).click();

    // Reload from the DB → the shortlist + the note survived the round-trip.
    await page.reload();
    await expect(page.getByRole("button", { name: /On shortlist/ })).toBeVisible();
    await expect(page.getByPlaceholder(/Why I thought of them/)).toHaveValue(reason);

    // Adding the first pick auto-advances the intake NEW → Reviewing; the queue reflects it.
    await page.goto("/admin/seekers");
    const card = page.getByRole("listitem").filter({ hasText: SEED.intake.name });
    await expect(card.getByText("Reviewing")).toBeVisible();
    await expect(card.getByText("1 shortlisted")).toBeVisible();
  });
});
