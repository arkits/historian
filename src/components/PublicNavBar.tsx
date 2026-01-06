import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function PublicNavBar() {
  const location = useLocation();

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/supported-services", label: "Services" },
    { href: "/docs", label: "Docs" },
  ];

  return (
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

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`text-sm transition-colors ${
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/arkits/historian"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            <Github className="w-5 h-5" />
          </a>
          <Link to="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
