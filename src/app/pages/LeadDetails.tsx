import { useParams, Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { mockLeads, mockLeadRequests, mockForumLeads, Lead, ForumLead } from "../lib/mock-data";
import { ArrowLeft, Mail, Phone, Globe, TrendingUp, Download, ExternalLink, MessageSquare, Check, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function LeadDetails() {
  const { requestId } = useParams();
  const request = mockLeadRequests.find((r) => r.id === requestId);
  const leads = mockLeads.filter((l) => l.requestId === requestId);
  const forumLeads = mockForumLeads.filter((l) => l.requestId === requestId);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedForumLeads, setSelectedForumLeads] = useState<string[]>([]);
  const [doneLeads, setDoneLeads] = useState<string[]>([]);
  const [convertedLeads, setConvertedLeads] = useState<string[]>([]);
  const [doneForumLeads, setDoneForumLeads] = useState<string[]>([]);
  const [convertedForumLeads, setConvertedForumLeads] = useState<string[]>([]);

  if (!request) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Request not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExport = () => {
    toast.success("Leads exported to CSV");
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleForumLeadSelection = (leadId: string) => {
    setSelectedForumLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  const selectAllForumLeads = () => {
    if (selectedForumLeads.length === forumLeads.length) {
      setSelectedForumLeads([]);
    } else {
      setSelectedForumLeads(forumLeads.map((l) => l.id));
    }
  };

  const generateEmailContent = (selectedLeadsList: Lead[]) => {
    if (selectedLeadsList.length === 0) return { to: "", subject: "", body: "" };

    const emails = selectedLeadsList.map((lead) => lead.email).join(",");
    const subject = `Introducing ${request.productName} - Perfect for ${request.targetAudience}`;
    
    // Create personalized email body
    const body = `Hi there,

I came across your company and thought ${request.productName} might be a great fit for you.

About ${request.productName}:
${request.productDescription}

We specifically designed this for ${request.targetAudience}, and I noticed that your business aligns perfectly with our target audience.

${selectedLeadsList.length === 1 ? `I saw that ${selectedLeadsList[0].companyName} focuses on: ${selectedLeadsList[0].websiteDescription}` : ""}

Would you be interested in learning more? I'd be happy to schedule a quick call to discuss how we can help.

Best regards`;

    return { to: emails, subject, body };
  };

  const handleBulkContact = () => {
    const selectedLeadsList = leads.filter((lead) => selectedLeads.includes(lead.id));
    const { to, subject, body } = generateEmailContent(selectedLeadsList);
    
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleMarkDone = (leadId: string, isDirectContact: boolean = true) => {
    if (isDirectContact) {
      setDoneLeads((prev) =>
        prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
      );
    } else {
      setDoneForumLeads((prev) =>
        prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
      );
    }
    toast.success("Lead marked as contacted");
  };

  const handleMarkConverted = (leadId: string, isDirectContact: boolean = true) => {
    if (isDirectContact) {
      setConvertedLeads((prev) =>
        prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
      );
    } else {
      setConvertedForumLeads((prev) =>
        prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
      );
    }
    toast.success("Lead marked as converted");
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-primary";
    if (score >= 75) return "text-accent";
    return "text-muted-foreground";
  };

  const getPlatformIcon = (platform: "reddit" | "facebook" | "twitter") => {
    switch (platform) {
      case "reddit":
        return "🔴";
      case "facebook":
        return "📘";
      case "twitter":
        return "🐦";
    }
  };

  const getPlatformColor = (platform: "reddit" | "facebook" | "twitter") => {
    switch (platform) {
      case "reddit":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "facebook":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "twitter":
        return "bg-sky-100 text-sky-800 border-sky-300";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Request Info */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {request.searchType === "direct" ? (
                  <>
                    <Mail className="w-5 h-5 text-primary" />
                    <Badge className="bg-primary/10 text-primary border-0">
                      Direct Contact Search
                    </Badge>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <Badge className="bg-primary/10 text-primary border-0">
                      Forum & Social Media Search
                    </Badge>
                  </>
                )}
              </div>
              <CardTitle>{request.productName}</CardTitle>
              <CardDescription className="mt-2">
                {request.productDescription}
              </CardDescription>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Target Audience: </span>
                  <span className="text-foreground">{request.targetAudience}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <Badge className="bg-muted text-foreground border-0">{request.status}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Leads: </span>
                  <span className="text-foreground font-semibold">{request.leadsFound}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Leads Section */}
      {request.searchType === "direct" ? (
        /* Direct Contact Leads Section */
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Direct Contact Leads ({leads.length})</h2>
          </div>
          {leads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No direct contact leads found yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Selection Actions Bar */}
              {selectedLeads.length > 0 && (
                <div className="mb-4 flex items-center justify-end bg-muted/30 p-3 rounded-lg border border-border">
                  <Button onClick={handleBulkContact} size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Selected ({selectedLeads.length})
                  </Button>
                </div>
              )}

              <div className="grid gap-4">
                {leads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="flex items-start pt-1">
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={() => toggleLeadSelection(lead.id)}
                            id={`lead-${lead.id}`}
                          />
                        </div>

                        {/* Lead Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground">
                                    {lead.companyName}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{lead.contactName}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className={`w-4 h-4 ${getMatchScoreColor(lead.matchScore)}`} />
                                  <span className={`font-semibold ${getMatchScoreColor(lead.matchScore)}`}>
                                    {lead.matchScore}% match
                                  </span>
                                </div>
                              </div>

                              {/* Website Description */}
                              <p className="text-sm text-muted-foreground mb-3 italic">
                                {lead.websiteDescription}
                              </p>

                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="w-4 h-4" />
                                  <a
                                    href={`mailto:${lead.email}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {lead.email}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="w-4 h-4" />
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {lead.phone}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Globe className="w-4 h-4" />
                                  <a
                                    href={`https://${lead.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors"
                                  >
                                    {lead.website}
                                  </a>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <Button size="sm" asChild>
                                  <a href={`mailto:${lead.email}`}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Contact
                                  </a>
                                </Button>
                              </div>

                              <div className="mt-2 text-xs text-muted-foreground">
                                Found: {lead.foundAt.toLocaleString()}
                              </div>
                            </div>

                            <div className="flex items-center">
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant={doneLeads.includes(lead.id) ? "default" : "outline"}
                                  onClick={() => handleMarkDone(lead.id, true)}
                                  className="h-8 text-xs px-3"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Done
                                </Button>
                                <Button
                                  size="sm"
                                  variant={convertedLeads.includes(lead.id) ? "default" : "outline"}
                                  onClick={() => handleMarkConverted(lead.id, true)}
                                  className="h-8 text-xs px-3"
                                >
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Converted
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Forum Leads Section */
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Forum & Social Media Leads ({forumLeads.length})</h2>
          </div>
          {forumLeads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No forum leads found yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {forumLeads.map((forumLead) => (
                <Card key={forumLead.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getPlatformColor(forumLead.platform)} border`}>
                              <span className="mr-1">{getPlatformIcon(forumLead.platform)}</span>
                              {forumLead.platform}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <TrendingUp className={`w-4 h-4 ${getMatchScoreColor(forumLead.matchScore)}`} />
                              <span className={`font-semibold text-sm ${getMatchScoreColor(forumLead.matchScore)}`}>
                                {forumLead.matchScore}% match
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {forumLead.threadTitle}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            <span className="font-medium">By {forumLead.author}:</span> {forumLead.snippet}
                          </p>

                          <div className="text-xs text-muted-foreground">
                            Found: {forumLead.foundAt.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button size="sm" asChild>
                          <a
                            href={forumLead.threadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-7 text-xs px-2"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant={doneForumLeads.includes(forumLead.id) ? "default" : "outline"}
                          onClick={() => handleMarkDone(forumLead.id, false)}
                          className="h-7 text-xs px-2"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Done
                        </Button>
                        <Button
                          size="sm"
                          variant={convertedForumLeads.includes(forumLead.id) ? "default" : "outline"}
                          onClick={() => handleMarkConverted(forumLead.id, false)}
                          className="h-7 text-xs px-2"
                        >
                          <Trophy className="w-3 h-3 mr-1" />
                          Converted
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}