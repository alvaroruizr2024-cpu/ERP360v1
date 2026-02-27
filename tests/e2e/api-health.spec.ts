import { test, expect } from "@playwright/test";

test.describe("API Health Endpoint", () => {
  test("GET /api/health returns 200 with status ok", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.version).toBeDefined();
    expect(body.uptime).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  test("health endpoint returns correct version", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    expect(body.version).toBe("1.14.0");
  });

  test("health endpoint returns uptime as number", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThan(0);
  });

  test("health endpoint returns valid timestamp", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    const timestamp = new Date(body.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  test("health endpoint returns environment info", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    expect(body.environment).toBeDefined();
    expect(typeof body.environment).toBe("string");
  });

  test("health endpoint returns modules count", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    expect(body.modules).toBeDefined();
    expect(typeof body.modules).toBe("number");
    expect(body.modules).toBeGreaterThan(0);
  });
});
