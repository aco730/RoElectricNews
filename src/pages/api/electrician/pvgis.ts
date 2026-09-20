import type { APIRoute } from 'astro';

export const prerender = false;

interface NominatimResult {
	lat: string;
	lon: string;
	display_name: string;
}

interface PvgisResponse {
	outputs?: {
		totals?: {
			fixed?: {
				E_y?: number; // kWh/an pentru 1 kWp instalat (peakpower=1)
			};
		};
	};
}

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const adresa = url.searchParams.get('adresa')?.trim();

	if (!adresa || adresa.length < 5) {
		return new Response(JSON.stringify({ error: 'Scrie o adresă mai completă (stradă, oraș).' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		// 1. Geocodare adresă -> coordonate, via Nominatim (OpenStreetMap, gratuit).
		// Header User-Agent obligatoriu conform politicii de utilizare Nominatim.
		const geoRes = await fetch(
			`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ro&q=${encodeURIComponent(adresa)}`,
			{ headers: { 'User-Agent': 'SolarElectricPanel-Calculator/1.0 (solarelectricpanel@gmail.com)' } }
		);
		if (!geoRes.ok) throw new Error('Geocodare eșuată');
		const geoData = (await geoRes.json()) as NominatimResult[];
		if (!geoData || geoData.length === 0) {
			return new Response(JSON.stringify({ error: 'Nu am găsit adresa. Încearcă cu stradă, număr și oraș.' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		const { lat, lon, display_name } = geoData[0];

		// 2. Producție reală per kWp, via PVGIS (Comisia Europeană, date satelitare, gratuit).
		// peakpower=1 => E_y e direct kWh/kWp/an. angle=35 și aspect=0 (sud) sunt valori tipice de acoperiș RO.
		const pvgisRes = await fetch(
			`https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lon}&peakpower=1&loss=14&angle=35&aspect=0&outputformat=json`
		);
		if (!pvgisRes.ok) throw new Error('PVGIS indisponibil');
		const pvgisData = (await pvgisRes.json()) as PvgisResponse;
		const yieldPerKWp = pvgisData.outputs?.totals?.fixed?.E_y;

		if (!yieldPerKWp) {
			return new Response(JSON.stringify({ error: 'PVGIS nu a putut calcula pentru această locație (posibil în afara Europei).' }), {
				status: 422,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(
			JSON.stringify({
				yieldPerKWp: Math.round(yieldPerKWp),
				adresaGasita: display_name,
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch {
		return new Response(JSON.stringify({ error: 'A apărut o eroare. Încearcă din nou sau folosește valoarea estimativă.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
