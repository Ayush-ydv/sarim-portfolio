"use client";

import { useState, useTransition } from "react";
import type { SiteSettings } from "@prisma/client";
import {
  updateContactSettings,
  type ContactSettingsInput,
} from "@/lib/actions/settings";

export default function ContactSettingsForm({
  settings,
}: {
  settings: SiteSettings;
}) {
  const [form, setForm] = useState<ContactSettingsInput>({
    email: settings.email,
    phone: settings.phone,
    instagramUrl: settings.instagramUrl ?? "",
    vimeoUrl: settings.vimeoUrl ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof ContactSettingsInput>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        startTransition(async () => {
          await updateContactSettings(form);
          setSaved(true);
        });
      }}
      className="flex max-w-xl flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Email
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Phone
        </label>
        <input
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          required
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Instagram URL
        </label>
        <input
          value={form.instagramUrl}
          onChange={(e) => set("instagramUrl", e.target.value)}
          placeholder="https://instagram.com/…"
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Vimeo URL
        </label>
        <input
          value={form.vimeoUrl}
          onChange={(e) => set("vimeoUrl", e.target.value)}
          placeholder="https://vimeo.com/…"
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && !isPending && (
          <span className="text-xs text-muted">Saved.</span>
        )}
      </div>
    </form>
  );
}
