import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();

export type StareVerificare = 'ok' | 'atentie' | 'eroare';

export interface RezultatVerificare {
	label: string;
	stare: StareVerificare;
	detaliu: string;
}

export interface RezultatCategorie {
	categorie: string;
	titlu: string;
	rezultate: RezultatVerificare[];
}

async function existaFisier(relPath: string): Promise<boolean> {
	try {
		await access(path.join(ROOT, relPath));
		return true;
	} catch {
		return false;
	}
}

async function citesteSigur(relPath: string): Promise<string | null> {
	try {
		return await readFile(path.join(ROOT, relPath), 'utf-8');
	} catch {
		return null;
	}
}

// --- Build & erori cod ---
async function verificaBuild(): Promise<RezultatCategorie> {
	const rezultate: RezultatVerificare[] = [];
	try {
		const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
		const { stdout, stderr } = await execFileAsync(npxCmd, ['astro', 'build'], {
			cwd: ROOT,
			timeout: 5 * 60 * 1000,
			maxBuffer: 20 * 1024 * 1024,
		});
		const output = stdout + stderr;
		const areAvertismente = /warn/i.test(output);
		rezultate.push({
			label: 'astro build',
			stare: areAvertismente ? 'atentie' : 'ok',
			detaliu: areAvertismente ? 'Build reușit, dar cu avertismente în log — vezi detalii.' : 'Build reușit fără erori.',
		});
	} catch (e: any) {
		rezultate.push({
			label: 'astro build',
			stare: 'eroare',
			detaliu: `Build eșuat: ${(e.stderr || e.stdout || e.message || '').toString().slice(0, 1500)}`,
		});
	}
	return { categorie: 'build', titlu: 'Build & erori cod', rezultate };
}

// --- Securitate (verificări statice pe cod, fără să rulăm nimic) ---
async function verificaSecuritate(): Promise<RezultatCategorie> {
	const rezultate: RezultatVerificare[] = [];

	const articoleTs = await citesteSigur('src/lib/articole.ts');
	rezultate.push({
		label: 'Validare slug articole (path traversal)',
		stare: articoleTs?.includes('SLUG_RE') ? 'ok' : 'eroare',
		detaliu: articoleTs?.includes('SLUG_RE')
			? 'slug-ul e validat cu allow-list înainte de a fi folosit în cale de fișier.'
			: 'Nu am găsit validare de slug în src/lib/articole.ts — risc de path traversal.',
	});

	const uploadImg = await citesteSigur('src/pages/api/admin/upload-imagine-articol.ts');
	rezultate.push({
		label: 'Extensie imagine articol determinată din tip real',
		stare: uploadImg?.includes('EXTENSIE_PENTRU_TIP') ? 'ok' : 'eroare',
		detaliu: uploadImg?.includes('EXTENSIE_PENTRU_TIP')
			? 'Extensia fișierului salvat vine din Content-Type validat, nu din numele trimis de utilizator.'
			: 'Extensia încă vine din numele fișierului — risc de upload cu extensie falsă.',
	});

	const uploadLogo = await citesteSigur('src/pages/api/admin/upload-logo.ts');
	rezultate.push({
		label: 'SVG dezactivat la upload logo',
		stare: uploadLogo && !uploadLogo.includes('image/svg+xml') ? 'ok' : 'atentie',
		detaliu:
			uploadLogo && !uploadLogo.includes('image/svg+xml')
				? 'SVG nu mai e acceptat la upload logo (SVG poate conține JS executabil).'
				: 'Upload de SVG e încă permis la logo — poate conține JS executabil dacă e servit direct.',
	});

	const uploadPoze = await citesteSigur('src/pages/api/admin/portofoliu/upload-poze.ts');
	rezultate.push({
		label: 'Nume folder portofoliu validat (path traversal)',
		stare: uploadPoze?.includes("curat === '..'") ? 'ok' : 'eroare',
		detaliu: uploadPoze?.includes("curat === '..'")
			? "Numele de folder respinge explicit '.' și '..'."
			: "Numele de folder nu respinge '..' — risc de scriere în afara folderului poze-noi/.",
	});

	const layout = await citesteSigur('src/layouts/Layout.astro');
	rezultate.push({
		label: 'Escapare JSON-LD (</script> injection)',
		stare: layout?.includes("replace(/</g, '\\\\u003c')") || layout?.includes('u003c') ? 'ok' : 'atentie',
		detaliu: layout?.includes('u003c')
			? 'Datele structurate JSON-LD sunt escapate înainte de a fi injectate în <script>.'
			: 'JSON-LD nu pare escapat — un titlu cu "</script>" ar putea rupe pagina.',
	});

	const middleware = await citesteSigur('src/middleware.ts');
	rezultate.push({
		label: 'Admin blocat automat pe Netlify',
		stare: middleware?.includes('NETLIFY') ? 'ok' : 'atentie',
		detaliu: middleware?.includes('NETLIFY')
			? '/admin și /api/admin sunt blocate cu 404 când rulează pe Netlify.'
			: 'Nu am găsit blocarea automată a adminului pe Netlify în middleware — verifică manual.',
	});

	const envRaw = await citesteSigur('.env');
	const gitignore = await citesteSigur('.gitignore');
	rezultate.push({
		label: '.env exclus din git',
		stare: gitignore?.split('\n').some((l) => l.trim() === '.env') ? 'ok' : 'atentie',
		detaliu: gitignore?.split('\n').some((l) => l.trim() === '.env')
			? '.env este listat în .gitignore.'
			: 'Nu am găsit ".env" explicit în .gitignore — verifică să nu ajungă commis din greșeală.',
	});
	void envRaw;

	return { categorie: 'securitate', titlu: 'Securitate', rezultate };
}

// --- GDPR / Legal ---
async function verificaLegal(): Promise<RezultatCategorie> {
	const rezultate: RezultatVerificare[] = [];
	const raw = await citesteSigur('src/data/legal-config.json');
	if (!raw) {
		rezultate.push({ label: 'legal-config.json', stare: 'eroare', detaliu: 'Fișierul lipsește.' });
		return { categorie: 'legal', titlu: 'GDPR / Legal', rezultate };
	}
	const config = JSON.parse(raw) as Record<string, unknown>;
	const campuriObligatorii = ['denumireFirma', 'cui', 'nrRegistruComert', 'adresaSediu', 'emailContact', 'telefonContact'];
	for (const camp of campuriObligatorii) {
		const valoare = String(config[camp] ?? '');
		const needcompletat = !valoare || valoare.includes('DE COMPLETAT');
		rezultate.push({
			label: `Câmp legal: ${camp}`,
			stare: needcompletat ? 'eroare' : 'ok',
			detaliu: needcompletat ? 'Needcompletat — apare ca placeholder pe pagina de transparență/confidențialitate.' : `Completat: "${valoare}".`,
		});
	}

	const folosesteAnalytics = Boolean(config.foloseșteAnalytics);
	const areBannerCookie = (await existaFisier('src/components/CookieBanner.astro')) || (await existaFisier('src/components/ConsimtamantCookie.astro'));
	rezultate.push({
		label: 'Banner consimțământ cookie-uri',
		stare: !folosesteAnalytics ? 'ok' : areBannerCookie ? 'ok' : 'atentie',
		detaliu: !folosesteAnalytics
			? 'Analytics dezactivat în config — bannerul de cookie nu e obligatoriu momentan.'
			: areBannerCookie
				? 'Analytics activ și banner de cookie găsit.'
				: 'Analytics activ (foloseșteAnalytics: true) dar nu am găsit o componentă de banner cookie — necesar legal (ePrivacy/GDPR) dacă se folosesc cookie-uri non-esențiale.',
	});

	const areTermeni = await existaFisier('src/pages/termeni-si-conditii.astro');
	rezultate.push({
		label: 'Pagină Termeni și Condiții',
		stare: areTermeni ? 'ok' : 'atentie',
		detaliu: areTermeni ? 'Pagina există.' : 'Nu există o pagină dedicată de Termeni și Condiții (separată de Confidențialitate/Transparență).',
	});

	return { categorie: 'legal', titlu: 'GDPR / Legal', rezultate };
}

// --- SEO & indexare AI + git ---
async function verificaSeoSiGit(): Promise<RezultatCategorie> {
	const rezultate: RezultatVerificare[] = [];

	const robots = await citesteSigur('public/robots.txt');
	rezultate.push({
		label: 'robots.txt',
		stare: robots?.includes('Sitemap:') ? 'ok' : 'atentie',
		detaliu: robots?.includes('Sitemap:') ? 'Există și indică sitemap-ul.' : 'Lipsește sau nu indică Sitemap:.',
	});

	const llms = await citesteSigur('public/llms.txt');
	rezultate.push({
		label: 'llms.txt (indexare pentru agenți AI)',
		stare: llms ? 'ok' : 'atentie',
		detaliu: llms ? `Există (${llms.length} caractere).` : 'Lipsește — recomandat pentru ca agenții AI (ChatGPT, Claude, Perplexity) să înțeleagă rapid site-ul.',
	});

	const llmsFull = (await existaFisier('public/llms-full.txt')) || (await existaFisier('public/ai.txt'));
	rezultate.push({
		label: 'llms-full.txt / ai.txt (variantă extinsă)',
		stare: llmsFull ? 'ok' : 'atentie',
		detaliu: llmsFull ? 'Există o variantă extinsă.' : 'Opțional, dar util: o listă mai detaliată de conținut pentru agenți AI, dincolo de llms.txt de bază.',
	});

	const sitemapIntegration = (await citesteSigur('astro.config.mjs'))?.includes('@astrojs/sitemap');
	rezultate.push({
		label: 'Sitemap generat automat la build',
		stare: sitemapIntegration ? 'ok' : 'eroare',
		detaliu: sitemapIntegration ? 'Integrarea @astrojs/sitemap e activă.' : 'Nu am găsit integrarea de sitemap în astro.config.mjs.',
	});

	try {
		const { stdout } = await execFileAsync('git', ['status', '--porcelain'], { cwd: ROOT });
		const linii = stdout.split('\n').filter(Boolean);
		rezultate.push({
			label: 'Git — fișiere de sincronizat',
			stare: linii.length === 0 ? 'ok' : 'atentie',
			detaliu: linii.length === 0 ? 'Nimic de commis — totul e sincronizat.' : `${linii.length} fișiere modificate/noi/șterse, necommise încă.`,
		});
	} catch {
		rezultate.push({ label: 'Git — fișiere de sincronizat', stare: 'atentie', detaliu: 'Nu am putut rula git status.' });
	}

	try {
		const { stdout } = await execFileAsync('git', ['rev-list', '--count', '@{u}..HEAD'], { cwd: ROOT });
		const nr = parseInt(stdout.trim(), 10) || 0;
		rezultate.push({
			label: 'Git — commit-uri neîmpinse pe remote',
			stare: nr === 0 ? 'ok' : 'atentie',
			detaliu: nr === 0 ? 'Tot ce e commis a fost și trimis (push).' : `${nr} commit-uri locale nu au fost încă trimise (git push).`,
		});
	} catch {
		rezultate.push({ label: 'Git — commit-uri neîmpinse pe remote', stare: 'atentie', detaliu: 'Nu am putut compara cu branch-ul remote (poate lipsește tracking).' });
	}

	return { categorie: 'seo-git', titlu: 'SEO & indexare AI + Git', rezultate };
}

export async function ruleazaAudit(categorii: string[]): Promise<RezultatCategorie[]> {
	const rezultate: RezultatCategorie[] = [];
	if (categorii.includes('build')) rezultate.push(await verificaBuild());
	if (categorii.includes('securitate')) rezultate.push(await verificaSecuritate());
	if (categorii.includes('legal')) rezultate.push(await verificaLegal());
	if (categorii.includes('seo-git')) rezultate.push(await verificaSeoSiGit());
	return rezultate;
}
