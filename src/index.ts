import { serve } from "bun";
import { createTRPCHandler } from "./server/handler";
import {
  initObservability,
  logInfo,
  logError,
  shutdownObservability,
  captureServerEvent,
} from "./server/observability";
import { handleExtensionRequest } from "./server/extension";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const SERVE_WEBUI = process.env.SERVE_WEBUI !== "false";
const isProduction = process.env.NODE_ENV === "production";

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

function serveStaticFile(path: string): Response {
  try {
    const content = readFileSync(path);
    const ext = path.split(".").pop();
    const contentTypes: Record<string, string> = {
      html: "text/html",
      js: "application/javascript",
      css: "text/css",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      svg: "image/svg+xml",
      ico: "image/x-icon",
    };
    return new Response(content, {
      headers: {
        "Content-Type": contentTypes[ext!] || "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

function createSPAHandler(): Response {
  const indexPath = join(__dirname, "..", "dist", "index.html");
  try {
    const indexContent = readFileSync(indexPath, "utf-8");
    return new Response(indexContent, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new Response("Application not built. Run 'bun run build' first.", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

const routes: Record<string, any> = {
  "/api/trpc/*": trpcHandler,
  "/api/auth/*": trpcHandler,
  "/api/extension/*": handleRequest,
};

if (SERVE_WEBUI) {
  if (isProduction) {
    routes["/*"] = createSPAHandler();
  } else {
    routes["/*"] = serveStaticFile(join(__dirname, "..", "index.html"));
  }
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
