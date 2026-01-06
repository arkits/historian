import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Globe,
  Code2,
  Server,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const docsNavSections: NavSection[] = [
  {
    title: "Getting Started",
    icon: BookOpen,
    items: [
      { title: "Introduction", href: "/docs/getting-started" },
      { title: "Quick Start", href: "/docs/getting-started#quick-start" },
      { title: "Features", href: "/docs/getting-started#features" },
      { title: "FAQ", href: "/docs/getting-started#faq" },
    ],
  },
  {
    title: "Supported Services",
    icon: Globe,
    items: [
      { title: "Overview", href: "/docs/supported-services" },
      { title: "Browsers", href: "/docs/supported-services#browsers" },
      { title: "Reading", href: "/docs/supported-services#reading" },
      { title: "Music", href: "/docs/supported-services#music" },
      { title: "Video", href: "/docs/supported-services#video" },
      {
        title: "Communication",
        href: "/docs/supported-services#communication",
      },
      { title: "Development", href: "/docs/supported-services#development" },
      { title: "Photography", href: "/docs/supported-services#photography" },
      { title: "Gaming", href: "/docs/supported-services#gaming" },
      { title: "Shopping", href: "/docs/supported-services#shopping" },
      { title: "Cloud Storage", href: "/docs/supported-services#cloud" },
      { title: "Productivity", href: "/docs/supported-services#productivity" },
      { title: "Fitness", href: "/docs/supported-services#fitness" },
    ],
  },
  {
    title: "API Reference",
    icon: Code2,
    items: [
      { title: "Overview", href: "/docs/api" },
      { title: "Authentication", href: "/docs/api#authentication" },
      { title: "Endpoints", href: "/docs/api#endpoints" },
      { title: "Examples", href: "/docs/api#examples" },
      { title: "Rate Limits", href: "/docs/api#rate-limits" },
    ],
  },
  {
    title: "Self-Hosting",
    icon: Server,
    items: [
      { title: "Overview", href: "/docs/self-hosting" },
      { title: "Requirements", href: "/docs/self-hosting#requirements" },
      { title: "Docker", href: "/docs/self-hosting#docker" },
      { title: "Manual", href: "/docs/self-hosting#manual" },
      { title: "Environment Variables", href: "/docs/self-hosting#env-vars" },
      { title: "Security", href: "/docs/self-hosting#security" },
    ],
  },
];

function NavSection({
  section,
  isOpen,
  onToggle,
}: {
  section: NavSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(
    section.items[0]?.href.split("#")[0] || "",
  );

  const handleHashLinkClick = (e: React.MouseEvent, href: string) => {
    const hash = href.split("#")[1];
    if (hash && location.pathname === href.split("#")[0]) {
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", href);
      }
    }
  };

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          isActive
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        )}
      >
        <span className="flex items-center gap-2">
          <section.icon className="w-4 h-4" />
          {section.title}
        </span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      {isOpen && (
        <div className="mt-1 ml-4 space-y-0.5 border-l border-border/50 ml-7">
          {section.items.map((item) => {
            const isItemActive = location.pathname === item.href.split("#")[0];
            const hasHash =
              item.href.includes("#") &&
              location.pathname === item.href.split("#")[0];
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleHashLinkClick(e, item.href)}
                className={cn(
                  "block px-3 py-1.5 text-sm rounded-md transition-colors",
                  isItemActive || hasHash
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DocsSidebar() {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(() => {
    return docsNavSections
      .filter((section) =>
        section.items.some(
          (item) =>
            item.href &&
            location.pathname.startsWith(item.href.split("#")[0] || ""),
        ),
      )
      .map((section) => section.title);
  });

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.pathname, location.hash]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const isDocsPage = location.pathname === "/docs";

  if (isDocsPage) {
    return null;
  }

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-border/50 bg-background/95 backdrop-blur-sm overflow-y-auto hidden lg:block">
      <nav className="p-4">
        <div className="mb-4 px-3">
          <Link
            to="/docs"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Documentation
          </Link>
        </div>
        <div className="space-y-1">
          {docsNavSections.map((section) => (
            <NavSection
              key={section.title}
              section={section}
              isOpen={openSections.includes(section.title)}
              onToggle={() => toggleSection(section.title)}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}
