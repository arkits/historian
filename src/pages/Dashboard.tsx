import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  LogOut,
  History,
  Settings,
  FileText,
  Link2,
  BookOpen,
  Plus,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { ActivityHeatmap } from "@/components/heatmap";
import { WeeklyActivityChart } from "@/components/WeeklyActivityChart";
import { RecentActivity } from "@/components/RecentActivity";

interface DashboardProps {
  onSignOut: () => void;
}

export function Dashboard({ onSignOut }: DashboardProps) {
  const navigate = useNavigate();
  trpc.getSession.useQuery(undefined, {
    retry: false,
  });
  const { data: user } = trpc.getUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: stats } = trpc.getHistoryStats.useQuery(undefined, {
    retry: false,
  });
  const { data: activitySummary } = trpc.getRecentActivitySummary.useQuery(
    undefined,
    { retry: false },
  );
  const { data: weeklyData } = trpc.getActivityByWeek.useQuery(
    { weeks: 12 },
    { retry: false },
  );
  const { data: recentVisits } = trpc.getRecentVisits.useQuery(
    { limit: 8 },
    { retry: false },
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const startDate365 = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 364);
    return d.toISOString();
  }, [today]);
  const endDate365 = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString();
  }, [today]);

  const { data: heatmapData } = trpc.getHistoryByDateRange.useQuery(
    { startDate: startDate365, endDate: endDate365 },
    { retry: false },
  );

  const formattedHeatmapData = useMemo(() => {
    if (!heatmapData) return [];
    return heatmapData.map((item) => ({
      date: item.date,
      count: item.count,
    }));
  }, [heatmapData]);

  const signOutMutation = trpc.signOut.useMutation({
    onSuccess: () => {
      onSignOut();
    },
  });

  const handleDayClick = (date: string) => {
    navigate(`/history?from=${date}`);
  };

  const getPercentage = (count: number, total: number) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🕵️</span>
            <span className="font-heading text-2xl text-foreground">
              Historian
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/add">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </Link>
            <Link to="/history">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </Link>
            <Link to="/connections">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Connections
              </Button>
            </Link>
            <Link to="/docs">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Docs
              </Button>
            </Link>
            <Link to="/settings">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOutMutation.mutate()}
              disabled={signOutMutation.isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {signOutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-heading text-4xl text-foreground mb-2">
              Namaste{user?.name ? `, ${user.name}!` : "!"}
            </h1>
            <p className="text-muted-foreground">Your history at a glance</p>
          </div>

          <div
            className="grid gap-6 grid-cols-2 lg:grid-cols-4 animate-scale-in"
            style={{ animationDelay: "100ms" }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="font-medium text-foreground text-lg">
                      {(stats?.totalCount ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <History className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Content Types</p>
                    <p className="font-medium text-foreground text-lg">
                      {stats?.byType?.length ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-lg">
                        {activitySummary?.thisWeekCount ?? 0}
                      </p>
                      {activitySummary != null &&
                        activitySummary.lastWeekCount > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            {activitySummary.thisWeekCount >
                            activitySummary.lastWeekCount ? (
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            ) : activitySummary.thisWeekCount <
                                activitySummary.lastWeekCount ? (
                              <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                            {activitySummary.lastWeekCount} last week
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="font-medium text-foreground text-lg">
                      {activitySummary?.todayCount ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className="mt-8 grid gap-6 lg:grid-cols-3 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="lg:col-span-2">
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow h-full">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-foreground">
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityHeatmap
                    data={formattedHeatmapData}
                    onDayClick={handleDayClick}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-6">
              <RecentActivity
                visits={recentVisits ?? []}
                limit={8}
                className="flex-1 min-h-0"
              />
            </div>
          </div>

          {weeklyData && weeklyData.length >= 0 && (
            <div
              className="mt-8 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <WeeklyActivityChart data={weeklyData} />
            </div>
          )}

          {stats?.byType && stats.byType.length > 0 && (
            <div
              className="mt-8 animate-fade-in"
              style={{ animationDelay: "500ms" }}
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-foreground">
                    History by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-8 items-center">
                    <div className="relative w-64 h-64">
                      {(() => {
                        const colors = [
                          "#3b82f6",
                          "#10b981",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                          "#ec4899",
                          "#06b6d4",
                          "#84cc16",
                          "#f97316",
                          "#6366f1",
                          "#14b8a6",
                          "#a855f7",
                        ];
                        let currentAngle = 0;
                        const gradients = stats.byType.map((type, index) => {
                          const percentage = getPercentage(
                            type.count,
                            stats.totalCount,
                          );
                          const angle = (percentage / 100) * 360;
                          const color = colors[index % colors.length];
                          const gradient = `${color} ${currentAngle}deg ${currentAngle + angle}deg`;
                          currentAngle += angle;
                          return gradient;
                        });
                        const conicGradient = `conic-gradient(${gradients.join(", ")})`;
                        return (
                          <div
                            className="w-full h-full rounded-full shadow-2xl"
                            style={{
                              background: conicGradient,
                              boxShadow: "0 0 40px rgba(59, 130, 246, 0.15)",
                            }}
                          />
                        );
                      })()}
                      <div className="absolute inset-4 rounded-full bg-background dark:bg-gray-950 flex flex-col items-center justify-center shadow-inner">
                        <p className="text-3xl font-bold text-foreground">
                          {stats.byType.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Types</p>
                      </div>
                    </div>
                    <div className="flex-1 grid gap-3 md:grid-cols-2 w-full">
                      {stats.byType.map((type, index) => {
                        const colors = [
                          "#3b82f6",
                          "#10b981",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                          "#ec4899",
                          "#06b6d4",
                          "#84cc16",
                          "#f97316",
                          "#6366f1",
                          "#14b8a6",
                          "#a855f7",
                        ];
                        const percentage = getPercentage(
                          type.count,
                          stats.totalCount,
                        );
                        return (
                          <Link
                            to={`/history?type=${type.type}`}
                            key={type.type}
                            className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer group"
                          >
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                              style={{
                                backgroundColor: colors[index % colors.length],
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground font-medium truncate">
                                {type.type}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {Number(type.count).toLocaleString()} items
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-foreground">
                                {percentage}%
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
