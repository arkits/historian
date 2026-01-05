import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface HeatmapDay {
  date: string;
  count: number;
  details?: string[];
}

interface HeatmapProps {
  data: HeatmapDay[];
  className?: string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getLevelColor = (count: number, max: number): string => {
  if (count === 0) return "bg-muted/40";
  const ratio = count / max;
  if (ratio <= 0.25) return "bg-primary/30";
  if (ratio <= 0.5) return "bg-primary/50";
  if (ratio <= 0.75) return "bg-primary/70";
  return "bg-primary";
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface TooltipProps {
  day: HeatmapDay;
  children: React.ReactNode;
}

function Tooltip({ day, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const showTooltip = (e: React.MouseEvent) => {
    setIsVisible(true);
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block w-full h-full"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onMouseMove={showTooltip}
    >
      {children}
      {isVisible && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-popover text-popover-foreground border border-border rounded-md shadow-md pointer-events-none"
          style={{
            left: Math.min(position.x + 10, window.innerWidth - 200),
            top: position.y - 45,
          }}
        >
          <div className="font-medium">{day.count} entries</div>
          <div className="text-xs text-muted-foreground">
            {formatDate(day.date)}
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivityHeatmap({ data, className }: HeatmapProps) {
  const heatmapData = useMemo(() => {
    const dataMap = new Map<string, HeatmapDay>();
    data.forEach((day) => {
      dataMap.set(day.date, day);
    });
    return dataMap;
  }, [data]);

  const maxCount = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    const weeksArr: Date[][] = [];
    let currentWeek: Date[] = [];

    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const prevDate = new Date(currentWeek[0]!);
        prevDate.setDate(prevDate.getDate() - 1);
        currentWeek.unshift(prevDate);
      }
      weeksArr.push(currentWeek);
    }

    const monthMap: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeksArr.forEach((week, weekIndex) => {
      const firstDay = week[0]!;
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        monthMap.push({ month: MONTHS[month]!, weekIndex });
        lastMonth = month;
      }
    });

    return { weeks: weeksArr, monthLabels: monthMap };
  }, []);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-base text-foreground">Activity</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-[1px] bg-muted/40" />
              <div className="w-3 h-3 rounded-[1px] bg-primary/30" />
              <div className="w-3 h-3 rounded-[1px] bg-primary/50" />
              <div className="w-3 h-3 rounded-[1px] bg-primary/70" />
              <div className="w-3 h-3 rounded-[1px] bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="w-full">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >
            {weeks.map((week, weekIndex) =>
              week.map((day) => {
                const dateStr = day.toISOString().split("T")[0] ?? "";
                const dayData = heatmapData.get(dateStr);
                const count = dayData?.count ?? 0;
                const colorClass = getLevelColor(count, maxCount);

                return (
                  <Tooltip key={dateStr} day={{ date: dateStr, count }}>
                    <div
                      className={cn(
                        "aspect-square rounded-[1px] transition-all duration-150 hover:ring-1 hover:ring-primary/60 cursor-pointer",
                        colorClass,
                      )}
                    />
                  </Tooltip>
                );
              }),
            )}
          </div>

          <div className="flex mt-1 relative h-4 w-full">
            {monthLabels.map(({ month, weekIndex }) => (
              <div
                key={`${month}-${weekIndex}`}
                className="text-[10px] text-muted-foreground absolute"
                style={{
                  left: `${(weekIndex / weeks.length) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {month}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function generateMockData(): HeatmapDay[] {
  const data: HeatmapDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dateStr = date.toISOString().split("T")[0] ?? "";
    const count = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 15) + 1;

    data.push({
      date: dateStr,
      count,
      details:
        count > 0 ? [`${count} history entries on ${formatDate(dateStr)}`] : [],
    });
  }

  return data;
}
