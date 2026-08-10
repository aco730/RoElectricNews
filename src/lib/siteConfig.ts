import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'site-config.json');
const LOGO_DIR = path.join(process.cwd(), 'public', 'images', 'brand');

export interface SiteConfig {
	header: {
		vizibil: boolean;
		topbarVizibil: boolean;
		topbarText: string;
		topbarLinkuri: { text: string; href: string }[];
		logoImagine: string | null;
		logoTextPrincipal: string;
		logoTextAccent: string;
		cautareVizibila: boolean;
		ctaButoane: { text: string; href: string; primar: boolean }[];
	};
	footer: {
		vizibil: boolean;
		brandText: string;
		brandTextAccent: string;
		descriere: string;
		linkuri: { text: string; href: string }[];
		copyright: string;
	};
}

export async function getSiteConfig(): Promise<SiteConfig> {
	const raw = await readFile(CONFIG_PATH, 'utf-8');
	return JSON.parse(raw) as SiteConfig;
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
	await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export async function saveLogoFile(fileName: string, buffer: Buffer): Promise<string> {
	await mkdir(LOGO_DIR, { recursive: true });
	const safeExt = path.extname(fileName).toLowerCase();
	const finalName = `logo-custom${safeExt}`;
	await writeFile(path.join(LOGO_DIR, finalName), buffer);
	return `/images/brand/${finalName}`;
}
