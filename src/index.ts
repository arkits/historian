import { serve } from "bun";
import index from "./client/index.html";
import { createTRPCHandler } from "./server/handler";
import {
  initObservability,
  logInfo,
  logError,
  shutdownObservability,
  captureServerEvent,
} from "./server/observability";
import { handleExtensionRequest } from "./server/extension";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://historian.archit.xyz",
  "https://historian-api.archit.xyz",
];

initObservability({
  serviceName: "historian",
  serviceVersion: "1.0.0",
  environment: process.env.NODE_ENV || "development",
  sentryDsn:
    process.env.SENTRY_DSN ||
    "https://92ec25df6cf8087705e5370eb75e2573@o425745.ingest.us.sentry.io/4510656962101248",
  posthogApiKey: process.env.POSTHOG_API_KEY,
  posthogHost: process.env.POSTHOG_HOST,
  otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
});

const SERVE_WEBUI =
  process.env.SERVE_WEBUI !== "false" && process.env.NODE_ENV !== "production";

const trpcHandler = createTRPCHandler();

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const response = await handleExtensionRequest(request);

  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
}

function handleOptions(request: Request): Response {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return new Response(null, { status: 204 });
}

const routes: Record<string, any> = {
  "/api/trpc/*": trpcHandler,
  "/api/auth/*": trpcHandler,
  "/api/extension/*": handleRequest,
};

if (SERVE_WEBUI) {
  routes["/*"] = index;
}

const server = serve({
  port: Number(process.env.PORT ?? 3000),
  routes,

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },

  error(error: Error) {
    logError(error, { handler: "bun.serve" });
    captureServerEvent("server.error", {
      error: error.message,
      stack: error.stack,
    });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  },
});

logInfo("Server started", { url: server.url.toString() });

process.on("SIGTERM", async () => {
  logInfo("Received SIGTERM, shutting down gracefully");
  await shutdownObservability();
  server.stop();
});

process.on("SIGINT", async () => {
  logInfo("Received SIGINT, shutting down gracefully");
  await shutdownObservability();
  server.stop();
});

process.on("uncaughtException", (error) => {
  logError(error, { type: "uncaughtException" });
});

process.on("unhandledRejection", (reason) => {
  logError(new Error(String(reason)), { type: "unhandledRejection" });
});
