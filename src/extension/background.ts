interface Config {
  apiKey: string | null;
  serverUrl: string | null;
  enabled: boolean;
  trackContent: boolean;
  autoSync: boolean;
  syncInterval: number;
  batchSize: number;
  excludedDomains: string[];
}

interface Visit {
  id: string;
  url: string;
  title: string;
  domain: string;
  visitTime: string;
  referrer?: string;
  metadata?: Record<string, string>;
  content?: string;
  visitDuration?: number;
  localTimestamp: number;
}

const DEFAULT_CONFIG: Config = {
  apiKey: null,
  serverUrl: null,
  enabled: true,
  trackContent: true,
  autoSync: true,
  syncInterval: 30000,
  batchSize: 50,
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

let config: Config = { ...DEFAULT_CONFIG };
let syncTimer: ReturnType<typeof setInterval> | null = null;

async function loadConfig(): Promise<boolean> {
  const stored = (await chrome.storage.local.get([
    "apiKey",
    "serverUrl",
    "enabled",
    "trackContent",
    "autoSync",
    "syncInterval",
    "batchSize",
    "excludedDomains",
  ])) as Partial<Config>;

  config = {
    ...DEFAULT_CONFIG,
    ...stored,
  };

  return config.enabled !== false;
}

function generateVisitId(visit: Visit): string {
  const data = `${visit.url}|${visit.title}|${visit.visitTime}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `ext_${Math.abs(hash).toString(36)}_${Date.now()}`;
}

async function saveVisit(visit: Omit<Visit, "id" | "localTimestamp">): Promise<Visit> {
  const visitWithId: Visit = {
    ...visit,
    id: generateVisitId(visit as Visit),
    localTimestamp: Date.now(),
  };

  const stored = (await chrome.storage.local.get(["pendingVisits"])) as { pendingVisits?: Visit[] };
  const pending = stored.pendingVisits || [];
  pending.push(visitWithId);

  await chrome.storage.local.set({
    pendingVisits: pending.slice(-config.batchSize),
  });

  return visitWithId;
}

async function syncWithServer(): Promise<{ success: boolean; synced?: number; error?: string }> {
  if (!config.apiKey || !config.serverUrl) {
    return { success: false, error: "Not configured" };
  }

  const stored = (await chrome.storage.local.get(["pendingVisits"])) as { pendingVisits?: Visit[] };
  const visits = stored.pendingVisits || [];

  if (visits.length === 0) {
    return { success: true, synced: 0 };
  }

  try {
    const response = await fetch(`${config.serverUrl}/api/extension/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify({ visits }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Sync failed:", errorText);

      if (response.status === 401) {
        await chrome.storage.local.set({ apiKey: null });
        config.apiKey = null;
        stopSync();
        return { success: false, error: "Unauthorized" };
      }

      return { success: false, error: `HTTP ${response.status}` };
    }

    const result = await response.json();

    if (result.imported > 0) {
      const processedIds = new Set(result.processedIds || visits.map((v) => v.id));
      const remaining = visits.filter((v) => !processedIds.has(v.id));

      const syncedData = (await chrome.storage.local.get("totalSynced")) as { totalSynced?: number };
      const currentTotal = syncedData.totalSynced || 0;

      await chrome.storage.local.set({
        pendingVisits: remaining,
        lastSyncTime: Date.now(),
        totalSynced: currentTotal + result.imported,
      });

      return { success: true, synced: result.imported };
    }

    return { success: true, synced: 0 };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, error: "Network error" };
  }
}

async function handleNavigation(details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
  const isEnabled = await loadConfig();
  if (!isEnabled || !config.apiKey || !config.serverUrl) return;

  if (config.excludedDomains.some((domain) => details.url.startsWith(domain))) return;

  const tab = await chrome.tabs.get(details.tabId);
  if (!tab || !tab.url) return;

  const url = new URL(tab.url);
  const visit = {
    url: tab.url,
    title: tab.title || "",
    visitTime: new Date().toISOString(),
    referrer: "link",
    domain: url.hostname,
  };

  await saveVisit(visit);
  await updateBadge();
}

async function updateBadge() {
  const stored = (await chrome.storage.local.get(["pendingVisits"])) as { pendingVisits?: Visit[] };
  const count = (stored.pendingVisits || []).length;

  await chrome.action.setBadgeText({
    text: count > 0 ? count.toString() : "",
  });

  await chrome.action.setBadgeBackgroundColor({
    color: count > 0 ? "#3b82f6" : "#666666",
  });
}

function startSync() {
  if (syncTimer) return;

  if (config.autoSync) {
    syncTimer = setInterval(async () => {
      const result = await syncWithServer();
      if (!result.success && result.error === "Unauthorized") {
        stopSync();
      }
      await updateBadge();
    }, config.syncInterval);
  }

  syncWithServer();
}

function stopSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

async function handleMessage(
  message: Record<string, unknown>,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
): Promise<boolean> {
  switch (message.type) {
    case "GET_STATUS": {
      const stored = (await chrome.storage.local.get([
        "apiKey",
        "serverUrl",
        "enabled",
        "pendingVisits",
        "lastSyncTime",
        "totalSynced",
      ])) as {
        apiKey?: string | null;
        serverUrl?: string | null;
        enabled?: boolean;
        pendingVisits?: Visit[];
        lastSyncTime?: number;
        totalSynced?: number;
      };

      const pendingVisits = stored.pendingVisits || [];
      const recentVisits = pendingVisits
        .sort((a, b) => new Date(b.visitTime).getTime() - new Date(a.visitTime).getTime())
        .slice(0, 5);

      sendResponse({
        isConfigured: !!(stored.apiKey && stored.serverUrl),
        isEnabled: stored.enabled !== false,
        pendingCount: pendingVisits.length,
        lastSyncTime: stored.lastSyncTime,
        totalSynced: stored.totalSynced || 0,
        recentVisits,
      });
      break;
    }

    case "SYNC_NOW": {
      const result = await syncWithServer();
      await updateBadge();
      sendResponse(result);
      break;
    }

    case "CLEAR_PENDING": {
      await chrome.storage.local.set({ pendingVisits: [] });
      await updateBadge();
      sendResponse({ success: true });
      break;
    }

    case "SET_CONFIG": {
      const payload = message.payload as Partial<Config>;
      
      await chrome.storage.local.set({
        apiKey: payload.apiKey ?? config.apiKey,
        serverUrl: payload.serverUrl ?? config.serverUrl,
        enabled: payload.enabled ?? config.enabled,
        trackContent: payload.trackContent ?? config.trackContent,
        autoSync: payload.autoSync ?? config.autoSync,
      });

      config = { ...config, ...payload };
      
      await loadConfig();

      if (config.enabled && config.apiKey && config.serverUrl) {
        startSync();
      } else {
        stopSync();
      }

      await updateBadge();
      sendResponse({ success: true });
      break;
    }

    case "SET_SYNC_CONFIG": {
      const payload = message.payload as { syncInterval: number; batchSize: number };
      
      await chrome.storage.local.set({
        syncInterval: payload.syncInterval,
        batchSize: payload.batchSize,
      });

      config.syncInterval = payload.syncInterval;
      config.batchSize = payload.batchSize;

      stopSync();
      startSync();

      sendResponse({ success: true });
      break;
    }

    case "GET_PENDING": {
      const pending = (await chrome.storage.local.get(["pendingVisits"])) as { pendingVisits?: Visit[] };
      sendResponse({ visits: pending.pendingVisits || [] });
      break;
    }
  }

  return true;
}

async function handleContentMessage(
  message: Record<string, unknown>,
  sender: chrome.runtime.MessageSender
): Promise<void> {
  if (message.type === "PAGE_DATA") {
    const isEnabled = await loadConfig();
    if (!isEnabled || !config.apiKey || !config.serverUrl) return;

    if (sender.tab?.id) {
      const data = message as {
        url: string;
        title?: string;
        visitTime?: string;
        referrer?: string;
        metadata?: Record<string, string>;
        content?: string;
        visitDuration?: number;
      };

      const url = new URL(data.url);
      const visit = {
        url: data.url,
        title: data.title || "",
        visitTime: data.visitTime || new Date().toISOString(),
        referrer: data.referrer || "content_script",
        domain: url.hostname,
        metadata: config.trackContent ? data.metadata : undefined,
        content: config.trackContent ? data.content : undefined,
        visitDuration: data.visitDuration,
      };

      await saveVisit(visit);
      await updateBadge();
    }
  }
}

async function init() {
  const isEnabled = await loadConfig();

  chrome.webNavigation.onCommitted.addListener(handleNavigation);
  chrome.runtime.onMessage.addListener(handleContentMessage);
  chrome.runtime.onMessage.addListener(handleMessage);

  await updateBadge();

  if (isEnabled && config.apiKey && config.serverUrl) {
    startSync();
  }

  console.log("Historian extension initialized");
}

init();
