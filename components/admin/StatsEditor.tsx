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
import type { Stat } from "@prisma/client";
import {
  createStat,
  updateStat,
  deleteStat,
  reorderStats,
} from "@/lib/actions/settings";

const inputClass =
  "border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground";

function StatRow({ stat }: { stat: Stat }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stat.id });
  const [value, setValue] = useState(stat.value);
  const [label, setLabel] = useState(stat.label);
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
      <div className="flex w-28 flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Number
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="6+"
          className={inputClass}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Label
        </label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Years editing"
          className={inputClass}
        />
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => updateStat(stat.id, value, label))}
        className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this stat?")) {
            startTransition(() => deleteStat(stat.id));
          }
        }}
        className="text-xs uppercase tracking-[0.18em] text-red-700 hover:text-red-900 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

export default function StatsEditor({ stats: initialStats }: { stats: Stat[] }) {
  const [stats, setStats] = useState(initialStats);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = stats.findIndex((s) => s.id === active.id);
    const newIndex = stats.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(stats, oldIndex, newIndex);
    setStats(reordered);
    startTransition(() => reorderStats(reordered.map((s) => s.id)));
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => createStat("10+", "New stat"))}
        className="self-start bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Add stat
      </button>

      {stats.length === 0 ? (
        <p className="text-sm text-muted">
          No stats yet — the stats band is hidden until you add one.
        </p>
      ) : (
        <DndContext
          id="stats"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stats.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="border-t border-rule">
              {stats.map((stat) => (
                <StatRow key={stat.id} stat={stat} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
