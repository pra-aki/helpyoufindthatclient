import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { createProduct, describeWebsite, ApiError } from "../lib/api";
import { Globe, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function AddProduct() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [productWebsite, setProductWebsite] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!productWebsite) {
      toast.error("Please enter a product website URL first");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await describeWebsite(productWebsite);
      if (result.description) setProductDescription(result.description);
      if (result.name && !productName) setProductName(result.name);

      if (result.confidence < 0.4) {
        toast.warning("Generated a description, but the site content was unclear — please review it");
      } else {
        toast.success("Description generated from website!");
      }
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to read the website";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productName || !productWebsite || !productDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const product = await createProduct({
        name: productName,
        website: productWebsite,
        description: productDescription,
      });
      toast.success(`${product.name} added`);
      navigate(`/dashboard/products/${product.id}`);
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to add product";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="overflow-y-auto main-content h-full">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          All Products
        </Button>

        <Card>
          <CardHeader className="pb-3 bg-muted/30">
            <CardTitle>Add a Product</CardTitle>
            <CardDescription>
              Tell us about your product so we can start finding leads for it
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="productName">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g., CRM Software"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="productWebsite">
                  Product Website <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="productWebsite"
                      type="url"
                      placeholder="https://yourproduct.com"
                      value={productWebsite}
                      onChange={(e) => setProductWebsite(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating || !productWebsite}
                  >
                    {isGenerating ? (
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
                <p className="text-xs text-muted-foreground">
                  Click "Generate Description" to automatically create a description from your website
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="productDescription">
                  Product Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="productDescription"
                  placeholder="Describe what your product does and its key features..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  required
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} disabled={isCreating}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateProduct} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
