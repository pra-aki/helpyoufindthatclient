import { useState } from "react";
import { ApiResult, ApiProduct, ApiError, rateResult } from "../lib/api";
import { FORUM_PLATFORMS } from "../lib/constants";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "./ui/dialog";
import { Trash2, ChevronRight, CheckCircle2, Circle, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "reddit":
      return "🔴";
    case "facebook-groups":
      return "📘";
    case "quora":
      return "🟣";
    case "linkedin-groups":
      return "💼";
    case "hackernews":
      return "🟠";
    case "x":
      return "⬛";
    default:
      return "🔗";
  }
};

const getPlatformLabel = (platform: string) =>
  FORUM_PLATFORMS.find((forum) => forum.id === platform)?.label ?? platform;

export function LeadResultRow({
  result,
  selected = false,
  onToggleSelect,
  onDelete,
  onToggleResponded,
}: {
  result: ApiResult;
  // Accepted for callers that still pass it (e.g. product context), but no
  // longer used here — thread-level generated replies aren't offered yet.
  product?: ApiProduct;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleResponded?: (id: string, responded: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const matchScore = result.relevanceScore === null ? null : Math.round(result.relevanceScore * 100);
  const foundAt = new Date(result.searchDate);
  const postedAt = result.postedAt ? new Date(result.postedAt) : null;
  const respondedAt = result.respondedAt ? new Date(result.respondedAt) : null;
  const isResponded = respondedAt !== null;

  const handleOpenThread = () => {
    window.open(result.link, "_blank", "noopener,noreferrer");
  };

  // "Is this lead useful?" thumbs. Kept locally so callers need no changes.
  const [useful, setUseful] = useState<boolean | null>(result.useful ?? null);
  const [isRating, setIsRating] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [ratingNote, setRatingNote] = useState("");

  const saveRating = async (next: boolean | null, note?: string) => {
    setIsRating(true);
    try {
      const updated = await rateResult(result.productId, result.id, next, note);
      setUseful(updated.useful ?? null);
      setIsNoteOpen(false);
      setRatingNote("");
      if (next !== null) toast.success("Thanks for the feedback!");
    } catch (err) {
      const message = err instanceof ApiError || err instanceof Error ? err.message : "Failed to save your rating";
      toast.error(message);
    } finally {
      setIsRating(false);
    }
  };

  const handleThumbsUp = () => saveRating(useful === true ? null : true);
  const handleThumbsDown = () => {
    if (useful === false) {
      saveRating(null);
    } else {
      setRatingNote("");
      setIsNoteOpen(true);
    }
  };

  return (
    <div className={`rounded-lg hover:bg-muted/50 transition-colors ${isResponded ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex-shrink-0 mt-3 ml-1 h-6 w-6 text-muted-foreground"
          aria-label={expanded ? "Collapse lead details" : "Expand lead details"}
          aria-expanded={expanded}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </Button>

        {onToggleSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(result.id)}
            className="mt-4 flex-shrink-0"
            aria-label="Select lead"
          />
        )}

        <button
          type="button"
          onClick={handleOpenThread}
          className="flex-1 min-w-0 flex items-start justify-between gap-3 p-2.5 text-left"
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex-shrink-0 mt-0.5">{getPlatformIcon(result.source)}</span>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm break-words">{result.title || result.link}</p>
              <p className="text-xs text-muted-foreground break-words line-clamp-2">
                {getPlatformLabel(result.source)}
                {result.whyRelevant ? ` · ${result.whyRelevant}` : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Posted {postedAt ? postedAt.toLocaleDateString() : "date unknown"} · Found {foundAt.toLocaleDateString()}
                {isResponded && <span className="text-primary font-medium"> · Responded</span>}
              </p>
            </div>
          </div>
          {matchScore !== null && (
            <span className="text-xs font-semibold text-primary flex-shrink-0">{matchScore}% match</span>
          )}
        </button>

        {onToggleResponded && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onToggleResponded(result.id, !isResponded)}
            className={`flex-shrink-0 mt-1.5 h-7 w-7 ${
              isResponded ? "text-primary hover:text-muted-foreground" : "text-muted-foreground hover:text-primary"
            }`}
            aria-label={isResponded ? "Mark as not responded" : "Mark as responded"}
            title={isResponded ? "Mark as not responded" : "Mark as responded"}
          >
            {isResponded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleThumbsUp}
          disabled={isRating}
          className={`flex-shrink-0 mt-1.5 h-7 w-7 ${useful === true ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          aria-label="Mark lead as useful"
          aria-pressed={useful === true}
          title="Useful"
        >
          <ThumbsUp className="w-3.5 h-3.5" fill={useful === true ? "currentColor" : "none"} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleThumbsDown}
          disabled={isRating}
          className={`flex-shrink-0 mt-1.5 h-7 w-7 ${useful === false ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
          aria-label="Mark lead as not useful"
          aria-pressed={useful === false}
          title="Not useful"
        >
          <ThumbsDown className="w-3.5 h-3.5" fill={useful === false ? "currentColor" : "none"} />
        </Button>

        <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Not a useful lead?</DialogTitle>
              <DialogDescription className="break-words">
                "{result.title || result.link}" — what was wrong with it? (optional)
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="e.g. They are selling a CRM, not looking for one"
              value={ratingNote}
              onChange={(e) => setRatingNote(e.target.value)}
              rows={3}
              maxLength={2000}
              className="resize-none"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNoteOpen(false)} disabled={isRating}>
                Cancel
              </Button>
              <Button type="button" onClick={() => saveRating(false, ratingNote.trim() || undefined)} disabled={isRating}>
                {isRating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-shrink-0 mt-1.5 mr-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                aria-label="Delete lead"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                <AlertDialogDescription className="break-words">
                  This removes "{result.title || result.link}" from your saved results. This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(result.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {expanded && (
        <div className="ml-11 mr-3 mb-3 -mt-1 p-3 rounded-md border border-border bg-muted/30 space-y-2 text-sm">
          <p className="font-medium text-foreground break-words">{result.title || result.link}</p>
          {result.summary && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Summary</p>
              <p className="text-foreground whitespace-pre-wrap break-words">{result.summary}</p>
            </div>
          )}
          {result.whyRelevant && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                Why it's relevant
              </p>
              <p className="text-foreground whitespace-pre-wrap break-words">{result.whyRelevant}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
            <span>{getPlatformLabel(result.source)}</span>
            <span>Posted date: {postedAt ? postedAt.toLocaleDateString() : "Unknown"}</span>
            <span>Search date: {foundAt.toLocaleDateString()}</span>
            {matchScore !== null && <span>{matchScore}% match</span>}
            {respondedAt && <span className="text-primary font-medium">Responded {respondedAt.toLocaleDateString()}</span>}
          </div>
          <button
            type="button"
            onClick={handleOpenThread}
            className="text-xs text-primary hover:underline break-all text-left"
          >
            {result.link}
          </button>
        </div>
      )}
    </div>
  );
}
