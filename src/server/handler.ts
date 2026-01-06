import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { auth } from "./auth";
import {
  logInfo,
  logError,
  captureServerEvent,
  addBreadcrumb,
  getTracer,
  SpanStatusCode,
} from "./observability";
import { SpanKind } from "@opentelemetry/api";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://historian.archit.xyz",
  "https://historian-api.archit.xyz",
];

function addCorsHeaders(response: Response, origin: string | null): Response {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Expose-Headers", "Set-Cookie");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return response;
}

export async function handleTRPCRequest(req: Request): Promise<Response> {
  const startTime = Date.now();
  const url = new URL(req.url);
  const tracer = getTracer("http");

  return tracer.startActiveSpan(
    `HTTP ${req.method} ${url.pathname}`,
    {
      kind: SpanKind.SERVER,
      attributes: {
        "http.method": req.method,
        "http.url": req.url,
        "http.target": url.pathname,
        "http.host": url.hostname,
        "http.user_agent": req.headers.get("user-agent") || "",
        "http.scheme": url.protocol.replace(":", ""),
        "http.route": "/api/trpc/*",
      },
    },
    async (span) => {
      const headers = new Headers(req.headers);
      const ctx = await createContext(headers);

      try {
        const response = await fetchRequestHandler({
          endpoint: "/api/trpc",
          req,
          router: appRouter,
          createContext: async () => ctx,
          onError({ error, type, path }) {
            logError(error, {
              type,
              path,
              method: req.method,
              url: req.url,
            });

            addBreadcrumb("trpc.error", "tRPC error occurred", {
              type,
              path,
              error: error.message,
            });
          },
        });

        const duration = Date.now() - startTime;
        span.setStatus({ code: SpanStatusCode.OK });
        span.setAttribute("http.status_code", response.status);
        span.setAttribute(
          "http.response_size_bytes",
          response.headers.get("content-length") || 0,
        );

        captureServerEvent("trpc.request", {
          path: url.pathname,
          method: req.method,
          duration_ms: duration,
          status: response.status,
        });

        span.end();
        return addCorsHeaders(response, req.headers.get("origin"));
      } catch (error) {
        const duration = Date.now() - startTime;

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        span.setAttribute("http.status_code", 500);

        logError(error as Error, {
          method: req.method,
          url: req.url,
          duration_ms: duration,
        });

        captureServerEvent("trpc.error", {
          path: url.pathname,
          method: req.method,
          duration_ms: duration,
          error: error instanceof Error ? error.message : String(error),
        });

        span.end();

        return addCorsHeaders(
          new Response(
            JSON.stringify({
              error: {
                message: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
              },
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          ),
          req.headers.get("origin"),
        );
      }
    },
  );
}

export function createTRPCHandler() {
  return async (req: Request) => {
    const url = new URL(req.url);
    const startTime = Date.now();

    logInfo("Incoming request", {
      method: req.method,
      url: req.url,
      pathname: url.pathname,
    });

    if (url.pathname === "/api/trpc" || url.pathname.startsWith("/api/trpc/")) {
      return handleTRPCRequest(req);
    }

    if (url.pathname === "/api/auth" || url.pathname.startsWith("/api/auth/")) {
      if (req.method === "OPTIONS") {
        const origin = req.headers.get("origin");
        if (origin && ALLOWED_ORIGINS.includes(origin)) {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": origin,
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
              "Access-Control-Allow-Credentials": "true",
            },
          });
        }
        return new Response(null, { status: 204 });
      }
      try {
        const authHeader = req.headers.get("Authorization");
        let authReq = req;
        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.slice(7);
          const headers = new Headers(req.headers);
          headers.set("x-better-auth-token", token);
          authReq = new Request(req, { headers });
        }
        const response = await auth.handler(authReq);
        captureServerEvent("auth.request", {
          method: req.method,
          pathname: url.pathname,
          duration_ms: Date.now() - startTime,
          status: response.status,
        });
        return addCorsHeaders(response, req.headers.get("origin"));
      } catch (error) {
        logError(error as Error, {
          method: req.method,
          pathname: url.pathname,
        });
        throw error;
      }
    }

    return addCorsHeaders(
      new Response("Not found", { status: 404 }),
      req.headers.get("origin"),
    );
  };
}
