import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Zap,
  Shield,
  History,
  Sparkles,
  ArrowRight,
  Github,
  Twitter,
  Mail,
} from "lucide-react";
import { PublicNavBar } from "@/components/PublicNavBar";

export function AboutPage() {
  const milestones = [
    {
      year: "2024",
      title: "The Beginning",
      description:
        "Historian started as a personal project to unify digital footprints",
    },
    {
      year: "2025",
      title: "Open Source",
      description:
        "Released to the public with a growing community of contributors",
    },
    {
      year: "2025",
      title: "Major Milestone",
      description: "Reached 10,000 active users across the globe",
    },
  ];

  const values = [
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Your data stays yours. We never sell, share, or analyze your personal information.",
    },
    {
      icon: Target,
      title: "Precision",
      description:
        "Track every detail with accuracy. No gaps, no duplicates, no compromises.",
    },
    {
      icon: Zap,
      title: "Speed",
      description:
        "Instant sync and search. Your history should be accessible in milliseconds.",
    },
    {
      icon: History,
      title: "Permanence",
      description:
        "Digital memories deserve to last. Built for long-term preservation.",
    },
  ];

  const team = [
    { name: "Alex Chen", role: "Founder & Lead Developer", avatar: "👨‍💻" },
    { name: "Sarah Miller", role: "Product Designer", avatar: "👩‍🎨" },
    { name: "Jordan Lee", role: "Backend Engineer", avatar: "🧑‍💻" },
    { name: "You?", role: "Open Source Contributor", avatar: "🤝" },
  ];

  return (
    <div className="min-h-screen">
      <PublicNavBar />

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border mb-8">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Our Story</span>
              </div>

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
                Preserving{" "}
                <span className="text-primary relative">
                  Digital Memories
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                We're building the ultimate solution for preserving your digital
                footprint. Because every click, every visit, every moment
                matters.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-slide-in">
                <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-6">
                  Why We <span className="text-primary">Built This</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  In today's digital age, we generate more data than ever
                  before. Yet, most of it disappears within days — browser cache
                  cleared, apps uninstalled, accounts forgotten.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Historian was born from a simple belief: your digital history
                  is part of your identity. It deserves to be preserved,
                  protected, and easily accessible.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">
                      100% Private
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">
                      Lightning Fast
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative animate-scale-in">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                <Card className="relative border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {[
                        {
                          emoji: "🌐",
                          text: "Browser history synced automatically",
                        },
                        {
                          emoji: "📚",
                          text: "Reading lists from all your devices",
                        },
                        {
                          emoji: "🎬",
                          text: "Watch history from streaming platforms",
                        },
                        {
                          emoji: "🎵",
                          text: "Music listening patterns preserved",
                        },
                        {
                          emoji: "💬",
                          text: "Communication archives (coming soon)",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-default"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <span className="text-3xl">{item.emoji}</span>
                          <span className="text-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
                Our <span className="text-primary">Values</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                The principles that guide everything we build
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card
                  key={value.title}
                  className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:-translate-y-2 hover:raycast-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6 relative">
                    <div className="w-14 h-14 rounded-xl bg-accent/50 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
                Our <span className="text-primary">Journey</span>
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-transparent" />

              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className="relative flex gap-6 animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                        <span className="font-heading text-xl text-primary">
                          {milestone.year.slice(-2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 pt-3">
                      <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-all hover:-translate-x-1">
                        <CardContent className="p-6">
                          <h3 className="font-heading text-2xl text-foreground mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {milestone.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
                Meet the <span className="text-primary">Team</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                The people behind Historian
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <Card
                  key={member.name}
                  className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:-translate-y-2 hover:raycast-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-accent/50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">
                      {member.avatar}
                    </div>
                    <h3 className="font-heading text-xl text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {member.role}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

          <div className="max-w-4xl mx-auto text-center relative animate-fade-in">
            <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-6">
              Ready to Join the <span className="text-primary">Journey</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              Start preserving your digital legacy today. Your future self will
              thank you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base px-8 group"
                >
                  Get Started
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
                  Star on GitHub
                </Button>
              </a>
            </div>
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
      </footer>
    </div>
  );
}
