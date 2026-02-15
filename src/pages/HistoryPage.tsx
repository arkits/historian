import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  X,
  Filter,
  ExternalLink,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NavBar } from "@/components/NavBar";
import {
  combineSimilarHistoryItems,
  formatTimeRange,
  type CombinedHistoryItem,
  type HistoryItem,
} from "@/lib/history-utils";

interface HistoryPageProps {
  onSignOut?: () => void;
}

interface HistoryGroup {
  date: string;
  items: HistoryItem[];
  combinedItems?: CombinedHistoryItem[];
}

function formatDate(dateStr: string): { date: string; time: string } {
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function getDomain(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.length > 40 ? `${url.substring(0, 40)}...` : url;
  }
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    browser: "🌐",
    search: "🔍",
    video: "🎬",
    music: "🎵",
    document: "📄",
    image: "🖼️",
    link: "🔗",
    code: "💻",
    book: "📚",
    news: "📰",
    social: "👥",
    shopping: "🛒",
  };
  return icons[type.toLowerCase()] || "📌";
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const { time } = formatDate(item.timelineTime);
  const content = item.content;
  const title =
    (content.title as string) ||
    (content.name as string) ||
    (content.url as string) ||
    "Unknown";
  const url = content.url as string;
  const favicon = content.favicon as string;
  const thumbnail = content.thumbnail as string;
  const [thumbnailError, setThumbnailError] = useState(false);
  const domain = getDomain(url);

  return (
    <div className="relative flex gap-4 group">
      {/* Timeline connector */}
      <div className="relative flex flex-col items-center">
        <div className="w-16 text-right pr-3 flex-shrink-0">
          <span className="text-[11px] font-mono text-muted-foreground/70 tracking-tight">
            {time}
          </span>
        </div>
      </div>

      {/* Timeline dot */}
      <div className="relative flex flex-col items-center flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-primary/60 ring-4 ring-background group-hover:bg-primary group-hover:ring-primary/20 transition-all duration-300 z-10" />
        <div className="absolute top-3 w-px h-[calc(100%+1rem)] bg-gradient-to-b from-border/60 to-border/20" />
      </div>

      {/* Card content */}
      <Link to={`/history/${item.id}`} className="flex-1 min-w-0 pb-4">
        <Card className="border-border/30 bg-card/80 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:border-primary/40 hover:bg-card/95 hover:shadow-xl hover:shadow-primary/5 overflow-hidden relative">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className="flex items-center justify-center w-14 bg-muted/30 border-r border-border/20 flex-shrink-0">
                {favicon ? (
                  <img
                    src={favicon}
                    alt=""
                    className="w-6 h-6 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-xl">${getTypeIcon(item.type)}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-xl">{getTypeIcon(item.type)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                    {item.type}
                  </span>
                </div>

                <h3 className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-1">
                  {title}
                </h3>

                {domain && (
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground/60 truncate">
                      {domain}
                    </span>
                  </div>
                )}
              </div>

              <div className="w-20 flex-shrink-0 overflow-hidden bg-muted/20">
                {thumbnail && !thumbnailError ? (
                  <img
                    src={thumbnail}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => setThumbnailError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-2xl opacity-30">
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function ExpandedStackItem({
  item,
  index,
}: {
  item: HistoryItem;
  index: number;
}) {
  const { time } = formatDate(item.timelineTime);
  const itemContent = item.content;
  const itemTitle =
    (itemContent.title as string) ||
    (itemContent.name as string) ||
    (itemContent.url as string) ||
    "Unknown";
  const itemUrl = itemContent.url as string | undefined;
  const itemFavicon = itemContent.favicon as string | undefined;
  const domain = getDomain(itemUrl);

  return (
    <Link key={item.id} to={`/history/${item.id}`} className="block group">
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-card/40 border border-border/20 hover:border-primary/30 hover:bg-card/60 transition-all duration-200">
        <span className="text-[10px] font-mono text-muted-foreground/50 w-5">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="w-6 h-6 rounded flex items-center justify-center bg-muted/30 flex-shrink-0 overflow-hidden">
          {itemFavicon ? (
            <img
              src={itemFavicon}
              alt=""
              className="w-4 h-4 rounded"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-xs">${getTypeIcon(item.type)}</span>`;
                }
              }}
            />
          ) : (
            <span className="text-xs">{getTypeIcon(item.type)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-foreground/90 group-hover:text-primary transition-colors line-clamp-1">
            {itemTitle}
          </h4>
          {domain && (
            <span className="text-[10px] text-muted-foreground/50">
              {domain}
            </span>
          )}
        </div>

        <span className="text-[10px] font-mono text-muted-foreground/60 flex-shrink-0">
          {time}
        </span>
      </div>
    </Link>
  );
}

function CombinedHistoryCard({
  combined,
  isExpanded,
  onToggle,
}: {
  combined: CombinedHistoryItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const firstItem = combined.items[0];
  if (!firstItem) return null;

  const { time: firstTime } = formatDate(combined.earliestTime);
  const title = combined.title;
  const url = combined.url;
  const favicon = combined.favicon;
  const thumbnail = combined.thumbnail;
  const timeRange = formatTimeRange(combined.earliestTime, combined.latestTime);
  const [thumbnailError, setThumbnailError] = useState(false);

  const sortedItems = [...combined.items].sort(
    (a, b) =>
      new Date(b.timelineTime).getTime() - new Date(a.timelineTime).getTime(),
  );

  const domain = getDomain(url);

  return (
    <div className="relative flex gap-4 group/main">
      <div className="relative flex flex-col items-center">
        <div className="w-16 text-right pr-3 flex-shrink-0">
          <span className="text-[11px] font-mono text-muted-foreground/70 tracking-tight">
            {firstTime}
          </span>
        </div>
      </div>

      <div className="relative flex flex-col items-center flex-shrink-0">
        {combined.count > 1 && (
          <>
            <div className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-primary/20 ring-2 ring-background" />
            <div className="absolute -top-1 -left-1 w-4.5 h-4.5 rounded-full bg-primary/10 ring-2 ring-background" />
          </>
        )}
        <div className="relative w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background group-hover/main:ring-primary/20 transition-all duration-300 z-10" />
        <div className="absolute top-3 w-px h-[calc(100%+1rem)] bg-gradient-to-b from-border/60 to-border/20" />
      </div>

      <div className="flex-1 min-w-0 pb-4">
        <div onClick={onToggle} className="cursor-pointer">
          <Card
            className={`border-border/30 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/95 hover:shadow-xl hover:shadow-primary/5 overflow-hidden relative ${
              isExpanded ? "ring-1 ring-primary/40 border-primary/40" : ""
            }`}
          >
            <CardContent className="p-0">
              <div className="flex items-stretch">
                <div className="flex items-center justify-center w-14 bg-muted/30 border-r border-border/20 flex-shrink-0">
                  {favicon ? (
                    <img
                      src={favicon}
                      alt=""
                      className="w-6 h-6 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-xl">${getTypeIcon(combined.type)}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-xl">
                      {getTypeIcon(combined.type)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                      {combined.type}
                    </span>
                    <span className="text-[10px] font-medium text-foreground/70 bg-foreground/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {combined.count} {combined.count === 1 ? "visit" : "visits"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {timeRange}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-foreground leading-snug group-hover/main:text-primary transition-colors duration-300 line-clamp-2 mb-1">
                    {title}
                  </h3>

                  {domain && (
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground/60 truncate">
                        {domain}
                      </span>
                    </div>
                  )}

                  {combined.count > 1 && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20">
                      <div className="flex -space-x-1.5">
                        {sortedItems.slice(0, 4).map((item, idx) => {
                          const itemFavicon = item.content.favicon as
                            | string
                            | undefined;
                          return (
                            <div
                              key={item.id}
                              className="w-5 h-5 rounded-full bg-muted/60 border-2 border-card flex items-center justify-center overflow-hidden"
                              style={{ zIndex: 4 - idx }}
                            >
                              {itemFavicon ? (
                                <img
                                  src={itemFavicon}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[8px]">
                                  {getTypeIcon(item.type)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {combined.count > 4 && (
                          <div className="w-5 h-5 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-medium text-muted-foreground">
                            +{combined.count - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" /> Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" /> View all visits
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-20 flex-shrink-0 overflow-hidden bg-muted/20">
                  {thumbnail && !thumbnailError ? (
                    <img
                      src={thumbnail}
                      alt=""
                      className="w-full h-full object-cover group-hover/main:scale-105 transition-transform duration-500"
                      onError={() => setThumbnailError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-2xl opacity-30">
                        {getTypeIcon(combined.type)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isExpanded && (
          <div className="mt-3 ml-3 space-y-1.5 pl-3 border-l border-primary/30">
            {sortedItems.map((item, idx) => (
              <ExpandedStackItem key={item.id} item={item} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function GroupHeader({ group }: { group: HistoryGroup }) {
  return (
    <div className="flex items-center gap-6 py-6 sticky top-0 z-20 bg-background/95 backdrop-blur-md -mx-6 px-6">
      <div className="flex-1 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary/40" />
        <div className="flex-1 h-px bg-gradient-to-r from-primary/40 via-border/40 to-transparent" />
      </div>

      <div className="relative">
        <span className="text-xs font-medium uppercase tracking-widest text-foreground/80 whitespace-nowrap px-4 py-2 bg-card/80 backdrop-blur-sm rounded border border-border/40 shadow-sm">
          {group.date}
        </span>
      </div>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-px bg-gradient-to-l from-primary/40 via-border/40 to-transparent" />
        <div className="w-2 h-2 rounded-full bg-primary/40" />
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="relative flex gap-4">
      <div className="w-16 text-right pr-3 flex-shrink-0">
        <div className="h-3 w-10 bg-muted/40 rounded animate-pulse ml-auto" />
      </div>

      <div className="relative flex flex-col items-center flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-muted/40 animate-pulse ring-4 ring-background" />
        <div className="absolute top-3 w-px h-[calc(100%+1rem)] bg-border/20" />
      </div>

      <div className="flex-1 min-w-0 pb-4">
        <Card className="border-border/30 bg-card/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className="w-14 bg-muted/20 animate-pulse" />
              <div className="flex-1 px-4 py-3 space-y-2">
                <div className="flex gap-2">
                  <div className="h-4 w-12 bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
                </div>
                <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-muted/20 rounded animate-pulse" />
              </div>
              <div className="w-20 bg-muted/20 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function HistoryPage({ onSignOut }: HistoryPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlType = searchParams.get("type");
  const urlDateFrom = searchParams.get("from");
  const urlDateTo = searchParams.get("to");
  const [selectedType, setSelectedType] = useState<string>(urlType || "all");
  const [dateRange, setDateRange] = useState<
    { from?: string; to?: string } | undefined
  >(
    urlDateFrom
      ? { from: urlDateFrom, to: urlDateTo || urlDateFrom }
      : undefined,
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [combineSimilar, setCombineSimilar] = useState(true);
  const [expandedStacks, setExpandedStacks] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageSize = 50;

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (selectedType !== "all") {
      params.set("type", selectedType);
    }
    if (dateRange?.from) {
      params.set("from", dateRange.from);
    }
    if (dateRange?.to) {
      params.set("to", dateRange.to);
    }
    const queryString = params.toString();
    navigate(`/history${queryString ? `?${queryString}` : ""}`, {
      replace: true,
    });
  }, [selectedType, dateRange, navigate]);

  const dateQuery = trpc.getHistoryByDate.useQuery(
    { date: dateRange?.from ?? "" },
    { enabled: !!dateRange?.from && !dateRange?.to, retry: false },
  );

  const dateRangeQuery = trpc.getHistoryItemsByDateRange.useQuery(
    { startDate: dateRange?.from ?? "", endDate: dateRange?.to ?? "" },
    { enabled: !!dateRange?.from && !!dateRange?.to, retry: false },
  );

  const { data: allTypes } = trpc.getHistoryTypes.useQuery(undefined, {
    retry: false,
  });

  const {
    data: historyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = trpc.listHistory.useInfiniteQuery(
    {
      limit: pageSize,
      type: selectedType === "all" ? undefined : selectedType,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !dateRange?.from,
    },
  );

  const allItems = useMemo(() => {
    if (dateRange?.from && !dateRange?.to && dateQuery.data) {
      return dateQuery.data.map((item) => ({
        ...item,
        createdAt: new Date(item.timelineTime).toISOString(),
      })) as HistoryItem[];
    }
    if (dateRange?.from && dateRange?.to && dateRangeQuery.data) {
      return dateRangeQuery.data.map((item) => ({
        ...item,
        createdAt: new Date(item.timelineTime).toISOString(),
      })) as HistoryItem[];
    }
    if (!historyData) return [];
    return historyData.pages.flatMap((page) => page.items) as HistoryItem[];
  }, [historyData, dateQuery.data, dateRangeQuery.data, dateRange]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const query = searchQuery.toLowerCase();
    return allItems.filter((item) => {
      const content = item.content;
      const title = (
        (content.title as string) ||
        (content.name as string) ||
        ""
      ).toLowerCase();
      const subtitle = (
        (content.description as string) ||
        (content.url as string) ||
        ""
      ).toLowerCase();
      const searchContent = (item.searchContent || "").toLowerCase();
      return (
        title.includes(query) ||
        subtitle.includes(query) ||
        searchContent.includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    });
  }, [allItems, searchQuery]);

  const groupedItems = useMemo(() => {
    if (combineSimilar) {
      const combined = combineSimilarHistoryItems(filteredItems);
      const groups: Record<
        string,
        { items: HistoryItem[]; combined: CombinedHistoryItem[] }
      > = {};

      combined.forEach((c) => {
        const date = new Date(c.earliestTime).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
        if (!groups[date]) {
          groups[date] = { items: [], combined: [] };
        }
        groups[date].combined.push(c);
      });

      return Object.entries(groups).map(([date, group]) => ({
        date,
        items: group.items,
        combinedItems: group.combined,
      })) as HistoryGroup[];
    }

    const groups: Record<string, HistoryItem[]> = {};
    filteredItems.forEach((item) => {
      const date = new Date(item.timelineTime).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    })) as HistoryGroup[];
  }, [filteredItems, combineSimilar]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleClearSearch = useCallback(() => setSearchQuery(""), []);

  const toggleStack = useCallback((stackId: string) => {
    setExpandedStacks((prev) => {
      const next = new Set(prev);
      if (next.has(stackId)) {
        next.delete(stackId);
      } else {
        next.add(stackId);
      }
      return next;
    });
  }, []);

  const isDateFilter = !!dateRange?.from;
  const isLoadingSingleDate =
    isDateFilter && !dateRange?.to && dateQuery.isLoading;
  const isLoadingDateRange =
    isDateFilter && !!dateRange?.to && dateRangeQuery.isLoading;
  const isDateLoading = isLoadingSingleDate || isLoadingDateRange;
  const isErrorDate =
    (isDateFilter && !dateRange?.to && dateQuery.isError) ||
    (isDateFilter &&
      !!dateRange?.to &&
      dateRange.to !== dateRange.from &&
      dateRangeQuery.isError);

  const handleDateSelect = (
    date: Date | { from: Date; to: Date } | undefined,
  ) => {
    if (!date) {
      setDateRange(undefined);
      setIsCalendarOpen(false);
      return;
    }
    if ("from" in date && date.from) {
      if (date.to) {
        setDateRange({
          from: date.from.toISOString().split("T")[0],
          to: date.to.toISOString().split("T")[0],
        });
        setIsCalendarOpen(false);
      } else {
        setDateRange({ from: date.from.toISOString().split("T")[0] });
      }
    }
  };

  const handleClearDate = () => {
    setDateRange(undefined);
  };

  const getDateLabel = () => {
    if (!dateRange?.from) return "Date";
    const from = new Date(dateRange.from);
    if (dateRange?.to && dateRange.to !== dateRange.from) {
      const to = new Date(dateRange.to);
      return `${from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${to.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    return from.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      if (
        scrollElement.scrollHeight -
          scrollElement.scrollTop -
          scrollElement.clientHeight <
          100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        handleLoadMore();
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage, handleLoadMore]);

  if (isError || isErrorDate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Error Loading History
            </h2>
            <p className="text-muted-foreground mb-4">
              We couldn't load your history. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar title="History" onSignOut={onSignOut} showBack />

      <main className="flex-1 flex flex-col pt-16 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-6 py-3 border-b border-border/50 bg-background/50 backdrop-blur flex-shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search your history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-card/50 border-border/50 h-9"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={`flex items-center gap-2 px-3 rounded-md border h-9 transition-colors ${
                      isDateFilter
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-card/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {getDateLabel()}
                    </span>
                    {isDateFilter && (
                      <div
                        role="button"
                        className="h-4 w-4 rounded-full hover:bg-primary/20 ml-1 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearDate();
                        }}
                      >
                        <X className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    selected={
                      dateRange?.from
                        ? dateRange.to
                          ? {
                              from: new Date(dateRange.from),
                              to: new Date(dateRange.to),
                            }
                          : new Date(dateRange.from)
                        : undefined
                    }
                    onSelect={handleDateSelect}
                    mode="range"
                  />
                </PopoverContent>
              </Popover>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[160px] bg-card/50 border-border/50 h-9">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {allTypes?.map((type) => (
                    <SelectItem key={type} value={type}>
                      <span className="flex items-center gap-2">
                        <span>{getTypeIcon(type)}</span>
                        {type.toLowerCase()}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={() => setCombineSimilar(!combineSimilar)}
                className={`flex items-center gap-2 px-3 rounded-md border h-9 transition-colors ${
                  combineSimilar
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-card/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
                title="Combine similar history items"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="text-xs font-medium">Combine</span>
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden history-scroll-container">
            <div ref={scrollContainerRef} className="h-full overflow-y-auto">
              <div className="max-w-7xl mx-auto px-6 py-4">
                {isLoading || isDateLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <TimelineSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-xl max-w-md w-full mx-4">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-heading text-xl mb-2">
                          {searchQuery
                            ? "No Results Found"
                            : isDateFilter
                              ? "No History Found"
                              : "No History Yet"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery
                            ? "Try adjusting your search terms"
                            : isDateFilter
                              ? "No history entries match your filters"
                              : "Start importing your browsing history to see it here"}
                        </p>
                        {!searchQuery && !isDateFilter && (
                          <Link to="/import">
                            <Button variant="outline">Import Data</Button>
                          </Link>
                        )}
                        {(isDateFilter || searchQuery) && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchQuery("");
                              handleClearDate();
                            }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupedItems.map((group) => (
                      <div key={group.date}>
                        <GroupHeader group={group} />
                        <div className="space-y-4 mt-4">
                          {combineSimilar && group.combinedItems
                            ? group.combinedItems.map((combined) => (
                                <CombinedHistoryCard
                                  key={combined.id}
                                  combined={combined}
                                  isExpanded={expandedStacks.has(combined.id)}
                                  onToggle={() => toggleStack(combined.id)}
                                />
                              ))
                            : group.items.map((item) => (
                                <HistoryCard key={item.id} item={item} />
                              ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isFetchingNextPage && (
                  <div className="space-y-3 mt-4">
                    {[...Array(3)].map((_, i) => (
                      <TimelineSkeleton key={i} />
                    ))}
                  </div>
                )}

                {!hasNextPage && !isDateFilter && filteredItems.length > 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    {combineSimilar
                      ? `Showing ${groupedItems.reduce((acc, g) => acc + (g.combinedItems?.length || 0), 0)} combined entries from ${filteredItems.length.toLocaleString()} visits`
                      : `You've reached the end of your history (${filteredItems.length.toLocaleString()} items)`}
                  </p>
                )}

                {isDateFilter && filteredItems.length > 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    {combineSimilar
                      ? `Showing ${groupedItems.reduce((acc, g) => acc + (g.combinedItems?.length || 0), 0)} combined entries for selected date`
                      : `Showing ${filteredItems.length.toLocaleString()} item${filteredItems.length === 1 ? "" : "s"} for selected date`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
