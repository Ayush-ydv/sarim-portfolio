"use client";

import { useState, useTransition } from "react";
import { SectionType } from "@prisma/client";
import { createSection } from "@/lib/actions/sections";

const typeOptions: { value: SectionType; label: string }[] = [
  { value: "GALLERY", label: "Work category (Films, Reels…)" },
  { value: "CONTENT", label: "Content (freeform text + image)" },
  { value: "RESUME", label: "Resume (structured CV entries)" },
];

export default function AddSectionForm() {
  const [navLabel, setNavLabel] = useState("");
  const [type, setType] = useState<SectionType>("GALLERY");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            await createSection(navLabel, type);
            setNavLabel("");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
          }
        });
      }}
      className="flex flex-wrap items-end gap-3 border border-rule p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Section name
        </label>
        <input
          value={navLabel}
          onChange={(e) => setNavLabel(e.target.value)}
          placeholder="e.g. Voiceover portfolio"
          required
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as SectionType)}
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add section"}
      </button>
      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}
