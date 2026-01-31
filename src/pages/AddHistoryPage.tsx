import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { NavBar } from "@/components/NavBar";

interface AddHistoryPageProps {
  onSignOut?: () => void;
}

const HISTORY_TYPES = [
  { value: "browser", label: "Browser", icon: "🌐" },
  { value: "search", label: "Search", icon: "🔍" },
  { value: "video", label: "Video", icon: "🎬" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "document", label: "Document", icon: "📄" },
  { value: "image", label: "Image", icon: "🖼️" },
  { value: "link", label: "Link", icon: "🔗" },
  { value: "code", label: "Code", icon: "💻" },
  { value: "book", label: "Book", icon: "📚" },
  { value: "news", label: "News", icon: "📰" },
  { value: "social", label: "Social", icon: "👥" },
  { value: "shopping", label: "Shopping", icon: "🛒" },
];

export function AddHistoryPage({ onSignOut }: AddHistoryPageProps) {
  const navigate = useNavigate();
  const [type, setType] = useState("browser");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [favicon, setFavicon] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [jsonContent, setJsonContent] = useState("");
  const [useJsonMode, setUseJsonMode] = useState(false);
  const [error, setError] = useState("");

  const createHistoryMutation = trpc.createHistory.useMutation({
    onSuccess: () => {
      navigate("/history");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const generateContentId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `manual-${timestamp}-${random}`;
  };

  const getCurrentContent = () => {
    if (useJsonMode) {
      try {
        return JSON.parse(jsonContent);
      } catch {
        return null;
      }
    }
    return {
      title,
      url: url || undefined,
      description: description || undefined,
      favicon: favicon || undefined,
      thumbnail: thumbnail || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (useJsonMode) {
      try {
        JSON.parse(jsonContent);
      } catch {
        setError("Invalid JSON format in content field");
        return;
      }
    } else {
      if (!title.trim()) {
        setError("Title is required");
        return;
      }
    }

    const content = getCurrentContent();
    if (!content) {
      setError("Invalid content JSON");
      return;
    }

    const contentId = generateContentId();
    const searchContent = useJsonMode
      ? JSON.stringify(content)
      : `${title} ${description || ""} ${url || ""}`.trim();

    createHistoryMutation.mutate({
      timelineTime: new Date(date).toISOString(),
      type,
      contentId,
      content: content as Record<string, unknown>,
      searchContent: searchContent || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar title="Add History" onSignOut={onSignOut} showBack />

      <main className="flex-1 pt-16 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Add History Entry
              </CardTitle>
              <CardDescription>
                Manually add a history record to your timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {HISTORY_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            <span className="flex items-center gap-2">
                              <span>{t.icon}</span>
                              {t.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Page title, video name, etc."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={useJsonMode}
                    required={!useJsonMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={useJsonMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description or notes"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={useJsonMode}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <Input
                      id="favicon"
                      type="url"
                      placeholder="https://example.com/favicon.ico"
                      value={favicon}
                      onChange={(e) => setFavicon(e.target.value)}
                      disabled={useJsonMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      type="url"
                      placeholder="https://example.com/thumb.jpg"
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      disabled={useJsonMode}
                    />
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="jsonMode"
                      checked={useJsonMode}
                      onChange={(e) => {
                        setUseJsonMode(e.target.checked);
                        if (e.target.checked) {
                          setJsonContent(
                            JSON.stringify(
                              {
                                title,
                                url: url || undefined,
                                description: description || undefined,
                                favicon: favicon || undefined,
                                thumbnail: thumbnail || undefined,
                              },
                              null,
                              2,
                            ),
                          );
                        }
                      }}
                      className="rounded border-border"
                    />
                    <Label
                      htmlFor="jsonMode"
                      className="text-sm cursor-pointer"
                    >
                      Edit content as JSON (advanced)
                    </Label>
                  </div>

                  {useJsonMode && (
                    <textarea
                      id="jsonContent"
                      value={jsonContent}
                      onChange={(e) => setJsonContent(e.target.value)}
                      className="w-full h-40 p-3 rounded-md border border-border bg-accent/30 text-sm font-mono"
                      placeholder="{}"
                      spellCheck={false}
                    />
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link to="/history" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createHistoryMutation.isPending}
                  >
                    {createHistoryMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Entry
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>The content ID will be automatically generated</p>
          </div>
        </div>
      </main>
    </div>
  );
}
