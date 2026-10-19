import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
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
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import {
  getJob,
  listJobLeads,
  deleteResult,
  deleteResults,
  setResultResponded,
  ApiJob,
  ApiResult,
  ApiError,
} from "../lib/api";
import { LeadResultRow } from "../components/LeadResultRow";
import { getForumLabel } from "../lib/constants";
import { ArrowLeft, Loader2, ChevronDown, Trash2, X } from "lucide-react";
import { toast } from "sonner";

// The backend's own max page size — large enough to cover realistic lead
// counts in one request so sort/filter can apply across everything at once.
const FETCH_LIMIT = 1000;

type SortBy = "date" | "relevance";
type RespondedFilter = "all" | "unresponded" | "responded";

export function JobLeads() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<ApiJob | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [leads, setLeads] = useState<ApiResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [selectedForums, setSelectedForums] = useState<string[] | null>(null); // null until the job loads
  const [respondedFilter, setRespondedFilter] = useState<RespondedFilter>("all");

  const toggleForum = (forumId: string) => {
    setSelectedForums((prev) => {
      const current = prev ?? job?.forums ?? [];
      return current.includes(forumId) ? current.filter((id) => id !== forumId) : [...current, forumId];
    });
  };

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleResponded = async (resultId: string, responded: boolean) => {
    if (!job) return;
    try {
      const updated = await setResultResponded(job.productId, resultId, responded);
      setLeads((prev) => prev.map((r) => (r.id === resultId ? updated : r)));
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to update lead";
      toast.error(message);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!job) return;
    try {
      await deleteResult(job.productId, id);
      setLeads((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => prev - 1);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("Lead deleted");
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to delete lead";
      toast.error(message);
    }
  };

  const handleDeleteSelected = async () => {
    if (!job || selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const { ids: deletedIds } = await deleteResults(job.productId, ids);
      const deletedSet = new Set(deletedIds);
      setLeads((prev) => prev.filter((r) => !deletedSet.has(r.id)));
      setTotal((prev) => prev - deletedSet.size);
      setSelectedIds(new Set());
      toast.success(`Deleted ${deletedSet.size} lead${deletedSet.size === 1 ? "" : "s"}`);
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to delete leads";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadPage = useCallback(
    (offset: number) => {
      if (!jobId) return;
      setIsLoadingMore(true);
      listJobLeads(jobId, { limit: FETCH_LIMIT, offset })
        .then((page) => {
          setLeads((prev) => (offset === 0 ? page.leads : [...prev, ...page.leads]));
          setTotal(page.total);
        })
        .catch((err) => {
          const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load leads";
          toast.error(`Couldn't load leads: ${message}`);
        })
        .finally(() => setIsLoadingMore(false));
    },
    [jobId]
  );

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    getJob(jobId)
      .then((fetched) => {
        if (!cancelled) setJob(fetched);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load job";
        setJobError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  // selectedForums starts null (meaning "all of the job's forums") until the
  // job loads, so the filter dropdown has something to show as checked.
  const effectiveSelectedForums = selectedForums ?? job?.forums ?? [];
  const jobForums = job?.forums ?? [];

  const forumFilterLabel =
    effectiveSelectedForums.length === jobForums.length
      ? "All Forums"
      : effectiveSelectedForums.length === 0
      ? "No Forums"
      : effectiveSelectedForums.length === 1
      ? getForumLabel(effectiveSelectedForums[0])
      : `${effectiveSelectedForums.length} Forums`;

  const displayedLeads = useMemo(() => {
    const filtered = leads.filter((lead) => {
      if (!effectiveSelectedForums.includes(lead.source)) return false;
      if (respondedFilter === "unresponded" && lead.respondedAt) return false;
      if (respondedFilter === "responded" && !lead.respondedAt) return false;
      return true;
    });

    if (sortBy === "relevance") {
      return [...filtered].sort((a, b) => (b.relevanceScore ?? -1) - (a.relevanceScore ?? -1));
    }
    return filtered; // already date-desc from the backend
  }, [leads, effectiveSelectedForums, respondedFilter, sortBy]);

  if (jobError) {
    return (
      <div className="overflow-y-auto main-content h-full">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-muted-foreground">{jobError}</p>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="overflow-y-auto main-content h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto main-content h-full">
      <div className="w-full px-[1in] py-8 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/dashboard/products/${job.productId}/jobs`)}
          className="-ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scheduled Searches
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Leads — {job.productName ?? "this job"}</CardTitle>
              <Badge variant={job.status === "active" ? "default" : job.status === "completed" ? "secondary" : "outline"} className="capitalize">
                {job.status}
              </Badge>
            </div>
            <CardDescription>
              Every lead this scheduled search has found, across all its runs — {total} result{total === 1 ? "" : "s"}{" "}
              so far. Searching {job.forums.map(getForumLabel).join(", ")} at {Math.round(job.minScore * 100)}%+
              match, until {job.endDate}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No leads found yet — this job hasn't run, or hasn't found anything above its relevance threshold.
              </p>
            ) : (
              <>
                {/* Sort & filter toolbar */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 pb-4 mb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sortBy" className="text-sm text-muted-foreground whitespace-nowrap">
                      Sort by
                    </Label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                      <SelectTrigger id="sortBy" className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Most Relevant</SelectItem>
                        <SelectItem value="date">Most Recent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="respondedFilter" className="text-sm text-muted-foreground whitespace-nowrap">
                      Status
                    </Label>
                    <Select value={respondedFilter} onValueChange={(value) => setRespondedFilter(value as RespondedFilter)}>
                      <SelectTrigger id="respondedFilter" className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="unresponded">Not Responded</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {jobForums.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground whitespace-nowrap">Forums</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="outline" size="sm" className="w-48 justify-between">
                            {forumFilterLabel}
                            <ChevronDown className="w-4 h-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuCheckboxItem
                            checked={effectiveSelectedForums.length === jobForums.length}
                            onSelect={(e) => e.preventDefault()}
                            onCheckedChange={(checked) => setSelectedForums(checked ? jobForums : [])}
                          >
                            All
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuSeparator />
                          {jobForums.map((forumId) => (
                            <DropdownMenuCheckboxItem
                              key={forumId}
                              checked={effectiveSelectedForums.includes(forumId)}
                              onSelect={(e) => e.preventDefault()}
                              onCheckedChange={() => toggleForum(forumId)}
                            >
                              {getForumLabel(forumId)}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {selectedIds.size > 0 && (
                  <div className="flex items-center justify-between gap-3 mb-3 p-2.5 rounded-lg border border-border bg-muted/30">
                    <span className="text-sm text-foreground">
                      {selectedIds.size} lead{selectedIds.size === 1 ? "" : "s"} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isDeleting}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {selectedIds.size} lead{selectedIds.size === 1 ? "" : "s"}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This removes them from your saved results. This can't be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}

                {displayedLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No leads match the selected filters.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {displayedLeads.map((lead) => (
                      <LeadResultRow
                        key={lead.id}
                        result={lead}
                        selected={selectedIds.has(lead.id)}
                        onToggleSelect={toggleSelect}
                        onDelete={handleDeleteOne}
                        onToggleResponded={handleToggleResponded}
                      />
                    ))}
                  </div>
                )}

                {leads.length < total && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={() => loadPage(leads.length)} disabled={isLoadingMore}>
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load more (${total - leads.length} remaining)`
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
