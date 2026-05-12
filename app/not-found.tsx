import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { photos } from "@/app/_lib/images";

export const metadata: Metadata = {
  title: "Page not found — Healing Tides Collective",
  description: "The page you were looking for isn't here.",
};

export default function NotFound() {
  const photo = photos.sunsetWalk;
  return (
    <main
      id="main-content"
      className="relative flex min-h-[100dvh] flex-col bg-charcoal text-sand"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src={photo.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/65" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 30%, rgba(31,58,95,0.35) 0%, transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      <header className="relative z-10 px-6 py-8 md:px-16">
        <Link
          href="/"
          className="meta inline-flex items-center gap-2 text-sand/70 transition-colors hover:text-sand"
        >
          Healing Tides Collective
        </Link>
      </header>

      <section className="relative z-10 flex flex-1 items-center px-6 md:px-16">
        <div className="mx-auto w-full max-w-[1100px]">
          <span className="meta text-seafoam/90">404 / Not found</span>
          <h1 className="font-display mt-6 text-[clamp(48px,9vw,128px)] leading-[0.92] tracking-[-0.035em] text-sand">
            This one drifted
            <br />
            <span className="italic text-seafoam">out with the tide.</span>
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.7] text-sand/85 md:text-lg">
            The page you were looking for isn&rsquo;t here. A moved link, a
            mistyped URL, or something we&rsquo;ve since taken down. Nothing to
            worry about — let&rsquo;s find you a way back.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="group relative inline-flex items-center gap-3 rounded-full bg-seafoam px-6 py-3.5 text-charcoal shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            >
              <span className="meta">Return home</span>
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/10 text-[11px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>

            <Link
              href="/journal"
              className="group inline-flex items-center gap-3 rounded-full border border-sand/35 bg-charcoal/40 px-6 py-3.5 text-sand backdrop-blur-md transition-colors hover:border-sand/70 hover:bg-charcoal/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seafoam focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            >
              <span className="meta">Read the journal</span>
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center rounded-full bg-sand/10 text-[11px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 py-8 md:px-16">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4">
          <p className="meta text-sand/55">
            or write to{" "}
            <a
              href="mailto:hello@healingtides.co"
              className="text-seafoam underline-offset-4 hover:underline"
            >
              hello@healingtides.co
            </a>
          </p>
          <p className="meta text-sand/55">© 2026 / Care, matched. By a person.</p>
        </div>
      </footer>
    </main>
  );
}
