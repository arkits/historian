import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selected?: Date | { from: Date; to: Date };
  onSelect?: (date: Date | { from: Date; to: Date } | undefined) => void;
  mode?: "single" | "range";
  className?: string;
}

export function Calendar({
  selected,
  onSelect,
  mode = "single",
  className,
}: CalendarProps) {
  const [viewDate, setViewDate] = React.useState<Date>(new Date());

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isSelected = (date: Date) => {
    if (!selected) return false;
    if (mode === "single" && selected instanceof Date) {
      return date.toDateString() === selected.toDateString();
    }
    if (mode === "range" && "from" in selected && "to" in selected) {
      return date >= selected.from && date <= selected.to;
    }
    return false;
  };

  const isInRange = (date: Date) => {
    if (mode === "range" && selected && "from" in selected && selected.to) {
      return date > selected.from && date < selected.to;
    }
    return false;
  };

  const isRangeStart = (date: Date) => {
    if (mode === "range" && selected && "from" in selected) {
      return date.toDateString() === selected.from.toDateString();
    }
    return false;
  };

  const isRangeEnd = (date: Date) => {
    if (mode === "range" && selected && "to" in selected) {
      return date.toDateString() === selected.to.toDateString();
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (mode === "single") {
      onSelect?.(date);
    } else if (mode === "range") {
      if (!selected || !("from" in selected)) {
        onSelect?.({ from: date, to: date });
      } else if (selected && "from" in selected && !selected.to) {
        if (date < selected.from) {
          onSelect?.({ from: date, to: selected.from });
        } else {
          onSelect?.({ from: selected.from, to: date });
        }
      } else {
        onSelect?.({ from: date, to: date });
      }
    }
  };

  const getDateClass = (date: Date) => {
    const base =
      "h-8 w-8 text-xs rounded-md flex items-center justify-center cursor-pointer transition-colors";
    if (isSelected(date)) {
      return cn(base, "bg-primary text-primary-foreground hover:bg-primary/90");
    }
    if (isInRange(date)) {
      return cn(base, "bg-primary/20 text-foreground hover:bg-primary/30");
    }
    if (isRangeStart(date)) {
      return cn(
        base,
        "bg-primary/30 text-foreground rounded-l-md rounded-r-none",
      );
    }
    if (isRangeEnd(date)) {
      return cn(
        base,
        "bg-primary/30 text-foreground rounded-r-md rounded-l-none",
      );
    }
    return cn(base, "text-foreground hover:bg-accent");
  };

  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1),
  );

  return (
    <div
      className={cn(
        "p-3 bg-popover border border-border rounded-lg shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="p-1 rounded hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded hover:bg-accent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-6 w-8 text-[10px] text-muted-foreground flex items-center justify-center font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-8 w-8" />
        ))}
        {days.map((date) => (
          <div
            key={date.toISOString()}
            onClick={() => handleDateClick(date)}
            className={getDateClass(date)}
          >
            {date.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}
