# Historian Chrome/Firefox Extension

A browser extension that automatically tracks your web browsing history and syncs it to your Historian server. Works on both Chrome and Firefox.

## Features

- 🔄 **Automatic Sync** - Page visits are automatically synced to your Historian server
- 📊 **Detailed Tracking** - Captures page title, URL, domain, metadata, and content
- 🔒 **Secure** - Uses API key authentication
- ⏱️ **Smart Buffering** - Stores visits locally and syncs in batches
- 🚫 **Privacy-Focused** - Only you have access to your data

## Installation

### Chrome

1. Build the extension:

   ```bash
   bun run build:ext
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked"

5. Select the `extension` folder

### Firefox

1. Build the Firefox extension:

   ```bash
   bun run build:ext:firefox
   ```

2. Open Firefox and navigate to `about:debugging`

3. Click "This Firefox" in the left sidebar

4. Click "Load Temporary Add-on"

5. Select `extension-firefox/manifest.json`

Note: Firefox loads extensions temporarily. To install permanently, you'll need to sign and distribute through AMO (addons.mozilla.org), or use the extension in development mode as shown above.

### Development Mode

To watch for changes and rebuild automatically:

```bash
# For Chrome
bun run build:ext --watch

# For Firefox
bun run build:ext:firefox --watch
```

## Setup

### 1. Generate an API Key

1. Sign in to your Historian web app
2. Go to **Settings** → **Extensions**
3. Click "Create New API Key"
4. Give it a name (e.g., "Chrome Browser")
5. Copy the generated API key

### 2. Configure the Extension

1. Click the Historian extension icon in Chrome
2. Enter your server URL (e.g., `https://historian.yourdomain.com`)
3. Paste your API key
4. Click "Save Configuration"

## Usage

- The extension runs automatically in the background
- Click the extension icon to:
  - See sync status
  - View pending uploads
  - Manually trigger a sync
  - Enable/disable tracking
  - Access settings

## How It Works

1. **Page Detection**: The extension listens for page navigations and URL changes
2. **Data Collection**: Content scripts extract page metadata (title, description, Open Graph data)
3. **Local Storage**: Visits are stored locally in the browser's storage API
4. **Periodic Sync**: Every 30 seconds, pending visits are sent to your Historian server
5. **Deduplication**: The server prevents duplicate entries based on URL and timestamp

## Privacy

- All data is stored on your own server
- The extension only communicates with your configured server
- No data is sent to third parties
- You can delete your API keys at any time

## Excluded URLs

The extension does not track:

- Browser internal pages (`chrome://`, `chrome-extension://`, `moz-extension://`)
- Browser extension pages
- `about:` pages
- Data URLs and file URLs

## Building

```bash
# Install dependencies
bun install

# Build Chrome extension
bun run build:ext

# Build Firefox extension
bun run build:ext:firefox

# Build web app and extension
bun run build
```

## API Endpoints

The extension uses these endpoints:

- `POST /api/extension/import` - Import history visits
- `POST /api/extension/create-key` - Create API key (requires auth)
- `GET /api/extension/keys` - List API keys (requires auth)
- `DELETE /api/extension/keys/:id` - Delete API key (requires auth)

## Troubleshooting

### "Sync failed" Error

1. Check your server URL is correct and the server is running
2. Verify your API key is valid (create a new one if needed)
3. Check the browser's background console for errors (about:debugging in Firefox)

### Visits Not Syncing

1. Ensure tracking is enabled (toggle in popup)
2. Check the extension icon shows pending visits
3. Click "Sync Now" in the extension popup
4. Verify the server is accessible from your network

### Extension Not Tracking

1. Make sure the extension has permissions for websites
2. Check the extension icon shows pending visits
3. Try reloading the extension

## Project Structure

```
src/extension/
├── manifest.json    # Extension manifest
├── background.ts    # Service worker for sync and tracking
├── content.ts       # Content script for page data extraction
├── popup.html       # Extension popup UI
└── popup.ts         # Popup logic
```

After building:

```
extension/
├── manifest.json
├── background.js
├── content.js
└── popup.html
└── popup.js
```
