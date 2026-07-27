import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Search, Zap, Mail, Target, CheckCircle2, ArrowRight } from "lucide-react";

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
            Automated Lead Generation
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Find Your Perfect Leads,
            <br />
            <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Stop wasting time on manual lead research. Let our intelligent system discover and 
            qualify leads for your business while you focus on closing deals.
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
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start generating qualified leads for your business
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Enter Product Details</h3>
                <p className="text-muted-foreground">
                  Tell us about your product or service. What you sell, who your ideal customer is, 
                  and what makes your offer unique.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">We Search Asynchronously</h3>
                <p className="text-muted-foreground">
                  Our intelligent system searches the web 24/7, finding and qualifying leads that 
                  match your criteria while you focus on your business.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Get Notified</h3>
                <p className="text-muted-foreground">
                  Receive email notifications when qualified leads are found. Review leads in your 
                  dashboard and start reaching out immediately.
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
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose helpyoufindthat?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you grow your business faster
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Automated Lead Discovery</h3>
                <p className="text-muted-foreground">
                  Our system works around the clock, continuously searching for new leads that match 
                  your ideal customer profile.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Email Notifications</h3>
                <p className="text-muted-foreground">
                  Get instant alerts when new qualified leads are discovered, so you can reach out 
                  while they're hot.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Targeted Search</h3>
                <p className="text-muted-foreground">
                  Define your ideal customer criteria and let our AI find leads that perfectly match 
                  your requirements.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Easy Management</h3>
                <p className="text-muted-foreground">
                  Track all your lead requests in one place with progress bars, detailed views, and 
                  bulk contact options.
                </p>
              </div>
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
            Join businesses that are growing faster with automated lead generation
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8">
              Start Your Free Trial
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
                Automated lead generation that works while you sleep. Find qualified leads for your 
                business effortlessly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/signup" className="hover:text-foreground">Get Started</Link></li>
                <li><Link to="/subscription" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-foreground">Sign Up</Link></li>
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
