import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'data', 'site-config.json');
const LOGO_DIR = path.join(process.cwd(), 'public', 'images', 'brand');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

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

export async function saveLogoFile(mimeType: string, buffer: Buffer): Promise<string> {
	const extensiePentruTip: Record<string, string> = {
		'image/png': '.png',
		'image/jpeg': '.jpg',
		'image/webp': '.webp',
	};
	const ext = extensiePentruTip[mimeType];
	if (!ext) throw new Error('Tip de fișier neacceptat');
	await mkdir(LOGO_DIR, { recursive: true });
	const finalName = `logo-custom${ext}`;
	await writeFile(path.join(LOGO_DIR, finalName), buffer);
	return `/images/brand/${finalName}`;
}

export async function genereazaFaviconDinBuffer(buffer: Buffer): Promise<void> {
	const sursa = sharp(buffer).ensureAlpha();
	await sursa
		.clone()
		.resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png()
		.toFile(path.join(PUBLIC_DIR, 'favicon.png'));
	await sursa
		.clone()
		.resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png()
		.toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
}
