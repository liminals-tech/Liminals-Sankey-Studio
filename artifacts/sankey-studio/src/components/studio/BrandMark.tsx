import { GitBranch } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5" data-testid="brand-sankey-studio">
      <span className="grid size-8 place-items-center rounded-[9px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm">
        <GitBranch size={17} strokeWidth={2.2} />
      </span>
      <span className="font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))]">Sankey <span className="font-serif text-[1.15em] italic">Studio</span></span>
    </div>
  );
}