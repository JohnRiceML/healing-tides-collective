import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SanityLive } from "@/sanity/lib/live";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { AccountButton } from "@/app/_components/account-button";
import { SITE_URL } from "@/lib/site";
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
  "A modern front door to wellness — guided care matching across therapy, acupuncture, reiki, movement, and trauma-informed care.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Healing Tides Collective",
  description: DESCRIPTION,
  openGraph: {
    title: "Healing Tides Collective",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Healing Tides Collective",
    images: [{ url: `${SITE_URL}/og.jpg`, width: 1200, height: 630, alt: "Healing Tides Collective" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Healing Tides Collective",
    description: DESCRIPTION,
    images: [`${SITE_URL}/og.jpg`],
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
        {clerkEnabled ? (
          <ClerkProvider>
            {children}
            {/* Account menu — only for signed-in users (the persistent
                "manage account / sign out" affordance). */}
            <AccountButton />
            <SanityLive />
          </ClerkProvider>
        ) : (
          <>
            {children}
            <SanityLive />
          </>
        )}
      </body>
      <GoogleAnalytics gaId="G-EJZ1TBDT3W" />
    </html>
  );
}
