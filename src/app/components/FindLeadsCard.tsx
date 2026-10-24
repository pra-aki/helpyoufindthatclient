import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { FORUM_PLATFORMS } from "../lib/constants";
import { searchThreads, createJob, ApiError } from "../lib/api";
import { useCredits } from "../lib/credits-context";
import { toDateInputValue, todayDateInputValue, daysAgoDateInputValue } from "../lib/dates";
import { Search, Loader2, CalendarClock, Mail, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const LEAD_COUNT_OPTIONS = [10, 20, 30];
// Every 10 leads searched costs 1 credit, per forum searched.
const LEADS_PER_CREDIT = 10;
const creditsForLeadCount = (count: number) => count / LEADS_PER_CREDIT;
const MAX_RANGE_MONTHS = 3;
// Matches the backend's job config.limits.maxDays (92 days ~= 3 months).
const MAX_JOB_DAYS = 92;
const JOB_DEFAULT_DAYS = 30;
// Daily search jobs always search a fixed 10 leads/day per forum.
const JOB_LEAD_COUNT = 10;
const JOB_MIN_SCORE_OPTIONS = [25, 50, 75]; // percent
const JOB_DEFAULT_MIN_SCORE_PERCENT = 50;

type Mode = "once" | "daily";

// Earliest allowed "From" date for a given "To" date, capped to a 3-month span.
const earliestFromDateFor = (toDateValue: string) => {
  const date = new Date(`${toDateValue}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - MAX_RANGE_MONTHS);
  return toDateInputValue(date);
};

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
};

const shortDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "Last 3 days" when the range ends today, otherwise "Mar 1 – Mar 4". */
function describeRange(from: string, to: string) {
  if (to === todayDateInputValue()) {
    const days = Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000);
    return days === 0 ? "Today" : `Last ${plural(days, "day")}`;
  }
  return `${shortDate(from)} – ${shortDate(to)}`;
}

/**
 * One card for both one-off searches and daily scheduled searches. Collapsed,
 * it shows a one-line summary and a button to run it; expanded, the full form.
 */
export function FindLeadsCard({
  productId,
  startExpanded,
  onSearched,
  onJobCreated,
}: {
  productId: string;
  // Expanded until the user toggles it; the caller passes true for products with no leads yet.
  startExpanded: boolean;
  onSearched: () => void;
  onJobCreated: () => void;
}) {
  const { balance, refresh: refreshCredits } = useCredits();
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const expanded = userExpanded ?? startExpanded;
  const [mode, setMode] = useState<Mode>("once");

  // All forums are searched by default; the user can uncheck any of them.
  const [selectedForums, setSelectedForums] = useState<string[]>(FORUM_PLATFORMS.map((forum) => forum.id));
  const toggleForum = (forumId: string) => {
    setSelectedForums((prev) =>
      prev.includes(forumId) ? prev.filter((id) => id !== forumId) : [...prev, forumId]
    );
  };

  const [numberOfLeads, setNumberOfLeads] = useState<number>(LEAD_COUNT_OPTIONS[0]);
  const [fromDate, setFromDate] = useState<string>(daysAgoDateInputValue(3));
  const [toDate, setToDate] = useState<string>(todayDateInputValue());
  const [isSearching, setIsSearching] = useState(false);

  const [jobEndDate, setJobEndDate] = useState<string>(daysFromNow(JOB_DEFAULT_DAYS));
  const [jobMinScorePercent, setJobMinScorePercent] = useState<number>(JOB_DEFAULT_MIN_SCORE_PERCENT);
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const cost =
    mode === "once"
      ? creditsForLeadCount(numberOfLeads) * selectedForums.length
      : creditsForLeadCount(JOB_LEAD_COUNT) * selectedForums.length;
  const notEnoughCredits = balance !== null && cost > balance;
  const isBusy = isSearching || isCreatingJob;

  const forumsSummary =
    selectedForums.length === FORUM_PLATFORMS.length ? "All forums" : plural(selectedForums.length, "forum");
  const summary =
    mode === "once"
      ? `${numberOfLeads} leads per forum · ${describeRange(fromDate, toDate)} · ${forumsSummary}`
      : `Daily · ${JOB_LEAD_COUNT} leads per forum · until ${shortDate(jobEndDate)} · ${forumsSummary}`;

  const validate = () => {
    if (selectedForums.length === 0) {
      toast.error("Please select at least one forum to search");
      return false;
    }
    if (mode === "once") {
      if (fromDate > toDate) {
        toast.error("The From date must be on or before the To date");
        return false;
      }
      if (fromDate < earliestFromDateFor(toDate)) {
        toast.error(`The search date range can't exceed ${MAX_RANGE_MONTHS} months`);
        return false;
      }
    }
    return true;
  };

  const handleOpenConfirm = () => {
    if (!validate()) return;
    setIsConfirmOpen(true);
  };

  const handleStartSearch = async () => {
    if (!validate()) return;
    setIsConfirmOpen(false);
    setIsSearching(true);
    try {
      const { saved } = await searchThreads({
        productId,
        forum: selectedForums,
        threads: numberOfLeads,
        from: fromDate,
        to: toDate,
      });
      toast.success(`Search complete — ${plural(saved.newCount, "new lead")} and ${plural(saved.existingCount, "existing lead")} found.`);
      onSearched();
      refreshCredits();
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Unknown error";
      toast.error(`Search failed: ${message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateJob = async () => {
    if (!validate()) return;
    setIsCreatingJob(true);
    try {
      await createJob({
        productId,
        forum: selectedForums,
        threads: JOB_LEAD_COUNT,
        minScore: jobMinScorePercent / 100,
        endDate: jobEndDate,
      });
      setIsConfirmOpen(false);
      onJobCreated();
      toast.success(`Scheduled — it'll search daily until ${shortDate(jobEndDate)}`);
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to schedule the search";
      toast.error(message);
    } finally {
      setIsCreatingJob(false);
    }
  };

  const actionButton = (
    <Button type="button" onClick={handleOpenConfirm} disabled={isBusy || notEnoughCredits} className="w-full sm:w-auto">
      {isBusy ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {isSearching ? "Searching..." : "Scheduling..."}
        </>
      ) : mode === "once" ? (
        <>
          <Search className="w-4 h-4 mr-2" />
          Search now · {plural(cost, "credit")}
        </>
      ) : (
        <>
          <CalendarClock className="w-4 h-4 mr-2" />
          Schedule · {plural(cost, "credit")}/day
        </>
      )}
    </Button>
  );

  const costLine = notEnoughCredits ? (
    <p className="text-xs text-destructive">
      Not enough credits — you have {balance}.{" "}
      <Link to="/dashboard/profile" className="underline underline-offset-2">
        Get credits
      </Link>
    </p>
  ) : isSearching ? (
    <p className="text-xs text-muted-foreground">This can take a minute.</p>
  ) : (
    <p className="text-xs text-muted-foreground">
      Uses {plural(cost, "credit")}
      {mode === "daily" ? " per day" : ""}
      {balance !== null ? ` · you have ${balance}` : ""}
    </p>
  );

  return (
    <Card>
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Find leads</h2>
            {!expanded && <p className="text-sm text-muted-foreground mt-0.5">{summary}</p>}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUserExpanded(!expanded)}
            disabled={isBusy}
            className="flex-shrink-0"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide
              </>
            ) : (
              "Change"
            )}
          </Button>
        </div>

        {expanded && (
          <>
            {/* Run once / Run daily */}
            <div className="grid grid-cols-2 sm:inline-grid gap-1 p-1 rounded-lg bg-muted" role="radiogroup" aria-label="Search type">
              {(["once", "daily"] as Mode[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={mode === value}
                  onClick={() => setMode(value)}
                  disabled={isBusy}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {value === "once" ? "Run once" : "Run daily"}
                </button>
              ))}
            </div>

            {mode === "once" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="numberOfLeads">Leads per forum</Label>
                  <Select value={String(numberOfLeads)} onValueChange={(value) => setNumberOfLeads(Number(value))}>
                    <SelectTrigger id="numberOfLeads" className="w-full">
                      <SelectValue>{numberOfLeads} leads</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_COUNT_OPTIONS.map((count) => (
                        <SelectItem key={count} value={String(count)}>
                          {count} leads
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    1 credit per 10 leads, per forum. Only relevant leads are kept, so you may get fewer.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fromDate">From</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    min={earliestFromDateFor(toDate)}
                    max={toDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="toDate">To</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={toDate}
                    min={fromDate}
                    max={todayDateInputValue()}
                    onChange={(e) => {
                      const newToDate = e.target.value;
                      setToDate(newToDate);
                      // Keep the range within the 3-month cap if it now moves out of bounds.
                      const earliestFrom = earliestFromDateFor(newToDate);
                      if (fromDate < earliestFrom) {
                        setFromDate(earliestFrom);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground col-span-2 sm:col-start-2 -mt-1.5">
                  Posts from up to {MAX_RANGE_MONTHS} months back.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="jobEndDate">Ends on</Label>
                    <Input
                      id="jobEndDate"
                      type="date"
                      value={jobEndDate}
                      min={todayDateInputValue()}
                      max={daysFromNow(MAX_JOB_DAYS)}
                      onChange={(e) => setJobEndDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jobMinScore">Minimum relevance</Label>
                    <Select
                      value={String(jobMinScorePercent)}
                      onValueChange={(value) => setJobMinScorePercent(Number(value))}
                    >
                      <SelectTrigger id="jobMinScore" className="w-full">
                        <SelectValue>{jobMinScorePercent}%</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_MIN_SCORE_OPTIONS.map((percent) => (
                          <SelectItem key={percent} value={String(percent)}>
                            {percent}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Searches {JOB_LEAD_COUNT} leads per forum once a day until the end date.
                </p>
                <div className="flex items-start gap-2 p-3 rounded-lg border border-border text-xs text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0 mt-px" />
                  <p>
                    You'll get an email at your account address when this job finds new leads. You can turn these
                    emails off anytime in{" "}
                    <Link to="/dashboard/profile" className="underline underline-offset-2 text-foreground">
                      your profile settings
                    </Link>
                    . Searches still run and leads are still saved.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Forums</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                {FORUM_PLATFORMS.map((forum) => (
                  <label key={forum.id} htmlFor={`forum-${forum.id}`} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      id={`forum-${forum.id}`}
                      checked={selectedForums.includes(forum.id)}
                      onCheckedChange={() => toggleForum(forum.id)}
                    />
                    <span className="text-sm text-foreground">{forum.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          {actionButton}
          {costLine}
        </div>
      </CardContent>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "once" ? "Start search?" : "Schedule daily search?"}</DialogTitle>
            <DialogDescription>
              {mode === "once" ? (
                <>
                  Uses <span className="font-semibold text-foreground">{plural(cost, "credit")}</span>
                  {balance !== null && ` (${balance} → ${balance - cost})`}.
                </>
              ) : (
                <>
                  Uses <span className="font-semibold text-foreground">{plural(cost, "credit")}</span> a day until{" "}
                  {shortDate(jobEndDate)}. Cancel anytime.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isCreatingJob}>
              Cancel
            </Button>
            <Button type="button" onClick={mode === "once" ? handleStartSearch : handleCreateJob} disabled={isCreatingJob}>
              {isCreatingJob ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : mode === "once" ? (
                "Search"
              ) : (
                "Schedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
