import { Download, FilePlus2, HelpCircle, PanelLeft, PanelRight, Sparkles } from "lucide-react";
import { Show, UserButton } from "@clerk/react";
import { BrandMark } from "@/components/studio/BrandMark";

type Props = { authEnabled: boolean; onImport: () => void; onExport: () => void; onHelp: () => void; onMenu: () => void; onInspector: () => void; onSignIn: () => void; onSignUp: () => void; dataOpen: boolean; inspectorOpen: boolean };

export function TopBar({ authEnabled, onImport, onExport, onHelp, onMenu, onInspector, onSignIn, onSignUp, dataOpen, inspectorOpen }: Props) {
  return (
    <header className="flex h-[67px] shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-4 backdrop-blur-md sm:px-7">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="grid size-9 place-items-center rounded-lg border border-[hsl(var(--border))] transition hover:bg-[hsl(var(--muted))]" aria-label={dataOpen ? "Collapse examples menu" : "Expand examples menu"} data-testid="button-toggle-datasets"><PanelLeft size={17} /></button>
        <BrandMark />
        <span className="hidden border-l border-[hsl(var(--border))] pl-3 text-[11px] text-[hsl(var(--muted-foreground))] sm:inline">Untitled story</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="mr-1 hidden items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))] md:flex"><span className="size-1.5 rounded-full bg-[hsl(var(--chart-2))]" /> Local only</span>
        <button onClick={onInspector} className="hidden size-9 place-items-center rounded-md text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] sm:grid" aria-label={inspectorOpen ? "Collapse editor menu" : "Expand editor menu"} data-testid="button-toggle-inspector"><PanelRight size={17} /></button>
        <button onClick={onHelp} className="grid size-9 place-items-center rounded-md text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]" aria-label="Help" data-testid="button-help"><HelpCircle size={17} /></button>
        <button onClick={() => window.open("https://github.com", "_blank", "noopener,noreferrer")} className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-[11px] font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] sm:flex" data-testid="link-feature-request"><Sparkles size={13} /> Request a feature</button>
        <button onClick={onImport} className="hidden items-center gap-1.5 rounded-md border border-[hsl(var(--border))] px-3 py-2 text-[11px] font-medium transition hover:border-[hsl(var(--primary))] sm:flex" data-testid="button-new-import"><FilePlus2 size={14} /> New data</button>
          {authEnabled && <><Show when="signed-out">
            <div className="flex items-center gap-1">
              <button onClick={onSignIn} className="whitespace-nowrap rounded-md px-1.5 py-2 text-[10px] font-semibold text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] sm:px-2.5 sm:text-[11px]" data-testid="button-sign-in">Sign in</button>
              <button onClick={onSignUp} className="rounded-md bg-[hsl(var(--primary))] px-2 py-2 text-[10px] font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:brightness-95 sm:px-3 sm:text-[11px]" data-testid="button-create-account">Create account</button>
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
          </Show></>}
        <button onClick={onExport} className="flex items-center gap-1.5 rounded-md bg-[hsl(var(--primary))] px-3 py-2 text-[11px] font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:brightness-95" data-testid="button-export-top"><Download size={14} /> <span className="hidden sm:inline">Export</span></button>
      </div>
    </header>
  );
}