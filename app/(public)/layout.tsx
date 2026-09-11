import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import MotionProvider from "@/components/motion/MotionProvider";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { getSiteSettings } from "@/lib/sections";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name =
    [settings.heroNameLine1, settings.heroNameLine2].filter(Boolean).join(" ") ||
    "Portfolio";

  return {
    title: {
      default: settings.heroTagline ? `${name} — ${settings.heroTagline}` : name,
      template: `%s — ${name}`,
    },
    description: settings.bioText.slice(0, 160),
  };
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <div id="top" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-foreground focus:px-5 focus:py-3 focus:text-sm focus:text-background"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      {/* Scroll reveals start hidden until JS runs; without JS, show everything. */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>
    </MotionProvider>
  );
}
