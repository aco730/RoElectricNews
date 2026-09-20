// Ported 1:1 from the original static site's calculator*.js — real formulas, unchanged.

export interface BatteryAssumptions {
  coverage: number; // % of daily consumption to cover
  soc: number; // minimum state-of-charge reserved, %
  eff: number; // round-trip efficiency, %
  margin: number; // safety margin, %
}
export const BATTERY_DEFAULTS: BatteryAssumptions = { coverage: 70, soc: 20, eff: 95, margin: 15 };

export function batterySizeFor(monthlyKWh: number, a: BatteryAssumptions) {
  const dailyAvg = monthlyKWh / 30;
  const coverageKWh = dailyAvg * (a.coverage / 100);
  const withMargin = coverageKWh * (1 + a.margin / 100);
  const withEfficiency = withMargin / (a.eff / 100);
  const usableFraction = (100 - a.soc) / 100;
  const raw = withEfficiency / usableFraction;
  return { dailyAvg, coverageKWh, withMargin, withEfficiency, raw, rounded: Math.ceil(raw) };
}

export interface SolarAssumptions {
  yieldPerKWp: number; // kWh produced per kWp per year
  coverage: number; // % of annual consumption to cover
  panelW: number; // watts per panel
}
export const SOLAR_DEFAULTS: SolarAssumptions = { yieldPerKWp: 1200, coverage: 100, panelW: 450 };
const PANEL_AREA_M2 = 1.8;

export function solarSizeFor(annualKWh: number, a: SolarAssumptions) {
  const targetKWh = annualKWh * (a.coverage / 100);
  const kWpRaw = targetKWh / a.yieldPerKWp;
  const kWpRounded = Math.ceil(kWpRaw * 10) / 10;
  const panelCount = Math.ceil((kWpRounded * 1000) / a.panelW);
  const roofArea = Math.round(panelCount * PANEL_AREA_M2);
  const estimatedProduction = Math.round(kWpRounded * a.yieldPerKWp);
  return { targetKWh, kWpRaw, kWpRounded, panelCount, roofArea, estimatedProduction };
}

export const ELECTRIC_PRICES = {
  light: [70, 100] as const,
  socket: [80, 140] as const,
  circuit: [220, 300] as const,
  panelMono: [600, 1200] as const,
  panelTri: [1200, 1800] as const,
};
export const ELECTRIC_MP_RATE = { new: [150, 320] as const, reno: [200, 380] as const };

export function electricCostFor(input: {
  area: number;
  workType: "new" | "reno";
  panelType: "mono" | "tri";
  lights: number;
  sockets: number;
  circuits: number;
}) {
  const panelRange = input.panelType === "tri" ? ELECTRIC_PRICES.panelTri : ELECTRIC_PRICES.panelMono;
  const pointsMin =
    input.lights * ELECTRIC_PRICES.light[0] + input.sockets * ELECTRIC_PRICES.socket[0] + input.circuits * ELECTRIC_PRICES.circuit[0] + panelRange[0];
  const pointsMax =
    input.lights * ELECTRIC_PRICES.light[1] + input.sockets * ELECTRIC_PRICES.socket[1] + input.circuits * ELECTRIC_PRICES.circuit[1] + panelRange[1];
  const mpRate = ELECTRIC_MP_RATE[input.workType];
  const mpMin = input.area * mpRate[0];
  const mpMax = input.area * mpRate[1];
  return { pointsMin, pointsMax, mpMin, mpMax, mpRate };
}

export const fmtRON = (n: number) => Math.round(n).toLocaleString("ro-RO");
