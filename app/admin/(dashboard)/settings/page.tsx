import { getSiteSettings } from "@/lib/sections";
import ContactSettingsForm from "@/components/admin/ContactSettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Contact info and social links shown in the site footer.
        </p>
      </div>
      <ContactSettingsForm settings={settings} />
    </div>
  );
}
