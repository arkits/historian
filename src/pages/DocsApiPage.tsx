import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code2,
  Copy,
  Lock,
} from "lucide-react";
import { DocsNavBar } from "@/components/DocsNavBar";
import { DocsSidebar } from "@/components/DocsSidebar";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function DocsApiPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeResponseTab, setActiveResponseTab] = useState<Record<string, string>>({});

  const endpoints = [
    {
      method: "POST",
      path: "/api/extension/import",
      description: "Import history items. Used by the Chrome extension to sync browser history.",
      requestBody: `{
  "items": [
    {
      "timelineTime": "2024-01-01T00:00:00Z",
      "type": "page",
      "contentId": "page_abc123",
      "content": {
        "url": "https://example.com",
        "title": "Example Page"
      },
      "searchContent": "Example page content"
    }
  ]
}`,
      response: {
        success: {
          status: 200,
          example: `{
  "imported": 5
}`,
        },
        errors: [
          {
            status: 401,
            example: `{
  "error": "Unauthorized"
}`,
          },
          {
            status: 500,
            example: `{
  "error": "Import failed"
}`,
          },
        ],
      },
    },
  ];

  const codeExamples = {
    importHistory: `// Import history items
const response = await fetch('/api/extension/import', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [
      {
        timelineTime: '2024-01-01T00:00:00Z',
        type: 'page',
        contentId: 'page_abc123',
        content: { url: 'https://example.com', title: 'Example' },
        searchContent: 'Example page content'
      }
    ]
  })
});

const data = await response.json();
console.log(data.imported); // Number of items imported`,
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
              <span className="text-sm text-muted-foreground">Extension API</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl text-foreground mb-4">
              API <span className="text-primary">Reference</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              REST API endpoint for importing history data. This endpoint is
              primarily used by the Chrome extension but can be used for custom
              integrations.
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
                      Include your API key in the X-API-Key header:
                    </p>
                    <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
                      <span className="text-purple-400">X-API-Key</span>:{" "}
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
                https://historian-api.archit.xyz
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() =>
                  navigator.clipboard.writeText("https://historian-api.archit.xyz")
                }
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-sm mt-2">
              All endpoints are relative to the base URL above.
            </p>
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

                    {endpoint.requestBody && (
                      <div className="mb-4 ml-1">
                        <h3 className="text-sm font-medium text-foreground mb-2">
                          Request Body
                        </h3>
                        <div className="bg-background/30 rounded-lg overflow-hidden">
                          <div className="p-3">
                            <SyntaxHighlighter
                              language="json"
                              style={oneDark}
                              customStyle={{
                                margin: 0,
                                padding: 0,
                                background: "transparent",
                                fontSize: "0.75rem",
                                lineHeight: "1.5",
                              }}
                              codeTagProps={{
                                style: {
                                  fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                                },
                              }}
                            >
                              {endpoint.requestBody}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      </div>
                    )}

                    {endpoint.response && (
                      <div className="ml-1">
                        <h3 className="text-sm font-medium text-foreground mb-3">
                          Response Format
                        </h3>
                        <div className="flex gap-2 mb-3 border-b border-border/50">
                          <button
                            onClick={() =>
                              setActiveResponseTab({
                                ...activeResponseTab,
                                [endpoint.path]: "success",
                              })
                            }
                            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                              (activeResponseTab[endpoint.path] || "success") ===
                              "success"
                                ? "text-green-400 border-green-400"
                                : "text-muted-foreground border-transparent hover:text-foreground"
                            }`}
                          >
                            Success ({endpoint.response.success.status})
                          </button>
                          {endpoint.response.errors.map((error, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                setActiveResponseTab({
                                  ...activeResponseTab,
                                  [endpoint.path]: `error-${error.status}`,
                                })
                              }
                              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                                activeResponseTab[endpoint.path] ===
                                `error-${error.status}`
                                  ? "text-red-400 border-red-400"
                                  : "text-muted-foreground border-transparent hover:text-foreground"
                              }`}
                            >
                              Error ({error.status})
                            </button>
                          ))}
                        </div>
                        <div className="bg-background/30 rounded-lg overflow-hidden">
                          <div className="p-3">
                            {(activeResponseTab[endpoint.path] || "success") ===
                            "success" ? (
                              <SyntaxHighlighter
                                language="json"
                                style={oneDark}
                                customStyle={{
                                  margin: 0,
                                  padding: 0,
                                  background: "transparent",
                                  fontSize: "0.75rem",
                                  lineHeight: "1.5",
                                }}
                                codeTagProps={{
                                  style: {
                                    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                                  },
                                }}
                              >
                                {endpoint.response.success.example}
                              </SyntaxHighlighter>
                            ) : (
                              endpoint.response.errors.map((error, idx) => {
                                if (
                                  activeResponseTab[endpoint.path] ===
                                  `error-${error.status}`
                                ) {
                                  return (
                                    <SyntaxHighlighter
                                      key={idx}
                                      language="json"
                                      style={oneDark}
                                      customStyle={{
                                        margin: 0,
                                        padding: 0,
                                        background: "transparent",
                                        fontSize: "0.75rem",
                                        lineHeight: "1.5",
                                      }}
                                      codeTagProps={{
                                        style: {
                                          fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                                        },
                                      }}
                                    >
                                      {error.example}
                                    </SyntaxHighlighter>
                                  );
                                }
                                return null;
                              })
                            )}
                          </div>
                        </div>
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
            <div className="space-y-4">
              {Object.entries(codeExamples).map(([key, code]) => (
                <Card
                  key={key}
                  className="border-border/50 bg-card/50 overflow-hidden p-0"
                >
                  <div className="bg-accent/30 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="h-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="overflow-x-auto bg-background/30">
                    <SyntaxHighlighter
                      language="javascript"
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "transparent",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                        },
                      }}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
