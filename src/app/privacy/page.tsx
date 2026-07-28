import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold">How chnnl protects your privacy</h1>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Your organisation never sees your name next to your data</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Every check-in, assessment, survey response, Speak Up report and challenge entry you submit is stored
          against a private, pseudonymous code — never your name or email. Your leaders, HR, Health &amp; Safety
          team and executives only ever see aggregated, de-identified data: scores, trends and patterns across
          groups of people, never an individual result tied to who you are.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Small groups are protected too — if a filter (like one team at one location) would narrow a view down to
          only a handful of people, that view is hidden rather than shown, because a small enough group can be
          identifying even without a name attached.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Where your name is actually stored</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your name and email are kept in a separate, restricted system used only to let you sign in — it is not
          connected to your wellbeing data in any way that your organisation&apos;s leaders can query, browse or
          correlate.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">The one exception: genuine safety situations</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          chnnl (not your employer) maintains a separate, tightly controlled process that can, in rare
          circumstances, re-identify who a piece of data belongs to — for example, if a Speak Up report or check-in
          pattern suggests an imminent risk of harm to you or someone else. This is not a routine feature: it
          requires a documented reason, approval from a second, independent member of chnnl&apos;s safety staff, is
          time-limited once granted, and is fully logged. Your employer does not automatically gain access to your
          identity even when this process is used — any further step involving your organisation is a separate,
          explicit process, and wherever possible happens with your knowledge.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">In short</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your organisation cannot see who you are from your wellbeing data — full stop, under any role. chnnl
          itself can, only through the controlled safety process above, only when there&apos;s a genuine indication
          you or someone else may be at risk of harm.
        </p>
      </section>
    </div>
  );
}
