/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach } from "vitest";
import { createContext, type Context } from "@/server/context";

describe("Context Tests", () => {
  let mockHeaders: Headers;

  beforeEach(() => {
    mockHeaders = new Headers();
  });

  describe("createContext", () => {
    it("should create context with headers only when no trace headers are present", async () => {
      mockHeaders.set("authorization", "Bearer token123");
      mockHeaders.set("user-agent", "test-agent");

      const context = await createContext(mockHeaders);

      expect(context).toHaveProperty("headers");
      expect(context.headers).toBe(mockHeaders);
      expect(context.traceSpan).toBeUndefined();
    });

    it("should create context with traceSpan when traceparent header is present", async () => {
      mockHeaders.set("traceparent", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
      mockHeaders.set("x-span-id", "span-123");
      mockHeaders.set("x-trace-id", "trace-456");
      mockHeaders.set("x-trace-sampled", "true");

      const context = await createContext(mockHeaders);

      expect(context).toHaveProperty("headers");
      expect(context.traceSpan).toBeDefined();
      expect(context.traceSpan?.spanId).toBe("span-123");
      expect(context.traceSpan?.traceId).toBe("trace-456");
      expect(context.traceSpan?.isRemote).toBe(true);
    });

    it("should create context with traceSpan when tracestate header is present", async () => {
      mockHeaders.set("tracestate", "rojo=00f067aa0ba902b7");
      mockHeaders.set("x-span-id", "span-789");
      mockHeaders.set("x-trace-id", "trace-012");
      mockHeaders.set("x-trace-sampled", "false");

      const context = await createContext(mockHeaders);

      expect(context).toHaveProperty("headers");
      expect(context.traceSpan).toBeDefined();
      expect(context.traceSpan?.spanId).toBe("span-789");
      expect(context.traceSpan?.traceId).toBe("trace-012");
      expect(context.traceSpan?.isRemote).toBe(false);
    });

    it("should create context with traceSpan when both traceparent and tracestate headers are present", async () => {
      mockHeaders.set("traceparent", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
      mockHeaders.set("tracestate", "rojo=00f067aa0ba902b7");
      mockHeaders.set("x-span-id", "span-both");
      mockHeaders.set("x-trace-id", "trace-both");
      mockHeaders.set("x-trace-sampled", "true");

      const context = await createContext(mockHeaders);

      expect(context).toHaveProperty("headers");
      expect(context.traceSpan).toBeDefined();
      expect(context.traceSpan?.spanId).toBe("span-both");
      expect(context.traceSpan?.traceId).toBe("trace-both");
      expect(context.traceSpan?.isRemote).toBe(true);
    });

    it("should default spanId to empty string when x-span-id header is missing", async () => {
      mockHeaders.set("traceparent", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
      mockHeaders.set("x-trace-id", "trace-456");
      mockHeaders.set("x-trace-sampled", "true");

      const context = await createContext(mockHeaders);

      expect(context.traceSpan).toBeDefined();
      expect(context.traceSpan?.spanId).toBe("");
    });

    it("should default traceId to empty string when x-trace-id header is missing", async () => {
      mockHeaders.set("traceparent", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
      mockHeaders.set("x-span-id", "span-123");
      mockHeaders.set("x-trace-sampled", "true");

      const context = await createContext(mockHeaders);

      expect(context.traceSpan).toBeDefined();
      expect(context.traceSpan?.traceId).toBe("");
    });

    it("should set isRemote to false when x-trace-sampled header is not 'true'", async () => {
      mockHeaders.set("traceparent", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
      mockHeaders.set("x-span-id", "span-123");
      mockHeaders.set("x-trace-id", "trace-456");
      mockHeaders.set("x-trace-sampled", "false");

      const context = await createContext(mockHeaders);

      expect(context.traceSpan).toBeDefined();
      expect(context.traceSpan?.isRemote).toBe(false);
    });

    it("should set isRemote to false when x-trace-sampled header is missing", async () => {
      mockHeaders.set("traceparent", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
      mockHeaders.set("x-span-id", "span-123");
      mockHeaders.set("x-trace-id", "trace-456");

      const context = await createContext(mockHeaders);

      expect(context.traceSpan).toBeDefined();
      expect(context.traceSpan?.isRemote).toBe(false);
    });

    it("should set isRemote to false when x-trace-sampled header has any other value", async () => {
      mockHeaders.set("traceparent", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
      mockHeaders.set("x-span-id", "span-123");
      mockHeaders.set("x-trace-id", "trace-456");
      mockHeaders.set("x-trace-sampled", "maybe");

      const context = await createContext(mockHeaders);

      expect(context.traceSpan).toBeDefined();
      expect(context.traceSpan?.isRemote).toBe(false);
    });

    it("should preserve all original headers in context", async () => {
      mockHeaders.set("authorization", "Bearer token123");
      mockHeaders.set("user-agent", "test-agent");
      mockHeaders.set("content-type", "application/json");
      mockHeaders.set("traceparent", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");

      const context = await createContext(mockHeaders);

      expect(context.headers.get("authorization")).toBe("Bearer token123");
      expect(context.headers.get("user-agent")).toBe("test-agent");
      expect(context.headers.get("content-type")).toBe("application/json");
      expect(context.headers.get("traceparent")).toBe("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
    });

    it("should return a Context type that matches the interface", async () => {
      const context = await createContext(mockHeaders);

      expect(context).toHaveProperty("headers");
      expect(context.headers).toBeInstanceOf(Headers);
      // Type check: context should be assignable to Context type
      const typedContext: Context = context;
      expect(typedContext).toBeDefined();
    });
  });
});
