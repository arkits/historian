import { useState } from "react";
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

export function ConnectionsPage({ onSignOut }: ConnectionsPageProps) {
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
      description: "Sync your listening history and playlists",
      icon: <Music className="w-6 h-6" />,
      color: "#1DB954",
      status: "disconnected",
    },
    {
      id: "youtube",
      name: "YouTube",
      description: "Import your watch history and saved videos",
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

  const handleConnect = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === id
          ? { ...conn, status: "connected" as ConnectionStatus }
          : conn,
      ),
    );
  };

  const handleDisconnect = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === id
          ? { ...conn, status: "disconnected" as ConnectionStatus }
          : conn,
      ),
    );
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
            {connections.map((connection) => (
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
                        connection.status === "connected"
                          ? "bg-green-500/10 text-green-500"
                          : connection.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {connection.status === "connected" ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Connected
                        </>
                      ) : connection.status === "pending" ? (
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
                  {connection.status === "connected" ? (
                    <div className="space-y-4">
                      {connection.lastSynced && (
                        <p className="text-sm text-muted-foreground">
                          Last synced:{" "}
                          {new Date(connection.lastSynced).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDisconnect(connection.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                        <Button variant="default" className="flex-1">
                          <Loader2 className="w-4 h-4 mr-2" />
                          Sync Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      style={{ backgroundColor: connection.color }}
                      onClick={() => handleConnect(connection.id)}
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect {connection.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
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
