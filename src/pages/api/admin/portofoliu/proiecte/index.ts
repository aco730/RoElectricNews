import type { APIRoute } from 'astro';
import { getProiecte, getPhotoSrc } from '../../../../../lib/portofoliu';

export const prerender = false;

export const GET: APIRoute = async () => {
	const proiecte = await getProiecte();
	const photoSrc = await getPhotoSrc();
	const countByProject = new Map<string, number>();
	for (const p of photoSrc.photos) {
		countByProject.set(p.project_id, (countByProject.get(p.project_id) ?? 0) + 1);
	}
	const rezultat = proiecte.map((p) => ({ ...p, nrPoze: countByProject.get(p.id) ?? 0 }));
	return new Response(JSON.stringify(rezultat), {
		headers: { 'Content-Type': 'application/json' },
	});
};
