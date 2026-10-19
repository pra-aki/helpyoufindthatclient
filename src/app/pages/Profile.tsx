import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { getCurrentUser, changePassword, User as AuthUser } from "../lib/auth";
import {
  listProducts,
  listProductResults,
  listJobs,
  listJobRuns,
  listCredits,
  submitErrorReport,
  ApiCreditTransaction,
  ApiError,
} from "../lib/api";
import { useCredits } from "../lib/credits-context";
import { downloadJson } from "../lib/download";
import { User, Shield, Download, Loader2, Coins, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";

const TRANSACTIONS_PAGE_SIZE = 20;

const TRANSACTION_REASON_LABEL: Record<ApiCreditTransaction["reason"], string> = {
  signup_grant: "Signup bonus",
  search: "Lead search",
  job_run: "Scheduled search run",
  refund: "Refund",
};

const formatTransactionDate = (iso: string) =>
  new Date(iso).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

/** Pages through a paginated endpoint until every item is collected. */
async function fetchAllPages<T>(
  fetchPage: (offset: number) => Promise<{ items: T[]; total: number }>,
  pageSize: number
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;
  // Safety cap so a backend bug (e.g. total never catching up) can't loop forever.
  for (let i = 0; i < 1000; i++) {
    const { items, total } = await fetchPage(offset);
    all.push(...items);
    offset += items.length;
    if (items.length === 0 || all.length >= total) break;
    if (items.length < pageSize) break; // short page with no more reported — stop regardless
  }
  return all;
}

export function Profile() {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const { balance, pricing } = useCredits();

  // General "report a problem" feedback, not tied to a specific lead.
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast.error("Please describe the problem first");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      await submitErrorReport({ message: feedbackMessage.trim(), page: location.pathname });
      toast.success("Thanks — we've got your report.");
      setFeedbackMessage("");
      setIsFeedbackOpen(false);
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to send your report";
      toast.error(message);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Credits ledger
  const [transactions, setTransactions] = useState<ApiCreditTransaction[] | null>(null);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const loadTransactions = useCallback((offset: number) => {
    setIsLoadingTransactions(true);
    listCredits({ limit: TRANSACTIONS_PAGE_SIZE, offset })
      .then((page) => {
        setTransactions((prev) => (offset === 0 ? page.transactions : [...(prev ?? []), ...page.transactions]));
        setTransactionsTotal(page.total);
      })
      .catch((err) => {
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load credit history";
        toast.error(message);
        setTransactions((prev) => prev ?? []);
      })
      .finally(() => setIsLoadingTransactions(false));
  }, []);

  useEffect(() => {
    loadTransactions(0);
  }, [loadTransactions]);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((fetched) => {
      if (cancelled || !fetched) return;
      setUser(fetched);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Change password
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const resetPasswordForm = () => {
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated");
      resetPasswordForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Download my data: a full account backup as one JSON file.
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const products = await listProducts();

      const results = await Promise.all(
        products.map((product) =>
          fetchAllPages(
            (offset) =>
              listProductResults(product.id, { limit: 1000, offset }).then((page) => ({
                items: page.results,
                total: page.total,
              })),
            1000
          ).then((leads) => ({ productId: product.id, leads }))
        )
      );

      const jobs = await listJobs();

      const runs = await Promise.all(
        jobs.map((job) =>
          fetchAllPages(
            (offset) =>
              listJobRuns(job.id, { limit: 365, offset }).then((page) => ({ items: page.runs, total: page.total })),
            365
          ).then((jobRuns) => ({ jobId: job.id, runs: jobRuns }))
        )
      );

      const firstCreditsPage = await listCredits({ limit: 100, offset: 0 });
      const laterTransactions =
        firstCreditsPage.total > firstCreditsPage.transactions.length
          ? await fetchAllPages(
              (offset) => listCredits({ limit: 100, offset }).then((page) => ({ items: page.transactions, total: page.total })),
              100
            )
          : firstCreditsPage.transactions;

      const exportData = {
        exportedAt: new Date().toISOString(),
        account: { id: user.id, email: user.email, name: user.name },
        products,
        leadsByProduct: Object.fromEntries(results.map((r) => [r.productId, r.leads])),
        jobs,
        runsByJob: Object.fromEntries(runs.map((r) => [r.jobId, r.runs])),
        credits: { balance: firstCreditsPage.balance, pricing: firstCreditsPage.pricing, transactions: laterTransactions },
      };

      downloadJson(`helpyoufindthat-data-${new Date().toISOString().slice(0, 10)}.json`, exportData);
      toast.success("Downloaded your data");
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to export your data";
      toast.error(message);
    } finally {
      setIsExporting(false);
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
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-foreground">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              <CardTitle>Credits</CardTitle>
            </div>
            <CardDescription>
              {pricing
                ? `Every ${pricing.leadsPerCredit} leads searched costs 1 credit per forum — new accounts start with ${pricing.signupCredits}.`
                : "Spent on lead searches and scheduled search runs."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-foreground">{balance ?? "—"}</span>
              <span className="text-sm text-muted-foreground">credits remaining</span>
            </div>

            {transactions === null ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No credit activity yet.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{formatTransactionDate(tx.createdAt)}</TableCell>
                          <TableCell>{TRANSACTION_REASON_LABEL[tx.reason] ?? tx.reason}</TableCell>
                          <TableCell className={tx.delta >= 0 ? "text-primary" : "text-destructive"}>
                            {tx.delta >= 0 ? `+${tx.delta}` : tx.delta}
                          </TableCell>
                          <TableCell>{tx.balanceAfter}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {transactions.length < transactionsTotal && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTransactions(transactions.length)}
                      disabled={isLoadingTransactions}
                    >
                      {isLoadingTransactions ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load more (${transactionsTotal - transactions.length} remaining)`
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
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
              {!isChangingPassword ? (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Change your password to keep your account secure
                  </p>
                  <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                    Change Password
                  </Button>
                </>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-input-background"
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-input-background"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-input-background"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" disabled={isSavingPassword}>
                      {isSavingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Password"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetPasswordForm} disabled={isSavingPassword}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              <CardTitle>Your Data</CardTitle>
            </div>
            <CardDescription>Download a complete copy of your account's data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                Includes your products, every lead found for them, your scheduled searches and their run history,
                and your credits ledger — as one JSON file.
              </p>
              <Button variant="outline" onClick={handleDownloadData} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparing download...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download My Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help & Feedback */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5" />
              <CardTitle>Help &amp; Feedback</CardTitle>
            </div>
            <CardDescription>Found a bug or something not working right? Let us know.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setIsFeedbackOpen(true)}>
              Report a Problem
            </Button>
            <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report a Problem</DialogTitle>
                  <DialogDescription>
                    Tell us what happened. For an issue with a specific lead's quality, use the flag icon on that
                    lead instead — it's more useful to us with that context attached.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="What went wrong?"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFeedbackOpen(false)}
                    disabled={isSubmittingFeedback}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSubmitFeedback} disabled={isSubmittingFeedback}>
                    {isSubmittingFeedback ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
