"use client";

import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { Page, Section, SectionType, Site } from "@/lib/types";
import { SortableSection } from "./SortableSection";
import { SectionEditPanel } from "./SectionEditPanel";
import { SECTION_LABELS } from "./SectionRenderer";

const NEW_SECTION_DEFAULTS: Record<Exclude<SectionType, "richText">, Section["data"]> = {
  header: { brand: "Brand", phone: "", navLinks: [] },
  hero: { title: "Titlu nou", subtitle: "Subtitlu descriptiv aici.", ctaText: "Sună acum", ctaLink: "tel:+40750405908" },
  cardGrid: { heading: "Titlu secțiune", cards: [] },
  cta: { heading: "Titlu CTA", text: "Text descriptiv.", buttonText: "Sună", buttonLink: "tel:+40750405908" },
  faq: { heading: "Întrebări frecvente", faqItems: [] },
  pricing: { heading: "Prețuri", priceItems: [] },
  footer: { phone: "", whatsapp: "", email: "", location: "" },
  gallery: { heading: "Portofoliu", galleryCategories: [] },
  calcBattery: { heading: "Calculator baterie fotovoltaică" },
  calcSolar: { heading: "Calculator sistem fotovoltaic" },
  calcElectric: { heading: "Calculator cost instalație electrică" },
  calcQuick: { heading: "Calculator rapid" },
  portfolioPreview: { heading: "Portofoliu", text: "", portfolioLimit: 8 },
  breadcrumb: { breadcrumbItems: [] },
};

const ADDABLE_TYPES: SectionType[] = [
  "hero",
  "cardGrid",
  "cta",
  "faq",
  "pricing",
  "gallery",
  "portfolioPreview",
  "calcBattery",
  "calcSolar",
  "calcElectric",
  "calcQuick",
  "footer",
];

export function SiteEditor({ initialSite, slug, isAdmin = false }: { initialSite: Site; slug: string; isAdmin?: boolean }) {
  const [site, setSite] = useState(initialSite);
  // Edit mode is only entered via the "✎ Editor site" link in /admin
  // (which appends ?edit=1) — no floating button on the public pages, so
  // admins browsing the live site see it exactly as visitors do.
  const [editMode, setEditMode] = useState(
    () => isAdmin && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "1"
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [addingPage, setAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [barHeight, setBarHeight] = useState(56);
  const barRef = useRef<HTMLDivElement>(null);

  // The admin bar wraps onto 2 lines when there are many pages/buttons, so its
  // real height can exceed the hardcoded 56px (top-14) everything else assumed —
  // that made the bar (z-70) cover the section toolbar (sticky, z-60) underneath.
  useEffect(() => {
    if (!isAdmin || !editMode || !barRef.current) return;
    const el = barRef.current;
    const ro = new ResizeObserver(() => setBarHeight(el.offsetHeight));
    ro.observe(el);
    setBarHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [isAdmin, editMode]);

  const pageIndex = site.pages.findIndex((p) => p.slug === slug);
  const page = site.pages[pageIndex] ?? site.pages[0];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function updatePage(updater: (p: Page) => Page) {
    setSite((s) => ({ ...s, pages: s.pages.map((p) => (p.id === page.id ? updater(p) : p)) }));
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    updatePage((p) => {
      const oldIndex = p.sections.findIndex((s) => s.id === active.id);
      const newIndex = p.sections.findIndex((s) => s.id === over.id);
      return { ...p, sections: arrayMove(p.sections, oldIndex, newIndex) };
    });
  }

  function addSection(type: SectionType) {
    if (type === "richText") return;
    const section: Section = { id: nanoid(8), type, template: 1, data: NEW_SECTION_DEFAULTS[type] };
    updatePage((p) => ({ ...p, sections: [...p.sections, section] }));
    setEditingSectionId(section.id);
  }

  function deleteSection(id: string) {
    if (!confirm("Ștergi această secțiune?")) return;
    updatePage((p) => ({ ...p, sections: p.sections.filter((s) => s.id !== id) }));
  }

  function duplicateSection(id: string) {
    updatePage((p) => {
      const idx = p.sections.findIndex((s) => s.id === id);
      if (idx === -1) return p;
      const copy: Section = { ...p.sections[idx], id: nanoid(8) };
      const next = [...p.sections];
      next.splice(idx + 1, 0, copy);
      return { ...p, sections: next };
    });
  }

  function updateSection(updated: Section) {
    updatePage((p) => ({ ...p, sections: p.sections.map((s) => (s.id === updated.id ? updated : s)) }));
  }

  async function save() {
    setSaving("saving");
    await fetch("/api/admin/electrician/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });
    setSaving("saved");
    setTimeout(() => setSaving("idle"), 1500);
  }

  async function createPage() {
    const name = newPageName.trim();
    if (!name) return;
    const slugified = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const newPage: Page = {
      id: nanoid(8),
      slug: slugified,
      title: name,
      sections: [
        { id: nanoid(8), type: "hero", template: 1, data: NEW_SECTION_DEFAULTS.hero },
        { id: nanoid(8), type: "footer", template: 1, data: page?.sections.find((s) => s.type === "footer")?.data ?? NEW_SECTION_DEFAULTS.footer },
      ],
    };
    const nextSite = { ...site, pages: [...site.pages, newPage] };
    // Persist before navigating — the target route reads pages server-side via
    // readSite(), so navigating on local state alone 404s until "Salvează" runs.
    await fetch("/api/admin/electrician/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextSite),
    });
    setSite(nextSite);
    setNewPageName("");
    setAddingPage(false);
    window.location.href = `/electrician/${slugified}?edit=1`;
  }

  const editingSection = page.sections.find((s) => s.id === editingSectionId) ?? null;

  return (
    <div>
      {isAdmin && editMode && (
        <div ref={barRef} className="fixed top-0 inset-x-0 z-[70] bg-ink text-white px-4 py-2 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-bold">Editor site</span>
          <div className="flex gap-2 flex-wrap">
            {site.pages.map((p) => (
              <a
                key={p.id}
                href={p.slug ? `/electrician/${p.slug}?edit=1` : "/electrician?edit=1"}
                className={`px-2 py-1 rounded-md ${p.id === page.id ? "bg-accent text-ink font-semibold" : "bg-white/10"}`}
              >
                {p.title}
              </a>
            ))}
            {addingPage ? (
              <span className="flex gap-1">
                <input
                  autoFocus
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="Nume pagină"
                  className="text-ink px-2 py-1 rounded-md text-xs w-32"
                  onKeyDown={(e) => e.key === "Enter" && createPage()}
                />
                <button onClick={createPage} className="bg-accent text-ink px-2 py-1 rounded-md font-semibold">
                  Creează
                </button>
              </span>
            ) : (
              <button onClick={() => setAddingPage(true)} className="bg-white/10 px-2 py-1 rounded-md">
                + Pagină nouă
              </button>
            )}
          </div>
          <div className="ml-auto flex gap-2 items-center">
            <div className="relative group">
              <button className="bg-white/10 px-3 py-1.5 rounded-md">+ Secțiune</button>
              <div className="absolute right-0 top-full hidden group-hover:block bg-white text-ink rounded-lg shadow-xl p-1 w-44 z-[80]">
                {ADDABLE_TYPES.map((t) => (
                  <button key={t} onClick={() => addSection(t)} className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-md">
                    {SECTION_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={save} className="bg-accent text-ink px-4 py-1.5 rounded-md font-semibold">
              {saving === "saving" ? "Se salvează…" : saving === "saved" ? "Salvat ✓" : "Salvează"}
            </button>
            <button onClick={() => setEditMode(false)} className="bg-white/10 px-3 py-1.5 rounded-md">
              Ieși din editor
            </button>
          </div>
        </div>
      )}

      <div style={isAdmin && editMode ? { paddingTop: barHeight } : undefined}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={page.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {page.sections.map((s) => (
              <SortableSection
                key={s.id}
                section={s}
                editMode={isAdmin && editMode}
                toolbarOffset={barHeight}
                onEdit={() => setEditingSectionId(s.id)}
                onDelete={() => deleteSection(s.id)}
                onDuplicate={() => duplicateSection(s.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {editingSection && (
        <SectionEditPanel
          section={editingSection}
          panelTop={barHeight}
          onChange={updateSection}
          onClose={() => setEditingSectionId(null)}
        />
      )}
    </div>
  );
}
