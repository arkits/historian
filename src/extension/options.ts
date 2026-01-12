interface Config {
  serverUrl: string;
  apiKey: string;
  enabled: boolean;
  trackContent: boolean;
  autoSync: boolean;
  syncInterval: number;
  batchSize: number;
  excludedDomains: string[];
}

const elements = {
  serverUrl: document.getElementById("serverUrl") as HTMLInputElement | null,
  apiKey: document.getElementById("apiKey") as HTMLInputElement | null,
  saveBtn: document.getElementById("saveBtn") as HTMLButtonElement | null,
  trackingToggle: document.getElementById("trackingToggle") as HTMLInputElement | null,
  contentToggle: document.getElementById("contentToggle") as HTMLInputElement | null,
  autoSyncToggle: document.getElementById("autoSyncToggle") as HTMLInputElement | null,
  syncInterval: document.getElementById("syncInterval") as HTMLInputElement | null,
  batchSize: document.getElementById("batchSize") as HTMLInputElement | null,
  excludedDomains: document.getElementById("excludedDomains") as HTMLTextAreaElement | null,
  saveSyncBtn: document.getElementById("saveSyncBtn") as HTMLButtonElement | null,
  saveDomainsBtn: document.getElementById("saveDomainsBtn") as HTMLButtonElement | null,
  clearPendingBtn: document.getElementById("clearPendingBtn") as HTMLButtonElement | null,
  resetBtn: document.getElementById("resetBtn") as HTMLButtonElement | null,
  message: document.getElementById("message"),
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

async function loadConfig() {
  try {
    const stored = (await chrome.storage.local.get([
      "serverUrl",
      "apiKey",
      "enabled",
      "trackContent",
      "autoSync",
      "syncInterval",
      "batchSize",
      "excludedDomains",
    ])) as Partial<Config>;

    if (elements.serverUrl) elements.serverUrl.value = stored.serverUrl || "";
    if (elements.apiKey) elements.apiKey.value = stored.apiKey || "";
    if (elements.trackingToggle) elements.trackingToggle.checked = stored.enabled !== false;
    if (elements.contentToggle) elements.contentToggle.checked = stored.trackContent !== false;
    if (elements.autoSyncToggle) elements.autoSyncToggle.checked = stored.autoSync !== false;
    if (elements.syncInterval) elements.syncInterval.value = (stored.syncInterval || 30).toString();
    if (elements.batchSize) elements.batchSize.value = (stored.batchSize || 50).toString();
    if (elements.excludedDomains) {
      elements.excludedDomains.value = (stored.excludedDomains || getDefaultExcludedDomains()).join("\n");
    }
  } catch (error) {
    console.error("Failed to load config:", error);
  }
}

function getDefaultExcludedDomains(): string[] {
  return [
    "chrome://",
    "chrome-extension://",
    "moz-extension://",
    "safari-extension://",
    "about:",
    "edge://",
    "opera://",
  ];
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
        enabled: elements.trackingToggle?.checked ?? true,
        trackContent: elements.contentToggle?.checked ?? true,
        autoSync: elements.autoSyncToggle?.checked ?? true,
      },
    });
    showMessage("Configuration saved!", "success");
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

async function saveSyncSettings() {
  const syncInterval = parseInt(elements.syncInterval?.value ?? "30", 10);
  const batchSize = parseInt(elements.batchSize?.value ?? "50", 10);

  if (syncInterval < 5 || syncInterval > 300) {
    showMessage("Sync interval must be between 5 and 300 seconds", "error");
    return;
  }

  if (batchSize < 10 || batchSize > 200) {
    showMessage("Batch size must be between 10 and 200", "error");
    return;
  }

  if (elements.saveSyncBtn) {
    elements.saveSyncBtn.disabled = true;
    elements.saveSyncBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Syncing...
    `;
  }

  try {
    await chrome.runtime.sendMessage({
      type: "SET_SYNC_CONFIG",
      payload: {
        syncInterval: syncInterval * 1000,
        batchSize,
      },
    });
    showMessage("Sync settings saved!", "success");
    await chrome.runtime.sendMessage({ type: "SYNC_NOW" });
  } catch (error) {
    showMessage("Failed to save sync settings", "error");
  } finally {
    if (elements.saveSyncBtn) {
      elements.saveSyncBtn.disabled = false;
      elements.saveSyncBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        Save & Sync Now
      `;
    }
  }
}

async function saveExcludedDomains() {
  const text = elements.excludedDomains?.value ?? "";
  const domains = text
    .split("\n")
    .map((d) => d.trim())
    .filter((d) => d.length > 0);

  if (elements.saveDomainsBtn) {
    elements.saveDomainsBtn.disabled = true;
    elements.saveDomainsBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Saving...
    `;
  }

  try {
    await chrome.storage.local.set({ excludedDomains: domains });
    showMessage("Excluded domains saved!", "success");
  } catch (error) {
    showMessage("Failed to save excluded domains", "error");
  } finally {
    if (elements.saveDomainsBtn) {
      elements.saveDomainsBtn.disabled = false;
      elements.saveDomainsBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Save Exclusions
      `;
    }
  }
}

async function clearPending() {
  if (!confirm("Are you sure you want to clear all pending visits? This cannot be undone.")) {
    return;
  }

  if (elements.clearPendingBtn) {
    elements.clearPendingBtn.disabled = true;
    elements.clearPendingBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Clearing...
    `;
  }

  try {
    await chrome.runtime.sendMessage({ type: "CLEAR_PENDING" });
    showMessage("Pending visits cleared!", "success");
  } catch (error) {
    showMessage("Failed to clear pending visits", "error");
  } finally {
    if (elements.clearPendingBtn) {
      elements.clearPendingBtn.disabled = false;
      elements.clearPendingBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Clear Pending Visits
      `;
    }
  }
}

async function resetAll() {
  if (!confirm("Are you sure you want to reset all settings? This will clear your configuration and all data.")) {
    return;
  }

  if (elements.resetBtn) {
    elements.resetBtn.disabled = true;
    elements.resetBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Resetting...
    `;
  }

  try {
    await chrome.storage.local.clear();
    showMessage("All settings reset!", "success");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    showMessage("Failed to reset settings", "error");
  } finally {
    if (elements.resetBtn) {
      elements.resetBtn.disabled = false;
      elements.resetBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2.5 2v6h6M21.5 22v-6h-6" />
          <path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2" />
        </svg>
        Reset All Settings
      `;
    }
  }
}

elements.saveBtn?.addEventListener("click", saveConfig);
elements.saveSyncBtn?.addEventListener("click", saveSyncSettings);
elements.saveDomainsBtn?.addEventListener("click", saveExcludedDomains);
elements.clearPendingBtn?.addEventListener("click", clearPending);
elements.resetBtn?.addEventListener("click", resetAll);

loadConfig();

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
