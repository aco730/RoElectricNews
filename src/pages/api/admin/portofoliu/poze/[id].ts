import type { APIRoute } from 'astro';
import { actualizeazăPoza, ștergePoza } from '../../../../../lib/portofoliu';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
	const body = await request.json();
	try {
		await actualizeazăPoza(params.id!, body);
		return new Response(JSON.stringify({ ok: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: (e as Error).message }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

export const DELETE: APIRoute = async ({ params }) => {
	try {
		await ștergePoza(params.id!);
		return new Response(JSON.stringify({ ok: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: (e as Error).message }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
