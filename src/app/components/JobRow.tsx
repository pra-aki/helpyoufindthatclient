import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { cancelJob, listJobRuns, ApiJob, ApiJobRun, ApiError } from "../lib/api";
import { getForumLabel } from "../lib/constants";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const RUNS_PAGE_SIZE = 20;

export const formatJobDateTime = (iso: string) =>
  new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const statusVariant = (status: ApiJob["status"]): "default" | "secondary" | "outline" => {
  switch (status) {
    case "active":
      return "default";
    case "completed":
      return "secondary";
    case "cancelled":
      return "outline";
  }
};

const lastOutcomeText = (job: ApiJob) => {
  if (!job.lastRunAt) return "Not run yet";
  const when = formatJobDateTime(job.lastRunAt);
  return job.lastStatus === "error" ? `Last run ${when} — error` : `Last run ${when}`;
};

const emailStatusVariant = (status: ApiJobRun["emailStatus"]): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "sent":
      return "default";
    case "skipped":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

/**
 * One scheduled-search row: status, forums, schedule, last outcome, with an expandable run
 * history table. Shared by the per-product Scheduled Searches page and the dashboard's "Your
 * Jobs" tab (which also shows which product each job belongs to).
 */
export function JobRow({
  job,
  productName,
  onChange,
  onOpenLeads,
}: {
  job: ApiJob;
  // Shown next to the forums when jobs from multiple products are listed together.
  productName?: string;
  onChange: (updated: ApiJob) => void;
  onOpenLeads?: (job: ApiJob) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [runs, setRuns] = useState<ApiJobRun[] | null>(null);
  const [runsTotal, setRunsTotal] = useState(0);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadRuns = (offset: number) => {
    setIsLoadingRuns(true);
    listJobRuns(job.id, { limit: RUNS_PAGE_SIZE, offset })
      .then((page) => {
        setRuns((prev) => (offset === 0 ? page.runs : [...(prev ?? []), ...page.runs]));
        setRunsTotal(page.total);
      })
      .catch((err) => {
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load run history";
        toast.error(message);
      })
      .finally(() => setIsLoadingRuns(false));
  };

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && runs === null) loadRuns(0);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const updated = await cancelJob(job.id);
      onChange(updated);
      toast.success("Scheduled search cancelled");
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to cancel";
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  const details = (
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(job.status)} className="capitalize">
          {job.status}
        </Badge>
        {productName && <span className="text-sm font-medium text-foreground">{productName}</span>}
        <span className="text-sm text-muted-foreground break-words">{job.forums.map(getForumLabel).join(", ")}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          {job.threads} lead{job.threads === 1 ? "" : "s"}/day · {Math.round(job.minScore * 100)}%+ match
        </span>
        <span>Ends {job.endDate}</span>
        {job.status === "active" && <span>Next run {formatJobDateTime(job.nextRunAt)}</span>}
        <span>{lastOutcomeText(job)}</span>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="h-6 w-6 mt-0.5 flex-shrink-0 text-muted-foreground"
          aria-label={expanded ? "Hide run history" : "Show run history"}
          aria-expanded={expanded}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </Button>

        {onOpenLeads ? (
          <button type="button" onClick={() => onOpenLeads(job)} className="flex-1 min-w-0 text-left hover:opacity-80">
            {details}
          </button>
        ) : (
          details
        )}

        {job.status === "active" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={isCancelling} className="flex-shrink-0">
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this scheduled search?</AlertDialogTitle>
                <AlertDialogDescription>
                  It stops running daily. Leads it already found and its run history stay put.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>Cancel Search</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {expanded && (
        <div className="border-t border-border p-3 bg-muted/20">
          {isLoadingRuns && runs === null ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
          ) : !runs || runs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No runs yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ran</TableHead>
                      <TableHead>Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Found</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>New</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>{formatJobDateTime(run.ranAt)}</TableCell>
                        <TableCell>
                          {run.from} – {run.to}
                        </TableCell>
                        <TableCell>
                          <Badge variant={run.status === "ok" ? "secondary" : "destructive"} title={run.error ?? undefined}>
                            {run.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{run.foundCount ?? "—"}</TableCell>
                        <TableCell>{run.leadCount ?? "—"}</TableCell>
                        <TableCell>{run.newLeadCount ?? "—"}</TableCell>
                        <TableCell>
                          {run.emailStatus ? (
                            <Badge variant={emailStatusVariant(run.emailStatus)} title={run.emailError ?? undefined}>
                              {run.emailStatus}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {runs.length < runsTotal && (
                <div className="flex justify-center pt-3">
                  <Button variant="outline" size="sm" onClick={() => loadRuns(runs.length)} disabled={isLoadingRuns}>
                    {isLoadingRuns ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load more (${runsTotal - runs.length} remaining)`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
