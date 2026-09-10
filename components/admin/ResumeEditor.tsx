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
import type { ResumeEntry } from "@prisma/client";
import FileUploadField from "@/components/admin/FileUploadField";
import ResumeEntryForm, {
  type ResumeEntryInput,
} from "@/components/admin/ResumeEntryForm";
import {
  updateResumeFile,
  createResumeEntry,
  updateResumeEntry,
  deleteResumeEntry,
  reorderResumeEntries,
} from "@/lib/actions/resume";

function SortableEntryRow({
  entry,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  entry: ResumeEntry;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: ResumeEntryInput) => Promise<void>;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <ResumeEntryForm entry={entry} onSubmit={onSave} onCancel={onCancelEdit} />
      </div>
    );
  }

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
      <p className="flex-1 text-sm text-foreground">{entry.heading}</p>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs uppercase tracking-[0.18em] text-muted underline underline-offset-4 hover:text-foreground"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Delete "${entry.heading}"?`)) onDelete();
        }}
        className="text-xs uppercase tracking-[0.18em] text-red-700 hover:text-red-900"
      >
        Delete
      </button>
    </div>
  );
}

export default function ResumeEditor({
  sectionId,
  resumeDataId,
  resumeFileUrl: initialResumeFileUrl,
  entries: initialEntries,
}: {
  sectionId: string;
  resumeDataId: string;
  resumeFileUrl: string | null;
  entries: ResumeEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [resumeFileUrl, setResumeFileUrl] = useState(initialResumeFileUrl ?? "");
  const [fileSaved, setFileSaved] = useState(false);
  const [, startTransition] = useTransition();
  const [isFilePending, startFileTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = entries.findIndex((e) => e.id === active.id);
    const newIndex = entries.findIndex((e) => e.id === over.id);
    const reordered = arrayMove(entries, oldIndex, newIndex);
    setEntries(reordered);
    startTransition(() =>
      reorderResumeEntries(resumeDataId, sectionId, reordered.map((e) => e.id)),
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFileSaved(false);
          startFileTransition(async () => {
            await updateResumeFile(sectionId, resumeFileUrl);
            setFileSaved(true);
          });
        }}
        className="flex flex-wrap items-end gap-3 border border-rule p-4"
      >
        <div className="flex-1">
          <FileUploadField
            label="Resume PDF (optional)"
            value={resumeFileUrl}
            onChange={setResumeFileUrl}
            resourceType="raw"
            accept="application/pdf"
          />
        </div>
        <button
          type="submit"
          disabled={isFilePending}
          className="bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isFilePending ? "Saving…" : "Save"}
        </button>
        {fileSaved && !isFilePending && (
          <span className="text-xs text-muted">Saved.</span>
        )}
      </form>

      {isAdding && (
        <ResumeEntryForm
          onSubmit={async (data) => {
            await createResumeEntry(resumeDataId, sectionId, data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}
      {!isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="self-start bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
        >
          Add entry
        </button>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-muted">No resume entries yet.</p>
      ) : (
        <DndContext
          id="resume-entries"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={entries.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="border-t border-rule">
              {entries.map((entry) => (
                <SortableEntryRow
                  key={entry.id}
                  entry={entry}
                  isEditing={editingId === entry.id}
                  onEdit={() => setEditingId(entry.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={async (data) => {
                    await updateResumeEntry(entry.id, sectionId, data);
                    setEditingId(null);
                  }}
                  onDelete={() =>
                    startTransition(() => deleteResumeEntry(entry.id, sectionId))
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
