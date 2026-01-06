"use strict";
const elements = {
    setupView: document.getElementById("setupView"),
    mainView: document.getElementById("mainView"),
    serverUrl: document.getElementById("serverUrl"),
    apiKey: document.getElementById("apiKey"),
    saveBtn: document.getElementById("saveBtn"),
    trackingToggle: document.getElementById("trackingToggle"),
    syncBtn: document.getElementById("syncBtn"),
    clearBtn: document.getElementById("clearBtn"),
    settingsBtn: document.getElementById("settingsBtn"),
    statusText: document.getElementById("statusText"),
    statusDot: document.getElementById("statusDot"),
    pendingCount: document.getElementById("pendingCount"),
    totalTracked: document.getElementById("totalTracked"),
    lastSync: document.getElementById("lastSync"),
    error: document.getElementById("error"),
    success: document.getElementById("success"),
};
function showError(msg) {
    const errorEl = elements.error;
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.add("visible");
        setTimeout(() => errorEl.classList.remove("visible"), 5000);
    }
}
function showSuccess(msg) {
    const successEl = elements.success;
    if (successEl) {
        successEl.textContent = msg;
        successEl.classList.add("visible");
        setTimeout(() => successEl.classList.remove("visible"), 3000);
    }
}
function formatTime(timestamp) {
    if (!timestamp)
        return "-";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000)
        return "Just now";
    if (diff < 3600000)
        return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)
        return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
}
async function loadStatus() {
    try {
        const response = (await chrome.runtime.sendMessage({
            type: "GET_STATUS",
        }));
        if (response.isConfigured) {
            elements.setupView?.classList.add("hidden");
            elements.mainView?.classList.remove("hidden");
            if (elements.trackingToggle)
                elements.trackingToggle.checked = response.isEnabled;
            if (elements.pendingCount)
                elements.pendingCount.textContent = response.pendingCount.toString();
            if (elements.totalTracked)
                elements.totalTracked.textContent =
                    response.totalTracked.toLocaleString();
            if (elements.lastSync)
                elements.lastSync.textContent = formatTime(response.lastSyncTime);
            if (response.isEnabled) {
                if (elements.statusText)
                    elements.statusText.textContent = "Active";
                elements.statusDot?.classList.add("active");
            }
            else {
                if (elements.statusText)
                    elements.statusText.textContent = "Paused";
                elements.statusDot?.classList.remove("active");
            }
        }
        else {
            elements.setupView?.classList.remove("hidden");
            elements.mainView?.classList.add("hidden");
        }
    }
    catch (error) {
        console.error("Failed to load status:", error);
    }
}
async function saveConfig() {
    const serverUrl = elements.serverUrl?.value.trim() ?? "";
    const apiKey = elements.apiKey?.value.trim() ?? "";
    if (!serverUrl) {
        showError("Please enter the server URL");
        return;
    }
    if (!apiKey) {
        showError("Please enter your API key");
        return;
    }
    try {
        new URL(serverUrl);
    }
    catch {
        showError("Please enter a valid URL");
        return;
    }
    if (elements.saveBtn) {
        elements.saveBtn.disabled = true;
        elements.saveBtn.textContent = "Saving...";
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
        showSuccess("Configuration saved!");
        await loadStatus();
    }
    catch (error) {
        showError("Failed to save configuration");
    }
    finally {
        if (elements.saveBtn) {
            elements.saveBtn.disabled = false;
            elements.saveBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Save Configuration
      `;
        }
    }
}
async function toggleTracking(enabled) {
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
    }
    catch (error) {
        showError("Failed to update tracking");
    }
}
async function syncNow() {
    if (elements.syncBtn) {
        elements.syncBtn.disabled = true;
        elements.syncBtn.textContent = "Syncing...";
    }
    try {
        await chrome.runtime.sendMessage({ type: "SYNC_NOW" });
        showSuccess("Sync complete!");
        await loadStatus();
    }
    catch (error) {
        showError("Sync failed");
    }
    finally {
        if (elements.syncBtn) {
            elements.syncBtn.disabled = false;
            elements.syncBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Sync Now
      `;
        }
    }
}
async function clearPending() {
    try {
        await chrome.runtime.sendMessage({ type: "CLEAR_PENDING" });
        showSuccess("Pending visits cleared");
        await loadStatus();
    }
    catch (error) {
        showError("Failed to clear");
    }
}
function showSettings() {
    elements.setupView?.classList.remove("hidden");
    elements.mainView?.classList.add("hidden");
}
elements.saveBtn?.addEventListener("click", saveConfig);
elements.trackingToggle?.addEventListener("change", (e) => toggleTracking(e.target.checked));
elements.syncBtn?.addEventListener("click", syncNow);
elements.clearBtn?.addEventListener("click", clearPending);
elements.settingsBtn?.addEventListener("click", showSettings);
loadStatus();
