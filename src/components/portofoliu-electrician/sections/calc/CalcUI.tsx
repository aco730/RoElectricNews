"use client";

export function CalcSection({ children, sticky }: { children: React.ReactNode; sticky?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${sticky ? "md:sticky md:top-24" : ""}`}
      style={{ borderColor: "var(--border)", background: "var(--bg-elev)", boxShadow: "var(--shadow)" }}
    >
      {children}
    </div>
  );
}

export function CalcLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>
      {children}
    </label>
  );
}

export function CalcHelp({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] leading-snug mb-1.5" style={{ color: "var(--text-dim)" }}>
      {children}
    </p>
  );
}

export function CalcField({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <CalcLabel>{label}</CalcLabel>
      {help && <CalcHelp>{help}</CalcHelp>}
      {children}
    </div>
  );
}

export function CalcNumberInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border px-3 py-2 text-sm"
      style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
    />
  );
}

export function CalcSlider({
  label,
  help,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  help?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-[13px] mb-1">
        <span style={{ color: "var(--text)" }} className="font-semibold">
          {label}
        </span>
        <span style={{ color: "var(--accent)" }} className="font-bold">
          {value}
          {unit}
        </span>
      </div>
      {help && <CalcHelp>{help}</CalcHelp>}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[var(--accent)]" />
    </div>
  );
}

export function CalcResultNumber({ tag, value, unit, meta }: { tag: string; value: string | number; unit: string; meta?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--bg-elev-2)" }}>
      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-dim)" }}>
        {tag}
      </span>
      <div className="text-3xl font-extrabold mt-1" style={{ color: "var(--accent)" }}>
        {value}
        <small className="text-sm font-semibold ml-1" style={{ color: "var(--text-dim)" }}>
          {unit}
        </small>
      </div>
      {meta && (
        <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
          {meta}
        </p>
      )}
    </div>
  );
}

export function CalcRadioGroup<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className="px-3 py-1.5 rounded-full text-[13px] font-semibold border"
          style={
            value === o.value
              ? { background: "var(--accent)", borderColor: "var(--accent)", color: "#1a1712" }
              : { borderColor: "var(--border)", color: "var(--text-dim)" }
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
