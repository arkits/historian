import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";

interface DocsNavBarProps {
  showBackLink?: boolean;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function DocsNavBar({
  showBackLink = false,
  onMenuToggle,
  isMenuOpen,
}: DocsNavBarProps) {
  const location = useLocation();

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/supported-services", label: "Services" },
    { href: "/docs", label: "Docs" },
  ];

  const isDocsPage = location.pathname === "/docs";
  const isInnerDocsPage = location.pathname.startsWith("/docs/") && !isDocsPage;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
      <div className="h-16 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {isInnerDocsPage && onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          )}
          {showBackLink && (
            <Link
              to="/docs"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm hidden sm:inline">Back</span>
            </Link>
          )}
          {!showBackLink && (
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl transition-transform group-hover:scale-110">
                🕵️
              </span>
              <span className="font-heading text-xl lg:text-2xl text-foreground">
                Historian
              </span>
            </Link>
          )}
          {isInnerDocsPage && (
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/50 text-xs text-muted-foreground ml-2">
              <span className="w-1 h-1 rounded-full bg-primary"></span>
              Docs
            </span>
          )}
        </div>

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
