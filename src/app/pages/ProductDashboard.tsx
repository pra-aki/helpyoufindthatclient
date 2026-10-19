import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { FORUM_PLATFORMS } from "../lib/constants";
import {
  getProduct,
  updateProduct,
  describeWebsite,
  searchThreads,
  listProductResults,
  setResultResponded,
  createJob,
  listJobs,
  ApiProduct,
  ApiResult,
  ApiJob,
  ApiError,
} from "../lib/api";
import { LeadResultRow } from "../components/LeadResultRow";
import { JobRow } from "../components/JobRow";
import { useCredits } from "../lib/credits-context";
import { toDateInputValue, todayDateInputValue, daysAgoDateInputValue } from "../lib/dates";
import {
  Globe,
  Package,
  Search,
  Loader2,
  ArrowRight,
  Pencil,
  Sparkles,
  CalendarClock,
  Info,
  Coins,
} from "lucide-react";
import { toast } from "sonner";

const RESULTS_BOX_LIMIT = 20;
const LEAD_COUNT_OPTIONS = [10, 20, 30];
// Every 10 leads searched costs 1 credit, per forum searched.
const LEADS_PER_CREDIT = 10;
const creditsForLeadCount = (count: number) => count / LEADS_PER_CREDIT;
const MAX_RANGE_MONTHS = 3;
// Matches the backend's job config.limits.maxDays (92 days ~= 3 months).
const MAX_JOB_DAYS = 92;
const JOB_DEFAULT_DAYS = 30;
// Daily search jobs always search a fixed 10 leads/day per forum.
const JOB_LEAD_COUNT = 10;
const JOB_MIN_SCORE_OPTIONS = [25, 50, 75]; // percent
const JOB_DEFAULT_MIN_SCORE_PERCENT = 50;

// Earliest allowed "From" date for a given "To" date, capped to a 3-month span.
const earliestFromDateFor = (toDateValue: string) => {
  const date = new Date(`${toDateValue}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - MAX_RANGE_MONTHS);
  return toDateInputValue(date);
};

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
};
const maxJobEndDate = () => daysFromNow(MAX_JOB_DAYS);
const defaultJobEndDate = () => daysFromNow(JOB_DEFAULT_DAYS);

export function ProductDashboard() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { refresh: refreshCredits } = useCredits();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [results, setResults] = useState<ApiResult[] | null>(null);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [resultsTab, setResultsTab] = useState<"results" | "jobs">("results");
  const [jobs, setJobs] = useState<ApiJob[] | null>(null);

  // Editing the product's own name/website/description; its id never changes.
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editName, setEditName] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const handleGenerateDescription = async () => {
    if (!editWebsite) {
      toast.error("Please enter a product website URL first");
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const result = await describeWebsite(editWebsite);
      if (result.description) setEditDescription(result.description);

      if (result.confidence < 0.4) {
        toast.warning("Generated a description, but the site content was unclear — please review it");
      } else {
        toast.success("Description generated from website!");
      }
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to read the website";
      toast.error(message);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleStartEditProduct = () => {
    if (!product) return;
    setEditName(product.name);
    setEditWebsite(product.website ?? "");
    setEditDescription(product.description);
    setIsEditingProduct(true);
  };

  const handleSaveProduct = async () => {
    if (!product) return;
    if (!editName || !editWebsite || !editDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSavingProduct(true);
    try {
      const updated = await updateProduct(product.id, {
        name: editName,
        website: editWebsite,
        description: editDescription,
      });
      setProduct(updated); // same id, refreshed fields
      setIsEditingProduct(false);
      toast.success("Product updated");
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to update product";
      toast.error(message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const [numberOfLeads, setNumberOfLeads] = useState<number>(LEAD_COUNT_OPTIONS[0]);
  const [fromDate, setFromDate] = useState<string>(daysAgoDateInputValue(3));
  const [toDate, setToDate] = useState<string>(todayDateInputValue());
  const [isSearching, setIsSearching] = useState(false);
  // All forums are searched by default; the user can uncheck any of them.
  const [selectedForums, setSelectedForums] = useState<string[]>(FORUM_PLATFORMS.map((forum) => forum.id));

  const toggleForum = (forumId: string) => {
    setSelectedForums((prev) =>
      prev.includes(forumId) ? prev.filter((id) => id !== forumId) : [...prev, forumId]
    );
  };

  const loadResults = useCallback(() => {
    if (!productId) return;
    listProductResults(productId, { limit: RESULTS_BOX_LIMIT })
      .then((page) => {
        setResults(page.results);
        setResultsTotal(page.total);
      })
      .catch((err) => {
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load results";
        toast.error(`Couldn't load search results: ${message}`);
        setResults([]);
      });
  }, [productId]);

  const handleToggleResponded = async (resultId: string, responded: boolean) => {
    if (!productId) return;
    try {
      const updated = await setResultResponded(productId, resultId, responded);
      setResults((prev) => prev?.map((r) => (r.id === resultId ? updated : r)) ?? prev);
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to update lead";
      toast.error(message);
    }
  };

  const loadJobs = useCallback(() => {
    if (!productId) return;
    listJobs({ productId })
      .then(setJobs)
      .catch((err) => {
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load scheduled searches";
        toast.error(`Couldn't load scheduled searches: ${message}`);
        setJobs([]);
      });
  }, [productId]);

  const handleJobChanged = (updated: ApiJob) => {
    setJobs((prev) => prev?.map((job) => (job.id === updated.id ? updated : job)) ?? prev);
  };

  const handleOpenJobLeads = (job: ApiJob) => {
    navigate(`/dashboard/products/${job.productId}/jobs/${job.id}/leads`);
  };

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    getProduct(productId)
      .then((fetched) => {
        if (!cancelled) setProduct(fetched);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load product";
        setProductError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const validateSearchInputs = () => {
    if (selectedForums.length === 0) {
      toast.error("Please select at least one forum to search");
      return false;
    }
    if (fromDate > toDate) {
      toast.error("The From date must be on or before the To date");
      return false;
    }
    if (fromDate < earliestFromDateFor(toDate)) {
      toast.error(`The search date range can't exceed ${MAX_RANGE_MONTHS} months`);
      return false;
    }
    return true;
  };

  const searchCredits = creditsForLeadCount(numberOfLeads) * selectedForums.length;
  const [isConfirmSearchOpen, setIsConfirmSearchOpen] = useState(false);

  const handleOpenSearchConfirm = () => {
    if (!validateSearchInputs()) return;
    setIsConfirmSearchOpen(true);
  };

  const handleStartSearch = async () => {
    if (!product) return;
    if (!validateSearchInputs()) return;

    setIsConfirmSearchOpen(false);
    setIsSearching(true);
    try {
      const { saved } = await searchThreads({
        productId: product.id,
        forum: selectedForums,
        threads: numberOfLeads,
        from: fromDate,
        to: toDate,
      });

      const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
      toast.success(`Search complete — ${plural(saved.newCount, "new lead")} and ${plural(saved.existingCount, "existing lead")} found.`);
      loadResults();
      refreshCredits();
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Unknown error";
      toast.error(`Search failed: ${message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Scheduling a search to run daily. A fixed 10 leads/day per forum; the
  // user picks which forums, an end date, and a relevance floor for emails.
  const [jobEndDate, setJobEndDate] = useState<string>(defaultJobEndDate());
  const [jobMinScorePercent, setJobMinScorePercent] = useState<number>(JOB_DEFAULT_MIN_SCORE_PERCENT);
  const [jobSelectedForums, setJobSelectedForums] = useState<string[]>(FORUM_PLATFORMS.map((forum) => forum.id));
  const [isConfirmJobOpen, setIsConfirmJobOpen] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  const toggleJobForum = (forumId: string) => {
    setJobSelectedForums((prev) =>
      prev.includes(forumId) ? prev.filter((id) => id !== forumId) : [...prev, forumId]
    );
  };

  const jobDailyCredits = creditsForLeadCount(JOB_LEAD_COUNT) * jobSelectedForums.length;

  const handleOpenJobConfirm = () => {
    if (jobSelectedForums.length === 0) {
      toast.error("Please select at least one forum to search");
      return;
    }
    setIsConfirmJobOpen(true);
  };

  const handleCreateJob = async () => {
    if (!product) return;
    if (jobSelectedForums.length === 0) {
      toast.error("Please select at least one forum to search");
      return;
    }

    setIsCreatingJob(true);
    try {
      await createJob({
        productId: product.id,
        forum: jobSelectedForums,
        threads: JOB_LEAD_COUNT,
        minScore: jobMinScorePercent / 100,
        endDate: jobEndDate,
      });
      setIsConfirmJobOpen(false);
      loadJobs();
      toast.success(`Scheduled — it'll search daily until ${jobEndDate}`, {
        action: { label: "View", onClick: () => setResultsTab("jobs") },
      });
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to schedule the search";
      toast.error(message);
    } finally {
      setIsCreatingJob(false);
    }
  };

  if (productError) {
    return (
      <div className="overflow-y-auto main-content h-full">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-muted-foreground">{productError}</p>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="overflow-y-auto main-content h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto main-content h-full">
      <div className="w-full px-[1in] py-8 space-y-6">
        {/* Product Header */}
        <Card>
          <CardContent className="pt-6">
            {isEditingProduct ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editName">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editWebsite">
                    Product Website <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="editWebsite"
                        value={editWebsite}
                        onChange={(e) => setEditWebsite(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateDescription}
                      disabled={isGeneratingDescription || !editWebsite}
                    >
                      {isGeneratingDescription ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Description
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editDescription">
                    Product Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="editDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditingProduct(false)} disabled={isSavingProduct}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProduct} disabled={isSavingProduct}>
                    {isSavingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
                    <Button variant="outline" size="sm" onClick={handleStartEditProduct}>
                      <Pencil className="w-3.5 h-3.5 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-1">{product.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    {product.website && (
                      <a
                        href={product.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        {product.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                    <span className="text-muted-foreground">
                      Leads found: <span className="text-foreground font-semibold">{resultsTotal}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Leads */}
        <Card>
          {isSearching ? (
            <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Searching for leads...</p>
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-3 bg-muted/30">
                <CardTitle className="text-xl font-semibold">Lead Search</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="numberOfLeads">Number of Leads to Search</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              aria-label="Number of leads info"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Every 10 leads searched costs 1 credit per forum searched.</TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={String(numberOfLeads)}
                        onValueChange={(value) => setNumberOfLeads(Number(value))}
                      >
                        <SelectTrigger id="numberOfLeads">
                          <SelectValue>{numberOfLeads} leads</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_COUNT_OPTIONS.map((count) => {
                            const credits = creditsForLeadCount(count);
                            return (
                              <SelectItem key={count} value={String(count)}>
                                {count} leads{" "}
                                <span className="text-xs text-muted-foreground">
                                  · {credits} credit{credits === 1 ? "" : "s"} per forum
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="fromDate">From</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              aria-label="Date range info"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Date range can span up to {MAX_RANGE_MONTHS} months</TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        min={earliestFromDateFor(toDate)}
                        max={toDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="toDate">To</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={toDate}
                        min={fromDate}
                        max={todayDateInputValue()}
                        onChange={(e) => {
                          const newToDate = e.target.value;
                          setToDate(newToDate);
                          // Keep the range within the 3-month cap if it now moves out of bounds.
                          const earliestFrom = earliestFromDateFor(newToDate);
                          if (fromDate < earliestFrom) {
                            setFromDate(earliestFrom);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label>Forums to Search</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Forums to search info"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>All forums are searched by default — uncheck any you'd like to skip</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                      {FORUM_PLATFORMS.map((forum) => (
                        <label
                          key={forum.id}
                          htmlFor={`forum-${forum.id}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            id={`forum-${forum.id}`}
                            checked={selectedForums.includes(forum.id)}
                            onCheckedChange={() => toggleForum(forum.id)}
                          />
                          <span className="text-sm text-foreground">{forum.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="button" onClick={handleOpenSearchConfirm} className="w-full sm:w-auto">
                      <Search className="w-4 h-4 mr-2" />
                      Start Search
                    </Button>

                    <Dialog open={isConfirmSearchOpen} onOpenChange={setIsConfirmSearchOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm search</DialogTitle>
                          <DialogDescription>
                            Searching {numberOfLeads} leads across {selectedForums.length} forum
                            {selectedForums.length === 1 ? "" : "s"} will use{" "}
                            <span className="font-semibold text-foreground">
                              {searchCredits} credit{searchCredits === 1 ? "" : "s"}
                            </span>
                            .
                          </DialogDescription>
                          <p className="text-sm text-muted-foreground">
                            The search will only return relevant leads. If there aren't enough relevant leads,
                            results can be fewer than the number selected.
                          </p>
                        </DialogHeader>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsConfirmSearchOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleStartSearch}>
                            <Coins className="w-4 h-4 mr-2" />
                            Confirm & Search
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Daily Search Job */}
                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Daily Search Job</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Runs automatically once a day, searching {JOB_LEAD_COUNT} leads per forum, until the end date.
                      New leads are stored and emailed to you.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="jobEndDate">Ends on</Label>
                      <Input
                        id="jobEndDate"
                        type="date"
                        value={jobEndDate}
                        min={todayDateInputValue()}
                        max={maxJobEndDate()}
                        onChange={(e) => setJobEndDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="jobMinScore">Minimum Threshold for Relevance of Leads Found</Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={String(jobMinScorePercent)}
                          onValueChange={(value) => setJobMinScorePercent(Number(value))}
                        >
                          <SelectTrigger id="jobMinScore" className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_MIN_SCORE_OPTIONS.map((percent) => (
                              <SelectItem key={percent} value={String(percent)}>
                                {percent}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Forums to Search</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                      {FORUM_PLATFORMS.map((forum) => (
                        <label
                          key={forum.id}
                          htmlFor={`job-forum-${forum.id}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            id={`job-forum-${forum.id}`}
                            checked={jobSelectedForums.includes(forum.id)}
                            onCheckedChange={() => toggleJobForum(forum.id)}
                          />
                          <span className="text-sm text-foreground">{forum.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="button" variant="outline" onClick={handleOpenJobConfirm} className="w-full sm:w-auto">
                      <CalendarClock className="w-4 h-4 mr-2" />
                      Schedule Daily Search
                    </Button>

                    <Dialog open={isConfirmJobOpen} onOpenChange={setIsConfirmJobOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm daily search</DialogTitle>
                          <DialogDescription>
                            Search job will use{" "}
                            <span className="font-semibold text-foreground">
                              {jobDailyCredits} credit{jobDailyCredits === 1 ? "" : "s"}
                            </span>{" "}
                            each day until {jobEndDate}. Search job can be cancelled anytime. New leads are stored
                            and emailed to you, using the minimum relevance score you selected to decide which leads
                            you're notified about.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsConfirmJobOpen(false)}
                            disabled={isCreatingJob}
                          >
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleCreateJob} disabled={isCreatingJob}>
                            {isCreatingJob ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Scheduling...
                              </>
                            ) : (
                              "Schedule Daily Search"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Search Results / Scheduled Searches */}
        <Card>
          <Tabs value={resultsTab} onValueChange={(value) => setResultsTab(value as "results" | "jobs")}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <TabsList>
                <TabsTrigger value="results">Search Results</TabsTrigger>
                <TabsTrigger value="jobs">Scheduled Searches</TabsTrigger>
              </TabsList>
              {resultsTab === "results" ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/dashboard/products/${product.id}/results`}>
                    View Full Search History
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/dashboard/products/${product.id}/jobs`}>
                    View All Scheduled Searches
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </CardHeader>

            <TabsContent value="results">
              <CardContent>
                {results === null ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                ) : results.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No leads found yet. Run a search above to get started.
                  </p>
                ) : (
                  <>
                    <div className="space-y-1">
                      {results.map((result) => (
                        <LeadResultRow
                          key={result.id}
                          result={result}
                          product={product}
                          onToggleResponded={handleToggleResponded}
                        />
                      ))}
                    </div>
                    <Link
                      to={`/dashboard/products/${product.id}/results`}
                      className="flex items-center justify-between gap-3 mt-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/50 transition-colors group"
                    >
                      <span className="text-sm text-foreground">
                        {resultsTotal > RESULTS_BOX_LIMIT
                          ? `Showing ${results.length} of ${resultsTotal} results`
                          : "See every result, sorted and filterable"}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-primary">
                        Open Search Details
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="jobs">
              <CardContent>
                {jobs === null ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                ) : jobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No scheduled searches yet. Use the Daily Search Job section above to set one up.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <JobRow key={job.id} job={job} onChange={handleJobChanged} onOpenLeads={handleOpenJobLeads} />
                    ))}
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
