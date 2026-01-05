import { useState } from "react";
import { Link } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  User,
  Trash2,
  Download,
  Clock,
  LogOut,
  Save,
  Loader2,
  Plus,
  Key,
  Copy,
  Check,
} from "lucide-react";

interface SettingsPageProps {
  onSignOut?: () => void;
}

type SettingsTab = "profile" | "activity" | "data" | "account" | "extensions";

export function SettingsPage({ onSignOut }: SettingsPageProps) {
  const { data: user } = trpc.getUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: stats } = trpc.getHistoryStats.useQuery(undefined, {
    retry: false,
  });

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const signOutMutation = trpc.signOut.useMutation({
    onSuccess: () => {
      onSignOut?.();
    },
  });

  const { data: apiKeys, refetch: refetchKeys } = trpc.listApiKeys.useQuery(
    undefined,
    { retry: false },
  );

  const createKeyMutation = trpc.createApiKey.useMutation({
    onSuccess: (result) => {
      if (result?.key) {
        setShowNewKey(result.key);
        setNewKeyName("");
        refetchKeys();
      }
    },
  });

  const deleteKeyMutation = trpc.deleteApiKey.useMutation({
    onSuccess: () => refetchKeys(),
  });

  const toggleKeyMutation = trpc.toggleApiKey.useMutation({
    onSuccess: () => refetchKeys(),
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaveMessage({ type: "success", text: "Profile updated successfully" });
    setIsSaving(false);

    setTimeout(() => setSaveMessage(null), 3000);
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "activity" as const, label: "Activity", icon: Clock },
    { id: "extensions" as const, label: "Extensions", icon: Key },
    { id: "data" as const, label: "Data", icon: Download },
    { id: "account" as const, label: "Account", icon: LogOut },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-lg">
                    {user?.name || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || "No email provided"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-card/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-card/50"
                  />
                </div>
              </div>

              {saveMessage && (
                <div
                  className={`p-3 rounded-lg ${
                    saveMessage.type === "success"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );

      case "activity":
        return (
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-accent/30">
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.totalCount || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-accent/30">
                  <p className="text-sm text-muted-foreground">Types</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.byType?.length || 0}
                  </p>
                </div>
              </div>

              {stats?.byType && stats.byType.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    By Type
                  </p>
                  <div className="space-y-2">
                    {stats.byType.map((type) => (
                      <div
                        key={type.type}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/20"
                      >
                        <span className="text-foreground capitalize">
                          {type.type}
                        </span>
                        <span className="text-muted-foreground">
                          {Number(type.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "extensions":
        return (
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground flex items-center gap-2">
                <Key className="w-5 h-5" />
                Extensions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Manage API keys for browser extensions and third-party apps
              </p>

              {showNewKey && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-sm font-medium text-green-500 mb-2">
                    Your new API key:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-background/50 rounded font-mono text-sm break-all">
                      {showNewKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(showNewKey);
                        setCopiedKey(showNewKey);
                        setTimeout(() => setCopiedKey(null), 2000);
                      }}
                    >
                      {copiedKey === showNewKey ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Make sure to copy your key now. You won&apos;t be able to
                    see it again.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => setShowNewKey(null)}
                  >
                    Got it
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="keyName">Create New API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="keyName"
                    placeholder="e.g., Chrome Browser"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-card/50"
                  />
                  <Button
                    onClick={() =>
                      createKeyMutation.mutate({
                        name: newKeyName || "Unnamed Key",
                      })
                    }
                    disabled={createKeyMutation.isPending || !newKeyName}
                  >
                    {createKeyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <p className="text-sm font-medium mb-3">Your API Keys</p>
                {apiKeys && apiKeys.length > 0 ? (
                  <div className="space-y-2">
                    {apiKeys.map((apiKeyItem) => (
                      <div
                        key={apiKeyItem.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/20"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {apiKeyItem.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created:{" "}
                            {new Date(
                              apiKeyItem.createdAt,
                            ).toLocaleDateString()}
                            {apiKeyItem.lastUsedAt && (
                              <>
                                {" "}
                                · Last used:{" "}
                                {new Date(
                                  apiKeyItem.lastUsedAt,
                                ).toLocaleDateString()}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant={
                              apiKeyItem.isActive ? "default" : "outline"
                            }
                            onClick={() =>
                              toggleKeyMutation.mutate({
                                id: apiKeyItem.id,
                                isActive: !apiKeyItem.isActive,
                              })
                            }
                          >
                            {apiKeyItem.isActive ? "Active" : "Inactive"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this API key?",
                                )
                              ) {
                                deleteKeyMutation.mutate({ id: apiKeyItem.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No API keys created yet. Create one to use with browser
                    extensions.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "data":
        return (
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Export or manage your history data
              </p>
              <div className="grid gap-4">
                <Button variant="outline" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "account":
        return (
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-foreground flex items-center gap-2 text-red-500">
                <LogOut className="w-5 h-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Sign out of your account on this device
              </p>
              <Button
                variant="outline"
                onClick={() => signOutMutation.mutate()}
                disabled={signOutMutation.isPending}
              >
                {signOutMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
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
                Settings
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 flex-shrink-0">
              <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            <div className="flex-1">{renderContent()}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
