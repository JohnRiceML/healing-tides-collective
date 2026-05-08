import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SanityLive } from "@/sanity/lib/live";
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
  title: "Healing Tides Collective",
  description: DESCRIPTION,
  openGraph: {
    title: "Healing Tides Collective",
    description: DESCRIPTION,
    url: "https://healingtides.co",
    siteName: "Healing Tides Collective",
    images: [{ url: "https://healingtides.co/og.jpg", width: 1200, height: 630, alt: "Healing Tides Collective" }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Healing Tides Collective",
    description: DESCRIPTION,
    images: ["https://healingtides.co/og.jpg"],
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
        {children}
        <SanityLive />
      </body>
      <GoogleAnalytics gaId="G-EJZ1TBDT3W" />
    </html>
  );
}
