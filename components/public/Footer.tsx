import Link from "next/link";
import { getSiteSettings, getVisibleSections } from "@/lib/sections";

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <p className="label-caps text-muted">{title}</p>
      <ul className="mt-5 flex flex-col gap-3 text-sm text-foreground">
        {children}
      </ul>
    </div>
  );
}

export default async function Footer() {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getVisibleSections(),
  ]);
  const name = [settings.heroNameLine1, settings.heroNameLine2]
    .filter(Boolean)
    .join(" ");
  const socials = [
    settings.instagramUrl && { label: "Instagram", href: settings.instagramUrl },
    settings.vimeoUrl && { label: "Vimeo", href: settings.vimeoUrl },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="mt-auto">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-20">
        <div className="grid gap-12 border-t border-foreground pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-h2 text-foreground">{name}</p>
            {settings.heroTagline && (
              <p className="label-caps mt-4 text-muted">{settings.heroTagline}</p>
            )}
          </div>

          <FooterColumn title="Pages" className="md:col-span-2">
            <li>
              <Link href="/" className="link-sweep">
                Home
              </Link>
            </li>
            {sections.map((section) => (
              <li key={section.id}>
                <Link href={`/${section.slug}`} className="link-sweep">
                  {section.navLabel}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Contact" className="md:col-span-3">
            <li>
              <a href={`mailto:${settings.email}`} className="link-sweep">
                {settings.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="link-sweep"
              >
                {settings.phone}
              </a>
            </li>
          </FooterColumn>

          {socials.length > 0 && (
            <FooterColumn title="Elsewhere" className="md:col-span-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-sweep"
                  >
                    {social.label} ↗
                  </a>
                </li>
              ))}
            </FooterColumn>
          )}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 text-[0.7rem] uppercase tracking-[0.2em] text-muted">
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <a href="#top" className="link-sweep transition-colors hover:text-foreground">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
