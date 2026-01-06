export interface Context {
  headers: Headers;
  traceSpan?: {
    spanId: string;
    traceId: string;
    isRemote: boolean;
  };
}

export async function createContext(headers: Headers): Promise<Context> {
  const traceparent = headers.get("traceparent");
  const tracestate = headers.get("tracestate");

  const context: Context = { headers };

  if (traceparent || tracestate) {
    context.traceSpan = {
      spanId: headers.get("x-span-id") || "",
      traceId: headers.get("x-trace-id") || "",
      isRemote: headers.get("x-trace-sampled") === "true",
    };
  }

  return context;
}
