import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { mockLeadRequests, LeadRequest } from "../lib/mock-data";
import { Search, Globe, Sparkles, Loader2, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ProductTemplate {
  productName: string;
  productWebsite: string;
  productDescription: string;
  targetAudience: string;
}

const STORAGE_KEY = "beaconflow_product_templates";

export function Dashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LeadRequest[]>(mockLeadRequests);
  const [productName, setProductName] = useState("");
  const [productWebsite, setProductWebsite] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<ProductTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Load saved templates from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedTemplates(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load templates:", error);
      }
    }
  }, []);

  // Save current product as template
  const handleSaveTemplate = () => {
    if (!productName) {
      toast.error("Please enter a product name first");
      return;
    }

    const newTemplate: ProductTemplate = {
      productName,
      productWebsite,
      productDescription,
      targetAudience,
    };

    // Check if template with same name exists
    const existingIndex = savedTemplates.findIndex(
      (t) => t.productName.toLowerCase() === productName.toLowerCase()
    );

    let updatedTemplates: ProductTemplate[];
    if (existingIndex >= 0) {
      // Update existing template
      updatedTemplates = [...savedTemplates];
      updatedTemplates[existingIndex] = newTemplate;
      toast.success(`Updated template: ${productName}`);
    } else {
      // Add new template
      updatedTemplates = [...savedTemplates, newTemplate];
      toast.success(`Saved template: ${productName}`);
    }

    setSavedTemplates(updatedTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
  };

  // Load template into form
  const handleLoadTemplate = (templateName: string) => {
    if (!templateName || templateName === "_new") {
      setSelectedTemplate("");
      setProductName("");
      setProductWebsite("");
      setProductDescription("");
      setTargetAudience("");
      return;
    }

    const template = savedTemplates.find((t) => t.productName === templateName);
    if (template) {
      setProductName(template.productName);
      setProductWebsite(template.productWebsite);
      setProductDescription(template.productDescription);
      setTargetAudience(template.targetAudience);
      setSelectedTemplate(templateName);
      toast.success(`Loaded template: ${templateName}`);
    }
  };

  // Mock website description generator
  const handleGenerateDescription = async () => {
    if (!productWebsite) {
      toast.error("Please enter a product website URL first");
      return;
    }

    setIsGenerating(true);

    // Simulate API call to scrape and generate description
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock generated descriptions based on common patterns
    const mockDescriptions = [
      `${productName || "Our platform"} is a comprehensive solution designed to streamline business operations and enhance productivity. With advanced features including automation, analytics, and seamless integrations, we help organizations achieve their goals more efficiently.`,
      `Transform the way you work with ${productName || "our innovative tool"}. Built for modern teams, our platform combines powerful functionality with an intuitive interface to deliver exceptional results. Key features include real-time collaboration, intelligent automation, and detailed reporting.`,
      `${productName || "This solution"} empowers businesses to scale faster and work smarter. From automated workflows to data-driven insights, our platform provides everything you need to stay ahead of the competition and drive growth.`,
    ];

    const generatedDescription = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
    setProductDescription(generatedDescription);
    setIsGenerating(false);
    toast.success("Description generated from website!");
  };

  const handleCreateRequest = (searchType: "forum" | "direct") => {
    if (!productName || !productWebsite || !productDescription || !targetAudience) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Save as template if checkbox is checked
    if (saveAsTemplate) {
      const newTemplate: ProductTemplate = {
        productName,
        productWebsite,
        productDescription,
        targetAudience,
      };

      // Check if template with same name exists
      const existingIndex = savedTemplates.findIndex(
        (t) => t.productName.toLowerCase() === productName.toLowerCase()
      );

      let updatedTemplates: ProductTemplate[];
      if (existingIndex >= 0) {
        // Update existing template
        updatedTemplates = [...savedTemplates];
        updatedTemplates[existingIndex] = newTemplate;
      } else {
        // Add new template
        updatedTemplates = [...savedTemplates, newTemplate];
      }

      setSavedTemplates(updatedTemplates);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    }

    const newRequest: LeadRequest = {
      id: String(requests.length + 1),
      productName,
      productDescription,
      targetAudience,
      status: "pending",
      progress: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours default
      leadsFound: 0,
      newLeadsCount: 0,
      directContactCount: 0,
      forumLeadCount: 0,
      searchType,
    };

    setRequests([newRequest, ...requests]);
    
    // Reset form
    setProductName("");
    setProductWebsite("");
    setProductDescription("");
    setTargetAudience("");
    setSelectedTemplate("");
    setSaveAsTemplate(false);
    
    const searchTypeLabel = searchType === "forum" ? "Forum Lead" : "Direct Contact";
    toast.success(`${searchTypeLabel} search started! We'll notify you via email when leads are found.`);
  };

  return (
    <div className="overflow-y-auto main-content h-full">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Create Request Form */}
        <Card>
          <CardHeader className="pb-3 bg-muted/30">
            <CardTitle>Create New Lead Search</CardTitle>
            <CardDescription>
              Enter your product details to start finding potential leads
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Load Saved Template */}
              {savedTemplates.length > 0 && (
                <div className="space-y-1.5 pb-2 border-b border-border">
                  <Label htmlFor="loadTemplate">Load Saved Product</Label>
                  <Select value={selectedTemplate} onValueChange={handleLoadTemplate}>
                    <SelectTrigger id="loadTemplate">
                      <SelectValue placeholder="Select a saved product..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_new">-- New Product --</SelectItem>
                      {savedTemplates.map((template) => (
                        <SelectItem key={template.productName} value={template.productName}>
                          {template.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Product Name and Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <Label htmlFor="targetAudience">
                    Target Audience <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Small business owners"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Product Website */}
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
                        Generate
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click "Generate" to automatically create a description from your website
                </p>
              </div>

              {/* Product Description */}
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
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Save Product Checkbox */}
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="saveAsTemplate"
                  checked={saveAsTemplate}
                  onCheckedChange={(checked) => setSaveAsTemplate(checked as boolean)}
                />
                <label
                  htmlFor="saveAsTemplate"
                  className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Save this product for future searches
                </label>
              </div>

              {/* Two Search Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  type="button" 
                  onClick={() => handleCreateRequest("direct")} 
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Search Direct Contacts
                </Button>
                <Button 
                  type="button" 
                  onClick={() => handleCreateRequest("forum")} 
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Search Forum Leads
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}