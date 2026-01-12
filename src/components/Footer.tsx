import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Mail } from "lucide-react";

interface HealthResponse {
  status: string;
  timestamp: string;
  commit: string;
  uptime: number;
  environment: string;
}

interface FooterProps {
  variant?: "simple" | "detailed";
}

function getHealthUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin === "https://historian.archit.xyz"
      ? "https://historian-api.archit.xyz/health"
      : "/health";
  }
  return "/health";
}

export function Footer({ variant = "simple" }: FooterProps) {
  const [commitId, setCommitId] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommitId = async () => {
      try {
        const healthUrl = getHealthUrl();
        const response = await fetch(healthUrl);
        if (response.ok) {
          const data: HealthResponse = await response.json();
          setCommitId(data.commit);
          setHealthStatus(data.status);
        } else {
          setHealthStatus("unhealthy");
        }
      } catch (error) {
        console.error("Failed to fetch commit ID:", error);
        setHealthStatus("unhealthy");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommitId();
  }, []);

  if (variant === "detailed") {
    return (
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🕵️</span>
                <span className="font-heading text-2xl text-foreground">
                  Historian
                </span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-sm">
                Preserving your digital footprint for generations to come.
                Track, search, and relive your digital memories.
              </p>
            </div>
            <div>
              <h4 className="font-heading text-lg text-foreground mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/supported-services"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Supported Services
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-lg text-foreground mb-4">
                Connect
              </h4>
              <div className="flex gap-4">
                <a
                  href="https://github.com/arkits/historian"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Historian. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {healthStatus && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      healthStatus === "healthy"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        healthStatus === "healthy"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                    {healthStatus === "healthy" ? "all systems operational" : "Unhealthy"}
                  </span>
                )}
                {commitId && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-accent/50 text-muted-foreground border border-border/50">
                    <span className="text-[10px] text-muted-foreground/70">
                      Backend
                    </span>
                    {commitId.slice(0, 7)}
                  </span>
                )}
                {isLoading && !commitId && (
                  <span className="text-xs text-muted-foreground">
                    Loading...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="py-8 px-6 border-t border-border/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕵️</span>
          <span className="font-heading text-lg text-foreground">Historian</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {healthStatus && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  healthStatus === "healthy"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    healthStatus === "healthy" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {healthStatus === "healthy" ? "all systems operational" : "Unhealthy"}
              </span>
            )}
            {commitId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-accent/50 text-muted-foreground border border-border/50">
                <span className="text-[10px] text-muted-foreground/70">
                  Backend
                </span>
                {commitId.slice(0, 7)}
              </span>
            )}
            {isLoading && !commitId && (
              <span className="text-xs text-muted-foreground">Loading...</span>
            )}
          </div>
          <a
            href="https://github.com/arkits/historian"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
