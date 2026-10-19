// Client for the helpyoufindthat backend (see ../../helpyoufindthat_backend).
import { getAccessToken } from "./auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://helpyoufindthat-backend.onrender.com").replace(
  /\/+$/,
  ""
);
// Static fallback token, only used when no one is logged in through the UI
// (handy for testing the API directly). See .env.example.
const STATIC_FALLBACK_TOKEN = import.meta.env.VITE_API_TOKEN ?? "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Shared request helper: adds the bearer token, parses JSON, and throws ApiError on failure. */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Prefer the real logged-in user's session token; fall back to the static
  // dev token (if configured) so the app still works before real login exists
  // anywhere it's used, or for hand-testing outside the UI.
  const token = (await getAccessToken()) ?? STATIC_FALLBACK_TOKEN;
  if (!token) {
    throw new ApiError("Not signed in. Log in and try again.", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("Could not reach the API. Check your connection and try again.", 0);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore — handled by !response.ok below
  }

  if (!response.ok) {
    const message = data?.error?.message ?? `Request failed with HTTP ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

// ---- Products ----

export interface ApiProduct {
  id: string;
  name: string;
  website: string | null;
  description: string;
  // A reusable draft reply for pitching this product, composed by
  // POST /api/products/:id/reply or set by hand. Null until generated.
  generalReply: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  website?: string;
  description: string;
  // Omit to leave the stored general reply untouched; pass null to clear it.
  generalReply?: string | null;
}

export async function createProduct(input: ProductInput) {
  const { product } = await apiFetch<{ product: ApiProduct }>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return product;
}

export async function listProducts() {
  const { products } = await apiFetch<{ products: ApiProduct[] }>("/api/products");
  return products;
}

export async function updateProduct(id: string, input: ProductInput) {
  const { product } = await apiFetch<{ product: ApiProduct }>(`/api/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return product;
}

export async function getProduct(id: string) {
  const { product } = await apiFetch<{ product: ApiProduct }>(`/api/products/${encodeURIComponent(id)}`);
  return product;
}

/** Composes the product's general reply from Perplexity and stores it, replacing any previous one. */
export async function composeGeneralReply(id: string) {
  return apiFetch<{ product: ApiProduct; notes: string; meta: any }>(
    `/api/products/${encodeURIComponent(id)}/reply`,
    { method: "POST" }
  );
}

export interface WebsiteDescription {
  website: string;
  name: string | null;
  description: string | null;
  problem: string | null;
  audience: string | null;
  confidence: number; // 0-1
}

/** Reads a product website and drafts a name/description/audience/problem from it. Nothing is saved. */
export async function describeWebsite(website: string) {
  return apiFetch<WebsiteDescription>("/api/products/describe", {
    method: "POST",
    body: JSON.stringify({ website }),
  });
}

// ---- Search results ----

export interface ApiResult {
  id: string;
  productId: string;
  source: string; // forum id, e.g. "reddit"
  link: string;
  title: string | null;
  summary: string | null;
  whyRelevant: string | null;
  // A draft reply written for this specific thread. Null for leads found
  // before this feature shipped.
  suggestedReply: string | null;
  postedAt: string | null;
  relevanceScore: number | null; // 0-1
  searchDate: string;
  // Null until the user marks this lead as responded to; then the time they did.
  respondedAt: string | null;
  // The scheduled job whose run last stored this lead, or null if only manual
  // searches found it.
  jobId: string | null;
  createdAt: string;
}

export async function listProductResults(productId: string, { limit, offset }: { limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set("limit", String(limit));
  if (offset !== undefined) params.set("offset", String(offset));
  const qs = params.toString();
  return apiFetch<{ results: ApiResult[]; count: number; total: number; limit: number; offset: number }>(
    `/api/products/${encodeURIComponent(productId)}/results${qs ? `?${qs}` : ""}`
  );
}

/** Marks (or unmarks) a lead as responded to. */
export async function setResultResponded(productId: string, resultId: string, responded: boolean) {
  const { result } = await apiFetch<{ productId: string; result: ApiResult }>(
    `/api/products/${encodeURIComponent(productId)}/results/${encodeURIComponent(resultId)}`,
    { method: "PATCH", body: JSON.stringify({ responded }) }
  );
  return result;
}

/** Deletes one stored lead. */
export async function deleteResult(productId: string, resultId: string) {
  return apiFetch<{ productId: string; deleted: number; ids: string[] }>(
    `/api/products/${encodeURIComponent(productId)}/results/${encodeURIComponent(resultId)}`,
    { method: "DELETE" }
  );
}

/** Deletes several stored leads at once. */
export async function deleteResults(productId: string, resultIds: string[]) {
  return apiFetch<{ productId: string; deleted: number; ids: string[]; notFound: string[] }>(
    `/api/products/${encodeURIComponent(productId)}/results`,
    { method: "DELETE", body: JSON.stringify({ ids: resultIds }) }
  );
}

// ---- Threads search ----

export interface SearchThreadsParams {
  productId: string;
  // One or more forum ids (e.g. "reddit", "facebook-groups", "quora",
  // "linkedin-groups", "hackernews", "x"), searched together in one call.
  forum: string[];
  threads: number;
  // Inclusive UTC date range, "YYYY-MM-DD". "to" cannot be in the future
  // and the span cannot exceed the backend's configured max (currently 3 months).
  from: string;
  to: string;
}

export interface ApiThread {
  id: string | null;
  title: string;
  url: string;
  summary: string;
  whyRelevant: string;
  asksFor: string;
  suggestedReply: string;
  postedAt: string | null;
  relevanceScore: number; // 0-1
  source: string; // forum id, e.g. "reddit"
}

/**
 * Calls POST /api/threads once for all the given forums — the backend
 * searches them together in a single Perplexity call, tags each result with
 * which forum it came from (`source`), and stores them under the product.
 */
export interface SearchSaved {
  productId: string;
  count: number;
  // Leads this search stored for the first time.
  newCount: number;
  // Leads already stored under the product that this search found again.
  existingCount: number;
  searchDate: string;
}

export async function searchThreads({ productId, forum, threads, from, to }: SearchThreadsParams) {
  return apiFetch<{ threads: ApiThread[]; count: number; saved: SearchSaved }>("/api/threads", {
    method: "POST",
    body: JSON.stringify({ productId, forum, threads, from, to }),
  });
}

// ---- Scheduled searches ("jobs") ----

export type JobStatus = "active" | "completed" | "cancelled";

export interface ApiJob {
  id: string;
  productId: string;
  // Read from the product at query time, so a rename shows up immediately.
  // Null only if the backend didn't embed it (shouldn't happen via listJobs/getJob).
  productName: string | null;
  userId: string;
  email: string;
  forums: string[];
  threads: number;
  minScore: number; // 0-1
  startDate: string;
  endDate: string;
  status: JobStatus;
  nextRunAt: string;
  lastRunAt: string | null;
  lastDateTo: string | null;
  lastStatus: "ok" | "error" | null;
  lastError: string | null;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobInput {
  productId: string;
  // Same forms as searchThreads' forum param.
  forum: string[];
  // Last day the job runs, "YYYY-MM-DD" (UTC), inclusive. Today or later,
  // at most the backend's configured max (currently 92 days) out.
  endDate: string;
  threads?: number; // default 10, max 50
  minScore?: number; // default 0.8, 0-1
  email?: string; // defaults to the caller's account email
}

/** Schedules a daily search. Nothing is searched until the runner's next pass. */
export async function createJob(input: JobInput) {
  const { job } = await apiFetch<{ job: ApiJob }>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return job;
}

export interface ListJobsParams {
  productId?: string;
  status?: JobStatus;
}

export async function listJobs({ productId, status }: ListJobsParams = {}) {
  const params = new URLSearchParams();
  if (productId) params.set("productId", productId);
  if (status) params.set("status", status);
  const qs = params.toString();
  const { jobs } = await apiFetch<{ jobs: ApiJob[] }>(`/api/jobs${qs ? `?${qs}` : ""}`);
  return jobs;
}

export async function getJob(id: string) {
  const { job } = await apiFetch<{ job: ApiJob }>(`/api/jobs/${encodeURIComponent(id)}`);
  return job;
}

/** Cancels a job; it stays listed with status "cancelled" and keeps its run history. */
export async function cancelJob(id: string) {
  const { job } = await apiFetch<{ job: ApiJob }>(`/api/jobs/${encodeURIComponent(id)}`, { method: "DELETE" });
  return job;
}

export interface ApiJobRun {
  id: string;
  jobId: string;
  ranAt: string;
  from: string;
  to: string;
  status: "ok" | "error";
  foundCount: number | null; // threads the search returned, at any score
  leadCount: number | null; // threads at or above the job's minScore (all stored)
  newLeadCount: number | null; // of those, how many weren't already stored (what the email contains)
  emailStatus: "sent" | "skipped" | "failed" | "not_configured" | null;
  emailError: string | null;
  error: string | null;
  errorStatus: number | null;
  durationMs: number | null;
}

/** A job's runs, newest first. */
export async function listJobRuns(jobId: string, { limit, offset }: { limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set("limit", String(limit));
  if (offset !== undefined) params.set("offset", String(offset));
  const qs = params.toString();
  return apiFetch<{ jobId: string; runs: ApiJobRun[]; count: number; total: number; limit: number; offset: number }>(
    `/api/jobs/${encodeURIComponent(jobId)}/runs${qs ? `?${qs}` : ""}`
  );
}

/**
 * Every lead the job's runs have stored, latest found first, then by score.
 * Same shape (and filters) as listProductResults.
 */
export async function listJobLeads(
  jobId: string,
  { limit, offset, source, minScore }: { limit?: number; offset?: number; source?: string; minScore?: number } = {}
) {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set("limit", String(limit));
  if (offset !== undefined) params.set("offset", String(offset));
  if (source !== undefined) params.set("source", source);
  if (minScore !== undefined) params.set("minScore", String(minScore));
  const qs = params.toString();
  return apiFetch<{ jobId: string; leads: ApiResult[]; count: number; total: number; limit: number; offset: number }>(
    `/api/jobs/${encodeURIComponent(jobId)}/leads${qs ? `?${qs}` : ""}`
  );
}

// ---- Error reports ----

export type LeadReportReason = "not_relevant" | "wrong_forum" | "duplicate" | "other";

export interface ErrorReportInput {
  // What the user says happened (required, up to 2000 characters).
  message: string;
  // Where in the app (up to 500 characters).
  page?: string;
  // The error message the app showed (up to 2000 characters).
  error?: string;
  // Anything else, as a JSON object (up to 8000 characters serialised).
  details?: Record<string, unknown>;
}

/**
 * Sends a report to the owner. Used for both the general "Report a Problem" form and the
 * per-lead flag, which puts the lead's ids in `details`.
 * Backend: POST /api/error-reports -> 201 { report: { id, createdAt } }; 5 per user per minute.
 */
export async function submitErrorReport(input: ErrorReportInput) {
  return apiFetch<{ report: { id: string; createdAt: string } }>("/api/error-reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ---- Credits ----

export interface ApiCreditTransaction {
  id: string;
  delta: number; // positive = credits added, negative = credits spent
  balanceAfter: number;
  reason: "signup_grant" | "search" | "job_run" | "refund";
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiCreditsPricing {
  signupCredits: number;
  leadsPerCredit: number;
  jobRunCreditsPerForum: number;
}

/** The caller's credit balance, the current pricing, and their transaction ledger, newest first. */
export async function listCredits({ limit, offset }: { limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set("limit", String(limit));
  if (offset !== undefined) params.set("offset", String(offset));
  const qs = params.toString();
  return apiFetch<{
    balance: number;
    pricing: ApiCreditsPricing;
    transactions: ApiCreditTransaction[];
    count: number;
    total: number;
    limit: number;
    offset: number;
  }>(`/api/credits${qs ? `?${qs}` : ""}`);
}
