import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code2,
  ArrowRight,
  ChevronRight,
  Copy,
  CheckCircle2,
  Terminal,
  Lock,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { DocsNavBar } from "@/components/DocsNavBar";

export function DocsApiPage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/history",
      description: "Retrieve paginated history entries",
      params: [
        {
          name: "page",
          type: "number",
          description: "Page number (default: 1)",
        },
        {
          name: "limit",
          type: "number",
          description: "Items per page (default: 50)",
        },
        {
          name: "service",
          type: "string",
          description: "Filter by service ID",
        },
        {
          name: "from",
          type: "date",
          description: "Filter entries after date",
        },
        { name: "to", type: "date", description: "Filter entries before date" },
        {
          name: "search",
          type: "string",
          description: "Full-text search query",
        },
      ],
    },
    {
      method: "GET",
      path: "/api/v1/history/:id",
      description: "Get a single history entry by ID",
      params: [],
    },
    {
      method: "DELETE",
      path: "/api/v1/history/:id",
      description: "Delete a single history entry",
      params: [],
    },
    {
      method: "GET",
      path: "/api/v1/services",
      description: "List all connected services",
      params: [],
    },
    {
      method: "POST",
      path: "/api/v1/services/:serviceId/sync",
      description: "Trigger manual sync for a service",
      params: [],
    },
    {
      method: "GET",
      path: "/api/v1/analytics",
      description: "Get usage analytics and statistics",
      params: [
        {
          name: "period",
          type: "string",
          description: "Period: day, week, month, year",
        },
      ],
    },
    {
      method: "GET",
      path: "/api/v1/search",
      description: "Full-text search across all history",
      params: [
        { name: "q", type: "string", description: "Search query (required)" },
        {
          name: "limit",
          type: "number",
          description: "Max results (default: 20)",
        },
      ],
    },
    {
      method: "POST",
      path: "/api/v1/import",
      description: "Import data from external source",
      params: [
        { name: "source", type: "string", description: "Source service ID" },
        { name: "data", type: "object", description: "Data to import" },
      ],
    },
  ];

  const codeExamples = {
    fetchHistory: `// Fetch history entries
const response = await fetch('/api/v1/history', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.results);`,
    searchHistory: `// Search history
const response = await fetch('/api/v1/search?q=github&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const { results } = await response.json();`,
    syncService: `// Trigger service sync
const response = await fetch('/api/v1/services/github/sync', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const { status } = await response.json();`,
  };

  return (
    <div className="min-h-screen">
      <DocsNavBar showBackLink />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/10" />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border mb-6">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">API v1</span>
              </div>

              <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-6 leading-tight">
                API <span className="text-primary">Reference</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Build custom integrations with Historian's REST API. Access your
                history data programmatically with full CRUD operations.
              </p>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="py-12 px-6 border-y border-border/50 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-2xl text-foreground mb-2">
                      Authentication
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      All API requests require authentication using an API key.
                      Include your API key in the Authorization header:
                    </p>
                    <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
                      <span className="text-purple-400">Authorization</span>:{" "}
                      <span className="text-green-400">Bearer</span>{" "}
                      <span className="text-yellow-400">YOUR_API_KEY</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-4">
                      You can generate API keys in your account settings under{" "}
                      <strong>Settings → API Keys</strong>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Base URL */}
        <section className="py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-background/50 rounded-lg p-4 font-mono text-sm flex items-center gap-4">
              <span className="text-muted-foreground">Base URL:</span>
              <code className="text-green-400">
                https://api.historian.app/v1
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() =>
                  navigator.clipboard.writeText("https://api.historian.app/v1")
                }
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                API <span className="text-primary">Endpoints</span>
              </h2>
            </div>

            <div className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <Card
                  key={endpoint.path}
                  className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`px-3 py-1 rounded-lg text-sm font-mono font-bold ${
                          endpoint.method === "GET"
                            ? "bg-blue-500/20 text-blue-400"
                            : endpoint.method === "POST"
                              ? "bg-green-500/20 text-green-400"
                              : endpoint.method === "DELETE"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {endpoint.method}
                      </div>
                      <code className="font-mono text-foreground flex-1">
                        {endpoint.path}
                      </code>
                    </div>

                    <p className="text-muted-foreground mb-4">
                      {endpoint.description}
                    </p>

                    {endpoint.params.length > 0 && (
                      <div className="bg-background/30 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-accent/30">
                            <tr>
                              <th className="text-left p-3 font-medium text-muted-foreground">
                                Parameter
                              </th>
                              <th className="text-left p-3 font-medium text-muted-foreground">
                                Type
                              </th>
                              <th className="text-left p-3 font-medium text-muted-foreground">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.params.map((param) => (
                              <tr
                                key={param.name}
                                className="border-t border-border/50"
                              >
                                <td className="p-3 font-mono text-primary">
                                  {param.name}
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {param.type}
                                </td>
                                <td className="p-3 text-muted-foreground">
                                  {param.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="py-16 px-6 bg-gradient-to-b from-transparent via-accent/10 to-transparent">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                Code <span className="text-primary">Examples</span>
              </h2>
              <p className="text-muted-foreground">
                Common use cases and integration patterns
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(codeExamples).map(([key, code], index) => (
                <Card
                  key={key}
                  className="border-border/50 bg-card/50 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-accent/30 px-4 py-2 border-b border-border/50 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <pre className="p-4 text-sm font-mono overflow-x-auto">
                    <code className="text-muted-foreground">{code}</code>
                  </pre>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-7 h-7 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-2xl text-foreground mb-4">
                      Rate Limits
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-background/30 rounded-lg p-4 text-center">
                        <p className="font-heading text-3xl text-primary mb-1">
                          1,000
                        </p>
                        <p className="text-sm text-muted-foreground">
                          requests/hour (Free)
                        </p>
                      </div>
                      <div className="bg-background/30 rounded-lg p-4 text-center">
                        <p className="font-heading text-3xl text-primary mb-1">
                          10,000
                        </p>
                        <p className="text-sm text-muted-foreground">
                          requests/hour (Pro)
                        </p>
                      </div>
                      <div className="bg-background/30 rounded-lg p-4 text-center">
                        <p className="font-heading text-3xl text-primary mb-1">
                          Unlimited
                        </p>
                        <p className="text-sm text-muted-foreground">
                          requests/hour (Enterprise)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SDKs */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="font-heading text-4xl text-foreground mb-6">
              Official <span className="text-primary">SDKs</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Official client libraries for popular languages
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {["JavaScript", "Python", "Go", "Rust", "Ruby"].map((lang) => (
                <Button key={lang} variant="outline" className="px-6">
                  <Terminal className="w-4 h-4 mr-2" />
                  {lang}
                </Button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕵️</span>
              <span className="font-heading text-lg text-foreground">
                Historian
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                to="/docs"
                className="hover:text-foreground transition-colors"
              >
                Docs
              </Link>
              <Link to="/docs/api" className="text-primary">
                API Reference
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Historian Documentation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
