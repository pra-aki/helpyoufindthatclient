import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { login, isAuthenticated } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    const user = login(email, password);
    if (user) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-2xl font-bold">H</span>
            </div>
          </div>
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <h1 className="text-xl text-muted-foreground" style={{ fontFamily: 'cursive' }}>help you</h1>
            <h1 className="text-4xl font-bold text-foreground">Find That</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Find your perfect leads, effortlessly
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your lead generation dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input-background"
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                Sign In
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Demo: Enter any email and password to login
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}