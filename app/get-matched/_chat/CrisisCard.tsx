import Link from "next/link";

import type { CrisisResources } from "@/lib/onboarding/types";

// Surfaced when the agent senses acute risk. Calm, warm, unmissable — never alarmist.
export function CrisisCard({ data }: { data: CrisisResources }) {
  return (
    <div className="rounded-2xl border border-clay/40 bg-clay/[0.06] p-4">
      <p className="text-[14px] leading-[1.6] text-charcoal">{data.note}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {data.lines.map((l) => (
          <li key={l.label} className="text-[13px] leading-[1.5]">
            <span className="font-medium text-clay">{l.label}</span>
            <span className="text-ink-soft"> — {l.detail}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/crisis"
        target="_blank"
        className="mt-3 inline-block text-[12px] text-teal underline-offset-2 hover:underline"
      >
        More support resources →
      </Link>
    </div>
  );
}
