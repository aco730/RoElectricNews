import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

// Auth + Netlify-production gating already applied by src/middleware.ts
// for every path under /api/admin/*.
export const prerender = false;

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "media");
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return new Response(JSON.stringify({ error: "no file" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  if (!ALLOWED.includes(file.type)) {
    return new Response(JSON.stringify({ error: "unsupported file type" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || "";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, safeName), buf);

  return new Response(JSON.stringify({ url: `/uploads/media/${safeName}` }), {
    headers: { "Content-Type": "application/json" },
  });
};
