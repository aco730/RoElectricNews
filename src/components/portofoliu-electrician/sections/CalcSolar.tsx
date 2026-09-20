"use client";

import { useMemo, useState } from "react";
import type { SectionData } from "@/lib/types";
import { SOLAR_DEFAULTS, solarSizeFor } from "@/lib/calculators";
import { CalcField, CalcNumberInput, CalcRadioGroup, CalcResultNumber, CalcSection, CalcSlider } from "./calc/CalcUI";

function useSolarCalc() {
  const [mode, setMode] = useState<"monthly" | "annual">("monthly");
  const [consumption, setConsumption] = useState("200");
  const [a, setA] = useState(SOLAR_DEFAULTS);
  const result = useMemo(() => {
    const v = parseFloat(consumption);
    if (isNaN(v) || v <= 0) return null;
    const annual = mode === "monthly" ? v * 12 : v;
    return solarSizeFor(annual, a);
  }, [consumption, mode, a]);
  return { mode, setMode, consumption, setConsumption, a, setA, result };
}

function Assumptions({ a, setA }: { a: typeof SOLAR_DEFAULTS; setA: (a: typeof SOLAR_DEFAULTS) => void }) {
  return (
    <>
      <CalcSlider
        label="Producție estimată"
        help="Câți kWh produce, în medie pe an, fiecare kWp instalat — depinde de zona geografică, orientarea și înclinarea acoperișului. 1200 e un reper obișnuit pentru România."
        value={a.yieldPerKWp}
        min={900}
        max={1500}
        step={10}
        unit=" kWh/kWp/an"
        onChange={(v) => setA({ ...a, yieldPerKWp: v })}
      />
      <CalcSlider
        label="Cât din consum vrei acoperit"
        help="Ce procent din consumul tău anual vrei ca sistemul să-l producă. 100% înseamnă că vrei să acoperi tot consumul; peste 100% dacă vrei și un surplus."
        value={a.coverage}
        min={30}
        max={150}
        unit="%"
        onChange={(v) => setA({ ...a, coverage: v })}
      />
      <CalcSlider
        label="Putere per panou"
        help="Puterea nominală a unui singur panou fotovoltaic, în wați — cele mai comune panouri rezidențiale sunt între 400-500 W."
        value={a.panelW}
        min={350}
        max={600}
        step={10}
        unit=" W"
        onChange={(v) => setA({ ...a, panelW: v })}
      />
    </>
  );
}

function ConsumptionInput({
  mode,
  setMode,
  consumption,
  setConsumption,
}: {
  mode: "monthly" | "annual";
  setMode: (m: "monthly" | "annual") => void;
  consumption: string;
  setConsumption: (v: string) => void;
}) {
  return (
    <>
      <CalcRadioGroup
        name="mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "monthly", label: "Lunar" },
          { value: "annual", label: "Anual" },
        ]}
      />
      <div className="h-2" />
      <CalcField
        label={mode === "monthly" ? "Consum mediu lunar (kWh)" : "Consum anual (kWh)"}
        help="Cifra de pe factura de curent — media pe lună, sau totalul pe un an întreg dacă îl ai la îndemână."
      >
        <CalcNumberInput value={consumption} onChange={setConsumption} placeholder={mode === "monthly" ? "ex. 200" : "ex. 2400"} />
      </CalcField>
    </>
  );
}

export function CalcSolar1({ data }: { data: SectionData }) {
  const { mode, setMode, consumption, setConsumption, a, setA, result } = useSolarCalc();
  return (
    <section className="max-w-[720px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight text-center mb-7" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <CalcSection>
        <ConsumptionInput mode={mode} setMode={setMode} consumption={consumption} setConsumption={setConsumption} />
        <div className="h-4" />
        <Assumptions a={a} setA={setA} />
        <div className="h-2" />
        {result && (
          <div className="grid sm:grid-cols-3 gap-3">
            <CalcResultNumber tag="Putere sistem" value={result.kWpRounded} unit="kWp" meta={`~${result.estimatedProduction.toLocaleString("ro-RO")} kWh/an`} />
            <CalcResultNumber tag="Nr. panouri" value={result.panelCount} unit="buc" meta={`${a.panelW} W/panou`} />
            <CalcResultNumber tag="Suprafață" value={result.roofArea} unit="m²" meta="pe-acoperiș, orientativ" />
          </div>
        )}
      </CalcSection>
    </section>
  );
}

export function CalcSolar2({ data }: { data: SectionData }) {
  const { mode, setMode, consumption, setConsumption, a, setA, result } = useSolarCalc();
  return (
    <section className="max-w-[1000px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight mb-7" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        <CalcSection>
          <ConsumptionInput mode={mode} setMode={setMode} consumption={consumption} setConsumption={setConsumption} />
          <div className="h-4" />
          <Assumptions a={a} setA={setA} />
        </CalcSection>
        <CalcSection sticky>
          {result ? (
            <div className="space-y-3">
              <CalcResultNumber tag="Putere sistem" value={result.kWpRounded} unit="kWp" />
              <CalcResultNumber tag="Nr. panouri" value={result.panelCount} unit="buc" />
              <CalcResultNumber tag="Suprafață" value={result.roofArea} unit="m²" />
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              Completează consumul ca să vezi rezultatul.
            </p>
          )}
        </CalcSection>
      </div>
    </section>
  );
}

export function CalcSolar3({ data }: { data: SectionData }) {
  const { mode, setMode, consumption, setConsumption, a, setA, result } = useSolarCalc();
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
              {result.kWpRounded}
            </div>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              kWp · {result.panelCount} panouri · {result.roofArea} m²
            </p>
          </div>
        )}
        <ConsumptionInput mode={mode} setMode={setMode} consumption={consumption} setConsumption={setConsumption} />
        <div className="h-3" />
        <Assumptions a={a} setA={setA} />
      </CalcSection>
    </section>
  );
}

export const CalcSolarTemplates = { 1: CalcSolar1, 2: CalcSolar2, 3: CalcSolar3 };
