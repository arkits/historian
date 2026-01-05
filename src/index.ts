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

const trpcHandler = createTRPCHandler();

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  return handleExtensionRequest(request);
}

const server = serve({
  routes: {
    "/*": index,
    "/api/trpc/*": trpcHandler,
    "/api/auth/*": trpcHandler,
    "/api/extension/*": handleRequest,
  },

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
