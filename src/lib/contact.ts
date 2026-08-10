import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CONTACT_PATH = path.join(process.cwd(), 'src', 'data', 'contact-config.json');

export interface ContactConfig {
	telefon: string;
	email: string;
	adresa: string;
	zonaDeservita: string;
	program: string;
	descriere: string;
	hartaEmbedUrl: string;
	formularVizibil: boolean;
}

export async function getContact(): Promise<ContactConfig> {
	const raw = await readFile(CONTACT_PATH, 'utf-8');
	return JSON.parse(raw) as ContactConfig;
}

export async function saveContact(config: ContactConfig): Promise<void> {
	await writeFile(CONTACT_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}
