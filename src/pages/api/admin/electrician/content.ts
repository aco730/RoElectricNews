import type { APIRoute } from "astro";
import { readSite, writeSite } from "../../../../lib/portofoliuElectricianContent";
import type { Site } from "../../../../lib/types";

// Auth + Netlify-production gating already applied by src/middleware.ts
// for every path under /api/admin/*.
export const prerender = false;

export const GET: APIRoute = async () => {
  const site = await readSite();
  return new Response(JSON.stringify(site), {
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async ({ request }) => {
  const body = (await request.json()) as Site;
  if (!body || !Array.isArray(body.pages)) {
    return new Response(JSON.stringify({ error: "invalid site payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  await writeSite(body);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
