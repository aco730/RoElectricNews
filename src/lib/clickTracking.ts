import { getStore } from '@netlify/blobs';

export type CtaButton = 'whatsapp' | 'phone';
export type CtaVariant = 'master' | 'test-whatsapp-primary';

export function currentVariant(): CtaVariant {
	const branch = process.env.BRANCH || process.env.HEAD || 'master';
	return branch === 'test-whatsapp-primary' ? 'test-whatsapp-primary' : 'master';
}

function statsStore() {
	// Local `astro dev` (Node adapter) nu are context Netlify — Blobs nu functioneaza acolo.
	return getStore({ name: 'hero-cta-clicks', consistency: 'strong' });
}

interface Counts {
	[key: string]: number; // cheie: "<variant>:<button>"
}

export async function recordClick(variant: CtaVariant, button: CtaButton): Promise<void> {
	const store = statsStore();
	const key = `${variant}:${button}`;
	const current = (await store.get('counts', { type: 'json' })) as Counts | null;
	const counts: Counts = current || {};
	counts[key] = (counts[key] || 0) + 1;
	await store.setJSON('counts', counts);
}

export async function readClickCounts(): Promise<Counts> {
	const store = statsStore();
	const current = (await store.get('counts', { type: 'json' })) as Counts | null;
	return current || {};
}
