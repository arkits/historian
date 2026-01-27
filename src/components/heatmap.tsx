import { useMemo, useState, useRef } from "react";
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
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = (e: React.MouseEvent) => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    // Position tooltip closer to cursor with smaller offset
    const x = e.clientX + 8;
    const y = e.clientY - 8;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  };

  return (
    <div
      className="relative inline-block w-full h-full"
      onMouseEnter={(e) => {
        setIsVisible(true);
        updatePosition(e);
      }}
      onMouseLeave={() => setIsVisible(false)}
      onMouseMove={updatePosition}
      onClick={() => onDayClick?.(day.date)}
    >
      {children}
      <div
        ref={tooltipRef}
        className="fixed z-50 px-3 py-1.5 text-xs bg-popover text-popover-foreground border border-border rounded-md shadow-md pointer-events-none opacity-0 transition-opacity"
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div className="font-medium">
          {day.count} {day.count === 1 ? "entry" : "entries"}
        </div>
        <div className="text-muted-foreground">{formatDate(day.date)}</div>
      </div>
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

    const days: Date[] = [];
    const dateStrSet = new Set<string>();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
      // Store date string in YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      dateStrSet.add(`${year}-${month}-${day}`);
    }

    // Group days into weeks, ensuring each week starts on Sunday (day 0)
    const weeksArr: Date[][] = [];
    let currentWeek: Date[] = [];

    days.forEach((day) => {
      const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // If this is a Sunday (day 0) and we have a week in progress, start a new week
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        // Pad the previous week to start on Sunday
        while (currentWeek.length < 7) {
          const prevDate = new Date(currentWeek[0]!);
          prevDate.setDate(prevDate.getDate() - 1);
          currentWeek.unshift(prevDate);
        }
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // If we've completed a full week (Sunday to Saturday), add it
      if (currentWeek.length === 7 && currentWeek[0]!.getDay() === 0) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add the last incomplete week and pad it to start on Sunday
    if (currentWeek.length > 0) {
      // Find the first day of the week (Sunday) for the first day in currentWeek
      const firstDay = currentWeek[0]!;
      const firstDayOfWeek = firstDay.getDay();
      
      // Prepend days to make the week start on Sunday
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const prevDate = new Date(firstDay);
        prevDate.setDate(prevDate.getDate() - (i + 1));
        currentWeek.unshift(prevDate);
      }
      
      // Pad to 7 days if needed
      while (currentWeek.length < 7) {
        const lastDate = currentWeek[currentWeek.length - 1]!;
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 1);
        currentWeek.push(nextDate);
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

    return { weeks: weeksArr, monthLabels: monthMap, dateRangeSet: dateStrSet };
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
              gridTemplateRows: "repeat(7, minmax(0, 1fr))",
            }}
          >
            {/* Transpose: iterate by day of week (row: 0=Sunday, 1=Monday, etc.), then by week (column) */}
            {/* Since weeks are now aligned to start on Sunday, week[0] is Sunday, week[1] is Monday, etc. */}
            {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeekIndex) =>
              weeks.map((week, weekIndex) => {
                const day = week[dayOfWeekIndex];
                if (!day) return null;
                
                // Format date consistently using local date (YYYY-MM-DD)
                const year = day.getFullYear();
                const month = String(day.getMonth() + 1).padStart(2, "0");
                const date = String(day.getDate()).padStart(2, "0");
                const dateStr = `${year}-${month}-${date}`;
                
                // Only show data for days within our 365-day range
                const isInRange = days.some((d) => {
                  const dYear = d.getFullYear();
                  const dMonth = String(d.getMonth() + 1).padStart(2, "0");
                  const dDate = String(d.getDate()).padStart(2, "0");
                  return `${dYear}-${dMonth}-${dDate}` === dateStr;
                });
                
                const dayData = isInRange ? heatmapData.get(dateStr) : undefined;
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
