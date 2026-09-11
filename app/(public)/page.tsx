import { Fragment } from "react";
import {
  getFeaturedWork,
  getSiteSettings,
  getWorkCategories,
} from "@/lib/sections";
import { cleanHomeBlocks, type HomeBlockKey } from "@/lib/homeBlocks";
import Hero from "@/components/public/Hero";
import BrandMarquee from "@/components/public/BrandMarquee";
import FeaturedWork from "@/components/public/FeaturedWork";
import Summary from "@/components/public/Summary";
import QuickLinksGrid from "@/components/public/QuickLinksGrid";
import StatsBand from "@/components/public/StatsBand";
import Philosophy from "@/components/public/Philosophy";
import ServicesGrid from "@/components/public/ServicesGrid";
import CtaBand from "@/components/public/CtaBand";

// The hero is always first and the contact band always last; everything in
// between is chosen and ordered in admin via SiteSettings.homeBlocks.
export default async function HomePage() {
  const [settings, featured, categories] = await Promise.all([
    getSiteSettings(),
    getFeaturedWork(),
    getWorkCategories(),
  ]);
  const name = [settings.heroNameLine1, settings.heroNameLine2]
    .filter(Boolean)
    .join(" ");

  function renderBlock(key: HomeBlockKey) {
    switch (key) {
      case "brands":
        return <BrandMarquee brands={settings.brands} />;
      case "work":
        return <FeaturedWork items={featured} />;
      case "summary":
        return (
          <Summary
            name={name}
            bioText={settings.bioText}
            bioImageUrl={settings.bioImageUrl}
          />
        );
      case "quickLinks":
        return <QuickLinksGrid links={settings.quickLinks} />;
      case "stats":
        return <StatsBand stats={settings.stats} />;
      case "philosophy":
        return <Philosophy text={settings.philosophyText} />;
      case "services":
        return (
          <ServicesGrid
            heading={settings.servicesHeading}
            services={settings.services}
          />
        );
    }
  }

  return (
    <>
      <Hero
        nameLine1={settings.heroNameLine1}
        nameLine2={settings.heroNameLine2}
        tagline={settings.heroTagline}
        imageUrl={settings.heroImageUrl}
        workHref={categories.length > 0 ? "/work" : "#contact"}
        ctaLabel={settings.ctaButtonLabel}
      />

      <div id="explore" className="scroll-mt-20">
        {cleanHomeBlocks(settings.homeBlocks).map((key) => (
          <Fragment key={key}>{renderBlock(key)}</Fragment>
        ))}
      </div>

      <CtaBand
        text={settings.ctaText}
        email={settings.email}
        buttonLabel={settings.ctaButtonLabel}
      />
    </>
  );
}
