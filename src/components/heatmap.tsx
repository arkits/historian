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
  onDayClick?: (date: string) => void;
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
  onDayClick?: (date: string) => void;
}

function Tooltip({ day, children, onDayClick }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block w-full h-full group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => onDayClick?.(day.date)}
    >
      {children}
      {isVisible && (
        <div
          className="absolute z-50 px-3 py-1.5 text-xs bg-popover text-popover-foreground border border-border rounded-md shadow-md pointer-events-none whitespace-nowrap"
          style={{
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-medium">
            {day.count} {day.count === 1 ? "entry" : "entries"}
          </div>
          <div className="text-muted-foreground">{formatDate(day.date)}</div>
        </div>
      )}
    </div>
  );
}

export function ActivityHeatmap({ data, className, onDayClick }: HeatmapProps) {
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

  const { weeks, monthLabels, dateRangeSet } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start date: 365 days ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Set of dates in our 365-day range (YYYY-MM-DD)
    const dateStrSet = new Set<string>();
    for (let i = 0; i <= 364; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      dateStrSet.add(`${year}-${month}-${day}`);
    }

    // Sunday of the week containing startDate
    const firstSunday = new Date(startDate);
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

    // Calendar weeks (Sun–Sat) from firstSunday until we pass today
    const weeksArr: Date[][] = [];
    let currentSunday = new Date(firstSunday);

    while (currentSunday <= today) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentSunday);
        date.setDate(date.getDate() + i);
        week.push(date);
      }
      weeksArr.push(week);
      currentSunday.setDate(currentSunday.getDate() + 7);
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

    return { weeks: weeksArr, monthLabels: monthMap, dateRangeSet: dateStrSet };
  }, []);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-end mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-0.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted/40" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/30" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/50" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/70" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="w-full">
          {/* Month labels row */}
          <div
            className="grid mb-1"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >
            {weeks.map((week, weekIndex) => {
              const label = monthLabels.find((m) => m.weekIndex === weekIndex);
              return (
                <div
                  key={weekIndex}
                  className="text-[10px] text-muted-foreground truncate"
                >
                  {label?.month ?? ""}
                </div>
              );
            })}
          </div>

          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
              gridTemplateRows: "repeat(7, minmax(0, 1fr))",
            }}
          >
            {/* Rows = day of week (0=Sun … 6=Sat), columns = weeks */}
            {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeekIndex) =>
              weeks.map((week, weekIndex) => {
                const day = week[dayOfWeekIndex];
                if (!day) return <div key={`${weekIndex}-${dayOfWeekIndex}`} />;

                const year = day.getFullYear();
                const month = String(day.getMonth() + 1).padStart(2, "0");
                const date = String(day.getDate()).padStart(2, "0");
                const dateStr = `${year}-${month}-${date}`;

                if (!dateRangeSet.has(dateStr)) {
                  return <div key={`${weekIndex}-${dayOfWeekIndex}`} />;
                }

                const dayData = heatmapData.get(dateStr);
                const count = dayData?.count ?? 0;
                const colorClass = getLevelColor(count, maxCount);

                return (
                  <Tooltip
                    key={`${weekIndex}-${dayOfWeekIndex}`}
                    day={{ date: dateStr, count }}
                    onDayClick={onDayClick}
                  >
                    <div
                      className={cn(
                        "aspect-square rounded-sm transition-all duration-150 hover:ring-1 hover:ring-primary/60 cursor-pointer",
                        colorClass,
                      )}
                    />
                  </Tooltip>
                );
              }),
            )}
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
