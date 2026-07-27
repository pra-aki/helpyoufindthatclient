import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { getCurrentUser, logout, User } from "../lib/auth";
import { Button } from "./ui/button";
import { LayoutDashboard, CreditCard, UserCircle, LogOut, Menu, X, Search, Plus, Mail, MessageSquare } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { mockLeadRequests, LeadRequest } from "../lib/mock-data";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [requests, setRequests] = useState<LeadRequest[]>(mockLeadRequests);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNewSearch = () => {
    navigate("/dashboard");
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    // Scroll to top of main content after navigation
    setTimeout(() => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }, 100);
  };

  const handleSidebarLinkClick = () => {
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const getStatusIcon = (status: LeadRequest["status"]) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "in-progress":
        return "🔄";
      case "completed":
        return "✓";
      case "cancelled":
        return "✕";
    }
  };

  const getStatusColor = (status: LeadRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-muted text-muted-foreground";
      case "in-progress":
        return "bg-accent text-accent-foreground";
      case "completed":
        return "bg-primary text-primary-foreground";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
    }
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
              {/* Sidebar Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center gap-2">
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
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive("/dashboard")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/dashboard/subscription"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive("/dashboard/subscription")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Subscription
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
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/subscription"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive("/dashboard/subscription")
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Subscription
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
        {/* Sidebar - Search History */}
        {sidebarOpen && (
          <div className="w-64 border-r border-border bg-muted/20 flex flex-col h-[calc(100vh-4rem)] sticky top-16">
            {/* Start New Search Button */}
            <div className="p-3">
              <Button 
                onClick={handleNewSearch}
                className="w-full justify-start gap-2"
              >
                <Plus className="w-4 h-4" />
                Start New Search
              </Button>
            </div>

            {/* Searches List */}
            <div className="flex-1 overflow-y-auto p-2 pt-0">
              <div className="px-2 py-2 mb-1">
                <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Previous Searches
                </h2>
              </div>
              {requests.length === 0 ? (
                <div className="px-2 py-8 text-center">
                  <p className="text-xs text-muted-foreground">
                    No searches yet
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {requests.map((request) => (
                    <Link
                      key={request.id}
                      to={`/dashboard/leads/${request.id}`}
                      className="block p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                      onClick={handleSidebarLinkClick}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-1">
                          {request.searchType === "direct" ? (
                            <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          )}
                          <h3 className="font-medium text-sm truncate">
                            {request.productName}
                          </h3>
                        </div>
                        {request.newLeadsCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0">
                            {request.newLeadsCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                          <span className="mr-1">{getStatusIcon(request.status)}</span>
                          <span>{request.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{request.leadsFound} leads</span>
                        <span>{request.progress}%</span>
                      </div>
                      {request.status === "in-progress" && (
                        <Progress value={request.progress} className="h-1 mt-2" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          © 2026 helpyoufindthat. All rights reserved.
        </div>
      </footer>
    </div>
  );
}