import type { APIRoute } from 'astro';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export const prerender = false;

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const INBOX = path.join(ROOT, 'poze-noi');

const TIPURI_PERMISE = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 15 * 1024 * 1024;

function sanitizeazăNumeFolder(nume: string): string {
	const curat = nume.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 80);
	if (curat === '.' || curat === '..' || curat === '') return '';
	return curat;
}

export const POST: APIRoute = async ({ request }) => {
	const form = await request.formData();
	const folder = sanitizeazăNumeFolder(String(form.get('folder') ?? ''));
	const fișiere = form.getAll('poze').filter((f): f is File => f instanceof File);

	if (!folder) {
		return new Response(JSON.stringify({ error: 'Lipsește numele șantierului (id existent sau nume nou).' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	if (fișiere.length === 0) {
		return new Response(JSON.stringify({ error: 'Nicio poză selectată.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
	for (const f of fișiere) {
		if (!TIPURI_PERMISE.has(f.type)) {
			return new Response(JSON.stringify({ error: `Format neacceptat: ${f.name}. Folosește JPG, PNG sau WEBP.` }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		if (f.size > MAX_BYTES) {
			return new Response(JSON.stringify({ error: `Fișier prea mare: ${f.name} (max 15MB).` }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}

	const dirFolder = path.join(INBOX, folder);
	await mkdir(dirFolder, { recursive: true });

	for (const f of fișiere) {
		const numeSigur = path.basename(f.name).replace(/[\\/:*?"<>|]/g, '_');
		const buffer = Buffer.from(await f.arrayBuffer());
		await writeFile(path.join(dirFolder, numeSigur), buffer);
	}

	try {
		const { stdout, stderr } = await execFileAsync('python', ['-X', 'utf8', 'scripts/add_photos.py'], {
			cwd: ROOT,
			timeout: 5 * 60 * 1000,
		});
		return new Response(JSON.stringify({ ok: true, output: stdout + (stderr ? `\n${stderr}` : '') }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ error: 'Scriptul de procesare a eșuat.', output: e.stdout, detalii: e.stderr || e.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
