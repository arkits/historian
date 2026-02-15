import { useState } from "react";
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
  Link2,
  Check,
  X,
  Music,
  Play,
  MessageCircle,
  Globe,
  Key,
  Loader2,
} from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { trpc } from "@/client/trpc";
import { getApiUrl } from "@/lib/api-url";

interface ConnectionsPageProps {
  onSignOut?: () => void;
}

type ConnectionStatus = "connected" | "disconnected" | "pending";

interface ServiceConnection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: ConnectionStatus;
  lastSynced?: string;
}

const YOUTUBE_READONLY_SCOPE =
  "https://www.googleapis.com/auth/youtube.readonly";
const SPOTIFY_RECENTLY_PLAYED_SCOPE = "user-read-recently-played";

export function ConnectionsPage({ onSignOut }: ConnectionsPageProps) {
  const utils = trpc.useUtils();
  const { data: youtubeConnection } = trpc.getYoutubeConnection.useQuery();
  const syncYoutubeMutation = trpc.syncYoutubeHistory.useMutation({
    onSuccess: () => {
      utils.getYoutubeConnection.invalidate();
    },
  });
  const disconnectYoutubeMutation = trpc.disconnectYoutube.useMutation({
    onSuccess: () => {
      utils.getYoutubeConnection.invalidate();
    },
  });
  const { data: spotifyConnection } = trpc.getSpotifyConnection.useQuery();
  const syncSpotifyMutation = trpc.syncSpotifyHistory.useMutation({
    onSuccess: () => {
      utils.getSpotifyConnection.invalidate();
    },
  });
  const disconnectSpotifyMutation = trpc.disconnectSpotify.useMutation({
    onSuccess: () => {
      utils.getSpotifyConnection.invalidate();
    },
  });

  const [connections, setConnections] = useState<ServiceConnection[]>([
    {
      id: "reddit",
      name: "Reddit",
      description: "Import your post history, comments, and saved content",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "#FF4500",
      status: "disconnected",
    },
    {
      id: "spotify",
      name: "Spotify",
      description: "Sync your recently played tracks",
      icon: <Music className="w-6 h-6" />,
      color: "#1DB954",
      status: "disconnected",
    },
    {
      id: "youtube",
      name: "YouTube",
      description: "Import your liked videos (connect with Google)",
      icon: <Play className="w-6 h-6" />,
      color: "#FF0000",
      status: "disconnected",
    },
    {
      id: "chrome",
      name: "Chrome Extension",
      description: "Track your browsing activity automatically",
      icon: <Globe className="w-6 h-6" />,
      color: "#4285F4",
      status: "disconnected",
    },
    {
      id: "api",
      name: "API Key",
      description: "Connect custom applications and integrations",
      icon: <Key className="w-6 h-6" />,
      color: "#6B7280",
      status: "connected",
      lastSynced: "2024-01-05",
    },
  ]);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [youtubeLastSynced, setYoutubeLastSynced] = useState<string | null>(
    null,
  );
  const [youtubeConnectError, setYoutubeConnectError] = useState<string | null>(
    null,
  );
  const [youtubeConnectPending, setYoutubeConnectPending] = useState(false);
  const [spotifyLastSynced, setSpotifyLastSynced] = useState<string | null>(
    null,
  );
  const [spotifyConnectError, setSpotifyConnectError] = useState<string | null>(
    null,
  );
  const [spotifyConnectPending, setSpotifyConnectPending] = useState(false);

  const startSocialConnect = ({
    provider,
    scopes,
    setError,
    setPending,
  }: {
    provider: string;
    scopes: string[];
    setError: (value: string | null) => void;
    setPending: (value: boolean) => void;
  }) => {
    setError(null);
    setPending(true);
    const token = localStorage.getItem("auth-token");
    if (!token) {
      setError("Please sign in again.");
      setPending(false);
      return;
    }
    const base = getApiUrl("");
    const linkSocialUrl = base
      ? `${base.replace(/\/$/, "")}/api/auth/link-social`
      : `${window.location.origin}/api/auth/link-social`;
    const callbackURL = `${window.location.origin}/dashboard/connections`;
    fetch(linkSocialUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        provider,
        scopes,
        callbackURL,
        disableRedirect: true,
      }),
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          url?: string;
          message?: string;
          redirect?: boolean;
        };
        if (!res.ok) {
          setError(data?.message ?? "Could not start connection");
          setPending(false);
          return;
        }
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        if (data?.redirect === false) {
          setError("Already linked. Try syncing instead.");
        } else {
          setError("No redirect URL received.");
        }
        setPending(false);
      })
      .catch((err) => {
        setError(
          err?.message ?? "Could not start connection. Please try again.",
        );
        setPending(false);
      });
  };

  const handleConnect = (id: string) => {
    if (id === "youtube") {
      startSocialConnect({
        provider: "google",
        scopes: [YOUTUBE_READONLY_SCOPE],
        setError: setYoutubeConnectError,
        setPending: setYoutubeConnectPending,
      });
      return;
    }
    if (id === "spotify") {
      startSocialConnect({
        provider: "spotify",
        scopes: [SPOTIFY_RECENTLY_PLAYED_SCOPE],
        setError: setSpotifyConnectError,
        setPending: setSpotifyConnectPending,
      });
      return;
    }
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === id
          ? { ...conn, status: "connected" as ConnectionStatus }
          : conn,
      ),
    );
  };

  const handleDisconnect = (id: string) => {
    if (id === "youtube") {
      disconnectYoutubeMutation.mutate(undefined);
      return;
    }
    if (id === "spotify") {
      disconnectSpotifyMutation.mutate(undefined);
      return;
    }
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === id
          ? { ...conn, status: "disconnected" as ConnectionStatus }
          : conn,
      ),
    );
  };

  const handleSyncYoutube = () => {
    syncYoutubeMutation.mutate(undefined, {
      onSuccess: (result) => {
        if ("synced" in result && result.synced > 0) {
          setYoutubeLastSynced(new Date().toISOString());
        }
      },
    });
  };

  const handleSyncSpotify = () => {
    syncSpotifyMutation.mutate(undefined, {
      onSuccess: (result) => {
        if ("synced" in result && result.synced > 0) {
          setSpotifyLastSynced(new Date().toISOString());
        }
      },
    });
  };

  const handleCreateApiKey = () => {
    const key = `hst_${crypto.randomUUID().replace(/-/g, "")}`;
    setNewApiKey(key);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <NavBar title="Connections" onSignOut={onSignOut} showBack />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-4xl text-foreground mb-2">
              Connect Your Services
            </h1>
            <p className="text-muted-foreground">
              Import history from your favorite platforms and track your digital
              life
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {connections.map((connection) => {
              const isYoutube = connection.id === "youtube";
              const isSpotify = connection.id === "spotify";
              const status: ConnectionStatus = isYoutube
                ? youtubeConnectPending
                  ? "pending"
                  : youtubeConnection?.connected
                    ? "connected"
                    : "disconnected"
                : isSpotify
                  ? spotifyConnectPending
                    ? "pending"
                    : spotifyConnection?.connected
                      ? "connected"
                      : "disconnected"
                  : connection.status;
              const lastSynced = isYoutube
                ? youtubeLastSynced ?? connection.lastSynced
                : isSpotify
                  ? spotifyLastSynced ?? connection.lastSynced
                : connection.lastSynced;
              const disconnectPending =
                (isYoutube && disconnectYoutubeMutation.isPending) ||
                (isSpotify && disconnectSpotifyMutation.isPending);
              return (
                <Card
                  key={connection.id}
                  className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow hover:border-primary/30 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: `${connection.color}20`,
                            color: connection.color,
                          }}
                        >
                          {connection.icon}
                        </div>
                        <div>
                          <CardTitle className="font-heading text-xl text-foreground">
                            {connection.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {connection.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                          status === "connected"
                            ? "bg-green-500/10 text-green-500"
                            : status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {status === "connected" ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Connected
                          </>
                        ) : status === "pending" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Pending
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3.5 h-3.5" />
                            Not connected
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {status === "connected" ? (
                      <div className="space-y-4">
                        {lastSynced && (
                          <p className="text-sm text-muted-foreground">
                            Last synced:{" "}
                            {new Date(lastSynced).toLocaleDateString()}
                          </p>
                        )}
                        {isYoutube && syncYoutubeMutation.isError && (
                          <p className="text-sm text-destructive">
                            {syncYoutubeMutation.error.message}
                          </p>
                        )}
                        {isSpotify && syncSpotifyMutation.isError && (
                          <p className="text-sm text-destructive">
                            {syncSpotifyMutation.error.message}
                          </p>
                        )}
                        {isYoutube &&
                          syncYoutubeMutation.data &&
                          "error" in syncYoutubeMutation.data &&
                          syncYoutubeMutation.data.error === "not_connected" && (
                            <p className="text-sm text-muted-foreground">
                              Reconnect to sync.
                            </p>
                          )}
                        {isSpotify &&
                          syncSpotifyMutation.data &&
                          "error" in syncSpotifyMutation.data &&
                          syncSpotifyMutation.data.error === "not_connected" && (
                            <p className="text-sm text-muted-foreground">
                              Reconnect to sync.
                            </p>
                          )}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDisconnect(connection.id)}
                            disabled={disconnectPending}
                          >
                            {disconnectPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <X className="w-4 h-4 mr-2" />
                            )}
                            Disconnect
                          </Button>
                          {isYoutube ? (
                            <Button
                              variant="default"
                              className="flex-1"
                              onClick={handleSyncYoutube}
                              disabled={syncYoutubeMutation.isPending}
                            >
                              {syncYoutubeMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Loader2 className="w-4 h-4 mr-2" />
                              )}
                              Sync Now
                            </Button>
                          ) : isSpotify ? (
                            <Button
                              variant="default"
                              className="flex-1"
                              onClick={handleSyncSpotify}
                              disabled={syncSpotifyMutation.isPending}
                            >
                              {syncSpotifyMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Loader2 className="w-4 h-4 mr-2" />
                              )}
                              Sync Now
                            </Button>
                          ) : (
                            <Button variant="default" className="flex-1">
                              <Loader2 className="w-4 h-4 mr-2" />
                              Sync Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {isYoutube && youtubeConnectError && (
                          <p className="text-sm text-destructive">
                            {youtubeConnectError}
                          </p>
                        )}
                        {isSpotify && spotifyConnectError && (
                          <p className="text-sm text-destructive">
                            {spotifyConnectError}
                          </p>
                        )}
                        <Button
                          data-testid={isYoutube ? "connect-youtube" : undefined}
                          className="w-full"
                          style={{ backgroundColor: connection.color }}
                          onClick={() => handleConnect(connection.id)}
                          disabled={
                            (isYoutube && youtubeConnectPending) ||
                            (isSpotify && spotifyConnectPending)
                          }
                        >
                          {(isYoutube && youtubeConnectPending) ||
                          (isSpotify && spotifyConnectPending) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Link2 className="w-4 h-4 mr-2" />
                          )}
                          Connect {connection.name}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 border-border/50 bg-card/95 backdrop-blur-xl raycast-shadow">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                Create API Key
              </CardTitle>
              <CardDescription>
                Generate an API key to connect custom applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!newApiKey ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., My Custom App"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowApiKeyModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleCreateApiKey}
                      disabled={!newApiKeyName.trim()}
                    >
                      Generate Key
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-sm font-medium text-green-500 mb-2">
                      Your new API key:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-3 bg-background/50 rounded font-mono text-sm break-all">
                        {newApiKey}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(newApiKey)}
                      >
                        {copiedKey ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Link2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Make sure to copy your key now. You won't be able to see
                      it again.
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowApiKeyModal(false);
                      setNewApiKey(null);
                      setNewApiKeyName("");
                    }}
                  >
                    Done
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
