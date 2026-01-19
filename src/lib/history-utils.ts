export interface HistoryItemContent {
  url?: string;
  title?: string;
  name?: string;
  domain?: string;
  description?: string;
  [key: string]: unknown;
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  timelineTime: string;
  type: string;
  contentId: string;
  content: HistoryItemContent;
  searchContent: string | null;
  userId: string;
}

export interface CombinedHistoryItem {
  id: string;
  items: HistoryItem[];
  title: string;
  url: string;
  domain: string;
  type: string;
  earliestTime: string;
  latestTime: string;
  count: number;
  thumbnail?: string;
  favicon?: string;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname.replace(/\/$/, "")}`;
  } catch {
    return url;
  }
}

export function getItemKey(item: HistoryItem): string {
  const content = item.content;
  const url = content.url as string | undefined;
  const domain = content.domain as string | undefined;

  if (url) {
    return normalizeUrl(url);
  }

  if (domain) {
    return `domain:${domain}`;
  }

  return `type:${item.type}:${item.contentId}`;
}

export function areItemsSimilar(
  item1: HistoryItem,
  item2: HistoryItem,
): boolean {
  const content1 = item1.content;
  const content2 = item2.content;

  const url1 = content1.url as string | undefined;
  const url2 = content2.url as string | undefined;
  const domain1 = content1.domain as string | undefined;
  const domain2 = content2.domain as string | undefined;
  const title1 = (content1.title as string) || (content1.name as string) || "";
  const title2 = (content2.title as string) || (content2.name as string) || "";

  if (url1 && url2) {
    const normalized1 = normalizeUrl(url1);
    const normalized2 = normalizeUrl(url2);

    if (normalized1 === normalized2) {
      return true;
    }

    if (domain1 && domain2 && domain1 === domain2) {
      const path1 = normalized1.replace(/^[^/]+\/[^/]*/, "");
      const path2 = normalized2.replace(/^[^/]+\/[^/]*/, "");

      if (path1 === path2 && path1.length > 0) {
        return true;
      }
    }
  }

  if (domain1 && domain2 && domain1 === domain2) {
    const title1Norm = title1.toLowerCase().replace(/[^a-z0-9]/g, "");
    const title2Norm = title2.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (title1Norm.length > 3 && title2Norm.length > 3) {
      if (title1Norm === title2Norm) {
        return true;
      }

      const maxLen = Math.max(title1Norm.length, title2Norm.length);
      const minLen = Math.min(title1Norm.length, title2Norm.length);
      const ratio =
        1 - Math.abs(title1Norm.length - title2Norm.length) / maxLen;

      if (ratio > 0.8) {
        let matches = 0;
        for (let i = 0; i < minLen; i++) {
          if (title1Norm[i] === title2Norm[i]) {
            matches++;
          }
        }
        return matches / minLen > 0.8;
      }
    }
  }

  if (item1.type === item2.type && url1 && url2 && domain1 === domain2) {
    const time1 = new Date(item1.timelineTime).getTime();
    const time2 = new Date(item2.timelineTime).getTime();
    const diffMinutes = Math.abs(time1 - time2) / (1000 * 60);

    if (diffMinutes < 5) {
      return true;
    }
  }

  return false;
}

export function combineSimilarHistoryItems(
  items: HistoryItem[],
): CombinedHistoryItem[] {
  if (items.length === 0) return [];

  const sortedItems = [...items].sort(
    (a, b) =>
      new Date(a.timelineTime).getTime() - new Date(b.timelineTime).getTime(),
  );

  const combined: CombinedHistoryItem[] = [];

  if (sortedItems.length === 0) return combined;

  let currentGroup: HistoryItem[] = [sortedItems[0]!];

  for (let i = 1; i < sortedItems.length; i++) {
    const item = sortedItems[i]!;
    const prevItem = sortedItems[i - 1]!;

    if (areItemsSimilar(item, prevItem)) {
      currentGroup.push(item);
    } else {
      if (currentGroup.length > 0) {
        combined.push(createCombinedItem(currentGroup));
      }
      currentGroup = [item];
    }
  }

  if (currentGroup.length > 0) {
    combined.push(createCombinedItem(currentGroup));
  }

  return combined;
}

function createCombinedItem(group: HistoryItem[]): CombinedHistoryItem {
  const firstItem = group[0]!;
  const lastItem = group[group.length - 1]!;
  const content = firstItem.content;

  const title =
    (content.title as string) || (content.name as string) || "Unknown";
  const url = (content.url as string) || "";
  const domain = (content.domain as string) || "";
  const thumbnail = content.thumbnail as string | undefined;
  const favicon = content.favicon as string | undefined;

  return {
    id: `combined-${firstItem.id}`,
    items: group,
    title,
    url,
    domain,
    type: firstItem.type,
    earliestTime: firstItem.timelineTime,
    latestTime: lastItem.timelineTime,
    count: group.length,
    thumbnail,
    favicon,
  };
}

export function formatTimeRange(earliest: string, latest: string): string {
  const start = new Date(earliest);
  const end = new Date(latest);
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return new Date(earliest).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
}
