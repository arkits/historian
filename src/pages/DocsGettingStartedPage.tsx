import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Download,
  Globe,
  Zap,
  ChevronRight,
  Terminal,
  Settings,
  ArrowLeft,
  Sparkles,
  Clock,
  Search,
} from "lucide-react";
import { DocsNavBar } from "@/components/DocsNavBar";

export function DocsGettingStartedPage() {
  const steps = [
    {
      step: "01",
      title: "Create an Account",
      description:
        "Sign up for a free Historian account to get started. You'll need a valid email address.",
      icon: Sparkles,
      details: [
        "Go to /signup",
        "Enter your email and create a password",
        "Verify your email address",
        "Complete your profile setup",
      ],
    },
    {
      step: "02",
      title: "Install the Browser Extension",
      description:
        "Install our browser extension to automatically sync your browsing history.",
      icon: Globe,
      details: [
        "Chrome: Visit Chrome Web Store",
        "Firefox: Visit Firefox Add-ons",
        "Safari: Download from App Store",
        "Click the extension icon to authorize",
      ],
    },
    {
      step: "03",
      title: "Connect Additional Services",
      description:
        "Connect your favorite services to aggregate all your digital footprints.",
      icon: Download,
      details: [
        "Go to Connections in your dashboard",
        "Browse available services",
        "Click Connect and authorize access",
        "Your data will start syncing automatically",
      ],
    },
    {
      step: "04",
      title: "Explore Your History",
      description:
        "Start exploring your unified timeline and discover patterns in your digital life.",
      icon: Search,
      details: [
        "View your timeline on the dashboard",
        "Use the search bar to find specific entries",
        "Filter by date, service, or content",
        "Click any entry for detailed view",
      ],
    },
  ];

  const features = [
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
      icon: Zap,
      title: "Auto-Sync",
      description: "Automatically aggregates from multiple sources",
    },
    {
      icon: BookOpen,
      title: "Rich Details",
      description: "Deep insights and analytics about your patterns",
    },
  ];

  const tips = [
    {
      title: "Enable Auto-Sync",
      description:
        "Keep the extension running to automatically sync your history every hour.",
    },
    {
      title: "Use Keyboard Shortcuts",
      description:
        "Press ? to see available keyboard shortcuts for faster navigation.",
    },
    {
      title: "Star Important Items",
      description: "Mark entries as favorites to easily find them later.",
    },
    {
      title: "Export Your Data",
      description:
        "Download your complete history in JSON or CSV format anytime.",
    },
  ];

  return (
    <div className="min-h-screen">
      <DocsNavBar showBackLink />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/10" />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border mb-6">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Quick Start Guide
                </span>
              </div>

              <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-6 leading-tight">
                Get Started with <span className="text-primary">Historian</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Follow this step-by-step guide to set up Historian and start
                preserving your digital footprint in under 10 minutes.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start Steps */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div
                  key={step.step}
                  className="flex flex-col lg:flex-row gap-8 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="lg:w-1/3">
                    <Card className="h-full border-border/50 bg-card/50">
                      <CardContent className="p-6">
                        <div
                          className={`w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4`}
                        >
                          <step.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="font-heading text-5xl text-primary/20 mb-4">
                          {step.step}
                        </div>
                        <h2 className="font-heading text-2xl text-foreground mb-2">
                          {step.title}
                        </h2>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:w-2/3">
                    <div className="bg-background/50 rounded-xl p-6 h-full">
                      <h3 className="font-heading text-xl text-foreground mb-4">
                        What you'll do:
                      </h3>
                      <ul className="space-y-3">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You'll Get */}
        <section className="py-16 px-6 bg-gradient-to-b from-transparent via-accent/10 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                What You'll <span className="text-primary">Get</span>
              </h2>
              <p className="text-muted-foreground">
                Powerful features to help you preserve and explore your digital
                life
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="border-border/50 bg-card/50 text-center hover:bg-card/80 transition-all hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent/50 flex items-center justify-center">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                Pro <span className="text-primary">Tips</span>
              </h2>
              <p className="text-muted-foreground">
                Get the most out of Historian with these tips
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {tips.map((tip, index) => (
                <Card
                  key={tip.title}
                  className="border-border/50 bg-card/50 hover:bg-card/80 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <h3 className="font-heading text-xl text-foreground mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-muted-foreground">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="py-16 px-6 bg-gradient-to-b from-transparent via-accent/10 to-transparent">
          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-8 text-center">
                <h2 className="font-heading text-3xl text-foreground mb-4">
                  Ready to <span className="text-primary">Dive In</span>?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Start preserving your digital legacy today. It only takes a
                  few minutes to set up.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Create Free Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/docs">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="w-full sm:w-auto"
                    >
                      Read Full Documentation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                Common <span className="text-primary">Questions</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Is Historian free to use?",
                  a: "Yes! Historian has a generous free tier. Premium features are available for power users.",
                },
                {
                  q: "How secure is my data?",
                  a: "We use end-to-end encryption. Your data is encrypted at rest and in transit.",
                },
                {
                  q: "Can I export my data?",
                  a: "Absolutely. You can export your complete history at any time in JSON or CSV format.",
                },
                {
                  q: "Does Historian work offline?",
                  a: "Yes, the browser extension works offline and syncs when you're back online.",
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="border-border/50 bg-card/50 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <h3 className="font-heading text-xl text-foreground mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
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
              <Link to="/docs/getting-started" className="text-primary">
                Getting Started
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
