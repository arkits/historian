import {
  getItemKey,
  areItemsSimilar,
  combineSimilarHistoryItems,
  formatTimeRange,
  type HistoryItem,
} from "@/lib/history-utils";

describe("history-utils", () => {
  const createMockHistoryItem = (
    overrides: Partial<HistoryItem> = {},
  ): HistoryItem => ({
    id: "test-id",
    createdAt: "2024-01-01T00:00:00Z",
    timelineTime: "2024-01-01T12:00:00Z",
    type: "page",
    contentId: "content-123",
    content: {
      url: "https://example.com/path",
      title: "Test Page",
      domain: "example.com",
    },
    searchContent: null,
    userId: "user-123",
    ...overrides,
  });

  describe("getItemKey", () => {
    it("should normalize URL and return as key", () => {
      const item = createMockHistoryItem({
        content: {
          url: "https://example.com/path/",
          title: "Test",
          domain: "example.com",
        },
      });

      const key = getItemKey(item);
      expect(key).toBe("example.com/path");
    });

    it("should handle URLs without trailing slash", () => {
      const item = createMockHistoryItem({
        content: {
          url: "https://example.com/path",
          title: "Test",
          domain: "example.com",
        },
      });

      const key = getItemKey(item);
      expect(key).toBe("example.com/path");
    });

    it("should handle URLs with query parameters", () => {
      const item = createMockHistoryItem({
        content: {
          url: "https://example.com/path?param=value",
          title: "Test",
          domain: "example.com",
        },
      });

      const key = getItemKey(item);
      expect(key).toBe("example.com/path");
    });

    it("should return domain key when no URL is present", () => {
      const item = createMockHistoryItem({
        content: {
          title: "Test",
          domain: "example.com",
        },
      });

      const key = getItemKey(item);
      expect(key).toBe("domain:example.com");
    });

    it("should return type-based key when no URL or domain is present", () => {
      const item = createMockHistoryItem({
        type: "video",
        content: {
          title: "Test Video",
        },
      });

      const key = getItemKey(item);
      expect(key).toBe("type:video:content-123");
    });

    it("should handle malformed URLs gracefully", () => {
      const item = createMockHistoryItem({
        content: {
          url: "not-a-url",
          title: "Test",
          domain: "example.com",
        },
      });

      const key = getItemKey(item);
      expect(key).toBe("not-a-url");
    });
  });

  describe("areItemsSimilar", () => {
    it("should return true for items with same normalized URL", () => {
      const item1 = createMockHistoryItem({
        content: {
          url: "https://example.com/path",
          title: "Test",
          domain: "example.com",
        },
      });
      const item2 = createMockHistoryItem({
        id: "test-id-2",
        content: {
          url: "https://example.com/path/",
          title: "Test",
          domain: "example.com",
        },
      });

      expect(areItemsSimilar(item1, item2)).toBe(true);
    });

    it("should return true for items with same domain and path", () => {
      const item1 = createMockHistoryItem({
        content: {
          url: "https://example.com/path/page1",
          title: "Test",
          domain: "example.com",
        },
      });
      const item2 = createMockHistoryItem({
        id: "test-id-2",
        content: {
          url: "https://example.com/path/page2",
          title: "Test",
          domain: "example.com",
        },
      });

      expect(areItemsSimilar(item1, item2)).toBe(true);
    });

    it("should return true for items with same domain and similar titles", () => {
      const item1 = createMockHistoryItem({
        content: { title: "Test Page Title", domain: "example.com" },
      });
      const item2 = createMockHistoryItem({
        id: "test-id-2",
        content: { title: "Test Page Titles", domain: "example.com" },
      });

      expect(areItemsSimilar(item1, item2)).toBe(true);
    });

    it("should return true for items with same type, domain, and close timeline", () => {
      const item1 = createMockHistoryItem({
        timelineTime: "2024-01-01T12:00:00Z",
        type: "page",
        content: {
          url: "https://example.com/samepath",
          title: "First",
          domain: "example.com",
        },
      });
      const item2 = createMockHistoryItem({
        id: "test-id-2",
        timelineTime: "2024-01-01T12:04:00Z",
        type: "page",
        content: {
          url: "https://example.com/samepath",
          title: "Second",
          domain: "example.com",
        },
      });

      expect(areItemsSimilar(item1, item2)).toBe(true);
    });

    it("should return false for items with different domains", () => {
      const item1 = createMockHistoryItem({
        content: { title: "Test Page", domain: "example.com" },
      });
      const item2 = createMockHistoryItem({
        id: "test-id-2",
        content: { title: "Test Page", domain: "other.com" },
      });

      expect(areItemsSimilar(item1, item2)).toBe(false);
    });

    it("should return false for items with timeline difference > 5 minutes", () => {
      const item1 = createMockHistoryItem({
        timelineTime: "2024-01-01T12:00:00Z",
        type: "page",
        content: {
          url: "https://example.com/page1",
          title: "First Page",
          domain: "example.com",
        },
      });
      const item2 = createMockHistoryItem({
        id: "test-id-2",
        timelineTime: "2024-01-01T12:06:00Z",
        type: "page",
        content: {
          url: "https://example.com/page2",
          title: "Second Page",
          domain: "example.com",
        },
      });

      expect(areItemsSimilar(item1, item2)).toBe(false);
    });

    it("should return false for short titles", () => {
      const item1 = createMockHistoryItem({
        content: { title: "Hi", domain: "example.com" },
      });
      const item2 = createMockHistoryItem({
        id: "test-id-2",
        content: { title: "Hey", domain: "example.com" },
      });

      expect(areItemsSimilar(item1, item2)).toBe(false);
    });

    it("should handle items with name instead of title", () => {
      const item1 = createMockHistoryItem({
        content: { name: "Test Video", domain: "youtube.com" },
      });
      const item2 = createMockHistoryItem({
        id: "test-id-2",
        content: { name: "Test Videos", domain: "youtube.com" },
      });

      expect(areItemsSimilar(item1, item2)).toBe(true);
    });
  });

  describe("combineSimilarHistoryItems", () => {
    it("should return empty array for empty input", () => {
      const result = combineSimilarHistoryItems([]);
      expect(result).toEqual([]);
    });

    it("should return single item for single input", () => {
      const items = [createMockHistoryItem()];
      const result = combineSimilarHistoryItems(items);

      expect(result).toHaveLength(1);
      expect(result[0]?.items).toEqual(items);
      expect(result[0]?.count).toBe(1);
    });

    it("should combine similar items", () => {
      const item1 = createMockHistoryItem({
        id: "item-1",
        timelineTime: "2024-01-01T12:00:00Z",
        content: {
          url: "https://example.com/path",
          title: "Test",
          domain: "example.com",
        },
      });
      const item2 = createMockHistoryItem({
        id: "item-2",
        timelineTime: "2024-01-01T12:02:00Z",
        content: {
          url: "https://example.com/path/",
          title: "Test",
          domain: "example.com",
        },
      });

      const result = combineSimilarHistoryItems([item1, item2]);

      expect(result).toHaveLength(1);
      expect(result[0]?.items).toEqual([item1, item2]);
      expect(result[0]?.count).toBe(2);
      expect(result[0]?.title).toBe("Test");
      expect(result[0]?.url).toBe("https://example.com/path");
    });

    it("should not combine dissimilar items", () => {
      const item1 = createMockHistoryItem({
        id: "item-1",
        content: { title: "Test Page", domain: "example.com" },
      });
      const item2 = createMockHistoryItem({
        id: "item-2",
        content: { title: "Other Page", domain: "other.com" },
      });

      const result = combineSimilarHistoryItems([item1, item2]);

      expect(result).toHaveLength(2);
      expect(result[0]?.items).toEqual([item1]);
      expect(result[1]?.items).toEqual([item2]);
    });

it("should handle mixed similar and dissimilar items", () => {
      const item1 = createMockHistoryItem({
        id: "item-1",
        timelineTime: "2024-01-01T12:00:00Z",
        content: { url: "https://example.com/path", title: "Test", domain: "example.com" },
      });
      const item2 = createMockHistoryItem({
        id: "item-2",
        timelineTime: "2024-01-01T12:02:00Z",
        content: { url: "https://example.com/path/", title: "Test", domain: "example.com" },
      });
      const item3 = createMockHistoryItem({
        id: "item-3",
        timelineTime: "2024-01-01T12:04:00Z",
        content: { title: "Other Page", domain: "other.com" },
      });

      const result = combineSimilarHistoryItems([item1, item2, item3]);

      expect(result).toHaveLength(2);
      expect(result[0]?.items).toEqual([item1, item2]);
      expect(result[0]?.count).toBe(2);
      expect(result[1]?.items).toEqual([item3]);
      expect(result[1]?.count).toBe(1);
    });

    it("should sort items by timeline time before combining", () => {
      const item1 = createMockHistoryItem({
        id: "item-1",
        timelineTime: "2024-01-01T12:02:00Z",
        content: {
          url: "https://example.com/path",
          title: "Test",
          domain: "example.com",
        },
      });
      const item2 = createMockHistoryItem({
        id: "item-2",
        timelineTime: "2024-01-01T12:00:00Z",
        content: {
          url: "https://example.com/path/",
          title: "Test",
          domain: "example.com",
        },
      });

      const result = combineSimilarHistoryItems([item1, item2]);

      expect(result).toHaveLength(1);
      expect(result[0]?.items).toEqual([item2, item1]);
      expect(result[0]?.earliestTime).toBe("2024-01-01T12:00:00Z");
      expect(result[0]?.latestTime).toBe("2024-01-01T12:02:00Z");
    });
  });

  describe("formatTimeRange", () => {
    it("should return time for less than 1 minute difference", () => {
      const result = formatTimeRange(
        "2024-01-01T12:00:00Z",
        "2024-01-01T12:00:30Z",
      );
      expect(result).toBe("1m");
    });

    it("should return minutes for differences less than 1 hour", () => {
      const result = formatTimeRange(
        "2024-01-01T12:00:00Z",
        "2024-01-01T12:30:00Z",
      );
      expect(result).toBe("30m");
    });

    it("should return hours for differences less than 24 hours", () => {
      const result = formatTimeRange(
        "2024-01-01T12:00:00Z",
        "2024-01-01T18:00:00Z",
      );
      expect(result).toBe("6h");
    });

    it("should return days for differences 24 hours or more", () => {
      const result = formatTimeRange(
        "2024-01-01T12:00:00Z",
        "2024-01-03T12:00:00Z",
      );
      expect(result).toBe("2d");
    });

    it("should handle edge case of exactly 1 hour", () => {
      const result = formatTimeRange(
        "2024-01-01T12:00:00Z",
        "2024-01-01T13:00:00Z",
      );
      expect(result).toBe("1h");
    });

    it("should handle edge case of exactly 24 hours", () => {
      const result = formatTimeRange(
        "2024-01-01T12:00:00Z",
        "2024-01-02T12:00:00Z",
      );
      expect(result).toBe("1d");
    });

    it("should round minutes appropriately", () => {
      const result = formatTimeRange(
        "2024-01-01T12:00:00Z",
        "2024-01-01T12:29:30Z",
      );
      expect(result).toBe("30m");
    });

    it("should round hours appropriately", () => {
      const result = formatTimeRange(
        "2024-01-01T12:00:00Z",
        "2024-01-01T17:30:00Z",
      );
      expect(result).toBe("6h");
    });

    it("should round days appropriately", () => {
      const result = formatTimeRange(
        "2024-01-01T12:00:00Z",
        "2024-01-04T18:00:00Z",
      );
      expect(result).toBe("3d");
    });
  });
});
