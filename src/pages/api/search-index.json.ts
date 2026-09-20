import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { categories } from '../../data/categories';
import { readSite } from '../../lib/portofoliuElectricianContent';

export const prerender = true;

interface SearchItem {
	kind: 'articol' | 'pret' | 'intrebare' | 'pagina';
	slug: string;
	title: string;
	meta: string;
	searchText: string;
	data?: string;
}

export const GET: APIRoute = async () => {
	const articole = await getCollection('articole');
	const dinBlog: SearchItem[] = articole.map((art) => {
		const cat = categories.find((c) => c.slug === art.data.categorie);
		return {
			kind: 'articol',
			slug: `/blog/${art.id}`,
			title: art.data.title,
			meta: cat?.name ?? '',
			searchText: art.data.title.toLowerCase(),
			data: String(art.data.data),
		};
	});

	const site = await readSite();
	const dinElectrician: SearchItem[] = [];

	for (const page of site.pages) {
		const pageLink = page.slug ? `/electrician/${page.slug}` : '/electrician';
		const bucatiPagina: string[] = [];

		for (const section of page.sections) {
			const d: any = section.data;
			if (!d) continue;

			if (section.type === 'hero' || section.type === 'cta') {
				if (d.title) bucatiPagina.push(d.title);
				if (d.heading) bucatiPagina.push(d.heading);
				if (d.subtitle) bucatiPagina.push(d.subtitle);
				if (d.text) bucatiPagina.push(d.text);
			}

			if (section.type === 'cardGrid' && Array.isArray(d.cards)) {
				for (const card of d.cards) {
					if (card.title) bucatiPagina.push(card.title);
					if (card.text) bucatiPagina.push(card.text);
				}
			}

			if (section.type === 'faq' && Array.isArray(d.faqItems)) {
				for (const item of d.faqItems) {
					if (!item.question) continue;
					dinElectrician.push({
						kind: 'intrebare',
						slug: pageLink,
						title: item.question,
						meta: page.title,
						searchText: `${item.question} ${item.answer ?? ''}`.toLowerCase(),
					});
				}
			}

			if (section.type === 'pricing' && Array.isArray(d.priceItems)) {
				const numeCurat = (s: string) => s.replace(/^[^\w\dĂÂÎȘȚăâîșț]+/, '').trim();
				const headingSectiune = d.heading ? numeCurat(d.heading) : '';
				for (const item of d.priceItems) {
					if (!item.name) continue;
					const numeItem = numeCurat(item.name);
					const bucati = [headingSectiune, item.name, item.description, item.price, ...(item.bullets ?? [])]
						.filter(Boolean)
						.join(' ');
					const eTierGeneric = /^(buget|standard|premium)$/i.test(numeItem);
					dinElectrician.push({
						kind: 'pret',
						slug: pageLink,
						title: eTierGeneric && headingSectiune ? `${headingSectiune} — ${numeItem}` : numeItem,
						meta: item.price ? `${item.price}${item.unit ? ` ${item.unit}` : ''}` : page.title,
						searchText: bucati.toLowerCase(),
					});
				}
			}
		}

		if (bucatiPagina.length > 0) {
			dinElectrician.push({
				kind: 'pagina',
				slug: pageLink,
				title: page.title,
				meta: 'Site Electrician',
				searchText: bucatiPagina.join(' ').toLowerCase(),
			});
		}
	}

	const index = [...dinElectrician, ...dinBlog];

	return new Response(JSON.stringify(index), {
		headers: { 'Content-Type': 'application/json' },
	});
};
