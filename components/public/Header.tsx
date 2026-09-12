import { getSiteSettings, getVisibleSections } from "@/lib/sections";
import { buildNavLinks } from "@/lib/nav";
import HeaderShell from "@/components/public/HeaderShell";

export default async function Header() {
  const [sections, settings] = await Promise.all([
    getVisibleSections(),
    getSiteSettings(),
  ]);
  return (
    <HeaderShell
      ctaLabel={settings.ctaButtonLabel}
      links={buildNavLinks(sections)}
    />
  );
}
