"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
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
import type { Section } from "@prisma/client";
import {
  deleteSection,
  setSectionVisibility,
  reorderSections,
} from "@/lib/actions/sections";

const typeLabels: Record<Section["type"], string> = {
  GALLERY: "Gallery",
  CONTENT: "Content",
  RESUME: "Resume",
};

function SortableRow({ section }: { section: Section }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });
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
      className="flex items-center gap-4 border-b border-rule bg-background px-4 py-3"
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
      <div className="flex-1">
        <p className="text-sm text-foreground">{section.navLabel}</p>
        <p className="text-xs text-muted">
          /{section.slug} · {typeLabels[section.type]}
        </p>
      </div>
      <Link
        href={`/admin/sections/${section.id}`}
        className="text-xs uppercase tracking-[0.18em] text-muted underline underline-offset-4 hover:text-foreground"
      >
        Edit
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() =>
            setSectionVisibility(section.id, !section.isVisible),
          )
        }
        className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground disabled:opacity-50"
      >
        {section.isVisible ? "Visible" : "Hidden"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (
            confirm(
              `Delete "${section.navLabel}"? This removes all its content permanently.`,
            )
          ) {
            startTransition(() => deleteSection(section.id));
          }
        }}
        className="text-xs uppercase tracking-[0.18em] text-red-700 hover:text-red-900 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

export default function SectionList({
  sections: initialSections,
}: {
  sections: Section[];
}) {
  const [sections, setSections] = useState(initialSections);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);
    startTransition(() => reorderSections(reordered.map((s) => s.id)));
  }

  if (sections.length === 0) {
    return (
      <p className="text-sm text-muted">
        No sections yet — add your first one above.
      </p>
    );
  }

  return (
    <DndContext
      id="section-list"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="border-t border-rule">
          {sections.map((section) => (
            <SortableRow key={section.id} section={section} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
