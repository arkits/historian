interface StatusResponse {
  isConfigured: boolean;
  isEnabled: boolean;
  pendingCount: number;
  totalSynced: number;
  lastSyncTime: number | null;
  recentVisits: Visit[];
}

interface Visit {
  id: string;
  url: string;
  title: string;
  domain: string;
  visitTime: string;
}

const DEFAULT_SERVER_URL = "https://historian-api.archit.xyz";

declare const browser: typeof chrome;

const isFirefox =
  typeof navigator !== "undefined" && /Firefox/i.test(navigator.userAgent);

const extApi = isFirefox && typeof browser !== "undefined" ? browser : chrome;

function sendMessage(message: Record<string, unknown>): Promise<unknown> {
  if (isFirefox) {
    return extApi.runtime.sendMessage(message);
  }
  return new Promise((resolve, reject) => {
    extApi.runtime.sendMessage(message, (response: unknown) => {
      if (extApi.runtime.lastError) {
        reject(new Error(extApi.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

async function getStorage(
  keys: string | string[],
): Promise<Record<string, unknown>> {
  if (isFirefox) {
    return extApi.storage.local.get(keys);
  }
  return new Promise((resolve, reject) => {
    extApi.storage.local.get(keys, (result: Record<string, unknown>) => {
      if (extApi.runtime.lastError) {
        reject(new Error(extApi.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
}

async function setStorage(items: Record<string, unknown>): Promise<void> {
  if (isFirefox) {
    return extApi.storage.local.set(items);
  }
  return new Promise((resolve, reject) => {
    extApi.storage.local.set(items, () => {
      if (extApi.runtime.lastError) {
        reject(new Error(extApi.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

const elements = {
  setupView: document.getElementById("setupView"),
  mainView: document.getElementById("mainView"),
  serverUrl: document.getElementById("serverUrl") as HTMLInputElement | null,
  apiKey: document.getElementById("apiKey") as HTMLInputElement | null,
  saveBtn: document.getElementById("saveBtn") as HTMLButtonElement | null,
  trackingToggle: document.getElementById(
    "trackingToggle",
  ) as HTMLInputElement | null,
  syncBtn: document.getElementById("syncBtn") as HTMLButtonElement | null,
  pendingCount: document.getElementById("pendingCount"),
  totalSynced: document.getElementById("totalSynced"),
  lastSync: document.getElementById("lastSync"),
  statusText: document.getElementById("statusText"),
  recentVisits: document.getElementById("recentVisits"),
  message: document.getElementById("message"),
  dashboardLink: document.getElementById(
    "dashboardLink",
  ) as HTMLHeadingElement | null,
};

function showMessage(text: string, type: "success" | "error" | "info") {
  if (!elements.message) return;
  elements.message.textContent = text;
  elements.message.className = `message ${type}`;
  elements.message.classList.remove("hidden");
  setTimeout(() => {
    elements.message?.classList.add("hidden");
  }, 4000);
}

function formatTime(timestamp: number | null): string {
  if (!timestamp) return "Never synced";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function formatVisitTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function renderRecentVisits(visits: Visit[]) {
  if (!elements.recentVisits) return;

  if (visits.length === 0) {
    elements.recentVisits.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <p>No recent visits</p>
      </div>
    `;
    return;
  }

  elements.recentVisits.innerHTML = visits
    .slice(0, 10)
    .map(
      (visit) => `
    <div class="recent-item">
      <div class="recent-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div class="recent-content">
        <div class="recent-title">${escapeHtml(visit.title || "Untitled")}</div>
        <div class="recent-domain">${escapeHtml(visit.domain)}</div>
      </div>
      <div class="recent-time">${formatVisitTime(visit.visitTime)}</div>
    </div>
  `,
    )
    .join("");
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showSetupView() {
  elements.setupView?.classList.remove("hidden");
  elements.mainView?.classList.add("hidden");
}

function showMainView() {
  elements.setupView?.classList.add("hidden");
  elements.mainView?.classList.remove("hidden");
}

function updateMainView(response: StatusResponse) {
  if (elements.trackingToggle) {
    elements.trackingToggle.checked = response.isEnabled ?? false;
  }

  if (elements.pendingCount) {
    elements.pendingCount.textContent = (response.pendingCount ?? 0).toString();
  }

  if (elements.totalSynced) {
    elements.totalSynced.textContent = (
      response.totalSynced ?? 0
    ).toLocaleString();
  }

  if (elements.lastSync) {
    elements.lastSync.textContent = formatTime(response.lastSyncTime ?? null);
  }

  if (elements.statusText) {
    const isEnabled = response.isEnabled ?? false;
    elements.statusText.textContent = isEnabled ? "Active" : "Paused";
    elements.statusText.style.color = isEnabled
      ? "oklch(0.6 0.15 160)"
      : "oklch(0.65 0.04 50)";
  }

  renderRecentVisits(response.recentVisits || []);
}

async function loadStatus() {
  console.log("[Popup] loadStatus called");
  try {
    const response = (await sendMessage({
      type: "GET_STATUS",
    })) as StatusResponse | undefined;
    console.log("[Popup] GET_STATUS response:", response);

    if (!response || typeof response !== "object") {
      console.log(
        "[Popup] Message passing failed, reading from storage directly",
      );
      const stored = (await getStorage([
        "apiKey",
        "serverUrl",
        "enabled",
        "pendingVisits",
        "recentVisits",
        "lastSyncTime",
        "totalSynced",
      ])) as {
        apiKey?: string | null;
        serverUrl?: string | null;
        enabled?: boolean;
        pendingVisits?: Visit[];
        recentVisits?: Visit[];
        lastSyncTime?: number;
        totalSynced?: number;
      };

      const isConfigured = !!(stored.apiKey && stored.serverUrl);
      console.log("[Popup] Direct storage check - isConfigured:", isConfigured);

      if (isConfigured) {
        const recentVisits = (stored.recentVisits || []).slice(0, 10);
        const statusResponse: StatusResponse = {
          isConfigured: true,
          isEnabled: stored.enabled !== false,
          pendingCount: (stored.pendingVisits || []).length,
          lastSyncTime: stored.lastSyncTime || null,
          totalSynced: stored.totalSynced || 0,
          recentVisits,
        };
        showMainView();
        updateMainView(statusResponse);
      } else {
        showSetupView();
        await loadDefaultServerUrl();
      }
      return;
    }

    console.log("[Popup] isConfigured:", response.isConfigured);
    if (response.isConfigured) {
      console.log("[Popup] Showing main view");
      showMainView();
      updateMainView(response);
    } else {
      console.log("[Popup] Showing setup view");
      showSetupView();
      await loadDefaultServerUrl();
    }
  } catch (error) {
    console.error("Failed to load status:", error);
    showSetupView();
  }
}

async function loadDefaultServerUrl() {
  const stored = (await getStorage(["serverUrl"])) as {
    serverUrl?: string;
  };
  if (elements.serverUrl) {
    elements.serverUrl.value = stored.serverUrl || DEFAULT_SERVER_URL;
  }
}

async function saveConfig() {
  const serverUrl = elements.serverUrl?.value.trim() ?? "";
  const apiKey = elements.apiKey?.value.trim() ?? "";

  if (!serverUrl) {
    showMessage("Please enter the server URL", "error");
    return;
  }

  if (!apiKey) {
    showMessage("Please enter your API key", "error");
    return;
  }

  try {
    new URL(serverUrl);
  } catch {
    showMessage("Please enter a valid URL", "error");
    return;
  }

  if (elements.saveBtn) {
    elements.saveBtn.disabled = true;
    elements.saveBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Saving...
    `;
  }

  try {
    console.log("[Popup] Sending SET_CONFIG message");
    const result = await sendMessage({
      type: "SET_CONFIG",
      payload: {
        serverUrl,
        apiKey,
        enabled: true,
      },
    });
    console.log("[Popup] SET_CONFIG result:", result);
    showMessage("Configuration saved!", "success");
    await loadStatus();
  } catch (error) {
    console.error("[Popup] SET_CONFIG error:", error);
    showMessage("Failed to save configuration", "error");
  } finally {
    if (elements.saveBtn) {
      elements.saveBtn.disabled = false;
      elements.saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Save Configuration
      `;
    }
  }
}

async function toggleTracking(enabled: boolean) {
  try {
    await sendMessage({
      type: "SET_CONFIG",
      payload: {
        serverUrl: "",
        apiKey: "",
        enabled,
      },
    });
    await loadStatus();
    showMessage(enabled ? "Tracking enabled" : "Tracking paused", "info");
  } catch {
    showMessage("Failed to update tracking", "error");
  }
}

async function syncNow() {
  console.log("Sync button clicked!");
  if (elements.syncBtn) {
    elements.syncBtn.disabled = true;
    elements.syncBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span>Syncing...</span>
    `;
  }

  try {
    const result = (await sendMessage({
      type: "SYNC_NOW",
    })) as
      | {
          success: boolean;
          synced?: number;
          error?: string;
        }
      | undefined;
    console.log("Sync result:", result);

    if (!result || typeof result !== "object") {
      console.log(
        "[Popup] Sync message passed but no response, checking pending visits",
      );
      const stored = (await getStorage(["pendingVisits"])) as {
        pendingVisits?: Visit[];
      };
      if ((stored.pendingVisits || []).length === 0) {
        showMessage("Already up to date", "info");
      } else {
        showMessage("Sync in progress...", "info");
      }
      await loadStatus();
      return;
    }

    if (result.success) {
      const count = result.synced || 0;
      if (count > 0) {
        showMessage(
          `Synced ${count} visit${count !== 1 ? "s" : ""}!`,
          "success",
        );
      } else {
        showMessage("Already up to date", "info");
      }
      await loadStatus();
    } else {
      console.error("Sync error:", result.error);
      showMessage(`Sync failed: ${result.error || "Unknown error"}`, "error");
    }
  } catch (error) {
    console.error("Sync exception:", error);
    showMessage("Sync failed: Connection error", "error");
  } finally {
    if (elements.syncBtn) {
      elements.syncBtn.disabled = false;
      elements.syncBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        <span>Sync Now</span>
      `;
    }
  }
}

elements.saveBtn?.addEventListener("click", saveConfig);
elements.trackingToggle?.addEventListener("change", (e) =>
  toggleTracking((e.target as HTMLInputElement).checked),
);
elements.syncBtn?.addEventListener("click", syncNow);
elements.dashboardLink?.addEventListener("click", () => {
  extApi.tabs.create({ url: "https://historian.archit.xyz/dashboard" });
});

loadStatus();

const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);
