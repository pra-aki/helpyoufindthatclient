export interface Lead {
  id: string;
  requestId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  matchScore: number;
  foundAt: Date;
  websiteDescription: string; // Brief description of what the company does
}

export interface ForumLead {
  id: string;
  requestId: string;
  platform: "reddit" | "facebook" | "twitter";
  threadTitle: string;
  threadUrl: string;
  author: string;
  snippet: string;
  matchScore: number;
  foundAt: Date;
}

export interface LeadRequest {
  id: string;
  productName: string;
  productDescription: string;
  targetAudience: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  progress: number;
  createdAt: Date;
  expiresAt: Date;
  leadsFound: number;
  directContactCount: number;
  forumLeadCount: number;
  newLeadsCount: number;
  searchType: "forum" | "direct"; // Type of search
}

// Mock lead requests
export const mockLeadRequests: LeadRequest[] = [
  {
    id: "1",
    productName: "AI Marketing Tool",
    productDescription: "Automated marketing platform for small businesses",
    targetAudience: "Small business owners, Marketing managers",
    status: "in-progress",
    progress: 65,
    createdAt: new Date("2026-03-21T10:00:00"),
    expiresAt: new Date("2026-03-21T12:00:00"),
    leadsFound: 7,
    directContactCount: 4,
    forumLeadCount: 3,
    newLeadsCount: 2,
    searchType: "direct",
  },
  {
    id: "2",
    productName: "Cloud Storage Solution",
    productDescription: "Enterprise-grade secure cloud storage",
    targetAudience: "IT Directors, CTOs",
    status: "completed",
    progress: 100,
    createdAt: new Date("2026-03-20T14:30:00"),
    expiresAt: new Date("2026-03-20T16:30:00"),
    leadsFound: 5,
    directContactCount: 2,
    forumLeadCount: 3,
    newLeadsCount: 0,
    searchType: "forum",
  },
  {
    id: "3",
    productName: "CRM Software",
    productDescription: "Customer relationship management for startups",
    targetAudience: "Startup founders, Sales teams",
    status: "pending",
    progress: 0,
    createdAt: new Date("2026-03-21T15:00:00"),
    expiresAt: new Date("2026-03-21T17:00:00"),
    leadsFound: 0,
    directContactCount: 0,
    forumLeadCount: 0,
    newLeadsCount: 0,
    searchType: "direct",
  },
];

// Mock leads for a request
export const mockLeads: Lead[] = [
  {
    id: "1",
    requestId: "1",
    companyName: "Tech Innovations Inc",
    contactName: "Sarah Johnson",
    email: "sarah.j@techinnovations.com",
    phone: "+1-555-0123",
    website: "techinnovations.com",
    matchScore: 92,
    foundAt: new Date("2026-03-21T11:30:00"),
    websiteDescription: "A technology consulting firm specializing in digital transformation and AI implementation for small to medium-sized businesses.",
  },
  {
    id: "2",
    requestId: "1",
    companyName: "Digital Marketing Pro",
    contactName: "Michael Chen",
    email: "m.chen@digitalmarketingpro.com",
    phone: "+1-555-0124",
    website: "digitalmarketingpro.com",
    matchScore: 88,
    foundAt: new Date("2026-03-21T12:15:00"),
    websiteDescription: "Full-service digital marketing agency offering SEO, PPC, social media management, and content marketing solutions.",
  },
  {
    id: "3",
    requestId: "1",
    companyName: "Growth Dynamics",
    contactName: "Emily Rodriguez",
    email: "emily@growthdynamics.com",
    phone: "+1-555-0125",
    website: "growthdynamics.com",
    matchScore: 85,
    foundAt: new Date("2026-03-21T13:00:00"),
    websiteDescription: "Business growth consultancy helping startups and SMBs scale through strategic planning and operational optimization.",
  },
  {
    id: "4",
    requestId: "1",
    companyName: "Startup Accelerator",
    contactName: "David Kim",
    email: "d.kim@startupaccelerator.com",
    phone: "+1-555-0126",
    website: "startupaccelerator.com",
    matchScore: 81,
    foundAt: new Date("2026-03-21T14:20:00"),
    websiteDescription: "Venture capital and acceleration program providing funding, mentorship, and resources to early-stage technology startups.",
  },
  {
    id: "5",
    requestId: "2",
    companyName: "Cloud Solutions Corp",
    contactName: "Jennifer Martinez",
    email: "j.martinez@cloudsolutions.com",
    phone: "+1-555-0127",
    website: "cloudsolutions.com",
    matchScore: 95,
    foundAt: new Date("2026-03-20T15:00:00"),
    websiteDescription: "Enterprise cloud infrastructure provider offering secure, scalable, and compliant cloud storage and computing services.",
  },
  {
    id: "6",
    requestId: "2",
    companyName: "Enterprise Systems Ltd",
    contactName: "Robert Anderson",
    email: "r.anderson@enterprisesystems.com",
    phone: "+1-555-0128",
    website: "enterprisesystems.com",
    matchScore: 89,
    foundAt: new Date("2026-03-20T16:30:00"),
    websiteDescription: "IT systems integrator specializing in enterprise software deployment, cloud migration, and managed IT services for large organizations.",
  },
];

// Mock forum leads
export const mockForumLeads: ForumLead[] = [
  {
    id: "f1",
    requestId: "1",
    platform: "reddit",
    threadTitle: "Looking for affordable marketing automation tools for my small business",
    threadUrl: "https://reddit.com/r/smallbusiness/comments/example1",
    author: "u/smallbiz_owner",
    snippet: "I run a small marketing agency and I'm looking for tools that can help automate our social media posting and email campaigns. Budget is around $100/month...",
    matchScore: 94,
    foundAt: new Date("2026-03-21T10:45:00"),
  },
  {
    id: "f2",
    requestId: "1",
    platform: "twitter",
    threadTitle: "Any recommendations for AI-powered marketing tools?",
    threadUrl: "https://twitter.com/marketer123/status/example",
    author: "@marketer123",
    snippet: "Need something that can help with content creation and scheduling. Preferably with analytics. What are you all using?",
    matchScore: 87,
    foundAt: new Date("2026-03-21T11:20:00"),
  },
  {
    id: "f3",
    requestId: "1",
    platform: "facebook",
    threadTitle: "Marketing Software Recommendations - Small Business Group",
    threadUrl: "https://facebook.com/groups/smallbiz/posts/example",
    author: "Jane Smith",
    snippet: "Hi everyone! I'm looking to upgrade our marketing stack. Currently doing everything manually and it's taking too much time...",
    matchScore: 82,
    foundAt: new Date("2026-03-21T12:30:00"),
  },
  {
    id: "f4",
    requestId: "2",
    platform: "reddit",
    threadTitle: "Best cloud storage for enterprise with security compliance?",
    threadUrl: "https://reddit.com/r/sysadmin/comments/example2",
    author: "u/it_director",
    snippet: "We need to migrate from our current solution. Requirements: SOC2 compliance, 10TB+ storage, good API integration...",
    matchScore: 96,
    foundAt: new Date("2026-03-20T15:15:00"),
  },
  {
    id: "f5",
    requestId: "2",
    platform: "twitter",
    threadTitle: "Cloud storage recommendations for growing tech company?",
    threadUrl: "https://twitter.com/cto_tech/status/example2",
    author: "@cto_tech",
    snippet: "Looking for scalable cloud storage solution. Team of 50+ engineers. Need version control and collaboration features.",
    matchScore: 91,
    foundAt: new Date("2026-03-20T16:00:00"),
  },
  {
    id: "f6",
    requestId: "2",
    platform: "reddit",
    threadTitle: "Secure cloud storage options for healthcare data?",
    threadUrl: "https://reddit.com/r/healthcare_it/comments/example3",
    author: "u/healthcare_cio",
    snippet: "Need HIPAA compliant cloud storage with encryption at rest and in transit. What are the best options out there?",
    matchScore: 88,
    foundAt: new Date("2026-03-20T16:45:00"),
  },
];