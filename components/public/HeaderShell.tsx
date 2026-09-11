"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { NavLink } from "@/lib/nav";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HeaderShell({
  name,
  links,
  ctaLabel,
}: {
  name: string;
  links: NavLink[];
  ctaLabel: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const isActive = (link: NavLink) => link.match.includes(pathname);
  const mobileLinks: NavLink[] = [{ href: "/", label: "Home", match: ["/"] }, ...links];

  // While the menu is open the header sits transparently on top of the
  // overlay so the name and close button stay visible.
  const headerState = menuOpen
    ? "z-[70] bg-transparent py-6"
    : scrolled
      ? "z-50 bg-background/85 py-3 shadow-[0_1px_0_var(--rule),0_12px_40px_-24px_rgb(23_22_20/0.35)] backdrop-blur-md"
      : "z-50 bg-background py-6";

  return (
    <>
      <header
        className={`sticky top-0 transition-[background-color,box-shadow,padding] duration-500 ease-out-expo ${headerState}`}
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto] items-center gap-6 px-6 md:grid-cols-[1fr_auto_1fr] md:px-12">
          <Link
            href="/"
            onClick={closeMenu}
            className="justify-self-start font-display text-xl tracking-tight text-foreground"
          >
            {name}
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {links.map((link) => {
                const active = isActive(link);
                return (
                  <li key={link.href} className="relative">
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`link-sweep text-[0.72rem] font-medium uppercase tracking-[0.2em] transition-colors ${
                        active
                          ? "text-foreground"
                          : "text-foreground/65 hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        aria-hidden
                        className="absolute -bottom-2.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-foreground"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3 justify-self-end">
            <div className="hidden sm:block">
              <Link
                href="/#contact"
                className="btn-pill px-5 py-2.5 hover:bg-foreground hover:text-background"
              >
                {ctaLabel}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="relative flex h-10 w-10 items-center justify-center md:hidden"
            >
              <span
                aria-hidden
                className={`absolute h-px w-6 bg-foreground transition-transform duration-500 ease-out-expo ${
                  menuOpen ? "rotate-45" : "-translate-y-1"
                }`}
              />
              <span
                aria-hidden
                className={`absolute h-px w-6 bg-foreground transition-transform duration-500 ease-out-expo ${
                  menuOpen ? "-rotate-45" : "translate-y-1"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become
          the containing block and trap this fixed overlay inside it. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease }}
            className="wash-lavender fixed inset-0 z-[65] flex flex-col justify-between px-6 pb-10 pt-28 md:hidden"
          >
            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-2">
                {mobileLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.06, duration: 0.6, ease }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={isActive(link) ? "page" : undefined}
                      className="block font-display text-5xl leading-tight text-foreground"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <Link
              href="/#contact"
              onClick={closeMenu}
              className="btn-pill self-start bg-foreground px-6 py-3.5 text-background"
            >
              {ctaLabel}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
