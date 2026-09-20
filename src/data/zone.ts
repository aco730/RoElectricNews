export interface Zona {
	slug: string;
	nume: string;
	tip: "sector" | "ilfov";
}

export const zone: Zona[] = [
	{ slug: "sector-1", nume: "Sectorul 1", tip: "sector" },
	{ slug: "sector-2", nume: "Sectorul 2", tip: "sector" },
	{ slug: "sector-3", nume: "Sectorul 3", tip: "sector" },
	{ slug: "sector-4", nume: "Sectorul 4", tip: "sector" },
	{ slug: "sector-5", nume: "Sectorul 5", tip: "sector" },
	{ slug: "sector-6", nume: "Sectorul 6", tip: "sector" },
	{ slug: "voluntari", nume: "Voluntari", tip: "ilfov" },
	{ slug: "otopeni", nume: "Otopeni", tip: "ilfov" },
	{ slug: "pipera", nume: "Pipera", tip: "ilfov" },
	{ slug: "popesti-leordeni", nume: "Popești-Leordeni", tip: "ilfov" },
	{ slug: "bragadiru", nume: "Bragadiru", tip: "ilfov" },
	{ slug: "chiajna", nume: "Chiajna", tip: "ilfov" },
	{ slug: "buftea", nume: "Buftea", tip: "ilfov" },
	{ slug: "corbeanca", nume: "Corbeanca", tip: "ilfov" },
	{ slug: "domnesti", nume: "Domnești", tip: "ilfov" },
	{ slug: "magurele", nume: "Măgurele", tip: "ilfov" },
];
