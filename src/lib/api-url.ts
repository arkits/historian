export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin === "https://historian.archit.xyz"
      ? "https://historian-api.archit.xyz"
      : "";
  }
  return "";
}

export function getApiUrl(path: string): string {
  const base = getApiBaseUrl();
  return base ? `${base}${path}` : path;
}
