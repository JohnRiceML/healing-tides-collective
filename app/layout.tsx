import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SanityLive } from "@/sanity/lib/live";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { AccountButton } from "@/app/_components/account-button";
import { FeedbackWidget } from "@/app/_components/FeedbackWidget";
import { SiteNav } from "@/app/_components/site-nav";
import { SiteFooter } from "@/app/_components/site-footer";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const DESCRIPTION =
  "Human-guided care matching across Minnesota — therapy, acupuncture, reiki, movement, and trauma-informed support, with a real person helping narrow the fit.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Healing Tides Collective — Minnesota care, matched by a person",
  description: DESCRIPTION,
  openGraph: {
    title: "Healing Tides Collective — Minnesota care, matched by a person",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Healing Tides Collective",
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Healing Tides Collective" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Healing Tides Collective — Minnesota care, matched by a person",
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
  // Site-ownership verification. Renders as a <meta> tag in <head> on every page, which is what
  // these engines want — they re-check periodically, so removing it later un-verifies the property.
  // Public by design: the token proves control of the site and grants nothing on its own.
  verification: {
    other: {
      "msvalidate.01": "1DF1B00F0F3CE6A56165EFB14B354430", // Bing Webmaster Tools
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-sand text-charcoal antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-charcoal focus:px-5 focus:py-3 focus:text-sm focus:text-sand focus:shadow-lg"
        >
          Skip to content
        </a>
        {/* Site-wide Organization identity for search + AI assistants. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Healing Tides Collective",
              url: SITE_URL,
              logo: `${SITE_URL}/healing-tides-logo.png`,
              email: CONTACT_EMAIL,
              description: DESCRIPTION,
              areaServed: { "@type": "State", name: "Minnesota" },
            }).replace(/</g, "\\u003c"),
          }}
        />
        {clerkEnabled ? (
          <ClerkProvider>
            <SiteNav clerkEnabled />
            {children}
            <SiteFooter />
            {/* Landing-only account menu — SiteNav carries account access everywhere else. */}
            <AccountButton />
            <SanityLive />
          </ClerkProvider>
        ) : (
          <>
            <SiteNav clerkEnabled={false} />
            {children}
            <SiteFooter />
            <SanityLive />
          </>
        )}
        <FeedbackWidget />
      </body>
      <GoogleAnalytics gaId="G-EJZ1TBDT3W" />
    </html>
  );
}
