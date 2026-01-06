const EXTENSION_CONFIG = {
  syncInterval: 5000,
  maxBatchSize: 50,
  excludedDomains: [
    "chrome://",
    "chrome-extension://",
    "moz-extension://",
    "safari-extension://",
    "about:",
    "edge://",
    "opera://",
  ],
};

interface HistoryVisit {
  id: string;
  url: string;
  title: string;
  visitTime: string;
  referrer: string;
  domain: string;
  metadata?: PageMetadata;
  localTimestamp: number;
}

interface PageMetadata {
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
}

interface RuntimeMessage {
  type:
    | "GET_STATUS"
    | "SYNC_NOW"
    | "CLEAR_PENDING"
    | "SET_CONFIG"
    | "GET_PENDING";
  payload?: {
    apiKey?: string;
    serverUrl?: string;
    enabled?: boolean;
  };
}

interface SyncResponse {
  imported: number;
  processedIds?: string[];
}

interface StorageData {
  apiKey?: string;
  serverUrl?: string;
  enabled?: boolean;
  pendingVisits?: HistoryVisit[];
  lastSyncTime?: number;
  lastSyncedCount?: number;
}

let syncTimer: ReturnType<typeof setInterval> | null = null;
let apiKey: string | null = null;
let serverUrl: string | null = null;

async function loadConfig(): Promise<boolean> {
  const stored = (await chrome.storage.local.get([
    "apiKey",
    "serverUrl",
    "enabled",
  ])) as StorageData;
  apiKey = stored.apiKey ?? null;
  serverUrl = stored.serverUrl ?? null;
  return stored.enabled !== false;
}

function generateVisitId(
  visit: Omit<HistoryVisit, "id" | "localTimestamp">,
): string {
  const data = `${visit.url}|${visit.title}|${visit.visitTime}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `ext_${Math.abs(hash).toString(36)}_${Date.now()}`;
}

async function saveVisit(
  visit: Omit<HistoryVisit, "id" | "localTimestamp">,
): Promise<HistoryVisit> {
  const visitWithId: HistoryVisit = {
    ...visit,
    id: generateVisitId(visit),
    localTimestamp: Date.now(),
  };

  const stored = (await chrome.storage.local.get([
    "pendingVisits",
  ])) as StorageData;
  const pending: HistoryVisit[] = stored.pendingVisits ?? [];
  pending.push(visitWithId);

  await chrome.storage.local.set({
    pendingVisits: pending.slice(-EXTENSION_CONFIG.maxBatchSize),
  });

  return visitWithId;
}

async function syncWithServer(): Promise<void> {
  if (!apiKey || !serverUrl) return;

  const stored = (await chrome.storage.local.get([
    "pendingVisits",
  ])) as StorageData;
  const visits: HistoryVisit[] = stored.pendingVisits ?? [];

  if (visits.length === 0) return;

  try {
    const response = await fetch(`${serverUrl}/api/extension/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ visits }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Sync failed:", error);
      if (response.status === 401) {
        await chrome.storage.local.set({ apiKey: null });
        apiKey = null;
        stopSync();
      }
      return;
    }

    const result: SyncResponse = await response.json();

    if (result.imported > 0) {
      const processedIds = new Set(
        result.processedIds ?? visits.map((v) => v.id),
      );
      const remaining = visits.filter((v) => !processedIds.has(v.id));
      const syncedData = (await chrome.storage.local.get(
        "lastSyncedCount",
      )) as StorageData;
      await chrome.storage.local.set({
        pendingVisits: remaining,
        lastSyncTime: Date.now(),
        lastSyncedCount:
          ((syncedData.lastSyncedCount as number) ?? 0) + result.imported,
      });
    }
  } catch (error) {
    console.error("Sync error:", error);
  }
}

async function handleNavigation(details: {
  tabId: number;
  url: string;
}): Promise<void> {
  const isEnabled = await loadConfig();
  if (!isEnabled || !apiKey || !serverUrl) return;

  if (
    EXTENSION_CONFIG.excludedDomains.some((domain) =>
      details.url.startsWith(domain),
    )
  ) {
    return;
  }

  const tab = await chrome.tabs.get(details.tabId);
  if (!tab || !tab.url) return;

  const visit = {
    url: tab.url,
    title: tab.title ?? "",
    visitTime: new Date().toISOString(),
    referrer: "link",
    domain: new URL(tab.url).hostname,
  };

  await saveVisit(visit);
  await updateBadge();
}

async function updateBadge(): Promise<void> {
  const stored = (await chrome.storage.local.get([
    "pendingVisits",
  ])) as StorageData;
  const count = (stored.pendingVisits ?? []).length;

  await chrome.action.setBadgeText({
    text: count > 0 ? count.toString() : "",
  });

  await chrome.action.setBadgeBackgroundColor({
    color: count > 0 ? "#22c55e" : "#666666",
  });
}

function startSync(): void {
  if (syncTimer) return;
  syncTimer = setInterval(syncWithServer, EXTENSION_CONFIG.syncInterval);
  syncWithServer();
}

function stopSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

async function handleMessage(
  message: RuntimeMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): Promise<boolean> {
  switch (message.type) {
    case "GET_STATUS": {
      const stored = (await chrome.storage.local.get([
        "apiKey",
        "serverUrl",
        "enabled",
        "pendingVisits",
        "lastSyncTime",
        "lastSyncedCount",
      ])) as StorageData;
      sendResponse({
        isConfigured: !!(stored.apiKey && stored.serverUrl),
        isEnabled: stored.enabled !== false,
        pendingCount: (stored.pendingVisits ?? []).length,
        lastSyncTime: stored.lastSyncTime,
        totalTracked: (stored.lastSyncedCount as number) ?? 0,
      });
      break;
    }

    case "SYNC_NOW":
      await syncWithServer();
      sendResponse({ success: true });
      break;

    case "CLEAR_PENDING":
      await chrome.storage.local.set({ pendingVisits: [] });
      await updateBadge();
      sendResponse({ success: true });
      break;

    case "SET_CONFIG": {
      await chrome.storage.local.set({
        apiKey: message.payload?.apiKey ?? "",
        serverUrl: message.payload?.serverUrl ?? "",
        enabled: message.payload?.enabled ?? true,
      });
      apiKey = message.payload?.apiKey ?? null;
      serverUrl = message.payload?.serverUrl ?? null;

      if (message.payload?.enabled && apiKey && serverUrl) {
        startSync();
      } else {
        stopSync();
      }
      await updateBadge();
      sendResponse({ success: true });
      break;
    }

    case "GET_PENDING": {
      const pending = (await chrome.storage.local.get([
        "pendingVisits",
      ])) as StorageData;
      sendResponse({ visits: pending.pendingVisits ?? [] });
      break;
    }
  }

  return true;
}

async function handleContentMessage(
  message: {
    type: string;
    url: string;
    title?: string;
    visitTime?: string;
    referrer?: string;
    metadata?: PageMetadata;
  },
  sender: chrome.runtime.MessageSender,
): Promise<void> {
  if (message.type === "PAGE_DATA") {
    const isEnabled = await loadConfig();
    if (!isEnabled || !apiKey || !serverUrl) return;

    if (sender.tab?.id) {
      const visit = {
        url: message.url,
        title: message.title ?? "",
        visitTime: message.visitTime ?? new Date().toISOString(),
        referrer: message.referrer ?? "content_script",
        domain: new URL(message.url).hostname,
        metadata: message.metadata,
      };

      await saveVisit(visit);
      await updateBadge();
    }
  }
}

async function init(): Promise<void> {
  const isEnabled = await loadConfig();

  chrome.webNavigation.onCommitted.addListener(handleNavigation);
  chrome.runtime.onMessage.addListener(handleContentMessage);
  chrome.runtime.onMessage.addListener(handleMessage);

  await updateBadge();

  if (isEnabled && apiKey && serverUrl) {
    startSync();
  }

  console.log("Historian extension initialized");
}

init();
