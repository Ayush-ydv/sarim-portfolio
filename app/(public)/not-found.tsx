import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-32 text-center">
      <p className="font-display text-3xl text-foreground">404</p>
      <p className="text-sm text-muted">This page could not be found.</p>
      <Link
        href="/"
        className="mt-4 text-xs uppercase tracking-[0.18em] text-muted underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Back home
      </Link>
    </div>
  );
}
