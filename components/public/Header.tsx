import { getSiteSettings, getVisibleSections } from "@/lib/sections";
import { buildNavLinks } from "@/lib/nav";
import HeaderShell from "@/components/public/HeaderShell";

export default async function Header() {
  const [sections, settings] = await Promise.all([
    getVisibleSections(),
    getSiteSettings(),
  ]);
  const name =
    [settings.heroNameLine1, settings.heroNameLine2].filter(Boolean).join(" ") ||
    "Portfolio";

  return (
    <HeaderShell
      name={name}
      ctaLabel={settings.ctaButtonLabel}
      links={buildNavLinks(sections)}
    />
  );
}
