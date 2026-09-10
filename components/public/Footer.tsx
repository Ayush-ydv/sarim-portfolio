import { getSiteSettings } from "@/lib/sections";

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {settings.email} · {settings.phone}
        </p>
        <div className="flex gap-5 text-xs uppercase tracking-[0.18em] text-muted">
          {settings.instagramUrl && (
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Instagram
            </a>
          )}
          {settings.vimeoUrl && (
            <a
              href={settings.vimeoUrl}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Vimeo
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
