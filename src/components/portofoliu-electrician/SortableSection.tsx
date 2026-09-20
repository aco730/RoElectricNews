"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Section } from "@/lib/types";
import { SectionRenderer, SECTION_LABELS } from "./SectionRenderer";

export function SortableSection({
  section,
  editMode,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  section: Section;
  editMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const isFixed = section.type === "header";
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // "header" renders position:fixed and contributes no layout height on its own —
    // reserve a slot so its toolbar gets its own sticky spot instead of overlapping the next section's.
    minHeight: isFixed ? 64 : undefined,
  };

  if (!editMode) return <SectionRenderer section={section} />;

  return (
    <div ref={setNodeRef} style={style} className="relative border-2 border-dashed border-transparent hover:border-accent">
      <div className="sticky top-14 z-[60] flex gap-1 px-3 py-1.5 bg-transparent pointer-events-none">
        <div className="flex gap-1 bg-ink/95 backdrop-blur rounded-md p-1 shadow-lg pointer-events-auto">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab bg-white/10 text-white text-xs px-2 py-1 rounded"
            title="Trage pentru reordonare"
          >
            ⠿ {SECTION_LABELS[section.type] ?? section.type}
          </button>
          <button onClick={onEdit} className="bg-accent text-ink text-xs px-2 py-1 rounded font-semibold">
            Editează
          </button>
          <button onClick={onDuplicate} className="bg-white/10 text-white text-xs px-2 py-1 rounded">
            Duplică
          </button>
          <button onClick={onDelete} className="bg-red-600 text-white text-xs px-2 py-1 rounded">
            Șterge
          </button>
        </div>
      </div>
      <div
        className="-mt-9 cursor-pointer"
        onClickCapture={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("a,button,input,textarea,select,label")) return;
          e.preventDefault();
          onEdit();
        }}
      >
        <SectionRenderer section={section} editMode={editMode} />
      </div>
    </div>
  );
}
