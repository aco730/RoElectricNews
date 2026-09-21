"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import type { Card, FaqItem, NavLink, PriceBreakdownLine, PriceItem, Section } from "@/lib/types";
import { ImageField } from "./ImageField";
import { SECTION_LABELS } from "./SectionRenderer";
import { CATEGORY_LABELS } from "@/lib/photos";

const TEMPLATE_COUNT = 3;

// Tonul textului e independent de varianta de design vizual (șablonul 1/2/3
// e doar aspectul grafic) — orice ton se poate aplica peste orice variantă.
type Tone = "tehnic" | "generic" | "simplu";
const TONES: { id: Tone; label: string }[] = [
  { id: "tehnic", label: "Tehnic" },
  { id: "generic", label: "Generic" },
  { id: "simplu", label: "Foarte simplu" },
];

const EXAMPLE_CONTENT: Partial<Record<string, Record<Tone, Partial<Section["data"]>>>> = {
  hero: {
    tehnic: {
      badge: "Autorizație funcționare ANRE",
      title: "Instalații electrice și sisteme fotovoltaice on-grid, executate conform normativ I7",
      subtitle:
        "Proiectare, dimensionare și punere în funcțiune pentru circuite electrice, tablouri de distribuție și sisteme PV racordate la rețea — cu documentație tehnică completă.",
      ctaText: "Solicită ofertă tehnică",
    },
    generic: {
      badge: "Servicii electrice București-Ilfov",
      title: "Instalații electrice și panouri fotovoltaice, executate de o echipă cu experiență",
      subtitle: "Ne ocupăm de tot: de la o priză nouă până la un sistem complet de panouri solare pentru casa ta.",
      ctaText: "Cere o ofertă",
    },
    simplu: {
      badge: "Sunăm noi înapoi în 10 minute",
      title: "Ai o problemă cu curentul sau vrei panouri solare? Te ajutăm noi.",
      subtitle: "Suni, spui ce ai nevoie, îți spunem exact cât costă și când venim. Simplu.",
      ctaText: "Sună acum",
    },
  },
  cta: {
    tehnic: {
      heading: "Programează o evaluare tehnică on-site",
      text: "Măsurători, expertiză a instalației existente și propunere de soluție conformă normativelor în vigoare.",
      buttonText: "Programează evaluarea",
    },
    generic: {
      heading: "Ai nevoie de un electrician de încredere?",
      text: "Răspundem rapid și venim la fața locului pentru o evaluare gratuită.",
      buttonText: "Contactează-ne",
    },
    simplu: {
      heading: "Ai o întrebare? Scrie-ne, e simplu.",
      text: "Nu trebuie să știi termeni tehnici — spune-ne ce probleme ai și te ajutăm noi să înțelegi ce trebuie făcut.",
      buttonText: "Trimite mesaj",
    },
  },
  faq: {
    tehnic: {
      heading: "Specificații tehnice și conformitate",
      faqItems: [
        {
          id: nanoid(6),
          question: "Ce normativ reglementează execuția instalațiilor electrice interioare?",
          answer:
            "Execuția se face conform normativului I7 (instalații electrice) și, pentru sisteme fotovoltaice racordate la rețea, conform cerințelor de racordare ANRE/distribuitor local.",
        },
        {
          id: nanoid(6),
          question: "Ce documentație primesc după finalizarea lucrării?",
          answer:
            "Primești schema electrică actualizată, buletinul de măsurători (rezistență de dispersie priză de pământ, continuitate PE) și, pentru PV, dosarul de racordare cu certificatele echipamentelor.",
        },
        {
          id: nanoid(6),
          question: "Ce garanție de disipare/randament oferiți pentru un sistem fotovoltaic on-grid?",
          answer:
            "Garanția de produs la panouri e dată de producător (de regulă 12-25 ani liniar pe performanță), iar manopera de instalare e garantată separat de noi conform contractului.",
        },
      ],
    },
    generic: {
      heading: "Întrebări frecvente",
      faqItems: [
        {
          id: nanoid(6),
          question: "Cât durează o lucrare obișnuită?",
          answer: "Depinde de complexitate — o intervenție simplă durează câteva ore, un sistem fotovoltaic complet 1-3 zile.",
        },
        {
          id: nanoid(6),
          question: "Veniți și în afara Bucureștiului?",
          answer: "Da, acoperim București și Ilfov integral.",
        },
        {
          id: nanoid(6),
          question: "Oferiți garanție la lucrările efectuate?",
          answer: "Da, toate lucrările vin cu garanție scrisă, detaliată în ofertă.",
        },
      ],
    },
    simplu: {
      heading: "Ai întrebări? Răspunsuri simple, fără termeni complicați",
      faqItems: [
        {
          id: nanoid(6),
          question: "Cât mă costă?",
          answer: "Suni, ne spui ce ai, îți dăm un preț clar înainte să începem. Nu apar costuri ascunse.",
        },
        {
          id: nanoid(6),
          question: "Cât durează până veniți?",
          answer: "De obicei ajungem în aceeași zi sau a doua zi, în funcție de cât de urgentă e problema.",
        },
        {
          id: nanoid(6),
          question: "Dacă nu funcționează bine după, ce fac?",
          answer: "Ne suni și revenim gratuit — orice am făcut noi e garantat.",
        },
      ],
    },
  },
  pricing: {
    tehnic: { heading: "Grilă de tarife pe categorii de lucrări", text: "Prețuri orientative pe tip de intervenție, conform manoperă și materiale reper de piață." },
    generic: { heading: "Prețuri", text: "Costuri orientative pentru cele mai cerute servicii." },
    simplu: { heading: "Cât costă? Iată pe scurt", text: "Prețuri simple, fără costuri ascunse — sunăm și stabilim exact cât costă la tine." },
  },
  cardGrid: {
    tehnic: { heading: "Servicii tehnice oferite" },
    generic: { heading: "Ce facem" },
    simplu: { heading: "Cu ce te putem ajuta" },
  },
  gallery: {
    tehnic: { heading: "Portofoliu de lucrări executate" },
    generic: { heading: "Portofoliu" },
    simplu: { heading: "Poze de la lucrările noastre" },
  },
  portfolioPreview: {
    tehnic: { heading: "Lucrări recente — documentație foto", text: "Selecție de proiecte finalizate, cu detalii tehnice de execuție." },
    generic: { heading: "Lucrări recente", text: "Câteva proiecte pe care le-am realizat." },
    simplu: { heading: "Uite ce am făcut la alți clienți", text: "Poze reale de la lucrări terminate, ca să vezi calitatea muncii noastre." },
  },
};

function Field({ label, value, onChange, textarea }: { label: string; value?: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      {textarea ? (
        <textarea
          className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          rows={3}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function SectionEditPanel({
  section,
  panelTop = 56,
  onChange,
  onClose,
}: {
  section: Section;
  panelTop?: number;
  onChange: (s: Section) => void;
  onClose: () => void;
}) {
  const d = section.data;
  const set = (patch: Partial<Section["data"]>) => onChange({ ...section, data: { ...d, ...patch } });
  const [tone, setTone] = useState<Tone>("generic");

  return (
    <div
      className="fixed bottom-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-slate-200"
      style={{ top: panelTop }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
        <h3 className="font-bold">{SECTION_LABELS[section.type] ?? section.type}</h3>
        <button onClick={onClose} className="text-slate-500 text-xl leading-none">
          ×
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-500">Șablon design</label>
          <div className="mt-1 flex gap-2">
            {Array.from({ length: TEMPLATE_COUNT }, (_, i) => i + 1).map((t) => (
              <button
                key={t}
                onClick={() => onChange({ ...section, template: t as 1 | 2 | 3 })}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                  section.template === t ? "bg-ink text-white border-ink" : "border-slate-300"
                }`}
              >
                Varianta {t}
              </button>
            ))}
          </div>
        </div>

        {EXAMPLE_CONTENT[section.type] && (
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Ton text (independent de șablonul de design ales mai sus)
            </label>
            <div className="mt-1 flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    tone === t.id ? "bg-ink text-white border-ink" : "border-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => set(EXAMPLE_CONTENT[section.type]![tone])}
              className="mt-2 w-full py-2 rounded-lg text-sm font-semibold border border-dashed border-accent text-accent hover:bg-accent/10"
            >
              Folosește text exemplu ({TONES.find((t) => t.id === tone)!.label.toLowerCase()})
            </button>
          </div>
        )}

        {section.type === "header" && (
          <>
            <Field label="Nume brand" value={d.brand} onChange={(v) => set({ brand: v })} />
            <ImageField label="Logo" value={d.logo} onChange={(v) => set({ logo: v })} />
            <Field label="Telefon" value={d.phone} onChange={(v) => set({ phone: v })} />
            <NavLinksEditor items={d.navLinks ?? []} onChange={(v) => set({ navLinks: v })} />
          </>
        )}

        {section.type === "hero" && (
          <>
            <Field label="Text pilulă (deasupra titlului)" value={d.badge} onChange={(v) => set({ badge: v })} />
            <div>
              <label className="text-xs font-semibold text-slate-500">Formă pilulă</label>
              <div className="mt-1 flex gap-2">
                {([
                  { v: "pill", label: "Rotunjită" },
                  { v: "square", label: "Colțuri drepte" },
                  { v: "none", label: "Ascunsă" },
                ] as const).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => set({ badgeShape: opt.v })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                      (d.badgeShape ?? "pill") === opt.v ? "bg-ink text-white border-ink" : "border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Titlu" value={d.title} onChange={(v) => set({ title: v })} textarea />
            <Field label="Subtitlu" value={d.subtitle} onChange={(v) => set({ subtitle: v })} textarea />
            <ImageField label="Imagine (opțional)" value={d.image} onChange={(v) => set({ image: v })} />
            <Field label="Text buton" value={d.ctaText} onChange={(v) => set({ ctaText: v })} />
            <Field label="Link buton" value={d.ctaLink} onChange={(v) => set({ ctaLink: v })} />
          </>
        )}

        {section.type === "cardGrid" && (
          <>
            <Field label="Titlu secțiune" value={d.heading} onChange={(v) => set({ heading: v })} />
            <CardsEditor items={d.cards ?? []} onChange={(v) => set({ cards: v })} />
          </>
        )}

        {section.type === "cta" && (
          <>
            <Field label="Titlu" value={d.heading} onChange={(v) => set({ heading: v })} />
            <Field label="Text" value={d.text} onChange={(v) => set({ text: v })} textarea />
            <Field label="Text buton" value={d.buttonText} onChange={(v) => set({ buttonText: v })} />
            <Field label="Link buton" value={d.buttonLink} onChange={(v) => set({ buttonLink: v })} />
          </>
        )}

        {section.type === "faq" && (
          <>
            <Field label="Titlu secțiune" value={d.heading} onChange={(v) => set({ heading: v })} />
            <FaqEditor items={d.faqItems ?? []} onChange={(v) => set({ faqItems: v })} />
          </>
        )}

        {section.type === "pricing" && (
          <>
            <Field label="Titlu secțiune" value={d.heading} onChange={(v) => set({ heading: v })} />
            <Field label="Text descriptiv (opțional)" value={d.text} onChange={(v) => set({ text: v })} textarea />
            <PricingEditor items={d.priceItems ?? []} onChange={(v) => set({ priceItems: v })} />
          </>
        )}

        {section.type === "gallery" && (
          <>
            <Field label="Titlu secțiune" value={d.heading} onChange={(v) => set({ heading: v })} />
            <div>
              <label className="text-xs font-semibold text-slate-500">Categorii afișate (nimic bifat = toate)</label>
              <div className="mt-1 space-y-1.5">
                {Object.entries(CATEGORY_LABELS).map(([id, label]) => {
                  const selected = d.galleryCategories ?? [];
                  const checked = selected.includes(id);
                  return (
                    <label key={id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          set({ galleryCategories: e.target.checked ? [...selected, id] : selected.filter((c) => c !== id) })
                        }
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {section.type === "portfolioPreview" && (
          <>
            <Field label="Titlu secțiune" value={d.heading} onChange={(v) => set({ heading: v })} />
            <Field label="Text descriptiv (opțional)" value={d.text} onChange={(v) => set({ text: v })} textarea />
            <Field
              label="Câte proiecte afișate"
              value={String(d.portfolioLimit ?? 8)}
              onChange={(v) => set({ portfolioLimit: Math.max(1, Number(v) || 8) })}
            />
          </>
        )}

        {(section.type === "calcBattery" || section.type === "calcSolar" || section.type === "calcElectric" || section.type === "calcQuick") && (
          <>
            <Field label="Titlu secțiune" value={d.heading} onChange={(v) => set({ heading: v })} />
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Calculator funcțional, cu formulele reale de pe site. Vizitatorii completează datele lor — nu sunt câmpuri de editat aici.
            </p>
          </>
        )}

        {section.type === "footer" && (
          <>
            <Field label="Telefon" value={d.phone} onChange={(v) => set({ phone: v })} />
            <Field label="WhatsApp (+40...)" value={d.whatsapp} onChange={(v) => set({ whatsapp: v })} />
            <Field label="Email" value={d.email} onChange={(v) => set({ email: v })} />
            <Field label="Locație" value={d.location} onChange={(v) => set({ location: v })} />
          </>
        )}
      </div>
    </div>
  );
}

function NavLinksEditor({ items, onChange }: { items: NavLink[]; onChange: (v: NavLink[]) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">Meniu navigare</label>
      <div className="mt-1 space-y-2">
        {items.map((l, i) => (
          <div key={l.id} className="flex gap-2">
            <input
              className="w-1/2 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
              value={l.label}
              onChange={(e) => onChange(items.map((it, ix) => (ix === i ? { ...it, label: e.target.value } : it)))}
            />
            <input
              className="w-1/2 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
              value={l.href}
              onChange={(e) => onChange(items.map((it, ix) => (ix === i ? { ...it, href: e.target.value } : it)))}
            />
            <button onClick={() => onChange(items.filter((_, ix) => ix !== i))} className="text-red-600 text-sm px-1">
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, { id: nanoid(6), label: "Link nou", href: "#" }])}
          className="text-xs font-semibold text-accent"
        >
          + Adaugă link
        </button>
      </div>
    </div>
  );
}

function CardsEditor({ items, onChange }: { items: Card[]; onChange: (v: Card[]) => void }) {
  const update = (i: number, patch: Partial<Card>) => onChange(items.map((it, ix) => (ix === i ? { ...it, ...patch } : it)));
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">Carduri</label>
      <div className="mt-1 space-y-4">
        {items.map((c, i) => (
          <div key={c.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
            <input
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-semibold"
              value={c.title}
              placeholder="Titlu"
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <textarea
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
              rows={2}
              value={c.text}
              placeholder="Text"
              onChange={(e) => update(i, { text: e.target.value })}
            />
            <input
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
              value={c.price ?? ""}
              placeholder="Preț (opțional)"
              onChange={(e) => update(i, { price: e.target.value })}
            />
            <input
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
              value={c.link ?? ""}
              placeholder="Link (opțional)"
              onChange={(e) => update(i, { link: e.target.value })}
            />
            <ImageField label="Imagine" value={c.image} onChange={(v) => update(i, { image: v })} />
            <button onClick={() => onChange(items.filter((_, ix) => ix !== i))} className="text-xs text-red-600 font-semibold">
              Șterge cardul
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, { id: nanoid(6), title: "Card nou", text: "" }])}
          className="text-xs font-semibold text-accent"
        >
          + Adaugă card
        </button>
      </div>
    </div>
  );
}

function FaqEditor({ items, onChange }: { items: FaqItem[]; onChange: (v: FaqItem[]) => void }) {
  const update = (i: number, patch: Partial<FaqItem>) => onChange(items.map((it, ix) => (ix === i ? { ...it, ...patch } : it)));
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">Întrebări</label>
      <div className="mt-1 space-y-3">
        {items.map((f, i) => (
          <div key={f.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
            <input
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-semibold"
              value={f.question}
              placeholder="Întrebare"
              onChange={(e) => update(i, { question: e.target.value })}
            />
            <textarea
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
              rows={2}
              value={f.answer}
              placeholder="Răspuns"
              onChange={(e) => update(i, { answer: e.target.value })}
            />
            <button onClick={() => onChange(items.filter((_, ix) => ix !== i))} className="text-xs text-red-600 font-semibold">
              Șterge întrebarea
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, { id: nanoid(6), question: "Întrebare nouă", answer: "" }])}
          className="text-xs font-semibold text-accent"
        >
          + Adaugă întrebare
        </button>
      </div>
    </div>
  );
}

function PricingEditor({ items, onChange }: { items: PriceItem[]; onChange: (v: PriceItem[]) => void }) {
  const update = (i: number, patch: Partial<PriceItem>) => onChange(items.map((it, ix) => (ix === i ? { ...it, ...patch } : it)));
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">Prețuri</label>
      <div className="mt-1 space-y-3">
        {items.map((p, i) => (
          <div key={p.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
            <ImageField label="Poză produs (opțional)" value={p.image} onChange={(v) => update(i, { image: v })} />
            <input
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-semibold"
              value={p.name}
              placeholder="Denumire serviciu"
              onChange={(e) => update(i, { name: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                className="w-1/2 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                value={p.price}
                placeholder="Preț (ex: 250 RON)"
                onChange={(e) => update(i, { price: e.target.value })}
              />
              <input
                className="w-1/2 border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                value={p.unit ?? ""}
                placeholder="Unitate (ex: /buc)"
                onChange={(e) => update(i, { unit: e.target.value })}
              />
            </div>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
              rows={2}
              value={p.description ?? ""}
              placeholder="Descriere (opțional)"
              onChange={(e) => update(i, { description: e.target.value })}
            />
            <BreakdownEditor
              lines={p.breakdown ?? []}
              onChange={(v) => update(i, { breakdown: v })}
            />
            <textarea
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              rows={2}
              value={p.sourceNote ?? ""}
              placeholder="Notă surse (opțional, ex: prețuri electricon.ro, manoperă reper de piață)"
              onChange={(e) => update(i, { sourceNote: e.target.value })}
            />
            <input
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              value={p.sourceUrl ?? ""}
              placeholder="Link sursă (opțional) — cardul devine clicabil, deschide în tab nou"
              onChange={(e) => update(i, { sourceUrl: e.target.value })}
            />
            <button onClick={() => onChange(items.filter((_, ix) => ix !== i))} className="text-xs text-red-600 font-semibold">
              Șterge
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, { id: nanoid(6), name: "Serviciu nou", price: "0 RON — de completat" }])}
          className="text-xs font-semibold text-accent"
        >
          + Adaugă preț
        </button>
      </div>
    </div>
  );
}

function BreakdownEditor({ lines, onChange }: { lines: PriceBreakdownLine[]; onChange: (v: PriceBreakdownLine[]) => void }) {
  const update = (i: number, patch: Partial<PriceBreakdownLine>) => onChange(lines.map((l, ix) => (ix === i ? { ...l, ...patch } : l)));
  return (
    <div className="border-t border-slate-200 pt-2">
      <label className="text-[11px] font-semibold text-slate-400">Defalcare (linii de cost)</label>
      <div className="mt-1 space-y-1.5">
        {lines.map((l, i) => (
          <div key={l.id} className="space-y-1 border border-slate-100 rounded-md p-1.5">
            <div className="flex gap-1.5 items-center">
              <input
                className="w-1/2 border border-slate-300 rounded-md px-2 py-1 text-xs"
                value={l.label}
                placeholder="Etichetă (ex: Spart și pozat cabluri)"
                onChange={(e) => update(i, { label: e.target.value })}
              />
              <input
                className="w-1/3 border border-slate-300 rounded-md px-2 py-1 text-xs"
                value={l.amount}
                placeholder="Sumă"
                onChange={(e) => update(i, { amount: e.target.value })}
              />
              <label className="flex items-center gap-1 text-[10px]">
                <input type="checkbox" checked={!!l.highlight} onChange={(e) => update(i, { highlight: e.target.checked })} />
                evid.
              </label>
              <button onClick={() => onChange(lines.filter((_, ix) => ix !== i))} className="text-red-600 text-xs px-1">
                ×
              </button>
            </div>
            <input
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-[11px]"
              value={l.url ?? ""}
              placeholder="Link produs (opțional) — linia devine clicabilă"
              onChange={(e) => update(i, { url: e.target.value })}
            />
          </div>
        ))}
        <button
          onClick={() => onChange([...lines, { id: nanoid(6), label: "Linie nouă", amount: "0 lei" }])}
          className="text-[11px] font-semibold text-accent"
        >
          + Adaugă linie
        </button>
      </div>
    </div>
  );
}
