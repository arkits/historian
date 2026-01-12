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
  openOptions: document.getElementById("openOptions"),
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

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
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

async function loadStatus() {
  try {
    const response = (await chrome.runtime.sendMessage({
      type: "GET_STATUS",
    })) as StatusResponse;

    if (response.isConfigured) {
      elements.setupView?.classList.add("hidden");
      elements.mainView?.classList.remove("hidden");

      if (elements.trackingToggle) {
        elements.trackingToggle.checked = response.isEnabled;
      }

      if (elements.pendingCount) {
        elements.pendingCount.textContent = response.pendingCount.toString();
      }

      if (elements.totalSynced) {
        elements.totalSynced.textContent =
          response.totalSynced.toLocaleString();
      }

      if (elements.lastSync) {
        elements.lastSync.textContent = formatTime(response.lastSyncTime);
      }

      if (elements.statusText) {
        elements.statusText.textContent = response.isEnabled
          ? "Active"
          : "Paused";
        elements.statusText.style.color = response.isEnabled
          ? "oklch(0.6 0.15 160)"
          : "oklch(0.65 0.04 50)";
      }

      renderRecentVisits(response.recentVisits || []);
    } else {
      elements.setupView?.classList.remove("hidden");
      elements.mainView?.classList.add("hidden");
    }
  } catch (error) {
    console.error("Failed to load status:", error);
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
    await chrome.runtime.sendMessage({
      type: "SET_CONFIG",
      payload: {
        serverUrl,
        apiKey,
        enabled: true,
      },
    });
    showMessage("Configuration saved!", "success");
    await loadStatus();
  } catch (error) {
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
    await chrome.runtime.sendMessage({
      type: "SET_CONFIG",
      payload: {
        serverUrl: "",
        apiKey: "",
        enabled,
      },
    });
    await loadStatus();
    showMessage(enabled ? "Tracking enabled" : "Tracking paused", "info");
  } catch (error) {
    showMessage("Failed to update tracking", "error");
  }
}

async function syncNow() {
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
    const result = (await chrome.runtime.sendMessage({ type: "SYNC_NOW" })) as {
      success: boolean;
      synced?: number;
    };
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
      showMessage("Sync failed", "error");
    }
  } catch (error) {
    showMessage("Sync failed", "error");
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

function openOptions(e: Event) {
  e.preventDefault();
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"), "_blank");
  }
}

elements.saveBtn?.addEventListener("click", saveConfig);
elements.trackingToggle?.addEventListener("change", (e) =>
  toggleTracking((e.target as HTMLInputElement).checked),
);
elements.syncBtn?.addEventListener("click", syncNow);
elements.openOptions?.addEventListener("click", openOptions);

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
