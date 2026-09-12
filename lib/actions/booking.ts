"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendBookingNotification } from "@/lib/email";
import type { BookingState } from "@/lib/bookingOptions";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public on purpose: anyone can book. Everything is validated and capped here.
export async function submitBooking(
  _previous: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const get = (key: string, max: number) =>
    String(formData.get(key) ?? "").trim().slice(0, max);

  // Spam traps. Bots fill every field, including this one people never see,
  // and submit faster than a person can type. Pretend success so they move on.
  if (get("website", 200)) return { status: "success" };
  const startedAt = Number(get("startedAt", 20));
  if (startedAt && Date.now() - startedAt < 2500) return { status: "success" };

  const name = get("name", 200);
  const email = get("email", 320);
  const message = get("message", 5000);
  const fieldErrors: BookingState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Please add your name.";
  if (!EMAIL.test(email)) fieldErrors.email = "Please add a valid email so I can reply.";
  if (!message) fieldErrors.message = "Please tell me a little about the project.";
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "A few details are missing.", fieldErrors };
  }

  // Rate limits: a person re-sending, or a flood from a script.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const [fromThisEmail, recentTotal] = await Promise.all([
    prisma.contactSubmission.count({ where: { email, createdAt: { gt: hourAgo } } }),
    prisma.contactSubmission.count({ where: { createdAt: { gt: tenMinutesAgo } } }),
  ]);
  if (fromThisEmail >= 3 || recentTotal >= 30) {
    return {
      status: "error",
      message: "Thanks — I've already got your message. I'll be in touch soon.",
    };
  }

  const submission = await prisma.contactSubmission.create({
    data: {
      name,
      email,
      message,
      projectType: get("projectType", 100) || null,
      budget: get("budget", 100) || null,
      timeline: get("timeline", 100) || null,
    },
  });
  revalidatePath("/admin", "layout");

  // Saved first, so a failed email never loses a booking.
  const result = await sendBookingNotification(submission);
  if (!result.sent) console.error("Booking email not sent:", result.error);

  return { status: "success" };
}
