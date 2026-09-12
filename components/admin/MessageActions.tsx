"use client";

import { useTransition } from "react";
import { deleteMessage, setMessageRead } from "@/lib/actions/messages";

export default function MessageActions({
  id,
  read,
  replyHref,
}: {
  id: string;
  read: boolean;
  replyHref: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <a
        href={replyHref}
        onClick={() => {
          if (!read) startTransition(() => setMessageRead(id, true));
        }}
        className="bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
      >
        Reply
      </a>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => setMessageRead(id, !read))}
        className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground disabled:opacity-50"
      >
        {read ? "Mark unread" : "Mark read"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this message? This can't be undone.")) {
            startTransition(() => deleteMessage(id));
          }
        }}
        className="text-xs uppercase tracking-[0.18em] text-red-700 hover:text-red-900 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
