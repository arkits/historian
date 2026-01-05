import * as Sentry from "@sentry/bun";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor, type Span } from "@opentelemetry/sdk-trace-node";
import { trace, SpanStatusCode, context, SpanKind } from "@opentelemetry/api";
import { PostHog } from "posthog-node";

let posthog: PostHog | null = null;
let sdk: NodeSDK | null = null;
let isInitialized = false;

export interface ObservabilityConfig {
  serviceName: string;
  serviceVersion?: string;
  environment: string;
  sentryDsn?: string;
  posthogApiKey?: string;
  posthogHost?: string;
  otlpEndpoint?: string;
}

function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

function getNumberEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function initObservability(config: ObservabilityConfig): void {
  if (isInitialized) {
    console.warn("[observability] Already initialized, skipping");
    return;
  }

  const {
    serviceName,
    serviceVersion = "1.0.0",
    environment,
    sentryDsn,
    posthogApiKey,
    posthogHost = "https://app.posthog.com",
    otlpEndpoint,
  } = config;

  const tracingEnabled = getBooleanEnv("OTEL_TRACING_ENABLED", true);
  const sentryEnabled = getBooleanEnv("SENTRY_ENABLED", true);
  const posthogEnabled = getBooleanEnv("POSTHOG_ENABLED", true);

  console.log(`[observability] Initializing ${serviceName} in ${environment}`);

  if (sentryEnabled && sentryDsn) {
    console.log("[observability] Initializing Sentry");
    Sentry.init({
      dsn: sentryDsn,
      environment,
      release: serviceVersion,
      tracesSampleRate: 1.0,
      beforeSend(event) {
        if (process.env.NODE_ENV === "test") return null;
        return event;
      },
    });
  }

  if (tracingEnabled || otlpEndpoint) {
    console.log("[observability] Initializing OpenTelemetry");
    const exporters: any[] = [];

    if (otlpEndpoint) {
      exporters.push(
        new OTLPTraceExporter({
          url: `${otlpEndpoint}/v1/traces`,
        }),
      );
    }

    sdk = new NodeSDK({
      resource: new Resource({
        [ATTR_SERVICE_NAME]: serviceName,
        [ATTR_SERVICE_VERSION]: serviceVersion,
        "deployment.environment": environment,
      }),
      spanProcessors:
        exporters.length > 0
          ? exporters.map((exp) => new SimpleSpanProcessor(exp))
          : [],
      textMapPropagator: undefined,
    });

    try {
      sdk.start();
      console.log("[observability] OpenTelemetry started");
    } catch (err) {
      console.error("[observability] Failed to start OpenTelemetry", err);
    }
  }

  if (posthogEnabled && posthogApiKey) {
    console.log("[observability] Initializing PostHog");
    posthog = new PostHog(posthogApiKey, {
      host: posthogHost,
      flushAt: getNumberEnv("POSTHOG_FLUSH_AT", 20),
      flushInterval: getNumberEnv("POSTHOG_FLUSH_INTERVAL", 10000),
    });
  }

  isInitialized = true;
  console.log("[observability] Initialization complete");
}

export function getPosthogClient(): PostHog | null {
  return posthog;
}

export function captureEvent(
  event: string,
  properties?: Record<string, any>,
): void {
  if (!posthog) return;

  posthog.capture({
    event,
    properties,
  });
}

export function captureServerEvent(
  event: string,
  properties?: Record<string, any>,
): void {
  captureEvent(`server.${event}`, properties);
}

export function captureTRPCEvent(
  procedure: string,
  type: "query" | "mutation",
  duration: number,
  success: boolean,
  properties?: Record<string, any>,
): void {
  captureEvent(`trpc.${procedure}`, {
    type,
    duration_ms: duration,
    success,
    ...properties,
  });
}

export function setUserContext(
  userId: string,
  properties?: Record<string, any>,
): void {
  if (!posthog) return;

  posthog.identify({
    distinctId: userId,
    properties,
  });
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, any>,
  level: "debug" | "info" | "warning" | "error" | "fatal" = "info",
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
  });
}

export function setUser(userId: string, email?: string): void {
  Sentry.setUser({
    id: userId,
    email,
  });
}

export function clearUser(): void {
  Sentry.setUser(null);
}

export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

export function setContext(name: string, context: Record<string, any>): void {
  Sentry.setContext(name, context);
}

export function logInfo(message: string, context?: Record<string, any>): void {
  console.log(`[info] ${message}`, context ? JSON.stringify(context) : "");

  Sentry.withScope((scope) => {
    scope.setLevel("info");
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureMessage(message);
  });
}

export function logError(
  error: Error | string,
  context?: Record<string, any>,
): void {
  const errorMessage = typeof error === "string" ? error : error.message;
  const errorStack = typeof error === "string" ? undefined : error.stack;

  console.error(
    `[error] ${errorMessage}`,
    context ? JSON.stringify(context) : "",
  );
  console.error(errorStack || "");

  Sentry.withScope((scope) => {
    scope.setLevel("error");
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    if (errorStack) {
      scope.setExtra("stacktrace", errorStack);
    }
    Sentry.captureException(error);
  });
}

export function getTracer(name: string = "historian") {
  return trace.getTracer(name);
}

export function startSpan(
  name: string,
  options?: {
    kind?: SpanKind;
    attributes?: Record<string, string | number | boolean>;
  },
): Span | undefined {
  const tracer = getTracer();
  if (!tracer) return undefined;

  return tracer.startSpan(name, {
    kind: options?.kind,
    attributes: options?.attributes,
  }) as Span;
}

export function shutdownObservability(): Promise<void> {
  return new Promise(async (resolve) => {
    console.log("[observability] Shutting down...");

    if (posthog) {
      await posthog.shutdown();
      console.log("[observability] PostHog flushed");
    }

    if (sdk) {
      await sdk.shutdown();
      console.log("[observability] OpenTelemetry shutdown");
    }

    isInitialized = false;
    resolve();
  });
}

export { Sentry, trace, SpanStatusCode, SpanKind };
