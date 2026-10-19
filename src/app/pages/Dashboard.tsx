import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { listProducts, listProductResults, listJobs, ApiProduct, ApiJob, ApiError } from "../lib/api";
import { JobRow } from "../components/JobRow";
import { Package, Search, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";


// Styles a tab trigger to read like a page heading (matching the old static
// "Your Products" h1) instead of the default small tab-pill text.
const TAB_TRIGGER_CLASS =
  "text-2xl font-bold px-0 py-1 rounded-none border-b-2 border-transparent " +
  "bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none " +
  "data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground";

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "jobs">("products");

  const [products, setProducts] = useState<ApiProduct[] | null>(null);
  const [resultCounts, setResultCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<ApiJob[] | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listProducts()
      .then((fetched) => {
        if (cancelled) return;
        setProducts(fetched);
        // One cheap call per product just to read its stored result count.
        Promise.all(
          fetched.map((product) =>
            listProductResults(product.id, { limit: 1 })
              .then((page) => [product.id, page.total] as const)
              .catch(() => [product.id, 0] as const)
          )
        ).then((entries) => {
          if (cancelled) return;
          setResultCounts(Object.fromEntries(entries));
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load products";
        setError(message);
        toast.error(`Couldn't load products: ${message}`);
      });

    listJobs()
      .then((fetched) => {
        if (!cancelled) setJobs(fetched);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load scheduled searches";
        setJobsError(message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleJobChanged = (updated: ApiJob) => {
    setJobs((prev) => prev?.map((job) => (job.id === updated.id ? updated : job)) ?? prev);
  };

  const handleOpenJobLeads = (job: ApiJob) => {
    navigate(`/dashboard/products/${job.productId}/jobs/${job.id}/leads`);
  };

  return (
    <div className="overflow-y-auto main-content h-full">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "products" | "jobs")}>
          <div className="flex items-center justify-between mb-6 gap-4">
            <TabsList className="h-auto p-0 gap-6 bg-transparent">
              <TabsTrigger value="products" className={TAB_TRIGGER_CLASS}>
                Your Products
              </TabsTrigger>
              <TabsTrigger value="jobs" className={TAB_TRIGGER_CLASS}>
                Your Jobs
              </TabsTrigger>
            </TabsList>
            {activeTab === "products" && (
              <Button onClick={() => navigate("/dashboard/products/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>

          <TabsContent value="products">
            <p className="text-muted-foreground -mt-2 mb-6">Pick a product to run a lead search, or add a new one</p>

            {products === null ? (
              error ? (
                <div className="text-center py-16">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all min-h-[260px] flex flex-col"
                      onClick={() => navigate(`/dashboard/products/${product.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-3">{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto pt-0">
                        <div className="flex items-center justify-between border-t border-border pt-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Search className="w-4 h-4" />
                            <span className="text-sm">Leads found</span>
                          </div>
                          <span className="text-2xl font-bold text-foreground">{resultCounts[product.id] ?? 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add Product tile */}
                  <Card
                    className="cursor-pointer border-dashed hover:border-primary/50 hover:bg-muted/30 transition-all min-h-[260px] flex flex-col items-center justify-center text-center"
                    onClick={() => navigate("/dashboard/products/new")}
                  >
                    <CardContent className="flex flex-col items-center justify-center gap-3 pt-6">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Add Product</p>
                        <p className="text-sm text-muted-foreground">Start finding leads for something new</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {products.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">
                      No products yet. Add your first product to start searching for leads.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="jobs">
            <p className="text-muted-foreground -mt-2 mb-6">
              Every scheduled daily search across all your products
            </p>

            {jobs === null ? (
              jobsError ? (
                <div className="text-center py-16">
                  <p className="text-destructive">{jobsError}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No scheduled searches yet. Open a product's Lead Search and use the Daily Search Job section to
                  set one up.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    productName={job.productName ?? undefined}
                    onChange={handleJobChanged}
                    onOpenLeads={handleOpenJobLeads}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
