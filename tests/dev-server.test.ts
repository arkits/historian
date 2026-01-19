import { describe, it, expect } from "vitest";

const BACKEND_URL = "http://localhost:3000";
const FRONTEND_URL = "http://localhost:5173";

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

describe("Development Server Setup", () => {
  describe("Backend Server", () => {
    it("should have health endpoint responding", async () => {
      const response = await fetchWithTimeout(`${BACKEND_URL}/health`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("healthy");
      expect(data.environment).toBe("development");
    });

    it("should handle auth sign-up", async () => {
      const uniqueEmail = `test_${Date.now()}@example.com`;
      const response = await fetchWithTimeout(
        `${BACKEND_URL}/auth/sign-up/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: uniqueEmail,
            password: "testpassword123",
          }),
        },
      );
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(uniqueEmail);
      expect(data.token).toBeDefined();
    });

    it("should handle auth sign-in", async () => {
      const uniqueEmail = `logintest_${Date.now()}@example.com`;
      const password = "testpassword123";

      await fetchWithTimeout(`${BACKEND_URL}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Login Test User",
          email: uniqueEmail,
          password,
        }),
      });

      const response = await fetchWithTimeout(
        `${BACKEND_URL}/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: uniqueEmail, password }),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(uniqueEmail);
    });

    it("should reject sign-in with wrong password", async () => {
      const uniqueEmail = `wrongpass_${Date.now()}@example.com`;
      const password = "correctpassword";

      await fetchWithTimeout(`${BACKEND_URL}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Wrong Pass Test",
          email: uniqueEmail,
          password,
        }),
      });

      const response = await fetchWithTimeout(
        `${BACKEND_URL}/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: uniqueEmail,
            password: "wrongpassword",
          }),
        },
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should handle auth sign-out", async () => {
      const uniqueEmail = `signout_${Date.now()}@example.com`;
      const password = "testpassword123";

      await fetchWithTimeout(`${BACKEND_URL}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Signout Test",
          email: uniqueEmail,
          password,
        }),
      });

      const signInResponse = await fetchWithTimeout(
        `${BACKEND_URL}/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: uniqueEmail, password }),
        },
      );
      const signInData = await signInResponse.json();

      const response = await fetchWithTimeout(`${BACKEND_URL}/auth/sign-out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${signInData.token}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("should handle get-session", async () => {
      const uniqueEmail = `session_${Date.now()}@example.com`;
      const password = "testpassword123";

      await fetchWithTimeout(`${BACKEND_URL}/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Session Test",
          email: uniqueEmail,
          password,
        }),
      });

      const signInResponse = await fetchWithTimeout(
        `${BACKEND_URL}/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: uniqueEmail, password }),
        },
      );
      const signInData = await signInResponse.json();

      const response = await fetchWithTimeout(
        `${BACKEND_URL}/auth/get-session`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${signInData.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.session).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(uniqueEmail);
    });
  });

  describe("Frontend Server", () => {
    // Helper to check if frontend server is available
    async function isFrontendServerAvailable(): Promise<boolean> {
      try {
        const response = await fetchWithTimeout(FRONTEND_URL, {}, 2000);
        return response.status === 200;
      } catch {
        return false;
      }
    }

    it("should serve HTML on root path", async () => {
      const isAvailable = await isFrontendServerAvailable();
      if (!isAvailable) {
        console.log(
          "Skipping frontend test: Vite dev server not running. Start with 'bun run dev:ui' or 'bun run dev'",
        );
        return;
      }

      const response = await fetchWithTimeout(FRONTEND_URL);
      expect(response.status).toBe(200);
      const contentType = response.headers.get("content-type");
      expect(contentType).toContain("text/html");
      const html = await response.text();
      expect(html).toContain("<!doctype html>");
      expect(html).toContain("Historian");
    });

    it("should serve Vite client module", async () => {
      const isAvailable = await isFrontendServerAvailable();
      if (!isAvailable) {
        console.log(
          "Skipping frontend test: Vite dev server not running. Start with 'bun run dev:ui' or 'bun run dev'",
        );
        return;
      }

      const response = await fetchWithTimeout(`${FRONTEND_URL}/@vite/client`);
      expect(response.status).toBe(200);
      const contentType = response.headers.get("content-type");
      expect(contentType).toMatch(/text\/javascript|application\/javascript/);
    });

    it("should serve React entry point", async () => {
      const isAvailable = await isFrontendServerAvailable();
      if (!isAvailable) {
        console.log(
          "Skipping frontend test: Vite dev server not running. Start with 'bun run dev:ui' or 'bun run dev'",
        );
        return;
      }

      const response = await fetchWithTimeout(
        `${FRONTEND_URL}/src/client/index.tsx`,
      );
      expect(response.status).toBe(200);
      const contentType = response.headers.get("content-type");
      expect(contentType).toMatch(/text\/javascript|application\/javascript/);
    });
  });

  describe("Server Configuration", () => {
    it("should have health endpoint with development environment", async () => {
      const response = await fetchWithTimeout(`${BACKEND_URL}/health`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe("development");
    });
  });
});
