import Link from "next/link";
import { signOut } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/home", label: "Home" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/messages", label: "Messages" },
];

export default function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-rule p-6">
      <div className="flex flex-col gap-6">
        <span className="font-display text-lg text-foreground">Admin</span>
        <nav className="flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/login" });
        }}
      >
        <button
          type="submit"
          className="text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
