import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Zap,
  Server,
  Globe,
  Code2,
  ArrowRight,
  Github,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

import { PublicNavBar } from "@/components/PublicNavBar";

export function DocsPage() {
  const docSections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics and set up Historian in minutes",
      href: "/docs/getting-started",
      color: "from-blue-500 to-cyan-500",
      articles: ["Installation", "Configuration", "First Steps"],
    },
    {
      icon: Globe,
      title: "Supported Services",
      description: "Browse all supported services and integrations",
      href: "/docs/supported-services",
      color: "from-purple-500 to-pink-500",
      articles: ["Browser Extensions", "Import Tools", "API Access"],
    },
    {
      icon: Code2,
      title: "API Reference",
      description: "Complete API documentation for developers",
      href: "/docs/api",
      color: "from-amber-500 to-orange-500",
      articles: ["REST API", "Webhooks", "Authentication"],
    },
    {
      icon: Server,
      title: "Self-Hosting",
      description: "Deploy Historian on your own infrastructure",
      href: "/docs/self-hosting",
      color: "from-emerald-500 to-teal-500",
      articles: ["Docker", "Manual Setup", "Configuration"],
    },
  ];

  return (
    <div className="min-h-screen">
      <PublicNavBar />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border mb-8">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Documentation
                </span>
              </div>

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
                Everything You Need to{" "}
                <span className="text-primary">Know</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Comprehensive guides, API references, and tutorials to help you
                get the most out of Historian.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/docs/getting-started">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-base px-8 group"
                  >
                    Quick Start
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a
                  href="https://github.com/arkits/historian"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="ghost"
                    className="w-full sm:w-auto text-base"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 px-6 border-y border-border/50 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Guides", count: 12 },
                { label: "API Endpoints", count: 24 },
                { label: "Services", count: "50+" },
                { label: "Contributors", count: 15 },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-lg bg-accent/30 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="font-heading text-3xl text-primary mb-1">
                    {stat.count}
                  </p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documentation Sections */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {docSections.map((section, index) => (
                <Card
                  key={section.title}
                  className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:raycast-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                  />
                  <CardContent className="p-8 relative">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-6`}
                    >
                      <section.icon className="w-7 h-7 text-white" />
                    </div>

                    <h2 className="font-heading text-2xl text-foreground mb-2">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      {section.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {section.articles.map((article) => (
                        <li
                          key={article}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <ChevronRight className="w-4 h-4 text-primary" />
                          {article}
                        </li>
                      ))}
                    </ul>

                    <Link to={section.href}>
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-accent/50 transition-colors"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Guides */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                Popular <span className="text-primary">Guides</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Quick Installation",
                  description: "Get up and running in under 5 minutes",
                  icon: Zap,
                  href: "/docs/getting-started#installation",
                },
                {
                  title: "Browser Extension",
                  description: "Set up automatic history syncing",
                  icon: Globe,
                  href: "/docs/supported-services#browser",
                },
                {
                  title: "API Integration",
                  description: "Build custom integrations with our API",
                  icon: Code2,
                  href: "/docs/api",
                },
              ].map((guide, index) => (
                <Link
                  key={guide.title}
                  to={guide.href}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="h-full border-border/50 bg-card/50 hover:bg-card/80 hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <guide.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-heading text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {guide.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="font-heading text-4xl text-foreground mb-6">
              Need <span className="text-primary">Help</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Our community is here to help. Check out our GitHub discussions,
              or browse the FAQ for quick answers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/arkits/historian/discussions"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GitHub Discussions
                </Button>
              </a>
              <a
                href="https://github.com/arkits/historian/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="ghost" className="w-full sm:w-auto">
                  <Github className="w-4 h-4 mr-2" />
                  Report Issues
                </Button>
              </a>
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
              <a
                href="https://github.com/arkits/historian"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
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
