import { useLocation } from "wouter";
import { BrandMark } from "@/components/studio/BrandMark";

const CONTACT_EMAIL = "marco@liminals.it";

function LegalShell({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  return (
    <div className="studio-noise flex min-h-[100dvh] flex-col bg-[hsl(var(--background))]">
      <header className="flex h-[67px] shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-4 backdrop-blur-md sm:px-7">
        <button onClick={() => setLocation("/")} aria-label="Back to the editor"><BrandMark /></button>
        <button onClick={() => setLocation("/")} className="rounded-md bg-[hsl(var(--primary))] px-3 py-2 text-[11px] font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:brightness-95">Open the editor</button>
      </header>
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-10 sm:px-7">
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl">{title}</h1>
        <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Last updated {updated}</p>
        <div className="prose-legal mt-6 space-y-5 text-sm leading-relaxed text-[hsl(var(--foreground)/.85)]">{children}</div>
      </main>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-lg text-[hsl(var(--foreground))]">{children}</h2>;
}

export function PrivacyPage() {
  return (
    <LegalShell eyebrow="Legal" title="Privacy Policy" updated="September 2026">
      <p>Sankey Studio turns spreadsheet-style data into Sankey diagrams. This page explains what happens to your data when you use it.</p>

      <H2>Your chart data, while you're working</H2>
      <p>Anything you import or paste is parsed and rendered entirely in your browser. It is never sent anywhere unless you explicitly choose to export a chart and share it (see below).</p>

      <H2>The shared gallery</H2>
      <p>When you export a chart, it's added to a public gallery visible to every visitor, so it can be reused as a starting point. This includes the chart's data, labels, title, description, styling choices, and any images you attached to it. It's stored in a database (hosted in the EU) and stays there indefinitely until removed.</p>
      <p>You can remove a chart you created from the same browser you created it in. If you're signed in (see below), you can also remove it from any device. There is no moderation queue reviewing content before it's published — anyone can flag a chart using the "Report" option, which we review manually; reporting doesn't remove a chart automatically.</p>
      <p>Do not include personal data about yourself or anyone else in a chart you share publicly.</p>

      <H2>Information kept only on your device</H2>
      <p>Your browser's local storage keeps a few small, functional identifiers: a random id proving you created a given chart (so you can delete it later), a random id used to remember which charts you've voted on or reported, and your votes/reports themselves. None of this is a real account, none of it is sold or shared with anyone, and none of it leaves your device except as part of the specific action it enables (deleting your own chart, casting a vote, filing a report).</p>

      <H2>Signing in (optional)</H2>
      <p>Signing in is optional and only unlocks one thing: keeping an export private instead of adding it to the public gallery. If you sign in, authentication is handled by Clerk, a third-party identity provider — see <a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="underline">Clerk's privacy policy</a> for what they collect (typically your email and session data). If you never sign in, no account of any kind exists for you.</p>

      <H2>No tracking</H2>
      <p>There is no analytics, no advertising, and no tracking of your activity across visits beyond the functional identifiers described above.</p>

      <H2>Children</H2>
      <p>This product isn't directed at children and isn't knowingly used to collect information from them.</p>

      <H2>Changes</H2>
      <p>If this policy changes in a meaningful way, the date above will be updated.</p>

      <H2>Contact</H2>
      <p>{CONTACT_EMAIL ? <>Questions or removal requests: <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>.</> : "A contact address for this page is being finalized."} You can also use the in-app "Report" option on any shared chart.</p>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell eyebrow="Legal" title="Terms of Use" updated="September 2026">
      <p>By using Sankey Studio, you agree to these terms. If you don't agree, please don't use it.</p>

      <H2>The service</H2>
      <p>Sankey Studio is provided free of charge, as-is, with no uptime or accuracy guarantee. There is no paid tier and no payment is ever collected.</p>

      <H2>Your content</H2>
      <p>You retain ownership of any data or images you upload. If you export a chart to the shared gallery, you're granting every visitor a license to view it and use it as a starting point for their own chart, for as long as it remains published.</p>

      <H2>Acceptable use</H2>
      <p>Don't publish content to the shared gallery that is illegal, infringes someone else's rights, contains someone else's personal data without their consent, is spam, or embeds malicious or deceptive images. We may remove content that violates this, without notice.</p>

      <H2>Reporting</H2>
      <p>Anyone can report a chart in the shared gallery for manual review. Reporting doesn't automatically remove a chart — that would make the report feature itself a way to censor charts other people simply disagree with — but flagged content is reviewed and can be taken down.</p>

      <H2>No warranty, limited liability</H2>
      <p>The service is provided "as is," without warranties of any kind. To the extent permitted by law, we aren't liable for any damages arising from your use of it, including loss of data you chose to publish publicly.</p>

      <H2>Changes</H2>
      <p>These terms may be updated from time to time; the date above reflects the latest revision.</p>

      <H2>Contact</H2>
      <p>{CONTACT_EMAIL ? <>Questions: <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>.</> : "A contact address for this page is being finalized."}</p>
    </LegalShell>
  );
}
