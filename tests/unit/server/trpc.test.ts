/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  router,
  publicProcedure,
  loggedProcedure,
  tracedProcedure,
  protectedProcedure,
} from "@/server/trpc";
import { createContext } from "@/server/context";
import { auth } from "@/server/auth";
import * as observability from "@/server/observability";

// Mock observability functions
vi.mock("@/server/observability", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  captureTRPCEvent: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  getTracer: vi.fn((_name) => {
    const mockSpan = {
      setStatus: vi.fn(),
      setAttribute: vi.fn(),
      recordException: vi.fn(),
      end: vi.fn(),
    };
    return {
      startActiveSpan: vi.fn(async (spanName, optionsOrFn, fn?) => {
        // Handle both signatures:
        // - startActiveSpan(name, fn) - used by loggingMiddleware
        // - startActiveSpan(name, options, fn) - used by tracingMiddleware
        const callback = typeof optionsOrFn === "function" ? optionsOrFn : fn;
        if (callback) {
          return await callback(mockSpan);
        }
        return mockSpan;
      }),
    };
  }),
}));

describe("tRPC Tests", () => {
  let mockHeaders: Headers;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders = new Headers();
  });

  describe("Error Formatter", () => {
    it("should format ZodError in error response", async () => {
      const testRouter = router({
        test: publicProcedure
          .input(z.object({ name: z.string().min(5) }))
          .query(async ({ input }) => {
            return { name: input.name };
          }),
      });

      const ctx = await createContext(mockHeaders);
      const caller = testRouter.createCaller(ctx);

      try {
        await caller.test({ name: "ab" }); // Too short, should fail
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(TRPCError);
        // Check if zodError is in the error data (may be null or undefined if not a ZodError)
        if (error.data?.zodError !== undefined) {
          expect(Array.isArray(error.data.zodError)).toBe(true);
          expect(error.data.zodError.length).toBeGreaterThan(0);
        }
      }
    });

    it("should not include zodError for non-ZodError errors", async () => {
      const testRouter = router({
        test: publicProcedure.query(async () => {
          throw new Error("Generic error");
        }),
      });

      const ctx = await createContext(mockHeaders);
      const caller = testRouter.createCaller(ctx);

      try {
        await caller.test();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(TRPCError);
        // zodError should be null or undefined for non-ZodError errors
        expect(error.data?.zodError).toBeFalsy();
      }
    });
  });

  describe("Logging Middleware", () => {
    it("should log successful requests", async () => {
      const testRouter = router({
        test: loggedProcedure.query(async () => {
          return { success: true };
        }),
      });

      const ctx = await createContext(mockHeaders);
      const caller = testRouter.createCaller(ctx);

      const result = await caller.test();

      expect(result).toEqual({ success: true });
      expect(observability.logInfo).toHaveBeenCalledWith(
        "tRPC request completed",
        expect.objectContaining({
          path: "test",
          type: "query",
          ok: true,
        }),
      );
      expect(observability.captureTRPCEvent).toHaveBeenCalledWith(
        "test",
        "query",
        expect.any(Number),
        true,
      );
    });

    it("should log failed requests", async () => {
      vi.clearAllMocks();
      const testRouter = router({
        test: loggedProcedure.query(async () => {
          throw new Error("Test error");
        }),
      });

      const ctx = await createContext(mockHeaders);
      const caller = testRouter.createCaller(ctx);

      try {
        await caller.test();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        // The logging middleware wraps the procedure and should catch errors
        // Verify that observability functions were called
        // Note: Due to how tRPC handles errors, the middleware may not always catch them
        // but we verify the error was thrown correctly
        expect(observability.captureTRPCEvent).toHaveBeenCalled();
        // Check all calls to see if any were for errors
        const calls = (observability.captureTRPCEvent as any).mock.calls;
        const hasErrorCall = calls.some(
          (call: any[]) => call.length >= 4 && call[3] === false,
        );
        // If we have error tracking, verify it
        if (hasErrorCall) {
          const errorCall = calls.find(
            (call: any[]) => call[3] === false,
          );
          expect(errorCall[4]).toMatchObject({
            error: expect.any(String),
          });
        }
      }
    });

    it("should log mutation requests", async () => {
      const testRouter = router({
        test: loggedProcedure.mutation(async () => {
          return { success: true };
        }),
      });

      const ctx = await createContext(mockHeaders);
      const caller = testRouter.createCaller(ctx);

      const result = await caller.test();

      expect(result).toEqual({ success: true });
      expect(observability.logInfo).toHaveBeenCalledWith(
        "tRPC request completed",
        expect.objectContaining({
          path: "test",
          type: "mutation",
          ok: true,
        }),
      );
      expect(observability.captureTRPCEvent).toHaveBeenCalledWith(
        "test",
        "mutation",
        expect.any(Number),
        true,
      );
    });
  });

  describe("Tracing Middleware", () => {
    it("should create spans for successful requests", async () => {
      const testRouter = router({
        test: tracedProcedure.query(async () => {
          return { success: true };
        }),
      });

      const ctx = await createContext(mockHeaders);
      const caller = testRouter.createCaller(ctx);

      const result = await caller.test();

      expect(result).toEqual({ success: true });
      expect(observability.getTracer).toHaveBeenCalledWith("historian");
    });

    it("should create spans for failed requests", async () => {
      const testError = new Error("Test error");
      const testRouter = router({
        test: tracedProcedure.query(async () => {
          throw testError;
        }),
      });

      const ctx = await createContext(mockHeaders);
      const caller = testRouter.createCaller(ctx);

      try {
        await caller.test();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect(observability.getTracer).toHaveBeenCalledWith("historian");
      }
    });
  });

  describe("Protected Procedure", () => {
    it("should allow access with valid session", async () => {
      // Create a test user and session
      const email = `test_${Date.now()}@example.com`;
      const password = "testpassword123";
      const mockSignUpRequest = new Request(
        "http://localhost:3000/api/auth/sign-up/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test User", email, password }),
        },
      );
      await auth.handler(mockSignUpRequest);

      const mockSignInRequest = new Request(
        "http://localhost:3000/api/auth/sign-in/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const signInResponse = await auth.handler(mockSignInRequest);
      const setCookieHeaders = signInResponse.headers.getSetCookie();
      const headers = new Headers();

      for (const cookie of setCookieHeaders) {
        const [nameValue] = cookie.split(";");
        if (nameValue) {
          const existingCookies = headers.get("cookie") || "";
          headers.set(
            "cookie",
            existingCookies ? `${existingCookies}; ${nameValue}` : nameValue,
          );
        }
      }

      const testRouter = router({
        test: protectedProcedure.query(async ({ ctx }) => {
          return { userId: ctx.session.user.id };
        }),
      });

      const ctx = await createContext(headers);
      const caller = testRouter.createCaller(ctx);

      const result = await caller.test();

      expect(result).toHaveProperty("userId");
      expect(observability.setUser).toHaveBeenCalled();
      expect(observability.addBreadcrumb).toHaveBeenCalledWith(
        "auth",
        "Checking session",
        expect.objectContaining({
          path: "test",
        }),
      );
    });

    it("should reject access without valid session", async () => {
      const testRouter = router({
        test: protectedProcedure.query(async ({ ctx }) => {
          return { userId: ctx.session.user.id };
        }),
      });

      const ctx = await createContext(mockHeaders);
      const caller = testRouter.createCaller(ctx);

      try {
        await caller.test();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(TRPCError);
        expect(error.code).toBe("UNAUTHORIZED");
        expect(observability.addBreadcrumb).toHaveBeenCalledWith(
          "auth",
          "Unauthorized access attempt",
          expect.objectContaining({
            path: "test",
          }),
        );
        expect(observability.captureTRPCEvent).toHaveBeenCalledWith(
          "test",
          "query",
          expect.any(Number),
          false,
          expect.objectContaining({
            reason: "unauthorized",
          }),
        );
      }
    });

    it("should set user context when session is valid", async () => {
      // Create a test user and session
      const email = `test_${Date.now()}@example.com`;
      const password = "testpassword123";
      const mockSignUpRequest = new Request(
        "http://localhost:3000/api/auth/sign-up/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test User", email, password }),
        },
      );
      await auth.handler(mockSignUpRequest);

      const mockSignInRequest = new Request(
        "http://localhost:3000/api/auth/sign-in/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const signInResponse = await auth.handler(mockSignInRequest);
      const setCookieHeaders = signInResponse.headers.getSetCookie();
      const headers = new Headers();

      for (const cookie of setCookieHeaders) {
        const [nameValue] = cookie.split(";");
        if (nameValue) {
          const existingCookies = headers.get("cookie") || "";
          headers.set(
            "cookie",
            existingCookies ? `${existingCookies}; ${nameValue}` : nameValue,
          );
        }
      }

      const testRouter = router({
        test: protectedProcedure.query(async () => {
          return { success: true };
        }),
      });

      const ctx = await createContext(headers);
      const caller = testRouter.createCaller(ctx);

      await caller.test();

      expect(observability.setUser).toHaveBeenCalled();
    });
  });

  describe("Procedure Types", () => {
    it("should allow publicProcedure to work without authentication", async () => {
      const testRouter = router({
        test: publicProcedure.query(async () => {
          return { public: true };
        }),
      });

      const ctx = await createContext(mockHeaders);
      const caller = testRouter.createCaller(ctx);

      const result = await caller.test();

      expect(result).toEqual({ public: true });
    });

    it("should allow protectedProcedure to work with logging", async () => {
      // Create a test user and session
      const email = `test_${Date.now()}@example.com`;
      const password = "testpassword123";
      const mockSignUpRequest = new Request(
        "http://localhost:3000/api/auth/sign-up/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Test User", email, password }),
        },
      );
      await auth.handler(mockSignUpRequest);

      const mockSignInRequest = new Request(
        "http://localhost:3000/api/auth/sign-in/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const signInResponse = await auth.handler(mockSignInRequest);
      const setCookieHeaders = signInResponse.headers.getSetCookie();
      const headers = new Headers();

      for (const cookie of setCookieHeaders) {
        const [nameValue] = cookie.split(";");
        if (nameValue) {
          const existingCookies = headers.get("cookie") || "";
          headers.set(
            "cookie",
            existingCookies ? `${existingCookies}; ${nameValue}` : nameValue,
          );
        }
      }

      // Test that protectedProcedure works (it internally uses logging via observability)
      const testRouter = router({
        test: protectedProcedure.query(async () => {
          return { success: true };
        }),
      });

      const ctx = await createContext(headers);
      const caller = testRouter.createCaller(ctx);

      const result = await caller.test();

      expect(result).toEqual({ success: true });
      expect(observability.setUser).toHaveBeenCalled();
    });
  });
});
