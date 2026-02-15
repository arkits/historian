import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface RecentVisit {
  id: string;
  url: string;
  title: string;
  domain: string;
  visitTime: string;
}

interface RecentActivityProps {
  visits: RecentVisit[];
  limit?: number;
  className?: string;
}

function formatVisitTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

export function RecentActivity({
  visits,
  limit = 8,
  className,
}: RecentActivityProps) {
  const display = visits.slice(0, limit);

  return (
    <Card className={`border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow ${className ?? ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-xl text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent activity
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
        {display.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No recent history. Add items or sync from connections.
          </p>
        ) : (
          <ul className="space-y-2">
            {display.map((v) => (
              <li key={v.id}>
                <Link
                  to={`/history/${v.id}`}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                      {v.title || v.domain || "Untitled"}
                    </p>
                    {(v.domain || v.url) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {v.domain ||
                          (() => {
                            try {
                              return v.url ? new URL(v.url).hostname : "";
                            } catch {
                              return v.url?.slice(0, 30) ?? "";
                            }
                          })()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatVisitTime(v.visitTime)}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
