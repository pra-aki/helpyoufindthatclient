import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { getCurrentUser, logout, User } from "../lib/auth";
import { Button } from "./ui/button";
import { LayoutDashboard, UserCircle, LogOut, Menu, X, Coins } from "lucide-react";
import { CreditsProvider, useCredits } from "../lib/credits-context";

/** Credit balance pill, shown in the header and linking to the full ledger on Profile. */
function CreditsBadge() {
  const { balance, isLoading } = useCredits();

  return (
    <Link
      to="/dashboard/profile"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
      title="View your credits"
    >
      <Coins className="w-4 h-4" />
      {isLoading && balance === null ? "…" : `${balance ?? 0} credit${balance === 1 ? "" : "s"}`}
    </Link>
  );
}

export function Layout() {
  return (
    <CreditsProvider>
      <LayoutContent />
    </CreditsProvider>
  );
}

function LayoutContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((currentUser) => {
      if (cancelled) return;
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">H</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground" style={{ fontFamily: 'cursive' }}>help you</span>
                  <span className="text-xl font-bold text-foreground">Find That</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <CreditsBadge />
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive("/dashboard")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                View All Products
              </Link>
              <Link
                to="/dashboard/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive("/dashboard/profile")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col gap-2">
                <div onClick={() => setMobileMenuOpen(false)} className="mb-1">
                  <CreditsBadge />
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive("/dashboard")
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  View All Products
                </Link>
                <Link
                  to="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive("/dashboard/profile")
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <UserCircle className="w-4 h-4" />
                  Profile
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Page Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-sm text-muted-foreground">
          <span>© 2026 helpyoufindthat. All rights reserved.</span>
          <Link to="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}