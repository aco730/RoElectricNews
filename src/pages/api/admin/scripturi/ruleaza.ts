import type { APIRoute } from 'astro';
import { spawn } from 'node:child_process';
import { getScript } from '../../../../lib/scripturi';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const id = url.searchParams.get('id') ?? '';
	const script = getScript(id);

	if (!script) {
		return new Response('event: eroare\ndata: Script inexistent.\n\n', {
			status: 404,
			headers: { 'Content-Type': 'text/event-stream' },
		});
	}

	const args: string[] = [];
	for (const argDef of script.argumente ?? []) {
		const valoare = url.searchParams.get(argDef.nume) ?? '';
		if (argDef.obligatoriu && !valoare.trim()) {
			return new Response(`event: eroare\ndata: Lipsește argumentul obligatoriu: ${argDef.label}\n\n`, {
				status: 400,
				headers: { 'Content-Type': 'text/event-stream' },
			});
		}
		if (valoare.trim()) args.push(valoare.trim());
	}
	// delete_project.py necesită --yes pentru rulare non-interactivă din admin
	if (script.id === 'delete-project') args.push('--yes');

	const stream = new ReadableStream({
		start(controller) {
			const enc = new TextEncoder();
			const trimite = (eveniment: string, date: string) => {
				for (const linie of date.split('\n')) {
					controller.enqueue(enc.encode(`event: ${eveniment}\ndata: ${linie}\n\n`));
				}
			};

			const proces = spawn('python', ['-X', 'utf8', `scripts/${script.fisier}`, ...args], {
				cwd: process.cwd(),
			});

			proces.stdout.on('data', (chunk) => trimite('output', chunk.toString()));
			proces.stderr.on('data', (chunk) => trimite('output', chunk.toString()));

			proces.on('close', (code) => {
				trimite('final', code === 0 ? 'ok' : `eroare (cod ${code})`);
				controller.close();
			});

			proces.on('error', (err) => {
				trimite('eroare', err.message);
				controller.close();
			});
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	});
};
