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
import { HOME_BLOCKS, type HomeBlockKey } from "@/lib/homeBlocks";
import { updateHomeBlocks } from "@/lib/actions/settings";

type Row = { key: HomeBlockKey; enabled: boolean };

const blockDetails = Object.fromEntries(
  HOME_BLOCKS.map((block) => [block.key, block]),
) as Record<HomeBlockKey, (typeof HOME_BLOCKS)[number]>;

// Enabled blocks first, in their saved order, then the hidden ones.
function toRows(enabled: HomeBlockKey[]): Row[] {
  const enabledSet = new Set(enabled);
  return [
    ...enabled.map((key) => ({ key, enabled: true })),
    ...HOME_BLOCKS.filter((block) => !enabledSet.has(block.key)).map(
      (block) => ({ key: block.key, enabled: false }),
    ),
  ];
}

function FixedRow({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-rule bg-surface px-4 py-3 last:border-b-0">
      <span aria-hidden className="w-4 text-center text-muted">
        —
      </span>
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </div>
  );
}

function BlockRow({ row, onToggle }: { row: Row; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.key });
  const details = blockDetails[row.key];

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
        aria-label={`Drag to reorder ${details.label}`}
        className="w-4 cursor-grab select-none text-muted"
      >
        ⠿
      </button>
      <div className="flex-1">
        <p className={`text-sm ${row.enabled ? "text-foreground" : "text-muted"}`}>
          {details.label}
        </p>
        <p className="text-xs text-muted">{details.description}</p>
      </div>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
        <input type="checkbox" checked={row.enabled} onChange={onToggle} />
        Show
      </label>
    </div>
  );
}

export default function HomeLayoutEditor({ blocks }: { blocks: HomeBlockKey[] }) {
  const [rows, setRows] = useState(() => toRows(blocks));
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  // Compare by content: other editors on this page also refresh the server
  // props, and that mustn't wipe unsaved layout changes here.
  const savedKey = blocks.join(",");
  useEffect(() => {
    setRows(toRows(savedKey ? (savedKey.split(",") as HomeBlockKey[]) : []));
  }, [savedKey]);

  const enabledKey = rows
    .filter((row) => row.enabled)
    .map((row) => row.key)
    .join(",");
  const dirty = enabledKey !== savedKey;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((row) => row.key === active.id);
    const newIndex = rows.findIndex((row) => row.key === over.id);
    setRows(arrayMove(rows, oldIndex, newIndex));
    setSaved(false);
  }

  function toggle(key: HomeBlockKey) {
    setRows((current) =>
      current.map((row) =>
        row.key === key ? { ...row, enabled: !row.enabled } : row,
      ),
    );
    setSaved(false);
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="border border-rule">
        <FixedRow label="Intro" description="The hero — always first." />
        <DndContext
          id="home-blocks"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rows.map((row) => row.key)}
            strategy={verticalListSortingStrategy}
          >
            {rows.map((row) => (
              <BlockRow key={row.key} row={row} onToggle={() => toggle(row.key)} />
            ))}
          </SortableContext>
        </DndContext>
        <FixedRow
          label="Contact"
          description="Contact band and footer — always last."
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={!dirty || isPending}
          onClick={() =>
            startTransition(async () => {
              await updateHomeBlocks(
                rows.filter((row) => row.enabled).map((row) => row.key),
              );
              setSaved(true);
            })
          }
          className="bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save layout"}
        </button>
        {dirty && !isPending && (
          <span className="text-xs text-muted">Unsaved changes</span>
        )}
        {saved && !dirty && !isPending && (
          <span className="text-xs text-muted">Saved.</span>
        )}
      </div>
    </div>
  );
}
