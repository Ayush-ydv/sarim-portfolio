import { getSiteSettings } from "@/lib/sections";
import { cleanHomeBlocks, type HomeBlockKey } from "@/lib/homeBlocks";
import HomeLayoutEditor from "@/components/admin/HomeLayoutEditor";
import HomeSettingsForm from "@/components/admin/HomeSettingsForm";
import BrandsEditor from "@/components/admin/BrandsEditor";
import QuickLinksEditor from "@/components/admin/QuickLinksEditor";
import StatsEditor from "@/components/admin/StatsEditor";
import ServicesEditor from "@/components/admin/ServicesEditor";

function SectionHeading({
  title,
  description,
  hidden,
}: {
  title: string;
  description: string;
  hidden?: boolean;
}) {
  return (
    <div>
      <h2 className="font-display text-xl text-foreground">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      {hidden && (
        <p className="mt-2 inline-block rounded-full bg-sun/60 px-3 py-1 text-xs text-foreground">
          Hidden on the homepage — switch it on in Homepage layout above.
        </p>
      )}
    </div>
  );
}

export default async function AdminHomePage() {
  const settings = await getSiteSettings();
  const blocks = cleanHomeBlocks(settings.homeBlocks);
  const isHidden = (key: HomeBlockKey) => !blocks.includes(key);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-2xl text-foreground">Home settings</h1>
        <p className="mt-1 text-sm text-muted">
          Which blocks the homepage shows, in what order, and what they say.
        </p>
      </div>

      <SectionHeading
        title="Homepage layout"
        description="The intro always comes first and contact always last. Switch the blocks in between on or off, and drag to reorder."
      />
      <HomeLayoutEditor blocks={blocks} />

      <SectionHeading
        title="Intro & text"
        description="Hero name, tagline and media, plus the bio, philosophy and contact-band text."
      />
      <HomeSettingsForm settings={settings} />

      <SectionHeading
        title="Brands"
        description="Scroll continuously to the left under the intro. Upload a logo (a transparent PNG or SVG works best), or leave it empty to show the name in type."
        hidden={isHidden("brands")}
      />
      <BrandsEditor brands={settings.brands} />

      <SectionHeading
        title="Selected work"
        description="Tick “Show on homepage” on any project under Sections → your Work categories. Until you tick some, the first project of each category is shown."
        hidden={isHidden("work")}
      />

      <SectionHeading
        title="Stats band"
        description="Big numbers shown in the dark band, e.g. “6+ / Years editing”. Numbers count up as they scroll into view."
        hidden={isHidden("stats")}
      />
      <StatsEditor stats={settings.stats} />

      <SectionHeading
        title="Services"
        description="The “What I do” cards."
        hidden={isHidden("services")}
      />
      <ServicesEditor services={settings.services} />

      <SectionHeading
        title="Quick links"
        description="The grid of press/work links shown on the homepage."
        hidden={isHidden("quickLinks")}
      />
      <QuickLinksEditor links={settings.quickLinks} />
    </div>
  );
}
