import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { getProduct, listJobs, ApiProduct, ApiJob, ApiError } from "../lib/api";
import { JobRow } from "../components/JobRow";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProductJobs() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ApiJob[] | null>(null);

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
    if (!productId) return;
    let cancelled = false;

    listJobs({ productId })
      .then((fetched) => {
        if (!cancelled) setJobs(fetched);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to load scheduled searches";
        toast.error(message);
        setJobs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleJobChanged = (updated: ApiJob) => {
    setJobs((prev) => prev?.map((job) => (job.id === updated.id ? updated : job)) ?? prev);
  };

  const handleOpenJobLeads = (job: ApiJob) => {
    navigate(`/dashboard/products/${job.productId}/jobs/${job.id}/leads`);
  };

  if (productError) {
    return (
      <div className="overflow-y-auto main-content h-full">
        <div className="max-w-4xl mx-auto px-6 py-8">
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
      <div className="w-full px-[1in] py-8 space-y-6">
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
          <CardHeader>
            <CardTitle>Scheduled Searches — {product.name}</CardTitle>
            <CardDescription>
              Daily searches that run automatically and email you the new leads they find.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobs === null ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No scheduled searches yet. Open Lead Search above and use the Daily Search Job section to set one up.
              </p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobRow key={job.id} job={job} onChange={handleJobChanged} onOpenLeads={handleOpenJobLeads} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
