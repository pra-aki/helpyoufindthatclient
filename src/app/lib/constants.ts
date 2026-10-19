// Application constants

export const APP_NAME = "helpyoufindthat";
export const APP_TAGLINE = "Find your perfect leads, effortlessly";

export const SEARCH_DURATION_HOURS = 24; // Beta version: 24 hours

// Matches the "Last Updated" date on the Terms of Service / Privacy Policy
// pages. Stamped onto a user's account metadata at signup as a record of
// which version they agreed to — bump this whenever those pages materially
// change.
export const TERMS_VERSION = "2026-10";

// Forums & communities searched when running a "Forum Lead" search.
// Selected by default; the user can uncheck any before starting a search.
export interface ForumPlatform {
  id: string;
  label: string;
}

export const FORUM_PLATFORMS: ForumPlatform[] = [
  { id: "reddit", label: "Reddit" },
  { id: "facebook-groups", label: "Facebook Groups" },
  { id: "quora", label: "Quora" },
  { id: "linkedin-groups", label: "LinkedIn Groups" },
];

export const getForumLabel = (id: string): string =>
  FORUM_PLATFORMS.find((forum) => forum.id === id)?.label ?? id;

// Reasons offered when a user reports a quality problem with a specific lead.
export const LEAD_REPORT_REASONS: { id: "not_relevant" | "wrong_forum" | "duplicate" | "other"; label: string }[] = [
  { id: "not_relevant", label: "Not relevant to my product" },
  { id: "wrong_forum", label: "Posted on the wrong forum" },
  { id: "duplicate", label: "Duplicate of another lead" },
  { id: "other", label: "Other" },
];

export const PLAN_LIMITS = {
  free: {
    maxRequests: 3,
    searchDuration: 24,
    maxLeadsPerRequest: 50,
  },
  pro: {
    maxRequests: Infinity,
    searchDuration: 48,
    maxLeadsPerRequest: 500,
  },
  enterprise: {
    maxRequests: Infinity,
    searchDuration: 72,
    maxLeadsPerRequest: Infinity,
  },
};