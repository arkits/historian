import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { auth } from "./auth";

export async function handleTRPCRequest(req: Request): Promise<Response> {
  const headers = new Headers(req.headers);
  const ctx = await createContext(headers);

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => ctx,
  });
}

export function createTRPCHandler() {
  return async (req: Request) => {
    const url = new URL(req.url);

    if (url.pathname === "/api/trpc" || url.pathname.startsWith("/api/trpc/")) {
      return handleTRPCRequest(req);
    }

    if (url.pathname === "/api/auth" || url.pathname.startsWith("/api/auth/")) {
      return auth.handler(req);
    }

    return new Response("Not found", { status: 404 });
  };
}
