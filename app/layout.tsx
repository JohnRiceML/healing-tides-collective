import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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

export const metadata: Metadata = {
  title: "Healing Tides Collective",
  description:
    "A modern front door to wellness — guided care matching across therapy, acupuncture, reiki, movement, and trauma-informed care.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-sand text-charcoal antialiased">{children}</body>
      <GoogleAnalytics gaId="G-EJZ1TBDT3W" />
    </html>
  );
}
