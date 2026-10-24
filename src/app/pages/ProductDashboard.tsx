import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import {
  getProduct,
  updateProduct,
  describeWebsite,
  listProductResults,
  setResultResponded,
  listProducts,
  listJobs,
  ApiProduct,
  ApiResult,
  ApiJob,
  ApiError,
} from "../lib/api";
import { LeadResultRow } from "../components/LeadResultRow";
import { JobRow } from "../components/JobRow";
import { FindLeadsCard } from "../components/FindLeadsCard";
import { daysAgoDateInputValue } from "../lib/dates";
import {
  Globe,
  Package,
  Loader2,
  ArrowRight,
  Pencil,
  Sparkles,
  CalendarClock,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

// Just a preview; the full, filterable list lives on the results page.
const RESULTS_BOX_LIMIT = 3;
// Fetch every result (the backend's max page size) so the header stats count across all of them.
const STATS_FETCH_LIMIT = 1000;
const STAT_CHIP_CLASS =
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors";

export function ProductDashboard() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [productError, setProductError] = useState<string | null>(null);
  const [allResults, setAllResults] = useState<ApiResult[] | null>(null);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [resultsTab, setResultsTab] = useState<"results" | "jobs">("results");
  const [jobs, setJobs] = useState<ApiJob[] | null>(null);

  // Editing the product's own name/website/description; its id never changes.
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editName, setEditName] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  useEffect(() => {
    listProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts([]));
  }, []);

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
    setIsDetailsOpen(true);
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

  const loadResults = useCallback(() => {
    if (!productId) return;
    listProductResults(productId, { limit: STATS_FETCH_LIMIT })
      .then((page) => {
        setAllResults(page.results);
        setResultsTotal(page.total);
      })
      .catch((err) => {
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load results";
        toast.error(`Couldn't load search results: ${message}`);
        setAllResults([]);
      });
  }, [productId]);

  const handleToggleResponded = async (resultId: string, responded: boolean) => {
    if (!productId) return;
    try {
      const updated = await setResultResponded(productId, resultId, responded);
      setAllResults((prev) => prev?.map((r) => (r.id === resultId ? updated : r)) ?? prev);
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

  const handleJobCreated = () => {
    loadJobs();
    setResultsTab("jobs");
  };

  const showJobs = () => {
    setResultsTab("jobs");
    document.getElementById("product-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Results come back newest first; the box only shows the latest few.
  const results = allResults?.slice(0, RESULTS_BOX_LIMIT) ?? null;
  const weekAgo = new Date(`${daysAgoDateInputValue(7)}T00:00:00Z`);
  const notRespondedCount = allResults?.filter((r) => !r.respondedAt).length ?? 0;
  const newThisWeekCount = allResults?.filter((r) => new Date(r.searchDate) >= weekAgo).length ?? 0;
  const activeJobCount = jobs?.filter((job) => job.status === "active").length ?? 0;

  if (productError) {
    return (
      <div className="overflow-y-auto main-content h-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Breadcrumb with product switcher */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            All Products
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          {allProducts.length > 1 ? (
            <Select value={product.id} onValueChange={(id) => navigate(`/dashboard/products/${id}`)}>
              <SelectTrigger size="sm" className="w-auto max-w-[16rem] font-medium" aria-label="Switch product">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="font-medium text-foreground">{product.name}</span>
          )}
        </div>

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
              <div>
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen((open) => !open)}
                  className="w-full flex items-center justify-between gap-3 text-left"
                  aria-expanded={isDetailsOpen}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="hidden sm:flex w-9 h-9 bg-primary/10 rounded-lg items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words">{product.name}</h1>
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                    {isDetailsOpen ? "Hide details" : "Details"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDetailsOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {isDetailsOpen && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                    {product.website && (
                      <a
                        href={product.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        {product.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                    <div>
                      <Button variant="outline" size="sm" onClick={handleStartEditProduct}>
                        <Pencil className="w-3.5 h-3.5 mr-2" />
                        Edit product
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <FindLeadsCard
          productId={product.id}
          onSearched={loadResults}
          onJobCreated={handleJobCreated}
        />

        {/* Search Results / Scheduled Searches */}
        <Card id="product-results" className="scroll-mt-20">
          <Tabs value={resultsTab} onValueChange={(value) => setResultsTab(value as "results" | "jobs")}>
            <CardHeader className="space-y-3">
              <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="results">Search Results</TabsTrigger>
                  <TabsTrigger value="jobs">Scheduled Searches</TabsTrigger>
                </TabsList>
                {resultsTab === "results" ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/products/${product.id}/results`}>
                      View all results
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/products/${product.id}/jobs`}>
                      View all scheduled searches
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
              {/* Stats, each linking to the matching view */}
              <div className="flex flex-wrap gap-2">
                <Link to={`/dashboard/products/${product.id}/results`} className={STAT_CHIP_CLASS}>
                  <span className="font-semibold text-foreground">{resultsTotal}</span>
                  lead{resultsTotal === 1 ? "" : "s"}
                </Link>
                <Link to={`/dashboard/products/${product.id}/results?status=unresponded`} className={STAT_CHIP_CLASS}>
                  <span className="font-semibold text-foreground">{notRespondedCount}</span>
                  not responded
                </Link>
                <Link to={`/dashboard/products/${product.id}/results?found=1w`} className={STAT_CHIP_CLASS}>
                  <span className="font-semibold text-foreground">{newThisWeekCount}</span>
                  new this week
                </Link>
                {activeJobCount > 0 && (
                  <button type="button" onClick={showJobs} className={STAT_CHIP_CLASS}>
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span className="font-semibold text-foreground">{activeJobCount}</span>
                    daily search{activeJobCount === 1 ? "" : "es"} active
                  </button>
                )}
              </div>
            </CardHeader>

            <TabsContent value="results">
              <CardContent>
                {results === null ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                ) : results.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No leads found yet. Use Find leads above to run your first search.
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
                    <p className="text-xs text-muted-foreground mt-2 px-1">
                      Latest {results.length} of {resultsTotal}. Open the full list to sort, filter, export and see
                      every lead's details.
                    </p>
                    <Button asChild className="w-full mt-3">
                      <Link to={`/dashboard/products/${product.id}/results`}>
                        View all results
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
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
                    No scheduled searches yet. Use Find leads above and pick Run daily to set one up.
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
