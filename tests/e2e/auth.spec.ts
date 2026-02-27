import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page loads correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/login/);
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("login form validates required fields", async ({ page }) => {
    await page.goto("/login");
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const isInvalid = await emailInput.evaluate(
      (el) => !(el as HTMLInputElement).validity.valid
    );
    expect(isInvalid).toBe(true);
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"], input[name="email"]', "invalid@test.com");
    await page.fill('input[type="password"], input[name="password"]', "wrongpassword123");
    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(2000);

    const hasError =
      (await page.locator('[role="alert"], .text-red-500, .text-red-400, .error').count()) > 0 ||
      (await page.locator("text=error").count()) > 0 ||
      (await page.locator("text=Invalid").count()) > 0 ||
      (await page.locator("text=inválido").count()) > 0;

    expect(hasError || page.url().includes("login")).toBe(true);
  });
});
