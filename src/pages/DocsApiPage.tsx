import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code2,
  ArrowRight,
  Copy,
  CheckCircle2,
  Terminal,
  Lock,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { DocsNavBar } from "@/components/DocsNavBar";
import { DocsSidebar } from "@/components/DocsSidebar";
import { useState } from "react";

export function DocsApiPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <DocsNavBar
        showBackLink
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
      />
      <DocsSidebar />

      <main className="pt-16 lg:pl-64">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12">
          <div className="mb-12">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border w-fit mb-4">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">API v1</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl text-foreground mb-4">
              API <span className="text-primary">Reference</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Build custom integrations with Historian's REST API. Access your
              history data programmatically with full CRUD operations.
            </p>
          </div>

          <section id="authentication" className="mb-12">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-xl text-foreground mb-3">
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
          </section>

          <section className="mb-8">
            <div className="bg-background/50 rounded-lg p-4 font-mono text-sm flex items-center gap-4 flex-wrap">
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
          </section>

          <section id="endpoints" className="mb-12">
            <h2 className="font-heading text-2xl text-foreground mb-6">
              Endpoints
            </h2>
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <Card
                  key={endpoint.path}
                  className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex-shrink-0 ${
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
                      <code className="font-mono text-sm text-foreground flex-1 break-all">
                        {endpoint.path}
                      </code>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 ml-1">
                      {endpoint.description}
                    </p>

                    {endpoint.params.length > 0 && (
                      <div className="bg-background/30 rounded-lg overflow-hidden ml-1">
                        <table className="w-full text-sm">
                          <thead className="bg-accent/30">
                            <tr>
                              <th className="text-left p-2 font-medium text-muted-foreground">
                                Parameter
                              </th>
                              <th className="text-left p-2 font-medium text-muted-foreground">
                                Type
                              </th>
                              <th className="text-left p-2 font-medium text-muted-foreground">
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
                                <td className="p-2 font-mono text-primary text-xs">
                                  {param.name}
                                </td>
                                <td className="p-2 text-muted-foreground text-xs">
                                  {param.type}
                                </td>
                                <td className="p-2 text-muted-foreground text-xs">
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
          </section>

          <section id="examples" className="mb-12">
            <h2 className="font-heading text-2xl text-foreground mb-6">
              Code Examples
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(codeExamples).map(([key, code]) => (
                <Card
                  key={key}
                  className="border-border/50 bg-card/50 overflow-hidden"
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
                  <pre className="p-4 text-xs font-mono overflow-x-auto">
                    <code className="text-muted-foreground">{code}</code>
                  </pre>
                </Card>
              ))}
            </div>
          </section>

          <section id="rate-limits" className="mb-12">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-xl text-foreground mb-4">
                      Rate Limits
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-background/30 rounded-lg p-4 text-center">
                        <p className="font-heading text-2xl text-primary mb-1">
                          1,000
                        </p>
                        <p className="text-sm text-muted-foreground">
                          requests/hour (Free)
                        </p>
                      </div>
                      <div className="bg-background/30 rounded-lg p-4 text-center">
                        <p className="font-heading text-2xl text-primary mb-1">
                          10,000
                        </p>
                        <p className="text-sm text-muted-foreground">
                          requests/hour (Pro)
                        </p>
                      </div>
                      <div className="bg-background/30 rounded-lg p-4 text-center">
                        <p className="font-heading text-2xl text-primary mb-1">
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
          </section>

          <section className="pt-8 border-t border-border/50">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 text-center">
                <h2 className="font-heading text-xl text-foreground mb-3">
                  Official <span className="text-primary">SDKs</span>
                </h2>
                <p className="text-muted-foreground mb-4">
                  Official client libraries for popular languages
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {["JavaScript", "Python", "Go", "Rust", "Ruby"].map(
                    (lang) => (
                      <Button key={lang} variant="outline" size="sm">
                        <Terminal className="w-3 h-3 mr-2" />
                        {lang}
                      </Button>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
