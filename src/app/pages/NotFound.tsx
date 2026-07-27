import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Home, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-3">Page Not Found</h2>
          <p className="text-muted-foreground text-center mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
