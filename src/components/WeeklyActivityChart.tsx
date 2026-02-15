import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

interface WeekDatum {
  weekStart: string;
  count: number;
}

interface WeeklyActivityChartProps {
  data: WeekDatum[];
  className?: string;
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  const day = d.getDate();
  const month = SHORT_MONTHS[d.getMonth()];
  return `${day} ${month}`;
}

export function WeeklyActivityChart({ data, className }: WeeklyActivityChartProps) {
  const { bars, maxCount } = useMemo(() => {
    const now = new Date();
    const weeks: WeekDatum[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay() - i * 7);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const date = String(d.getDate()).padStart(2, "0");
      const weekStart = `${year}-${month}-${date}`;
      const found = data.find(
        (r) => String(r.weekStart).slice(0, 10) === weekStart,
      );
      weeks.push({ weekStart, count: found ? found.count : 0 });
    }
    const max = Math.max(...weeks.map((w) => w.count), 1);
    return { bars: weeks, maxCount: max };
  }, [data]);

  return (
    <Card className={`border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow ${className ?? ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-xl text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Last 12 weeks
          </CardTitle>
          <Link
            to="/history"
            className="text-xs text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1.5 h-32">
          {bars.map((bar) => (
            <div
              key={bar.weekStart}
              className="flex-1 flex flex-col items-center gap-1 group"
              title={`${formatWeekLabel(bar.weekStart)}: ${bar.count} items`}
            >
              <div
                className="w-full min-h-[4px] rounded-t-md bg-primary/80 transition-all duration-300 hover:bg-primary"
                style={{
                  height: `${Math.max(4, (bar.count / maxCount) * 100)}%`,
                }}
              />
              <span className="text-[10px] text-muted-foreground truncate max-w-full rotate-0 group-hover:text-foreground">
                {formatWeekLabel(bar.weekStart)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
