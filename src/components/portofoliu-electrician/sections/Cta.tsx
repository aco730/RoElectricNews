import type { SectionData } from "@/lib/types";

export function Cta1({ data }: { data: SectionData }) {
  return (
    <section className="max-w-[1100px] mx-auto px-6 pt-8">
      <div
        className="rounded-[22px] px-8 py-7 flex flex-wrap items-center justify-between gap-5 text-white"
        style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))" }}
      >
        <div>
          <h3 className="text-[19px] font-bold mb-1">{data.heading}</h3>
          <p className="text-[13px] opacity-85">{data.text}</p>
        </div>
        {data.buttonText && (
          <a
            href={data.buttonLink}
            className="flex-shrink-0 rounded-full px-[18px] py-[11px] text-[13px] font-bold no-underline whitespace-nowrap"
            style={{ background: "#15130f", color: "#fdfcfa", border: "1px solid rgba(255,255,255,.08)" }}
          >
            {data.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

export function Cta2({ data }: { data: SectionData }) {
  return (
    <section className="py-14 px-6 text-center bg-amber-50">
      <h3 className="text-2xl font-bold">{data.heading}</h3>
      <p className="mt-2 max-w-xl mx-auto text-slate-600">{data.text}</p>
      {data.buttonText && (
        <a href={data.buttonLink} className="inline-block mt-5 bg-accent text-ink font-semibold px-6 py-3 rounded-full">
          {data.buttonText}
        </a>
      )}
    </section>
  );
}

export function Cta3({ data }: { data: SectionData }) {
  return (
    <section className="mx-6 my-10 max-w-4xl md:mx-auto border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center">
      <h3 className="text-xl font-bold">{data.heading}</h3>
      <p className="mt-2 text-slate-600">{data.text}</p>
      {data.buttonText && (
        <a href={data.buttonLink} className="inline-block mt-4 underline font-semibold text-accent">
          {data.buttonText} →
        </a>
      )}
    </section>
  );
}

export const CtaTemplates = { 1: Cta1, 2: Cta2, 3: Cta3 };
