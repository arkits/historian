import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Clock, BookOpen, Github } from "lucide-react";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl transition-transform group-hover:scale-110">
              🕵️
            </span>
            <span className="font-heading text-3xl text-foreground">
              Historian
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/arkits/historian"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-sm text-muted-foreground">
                  Track everything, remember forever
                </span>
              </div>

              <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl text-foreground mb-6 leading-tight">
                Your History, <span className="text-primary">Unified</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Aggregate and track all your digital footprints in one elegant
                place. From browsing history to activity logs — preserve your
                digital legacy.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-base px-8"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Clock,
                  title: "Unified Timeline",
                  description: "All your history in one chronological stream",
                },
                {
                  icon: Search,
                  title: "Powerful Search",
                  description: "Find any moment instantly with smart filtering",
                },
                {
                  icon: BookOpen,
                  title: "Auto-Sync",
                  description: "Automatically aggregates from multiple sources",
                },
                {
                  icon: Clock,
                  title: "Rich Details",
                  description:
                    "Deep insights and analytics about your patterns",
                },
              ].map((feature, index) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:raycast-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 border-t border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-in">
                <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-6">
                  Your Digital Footprint,{" "}
                  <span className="text-primary">Preserved</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  In the age of ephemeral content, Historian gives you
                  permanence. Automatically collect, organize, and analyze your
                  browsing patterns, reading history, and digital activities.
                </p>
                <ul className="space-y-4">
                  {[
                    "Browser extension for seamless tracking",
                    "Import from existing history sources",
                    "Encrypted and private by default",
                    "Beautiful timeline visualization",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative animate-scale-in">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-3xl"></div>
                <Card className="relative border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-border/50">
                      <span className="text-3xl">🕵️</span>
                      <div>
                        <p className="font-heading text-2xl text-foreground">
                          Historian
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Your unified history
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-lg bg-accent/30 inner-shadow"
                        >
                          <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="h-3 w-24 rounded bg-foreground/20 mb-2"></div>
                            <div className="h-2 w-32 rounded bg-foreground/10"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-6">
              Ready to Preserve Your History?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              Join users who trust Historian to keep their digital memories
              safe.
            </p>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-10"
              >
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕵️</span>
            <span className="font-heading text-lg text-foreground">
              Historian
            </span>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground">
              Track and aggregate all your history
            </p>
            <a
              href="https://github.com/arkits/historian"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
