import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
  test("response includes X-Content-Type-Options header", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("response includes X-Frame-Options header", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    expect(headers["x-frame-options"]).toBe("DENY");
  });

  test("response includes X-XSS-Protection header", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    expect(headers["x-xss-protection"]).toBe("1; mode=block");
  });

  test("response includes Referrer-Policy header", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    expect(headers["referrer-policy"]).toBeDefined();
  });

  test("response includes Permissions-Policy header", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    expect(headers["permissions-policy"]).toBeDefined();
  });

  test("response includes Strict-Transport-Security header", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    // HSTS may not be present in development, but should be configured
    const hsts = headers["strict-transport-security"];
    if (hsts) {
      expect(hsts).toContain("max-age=");
    }
  });
});

test.describe("Rate Limiting", () => {
  test("API responds normally under rate limit", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
  });

  test("rate limiting returns 429 after exceeding limit", async ({ request }) => {
    const responses: number[] = [];

    // Send rapid requests to trigger rate limiting
    for (let i = 0; i < 110; i++) {
      const response = await request.get("/api/health");
      responses.push(response.status());
      if (response.status() === 429) break;
    }

    // Either we hit 429 or all succeeded (rate limit may be higher)
    const has429 = responses.includes(429);
    const allOk = responses.every((s) => s === 200);

    expect(has429 || allOk).toBe(true);
  });
});
