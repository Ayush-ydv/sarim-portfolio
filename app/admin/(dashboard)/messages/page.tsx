import { prisma } from "@/lib/prisma";
import MessageActions from "@/components/admin/MessageActions";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function AdminMessagesPage() {
  const messages = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Messages</h1>
        <p className="mt-1 text-sm text-muted">
          Booking requests from the homepage form
          {messages.length > 0 && ` · ${unread} unread of ${messages.length}`}.
        </p>
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-muted">No messages yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {messages.map((message) => {
            const details = [
              ["Project", message.projectType],
              ["Budget", message.budget],
              ["Timeline", message.timeline],
            ].filter(([, value]) => value) as [string, string][];
            const subject = encodeURIComponent(
              `Re: your ${message.projectType ? `${message.projectType} ` : ""}enquiry`,
            );

            return (
              <li
                key={message.id}
                className={`border p-5 ${message.read ? "border-rule bg-background" : "border-foreground/40 bg-surface"}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-foreground">
                    {!message.read && (
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-foreground align-middle" />
                    )}
                    <span className="font-medium">{message.name}</span>
                    <span className="text-muted"> · {message.email}</span>
                  </p>
                  <p className="text-xs text-muted">{dateFormat.format(message.createdAt)}</p>
                </div>
                {details.length > 0 && (
                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {details.map(([label, value]) => (
                      <div key={label} className="flex gap-2">
                        <dt className="text-muted">{label}</dt>
                        <dd className="text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {message.message}
                </p>
                <div className="mt-5">
                  <MessageActions
                    id={message.id}
                    read={message.read}
                    replyHref={`mailto:${message.email}?subject=${subject}`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
