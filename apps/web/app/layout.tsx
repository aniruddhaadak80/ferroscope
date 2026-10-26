import { Noise, ScrollProgress } from "@ferroscope/ui";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { CommandPalette } from "@/components/command-palette";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import { Providers } from "./providers";

/**
 * Fonts are vendored into `apps/web/fonts` (see `scripts/vendor-fonts.mjs`) so
 * `next build` never reaches out to fonts.googleapis.com. All three families
 * ship under the SIL Open Font License 1.1.
 */
const manrope = localFont({
  src: "../fonts/manrope-latin.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
});

const instrument = localFont({
  src: [
    { path: "../fonts/instrument-serif-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = localFont({
  src: "../fonts/jetbrains-mono-latin.woff2",
  weight: "100 800",
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ferroscope.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ferroscope — Map your blast radius before the breach does",
    template: "%s · Ferroscope",
  },
  description:
    "A deterministic exposure observatory for the post-Black-October internet. Declare your stack, see which of 27 incidents actually touch you, simulate the cascade, and rank the fixes by risk removed per minute.",
  applicationName: "Ferroscope",
  keywords: [
    "cybersecurity",
    "threat intelligence",
    "exposure management",
    "blast radius",
    "supply chain security",
    "incident response",
    "next.js",
  ],
  authors: [{ name: "Aniruddha Adak", url: "https://github.com/aniruddhaadak80" }],
  creator: "Aniruddha Adak",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Ferroscope",
    title: "Ferroscope — Map your blast radius",
    description:
      "27 incidents. One personal blast-radius map. Deterministic, offline, zero API keys.",
    images: [{ url: "/og", width: 1200, height: 630, alt: "Ferroscope" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferroscope — Map your blast radius",
    description: "A personal exposure observatory for the post-Black-October internet.",
    images: ["/og"],
    creator: "@asi369_",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2eee4" },
    { media: "(prefers-color-scheme: dark)", color: "#08090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${instrument.variable} ${jetbrains.variable} min-h-screen font-sans antialiased`}
      >
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:border focus:border-amber focus:bg-surface focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-ink"
          >
            Skip to content
          </a>
          <ScrollProgress />
          <Noise />
          <SiteHeader />
          <CommandPalette />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
