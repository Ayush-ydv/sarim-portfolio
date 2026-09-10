import { getSiteSettings } from "@/lib/sections";
import HomeSettingsForm from "@/components/admin/HomeSettingsForm";
import QuickLinksEditor from "@/components/admin/QuickLinksEditor";

export default async function AdminHomePage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-2xl text-foreground">
          Home settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Hero, bio, philosophy, and CTA shown on the homepage.
        </p>
      </div>
      <HomeSettingsForm settings={settings} />
      <div>
        <h2 className="font-display text-xl text-foreground">Quick links</h2>
        <p className="mt-1 text-sm text-muted">
          The grid of press/work links shown on the homepage.
        </p>
      </div>
      <QuickLinksEditor links={settings.quickLinks} />
    </div>
  );
}
