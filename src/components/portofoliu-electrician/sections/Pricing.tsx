import type { SectionData } from "@/lib/types";

export function Pricing1({ data }: { data: SectionData }) {
  return (
    <section className="max-w-[1100px] mx-auto px-6 py-12 text-center">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight mb-2.5" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      {data.text && (
        <p className="text-sm leading-relaxed max-w-[560px] mx-auto mb-8" style={{ color: "var(--text-dim)" }}>
          {data.text}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-[18px]">
        {(data.priceItems ?? []).map((p) => {
          const CardTag = p.sourceUrl ? "a" : "div";
          const cardProps = p.sourceUrl
            ? { href: p.sourceUrl, target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
          <CardTag
            key={p.id}
            {...cardProps}
            className={`text-left w-full lg:w-[calc(50%-9px)] rounded-2xl border overflow-hidden block no-underline ${p.sourceUrl ? "transition-transform hover:-translate-y-1 cursor-pointer" : ""}`}
            style={{ borderColor: "var(--border)", background: "var(--bg-elev)", boxShadow: "var(--shadow)" }}
          >
            {p.image && (
              <div className="h-[320px] overflow-hidden" style={{ background: "var(--bg-elev-2)" }}>
                <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
              </div>
            )}
            <div className="p-6">
            <p className="font-bold flex items-center gap-1.5" style={{ color: "var(--text)" }}>
              {p.name}
              {p.sourceUrl && (
                <span className="text-[11px] font-semibold opacity-70" style={{ color: "var(--accent-2, var(--accent))" }}>
                  ↗ sursă
                </span>
              )}
            </p>
            <p className="mt-2 text-2xl font-extrabold" style={{ color: "var(--accent)" }}>
              {p.price}
              {p.unit && (
                <span className="text-xs font-normal ml-1" style={{ color: "var(--text-dim)" }}>
                  {p.unit}
                </span>
              )}
            </p>
            {p.description && (
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                {p.description}
              </p>
            )}
            {p.breakdown && p.breakdown.length > 0 && (
              <div className="mt-4 rounded-xl divide-y overflow-hidden" style={{ background: "var(--bg-elev-2)", borderColor: "var(--border)" }}>
                {p.breakdown.map((line) => {
                  const LineTag = line.url ? "a" : "div";
                  const lineProps = line.url ? { href: line.url, target: "_blank", rel: "noopener noreferrer" } : {};
                  return (
                    <LineTag
                      key={line.id}
                      {...lineProps}
                      className={`flex justify-between gap-3 px-3.5 py-2.5 text-[13px] no-underline ${
                        line.url ? "hover:bg-black/5 transition-colors cursor-pointer" : ""
                      }`}
                      style={{ borderColor: "var(--border)" }}
                    >
                      <span className={line.highlight ? "font-bold" : ""} style={{ color: line.highlight ? "var(--accent)" : "var(--text)" }}>
                        {line.label}
                        {line.url && (
                          <span className="ml-1 text-[10px] font-semibold opacity-70" style={{ color: "var(--accent-2, var(--accent))" }}>
                            ↗
                          </span>
                        )}
                      </span>
                      <span
                        className={`whitespace-nowrap ${line.highlight ? "font-bold" : "font-semibold"}`}
                        style={{ color: line.highlight ? "var(--accent)" : "var(--text-dim)" }}
                      >
                        {line.amount}
                      </span>
                    </LineTag>
                  );
                })}
              </div>
            )}
            {p.bullets && p.bullets.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-[13px]" style={{ color: "var(--text-dim)" }}>
                {p.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: "var(--accent)" }}>✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {p.sourceNote && (
              <p className="mt-3 text-[11px] leading-relaxed underline decoration-dotted" style={{ color: "var(--text-dim)" }}>
                {p.sourceNote}
              </p>
            )}
            {p.ctaText && (
              <a
                href={p.ctaLink}
                target={p.ctaLink?.startsWith("http") ? "_blank" : undefined}
                rel={p.ctaLink?.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={(e) => e.stopPropagation()}
                className="mt-4 inline-block rounded-full px-5 py-2.5 text-[13px] font-bold no-underline"
                style={{ background: "var(--accent)", color: "#1a1712" }}
              >
                {p.ctaText}
              </a>
            )}
            </div>
          </CardTag>
          );
        })}
      </div>
    </section>
  );
}

export function Pricing2({ data }: { data: SectionData }) {
  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      {data.heading && <h2 className="text-3xl font-bold text-center mb-10">{data.heading}</h2>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data.priceItems ?? []).map((p) => (
          <div key={p.id} className="border-2 border-slate-200 rounded-2xl p-6 text-center hover:border-accent transition">
            <p className="font-semibold text-lg">{p.name}</p>
            <p className="mt-3 text-3xl font-bold text-accent">{p.price}</p>
            {p.unit && <p className="text-xs text-slate-500">{p.unit}</p>}
            {p.description && <p className="mt-3 text-sm text-slate-600">{p.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Pricing3({ data }: { data: SectionData }) {
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      {data.heading && <h2 className="text-2xl font-bold mb-6">{data.heading}</h2>}
      <table className="w-full text-sm">
        <tbody>
          {(data.priceItems ?? []).map((p) => (
            <tr key={p.id} className="border-b border-slate-200">
              <td className="py-3">
                <p className="font-semibold">{p.name}</p>
                {p.description && <p className="text-xs text-slate-500">{p.description}</p>}
              </td>
              <td className="py-3 text-right font-bold text-accent whitespace-nowrap">
                {p.price} {p.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export const PricingTemplates = { 1: Pricing1, 2: Pricing2, 3: Pricing3 };
