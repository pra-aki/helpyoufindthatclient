import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import {
  getProduct,
  listProductResults,
  deleteResult,
  deleteResults,
  setResultResponded,
  ApiProduct,
  ApiResult,
  ApiError,
} from "../lib/api";
import { LeadResultRow } from "../components/LeadResultRow";
import { FORUM_PLATFORMS, getForumLabel } from "../lib/constants";
import { todayDateInputValue, daysAgoDateInputValue } from "../lib/dates";
import { downloadCsv } from "../lib/download";
import { ArrowLeft, Loader2, ChevronDown, Trash2, X, Download } from "lucide-react";
import { toast } from "sonner";

// The backend's own max page size — large enough to cover realistic result
// counts in one request so sort/filter can apply across everything at once.
const FETCH_LIMIT = 1000;

type SortBy = "date" | "relevance";
type RespondedFilter = "all" | "unresponded" | "responded";

type DatePreset = "all" | "1d" | "3d" | "1w" | "3m" | "custom";

interface DateFilterState {
  preset: DatePreset;
  from: string;
  to: string;
}

const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "1d", label: "Last 1 day" },
  { value: "3d", label: "Last 3 days" },
  { value: "1w", label: "Last 1 week" },
  { value: "3m", label: "Last 3 months" },
  { value: "custom", label: "Custom range" },
];

const PRESET_DAYS: Record<"1d" | "3d" | "1w" | "3m", number> = {
  "1d": 1,
  "3d": 3,
  "1w": 7,
  "3m": 90,
};

const defaultDateFilter = (): DateFilterState => ({
  preset: "all",
  from: daysAgoDateInputValue(7),
  to: todayDateInputValue(),
});

/** Resolves a filter's preset (or custom from/to) into an actual date range, null meaning unbounded. */
function resolveDateFilterRange(filter: DateFilterState): { from: string | null; to: string | null } {
  if (filter.preset === "all") return { from: null, to: null };
  if (filter.preset === "custom") return { from: filter.from || null, to: filter.to || null };
  return { from: daysAgoDateInputValue(PRESET_DAYS[filter.preset]), to: todayDateInputValue() };
}

/** Whether an ISO timestamp falls within an inclusive "YYYY-MM-DD" range (either bound optional). */
function isWithinDateRange(isoDate: string, from: string | null, to: string | null) {
  const date = new Date(isoDate);
  if (from && date < new Date(`${from}T00:00:00Z`)) return false;
  if (to && date > new Date(`${to}T23:59:59.999Z`)) return false;
  return true;
}

function DateFilterControl({
  id,
  label,
  filter,
  onChange,
}: {
  id: string;
  label: string;
  filter: DateFilterState;
  onChange: (next: DateFilterState) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Label htmlFor={id} className="text-sm text-muted-foreground whitespace-nowrap">
        {label}
      </Label>
      <Select
        value={filter.preset}
        onValueChange={(value) => onChange({ ...filter, preset: value as DatePreset })}
      >
        <SelectTrigger id={id} className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESET_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {filter.preset === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filter.from}
            max={filter.to || todayDateInputValue()}
            onChange={(e) => onChange({ ...filter, from: e.target.value })}
            className="w-36"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={filter.to}
            min={filter.from}
            max={todayDateInputValue()}
            onChange={(e) => onChange({ ...filter, to: e.target.value })}
            className="w-36"
          />
        </div>
      )}
    </div>
  );
}

export function ProductSearchResults() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [results, setResults] = useState<ApiResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // The product page's stat links open this page pre-filtered, e.g. ?status=unresponded or ?found=1w.
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status");
  const initialFound = searchParams.get("found");

  const [sortBy, setSortBy] = useState<SortBy>(initialFound ? "date" : "relevance");
  const [selectedForums, setSelectedForums] = useState<string[]>(FORUM_PLATFORMS.map((forum) => forum.id));
  const [postedDateFilter, setPostedDateFilter] = useState<DateFilterState>(defaultDateFilter);
  const [searchDateFilter, setSearchDateFilter] = useState<DateFilterState>(() => {
    const filter = defaultDateFilter();
    return initialFound && initialFound in PRESET_DAYS ? { ...filter, preset: initialFound as DatePreset } : filter;
  });
  const [respondedFilter, setRespondedFilter] = useState<RespondedFilter>(
    initialStatus === "unresponded" || initialStatus === "responded" ? initialStatus : "all"
  );

  const toggleForum = (forumId: string) => {
    setSelectedForums((prev) =>
      prev.includes(forumId) ? prev.filter((id) => id !== forumId) : [...prev, forumId]
    );
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

  const handleDeleteOne = async (id: string) => {
    if (!productId) return;
    try {
      await deleteResult(productId, id);
      setResults((prev) => prev.filter((r) => r.id !== id));
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

  const handleToggleResponded = async (resultId: string, responded: boolean) => {
    if (!productId) return;
    try {
      const updated = await setResultResponded(productId, resultId, responded);
      setResults((prev) => prev.map((r) => (r.id === resultId ? updated : r)));
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to update lead";
      toast.error(message);
    }
  };

  const handleDeleteSelected = async () => {
    if (!productId || selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const { ids: deletedIds } = await deleteResults(productId, ids);
      const deletedSet = new Set(deletedIds);
      setResults((prev) => prev.filter((r) => !deletedSet.has(r.id)));
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
      if (!productId) return;
      setIsLoadingMore(true);
      listProductResults(productId, { limit: FETCH_LIMIT, offset })
        .then((page) => {
          setResults((prev) => (offset === 0 ? page.results : [...prev, ...page.results]));
          setTotal(page.total);
        })
        .catch((err) => {
          const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load results";
          toast.error(`Couldn't load search results: ${message}`);
        })
        .finally(() => setIsLoadingMore(false));
    },
    [productId]
  );

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
    loadPage(0);
  }, [loadPage]);

  const forumFilterLabel =
    selectedForums.length === FORUM_PLATFORMS.length
      ? "All Forums"
      : selectedForums.length === 0
      ? "No Forums"
      : selectedForums.length === 1
      ? FORUM_PLATFORMS.find((forum) => forum.id === selectedForums[0])?.label ?? "1 Forum"
      : `${selectedForums.length} Forums`;

  const displayedResults = useMemo(() => {
    const postedRange = resolveDateFilterRange(postedDateFilter);
    const searchRange = resolveDateFilterRange(searchDateFilter);

    const filtered = results.filter((result) => {
      if (!selectedForums.includes(result.source)) return false;
      if (respondedFilter === "unresponded" && result.respondedAt) return false;
      if (respondedFilter === "responded" && !result.respondedAt) return false;
      if (postedRange.from || postedRange.to) {
        // No posted date to compare against — exclude while a posted-date filter is active.
        if (!result.postedAt || !isWithinDateRange(result.postedAt, postedRange.from, postedRange.to)) return false;
      }
      if (searchRange.from || searchRange.to) {
        if (!isWithinDateRange(result.searchDate, searchRange.from, searchRange.to)) return false;
      }
      return true;
    });

    if (sortBy === "relevance") {
      // Stable-sort by score desc, nulls last; ties keep the original (date-desc) order.
      return [...filtered].sort((a, b) => (b.relevanceScore ?? -1) - (a.relevanceScore ?? -1));
    }
    return filtered; // already date-desc from the backend
  }, [results, selectedForums, respondedFilter, sortBy, postedDateFilter, searchDateFilter]);

  const handleExportCsv = () => {
    if (!product || displayedResults.length === 0) {
      toast.error("No leads to export");
      return;
    }
    const headers = [
      "Title",
      "Forum",
      "Link",
      "Posted Date",
      "Search Date",
      "Relevance %",
      "Responded",
      "Summary",
      "Why Relevant",
    ];
    const rows = displayedResults.map((r) => ({
      Title: r.title || r.link,
      Forum: getForumLabel(r.source),
      Link: r.link,
      "Posted Date": r.postedAt ? r.postedAt.slice(0, 10) : "",
      "Search Date": r.searchDate.slice(0, 10),
      "Relevance %": r.relevanceScore === null ? "" : Math.round(r.relevanceScore * 100),
      Responded: r.respondedAt ? "Yes" : "No",
      Summary: r.summary ?? "",
      "Why Relevant": r.whyRelevant ?? "",
    }));
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "leads";
    downloadCsv(`${slug}-leads-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast.success(`Exported ${displayedResults.length} lead${displayedResults.length === 1 ? "" : "s"}`);
  };

  if (productError) {
    return (
      <div className="overflow-y-auto main-content h-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-muted-foreground">{productError}</p>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/dashboard/products/${product.id}`)}
          className="-ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {product.name}
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Search Results — {product.name}</CardTitle>
              <CardDescription>
                All {total} result{total === 1 ? "" : "s"} found so far
              </CardDescription>
            </div>
            {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No leads found yet.</p>
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

                  <DateFilterControl
                    id="postedDateFilter"
                    label="Posted date"
                    filter={postedDateFilter}
                    onChange={setPostedDateFilter}
                  />
                  <DateFilterControl
                    id="searchDateFilter"
                    label="Search date"
                    filter={searchDateFilter}
                    onChange={setSearchDateFilter}
                  />

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
                          checked={selectedForums.length === FORUM_PLATFORMS.length}
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={(checked) =>
                            setSelectedForums(checked ? FORUM_PLATFORMS.map((forum) => forum.id) : [])
                          }
                        >
                          All
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        {FORUM_PLATFORMS.map((forum) => (
                          <DropdownMenuCheckboxItem
                            key={forum.id}
                            checked={selectedForums.includes(forum.id)}
                            onSelect={(e) => e.preventDefault()}
                            onCheckedChange={() => toggleForum(forum.id)}
                          >
                            {forum.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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

                {displayedResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No results match the selected filters.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {displayedResults.map((result) => (
                      <LeadResultRow
                        key={result.id}
                        result={result}
                        product={product}
                        selected={selectedIds.has(result.id)}
                        onToggleSelect={toggleSelect}
                        onDelete={handleDeleteOne}
                        onToggleResponded={handleToggleResponded}
                      />
                    ))}
                  </div>
                )}

                {results.length < total && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={() => loadPage(results.length)} disabled={isLoadingMore}>
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load more (${total - results.length} remaining)`
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
