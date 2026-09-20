// Adapter over sep's own portfolio photo database (src/data/portofoliu.json,
// maintained by src/lib/portofoliu.ts + the /admin panel) so the ported
// portofoliu-electrician Gallery section reads the same real photos as
// sep's own /portofoliu pages, instead of a second duplicate photo set.
import portofoliuData from "@/data/portofoliu.json";

interface RawPoza {
  id: string;
  project_id: string;
  thumb_s: string;
  thumb_l: string;
}

interface RawProiect {
  id: string;
  nume: string;
  album: string;
  locatie: string;
  dataDe: string;
  dataPana: string;
  poze: RawPoza[];
  cover: string | null;
}

export interface GalleryProject {
  id: string;
  name: string;
  category: string;
  coverThumb: string;
  count: number;
  dateFrom: string | null;
  dateTo: string | null;
}

export interface GalleryPhoto {
  id: string;
  projectId: string;
  thumbS: string;
  thumbL: string;
}

// First-pass mapping: sep's data only distinguishes two albums (no fine
// categories like the old CMS photo set had). Refine later if finer
// categories are needed — e.g. by mining each project's `etichete` tags.
export const CATEGORY_LABELS: Record<string, string> = {
  fotovoltaice: "Fotovoltaic",
  electrice: "Electric",
};

const raw = portofoliuData as unknown as { proiecte: RawProiect[] };

export const ALL_PROJECTS: GalleryProject[] = raw.proiecte.map((p) => ({
  id: p.id,
  name: p.nume,
  category: p.album || "altele",
  coverThumb: p.cover ?? p.poze[0]?.thumb_l ?? "",
  count: p.poze.length,
  dateFrom: p.dataDe || null,
  dateTo: p.dataPana || null,
}));

export const ALL_PHOTOS: GalleryPhoto[] = raw.proiecte.flatMap((p) =>
  p.poze.map((ph) => ({ id: ph.id, projectId: p.id, thumbS: ph.thumb_s, thumbL: ph.thumb_l }))
);

export function projectsForCategories(categories?: string[]): GalleryProject[] {
  const filtered = !categories || categories.length === 0 ? ALL_PROJECTS : ALL_PROJECTS.filter((p) => categories.includes(p.category));
  return [...filtered].sort((a, b) => (b.dateFrom ?? "").localeCompare(a.dateFrom ?? ""));
}

export function photosForProject(projectId: string): GalleryPhoto[] {
  return ALL_PHOTOS.filter((p) => p.projectId === projectId);
}

export function categoriesPresent(categories?: string[]): string[] {
  const projects = projectsForCategories(categories);
  return [...new Set(projects.map((p) => p.category))];
}
