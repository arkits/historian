import { serve } from "bun";
import { createTRPCHandler } from "./server/handler";
import { auth } from "./server/auth";
import {
  initObservability,
  logInfo,
  logError,
  shutdownObservability,
  captureServerEvent,
} from "./server/observability";
import { handleExtensionRequest } from "./server/extension";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getGitCommitId(): string {
  try {
    const headPath = join(__dirname, "..", ".git", "HEAD");
    if (existsSync(headPath)) {
      const head = readFileSync(headPath, "utf-8").trim();
      if (head.startsWith("ref:")) {
        const refPath = join(
          __dirname,
          "..",
          ".git",
          head.replace("ref: ", ""),
        );
        if (existsSync(refPath)) {
          return readFileSync(refPath, "utf-8").trim().substring(0, 7);
        }
      } else {
        return head.substring(0, 7);
      }
    }
  } catch {
    // Ignore errors
  }
  return "unknown";
}

function createHealthHandler(): Response {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    commit: getGitCommitId(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };
  return new Response(JSON.stringify(health), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
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

function createAuthHandler() {
  return async (req: Request) => {
    const origin = req.headers.get("origin");

    if (
      req.method === "OPTIONS" &&
      origin &&
      ALLOWED_ORIGINS.includes(origin)
    ) {
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

    try {
      const url = new URL(req.url);
      const pathname = url.pathname;
      const body = await req.json().catch(() => ({}));
      const headers = new Headers();
      req.headers.forEach((value, key) => {
        if (key !== "host" && key !== "content-length") {
          headers.set(key, value);
        }
      });

      let data: any;

      if (pathname === "/auth/sign-in/email" && req.method === "POST") {
        data = await auth.api.signInEmail({
          body: {
            email: body.email,
            password: body.password,
          },
          headers,
        });
      } else if (pathname === "/auth/sign-up/email" && req.method === "POST") {
        data = await auth.api.signUpEmail({
          body: {
            name: body.name,
            email: body.email,
            password: body.password,
          },
          headers,
        });
      } else if (pathname === "/auth/sign-out" && req.method === "POST") {
        data = await auth.api.signOut({ headers });
      } else if (pathname === "/auth/get-session" && req.method === "GET") {
        data = await auth.api.getSession({ headers, query: {} as any });
      } else if (
        pathname === "/auth/request-password-reset" &&
        req.method === "POST"
      ) {
        data = await auth.api.requestPasswordReset({
          body: {
            email: body.email,
            redirectTo: body.redirectTo,
          },
          headers,
        });
        console.log("[AUTH] requestPasswordReset result:", data);
      } else if (pathname === "/auth/reset-password" && req.method === "POST") {
        data = await auth.api.resetPassword({
          body: {
            newPassword: body.newPassword,
            token: body.token,
          },
          headers,
        });
      } else {
        return new Response("Not found", { status: 404 });
      }

      const responseHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        responseHeaders["Access-Control-Allow-Origin"] = origin;
        responseHeaders["Access-Control-Allow-Credentials"] = "true";
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: responseHeaders,
      });
    } catch (error) {
      logError(error as Error, { handler: "auth" });
      const errorHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        errorHeaders["Access-Control-Allow-Origin"] = origin;
        errorHeaders["Access-Control-Allow-Credentials"] = "true";
      }
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Auth error",
        }),
        {
          status: 500,
          headers: errorHeaders,
        },
      );
    }
  };
}

const authHandler = createAuthHandler();
const trpcHandler = createTRPCHandler();

async function handleRequest(request: Request): Promise<Response> {
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

const distDir = join(__dirname, "..", "dist");

function serveStaticAsset(path: string): Response | null {
  const filePath = join(distDir, path);
  if (existsSync(filePath)) {
    return serveStaticFile(filePath);
  }
  return null;
}

function createSPAHandler(): Response {
  const indexPath = join(distDir, "index.html");
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
  "/health": createHealthHandler(),
};

if (SERVE_WEBUI) {
  if (isProduction) {
    routes["/auth/*"] = authHandler;
    routes["/*"] = async (request: Request) => {
      const url = new URL(request.url);
      const staticResponse = serveStaticAsset(url.pathname);
      if (staticResponse) {
        return staticResponse;
      }
      return createSPAHandler();
    };
  } else {
    routes["/auth/*"] = authHandler;
    routes["/api/*"] = trpcHandler;
    routes["/*"] = async (request: Request) => {
      const url = new URL(request.url);
      try {
        const response = await fetch(
          `http://localhost:5173${url.pathname}${url.search}`,
          {
            method: request.method,
            headers: request.headers,
            body: request.body,
          },
        );
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch {
        return new Response(
          "Vite dev server not running. Run 'bun run dev:ui' or 'bun run dev'.",
          {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          },
        );
      }
    };
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
