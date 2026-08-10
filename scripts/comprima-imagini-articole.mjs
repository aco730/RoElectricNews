// Convertește imaginile din public/images/articole/ (jpg/png) în WebP, redimensionate.
// Mută originalele într-un folder de backup și actualizează frontmatter-ul articolelor.
import { readdir, readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, 'public', 'images', 'articole');
const BACKUP_DIR = path.join(ROOT, 'public', 'images', 'articole-originale-backup');
const ARTICOLE_DIR = path.join(ROOT, 'src', 'content', 'articole');

const MAX_WIDTH = 1200;
const QUALITY = 80;

async function main() {
	const fisiere = (await readdir(IMG_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
	console.log(`Găsite ${fisiere.length} imagini de convertit.`);

	await mkdir(BACKUP_DIR, { recursive: true });

	let totalÎnainte = 0;
	let totalDupă = 0;
	const conversii = [];

	for (const fisier of fisiere) {
		const inputPath = path.join(IMG_DIR, fisier);
		const numeBază = fisier.replace(/\.(jpe?g|png)$/i, '');
		const outputPath = path.join(IMG_DIR, `${numeBază}.webp`);

		const statOriginal = await stat(inputPath);
		totalÎnainte += statOriginal.size;

		await sharp(inputPath)
			.resize({ width: MAX_WIDTH, withoutEnlargement: true })
			.webp({ quality: QUALITY })
			.toFile(outputPath);

		const statNou = await stat(outputPath);
		totalDupă += statNou.size;

		await rename(inputPath, path.join(BACKUP_DIR, fisier));

		conversii.push({ vechi: fisier, nou: `${numeBază}.webp` });
		console.log(`${fisier} (${(statOriginal.size / 1024).toFixed(0)}KB) → ${numeBază}.webp (${(statNou.size / 1024).toFixed(0)}KB)`);
	}

	// actualizează frontmatter-ul articolelor care refereau vechile fișiere
	const mapareExtensii = new Map(conversii.map((c) => [`/images/articole/${c.vechi}`, `/images/articole/${c.nou}`]));
	const articoleFisiere = (await readdir(ARTICOLE_DIR)).filter((f) => f.endsWith('.md'));
	let articoleActualizate = 0;

	for (const f of articoleFisiere) {
		const filePath = path.join(ARTICOLE_DIR, f);
		let conținut = await readFile(filePath, 'utf-8');
		let schimbat = false;
		for (const [vechi, nou] of mapareExtensii) {
			if (conținut.includes(vechi)) {
				conținut = conținut.split(vechi).join(nou);
				schimbat = true;
			}
		}
		if (schimbat) {
			await writeFile(filePath, conținut, 'utf-8');
			articoleActualizate++;
		}
	}

	console.log(`\nTotal înainte: ${(totalÎnainte / 1024 / 1024).toFixed(2)}MB`);
	console.log(`Total după: ${(totalDupă / 1024 / 1024).toFixed(2)}MB`);
	console.log(`Reducere: ${(100 - (totalDupă / totalÎnainte) * 100).toFixed(1)}%`);
	console.log(`Articole actualizate: ${articoleActualizate}`);
	console.log(`Originale mutate în: public/images/articole-originale-backup/`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
