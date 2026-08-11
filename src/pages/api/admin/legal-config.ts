import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

const FILE_PATH = path.join(process.cwd(), 'src', 'data', 'legal-config.json');

export const GET: APIRoute = async () => {
	const raw = await readFile(FILE_PATH, 'utf-8');
	return new Response(raw, { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request }) => {
	const body = await request.json();
	await writeFile(FILE_PATH, JSON.stringify(body, null, 2) + '\n', 'utf-8');
	return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
