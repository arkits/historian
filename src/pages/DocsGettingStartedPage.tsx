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
  Sparkles,
  Clock,
  Search,
} from "lucide-react";
import { DocsNavBar } from "@/components/DocsNavBar";
import { DocsSidebar } from "@/components/DocsSidebar";
import { useState } from "react";

export function DocsGettingStartedPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Quick Start Guide
              </span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl text-foreground mb-4">
              Get Started with <span className="text-primary">Historian</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Follow this step-by-step guide to set up Historian and start
              preserving your digital footprint in under 10 minutes.
            </p>
          </div>

          <section id="quick-start" className="mb-16">
            <h2 className="font-heading text-2xl text-foreground mb-8">
              Quick Start
            </h2>
            <div className="space-y-8">
              {steps.map((step) => (
                <div
                  key={step.step}
                  className="flex flex-col lg:flex-row gap-6"
                >
                  <div className="lg:w-1/3">
                    <Card className="h-full border-border/50 bg-card/50">
                      <CardContent className="p-6">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4`}
                        >
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-heading text-4xl text-primary/20 mb-4">
                          {step.step}
                        </div>
                        <h3 className="font-heading text-xl text-foreground mb-2">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:w-2/3">
                    <div className="bg-background/50 rounded-xl p-6 h-full">
                      <h4 className="font-medium text-foreground mb-4">
                        What you'll do:
                      </h4>
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
          </section>

          <section id="features" className="mb-16">
            <h2 className="font-heading text-2xl text-foreground mb-8">
              What You'll Get
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-border/50 bg-card/50 text-center hover:bg-card/80 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent/50 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="tips" className="mb-16">
            <h2 className="font-heading text-2xl text-foreground mb-6">
              Pro Tips
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {tips.map((tip) => (
                <Card
                  key={tip.title}
                  className="border-border/50 bg-card/50 hover:bg-card/80 transition-all"
                >
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg text-foreground mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-muted-foreground">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="faq" className="mb-16">
            <h2 className="font-heading text-2xl text-foreground mb-6">
              Common Questions
            </h2>
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
                <Card key={index} className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg text-foreground mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="pt-8 border-t border-border/50">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 text-center">
                <h2 className="font-heading text-2xl text-foreground mb-3">
                  Ready to <span className="text-primary">Dive In</span>?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Start preserving your digital legacy today. It only takes a
                  few minutes to set up.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/signup">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Create Free Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/docs">
                    <Button variant="ghost" className="w-full sm:w-auto">
                      Read Full Documentation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
