import { test, expect } from "@playwright/test";

const hasDb = Boolean(process.env.TEST_DATABASE_URL);

// Deliberately OUTSIDE the DB-gated describe below: this needs no database, so it runs everywhere,
// including locally without Postgres. The front door every seeker actually hits should never be one
// of the specs that quietly skips.
test("the voice-first front door renders and offers the typed fallback", async ({ page }) => {
  // /get-matched is the LIVE front door — the voice agent. Driving voice needs a mic, so this covers
  // what we can without one: the page renders and the escape hatch to the typed flow is present.
  // Until now the real entry point had NO e2e coverage — the typed spec below was silently testing a
  // page that had stopped being the front door.
  await page.goto("/get-matched");
  await expect(page.getByRole("button", { name: /Prefer to type/ })).toBeVisible();
});

test.describe("Seeker intake (the Get-matched front door)", () => {
  test.beforeEach(() => {
    test.skip(!hasDb, "set TEST_DATABASE_URL to run DB-backed specs");
  });

  test("a seeker can complete the intake and reach the confirmation", async ({ page }) => {
    // The TYPED intake lives at /get-matched/form. It moved here when /get-matched became the
    // voice agent; this spec still pointed at /get-matched and so failed on every CI run for weeks
    // looking for a "Begin →" button that had moved.
    await page.goto("/get-matched/form");

    // First click can race React hydration — retry until the care step renders.
    const begin = page.getByRole("button", { name: "Begin →" });
    await expect(begin).toBeVisible();
    await expect(async () => {
      await begin.click();
      await expect(page.getByRole("button", { name: "Therapy", exact: true })).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 15000 });

    // 1 · care type
    await page.getByRole("button", { name: "Therapy", exact: true }).click();
    await page.getByRole("button", { name: "Continue →" }).click();

    // 2 · story (gates Continue at >= 10 chars)
    await page.getByPlaceholder("I've been carrying a lot since…").fill("I've been feeling stuck and want support with anxiety.");
    await page.getByRole("button", { name: "Continue →" }).click();

    // 3 · experience — skip
    await page.getByRole("button", { name: "Continue →" }).click();
    // 4 · focus — skip
    await page.getByRole("button", { name: "Continue →" }).click();
    // 5 · preferences — skip
    await page.getByRole("button", { name: "Continue →" }).click();

    // 6 · contact + consent (gates Continue)
    await page.getByPlaceholder("First name is fine").fill("Jordan E2E");
    await page.getByPlaceholder("you@example.com").fill("jordan-e2e@example.com");
    await page.getByRole("button", { name: /I understand this is read by a person/ }).click();
    await page.getByRole("button", { name: "Continue →" }).click();

    // 6 · review → submit
    await page.getByRole("button", { name: "Send to Nora" }).click();

    await expect(page.getByText("We have it from here")).toBeVisible();
  });
});
