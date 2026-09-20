import type { SectionData } from "@/lib/types";

export function Footer1({ data }: { data: SectionData }) {
  const linkStyle = { color: "var(--text-dim)" };
  return (
    <footer
      id="contact"
      className="text-center px-6 py-9 pb-12 text-[13px] border-t"
      style={{ color: "var(--text-dim)", borderColor: "var(--border)" }}
    >
      <div className="flex justify-center gap-[22px] flex-wrap mb-2.5">
        {data.whatsapp && (
          <a href={`https://wa.me/${data.whatsapp.replace("+", "")}`} className="no-underline" style={linkStyle}>
            WhatsApp
          </a>
        )}
        {data.phone && (
          <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="no-underline" style={linkStyle}>
            {data.phone}
          </a>
        )}
        {data.email && (
          <a href={`mailto:${data.email}`} className="no-underline" style={linkStyle}>
            {data.email}
          </a>
        )}
      </div>
      {data.location && <p className="m-0 text-[12.5px]" style={{ color: "var(--text-dim)" }}>{data.location}</p>}
    </footer>
  );
}

export function Footer2({ data }: { data: SectionData }) {
  return (
    <footer id="contact" className="px-6 py-10 bg-ink text-white text-center">
      <p className="font-semibold">{data.phone}</p>
      <p className="text-sm text-slate-300">{data.email}</p>
      <p className="text-xs text-slate-400 mt-2">{data.location}</p>
    </footer>
  );
}

export function Footer3({ data }: { data: SectionData }) {
  return (
    <footer id="contact" className="px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-3 border-t border-slate-200 text-sm">
      <span>{data.location}</span>
      <div className="flex gap-4">
        {data.whatsapp && <a href={`https://wa.me/${data.whatsapp.replace("+", "")}`}>WhatsApp</a>}
        {data.phone && <a href={`tel:${data.phone.replace(/\s/g, "")}`}>{data.phone}</a>}
        {data.email && <a href={`mailto:${data.email}`}>{data.email}</a>}
      </div>
    </footer>
  );
}

export const FooterTemplates = { 1: Footer1, 2: Footer2, 3: Footer3 };
