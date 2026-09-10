"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { QuickLink } from "@prisma/client";
import {
  createQuickLink,
  updateQuickLink,
  deleteQuickLink,
  reorderQuickLinks,
} from "@/lib/actions/settings";

function QuickLinkRow({ link }: { link: QuickLink }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });
  const [url, setUrl] = useState(link.url);
  const [thumbnailUrl, setThumbnailUrl] = useState(link.thumbnailUrl ?? "");
  const [isPending, startTransition] = useTransition();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-end gap-3 border-b border-rule bg-background px-4 py-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab select-none text-muted"
      >
        ⠿
      </button>
      <div className="flex flex-1 flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Link URL
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Thumbnail URL
        </label>
        <input
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => updateQuickLink(link.id, url, thumbnailUrl))
        }
        className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this quick link?")) {
            startTransition(() => deleteQuickLink(link.id));
          }
        }}
        className="text-xs uppercase tracking-[0.18em] text-red-700 hover:text-red-900 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

export default function QuickLinksEditor({
  links: initialLinks,
}: {
  links: QuickLink[];
}) {
  const [links, setLinks] = useState(initialLinks);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    setLinks(reordered);
    startTransition(() => reorderQuickLinks(reordered.map((l) => l.id)));
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => createQuickLink("", ""))}
        className="self-start bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Add quick link
      </button>

      {links.length === 0 ? (
        <p className="text-sm text-muted">No quick links yet.</p>
      ) : (
        <DndContext
          id="quick-links"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="border-t border-rule">
              {links.map((link) => (
                <QuickLinkRow key={link.id} link={link} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
