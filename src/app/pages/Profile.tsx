import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { getCurrentUser } from "../lib/auth";
import { User, Mail, Bell, Shield } from "lucide-react";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";

export function Profile() {
  const user = getCurrentUser();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated");
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-muted text-muted-foreground";
      case "pro":
        return "bg-primary text-primary-foreground";
      case "enterprise":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Profile Settings</h1>

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label>Current Plan</Label>
                <div>
                  <Badge className={getPlanBadgeColor(user.plan)}>
                    {user.plan.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails when new leads are found
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Get a summary of your lead generation activity
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={weeklyReports}
                onCheckedChange={setWeeklyReports}
              />
            </div>

            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Change your password to keep your account secure
              </p>
              <Button variant="outline">Change Password</Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>

        {/* API Access */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <CardTitle>API Access</CardTitle>
            </div>
            <CardDescription>Manage your API keys and integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.plan === "enterprise" ? (
              <>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-foreground mb-2">Your API Key:</p>
                  <code className="text-xs bg-background px-3 py-2 rounded block overflow-x-auto">
                    bf_sk_live_1234567890abcdefghijklmnopqrstuvwxyz
                  </code>
                </div>
                <Button variant="outline">Generate New Key</Button>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                API access is available on the Enterprise plan.{" "}
                <a href="/subscription" className="text-primary hover:underline">
                  Upgrade now
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Delete Account</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Permanently delete your account and all associated data
              </p>
              <Button variant="destructive" onClick={() => toast.error("Account deletion is disabled in demo mode")}>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
