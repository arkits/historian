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
  Clock,
  Hash,
  Filter,
  ExternalLink,
  CalendarIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NavBar } from "@/components/NavBar";

interface HistoryPageProps {
  onSignOut?: () => void;
}

interface HistoryItem {
  id: string;
  createdAt: string;
  timelineTime: string;
  type: string;
  contentId: string;
  content: Record<string, unknown>;
  searchContent: string | null;
  userId: string;
}

interface HistoryGroup {
  date: string;
  items: HistoryItem[];
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
  const subtitle =
    (content.description as string) || (content.url as string) || "";
  const url = content.url as string;
  const favicon = content.favicon as string;
  const thumbnail = content.thumbnail as string;

  return (
    <Link to={`/history/${item.id}`} className="block">
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl transition-all cursor-pointer hover:border-primary/30">
        <CardContent className="p-1 flex items-center gap-3">
          <div className="relative flex flex-col items-center flex-shrink-0">
            <div className="w-8 h-8 rounded flex items-center justify-center text-sm bg-primary/10 flex-shrink-0 overflow-hidden">
              {favicon ? (
                <img
                  src={favicon}
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <span>{getTypeIcon(item.type)}</span>
              )}
            </div>
            <div className="w-px h-4 bg-border/50 mt-0.5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Hash className="w-2.5 h-2.5" />
                {item.type.toLowerCase()}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {time}
              </span>
            </div>
            <h3 className="font-medium text-foreground text-sm truncate pr-2">
              {title}
            </h3>
          </div>
          {thumbnail && (
            <div className="w-20 h-full rounded flex-shrink-0 overflow-hidden">
              <img
                src={thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function GroupHeader({ group }: { group: HistoryGroup }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-border/50" />
      <span
        className="text-xs font-medium text-muted-foreground whitespace-nowrap px-3 py-0.5 bg-background/80 backdrop-blur rounded-full border border-border/50"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {group.date}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
      <CardContent className="p-2 flex items-center gap-3">
        <div className="relative flex flex-col items-center flex-shrink-0">
          <div className="w-8 h-8 rounded bg-primary/10 animate-pulse flex-shrink-0" />
          <div className="w-px h-4 bg-border/50 mt-0.5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 bg-primary/10 rounded animate-pulse" />
            <div className="h-3 w-10 bg-primary/10 rounded animate-pulse" />
          </div>
          <div className="h-3 w-3/4 bg-primary/10 rounded animate-pulse" />
        </div>
        <div className="w-16 h-10 rounded bg-primary/10 animate-pulse flex-shrink-0" />
      </CardContent>
    </Card>
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
    { date: dateRange?.from! },
    { enabled: !!dateRange?.from && !dateRange?.to, retry: false },
  );

  const dateRangeQuery = trpc.getHistoryItemsByDateRange.useQuery(
    { startDate: dateRange?.from!, endDate: dateRange?.to! },
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
  }, [filteredItems]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleClearSearch = useCallback(() => setSearchQuery(""), []);

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
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (
        target.scrollHeight - target.scrollTop - target.clientHeight < 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        handleLoadMore();
      }
    };

    const scrollContainer = document.querySelector(".history-scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
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

  const signOutMutation = trpc.signOut.useMutation({
    onSuccess: () => {
      onSignOut?.();
    },
  });

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
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden history-scroll-container">
            <div
              className="h-full max-w-7xl mx-auto px-6 py-4 overflow-y-auto"
              style={{ height: "100%" }}
            >
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
                <div className="space-y-1">
                  {groupedItems.map((group) => (
                    <div key={group.date}>
                      <GroupHeader group={group} />
                      <div className="space-y-3">
                        {group.items.map((item) => (
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
                  You've reached the end of your history (
                  {filteredItems.length.toLocaleString()} items)
                </p>
              )}

              {isDateFilter && filteredItems.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  Showing {filteredItems.length.toLocaleString()} item
                  {filteredItems.length === 1 ? "" : "s"} for selected date
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
