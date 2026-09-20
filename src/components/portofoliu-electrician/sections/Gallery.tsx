"use client";

import { useMemo, useState } from "react";
import type { SectionData } from "@/lib/types";
import { ALL_PHOTOS, CATEGORY_LABELS, categoriesPresent, photosForProject, projectsForCategories, type GalleryPhoto, type GalleryProject } from "@/lib/photos";

function Chips({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active: string | "all";
  onSelect: (c: string | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      <button
        onClick={() => onSelect("all")}
        className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition"
        style={
          active === "all"
            ? { background: "var(--accent)", borderColor: "var(--accent)", color: "#1a1712" }
            : { borderColor: "var(--border)", color: "var(--text-dim)" }
        }
      >
        Toate
      </button>
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition"
          style={
            active === c
              ? { background: "var(--accent)", borderColor: "var(--accent)", color: "#1a1712" }
              : { borderColor: "var(--border)", color: "var(--text-dim)" }
          }
        >
          {CATEGORY_LABELS[c] ?? c}
        </button>
      ))}
    </div>
  );
}

function Lightbox({ photos, index, onClose, onNav }: { photos: GalleryPhoto[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
  const photo = photos[index];
  if (!photo) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 px-4"
      style={{ background: "rgba(5,6,8,0.94)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full grid place-items-center text-white bg-white/10 text-lg"
        aria-label="Închide"
      >
        ✕
      </button>
      {index > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNav(index - 1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full grid place-items-center text-white bg-white/10 text-2xl"
          aria-label="Anterior"
        >
          ‹
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNav(index + 1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full grid place-items-center text-white bg-white/10 text-2xl"
          aria-label="Următor"
        >
          ›
        </button>
      )}
      <img
        src={photo.thumbL}
        alt=""
        className="max-w-[92vw] max-h-[80vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="text-white/70 text-sm">
        {index + 1} / {photos.length}
      </p>
    </div>
  );
}

function useGalleryState(data: SectionData) {
  const categories = useMemo(() => categoriesPresent(data.galleryCategories), [data.galleryCategories]);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const projects = useMemo(() => {
    const base = projectsForCategories(data.galleryCategories);
    return activeCategory === "all" ? base : base.filter((p) => p.category === activeCategory);
  }, [data.galleryCategories, activeCategory]);
  const [openProject, setOpenProject] = useState<GalleryProject | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  return { categories, activeCategory, setActiveCategory, projects, openProject, setOpenProject, lightboxIndex, setLightboxIndex };
}

export function Gallery1({ data }: { data: SectionData }) {
  const { categories, activeCategory, setActiveCategory, projects, openProject, setOpenProject, lightboxIndex, setLightboxIndex } =
    useGalleryState(data);
  const openPhotos = openProject ? photosForProject(openProject.id) : [];

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight text-center mb-6" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      {!openProject && <Chips categories={categories} active={activeCategory} onSelect={setActiveCategory} />}

      {!openProject ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setOpenProject(p)}
              className="text-left rounded-2xl overflow-hidden border transition-transform hover:-translate-y-1"
              style={{ borderColor: "var(--border)", background: "var(--bg-elev)", boxShadow: "var(--shadow)" }}
            >
              <div className="h-[170px] overflow-hidden">
                <img src={p.coverThumb} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-bold leading-snug" style={{ color: "var(--text)" }}>
                  {p.name}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                  {CATEGORY_LABELS[p.category] ?? p.category} · {p.count} poze
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setOpenProject(null)} className="text-sm font-semibold mb-4" style={{ color: "var(--accent-2, var(--accent))" }}>
            ← Toate lucrările
          </button>
          <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>
            {openProject.name}
          </h3>
          <p className="text-xs mb-5" style={{ color: "var(--text-dim)" }}>
            {CATEGORY_LABELS[openProject.category] ?? openProject.category} · {openPhotos.length} poze
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {openPhotos.map((photo, i) => (
              <button key={photo.id} onClick={() => setLightboxIndex(i)} className="aspect-square overflow-hidden rounded-lg">
                <img src={photo.thumbS} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {openProject && lightboxIndex !== null && (
        <Lightbox photos={openPhotos} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={setLightboxIndex} />
      )}
    </section>
  );
}

export function Gallery2({ data }: { data: SectionData }) {
  const { categories, activeCategory, setActiveCategory, projects, lightboxIndex, setLightboxIndex } = useGalleryState(data);
  const flatPhotos = useMemo(() => {
    const projectIds = new Set(projects.map((p) => p.id));
    return ALL_PHOTOS.filter((ph) => projectIds.has(ph.projectId));
  }, [projects]);

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight text-center mb-6" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <Chips categories={categories} active={activeCategory} onSelect={setActiveCategory} />
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
        {flatPhotos.map((photo, i) => (
          <button key={photo.id} onClick={() => setLightboxIndex(i)} className="block w-full mb-3 rounded-lg overflow-hidden break-inside-avoid">
            <img src={photo.thumbS} alt="" className="w-full h-auto hover:opacity-85 transition-opacity" />
          </button>
        ))}
      </div>
      {lightboxIndex !== null && (
        <Lightbox photos={flatPhotos} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={setLightboxIndex} />
      )}
    </section>
  );
}

export function Gallery3({ data }: { data: SectionData }) {
  const { categories, activeCategory, setActiveCategory, projects } = useGalleryState(data);
  const [lightbox, setLightbox] = useState<{ projectId: string; index: number } | null>(null);
  const lightboxPhotos = lightbox ? photosForProject(lightbox.projectId) : [];

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight text-center mb-6" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <Chips categories={categories} active={activeCategory} onSelect={setActiveCategory} />
      <div className="space-y-8">
        {projects.map((p) => {
          const photos = photosForProject(p.id).slice(0, 8);
          return (
            <div key={p.id}>
              <p className="text-sm font-bold mb-2" style={{ color: "var(--text)" }}>
                {p.name} <span className="font-normal" style={{ color: "var(--text-dim)" }}>· {p.count} poze</span>
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setLightbox({ projectId: p.id, index: i })}
                    className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden"
                  >
                    <img src={photo.thumbS} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {lightbox && (
        <Lightbox
          photos={lightboxPhotos}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNav={(i) => setLightbox({ projectId: lightbox.projectId, index: i })}
        />
      )}
    </section>
  );
}

export const GalleryTemplates = { 1: Gallery1, 2: Gallery2, 3: Gallery3 };
