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
import type { Service } from "@prisma/client";
import {
  createService,
  updateService,
  deleteService,
  reorderServices,
} from "@/lib/actions/settings";

const inputClass =
  "border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground";

function ServiceRow({ service }: { service: Service }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id });
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
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
      className="flex items-start gap-3 border-b border-rule bg-background px-4 py-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="mt-6 cursor-grab select-none text-muted"
      >
        ⠿
      </button>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-[0.18em] text-muted">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Documentary"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-[0.18em] text-muted">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(() => updateService(service.id, title, description))
            }
            className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm("Delete this service?")) {
                startTransition(() => deleteService(service.id));
              }
            }}
            className="text-xs uppercase tracking-[0.18em] text-red-700 hover:text-red-900 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesEditor({
  services: initialServices,
}: {
  services: Service[];
}) {
  const [services, setServices] = useState(initialServices);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = services.findIndex((s) => s.id === active.id);
    const newIndex = services.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(services, oldIndex, newIndex);
    setServices(reordered);
    startTransition(() => reorderServices(reordered.map((s) => s.id)));
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => createService("New service", "Describe it here."))
        }
        className="self-start bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Add service
      </button>

      {services.length === 0 ? (
        <p className="text-sm text-muted">
          No services yet — the services cards and marquee are hidden until you
          add one.
        </p>
      ) : (
        <DndContext
          id="services"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={services.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="border-t border-rule">
              {services.map((service) => (
                <ServiceRow key={service.id} service={service} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
