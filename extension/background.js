"use strict";
const EXTENSION_CONFIG = {
    syncInterval: 30000,
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
let syncTimer = null;
let apiKey = null;
let serverUrl = null;
async function loadConfig() {
    const stored = (await chrome.storage.local.get([
        "apiKey",
        "serverUrl",
        "enabled",
    ]));
    apiKey = stored.apiKey ?? null;
    serverUrl = stored.serverUrl ?? null;
    return stored.enabled !== false;
}
function generateVisitId(visit) {
    const data = `${visit.url}|${visit.title}|${visit.visitTime}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return `ext_${Math.abs(hash).toString(36)}_${Date.now()}`;
}
async function saveVisit(visit) {
    const visitWithId = {
        ...visit,
        id: generateVisitId(visit),
        localTimestamp: Date.now(),
    };
    const stored = (await chrome.storage.local.get([
        "pendingVisits",
    ]));
    const pending = stored.pendingVisits ?? [];
    pending.push(visitWithId);
    await chrome.storage.local.set({
        pendingVisits: pending.slice(-EXTENSION_CONFIG.maxBatchSize),
    });
    return visitWithId;
}
async function syncWithServer() {
    if (!apiKey || !serverUrl)
        return;
    const stored = (await chrome.storage.local.get([
        "pendingVisits",
    ]));
    const visits = stored.pendingVisits ?? [];
    if (visits.length === 0)
        return;
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
        const result = await response.json();
        if (result.imported > 0) {
            const processedIds = new Set(result.processedIds ?? visits.map((v) => v.id));
            const remaining = visits.filter((v) => !processedIds.has(v.id));
            const syncedData = (await chrome.storage.local.get("lastSyncedCount"));
            await chrome.storage.local.set({
                pendingVisits: remaining,
                lastSyncTime: Date.now(),
                lastSyncedCount: (syncedData.lastSyncedCount ?? 0) + result.imported,
            });
        }
    }
    catch (error) {
        console.error("Sync error:", error);
    }
}
async function handleNavigation(details) {
    const isEnabled = await loadConfig();
    if (!isEnabled || !apiKey || !serverUrl)
        return;
    if (EXTENSION_CONFIG.excludedDomains.some((domain) => details.url.startsWith(domain))) {
        return;
    }
    const tab = await chrome.tabs.get(details.tabId);
    if (!tab || !tab.url)
        return;
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
async function updateBadge() {
    const stored = (await chrome.storage.local.get([
        "pendingVisits",
    ]));
    const count = (stored.pendingVisits ?? []).length;
    await chrome.action.setBadgeText({
        text: count > 0 ? count.toString() : "",
    });
    await chrome.action.setBadgeBackgroundColor({
        color: count > 0 ? "#22c55e" : "#666666",
    });
}
function startSync() {
    if (syncTimer)
        return;
    syncTimer = setInterval(syncWithServer, EXTENSION_CONFIG.syncInterval);
    syncWithServer();
}
function stopSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}
async function handleMessage(message, _sender, sendResponse) {
    switch (message.type) {
        case "GET_STATUS": {
            const stored = (await chrome.storage.local.get([
                "apiKey",
                "serverUrl",
                "enabled",
                "pendingVisits",
                "lastSyncTime",
                "lastSyncedCount",
            ]));
            sendResponse({
                isConfigured: !!(stored.apiKey && stored.serverUrl),
                isEnabled: stored.enabled !== false,
                pendingCount: (stored.pendingVisits ?? []).length,
                lastSyncTime: stored.lastSyncTime,
                totalTracked: stored.lastSyncedCount ?? 0,
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
            }
            else {
                stopSync();
            }
            await updateBadge();
            sendResponse({ success: true });
            break;
        }
        case "GET_PENDING": {
            const pending = (await chrome.storage.local.get([
                "pendingVisits",
            ]));
            sendResponse({ visits: pending.pendingVisits ?? [] });
            break;
        }
    }
    return true;
}
async function handleContentMessage(message, sender) {
    if (message.type === "PAGE_DATA") {
        const isEnabled = await loadConfig();
        if (!isEnabled || !apiKey || !serverUrl)
            return;
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
async function init() {
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
