import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Zap, ArrowRight, Search, CalendarClock, Filter, Download } from "lucide-react";
import { FORUM_PLATFORMS } from "../lib/constants";

export function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">H</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-muted-foreground" style={{ fontFamily: 'cursive' }}>help you</span>
                <span className="text-xl font-bold text-foreground">Find That</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Online Lead Search
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Find People Already Looking for What You Sell
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            We scan {FORUM_PLATFORMS.map((f) => f.label).join(", ")} for conversations where people are
            asking for something like your product, then rank and summarize every lead so you know exactly
            which ones are worth your time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Finding Leads
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Add Your Product</h3>
                <p className="text-muted-foreground">
                  Drop in your website URL and we'll draft a description for you automatically, or write
                  your own.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">We Search For You</h3>
                <p className="text-muted-foreground">
                  Run a search on demand, or schedule it to run daily. We scan{" "}
                  {FORUM_PLATFORMS.map((f) => f.label).join(", ")} for relevant conversations and score,
                  summarize, and explain why each one matches.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Review &amp; Reach Out</h3>
                <p className="text-muted-foreground">
                  Sort and filter your leads, mark the ones you've responded to, export to CSV, and open
                  the original thread to reply in your own words.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground">Built for Finding Leads, Not Busywork</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Relevance-Scored Leads</h3>
              <p className="text-muted-foreground text-sm">
                Every lead gets a match score, a summary, and a plain-English reason it's relevant — no
                digging through threads to find out.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CalendarClock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Daily Search Jobs</h3>
              <p className="text-muted-foreground text-sm">
                Schedule a search to run automatically every day and get new leads emailed to you as
                they're found.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Filter className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sort, Filter &amp; Track</h3>
              <p className="text-muted-foreground text-sm">
                Filter by forum, date, or response status, and keep track of which leads you've already
                followed up with.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Export Anytime</h3>
              <p className="text-muted-foreground text-sm">
                Download your full lead list as a CSV whenever you want to work with it outside the app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Generate More Leads?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join businesses finding warm leads in conversations that are already happening
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8">
              Get 100 Free Beta Credits
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Get started in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">H</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground" style={{ fontFamily: 'cursive' }}>help you</span>
                  <span className="text-xl font-bold text-foreground">Find That</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Find people looking for solutions or services you provide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/signup" className="hover:text-foreground">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-foreground">Sign Up</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2026 helpyoufindthat. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
