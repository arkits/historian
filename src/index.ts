import { serve } from "bun";
import index from "./index.html";
import { createTRPCHandler } from "./server/handler";

const trpcHandler = createTRPCHandler();

const server = serve({
  routes: {
    "/*": index,
    "/api/trpc/*": trpcHandler,
    "/api/auth/*": trpcHandler,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
