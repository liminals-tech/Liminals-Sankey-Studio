import { ClipboardPaste, FileSpreadsheet, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { parseDelimited, parseJson, parseSpreadsheetBuffer, type ImportSummary } from "@/lib/data";
import { DataFormatGuide } from "@/components/studio/DataFormatGuide";

type Props = { onImported: (summary: ImportSummary) => void; onClose: () => void; initialTab?: "file" | "paste" };

export function ImportPanel({ onImported, onClose, initialTab = "file" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"file" | "paste">(initialTab);
  const [paste, setPaste] = useState("");
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const readFile = async (file: File) => {
    setMessage("");
    const name = file.name.toLowerCase();
    let summary: ImportSummary;
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      summary = await parseSpreadsheetBuffer(await file.arrayBuffer());
    } else {
      const text = await file.text();
      summary = name.endsWith(".json") ? parseJson(text) : parseDelimited(text);
    }
    onImported({ ...summary, fileName: file.name });
  };
  const submitPaste = () => {
    const summary = paste.trim().startsWith("[") || paste.trim().startsWith("{") ? parseJson(paste) : parseDelimited(paste);
    onImported({ ...summary, fileName: "Pasted data" });
  };
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[hsl(var(--foreground)/.28)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="fade-up max-h-[calc(100dvh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[hsl(var(--border))] px-5 py-4">
          <div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Local workspace</p><h2 id="import-title" className="mt-1 font-serif text-2xl">Bring in your table</h2><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Nothing leaves this browser.</p></div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Close import dialog" data-testid="button-close-import"><X size={16} /></button>
        </div>
        <div className="flex gap-1 border-b border-[hsl(var(--border))] px-5 pt-3">
          <button onClick={() => setTab("file")} className={`border-b-2 px-2 pb-3 text-xs font-medium ${tab === "file" ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" : "border-transparent text-[hsl(var(--muted-foreground))]"}`} data-testid="button-import-tab-file"><Upload size={13} className="mr-1.5 inline" /> File</button>
          <button onClick={() => setTab("paste")} className={`border-b-2 px-2 pb-3 text-xs font-medium ${tab === "paste" ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]" : "border-transparent text-[hsl(var(--muted-foreground))]"}`} data-testid="button-import-tab-paste"><ClipboardPaste size={13} className="mr-1.5 inline" /> Paste</button>
        </div>
        <div className="p-5">
          {tab === "file" ? (
            <button onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) void readFile(file); }} className={`flex min-h-[190px] w-full flex-col items-center justify-center rounded-lg border border-dashed px-5 text-center transition ${dragging ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.7)] hover:bg-[hsl(var(--muted)/.45)]"}`} data-testid="dropzone-import">
              <span className="mb-3 grid size-11 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><FileSpreadsheet size={19} /></span><span className="text-sm font-semibold">Drop a file here</span><span className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">or click to browse · CSV, XLSX, XLS, JSON</span>
              <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.json,text/csv,application/json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void readFile(file); }} data-testid="input-import-file" />
            </button>
          ) : <div><label htmlFor="paste-table" className="mb-2 block text-xs font-medium">Tab-separated, comma-separated, or JSON</label><textarea id="paste-table" value={paste} onChange={(event) => setPaste(event.target.value)} placeholder={"Source\\tDestination\\tValue\\nRevenue\\tPeople\\t420"} className="min-h-[190px] w-full resize-y rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 font-mono text-xs outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.15)]" data-testid="textarea-paste-data" /><p className="mt-2 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">JSON accepts an array of row objects, or an object with a <code className="font-mono">data</code> array. Optional <code className="font-mono">image</code> or <code className="font-mono">imageUrl</code> fields can be mapped to nodes later.</p><button onClick={submitPaste} disabled={!paste.trim()} className="mt-3 w-full rounded-md bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-parse-paste">Use this data</button></div>}
          {message && <p className="mt-3 rounded-md bg-[hsl(var(--accent)/.23)] px-3 py-2 text-xs leading-relaxed text-[hsl(var(--foreground))]" data-testid="status-import-message">{message}</p>}
          <DataFormatGuide />
        </div>
      </div>
    </div>
  );
}