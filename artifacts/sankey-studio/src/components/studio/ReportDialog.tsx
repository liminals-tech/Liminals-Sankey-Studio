import { useState } from "react";
import { Flag, X } from "lucide-react";
import { reportGalleryItem, type ReportReason } from "@/lib/gallery";

type Props = { chartId: string; title: string; onClose: () => void; onReported: () => void };

const reasons: Array<{ value: ReportReason; label: string }> = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam or scam" },
  { value: "personal_data", label: "Contains personal data" },
  { value: "other", label: "Other" },
];

export function ReportDialog({ chartId, title, onClose, onReported }: Props) {
  const [reason, setReason] = useState<ReportReason>("inappropriate");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    await reportGalleryItem(chartId, reason, note);
    setSubmitting(false);
    setDone(true);
    onReported();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(var(--foreground)/.28)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="fade-up w-full max-w-[380px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
          <div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Report</p><h2 id="report-title" className="mt-1 font-serif text-xl">{done ? "Thanks" : "Report this chart"}</h2></div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Close" data-testid="button-close-report"><X size={16} /></button>
        </div>
        <div className="p-5">
          {done ? (
            <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">We've recorded your report on <span className="font-mono text-[hsl(var(--foreground))]">{chartId}</span> for manual review. It hasn't been removed from the gallery automatically — that keeps the report system itself from being used to hide charts other people simply disagree with.</p>
          ) : (
            <>
              <p className="mb-3 truncate text-xs text-[hsl(var(--muted-foreground))]">"{title || "Untitled story"}"</p>
              <div className="space-y-1.5">
                {reasons.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs">
                    <input type="radio" name="report-reason" checked={reason === option.value} onChange={() => setReason(option.value)} className="accent-[hsl(var(--primary))]" data-testid={`radio-report-${option.value}`} />
                    {option.label}
                  </label>
                ))}
              </div>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={200} placeholder="Optional details" className="mt-3 w-full resize-none rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-2 text-xs outline-none focus:border-[hsl(var(--primary))]" rows={2} data-testid="textarea-report-note" />
              <button onClick={() => void submit()} disabled={submitting} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[hsl(var(--primary))] px-3 py-2.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60" data-testid="button-submit-report"><Flag size={13} /> {submitting ? "Sending…" : "Submit report"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
