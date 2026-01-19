/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleTRPCRequest, createTRPCHandler } from "@/server/handler";

// Mock observability functions
const mockLogInfo = vi.fn();
const mockLogError = vi.fn();
const mockCaptureServerEvent = vi.fn();
const mockAddBreadcrumb = vi.fn();
const mockSpan = {
  setStatus: vi.fn(),
  setAttribute: vi.fn(),
  recordException: vi.fn(),
  end: vi.fn(),
};
const mockTracer = {
  startActiveSpan: vi.fn(async (spanName, options, fn) => {
    if (fn) {
      return await fn(mockSpan);
    }
    return mockSpan;
  }),
};

vi.mock("@/server/observability", () => ({
  logInfo: mockLogInfo,
  logError: mockLogError,
  captureServerEvent: mockCaptureServerEvent,
  addBreadcrumb: mockAddBreadcrumb,
  getTracer: vi.fn((_name) => mockTracer),
}));

// Mock tRPC fetchRequestHandler
const mockFetchRequestHandler = vi.fn();
vi.mock("@trpc/server/adapters/fetch", () => ({
  fetchRequestHandler: mockFetchRequestHandler,
}));

// Mock auth handler
const mockAuthHandler = vi.fn();
vi.mock("@/server/auth", () => ({
  auth: {
    handler: mockAuthHandler,
  },
}));

// Mock context
vi.mock("@/server/context", () => ({
  createContext: vi.fn(async () => ({ user: null, session: null })),
}));

describe("Handler Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleTRPCRequest", () => {
    it("should handle successful tRPC request with CORS headers", async () => {
      const mockResponse = new Response(
        JSON.stringify({ result: "success" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );

      mockFetchRequestHandler.mockResolvedValue(mockResponse);

      const request = new Request("http://localhost:3000/api/trpc/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
        },
        body: JSON.stringify({}),
      });

      const response = await handleTRPCRequest(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
      expect(mockCaptureServerEvent).toHaveBeenCalledWith(
        "trpc.request",
        expect.objectContaining({
          path: "/api/trpc/test",
          method: "POST",
          status: 200,
        }),
      );
    });

    it("should handle tRPC request without origin header", async () => {
      const mockResponse = new Response(
        JSON.stringify({ result: "success" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );

      mockFetchRequestHandler.mockResolvedValue(mockResponse);

      const request = new Request("http://localhost:3000/api/trpc/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const response = await handleTRPCRequest(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    it("should handle tRPC request with disallowed origin", async () => {
      const mockResponse = new Response(
        JSON.stringify({ result: "success" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );

      mockFetchRequestHandler.mockResolvedValue(mockResponse);

      const request = new Request("http://localhost:3000/api/trpc/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://malicious.com",
        },
        body: JSON.stringify({}),
      });

      const response = await handleTRPCRequest(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    it("should handle tRPC request errors and return 500 with CORS", async () => {
      const error = new Error("Internal error");
      mockFetchRequestHandler.mockRejectedValue(error);

      const request = new Request("http://localhost:3000/api/trpc/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
        },
        body: JSON.stringify({}),
      });

      const response = await handleTRPCRequest(request);

      expect(response.status).toBe(500);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
      const body = await response.json();
      expect(body.error).toEqual({
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      });
      expect(mockLogError).toHaveBeenCalled();
      expect(mockCaptureServerEvent).toHaveBeenCalledWith(
        "trpc.error",
        expect.objectContaining({
          path: "/api/trpc/test",
          method: "POST",
        }),
      );
    });

    it("should set span attributes correctly on successful request", async () => {
      const mockResponse = new Response(
        JSON.stringify({ result: "success" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "content-length": "100",
          },
        },
      );

      mockFetchRequestHandler.mockResolvedValue(mockResponse);

      const request = new Request("http://localhost:3000/api/trpc/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-agent": "test-agent",
        },
        body: JSON.stringify({}),
      });

      await handleTRPCRequest(request);

      expect(mockTracer.startActiveSpan).toHaveBeenCalledWith(
        "HTTP POST /api/trpc/test",
        expect.objectContaining({
          kind: expect.any(Number),
          attributes: expect.objectContaining({
            "http.method": "POST",
            "http.url": "http://localhost:3000/api/trpc/test",
            "http.target": "/api/trpc/test",
            "http.user_agent": "test-agent",
          }),
        }),
        expect.any(Function),
      );
    });

    it("should call onError callback when tRPC handler has errors", async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: { message: "tRPC error" } }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );

      mockFetchRequestHandler.mockResolvedValue(mockResponse);

      const request = new Request("http://localhost:3000/api/trpc/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      await handleTRPCRequest(request);

      // The onError callback is called by tRPC internally, we just verify the handler was called
      expect(mockFetchRequestHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: "/api/trpc",
          req: request,
          onError: expect.any(Function),
        }),
      );
    });
  });

  describe("createTRPCHandler", () => {
    it("should handle OPTIONS request for tRPC endpoint with allowed origin", async () => {
      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/api/trpc", {
        method: "OPTIONS",
        headers: {
          origin: "http://localhost:3000",
        },
      });

      const response = await handler(request);

      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
      expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
        "true",
      );
    });

    it("should handle OPTIONS request for tRPC endpoint with disallowed origin", async () => {
      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/api/trpc", {
        method: "OPTIONS",
        headers: {
          origin: "http://malicious.com",
        },
      });

      const response = await handler(request);

      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    it("should handle OPTIONS request for auth endpoint with allowed origin", async () => {
      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/api/auth", {
        method: "OPTIONS",
        headers: {
          origin: "http://localhost:3000",
        },
      });

      const response = await handler(request);

      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
    });

    it("should route tRPC requests to handleTRPCRequest", async () => {
      const mockResponse = new Response(
        JSON.stringify({ result: "success" }),
        {
          status: 200,
        },
      );

      mockFetchRequestHandler.mockResolvedValue(mockResponse);

      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/api/trpc/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(mockFetchRequestHandler).toHaveBeenCalled();
    });

    it("should route auth requests to auth.handler", async () => {
      const mockAuthResponse = new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
        },
      );

      mockAuthHandler.mockResolvedValue(mockAuthResponse);

      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
        },
        body: JSON.stringify({ email: "test@example.com", password: "pass" }),
      });

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(mockAuthHandler).toHaveBeenCalled();
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
      expect(mockCaptureServerEvent).toHaveBeenCalledWith(
        "auth.request",
        expect.objectContaining({
          method: "POST",
          pathname: "/api/auth/sign-in",
        }),
      );
    });

    it("should handle auth requests with x-better-auth-token header", async () => {
      const mockAuthResponse = new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
        },
      );

      mockAuthHandler.mockResolvedValue(mockAuthResponse);

      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-better-auth-token": "test-token",
        },
        body: JSON.stringify({ email: "test@example.com", password: "pass" }),
      });

      await handler(request);

      expect(mockAuthHandler).toHaveBeenCalled();
      const authCall = mockAuthHandler.mock.calls[0][0];
      expect(authCall.headers.get("x-better-auth-token")).toBe("test-token");
    });

    it("should handle auth request errors", async () => {
      const error = new Error("Auth error");
      mockAuthHandler.mockRejectedValue(error);

      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com", password: "pass" }),
      });

      await expect(handler(request)).rejects.toThrow("Auth error");
      expect(mockLogError).toHaveBeenCalled();
    });

    it("should return 404 for unknown routes", async () => {
      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/api/unknown", {
        method: "GET",
        headers: {
          origin: "http://localhost:3000",
        },
      });

      const response = await handler(request);

      expect(response.status).toBe(404);
      expect(await response.text()).toBe("Not found");
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000",
      );
    });

    it("should handle /auth routes (without /api prefix)", async () => {
      const mockAuthResponse = new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
        },
      );

      mockAuthHandler.mockResolvedValue(mockAuthResponse);

      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com", password: "pass" }),
      });

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(mockAuthHandler).toHaveBeenCalled();
    });

    it("should log incoming requests", async () => {
      const handler = createTRPCHandler();
      const request = new Request("http://localhost:3000/api/trpc/test", {
        method: "GET",
      });

      await handler(request);

      expect(mockLogInfo).toHaveBeenCalledWith(
        "Incoming request",
        expect.objectContaining({
          method: "GET",
          url: "http://localhost:3000/api/trpc/test",
          pathname: "/api/trpc/test",
        }),
      );
    });

    it("should handle tRPC requests with /api/trpc/ prefix", async () => {
      const mockResponse = new Response(
        JSON.stringify({ result: "success" }),
        {
          status: 200,
        },
      );

      mockFetchRequestHandler.mockResolvedValue(mockResponse);

      const handler = createTRPCHandler();
      const request = new Request(
        "http://localhost:3000/api/trpc/test.procedure",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      const response = await handler(request);

      expect(response.status).toBe(200);
      expect(mockFetchRequestHandler).toHaveBeenCalled();
    });
  });
});
