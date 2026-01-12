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
  ArrowRight,
  CheckCircle2,
  Zap,
  ExternalLink,
  Shield,
} from "lucide-react";

import { PublicNavBar } from "@/components/PublicNavBar";

export function SupportedServicesPage() {
  const services = [
    {
      category: "Browsers",
      icon: Globe,
      color: "from-blue-500 to-cyan-500",
      services: [
        {
          name: "Chrome",
          status: "supported",
          description: "Browser history and bookmarks",
        },
        {
          name: "Firefox",
          status: "supported",
          description: "Browser history and bookmarks",
        },
        {
          name: "Safari",
          status: "supported",
          description: "Browser history and bookmarks",
        },
        {
          name: "Edge",
          status: "coming-soon",
          description: "Browser history and bookmarks",
        },
      ],
    },
    {
      category: "Reading",
      icon: BookOpen,
      color: "from-amber-500 to-orange-500",
      services: [
        {
          name: "Instapaper",
          status: "supported",
          description: "Saved articles and highlights",
        },
        {
          name: "Pocket",
          status: "supported",
          description: "Saved articles and highlights",
        },
        {
          name: "Medium",
          status: "coming-soon",
          description: "Reading history and highlights",
        },
        {
          name: "Kindle",
          status: "coming-soon",
          description: "Reading history and highlights",
        },
      ],
    },
    {
      category: "Music",
      icon: Music,
      color: "from-purple-500 to-pink-500",
      services: [
        {
          name: "Spotify",
          status: "supported",
          description: "Listening history and playlists",
        },
        {
          name: "Apple Music",
          status: "supported",
          description: "Listening history and playlists",
        },
        {
          name: "Last.fm",
          status: "supported",
          description: "Scrobbles and listening stats",
        },
        {
          name: "SoundCloud",
          status: "coming-soon",
          description: "Listening history and likes",
        },
      ],
    },
    {
      category: "Video",
      icon: Film,
      color: "from-red-500 to-rose-500",
      services: [
        {
          name: "YouTube",
          status: "supported",
          description: "Watch history and playlists",
        },
        {
          name: "Netflix",
          status: "coming-soon",
          description: "Watch history and ratings",
        },
        {
          name: "Vimeo",
          status: "supported",
          description: "Watch history and likes",
        },
        {
          name: "Twitch",
          status: "coming-soon",
          description: "Watch history and follows",
        },
      ],
    },
    {
      category: "Communication",
      icon: MessageCircle,
      color: "from-green-500 to-emerald-500",
      services: [
        {
          name: "Discord",
          status: "supported",
          description: "Message history and servers",
        },
        {
          name: "Slack",
          status: "supported",
          description: "Message history and channels",
        },
        {
          name: "Telegram",
          status: "coming-soon",
          description: "Message history and chats",
        },
        {
          name: "WhatsApp",
          status: "coming-soon",
          description: "Message history and calls",
        },
      ],
    },
    {
      category: "Development",
      icon: Code2,
      color: "from-slate-500 to-gray-600",
      services: [
        {
          name: "GitHub",
          status: "supported",
          description: "Repository activity and contributions",
        },
        {
          name: "GitLab",
          status: "supported",
          description: "Repository activity and issues",
        },
        {
          name: "Stack Overflow",
          status: "coming-soon",
          description: "Question history and answers",
        },
        {
          name: "VS Code",
          status: "coming-soon",
          description: "Extensions and settings sync",
        },
      ],
    },
    {
      category: "Photography",
      icon: Camera,
      color: "from-violet-500 to-purple-500",
      services: [
        {
          name: "Flickr",
          status: "supported",
          description: "Photo uploads and favorites",
        },
        {
          name: "Google Photos",
          status: "coming-soon",
          description: "Photo and video library",
        },
        {
          name: "Instagram",
          status: "coming-soon",
          description: "Posts and stories archive",
        },
        {
          name: "500px",
          status: "supported",
          description: "Photo uploads and likes",
        },
      ],
    },
    {
      category: "Gaming",
      icon: Gamepad2,
      color: "from-indigo-500 to-blue-500",
      services: [
        {
          name: "Steam",
          status: "supported",
          description: "Game library and playtime",
        },
        {
          name: "PlayStation",
          status: "coming-soon",
          description: "Trophy history and gameplay",
        },
        {
          name: "Xbox",
          status: "coming-soon",
          description: "Achievements and gameplay",
        },
        {
          name: "Nintendo",
          status: "coming-soon",
          description: "Game history and stats",
        },
      ],
    },
    {
      category: "Shopping",
      icon: ShoppingCart,
      color: "from-pink-500 to-rose-500",
      services: [
        {
          name: "Amazon",
          status: "supported",
          description: "Order history and wishlists",
        },
        {
          name: "eBay",
          status: "supported",
          description: "Purchase history and bids",
        },
        {
          name: "Etsy",
          status: "supported",
          description: "Purchase history and favorites",
        },
        {
          name: "Shopify",
          status: "coming-soon",
          description: "Order history tracking",
        },
      ],
    },
    {
      category: "Cloud Storage",
      icon: Cloud,
      color: "from-sky-500 to-cyan-500",
      services: [
        {
          name: "Google Drive",
          status: "supported",
          description: "File access and modifications",
        },
        {
          name: "Dropbox",
          status: "supported",
          description: "File access and sharing",
        },
        {
          name: "OneDrive",
          status: "coming-soon",
          description: "File access and modifications",
        },
        {
          name: "iCloud",
          status: "coming-soon",
          description: "Photos and file sync",
        },
      ],
    },
    {
      category: "Productivity",
      icon: Calendar,
      color: "from-teal-500 to-emerald-500",
      services: [
        {
          name: "Google Calendar",
          status: "supported",
          description: "Events and appointments",
        },
        {
          name: "Notion",
          status: "supported",
          description: "Page visits and edits",
        },
        {
          name: "Todoist",
          status: "supported",
          description: "Task completions and projects",
        },
        {
          name: "Linear",
          status: "coming-soon",
          description: "Issue history and projects",
        },
      ],
    },
    {
      category: "Fitness",
      icon: Heart,
      color: "from-orange-500 to-red-500",
      services: [
        {
          name: "Strava",
          status: "supported",
          description: "Activities and routes",
        },
        {
          name: "Fitbit",
          status: "coming-soon",
          description: "Workouts and health data",
        },
        {
          name: "Garmin",
          status: "coming-soon",
          description: "Activities and metrics",
        },
        {
          name: "Apple Health",
          status: "coming-soon",
          description: "Workouts and health data",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <PublicNavBar />

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border mb-8">
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  50+ Services Supported
                </span>
              </div>

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
                Connect Your <span className="text-primary">Digital Life</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Historian integrates with the services you use every day,
                bringing all your digital footprints into one beautiful, unified
                timeline.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>No data stored on our servers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Works offline</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-8 px-6 border-y border-border/50 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "50+", label: "Services" },
                { value: "12", label: "Categories" },
                { value: "100K+", label: "Data Points/Day" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="font-heading text-4xl md:text-5xl text-primary mb-1">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((category, catIndex) => (
                <Card
                  key={category.category}
                  className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:raycast-shadow"
                  style={{ animationDelay: `${catIndex * 50}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                  />
                  <CardContent className="p-6 relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                      >
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-heading text-2xl text-foreground">
                        {category.category}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {category.services.map((service) => (
                        <div
                          key={service.name}
                          className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {service.status === "supported" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">
                                {service.name}
                              </span>
                              {service.status === "coming-soon" && (
                                <span className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-500">
                                  Soon
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Request Service Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent via-accent/10 to-transparent">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
              Don't See Your <span className="text-primary">Service</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              We're constantly adding new integrations. Request a service and
              help us prioritize what to build next.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8 group"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Request Integration
              </Button>
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
                  Contribute on GitHub
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
                How <span className="text-primary">Connections</span> Work
              </h2>
              <p className="text-muted-foreground text-lg">
                Simple, secure, and completely under your control
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Choose a Service",
                  description:
                    "Select from our library of supported services and click Connect",
                  icon: Globe,
                },
                {
                  step: "02",
                  title: "Authenticate",
                  description:
                    "Securely connect using OAuth. We never see your passwords",
                  icon: Shield,
                },
                {
                  step: "03",
                  title: "Sync & Enjoy",
                  description:
                    "Your history starts syncing immediately to your timeline",
                  icon: Zap,
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                  <Card className="relative border-border/50 bg-card/50 hover:bg-card/80 transition-all hover:-translate-y-1">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="font-heading text-6xl text-primary/20 mb-4">
                        {item.step}
                      </div>
                      <h3 className="font-heading text-2xl text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/10 via-accent/5 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

          <div className="max-w-4xl mx-auto text-center relative animate-fade-in">
            <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-6">
              Start Your <span className="text-primary">Unified History</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              Connect your favorite services and watch your digital life come
              together in one beautiful timeline.
            </p>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-10 group"
              >
                Connect Services
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

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
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Historian. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
