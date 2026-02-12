import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display title", async ({ page }) => {
    await expect(page).toHaveTitle(/Team Task Board/);
  });

  test("should display heading", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toContainText("Next.js React Catch-Up");
  });

  test("should have Get Started button", async ({ page }) => {
    const button = page.locator("button:has-text('Get Started')");
    await expect(button).toBeVisible();
  });

  test("should have View Docs button", async ({ page }) => {
    const button = page.locator("button:has-text('View Docs')");
    await expect(button).toBeVisible();
  });

  test("should display feature cards", async ({ page }) => {
    const cards = page.locator("text=/Schema-First|Server Actions|Testing/");
    await expect(cards).toHaveCount(3);
  });
});
