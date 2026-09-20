import type { SectionData } from "@/lib/types";

export function CardGrid1({ data }: { data: SectionData }) {
  return (
    <section className="max-w-[1100px] mx-auto px-6 py-12 text-center">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight mb-7" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <div className="flex flex-wrap justify-center gap-[22px]">
        {(data.cards ?? []).map((c) => {
          const Tag = c.link ? "a" : "div";
          const tagProps = c.link ? { href: c.link } : {};
          return (
            <Tag
              key={c.id}
              {...tagProps}
              className={`group block w-full sm:w-[calc(50%-11px)] lg:w-[calc(33.333%-15px)] rounded-2xl overflow-hidden border no-underline text-center ${c.link ? "transition-transform hover:-translate-y-1" : ""}`}
              style={{ borderColor: "var(--border)", background: "var(--bg-elev)", boxShadow: "var(--shadow)", color: "var(--text)" }}
            >
              {c.image && (
                <div className="h-[200px] overflow-hidden">
                  <img src={c.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                </div>
              )}
              <div className="px-6 py-5">
                {c.icon && <div className="text-3xl mb-2">{c.icon}</div>}
                <h3 className="text-lg font-bold mb-2">{c.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  {c.text}
                </p>
                {c.bullets && c.bullets.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-left text-[13px]" style={{ color: "var(--text-dim)" }}>
                    {c.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2">
                        <span style={{ color: "var(--accent)" }}>✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {c.price && (
                  <p className="mt-3 font-extrabold" style={{ color: "var(--accent)" }}>
                    {c.price}
                  </p>
                )}
                {c.ctaText && (
                  <span
                    className="mt-4 inline-block rounded-full px-5 py-2.5 text-[13px] font-bold"
                    style={{ background: "var(--accent)", color: "#1a1712" }}
                  >
                    {c.ctaText}
                  </span>
                )}
              </div>
            </Tag>
          );
        })}
      </div>
    </section>
  );
}

export function CardGrid2({ data }: { data: SectionData }) {
  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      {data.heading && <h2 className="text-3xl font-bold mb-10">{data.heading}</h2>}
      <div className="space-y-4">
        {(data.cards ?? []).map((c) => (
          <a key={c.id} href={c.link} className="flex gap-5 items-center border-b border-slate-200 pb-4 group">
            {c.image && <img src={c.image} alt="" className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />}
            <div>
              <h3 className="font-semibold text-lg group-hover:text-accent">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.text}</p>
              {c.price && <p className="mt-1 font-bold text-accent">{c.price}</p>}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function CardGrid3({ data }: { data: SectionData }) {
  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      {data.heading && <h2 className="text-3xl font-bold text-center mb-10">{data.heading}</h2>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(data.cards ?? []).map((c) => (
          <a key={c.id} href={c.link} className="block bg-slate-50 rounded-xl p-5 text-center hover:bg-amber-50 transition">
            {c.icon && <div className="text-3xl mb-2">{c.icon}</div>}
            <h3 className="font-semibold">{c.title}</h3>
            <p className="mt-2 text-xs text-slate-600">{c.text}</p>
            {c.price && <p className="mt-2 font-bold text-accent">{c.price}</p>}
          </a>
        ))}
      </div>
    </section>
  );
}

export const CardGridTemplates = { 1: CardGrid1, 2: CardGrid2, 3: CardGrid3 };
