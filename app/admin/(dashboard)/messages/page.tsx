import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="font-display text-2xl text-foreground">Messages</h1>
      {messages.length === 0 ? (
        <p className="text-sm text-muted">No messages yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-rule border-t border-rule">
          {messages.map((message) => (
            <div key={message.id} className="py-4">
              <p className="text-sm text-foreground">
                {message.name} · {message.email}
              </p>
              <p className="mt-1 text-sm text-muted">{message.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
