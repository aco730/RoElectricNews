import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CTA_PATH = path.join(process.cwd(), 'src', 'data', 'cta-config.json');

export interface CtaBloc {
	titlu: string;
	text: string;
	textButon: string;
	linkButon: string;
}

export interface CtaConfig {
	blog: CtaBloc;
	portofoliu: CtaBloc;
	servicii: CtaBloc;
}

export async function getCtaConfig(): Promise<CtaConfig> {
	const raw = await readFile(CTA_PATH, 'utf-8');
	return JSON.parse(raw) as CtaConfig;
}

export async function saveCtaConfig(config: CtaConfig): Promise<void> {
	await writeFile(CTA_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}
