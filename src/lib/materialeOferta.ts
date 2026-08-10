import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as XLSX from 'xlsx';

const XLSX_PATH = path.join(process.cwd(), 'public', 'data', 'materiale-oferta.xlsx');
const SHEET_NAME = 'Materiale generator';

export interface Material {
	rândId: number;
	categorie: string;
	tip: string;
	tier: string;
	produs: string;
	specificatie: string;
	pretUnitar: number;
	um: string;
	furnizor: string;
	link: string;
	dataPret: string;
	putereWpPanou: number | '';
	capacitateKWhBaterie: number | '';
	putereKWInvertor: number | '';
	putereDescarcareKWBaterie: number | '';
	observatii: string;
	imagineURL: string;
	fisaTehnicaURL: string;
}

const COLOANE = [
	'Categorie', 'Tip', 'Tier', 'Produs', 'Specificatie', 'PretUnitar', 'UM', 'Furnizor', 'Link',
	'DataPret', 'PutereWp_Panou', 'CapacitateKWh_Baterie', 'PutereKW_Invertor',
	'PutereDescarcareKW_Baterie', 'Observatii', 'ImagineURL', 'FisaTehnicaURL',
] as const;

function citireCelulă(v: unknown): string {
	return v === undefined || v === null ? '' : String(v).trim();
}
function citireNumăr(v: unknown): number | '' {
	if (v === undefined || v === null || v === '') return '';
	const n = Number(v);
	return Number.isFinite(n) ? n : '';
}

export async function getMateriale(): Promise<Material[]> {
	const buf = await readFile(XLSX_PATH);
	const wb = XLSX.read(buf, { type: 'buffer' });
	const ws = wb.Sheets[SHEET_NAME];
	const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

	const headerIdx = rows.findIndex((r) => citireCelulă(r[0]) === 'Categorie');
	if (headerIdx === -1) return [];
	const headers = rows[headerIdx].map((h) => citireCelulă(h));
	const col = (name: string) => headers.indexOf(name);
	const idx = Object.fromEntries(COLOANE.map((c) => [c, col(c)])) as Record<(typeof COLOANE)[number], number>;

	const rezultat: Material[] = [];
	for (let i = headerIdx + 1; i < rows.length; i++) {
		const r = rows[i];
		if (!r || citireCelulă(r[idx.Categorie]) === '') continue;
		rezultat.push({
			rândId: i,
			categorie: citireCelulă(r[idx.Categorie]),
			tip: citireCelulă(r[idx.Tip]),
			tier: citireCelulă(r[idx.Tier]),
			produs: citireCelulă(r[idx.Produs]),
			specificatie: citireCelulă(r[idx.Specificatie]),
			pretUnitar: citireNumăr(r[idx.PretUnitar]) || 0,
			um: citireCelulă(r[idx.UM]),
			furnizor: citireCelulă(r[idx.Furnizor]),
			link: citireCelulă(r[idx.Link]),
			dataPret: citireCelulă(r[idx.DataPret]),
			putereWpPanou: citireNumăr(r[idx.PutereWp_Panou]),
			capacitateKWhBaterie: citireNumăr(r[idx.CapacitateKWh_Baterie]),
			putereKWInvertor: citireNumăr(r[idx.PutereKW_Invertor]),
			putereDescarcareKWBaterie: citireNumăr(r[idx.PutereDescarcareKW_Baterie]),
			observatii: citireCelulă(r[idx.Observatii]),
			imagineURL: citireCelulă(r[idx.ImagineURL]),
			fisaTehnicaURL: citireCelulă(r[idx.FisaTehnicaURL]),
		});
	}
	return rezultat;
}

export async function saveMateriale(materiale: Omit<Material, 'rândId'>[]): Promise<void> {
	const buf = await readFile(XLSX_PATH);
	const wb = XLSX.read(buf, { type: 'buffer' });
	const ws = wb.Sheets[SHEET_NAME];
	const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

	const headerIdx = rows.findIndex((r) => citireCelulă(r[0]) === 'Categorie');
	if (headerIdx === -1) throw new Error('Nu găsesc rândul de antet "Categorie" în sheet-ul Materiale generator.');
	const headers = rows[headerIdx].map((h) => citireCelulă(h));
	const col = (name: string) => headers.indexOf(name);

	const rândNou = (m: Omit<Material, 'rândId'>): unknown[] => {
		const linie: unknown[] = new Array(headers.length).fill('');
		linie[col('Categorie')] = m.categorie;
		linie[col('Tip')] = m.tip;
		linie[col('Tier')] = m.tier;
		linie[col('Produs')] = m.produs;
		linie[col('Specificatie')] = m.specificatie;
		linie[col('PretUnitar')] = m.pretUnitar;
		linie[col('UM')] = m.um;
		linie[col('Furnizor')] = m.furnizor;
		linie[col('Link')] = m.link;
		linie[col('DataPret')] = m.dataPret;
		if (col('PutereWp_Panou') >= 0) linie[col('PutereWp_Panou')] = m.putereWpPanou;
		if (col('CapacitateKWh_Baterie') >= 0) linie[col('CapacitateKWh_Baterie')] = m.capacitateKWhBaterie;
		if (col('PutereKW_Invertor') >= 0) linie[col('PutereKW_Invertor')] = m.putereKWInvertor;
		if (col('PutereDescarcareKW_Baterie') >= 0) linie[col('PutereDescarcareKW_Baterie')] = m.putereDescarcareKWBaterie;
		if (col('Observatii') >= 0) linie[col('Observatii')] = m.observatii;
		if (col('ImagineURL') >= 0) linie[col('ImagineURL')] = m.imagineURL;
		if (col('FisaTehnicaURL') >= 0) linie[col('FisaTehnicaURL')] = m.fisaTehnicaURL;
		return linie;
	};

	const rândurileNoi = materiale.map(rândNou);
	const rowsFinale = [...rows.slice(0, headerIdx + 1), ...rândurileNoi];

	const wsNou = XLSX.utils.aoa_to_sheet(rowsFinale);
	wb.Sheets[SHEET_NAME] = wsNou;

	const outBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
	await writeFile(XLSX_PATH, outBuf);
}
