import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trpc } from "@/client/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/lib/api-url";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();
  trpc.getSession.useQuery(undefined, {
    retry: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/auth/sign-in/email"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: window.location.origin,
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Sign in failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("auth-token", data.token);
      }

      await utils.getSession.invalidate();
      navigate("/dashboard");
    } catch {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/20"></div>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          filter: "brightness(0.5)",
        }}
      ></div>

      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm">Back</span>
      </Link>

      <Card className="w-full max-w-md relative border-border/50 bg-card/80 backdrop-blur-xl raycast-shadow animate-scale-in">
        <CardHeader className="text-center space-y-4 pb-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 group"
          >
            <span className="text-5xl transition-transform group-hover:scale-110">
              🕵️
            </span>
          </Link>
          <div>
            <CardTitle className="font-heading text-3xl text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Sign in to access your history
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              />
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full raycast-shadow"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
