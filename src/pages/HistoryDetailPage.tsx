import { useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  ExternalLink,
  Trash2,
  Loader2,
  Image,
  Link as LinkIcon,
} from "lucide-react";

interface HistoryDetailPageProps {
  onSignOut?: () => void;
}

function ResponsiveIframe({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modifiedHtml, setModifiedHtml] = useState(html);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const iframe = container.querySelector("iframe");
    if (iframe) {
      iframe.style.maxWidth = "100%";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.minHeight = "300px";
      iframe.style.border = "none";
    }

    const videos = container.querySelectorAll("video");
    videos.forEach((video) => {
      video.style.maxWidth = "100%";
      video.style.width = "100%";
    });

    const objects = container.querySelectorAll("object");
    objects.forEach((obj) => {
      obj.style.maxWidth = "100%";
      obj.style.width = "100%";
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-lg bg-accent/30"
      dangerouslySetInnerHTML={{ __html: modifiedHtml }}
    />
  );
}

export function HistoryDetailPage({ onSignOut }: HistoryDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const {
    data: item,
    isLoading,
    isError,
  } = trpc.getHistoryById.useQuery({ id: id! }, { enabled: !!id });
  const deleteMutation = trpc.deleteHistory.useMutation({
    onSuccess: () => {
      window.location.href = "/history";
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">History item not found</p>
          <Link to="/history">
            <Button>Back to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  const content = item.content as Record<string, unknown>;
  const title =
    (content.title as string) || (content.name as string) || "Unknown";
  const description = content.description as string;
  const url = content.url as string;
  const contentUrl = content.content_url as string;
  const thumbnail = content.thumbnail as string;
  const mediaEmbed = content.media_embed as { content?: string };
  const mediaEmbedContent = mediaEmbed?.content;

  const hasMedia = thumbnail || mediaEmbedContent;

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/history">
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
              <span className="text-3xl">🕵️</span>
              <span className="font-heading text-2xl text-foreground">
                History Details
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow mb-6">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {item.type.toLowerCase()}
                </span>
              </div>
              <CardTitle className="font-heading text-3xl text-foreground">
                {title}
              </CardTitle>
              {description && (
                <p className="text-muted-foreground mt-2">{description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {url && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/30">
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {url}
                      </a>
                    </div>
                  )}

                  {contentUrl && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/30">
                      <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {contentUrl}
                      </a>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-lg bg-accent/30">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        Timeline Time
                      </div>
                      <p className="font-medium text-foreground">
                        {formatDate(item.timelineTime)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/30">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        Created
                      </div>
                      <p className="font-medium text-foreground">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-lg bg-accent/30">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Tag className="w-4 h-4" />
                        Type
                      </div>
                      <p className="font-medium text-foreground lowercase">
                        {item.type.toLowerCase()}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/30">
                      <div className="text-sm text-muted-foreground mb-1">
                        Content ID
                      </div>
                      <p className="font-mono text-sm text-foreground truncate">
                        {item.contentId}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      onClick={() => deleteMutation.mutate({ id: item.id })}
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {mediaEmbedContent ? (
                    <ResponsiveIframe html={mediaEmbedContent} />
                  ) : thumbnail ? (
                    <div className="rounded-lg overflow-hidden bg-accent/30">
                      <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-auto"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>ID: {item.id}</p>
            <p className="mt-1">
              Last updated: {formatDateShort(item.createdAt)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
