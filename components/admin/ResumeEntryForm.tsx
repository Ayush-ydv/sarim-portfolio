"use client";

import { useState, useTransition } from "react";
import type { ResumeEntry } from "@prisma/client";

export type ResumeEntryInput = { heading: string; body: string };

export default function ResumeEntryForm({
  entry,
  onSubmit,
  onCancel,
}: {
  entry?: ResumeEntry;
  onSubmit: (data: ResumeEntryInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [heading, setHeading] = useState(entry?.heading ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            await onSubmit({ heading, body });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
          }
        });
      }}
      className="flex flex-col gap-4 border border-rule bg-background p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Heading
        </label>
        <input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Experience, Education, Skills…"
          required
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save entry"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
