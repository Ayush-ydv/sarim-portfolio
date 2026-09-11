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
import type { Brand } from "@prisma/client";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  reorderBrands,
} from "@/lib/actions/settings";
import FileUploadField from "@/components/admin/FileUploadField";

const inputClass =
  "border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground";

function BrandRow({ brand }: { brand: Brand }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: brand.id });
  const [name, setName] = useState(brand.name);
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl ?? "");
  const [error, setError] = useState<string | null>(null);
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
      <div className="flex min-w-[160px] flex-1 flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Brand name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Brand name"
          className={inputClass}
        />
      </div>
      <div className="min-w-[220px] flex-1">
        <FileUploadField
          label="Logo (optional)"
          value={logoUrl}
          onChange={setLogoUrl}
          resourceType="image"
          accept="image/*"
        />
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await updateBrand(brand.id, name, logoUrl);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not save");
            }
          });
        }}
        className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm(`Delete "${brand.name}"?`)) {
            startTransition(() => deleteBrand(brand.id));
          }
        }}
        className="text-xs uppercase tracking-[0.18em] text-red-700 hover:text-red-900 disabled:opacity-50"
      >
        Delete
      </button>
      {error && <p className="w-full text-xs text-red-700">{error}</p>}
    </div>
  );
}

export default function BrandsEditor({ brands: initialBrands }: { brands: Brand[] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = brands.findIndex((b) => b.id === active.id);
    const newIndex = brands.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(brands, oldIndex, newIndex);
    setBrands(reordered);
    startTransition(() => reorderBrands(reordered.map((b) => b.id)));
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => createBrand("New brand", ""))}
        className="self-start bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Add brand
      </button>

      {brands.length === 0 ? (
        <p className="text-sm text-muted">
          No brands yet — the brands marquee is hidden until you add one.
        </p>
      ) : (
        <DndContext
          id="brands"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={brands.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="border-t border-rule">
              {brands.map((brand) => (
                <BrandRow key={brand.id} brand={brand} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
