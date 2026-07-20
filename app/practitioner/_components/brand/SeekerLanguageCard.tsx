import type { SeekerLanguage } from "@/lib/seeker-language";

/**
 * "What the right people near you are searching" — the brand center's understanding surface,
 * built entirely from data we already fetch (Google "people also ask" + "related searches" +
 * the phrases they appear for), persisted so it's here on every visit.
 *
 * Three calm reads: the phrases they show up for, the real questions seekers carry, and the
 * words seekers type — the words their OWN bio already uses are softly shaded so they can SEE
 * the overlap. No scores, no ranking, no pass/fail: a word that isn't shaded is simply one more
 * seeker uses, an invitation to consider — never a task or a deficit.
 */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="meta text-ink-muted">{children}</p>;
}

export function SeekerLanguageCard({
  lang,
  lastCheckedLabel,
}: {
  lang: SeekerLanguage;
  lastCheckedLabel?: string;
}) {
  if (!lang.hasData) {
    return (
      <div className="rounded-3xl border border-rule/70 bg-white p-6 md:p-7">
        <p className="font-display text-[18px] leading-[1.3] text-charcoal">
          What the right people near you are searching
        </p>
        <p className="mt-2 max-w-xl text-[14.5px] leading-[1.65] text-ink-soft">
          Whenever you&rsquo;re curious, you can run a visibility check in{" "}
          <span className="text-charcoal">Where you&rsquo;re found</span> below. Then this fills
          with the real questions and the exact words the right people near you use — a quiet window
          into how someone looks for care like yours. No rush.
        </p>
      </div>
    );
  }

  const showingUpFor = lang.showingUpFor.slice(0, 5);
  const questions = lang.questions.slice(0, 4);
  const words = lang.words.slice(0, 8);

  return (
    <div className="rounded-3xl border border-rule/70 bg-white p-6 md:p-7">
      <p className="font-display text-[19px] leading-[1.3] tracking-[-0.01em] text-charcoal">
        What the right people near you are searching
      </p>
      <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-ink-soft">
        The real words and questions seekers near you type into Google. None of this is a score —
        it&rsquo;s a window into how the right person looks for care like yours.
      </p>
      {lastCheckedLabel ? (
        <p className="mt-1 text-[12.5px] text-ink-muted">Based on your last check, {lastCheckedLabel}.</p>
      ) : null}

      {/* 1) Exact phrases they already appear for */}
      {showingUpFor.length ? (
        <div className="mt-6">
          <SectionLabel>You already show up when someone searches</SectionLabel>
          <ul className="mt-3 space-y-2">
            {showingUpFor.map((phrase) => (
              <li key={phrase} className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-charcoal">
                <span aria-hidden className="mt-[7px] inline-block h-2 w-2 shrink-0 rounded-full bg-teal" />
                <span>&ldquo;{phrase}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* 2) The real questions seekers carry (PAA) — a window into their worries, not a task list */}
      {questions.length ? (
        <div className="mt-6 rounded-2xl bg-seafoam/30 p-5">
          <SectionLabel>What seekers near you are wondering about</SectionLabel>
          <ul className="mt-3 space-y-2.5">
            {questions.map((q) => (
              <li key={q} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-charcoal">
                <span aria-hidden className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] leading-[1.55] text-ink-soft">
            These are real worries people carry as they search. Reading them is its own kind of
            knowing — and if one is something you hold space for, a few gentle words about it can
            meet a seeker right where they are.
          </p>
        </div>
      ) : null}

      {/* 3) The words seekers use — the ones their own bio echoes are softly shaded */}
      {words.length ? (
        <div className="mt-6">
          <SectionLabel>The words seekers use for care like yours</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {words.map(({ term, echoed }) => (
              <span
                key={term}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12.5px] leading-none ${
                  echoed
                    ? "bg-seafoam/60 text-ocean"
                    : "border border-rule/80 bg-white text-ink-soft"
                }`}
              >
                {term}
              </span>
            ))}
          </div>
          <p className="mt-3 max-w-2xl text-[13px] leading-[1.55] text-ink-soft">
            The shaded ones already live in your words — when your language meets a seeker&rsquo;s,
            the right person recognizes you. The rest are simply other words seekers use; if any
            feels true to how you work, it might find a place in your bio someday. No rush, and only
            ever in your own voice.
          </p>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-[1.55] text-ink-muted">
            It helps in a quiet, practical way too: search engines match what a seeker types with the
            words on your page, so naturally using the same language helps the right person find you.
          </p>
        </div>
      ) : null}
    </div>
  );
}
