"use client";

import { useMemo, useState } from "react";
import type { SectionData } from "@/lib/types";
import { BATTERY_DEFAULTS, batterySizeFor } from "@/lib/calculators";
import { CalcField, CalcNumberInput, CalcResultNumber, CalcSection, CalcSlider } from "./calc/CalcUI";

function useBatteryCalc() {
  const [monthly, setMonthly] = useState("300");
  const [a, setA] = useState(BATTERY_DEFAULTS);
  const result = useMemo(() => {
    const v = parseFloat(monthly);
    if (isNaN(v) || v <= 0) return null;
    return batterySizeFor(v, a);
  }, [monthly, a]);
  return { monthly, setMonthly, a, setA, result };
}

function Assumptions({ a, setA }: { a: typeof BATTERY_DEFAULTS; setA: (a: typeof BATTERY_DEFAULTS) => void }) {
  return (
    <>
      <CalcSlider
        label="Cât din consum vrei acoperit"
        help="Ce procent din consumul tău de zi cu zi vrei să vină din baterie, nu din rețea. 70% e un compromis obișnuit între cost și independență."
        value={a.coverage}
        min={30}
        max={100}
        unit="%"
        onChange={(v) => setA({ ...a, coverage: v })}
      />
      <CalcSlider
        label="SoC minim rezervat baterie"
        help="SoC (State of Charge) = nivelul de încărcare al bateriei. Sub acest procent bateria nu se mai descarcă, ca să nu-i scurtezi durata de viață."
        value={a.soc}
        min={0}
        max={50}
        unit="%"
        onChange={(v) => setA({ ...a, soc: v })}
      />
      <CalcSlider
        label="Eficiență round-trip"
        help="Cât din energia pe care o bagi în baterie recuperezi efectiv la utilizare — restul se pierde ca și căldură la încărcare și descărcare."
        value={a.eff}
        min={80}
        max={100}
        unit="%"
        onChange={(v) => setA({ ...a, eff: v })}
      />
      <CalcSlider
        label="Marjă de siguranță"
        help="Un adaos peste calculul de bază, ca rezervă pentru zile cu consum mai mare decât media (musafiri, aer condiționat etc.)."
        value={a.margin}
        min={0}
        max={40}
        unit="%"
        onChange={(v) => setA({ ...a, margin: v })}
      />
    </>
  );
}

export function CalcBattery1({ data }: { data: SectionData }) {
  const { monthly, setMonthly, a, setA, result } = useBatteryCalc();
  return (
    <section className="max-w-[720px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight text-center mb-7" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <CalcSection>
        <CalcField label="Consum mediu lunar (kWh)" help="Cât consumi într-o lună obișnuită — găsești cifra pe ultima factură de curent, la secțiunea de consum.">
          <CalcNumberInput value={monthly} onChange={setMonthly} placeholder="ex. 300" />
        </CalcField>
        <div className="h-4" />
        <Assumptions a={a} setA={setA} />
        <div className="h-2" />
        {result && <CalcResultNumber tag="Capacitate baterie recomandată" value={result.rounded} unit="kWh" meta={`${result.dailyAvg.toFixed(1)} kWh/zi consum mediu`} />}
      </CalcSection>
    </section>
  );
}

export function CalcBattery2({ data }: { data: SectionData }) {
  const { monthly, setMonthly, a, setA, result } = useBatteryCalc();
  return (
    <section className="max-w-[1000px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight mb-7" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        <CalcSection>
          <CalcField label="Consum mediu lunar (kWh)" help="Cât consumi într-o lună obișnuită — găsești cifra pe ultima factură de curent, la secțiunea de consum.">
            <CalcNumberInput value={monthly} onChange={setMonthly} placeholder="ex. 300" />
          </CalcField>
          <div className="h-4" />
          <Assumptions a={a} setA={setA} />
        </CalcSection>
        <CalcSection sticky>
          {result ? (
            <div className="space-y-3">
              <CalcResultNumber tag="Capacitate baterie" value={result.rounded} unit="kWh" />
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                {result.dailyAvg.toFixed(2)} kWh/zi × {a.coverage}% acoperire, + {a.margin}% marjă, ÷ {a.eff}% eficiență, ÷ ({100 - a.soc}% capacitate utilă).
              </p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              Completează consumul lunar ca să vezi rezultatul.
            </p>
          )}
        </CalcSection>
      </div>
    </section>
  );
}

export function CalcBattery3({ data }: { data: SectionData }) {
  const { monthly, setMonthly, a, setA, result } = useBatteryCalc();
  return (
    <section className="max-w-[440px] mx-auto px-6 py-12">
      <CalcSection>
        {data.heading && (
          <h2 className="text-lg font-extrabold mb-4 text-center" style={{ color: "var(--text)" }}>
            {data.heading}
          </h2>
        )}
        {result && (
          <div className="text-center mb-5">
            <div className="text-5xl font-extrabold" style={{ color: "var(--accent)" }}>
              {result.rounded}
            </div>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              kWh baterie recomandată
            </p>
          </div>
        )}
        <CalcField label="Consum mediu lunar (kWh)" help="Cât consumi într-o lună obișnuită — găsești cifra pe ultima factură de curent, la secțiunea de consum.">
          <CalcNumberInput value={monthly} onChange={setMonthly} placeholder="ex. 300" />
        </CalcField>
        <div className="h-3" />
        <Assumptions a={a} setA={setA} />
      </CalcSection>
    </section>
  );
}

export const CalcBatteryTemplates = { 1: CalcBattery1, 2: CalcBattery2, 3: CalcBattery3 };
