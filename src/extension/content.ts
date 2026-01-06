(function () {
  "use strict";

  const IGNORED_URLS = [
    /^chrome:/,
    /^chrome-extension:/,
    /^moz-extension:/,
    /^about:/,
    /^data:/,
    /^file:/,
  ];

  interface PageMetadata {
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
  }

  let lastUrl: string | null = null;
  let visitStartTime: Date | null = null;

  function isIgnored(url: string): boolean {
    return IGNORED_URLS.some((pattern) => pattern.test(url));
  }

  function getPageMetadata(): PageMetadata {
    const metadata: PageMetadata = {
      description: "",
      keywords: "",
      ogTitle: "",
      ogDescription: "",
    };

    const metaTags = document.querySelectorAll("meta[name], meta[property]");
    metaTags.forEach((tag) => {
      const name =
        tag.getAttribute("name") || tag.getAttribute("property") || "";
      const content = tag.getAttribute("content") || "";

      if (name === "description") metadata.description = content;
      else if (name === "keywords") metadata.keywords = content;
      else if (name === "og:title") metadata.ogTitle = content;
      else if (name === "og:description") metadata.ogDescription = content;
    });

    return metadata;
  }

  function extractTextContent(
    element: Element | null,
    maxLength = 500,
  ): string {
    const text = element?.textContent || "";
    return text.trim().substring(0, maxLength).replace(/\s+/g, " ");
  }

  function getMainContent(): string {
    const selectors = [
      "article",
      '[role="main"]',
      "main",
      ".main-content",
      "#content",
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return extractTextContent(element, 1000);
      }
    }

    return extractTextContent(document.body, 1000);
  }

  function shouldTrack(): boolean {
    if (!window.location.href || isIgnored(window.location.href)) {
      return false;
    }
    return true;
  }

  async function reportPageVisit(): Promise<void> {
    const url = window.location.href;

    if (!shouldTrack() || url === lastUrl) return;

    lastUrl = url;
    const now = new Date();
    const duration = visitStartTime
      ? Math.floor((now.getTime() - visitStartTime.getTime()) / 1000)
      : 0;

    const metadata = getPageMetadata();
    const pageData = {
      type: "PAGE_DATA",
      url,
      title: document.title || "",
      visitTime: now.toISOString(),
      referrer: document.referrer,
      metadata,
      content: getMainContent(),
      visitDuration: duration,
    };

    try {
      await chrome.runtime.sendMessage(pageData);
    } catch (error) {
      console.error("Failed to report page visit:", error);
    }
  }

  function initObserver(): void {
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;

      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldCheck = true;
          break;
        }
      }

      if (shouldCheck) {
        setTimeout(reportPageVisit, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function handleUrlChange(): void {
    if (visitStartTime) {
      reportPageVisit();
    }
    visitStartTime = new Date();
  }

  function setupNavigationTracking(): void {
    const wrappedHandler = () => handleUrlChange();

    window.addEventListener("popstate", wrappedHandler);

    let lastPath = window.location.pathname + window.location.search;
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args: [any, string, string | URL | null]) {
      originalPushState.apply(this, args);
      setTimeout(() => {
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== lastPath) {
          lastPath = currentPath;
          wrappedHandler();
        }
      }, 0);
    };

    history.replaceState = function (
      ...args: [any, string, string | URL | null]
    ) {
      originalReplaceState.apply(this, args);
      setTimeout(() => {
        const currentPath = window.location.pathname + window.location.search;
        lastPath = currentPath;
      }, 0);
    };

    document.addEventListener("DOMContentLoaded", () => {
      visitStartTime = new Date();

      if (document.readyState === "complete") {
        setTimeout(reportPageVisit, 500);
      } else {
        window.addEventListener("load", () => {
          setTimeout(reportPageVisit, 500);
        });
      }

      initObserver();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupNavigationTracking);
  } else {
    setupNavigationTracking();
  }

  window.addEventListener("beforeunload", () => {
    reportPageVisit();
  });
})();
