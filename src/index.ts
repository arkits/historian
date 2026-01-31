import { createServer, shutdownObservability } from "./server/server";

const server = createServer();

process.on("SIGTERM", async () => {
  await shutdownObservability();
  server.stop();
});

process.on("SIGINT", async () => {
  await shutdownObservability();
  server.stop();
});

process.on("uncaughtException", (error) => {
  logError(error, { type: "uncaughtException" });
});

process.on("unhandledRejection", (reason) => {
  logError(new Error(String(reason)), { type: "unhandledRejection" });
});
