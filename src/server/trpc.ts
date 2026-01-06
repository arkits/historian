import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "./auth";
import type { Context } from "./context";
import { db } from "@/lib/db";
import { apiKey as apiKeyTable } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import {
  logInfo,
  logError,
  captureTRPCEvent,
  setUser,
  addBreadcrumb,
  getTracer,
  SpanStatusCode,
  startSpan,
} from "./observability";
import { SpanKind, context as otelContext } from "@opentelemetry/api";

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === "ZodError"
            ? (error.cause as any).errors
            : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const loggingMiddleware = t.middleware(({ path, type, next }) => {
  const startTime = Date.now();
  const tracer = getTracer("trpc");

  return tracer.startActiveSpan(`trpc.${type}.${path}`, async (span) => {
    try {
      const result = await next();
      const duration = Date.now() - startTime;

      span.setStatus({ code: SpanStatusCode.OK });
      span.setAttribute("trpc.duration_ms", duration);
      span.setAttribute("trpc.type", type);
      span.setAttribute("trpc.path", path);

      captureTRPCEvent(path, type as "query" | "mutation", duration, true);

      logInfo("tRPC request completed", {
        path,
        type,
        duration_ms: duration,
        ok: true,
      });

      span.end();
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.setAttribute("trpc.duration_ms", duration);
      span.setAttribute("trpc.type", type);
      span.setAttribute("trpc.path", path);
      span.setAttribute("trpc.error", true);

      captureTRPCEvent(path, type as "query" | "mutation", duration, false, {
        error: error instanceof Error ? error.message : String(error),
      });

      logError(error as Error, {
        path,
        type,
        duration_ms: duration,
      });

      span.end();
      throw error;
    }
  });
});

const tracingMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
  const parentSpan = ctx.traceSpan;
  const tracer = getTracer("historian");

  return tracer.startActiveSpan(
    `trpc.${type}.${path}`,
    {
      kind: SpanKind.SERVER,
      attributes: {
        "rpc.system": "http",
        "rpc.service": "trpc",
        "rpc.method": path,
        "rpc.type": type,
        "http.route": `/api/trpc/${path}`,
        "trpc.path": path,
        "trpc.type": type,
      },
    },
    async (span) => {
      try {
        const result = await next();
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        span.recordException(
          error instanceof Error ? error : new Error(String(error)),
        );
        span.end();
        throw error;
      }
    },
  );
});

export const loggedProcedure = t.procedure.use(loggingMiddleware);
export const tracedProcedure = t.procedure.use(tracingMiddleware);

export const protectedProcedure = t.procedure.use(
  async ({ ctx, next, path }) => {
    const startTime = Date.now();

    addBreadcrumb("auth", "Checking session", { path });

    const session = await auth.api.getSession({
      headers: ctx.headers,
    });

    if (!session) {
      const duration = Date.now() - startTime;
      addBreadcrumb("auth", "Unauthorized access attempt", {
        path,
        duration_ms: duration,
      });
      captureTRPCEvent(path, "query", duration, false, {
        reason: "unauthorized",
      });

      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    setUser(session.user.id, session.user.email);

    return next({
      ctx: {
        ...ctx,
        session,
      },
    });
  },
);
