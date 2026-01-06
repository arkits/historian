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
  Download,
  Settings,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { DocsNavBar } from "@/components/DocsNavBar";
import { DocsSidebar } from "@/components/DocsSidebar";
import { useState } from "react";

export function DocsSelfHostingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              <Server className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Self-Hosting Guide
              </span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl text-foreground mb-4">
              Run Historian <span className="text-primary">Self-Hosted</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Take full control of your data. Deploy Historian on your own
              infrastructure with Docker or manual installation.
            </p>
          </div>

          <section id="requirements" className="mb-12">
            <h2 className="font-heading text-2xl text-foreground mb-6">
              System Requirements
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {requirements.map((req) => (
                <Card
                  key={req.name}
                  className="border-border/50 bg-card/50 text-center"
                >
                  <CardContent className="p-5">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent/50 flex items-center justify-center">
                      <req.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg text-foreground mb-1">
                      {req.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">{req.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="docker" className="mb-12 scroll-mt-24">
            <h2 className="font-heading text-2xl text-foreground mb-6">
              Docker <span className="text-primary">Deployment</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Deploy Historian with Docker Compose in minutes
            </p>

            <div className="space-y-6">
              {dockerSteps.map((step) => (
                <div key={step.step}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-heading text-sm text-emerald-500">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {step.description}
                      </p>
                      <div className="bg-background/50 rounded-lg overflow-hidden">
                        <pre className="p-4 text-xs font-mono overflow-x-auto">
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
          </section>

          <section id="manual" className="mb-12 scroll-mt-24">
            <h2 className="font-heading text-2xl text-foreground mb-6">
              Manual <span className="text-primary">Installation</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Full manual setup for maximum control
            </p>

            <div className="space-y-6">
              {manualSteps.map((step) => (
                <div key={step.step}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-heading text-sm text-amber-500">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {step.description}
                      </p>
                      <div className="bg-background/50 rounded-lg overflow-hidden">
                        <pre className="p-4 text-xs font-mono overflow-x-auto">
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
          </section>

          <section id="env-vars" className="mb-12 scroll-mt-24">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl text-foreground">
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
                        <th className="text-left p-3 font-medium text-muted-foreground">
                          Variable
                        </th>
                        <th className="text-left p-3 font-medium text-muted-foreground">
                          Required
                        </th>
                        <th className="text-left p-3 font-medium text-muted-foreground">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {envVars.map((env) => (
                        <tr key={env.key} className="border-t border-border/50">
                          <td className="p-3 font-mono text-primary">
                            {env.key}
                          </td>
                          <td className="p-3">
                            {env.required ? (
                              <span className="flex items-center gap-1 text-red-400 text-xs">
                                <Lock className="w-3 h-3" />
                                Required
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {env.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="security" className="scroll-mt-24">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-xl text-foreground mb-4">
                      Security Recommendations
                    </h2>
                    <ul className="space-y-2">
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
                          className="flex items-center gap-2 text-muted-foreground text-sm"
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
          </section>
        </div>
      </main>
    </div>
  );
}
