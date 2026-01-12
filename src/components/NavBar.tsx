import { Link } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, Settings, LogOut, Link2, BookOpen } from "lucide-react";

interface NavBarProps {
  title: string;
  onSignOut?: () => void;
  showBack?: boolean;
}

export function NavBar({ title, onSignOut, showBack = false }: NavBarProps) {
  const signOutMutation = trpc.signOut.useMutation({
    onSuccess: () => {
      onSignOut?.();
    },
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50 h-16 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack ? (
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
          ) : (
            <Link to="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Home</span>
                <span className="text-2xl">🕵️</span>
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-2">
            {!showBack && <span className="text-2xl">🕵️</span>}
            <span className="font-heading text-xl text-foreground">
              {title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link to="/history">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </Link>
          <Link to="/connections">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Connections
            </Button>
          </Link>
          <Link to="/docs">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Docs
            </Button>
          </Link>
          <Link to="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
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
      </div>
    </nav>
  );
}
