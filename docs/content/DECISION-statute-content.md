# Recommendation: stop generating statute-restating content

**2026-07-29.** After two full generate → audit → repair → re-audit rounds on five Minnesota journal
articles. Evidence in [drafts/AUDIT-FINDINGS.md](drafts/AUDIT-FINDINGS.md).

## What happened

| | round 1 | round 2 (after repair, fresh auditors) |
|---|---|---|
| drafts passing | **0 of 5** | **0 of 5** |
| issues found | 39 fabrications, 37 uncited claims | 7 critical, 31 major, 29 minor |

Round 2's auditors had not seen round 1's findings, and **they found critical errors round 1 missed.**
That is the important result. The errors are not converging. Each draft carries dozens of statutory
claims, and every claim is a fresh chance to drop a condition — so each audit pass surfaces a
different subset rather than closing the set.

## The failure mode

Almost never a made-up fact. Overwhelmingly: **a real statute, quoted verbatim, with a qualifier
silently dropped**, so a conditional right reads as unconditional. It looks impeccably sourced. It is
invisible without fetching the statute and reading the surrounding subdivisions.

The three that should end the argument:

- **MinnesotaCare eligibility for undocumented adults.** The draft cited § 256L.04 subd. 10(b)
  accurately and omitted subd. 10(c), which limited enrollment to those enrolled as of 2025-06-15 and
  made undocumented adults ineligible from 2026-01-01. The most vulnerable possible reader, given the
  most harmful possible wrong answer, in confident prose with a working citation.
- **Duty to warn.** A draft asserted no Minnesota duty-to-warn provision was found for social
  workers. § 148E.240 subd. 6: "A licensee must comply with the duty to warn established by section
  148.975." It was wrong about **the byline clinician's own license.**
- **Telehealth parity cited to Medical Assistance readers.** § 62A.673 subd. 8 excludes chapter 256B
  and 256L enrollees — the exact population that article spends a section helping qualify.

## Why more rounds won't fix it

A third repair round would find new errors, because that is what round 2 did. The cost is real
(~2.5M tokens for zero publishable output), but cost isn't the argument — **the argument is that we
cannot demonstrate convergence**, so we could never honestly tell Nora "this one is clean." Signing a
licensed clinician's name to statutory guidance we can't verify is the same category of error as the
fabricated bylines, arrived at more carefully.

## The one signal worth keeping

The telehealth draft scored **0 critical** and drew praise from its auditor, which verified every
subdivision pointer, checked the 2026 session for amendments, and confirmed HF 2435 died in
conference. It also used the **fewest sources: 15, against 43** for the worst performer.

**Risk scales with the number of distinct legal claims, not with length.** One statute, read
properly, is tractable. Twelve statutes woven into a consumer guide is not.

## Recommendation

1. **Don't publish any of the five.** Keep them as reference; mark them not publishable.
2. **Stop generating content whose value is restating Minnesota law.** Making it safe needs a
   Minnesota healthcare attorney, not another audit loop — a real cost, and hard to justify for a
   directory.
3. **Move the content engine to where Nora is the primary source.** Her seven existing posts are
   exactly this: experiential, clinical, first-person by the actual clinician. That content cannot be
   fabricated because she writes it, it carries no statutory surface, and it is the real E-E-A-T
   advantage. A national competitor can restate a statute; nobody else has her practice.
4. **For the money and coverage questions readers genuinely have, route rather than restate.** Short
   pages that name the question and hand off to the authority — MDH, Commerce, DHS, the plan's own
   member services — with phone numbers and links. Near-zero claim surface, still useful, still ranks
   for the long tail. "Here is who actually has to answer this, and what to ask them" is honest, and
   it's what the phone script in the research doc already does well.
5. **Keep [mn-insurance-research.md](mn-insurance-research.md) as Nora's reference**, not as article
   copy. It's the strongest artifact from this whole effort — verified, source-tagged, gated — and its
   value is as a briefing document for a clinician, not as prose for readers.

## What this cost, honestly

25 agents, ~2.5M tokens, no publishable output. But it bought a real answer to "can we generate
Minnesota legal content safely under a clinician's byline," and the answer is no. Finding that with
two audit rounds is dramatically cheaper than finding it after publication — which, on this site, is
how it was found last time.
