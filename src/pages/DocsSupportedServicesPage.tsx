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
  CheckCircle2,
  Clock,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { DocsNavBar } from "@/components/DocsNavBar";
import { DocsSidebar } from "@/components/DocsSidebar";
import { useState } from "react";

export function DocsSupportedServicesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const services = [
    {
      id: "browsers",
      category: "Browsers",
      icon: Globe,
      color: "from-blue-500 to-cyan-500",
      description: "Sync your browsing history automatically",
      items: [
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
      id: "reading",
      category: "Reading",
      icon: BookOpen,
      color: "from-amber-500 to-orange-500",
      description: "Import saved articles and reading lists",
      items: [
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
      id: "music",
      category: "Music",
      icon: Music,
      color: "from-purple-500 to-pink-500",
      description: "Track your listening history and playlists",
      items: [
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
      id: "video",
      category: "Video",
      icon: Film,
      color: "from-red-500 to-rose-500",
      description: "Import watch history from streaming platforms",
      items: [
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
      id: "communication",
      category: "Communication",
      icon: MessageCircle,
      color: "from-green-500 to-emerald-500",
      description: "Sync message history and communication logs",
      items: [
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
      id: "development",
      category: "Development",
      icon: Code2,
      color: "from-slate-500 to-gray-600",
      description: "Track repository activity and contributions",
      items: [
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
      id: "photography",
      category: "Photography",
      icon: Camera,
      color: "from-violet-500 to-purple-500",
      description: "Import photo libraries and metadata",
      items: [
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
      id: "gaming",
      category: "Gaming",
      icon: Gamepad2,
      color: "from-indigo-500 to-blue-500",
      description: "Track gaming achievements and playtime",
      items: [
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
      id: "shopping",
      category: "Shopping",
      icon: ShoppingCart,
      color: "from-pink-500 to-rose-500",
      description: "Import purchase history and wishlists",
      items: [
        { name: "Amazon", status: "supported", description: "Order history" },
        { name: "eBay", status: "supported", description: "Purchase history" },
        { name: "Etsy", status: "supported", description: "Order history" },
        { name: "Shopify", status: "coming-soon", description: "Coming soon" },
      ],
    },
    {
      id: "cloud",
      category: "Cloud Storage",
      icon: Cloud,
      color: "from-sky-500 to-cyan-500",
      description: "Track file access and modifications",
      items: [
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
      id: "productivity",
      category: "Productivity",
      icon: Calendar,
      color: "from-teal-500 to-emerald-500",
      description: "Sync tasks, events, and projects",
      items: [
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
      id: "fitness",
      category: "Fitness",
      icon: Heart,
      color: "from-orange-500 to-red-500",
      description: "Import workout and health data",
      items: [
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
      <DocsNavBar
        showBackLink
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
      />
      <DocsSidebar />

      <main className="pt-16 lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12">
          <div className="mb-12">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border w-fit mb-4">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                50+ Services
              </span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl text-foreground mb-4">
              Supported <span className="text-primary">Services</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Historian integrates with the services you use every day. Browse
              our complete list of supported integrations below.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-12 py-6 border-y border-border/50">
            {[
              { value: "50+", label: "Total Services" },
              { value: "12", label: "Categories" },
              { value: "30+", label: "Fully Supported" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          <section className="space-y-8 mb-16">
            {services.map((category) => (
              <div
                key={category.category}
                id={category.id}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                  >
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl text-foreground">
                      {category.category}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {category.items.map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                    >
                      <div className="flex-shrink-0">
                        {service.status === "supported" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate block">
                          {service.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {service.description}
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
              </div>
            ))}
          </section>

          <section className="mb-16">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <ExternalLink className="w-7 h-7 text-white" />
                </div>
                <h2 className="font-heading text-2xl text-foreground mb-3">
                  Request a <span className="text-primary">Service</span>
                </h2>
                <p className="text-muted-foreground mb-4">
                  Don't see your favorite service? We're constantly adding new
                  integrations. Request one on GitHub and help us prioritize.
                </p>
                <a
                  href="https://github.com/arkits/historian/issues/new?template=feature-request.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Request Integration
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>

          <section className="pt-8 border-t border-border/50">
            <h2 className="font-heading text-2xl text-foreground mb-6">
              Adding a New <span className="text-primary">Service</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Want to contribute? Here's how to add support for a new service.
            </p>

            <div className="space-y-6">
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
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="font-heading text-lg text-white">
                        {item.step}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-heading text-lg text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
