import type { ArticolMeta } from './articole';

const STOPWORDS = new Set([
	'de', 'la', 'in', 'si', 'ce', 'pe', 'cu', 'un', 'o', 'ai', 'a', 'e', 'ca', 'sau',
	'nu', 'mai', 'din', 'pentru', 'care', 'cum', 'ghid', 'vs', 'este', 'sunt', 'noi', 'nou',
	'te', 'costa', 'costurile', 'costuri', 'cat', '2026', '2025', '2027',
]);

export function normalizeazaTokeni(titlu: string): Set<string> {
	return new Set(
		titlu
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/[^a-z0-9\s]/g, ' ')
			.split(/\s+/)
			.filter((w) => w.length > 2 && !STOPWORDS.has(w))
	);
}

function jaccard(a: Set<string>, b: Set<string>): number {
	const inter = [...a].filter((x) => b.has(x)).length;
	const union = new Set([...a, ...b]).size;
	return union === 0 ? 0 : inter / union;
}

export interface PerechePotentialDuplicat {
	a: string;
	b: string;
	titluA: string;
	titluB: string;
	scorTitlu: number;
	sursaComuna: boolean;
	sursaUrl?: string;
}

export function detecteazaDuplicate(articole: ArticolMeta[], pragTitlu = 0.3): PerechePotentialDuplicat[] {
	const tokeni = articole.map((a) => normalizeazaTokeni(a.title));
	const perechi: PerechePotentialDuplicat[] = [];

	for (let i = 0; i < articole.length; i++) {
		for (let j = i + 1; j < articole.length; j++) {
			const scorTitlu = jaccard(tokeni[i], tokeni[j]);
			const sursaComuna =
				!!articole[i].sursaUrl &&
				/^https?:\/\//.test(articole[i].sursaUrl) &&
				articole[i].sursaUrl === articole[j].sursaUrl;

			if (scorTitlu >= pragTitlu || sursaComuna) {
				perechi.push({
					a: articole[i].slug,
					b: articole[j].slug,
					titluA: articole[i].title,
					titluB: articole[j].title,
					scorTitlu,
					sursaComuna,
					sursaUrl: sursaComuna ? articole[i].sursaUrl : undefined,
				});
			}
		}
	}

	return perechi.sort((x, y) => (y.scorTitlu + (y.sursaComuna ? 0.5 : 0)) - (x.scorTitlu + (x.sursaComuna ? 0.5 : 0)));
}
