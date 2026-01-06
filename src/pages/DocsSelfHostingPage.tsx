import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Server,
  Terminal,
  Database,
  Lock,
  Globe,
  Cloud,
  Cpu,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Download,
  Settings,
  Shield,
} from "lucide-react";
import { DocsNavBar } from "@/components/DocsNavBar";

export function DocsSelfHostingPage() {
  const requirements = [
    { icon: Cpu, name: "CPU", desc: "x86_64 or ARM64 architecture" },
    {
      icon: Terminal,
      name: "Memory",
      desc: "Minimum 1GB RAM (2GB recommended)",
    },
    { icon: Database, name: "Storage", desc: "Minimum 10GB disk space" },
    { icon: Globe, name: "Network", desc: "Internet connection for syncing" },
  ];

  const envVars = [
    {
      key: "DATABASE_URL",
      required: true,
      desc: "PostgreSQL connection string",
    },
    {
      key: "AUTH_SECRET",
      required: true,
      desc: "Secret key for authentication (32+ chars)",
    },
    {
      key: "NODE_ENV",
      required: false,
      desc: "Environment: production or development",
    },
    { key: "PORT", required: false, desc: "Port to listen on (default: 3000)" },
    {
      key: "API_KEY",
      required: false,
      desc: "Your API key for external access",
    },
  ];

  const dockerSteps = [
    {
      step: "1",
      title: "Create Docker Compose File",
      description:
        "Create a docker-compose.yml file with the Historian service and PostgreSQL database.",
      code: `version: '3.8'

services:
  historian:
    image: historian/app:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/historian
      - AUTH_SECRET=your-super-secret-key-here
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=historian
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:`,
    },
    {
      step: "2",
      title: "Generate Auth Secret",
      description:
        "Generate a secure secret key for authentication. This is critical for security.",
      code: `openssl rand -base64 32`,
    },
    {
      step: "3",
      title: "Start the Containers",
      description:
        "Run Docker Compose to start both the Historian app and PostgreSQL database.",
      code: `docker compose up -d`,
    },
    {
      step: "4",
      title: "Verify Installation",
      description: "Check that all containers are running properly.",
      code: `docker compose ps
# All containers should show "Up" status`,
    },
  ];

  const manualSteps = [
    {
      step: "1",
      title: "Install Dependencies",
      description: "Install Bun runtime and PostgreSQL database.",
      code: `# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql`,
    },
    {
      step: "2",
      title: "Create Database",
      description: "Set up the PostgreSQL database and user.",
      code: `sudo -u postgres psql

CREATE USER historian WITH PASSWORD 'your-secure-password';
CREATE DATABASE historian OWNER historian;
GRANT ALL PRIVILEGES ON DATABASE historian TO historian;

\q`,
    },
    {
      step: "3",
      title: "Clone and Build",
      description: "Clone the repository and build the application.",
      code: `git clone https://github.com/arkits/historian.git
cd historian
bun install
bun run build`,
    },
    {
      step: "4",
      title: "Configure Environment",
      description: "Create your .env file with all required variables.",
      code: `cat > .env << EOF
DATABASE_URL=postgresql://historian:your-secure-password@localhost:5432/historian
AUTH_SECRET=your-super-secret-key-here
NODE_ENV=production
PORT=3000
EOF`,
    },
    {
      step: "5",
      title: "Run Migrations",
      description: "Apply database migrations to set up the schema.",
      code: `bun run migrate`,
    },
    {
      step: "6",
      title: "Start the Server",
      description: "Start Historian in production mode.",
      code: `bun start`,
    },
  ];

  return (
    <div className="min-h-screen">
      <DocsNavBar showBackLink />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/10" />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border mb-6">
                <Server className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Self-Hosting Guide
                </span>
              </div>

              <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-6 leading-tight">
                Run Historian <span className="text-primary">Self-Hosted</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Take full control of your data. Deploy Historian on your own
                infrastructure with Docker or manual installation.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start Options */}
        <section className="py-12 px-6 border-y border-border/50 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Cloud className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-heading text-2xl text-foreground mb-2">
                        Docker (Recommended)
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Quick and easy deployment with Docker Compose. Includes
                        PostgreSQL and automatic updates.
                      </p>
                      <Button variant="outline" className="w-full">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Docker Guide
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-heading text-2xl text-foreground mb-2">
                        Manual Installation
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Full control with manual setup. Requires Bun runtime and
                        PostgreSQL.
                      </p>
                      <Button variant="outline" className="w-full">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Manual Guide
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                System <span className="text-primary">Requirements</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {requirements.map((req, index) => (
                <Card
                  key={req.name}
                  className="border-border/50 bg-card/50 text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-accent/50 flex items-center justify-center">
                      <req.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl text-foreground mb-2">
                      {req.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">{req.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Docker Guide */}
        <section className="py-16 px-6 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                Docker <span className="text-primary">Deployment</span>
              </h2>
              <p className="text-muted-foreground">
                Deploy Historian with Docker Compose in minutes
              </p>
            </div>

            <div className="space-y-8">
              {dockerSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-heading text-xl text-emerald-500">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-xl text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <div className="bg-background/50 rounded-lg overflow-hidden">
                        <pre className="p-4 text-sm font-mono overflow-x-auto">
                          <code className="text-muted-foreground">
                            {step.code}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Manual Guide */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="font-heading text-4xl text-foreground mb-4">
                Manual <span className="text-primary">Installation</span>
              </h2>
              <p className="text-muted-foreground">
                Full manual setup for maximum control
              </p>
            </div>

            <div className="space-y-8">
              {manualSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-heading text-xl text-amber-500">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-xl text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <div className="bg-background/50 rounded-lg overflow-hidden">
                        <pre className="p-4 text-sm font-mono overflow-x-auto">
                          <code className="text-muted-foreground">
                            {step.code}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Environment Variables */}
        <section className="py-16 px-6 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
          <div className="max-w-5xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl text-foreground">
                      Environment Variables
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Required and optional configuration options
                    </p>
                  </div>
                </div>

                <div className="bg-background/30 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-accent/30">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Variable
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Required
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {envVars.map((env) => (
                        <tr key={env.key} className="border-t border-border/50">
                          <td className="p-4 font-mono text-primary">
                            {env.key}
                          </td>
                          <td className="p-4">
                            {env.required ? (
                              <span className="flex items-center gap-1 text-red-400">
                                <Lock className="w-4 h-4" />
                                Required
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {env.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Security */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-2xl text-foreground mb-4">
                      Security Recommendations
                    </h2>
                    <ul className="space-y-3">
                      {[
                        "Use a strong AUTH_SECRET (32+ random characters)",
                        "Enable HTTPS with a reverse proxy (nginx, Caddy)",
                        "Keep PostgreSQL updated to the latest version",
                        "Use Docker's --read-only mode for production",
                        "Regularly backup your database",
                        "Limit database access to localhost only",
                      ].map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 text-muted-foreground"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <Link to="/docs/self-hosting" className="text-primary">
                Self-Hosting
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
