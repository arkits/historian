import { Link } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, LogOut, ArrowLeft } from "lucide-react";

interface DashboardProps {
  onSignOut: () => void;
}

export function Dashboard({ onSignOut }: DashboardProps) {
  const { data: session } = trpc.getSession.useQuery(undefined, {
    retry: false,
  });
  const { data: user } = trpc.getUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const signOutMutation = trpc.signOut.useMutation({
    onSuccess: () => {
      onSignOut();
    },
  });

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🕵️</span>
            <span className="font-heading text-2xl text-foreground">
              Historian
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {signOutMutation.isPending ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-heading text-4xl text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">Your history at a glance</p>
          </div>

          <div
            className="grid gap-6 md:grid-cols-2 animate-scale-in"
            style={{ animationDelay: "100ms" }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-heading text-2xl text-foreground">
                    User Profile
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your account details
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/30 inner-shadow">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
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
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-heading text-2xl text-foreground">
                    Session Info
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Current session details
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/30 inner-shadow space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      User ID
                    </span>
                    <span className="text-sm font-mono text-foreground truncate max-w-[200px]">
                      {session?.session?.id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Expires
                    </span>
                    <span className="text-sm text-foreground">
                      {session?.session?.expiresAt
                        ? new Date(session.session.expiresAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className="mt-8 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-foreground">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    <span>View All History</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Import Data</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    <span>Activity Log</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
