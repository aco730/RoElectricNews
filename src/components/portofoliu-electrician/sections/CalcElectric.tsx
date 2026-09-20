"use client";

import { useMemo, useState } from "react";
import type { SectionData } from "@/lib/types";
import { ELECTRIC_MP_RATE, electricCostFor, fmtRON } from "@/lib/calculators";
import { CalcField, CalcNumberInput, CalcRadioGroup, CalcResultNumber, CalcSection } from "./calc/CalcUI";

function useElectricCalc() {
  const [area, setArea] = useState("80");
  const [workType, setWorkType] = useState<"new" | "reno">("new");
  const [panelType, setPanelType] = useState<"mono" | "tri">("mono");
  const [lights, setLights] = useState("");
  const [sockets, setSockets] = useState("");
  const [circuits, setCircuits] = useState("4");

  const areaNum = parseFloat(area) || 0;
  const effectiveLights = lights ? parseInt(lights, 10) || 0 : Math.max(6, Math.round(areaNum / 6));
  const effectiveSockets = sockets ? parseInt(sockets, 10) || 0 : Math.max(10, Math.round(areaNum / 2));
  const effectiveCircuits = parseInt(circuits, 10) || 0;

  const result = useMemo(() => {
    if (areaNum <= 0) return null;
    return electricCostFor({ area: areaNum, workType, panelType, lights: effectiveLights, sockets: effectiveSockets, circuits: effectiveCircuits });
  }, [areaNum, workType, panelType, effectiveLights, effectiveSockets, effectiveCircuits]);

  return {
    area, setArea, workType, setWorkType, panelType, setPanelType,
    lights, setLights, sockets, setSockets, circuits, setCircuits,
    effectiveLights, effectiveSockets, effectiveCircuits, result,
  };
}

function Inputs(p: ReturnType<typeof useElectricCalc>) {
  return (
    <>
      <CalcField label="Suprafață (m²)" help="Suprafața utilă a locuinței sau spațiului de lucru — folosită și ca reper general de cost pe m².">
        <CalcNumberInput value={p.area} onChange={p.setArea} placeholder="ex. 80" />
      </CalcField>
      <div className="h-3" />
      <CalcField
        label="Tip lucrare"
        help="Casă nouă = cablaj complet de la zero. Renovare = de obicei mai scump, pentru că se umblă prin pereți și tencuială existentă."
      >
        <CalcRadioGroup name="wt" value={p.workType} onChange={p.setWorkType} options={[{ value: "new", label: "Casă nouă" }, { value: "reno", label: "Renovare" }]} />
      </CalcField>
      <div className="h-3" />
      <CalcField
        label="Tablou"
        help="Monofazat = varianta obișnuită pentru apartamente și case. Trifazat = pentru consumuri mari sau echipamente care au nevoie de curent trifazat."
      >
        <CalcRadioGroup name="pt" value={p.panelType} onChange={p.setPanelType} options={[{ value: "mono", label: "Monofazat" }, { value: "tri", label: "Trifazat" }]} />
      </CalcField>
      <div className="h-3" />
      <CalcField
        label="Puncte electrice"
        help="Câte puncte de iluminat, prize și circuite dedicate (bucătărie, baie, aer condiționat etc.) vrei — dacă lași necompletat, estimăm automat din suprafață."
      >
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
              Iluminat
            </p>
            <CalcNumberInput value={p.lights} onChange={p.setLights} placeholder={String(p.effectiveLights)} />
          </div>
          <div>
            <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
              Prize
            </p>
            <CalcNumberInput value={p.sockets} onChange={p.setSockets} placeholder={String(p.effectiveSockets)} />
          </div>
          <div>
            <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
              Circuite
            </p>
            <CalcNumberInput value={p.circuits} onChange={p.setCircuits} placeholder="4" />
          </div>
        </div>
      </CalcField>
    </>
  );
}

export function CalcElectric1({ data }: { data: SectionData }) {
  const c = useElectricCalc();
  return (
    <section className="max-w-[720px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight text-center mb-7" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <CalcSection>
        <Inputs {...c} />
        <div className="h-4" />
        {c.result && (
          <div className="grid sm:grid-cols-2 gap-3">
            <CalcResultNumber tag="Estimare pe puncte electrice" value={`${fmtRON(c.result.pointsMin)}–${fmtRON(c.result.pointsMax)}`} unit="lei" />
            <CalcResultNumber
              tag="Reper de piață, pe m²"
              value={`${fmtRON(c.result.mpMin)}–${fmtRON(c.result.mpMax)}`}
              unit="lei"
              meta={`${c.area} m² × ${c.result.mpRate[0]}–${c.result.mpRate[1]} lei/m²`}
            />
          </div>
        )}
      </CalcSection>
    </section>
  );
}

export function CalcElectric2({ data }: { data: SectionData }) {
  const c = useElectricCalc();
  return (
    <section className="max-w-[1000px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight mb-7" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        <CalcSection>
          <Inputs {...c} />
        </CalcSection>
        <CalcSection sticky>
          {c.result ? (
            <div className="space-y-3">
              <CalcResultNumber tag="Estimare pe puncte electrice" value={`${fmtRON(c.result.pointsMin)}–${fmtRON(c.result.pointsMax)}`} unit="lei" />
              <CalcResultNumber tag="Reper de piață, pe m²" value={`${fmtRON(c.result.mpMin)}–${fmtRON(c.result.mpMax)}`} unit="lei" />
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              Completează suprafața ca să vezi rezultatul.
            </p>
          )}
        </CalcSection>
      </div>
    </section>
  );
}

export function CalcElectric3({ data }: { data: SectionData }) {
  const c = useElectricCalc();
  return (
    <section className="max-w-[440px] mx-auto px-6 py-12">
      <CalcSection>
        {data.heading && (
          <h2 className="text-lg font-extrabold mb-4 text-center" style={{ color: "var(--text)" }}>
            {data.heading}
          </h2>
        )}
        {c.result && (
          <div className="text-center mb-5">
            <div className="text-3xl font-extrabold" style={{ color: "var(--accent)" }}>
              {fmtRON(c.result.pointsMin)}–{fmtRON(c.result.pointsMax)}
            </div>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              lei, estimare orientativă
            </p>
          </div>
        )}
        <Inputs {...c} />
      </CalcSection>
    </section>
  );
}

export const CalcElectricTemplates = { 1: CalcElectric1, 2: CalcElectric2, 3: CalcElectric3 };
