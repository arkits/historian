import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  BookOpen,
  Music,
  Film,
  MessageCircle,
  Gamepad2,
  Code2,
  Camera,
  ShoppingCart,
  Cloud,
  Calendar,
  Heart,
  ChevronRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { DocsNavBar } from "@/components/DocsNavBar";

export function DocsSupportedServicesPage() {
  const services = [
    {
      category: "Browsers",
      icon: Globe,
      color: "from-blue-500 to-cyan-500",
      description: "Sync your browsing history automatically",
      services: [
        {
          name: "Chrome",
          status: "supported",
          description: "Full history sync via extension",
        },
        {
          name: "Firefox",
          status: "supported",
          description: "Full history sync via extension",
        },
        {
          name: "Safari",
          status: "supported",
          description: "Full history sync via extension",
        },
        { name: "Edge", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      category: "Reading",
      icon: BookOpen,
      color: "from-amber-500 to-orange-500",
      description: "Import saved articles and reading lists",
      services: [
        {
          name: "Instapaper",
          status: "supported",
          description: "API integration",
        },
        { name: "Pocket", status: "supported", description: "API integration" },
        { name: "Medium", status: "coming-soon", description: "Coming soon" },
        { name: "Kindle", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      category: "Music",
      icon: Music,
      color: "from-purple-500 to-pink-500",
      description: "Track your listening history and playlists",
      services: [
        {
          name: "Spotify",
          status: "supported",
          description: "Scrobbling and playlists",
        },
        {
          name: "Apple Music",
          status: "supported",
          description: "Listening history",
        },
        { name: "Last.fm", status: "supported", description: "Scrobble API" },
        {
          name: "SoundCloud",
          status: "coming-soon",
          description: "Coming soon",
        },
      ],
    },
    {
      category: "Video",
      icon: Film,
      color: "from-red-500 to-rose-500",
      description: "Import watch history from streaming platforms",
      services: [
        {
          name: "YouTube",
          status: "supported",
          description: "Watch history and playlists",
        },
        { name: "Netflix", status: "coming-soon", description: "Coming soon" },
        { name: "Vimeo", status: "supported", description: "Watch history" },
        { name: "Twitch", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      category: "Communication",
      icon: MessageCircle,
      color: "from-green-500 to-emerald-500",
      description: "Sync message history and communication logs",
      services: [
        {
          name: "Discord",
          status: "supported",
          description: "Message history export",
        },
        { name: "Slack", status: "supported", description: "Workspace export" },
        { name: "Telegram", status: "coming-soon", description: "Coming soon" },
        { name: "WhatsApp", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      category: "Development",
      icon: Code2,
      color: "from-slate-500 to-gray-600",
      description: "Track repository activity and contributions",
      services: [
        { name: "GitHub", status: "supported", description: "Full API access" },
        { name: "GitLab", status: "supported", description: "Full API access" },
        {
          name: "Stack Overflow",
          status: "coming-soon",
          description: "Coming soon",
        },
        { name: "VS Code", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      category: "Photography",
      icon: Camera,
      color: "from-violet-500 to-purple-500",
      description: "Import photo libraries and metadata",
      services: [
        {
          name: "Flickr",
          status: "supported",
          description: "Photo upload history",
        },
        {
          name: "Google Photos",
          status: "coming-soon",
          description: "Coming soon",
        },
        {
          name: "Instagram",
          status: "coming-soon",
          description: "Coming soon",
        },
        { name: "500px", status: "supported", description: "Photo activity" },
      ],
    },
    {
      category: "Gaming",
      icon: Gamepad2,
      color: "from-indigo-500 to-blue-500",
      description: "Track gaming achievements and playtime",
      services: [
        {
          name: "Steam",
          status: "supported",
          description: "Library and playtime",
        },
        {
          name: "PlayStation",
          status: "coming-soon",
          description: "Coming soon",
        },
        { name: "Xbox", status: "coming-soon", description: "Coming soon" },
        { name: "Nintendo", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      category: "Shopping",
      icon: ShoppingCart,
      color: "from-pink-500 to-rose-500",
      description: "Import purchase history and wishlists",
      services: [
        { name: "Amazon", status: "supported", description: "Order history" },
        { name: "eBay", status: "supported", description: "Purchase history" },
        { name: "Etsy", status: "supported", description: "Order history" },
        { name: "Shopify", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      category: "Cloud Storage",
      icon: Cloud,
      color: "from-sky-500 to-cyan-500",
      description: "Track file access and modifications",
      services: [
        {
          name: "Google Drive",
          status: "supported",
          description: "File activity",
        },
        { name: "Dropbox", status: "supported", description: "File activity" },
        { name: "OneDrive", status: "coming-soon", description: "Coming soon" },
        { name: "iCloud", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      category: "Productivity",
      icon: Calendar,
      color: "from-teal-500 to-emerald-500",
      description: "Sync tasks, events, and projects",
      services: [
        {
          name: "Google Calendar",
          status: "supported",
          description: "Event history",
        },
        { name: "Notion", status: "supported", description: "Page activity" },
        {
          name: "Todoist",
          status: "supported",
          description: "Task completions",
        },
        { name: "Linear", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      category: "Fitness",
      icon: Heart,
      color: "from-orange-500 to-red-500",
      description: "Import workout and health data",
      services: [
        {
          name: "Strava",
          status: "supported",
          description: "Activities and routes",
        },
        { name: "Fitbit", status: "coming-soon", description: "Coming soon" },
        { name: "Garmin", status: "coming-soon", description: "Coming soon" },
        {
          name: "Apple Health",
          status: "coming-soon",
          description: "Coming soon",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <DocsNavBar showBackLink />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border mb-6">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  50+ Services
                </span>
              </div>

              <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-6 leading-tight">
                Supported <span className="text-primary">Services</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Historian integrates with the services you use every day. Browse
                our complete list of supported integrations below.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 px-6 border-y border-border/50 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { value: "50+", label: "Total Services" },
                { value: "12", label: "Categories" },
                { value: "30+", label: "Fully Supported" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="font-heading text-4xl text-primary mb-1">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((category, catIndex) => (
                <Card
                  key={category.category}
                  className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300"
                  style={{ animationDelay: `${catIndex * 50}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                  />
                  <CardContent className="p-6 relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                      >
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl text-foreground">
                          {category.category}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {category.services.map((service, index) => (
                        <div
                          key={service.name}
                          className="flex items-center gap-3 p-2 rounded-lg bg-accent/30"
                        >
                          <div className="flex-shrink-0">
                            {service.status === "supported" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">
                              {service.name}
                            </span>
                          </div>
                          {service.status === "coming-soon" && (
                            <span className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-500">
                              Soon
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Request Service */}
        <section className="py-16 px-6 bg-gradient-to-b from-transparent via-accent/10 to-transparent">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-heading text-3xl text-foreground mb-4">
                  Request a <span className="text-primary">Service</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Don't see your favorite service? We're constantly adding new
                  integrations. Request one on GitHub and help us prioritize.
                </p>
                <a
                  href="https://github.com/arkits/historian/issues/new?template=feature-request.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Request Integration
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Integration Guide */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                Adding a New <span className="text-primary">Service</span>
              </h2>
              <p className="text-muted-foreground">
                Want to contribute? Here's how to add support for a new service.
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Create an Issue",
                  description:
                    "Start by creating a feature request on GitHub to discuss the integration.",
                },
                {
                  step: "02",
                  title: "Design the Adapter",
                  description:
                    "Create a new adapter in src/services/ following our existing patterns.",
                },
                {
                  step: "03",
                  title: "Implement Authentication",
                  description:
                    "Set up OAuth or API key authentication for the service.",
                },
                {
                  step: "04",
                  title: "Test Thoroughly",
                  description:
                    "Write tests and verify the integration works correctly.",
                },
                {
                  step: "05",
                  title: "Submit a PR",
                  description:
                    "Open a pull request with your implementation for review.",
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="flex gap-6 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="font-heading text-xl text-white">
                        {item.step}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="font-heading text-xl text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
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
              <Link to="/docs/supported-services" className="text-primary">
                Supported Services
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
