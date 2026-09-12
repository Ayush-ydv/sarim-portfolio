"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitBooking } from "@/lib/actions/booking";
import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  type BookingState,
} from "@/lib/bookingOptions";

const field =
  "w-full rounded-xl border border-foreground/15 bg-surface/80 px-4 py-3 text-[0.95rem] text-foreground placeholder:text-muted/80 focus:border-foreground focus:outline-none";
const label = "text-[0.68rem] font-medium uppercase tracking-[0.2em] text-foreground/70";

function Select({
  id,
  name,
  text,
  options,
}: {
  id: string;
  name: string;
  text: string;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={label}>
        {text} <span className="normal-case tracking-normal text-muted">(optional)</span>
      </label>
      <select id={id} name={name} defaultValue="" className={field}>
        <option value="">Select…</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function BookingForm({ projectTypes }: { projectTypes: string[] }) {
  const [state, action, pending] = useActionState<BookingState, FormData>(
    submitBooking,
    { status: "idle" },
  );
  // Set after mount: the page is prerendered, so a server timestamp would be stale.
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl bg-surface/80 p-8 text-left md:p-10">
        <p className="font-display text-3xl text-foreground">Thank you — message received.</p>
        <p className="mt-3 text-foreground/75">
          I read every enquiry myself and usually reply within a day or two.
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="grid gap-5 text-left sm:grid-cols-2">
      {/* Hidden from people; bots that fill it are ignored. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedAt} type="hidden" name="startedAt" defaultValue="" />

      <div className="flex flex-col gap-2">
        <label htmlFor="booking-name" className={label}>
          Name
        </label>
        <input
          id="booking-name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "booking-name-error" : undefined}
          className={field}
        />
        {errors.name && (
          <p id="booking-name-error" className="text-sm text-red-800">
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="booking-email" className={label}>
          Email
        </label>
        <input
          id="booking-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "booking-email-error" : undefined}
          className={field}
        />
        {errors.email && (
          <p id="booking-email-error" className="text-sm text-red-800">
            {errors.email}
          </p>
        )}
      </div>

      <Select
        id="booking-project"
        name="projectType"
        text="Project type"
        options={[...projectTypes, "Other"]}
      />
      <Select id="booking-budget" name="budget" text="Budget" options={BUDGET_OPTIONS} />

      <div className="sm:col-span-2">
        <Select
          id="booking-timeline"
          name="timeline"
          text="Timeline"
          options={TIMELINE_OPTIONS}
        />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <label htmlFor="booking-message" className={label}>
          Tell me about the project
        </label>
        <textarea
          id="booking-message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "booking-message-error" : undefined}
          className={field}
        />
        {errors.message && (
          <p id="booking-message-error" className="text-sm text-red-800">
            {errors.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-pill bg-foreground px-8 py-4 text-background hover:bg-transparent hover:text-foreground disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send enquiry →"}
        </button>
        {state.status === "error" && state.message && (
          <p role="alert" className="text-sm text-red-800">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
