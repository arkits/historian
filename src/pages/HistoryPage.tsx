import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
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
  ArrowLeft,
  Search,
  X,
  Clock,
  Hash,
  Filter,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
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

  return (
    <Link to={`/history/${item.id}`} className="block">
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl transition-all cursor-pointer hover:border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative flex flex-col items-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-primary/10 flex-shrink-0">
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
              <div className="w-px h-8 bg-border/50 mt-1" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5 overflow-hidden">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Hash className="w-2.5 h-2.5" />
                  {formatType(item.type)}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {time}
                </span>
              </div>
              <h3 className="font-medium text-foreground text-sm truncate pr-4">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {subtitle}
                </p>
              )}
              {item.searchContent && (
                <p className="text-[10px] text-muted-foreground mt-1 italic flex items-center gap-1">
                  <Search className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">"{item.searchContent}"</span>
                </p>
              )}
              {url && !subtitle.includes(url) && (
                <p className="text-[10px] text-muted-foreground/70 mt-1 truncate flex items-center gap-1">
                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{url}</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function GroupHeader({ group }: { group: HistoryGroup }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap px-3 py-0.5 bg-background/80 backdrop-blur rounded-full border border-border/50">
        {group.date}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative flex flex-col items-center flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse flex-shrink-0" />
            <div className="w-px h-8 bg-border/50 mt-1" />
          </div>
          <div className="flex-1 min-w-0 space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-primary/10 rounded animate-pulse" />
              <div className="h-3 w-12 bg-primary/10 rounded animate-pulse" />
            </div>
            <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-primary/10 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HistoryPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

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
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const allItems = useMemo(() => {
    if (!historyData) return [];
    return historyData.pages.flatMap((page) => page.items) as HistoryItem[];
  }, [historyData]);

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

  const uniqueTypes = useMemo(() => {
    const types = new Set(allItems.map((item) => item.type));
    return Array.from(types).sort();
  }, [allItems]);

  const handleClearSearch = useCallback(() => setSearchQuery(""), []);

  useCallback(() => {
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

  if (isError) {
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
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50 h-14 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl">🕵️</span>
              <span className="font-heading text-lg text-foreground">
                History
              </span>
            </div>
          </div>
          <Link to="/import">
            <Button variant="outline" size="sm">
              Import Data
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-14 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur flex-shrink-0">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3">
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
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[160px] bg-card/50 border-border/50 h-9">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      <span className="flex items-center gap-2">
                        <span>{getTypeIcon(type)}</span>
                        {formatType(type)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden history-scroll-container">
            <div
              className="h-full max-w-5xl mx-auto px-4 py-4 overflow-y-auto"
              style={{ height: "100%" }}
            >
              {isLoading ? (
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
                        {searchQuery ? "No Results Found" : "No History Yet"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery
                          ? "Try adjusting your search terms"
                          : "Start importing your browsing history to see it here"}
                      </p>
                      {!searchQuery && (
                        <Link to="/import">
                          <Button variant="outline">Import Data</Button>
                        </Link>
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

              {!hasNextPage && filteredItems.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  You've reached the end of your history (
                  {filteredItems.length.toLocaleString()} items)
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
