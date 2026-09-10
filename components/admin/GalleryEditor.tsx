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
import type { GalleryItem } from "@prisma/client";
import GalleryItemForm from "@/components/admin/GalleryItemForm";
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
  type GalleryItemInput,
} from "@/lib/actions/gallery";

function SortableItemRow({
  item,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  item: GalleryItem;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: GalleryItemInput) => Promise<void>;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <GalleryItemForm item={item} onSubmit={onSave} onCancel={onCancelEdit} />
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
      <div className="flex-1">
        <p className="text-sm text-foreground">{item.title}</p>
        <p className="text-xs text-muted">
          {item.mediaType} {!item.published && "· Unpublished"}
        </p>
      </div>
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
          if (confirm(`Delete "${item.title}"?`)) onDelete();
        }}
        className="text-xs uppercase tracking-[0.18em] text-red-700 hover:text-red-900"
      >
        Delete
      </button>
    </div>
  );
}

export default function GalleryEditor({
  sectionId,
  items: initialItems,
}: {
  sectionId: string;
  items: GalleryItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    startTransition(() =>
      reorderGalleryItems(sectionId, reordered.map((i) => i.id)),
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {isAdding && (
        <GalleryItemForm
          onSubmit={async (data) => {
            await createGalleryItem(sectionId, data);
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
          Add item
        </button>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted">No items in this gallery yet.</p>
      ) : (
        <DndContext
          id="gallery-items"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="border-t border-rule">
              {items.map((item) => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onEdit={() => setEditingId(item.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={async (data) => {
                    await updateGalleryItem(item.id, data);
                    setEditingId(null);
                  }}
                  onDelete={() =>
                    startTransition(() => deleteGalleryItem(item.id))
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
