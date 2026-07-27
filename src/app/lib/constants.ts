// Application constants

export const APP_NAME = "helpyoufindthat";
export const APP_TAGLINE = "Find your perfect leads, effortlessly";

export const SEARCH_DURATION_HOURS = 24; // Beta version: 24 hours

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