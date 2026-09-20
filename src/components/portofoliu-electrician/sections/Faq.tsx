import type { SectionData } from "@/lib/types";

export function Faq1({ data }: { data: SectionData }) {
  return (
    <section className="max-w-[760px] mx-auto px-6 py-12">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight text-center mb-8" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      <div className="space-y-2.5">
        {(data.faqItems ?? []).map((f) => (
          <details key={f.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}>
            <summary className="font-semibold cursor-pointer" style={{ color: "var(--text)" }}>
              {f.question}
            </summary>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              {f.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Faq2({ data }: { data: SectionData }) {
  return (
    <section className="py-16 px-6 max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      {(data.faqItems ?? []).map((f) => (
        <div key={f.id} className="bg-slate-50 rounded-xl p-5">
          <h4 className="font-semibold">{f.question}</h4>
          <p className="mt-2 text-sm text-slate-600">{f.answer}</p>
        </div>
      ))}
    </section>
  );
}

export function Faq3({ data }: { data: SectionData }) {
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      {data.heading && <h2 className="text-2xl font-bold mb-6">{data.heading}</h2>}
      <ol className="space-y-5 list-decimal list-inside">
        {(data.faqItems ?? []).map((f) => (
          <li key={f.id} className="font-semibold">
            {f.question}
            <p className="mt-1 text-sm text-slate-600 font-normal ml-5">{f.answer}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export const FaqTemplates = { 1: Faq1, 2: Faq2, 3: Faq3 };
