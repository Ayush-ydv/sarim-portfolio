import type { ContactSubmission } from "@prisma/client";

// Resend's default sender works without a verified domain, but then Resend
// only delivers to the address the Resend account is registered with. Once a
// domain is verified, set BOOKING_FROM_EMAIL to e.g. bookings@thatdomain.
const FROM = process.env.BOOKING_FROM_EMAIL || "Portfolio Bookings <onboarding@resend.dev>";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Emails a new booking to the site owner, with Reply going to the visitor.
// Never throws: the booking is already saved, so a failed email only logs.
export async function sendBookingNotification(submission: ContactSubmission) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_NOTIFY_EMAIL;
  if (!apiKey || !to) {
    return { sent: false, error: "RESEND_API_KEY or BOOKING_NOTIFY_EMAIL is not set" };
  }

  const rows: [string, string | null][] = [
    ["Name", submission.name],
    ["Email", submission.email],
    ["Project type", submission.projectType],
    ["Budget", submission.budget],
    ["Timeline", submission.timeline],
  ];
  const filled = rows.filter((row): row is [string, string] => Boolean(row[1]));

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#171614;max-width:560px">
      <h2 style="font-weight:normal;margin:0 0 16px">New booking request</h2>
      <table style="border-collapse:collapse;margin-bottom:16px">
        ${filled
          .map(
            ([label, value]) =>
              `<tr><td style="padding:4px 16px 4px 0;color:#6e6862">${label}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="white-space:pre-wrap;line-height:1.5;margin:0 0 20px">${escapeHtml(submission.message)}</p>
      <p style="color:#6e6862;font-size:13px;margin:0">Reply to this email to answer ${escapeHtml(submission.name)} directly. It's also saved in your admin under Messages.</p>
    </div>`;
  const text = `New booking request\n\n${filled
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n")}\n\n${submission.message}\n\nReply to this email to answer directly.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        reply_to: submission.email,
        subject: `New booking: ${submission.name}${submission.projectType ? ` — ${submission.projectType}` : ""}`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { sent: false, error: `Resend ${res.status}: ${body.message ?? "unknown error"}` };
    }
    return { sent: true };
  } catch (error) {
    return { sent: false, error: error instanceof Error ? error.message : "Network error" };
  }
}
