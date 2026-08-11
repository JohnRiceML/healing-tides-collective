import Link from 'next/link'

import {isFirstCallWorksheetRelevant} from '@/lib/journal-presentation'

export function JournalCompanion({slug}: {slug: string}) {
  if (!isFirstCallWorksheetRelevant(slug)) return null

  return (
    <aside className="mx-auto max-w-2xl px-6 pb-16 md:px-10 md:pb-20" aria-label="Prepare for a first therapist call">
      <div className="grid gap-6 rounded-[2rem] border border-rule/80 bg-seafoam/30 p-7 md:grid-cols-[1fr_auto] md:items-end md:p-9">
        <div>
          <p className="meta text-teal-ink">When you find someone to call</p>
          <h2 className="font-display mt-4 text-[clamp(25px,3vw,34px)] leading-[1.1] tracking-[-0.02em] text-charcoal">
            Take three useful questions with you.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-ink-soft">
            Build a private, printable call card without turning the conversation into an interview
            or scoring a therapist.
          </p>
        </div>
        <Link
          href="/resources/first-therapist-call-worksheet"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-charcoal px-5 py-3 text-[14px] font-medium text-sand transition-colors hover:bg-charcoal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-seafoam"
        >
          prepare for the call
        </Link>
      </div>
    </aside>
  )
}
