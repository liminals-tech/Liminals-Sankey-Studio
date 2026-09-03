import { Check, ChevronDown, Copy } from "lucide-react";
import { useState } from "react";

const csvExample = `Source,Stage 1,Stage 2,Value
Revenue,Gross margin,People,420
Revenue,Gross margin,Tools,185
Revenue,Operating costs,Marketing,150`;

const jsonExample = `[
  {
    "Source": "Revenue",
    "Stage 1": "Gross margin",
    "Stage 2": "People",
    "Value": 420
  }
]`;

function Example({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };
  return <div className="min-w-0 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background)/.55)]">
    <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-2.5 py-2"><span className="font-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">{label}</span><button onClick={() => void copy()} className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--primary))] hover:underline" aria-label={`Copy ${label} example`} data-testid={`button-copy-${label.toLowerCase().replace("/", "-").replace(" ", "-")}-example`}>{copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}</button></div>
    <pre className="overflow-x-auto p-2.5 font-mono text-[9px] leading-relaxed text-[hsl(var(--foreground)/.78)]">{value}</pre>
  </div>;
}

export function DataFormatGuide() {
  return <details open className="mt-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.28)]" data-testid="panel-data-format-guide">
    <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-3 text-xs font-semibold [&::-webkit-details-marker]:hidden">What shape should the data have?<ChevronDown size={14} className="text-[hsl(var(--muted-foreground))]" /></summary>
    <div className="space-y-3 border-t border-[hsl(var(--border))] px-3.5 py-3">
      <p className="text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))]"><strong className="text-[hsl(var(--foreground))]">One row = one flow.</strong> Put ordered text levels on the left and one numeric measure in <code className="font-mono text-[10px]">Value</code>. Repeated paths are added together automatically.</p>
      <div className="grid gap-2 sm:grid-cols-2"><Example label="CSV / TSV" value={csvExample} /><Example label="JSON" value={jsonExample} /></div>
      <ul className="space-y-1 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">
        <li><span className="mr-1 text-[hsl(var(--primary))]">01</span> Map <strong className="text-[hsl(var(--foreground)/.8)]">Source → Stage 1 → Stage 2</strong> as your left-to-right hierarchy. Add more levels as columns when needed.</li>
        <li><span className="mr-1 text-[hsl(var(--primary))]">02</span> Keep <strong className="text-[hsl(var(--foreground)/.8)]">Value</strong> numeric, without combining multiple measures in one column.</li>
        <li><span className="mr-1 text-[hsl(var(--primary))]">03</span> JSON can also be wrapped as <code className="font-mono text-[10px]">{`{ "data": [...] }`}</code>. Optional <code className="font-mono text-[10px]">image</code> or <code className="font-mono text-[10px]">imageUrl</code> fields are only for node visuals.</li>
      </ul>
    </div>
  </details>;
}