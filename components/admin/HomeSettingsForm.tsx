"use client";

import { useState, useTransition } from "react";
import type { SiteSettings } from "@prisma/client";
import { updateHomeContent, type HomeContentInput } from "@/lib/actions/settings";
import FileUploadField from "@/components/admin/FileUploadField";

function Field({
  label,
  value,
  onChange,
  textarea,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows ?? 4}
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      )}
    </div>
  );
}

export default function HomeSettingsForm({
  settings,
}: {
  settings: SiteSettings;
}) {
  const [form, setForm] = useState<HomeContentInput>({
    heroImageUrl: settings.heroImageUrl ?? "",
    heroNameLine1: settings.heroNameLine1,
    heroNameLine2: settings.heroNameLine2,
    heroTagline: settings.heroTagline,
    bioImageUrl: settings.bioImageUrl ?? "",
    bioText: settings.bioText,
    philosophyText: settings.philosophyText,
    ctaText: settings.ctaText,
    ctaButtonLabel: settings.ctaButtonLabel,
    servicesHeading: settings.servicesHeading,
  });
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof HomeContentInput>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        startTransition(async () => {
          await updateHomeContent(form);
          setSaved(true);
        });
      }}
      className="flex max-w-xl flex-col gap-5"
    >
      <Field
        label="Hero name — line 1"
        value={form.heroNameLine1}
        onChange={(v) => set("heroNameLine1", v)}
      />
      <Field
        label="Hero name — line 2"
        value={form.heroNameLine2}
        onChange={(v) => set("heroNameLine2", v)}
      />
      <Field
        label="Hero tagline"
        value={form.heroTagline}
        onChange={(v) => set("heroTagline", v)}
      />
      <FileUploadField
        label="Hero image"
        value={form.heroImageUrl}
        onChange={(v) => set("heroImageUrl", v)}
        resourceType="image"
        accept="image/*"
      />
      <Field
        label="Bio text"
        value={form.bioText}
        onChange={(v) => set("bioText", v)}
        textarea
        rows={5}
      />
      <FileUploadField
        label="Bio image"
        value={form.bioImageUrl}
        onChange={(v) => set("bioImageUrl", v)}
        resourceType="image"
        accept="image/*"
      />
      <Field
        label="Philosophy text"
        value={form.philosophyText}
        onChange={(v) => set("philosophyText", v)}
        textarea
        rows={5}
      />
      <Field
        label="CTA text"
        value={form.ctaText}
        onChange={(v) => set("ctaText", v)}
      />
      <Field
        label="CTA button label"
        value={form.ctaButtonLabel}
        onChange={(v) => set("ctaButtonLabel", v)}
      />
      <Field
        label="Services heading"
        value={form.servicesHeading}
        onChange={(v) => set("servicesHeading", v)}
      />
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
