"use client";

import { useMemo, useState } from "react";
import type { SectionData } from "@/lib/types";
import { ELECTRIC_MP_RATE, ELECTRIC_PRICES, electricCostFor, fmtRON } from "@/lib/calculators";
import { CalcSection } from "./calc/CalcUI";

interface BreakdownLine {
  label: string;
  amount: string;
  highlight?: boolean;
}

interface Estimate {
  text: string;
  meta: string;
  intro: string;
  breakdown: BreakdownLine[];
  altNote?: string;
  sourceNote: string;
  detailLink: { href: string; label: string };
}

type Space = "apartament" | "casa" | "comercial";
type Need = "reparatie" | "renovare" | "fotovoltaic";

const SPACE_OPTIONS: { value: Space; label: string }[] = [
  { value: "apartament", label: "🏢 Apartament" },
  { value: "casa", label: "🏠 Casă / Vilă" },
  { value: "comercial", label: "🏭 Spațiu Comercial" },
];

const NEED_OPTIONS: { value: Need; label: string }[] = [
  { value: "reparatie", label: "🚨 Reparație / Urgență" },
  { value: "renovare", label: "🔧 Renovare Totală" },
  { value: "fotovoltaic", label: "☀️ Panouri Fotovoltaice" },
];

const SPACE_LABEL: Record<Space, string> = { apartament: "Apartament", casa: "Casă / Vilă", comercial: "Spațiu Comercial" };
const NEED_LABEL: Record<Need, string> = { reparatie: "Reparație / Urgență", renovare: "Renovare Totală", fotovoltaic: "Panouri Fotovoltaice" };

const RENO_DEFAULTS: Record<Space, { area: number; circuits: number; panelType: "mono" | "tri" }> = {
  apartament: { area: 70, circuits: 4, panelType: "mono" },
  casa: { area: 120, circuits: 6, panelType: "mono" },
  comercial: { area: 220, circuits: 8, panelType: "tri" },
};

function range(min: number, max: number) {
  return `${fmtRON(min)} – ${fmtRON(max)} lei`;
}

function estimateFor(space: Space, need: Need): Estimate {
  if (need === "reparatie") {
    return {
      text: "de la 100 lei/oră",
      meta: "Deplasare inclusă în București. Prețul final se stabilește pe loc, după diagnoză reală.",
      intro: "Nu dăm sume la telefon — venim, testăm efectiv unde e problema, apoi stabilim clar ce trebuie reparat și cât costă.",
      breakdown: [
        { label: "Tarif diagnoză + intervenție", amount: "100 lei / oră, de la" },
        { label: "Deplasare în București", amount: "inclusă" },
        { label: "Dacă alegi să faci lucrarea cu noi, taxa se scade din prețul final", amount: "✓", highlight: true },
      ],
      sourceNote: "Tarif real, aplicat identic pe pagina Electrician.",
      detailLink: { href: "/electrician", label: "Vezi toate prețurile de electrician →" },
    };
  }

  if (need === "renovare") {
    const d = RENO_DEFAULTS[space];
    const lights = Math.max(6, Math.round(d.area / 6));
    const sockets = Math.max(10, Math.round(d.area / 2));
    const r = electricCostFor({ area: d.area, workType: "reno", panelType: d.panelType, lights, sockets, circuits: d.circuits });
    const panelRange = d.panelType === "tri" ? ELECTRIC_PRICES.panelTri : ELECTRIC_PRICES.panelMono;
    const mpRate = ELECTRIC_MP_RATE.reno;
    return {
      text: range(r.pointsMin, r.pointsMax),
      meta: `Estimare orientativă pentru ~${d.area} m² (${SPACE_LABEL[space].toLowerCase()}), materiale + manoperă.`,
      intro: `Calculat pe puncte electrice reale: ${lights} puncte iluminat, ${sockets} prize, ${d.circuits} circuite dedicate și tablou ${d.panelType === "tri" ? "trifazat" : "monofazat"} echipat complet.`,
      breakdown: [
        { label: `${lights} puncte iluminat (${ELECTRIC_PRICES.light[0]}–${ELECTRIC_PRICES.light[1]} lei/punct)`, amount: range(lights * ELECTRIC_PRICES.light[0], lights * ELECTRIC_PRICES.light[1]) },
        { label: `${sockets} prize (${ELECTRIC_PRICES.socket[0]}–${ELECTRIC_PRICES.socket[1]} lei/punct)`, amount: range(sockets * ELECTRIC_PRICES.socket[0], sockets * ELECTRIC_PRICES.socket[1]) },
        { label: `${d.circuits} circuite dedicate (${ELECTRIC_PRICES.circuit[0]}–${ELECTRIC_PRICES.circuit[1]} lei/circuit)`, amount: range(d.circuits * ELECTRIC_PRICES.circuit[0], d.circuits * ELECTRIC_PRICES.circuit[1]) },
        { label: `Tablou ${d.panelType === "tri" ? "trifazat" : "monofazat"} echipat complet`, amount: range(panelRange[0], panelRange[1]) },
        { label: "Total estimat (puncte electrice)", amount: range(r.pointsMin, r.pointsMax), highlight: true },
      ],
      altNote: `Reper alternativ de piață, pe m² (${d.area} m² × ${mpRate[0]}–${mpRate[1]} lei/m²): ${range(r.mpMin, r.mpMax)}.`,
      sourceNote: "Aceleași repere de piață ca în calculatorul detaliat și în pagina Electrician (devizeroo.ro / prolist.ro) — nu prețuri fixe, variază cu accesul la pereți și distanța până la tablou.",
      detailLink: { href: "/calculatoare", label: "Ajustează exact punctele electrice →" },
    };
  }

  // fotovoltaic
  if (space === "comercial") {
    return {
      text: "de la 58.255 lei",
      meta: "Sistem 20 kWp trifazat comercial, on-grid — variantă orientativă pentru hale/firme.",
      intro: "45× panou Canadian Solar 450W, invertor on-grid trifazat Huawei SUN2000-20KTL-M5. Varianta hibridă cu stocare costă suplimentar față de acest on-grid.",
      breakdown: [
        { label: "45 panouri Canadian Solar 450W", amount: "18.513 lei" },
        { label: "Invertor on-grid trifazat Huawei 20kW", amount: "12.256 lei" },
        { label: "Structură montaj acoperiș", amount: "10.037 lei" },
        { label: "Cabluri DC/AC, protecții, conectori MC4", amount: "2.448 lei" },
        { label: "Manoperă instalare (20 kWp × 750 lei/kWp)", amount: "15.000 lei", highlight: true },
        { label: "Total", amount: "58.255 lei", highlight: true },
      ],
      sourceNote: "Panouri și invertor: preț real depozitsolar.ro. Structură montaj: reper Dedeman. Manoperă: reper de piață ecosolaris.ro.",
      detailLink: { href: "/fotovoltaic", label: "Vezi toate pachetele fotovoltaice →" },
    };
  }
  return {
    text: "de la 19.857 lei",
    meta: "Sistem 6 kWp trifazat hibrid — punct de plecare. Varianta 10 kWp + stocare ajunge la 30.073 lei.",
    intro: "14× panou Canadian Solar 450W, invertor hibrid trifazat Huawei SUN2000-6KTL-M1, pregătit direct pentru baterie de stocare.",
    breakdown: [
      { label: "14 panouri Canadian Solar 450W", amount: "5.760 lei" },
      { label: "Invertor hibrid trifazat Huawei 6kW", amount: "5.717 lei" },
      { label: "Structură montaj acoperiș", amount: "3.011 lei" },
      { label: "Cabluri DC/AC, protecții, conectori MC4", amount: "869 lei" },
      { label: "Manoperă instalare (6 kWp × 750 lei/kWp)", amount: "4.500 lei", highlight: true },
      { label: "Total (pachet 6 kWp)", amount: "19.857 lei", highlight: true },
    ],
    altNote: "Pachet 10 kWp trifazat hibrid (recomandat pentru consum ridicat): 30.073 lei. Opțiune baterie Dyness 5–10 kWh: de la +4.248 lei.",
    sourceNote: "Panouri și invertor: preț real depozitsolar.ro. Structură montaj: reper Dedeman. Manoperă: reper de piață ecosolaris.ro.",
    detailLink: { href: "/fotovoltaic", label: "Vezi toate pachetele fotovoltaice →" },
  };
}

export function CalcQuick1({ data }: { data: SectionData }) {
  const [step, setStep] = useState(1);
  const [space, setSpace] = useState<Space | null>(null);
  const [need, setNeed] = useState<Need | null>(null);

  const result = useMemo(() => (space && need ? estimateFor(space, need) : null), [space, need]);

  function pickSpace(v: Space) {
    setSpace(v);
    setStep(2);
  }
  function pickNeed(v: Need) {
    setNeed(v);
    setStep(3);
  }
  function reset() {
    setSpace(null);
    setNeed(null);
    setStep(1);
  }

  const waMessage =
    space && need && result
      ? `Salut! Am folosit calculatorul de pe site: ${SPACE_LABEL[space]}, ${NEED_LABEL[need]}. Estimare: ${result.text}. Vreau o confirmare/ofertă.`
      : "";

  return (
    <section className="max-w-[640px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight text-center mb-2" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <p className="text-center text-sm mb-7" style={{ color: "var(--text-dim)" }}>
        Trei pași, câteva secunde — fără să completezi niciun formular.
      </p>

      <CalcSection>
        <div className="flex items-center justify-center gap-2 mb-6 text-[11px] font-semibold" style={{ color: "var(--text-dim)" }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <span
                className="h-6 w-6 rounded-full flex items-center justify-center"
                style={
                  step >= n
                    ? { background: "var(--accent)", color: "#1a1712" }
                    : { border: "1px solid var(--border)", color: "var(--text-dim)" }
                }
              >
                {n}
              </span>
              {n < 3 && <span className="w-6 h-px" style={{ background: "var(--border)" }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <p className="text-[15px] font-bold mb-3 text-center" style={{ color: "var(--text)" }}>
              Ce spațiu ai?
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {SPACE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => pickSpace(o.value)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold border transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && space && (
          <div>
            <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold mb-3" style={{ color: "var(--text-dim)" }}>
              ← {SPACE_LABEL[space]}
            </button>
            <p className="text-[15px] font-bold mb-3 text-center" style={{ color: "var(--text)" }}>
              Care este nevoia principală?
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {NEED_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => pickNeed(o.value)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold border transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && space && need && result && (
          <div className="text-left">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: "var(--text-dim)" }}>
                {SPACE_LABEL[space]} · {NEED_LABEL[need]}
              </p>
              <button type="button" onClick={reset} className="text-xs font-semibold" style={{ color: "var(--text-dim)" }}>
                ↺ Ia-o de la capăt
              </button>
            </div>

            <div className="text-center rounded-xl p-5 mb-4" style={{ background: "var(--bg-elev-2)" }}>
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-dim)" }}>
                Cost estimativ (materiale + manoperă)
              </span>
              <div className="text-3xl font-extrabold mt-1" style={{ color: "var(--accent)" }}>
                {result.text}
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-dim)" }}>
                {result.meta}
              </p>
            </div>

            <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
              {result.intro}
            </p>

            <div className="rounded-xl divide-y overflow-hidden mb-3" style={{ background: "var(--bg-elev-2)", borderColor: "var(--border)" }}>
              {result.breakdown.map((line, i) => (
                <div key={i} className="flex justify-between gap-3 px-3.5 py-2.5 text-[13px]" style={{ borderColor: "var(--border)" }}>
                  <span className={line.highlight ? "font-bold" : ""} style={{ color: line.highlight ? "var(--accent)" : "var(--text)" }}>
                    {line.label}
                  </span>
                  <span
                    className={`whitespace-nowrap ${line.highlight ? "font-bold" : "font-semibold"}`}
                    style={{ color: line.highlight ? "var(--accent)" : "var(--text-dim)" }}
                  >
                    {line.amount}
                  </span>
                </div>
              ))}
            </div>

            {result.altNote && (
              <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
                {result.altNote}
              </p>
            )}

            <p className="text-[11px] leading-relaxed underline decoration-dotted mb-5" style={{ color: "var(--text-dim)" }}>
              {result.sourceNote}
            </p>

            <a
              href={`https://wa.me/40750405908?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full rounded-full px-6 py-3 text-sm font-bold text-white no-underline"
              style={{ background: "#25D366" }}
            >
              📩 Trimite acest deviz pe WhatsApp pentru confirmare gratuită
            </a>
            <a
              href={result.detailLink.href}
              className="block text-center mt-3 text-xs font-semibold no-underline"
              style={{ color: "var(--accent)" }}
            >
              {result.detailLink.label}
            </a>
          </div>
        )}
      </CalcSection>
    </section>
  );
}

export const CalcQuickTemplates = { 1: CalcQuick1 };
