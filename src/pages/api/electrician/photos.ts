import type { APIRoute } from "astro";
import { ALL_PROJECTS, ALL_PHOTOS, CATEGORY_LABELS } from "../../../lib/photos";

// Public read-only endpoint (no auth): backs the "Din portofoliu" tab of the
// image picker. Same data already public on /portofoliu.
export const prerender = false;

export const GET: APIRoute = async () => {
  const projects = ALL_PROJECTS.map((p) => ({
    ...p,
    categoryLabel: CATEGORY_LABELS[p.category] ?? p.category,
    photos: ALL_PHOTOS.filter((ph) => ph.projectId === p.id),
  }));
  return new Response(JSON.stringify({ projects }), { headers: { "Content-Type": "application/json" } });
};
