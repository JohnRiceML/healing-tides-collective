import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CONTACT_MAILTO, SITE_URL } from "@/lib/site";
import { sanityFetch } from "@/sanity/lib/live";
import { NORA_POSTS_QUERY } from "@/sanity/lib/queries";
import { isRetiredPost } from "@/lib/retired-posts";
import { journalPresentation } from "@/lib/journal-presentation";
import { escapeJsonLd } from "@/lib/journal-seo";

export const metadata: Metadata = {
  title: "Meet Nora, Founder of Healing Tides Collective",
  description:
    "Meet Nora L. Hollenkamp, founder of Healing Tides Collective, and read why she created a warmer, more personal way to find care.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "Meet Nora, Founder of Healing Tides Collective",
    description:
      "Nora L. Hollenkamp shares why she created Healing Tides Collective: a warmer, more personal way to find care.",
    type: "profile",
    url: `${SITE_URL}/about`,
    images: [{ url: `${SITE_URL}/nora-portrait.jpg`, width: 1024, height: 1536 }],
  },
};

type NoraPost = {
  _id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  publishedAt: string | null;
};

function formatArticleDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function MeetNoraPage() {
  const { data: noraPostData } = await sanityFetch({ query: NORA_POSTS_QUERY });
  const noraPosts = (noraPostData as NoraPost[])
    .filter((post) => post.slug && !isRetiredPost(post.slug))
    .filter((post) => post.slug && journalPresentation(post.slug, post.title).authorityEligible !== false);

  const personJsonLd = escapeJsonLd(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/about#nora-hollenkamp`,
    name: "Nora L. Hollenkamp",
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/nora-portrait.jpg`,
    jobTitle: "Licensed Independent Clinical Social Worker",
    honorificSuffix: "MSW, LICSW",
    worksFor: {
      "@type": "Organization",
      name: "Healing Tides Collective",
      url: SITE_URL,
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "University of Minnesota–Twin Cities",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "St. Catherine University",
      },
    ],
    identifier: {
      "@type": "PropertyValue",
      propertyID: "Minnesota Board of Social Work license",
      value: "25149",
    },
  }));

  return (
    <main id="main-content" className="bg-sand text-charcoal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: personJsonLd }}
      />
      {/* ───── Intro ───── */}
      <section className="px-6 pt-12 md:px-16 md:pt-16">
        <div className="mx-auto max-w-[1200px]">
          <Link
            href="/"
            className="meta text-muted-ink transition-colors hover:text-charcoal"
          >
            ← Healing Tides Collective
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16 pt-12 md:px-16 md:pb-24 md:pt-20">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 md:grid-cols-[5fr_6fr] md:items-end md:gap-16">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-sand-deep">
            <Image
              src="/nora-portrait.jpg"
              alt="Nora L. Hollenkamp seated on a yoga mat beside a houseplant"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <span className="meta text-teal-ink">Founder story</span>
            <h1 className="font-display mt-6 text-[clamp(52px,9vw,128px)] leading-[0.92] tracking-[-0.035em]">
              Hi there,
              <span className="italic text-teal"> I&rsquo;m Nora.</span>
            </h1>
            <p className="font-display mt-7 text-xl text-ink-soft md:text-2xl">
              Founder of Healing Tides Collective
            </p>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.75] text-ink-soft md:text-lg">
              I&rsquo;m a Licensed Independent Clinical Social Worker with more
              than 20 years of experience working with children, adolescents,
              adults, and families&mdash;but I&rsquo;m also a human being trying
              to figure out life right alongside everyone else.
            </p>
          </div>
        </div>
      </section>

      {/* ───── Nora's background ───── */}
      <section className="px-6 md:px-16">
        <div className="mx-auto max-w-[820px] border-t border-rule pt-16 md:pt-20">
          <span className="meta text-teal-ink">How I got here</span>
          <h2 className="font-display mt-6 text-[clamp(34px,5vw,60px)] leading-[1.02] tracking-[-0.025em]">
            People, systems, and the complicated lives
            <span className="italic text-teal"> we navigate.</span>
          </h2>
          <div className="mt-10 space-y-6 text-[17px] leading-[1.75] text-ink-soft md:text-lg">
            <p>
              Professionally, my background has taken me through schools,
              hospitals, hospice care, community-based programs, and private
              therapy practice. I started my career studying Early Childhood
              Development and Child Psychology and later earned my Master of
              Social Work with a concentration in Clinical Mental Health, both
              from the University of Minnesota&ndash;Twin Cities. More recently,
              I completed my MBA at St. Catherine University, which gave me a
              new lens for thinking about people, systems, leadership, and the
              complicated lives so many of us are trying to navigate.
            </p>
          </div>
        </div>
      </section>

      {/* ───── What Nora carries from the work ───── */}
      <section className="mt-20 px-6 md:mt-28 md:px-16">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 border-t border-rule pt-16 md:grid-cols-[4fr_7fr] md:gap-20 md:pt-20">
          <div>
            <span className="meta text-teal-ink">What stays with me</span>
            <h2 className="font-display mt-6 text-[clamp(32px,4vw,48px)] leading-[1.06] tracking-[-0.025em]">
              Thank you for
              <span className="italic text-teal"> trusting me.</span>
            </h2>
          </div>
          <div className="space-y-6 text-[17px] leading-[1.75] text-ink-soft md:text-lg">
            <p>
              I care deeply about the people I work with and the partnerships
              we create throughout their healing journeys. Whenever my work
              with a therapy client comes to an end, one of the most important
              things I want to say to them is simply, <strong>thank you.</strong>{" "}
              Thank you for trusting me with your story. Thank you for showing
              up, even when it was hard. Thank you for finding strength and
              courage in moments when you weren&rsquo;t sure you had either.
            </p>
            <p>
              Being vulnerable can be scary. We live in a world where there is
              plenty of judgment, scrutiny, comparison, and negativity, and I
              know I can&rsquo;t change all of that. But what I <em>can</em> do
              is try to make finding support feel a little more human. I can
              help you find someone&mdash;or something&mdash;that feels right
              for where you are in your life right now. Something that reminds
              you that whatever you&rsquo;re going through won&rsquo;t last forever
              (for better or for worse), and that there are people who can walk
              alongside you through the harder seasons.
            </p>
          </div>
        </div>
      </section>

      {/* ───── Why Healing Tides exists ───── */}
      <section className="mt-20 px-6 md:mt-28 md:px-16">
        <div className="mx-auto max-w-[820px] border-t border-rule pt-16 md:pt-20">
          <span className="meta text-teal-ink">Why I started the Collective</span>
          <h2 className="font-display mt-6 text-[clamp(34px,5vw,60px)] leading-[1.02] tracking-[-0.025em]">
            Healing Tides is about
            <span className="italic text-teal"> connection.</span>
          </h2>
          <div className="mt-10 space-y-6 text-[17px] leading-[1.75] text-ink-soft md:text-lg">
            <p>
              That belief is a big part of why I created Healing Tides
              Collective. I didn&rsquo;t want to build just another directory
              with a long list of names and profiles for you to sort through.
              You absolutely can browse our practitioners whenever you&rsquo;d
              like, but if you don&rsquo;t know where to begin, you don&rsquo;t have
              to figure it out alone.
            </p>
            <p>
              Healing Tides is about <strong>connection</strong>. Tell us a
              little about yourself, what you&rsquo;re going through, and what
              you&rsquo;re looking for&mdash;even if you&rsquo;re not entirely sure
              yet. From there, we can help connect you directly with a
              practitioner through a warm handoff between trusted partners.
              You&rsquo;ll receive a personal introduction to someone who may
              be a good fit, along with suggestions for other practitioners or
              types of care you may not have considered before.
            </p>
            <p>
              Maybe that&rsquo;s a therapist. Maybe it&rsquo;s acupuncture, Reiki,
              massage, yoga, nutrition, meditation, or another form of support.
              Maybe it&rsquo;s a combination. Healing doesn&rsquo;t have to look the
              same for everyone, and what you need today may be completely
              different from what you need a year from now.
            </p>
            <p>
              And this service is free to you, the client. All we ask for is a
              little bit of trust. Trust us with a small piece of your story,
              and we&rsquo;ll help you explore what support might look like from
              here.
            </p>
            <p>
              You don&rsquo;t need to know exactly what kind of practitioner you
              need. You don&rsquo;t need to know the right modality, have the
              perfect words, or even be able to explain exactly what feels off.
              Maybe you already know what you&rsquo;re looking for, or maybe you
              just know that something needs to feel different. Either way, you
              can start there.
            </p>
            <p>
              Healing Tides was created to make that next step feel a little
              warmer, a little more personal, and a lot less overwhelming.
              We&rsquo;ll help connect you with people and possibilities that
              make sense for where you are right now&mdash;and hopefully remind
              you that you don&rsquo;t have to navigate every season on your own.
            </p>
          </div>
          <p className="font-display mt-14 border-l border-teal pl-6 text-[clamp(28px,4vw,44px)] leading-[1.12] tracking-[-0.02em] text-charcoal md:pl-8">
            Come as you are. We&rsquo;ll help you figure out
            <span className="italic text-teal"> where to go from here.</span>
          </p>
        </div>
      </section>

      {/* ───── Endorsement ───── */}
      <section className="mt-20 px-6 md:mt-28 md:px-16">
        <div className="mx-auto max-w-[820px] border-t border-rule pt-16 md:pt-20">
          <span className="meta text-teal-ink">An endorsement</span>
          <blockquote className="font-display mt-8 text-[clamp(24px,3.5vw,40px)] leading-[1.2] tracking-[-0.015em] text-charcoal">
            “An exceptional therapist who is knowledgeable, honest, and one of
            the kindest people I know. She creates an environment that is
            comforting, free from judgement, and{" "}
            <span className="italic text-teal">safe for all.</span>”
          </blockquote>
          <p className="meta mt-8 text-muted-ink">
            Shari L. Marik-Roach, LICSW
          </p>
        </div>
      </section>

      {/* ───── Writing ───── */}
      <section className="mt-20 px-6 md:mt-28 md:px-16">
        <div className="mx-auto max-w-[1200px] border-t border-rule pt-16 md:pt-20">
          <div className="grid gap-8 md:grid-cols-[4fr_7fr] md:gap-20">
            <div>
              <span className="meta text-teal-ink">Writing by Nora</span>
              <h2 className="font-display mt-6 text-[clamp(34px,5vw,60px)] leading-[1.02] tracking-[-0.025em]">
                Notes from practice and
                <span className="italic text-teal"> lived experience.</span>
              </h2>
              <p className="mt-6 text-[16px] leading-[1.7] text-ink-soft md:text-lg">
                Nora writes in the first person about finding care, therapist
                support, anxiety, and the mind-body connection. These articles
                are educational reflections—not diagnosis or individualized
                clinical advice.
              </p>
            </div>

            <div className="border-t border-rule md:border-t-0">
              {noraPosts.length > 0 ? (
                <ol className="divide-y divide-rule">
                  {noraPosts.map((post) => {
                    if (!post.slug) return null;
                    const presentation = journalPresentation(post.slug, post.title);
                    return (
                      <li key={post._id}>
                        <Link
                          href={`/journal/${post.slug}`}
                          className="group grid gap-3 py-7 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
                        >
                          <span className="font-display text-[clamp(22px,2.6vw,30px)] leading-[1.15] tracking-[-0.015em] transition-colors group-hover:text-ocean">
                            {presentation.title}
                          </span>
                          <span className="meta whitespace-nowrap text-muted-ink">
                            {formatArticleDate(post.publishedAt)} →
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="py-7 text-[16px] leading-[1.7] text-muted-ink">
                  Nora&rsquo;s writing is available in the Journal.
                </p>
              )}
              <Link
                href="/journal"
                className="meta mt-8 inline-flex text-charcoal underline decoration-charcoal/25 underline-offset-4 hover:decoration-charcoal"
              >
                Explore the Journal →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="mt-24 px-6 pb-20 md:mt-32 md:px-16 md:pb-28">
        <div className="mx-auto max-w-[820px] border-t border-rule pt-16 text-center md:pt-20">
          <span className="meta text-teal-ink">Let&rsquo;s connect</span>
          <h2 className="font-display mt-6 text-[clamp(36px,6vw,72px)] leading-[0.96] tracking-[-0.025em]">
            A free fifteen-minute
            <br />
            <span className="italic text-teal">consultation.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-md text-base leading-[1.7] text-ink-soft md:text-lg">
            Reach out and we&rsquo;ll see if it feels like a fit. No forms, no
            theatre — a real conversation.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+16513863520"
              className="group inline-flex items-center gap-3 rounded-full bg-charcoal px-6 py-3.5 text-sand shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
            >
              <span className="meta">(651) 386 3520</span>
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center rounded-full bg-sand/15 text-[11px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
            <a
              href={`${CONTACT_MAILTO}?subject=Consultation%20with%20Nora`}
              className="group inline-flex items-center gap-3 rounded-full border border-charcoal/25 px-6 py-3.5 text-charcoal transition-colors hover:border-charcoal/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
            >
              <span className="meta">Email Nora</span>
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/10 text-[11px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
