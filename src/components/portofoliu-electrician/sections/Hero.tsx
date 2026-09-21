import type { SectionData } from "@/lib/types";

function trackCtaClick(button: "whatsapp" | "phone") {
  try {
    fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ button }),
      keepalive: true,
    });
  } catch {
    // Nu blocam niciodata navigarea reala a vizitatorului pentru un tracking esuat.
  }
}

function ctaButtonKind(text?: string): "whatsapp" | "phone" {
  return text?.toLowerCase().includes("whatsapp") ? "whatsapp" : "phone";
}

function badgeRadiusClass(shape?: "pill" | "square" | "none") {
  return shape === "square" ? "rounded-md" : "rounded-full";
}

export function Hero1({ data }: { data: SectionData }) {
  return (
    <section className="relative overflow-hidden pt-16 pb-6 px-6 text-center" style={{ background: "var(--bg)", isolation: "isolate" }}>
      <div className="pointer-events-none absolute inset-[-20%_-10%_-20%_-10%] -z-10 opacity-50" style={{ filter: "blur(70px)" }}>
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>
      <div className="relative z-10 mx-auto max-w-[900px]">
        {data.badge && data.badgeShape !== "none" && (
          <span
            className={`inline-block mb-4 ${badgeRadiusClass(data.badgeShape)} px-4 py-1.5 text-[12.5px] font-semibold`}
            style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
          >
            {data.badge}
          </span>
        )}
        <h1 className="text-[clamp(28px,5vw,48px)] font-extrabold tracking-tight mb-4" style={{ color: "var(--text)" }}>
          {data.title}
        </h1>
        <p className="mx-auto max-w-[620px] text-[15.5px]" style={{ color: "var(--text-dim)" }}>
          {data.subtitle}
        </p>
        {(data.ctaText || data.secondaryCtaText) && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {data.ctaText && (
              <a
                href={data.ctaLink}
                onClick={() => trackCtaClick(ctaButtonKind(data.ctaText))}
                target={data.ctaLink?.startsWith("http") ? "_blank" : undefined}
                rel={data.ctaLink?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-block rounded-full px-6 py-3 font-bold no-underline"
                style={{ background: "var(--accent)", color: "#1a1712" }}
              >
                {data.ctaText}
              </a>
            )}
            {data.secondaryCtaText && (
              <a
                href={data.secondaryCtaLink}
                onClick={() => trackCtaClick(ctaButtonKind(data.secondaryCtaText))}
                target={data.secondaryCtaLink?.startsWith("http") ? "_blank" : undefined}
                rel={data.secondaryCtaLink?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-block rounded-full px-6 py-3 font-bold no-underline text-white"
                style={{ background: "#25D366" }}
              >
                {data.secondaryCtaText}
              </a>
            )}
          </div>
        )}
        {data.microCopy && (
          <p className="mt-3 text-xs" style={{ color: "var(--text-dim)" }}>
            {data.microCopy}
          </p>
        )}
      </div>
    </section>
  );
}

export function Hero2({ data }: { data: SectionData }) {
  return (
    <section className="py-24 px-6 grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
      <div>
        {data.badge && data.badgeShape !== "none" && (
          <span
            className={`inline-block mb-4 ${badgeRadiusClass(data.badgeShape)} px-4 py-1.5 text-[12.5px] font-semibold`}
            style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
          >
            {data.badge}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-ink">{data.title}</h1>
        <p className="mt-5 text-lg text-slate-600">{data.subtitle}</p>
        {(data.ctaText || data.secondaryCtaText) && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {data.ctaText && (
              <a
                href={data.ctaLink}
                onClick={() => trackCtaClick(ctaButtonKind(data.ctaText))}
                target={data.ctaLink?.startsWith("http") ? "_blank" : undefined}
                rel={data.ctaLink?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-block border-2 border-ink text-ink font-semibold px-6 py-3 rounded-lg no-underline"
              >
                {data.ctaText}
              </a>
            )}
            {data.secondaryCtaText && (
              <a
                href={data.secondaryCtaLink}
                onClick={() => trackCtaClick(ctaButtonKind(data.secondaryCtaText))}
                target={data.secondaryCtaLink?.startsWith("http") ? "_blank" : undefined}
                rel={data.secondaryCtaLink?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-block rounded-lg px-6 py-3 font-semibold no-underline text-white"
                style={{ background: "#25D366" }}
              >
                {data.secondaryCtaText}
              </a>
            )}
          </div>
        )}
        {data.microCopy && <p className="mt-3 text-xs text-slate-500">{data.microCopy}</p>}
      </div>
      <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden">
        {data.image && <img src={data.image} alt="" className="w-full h-full object-cover" />}
      </div>
    </section>
  );
}

export function Hero3({ data }: { data: SectionData }) {
  return (
    <section className="py-20 px-6 text-center bg-amber-50">
      {data.badge && data.badgeShape !== "none" && (
        <span className={`inline-block bg-accent/20 text-accent font-semibold px-4 py-1 text-sm mb-4 ${badgeRadiusClass(data.badgeShape)}`}>
          {data.badge}
        </span>
      )}
      <h1 className="text-3xl md:text-5xl font-bold text-ink max-w-3xl mx-auto">{data.title}</h1>
      <p className="mt-5 max-w-xl mx-auto text-slate-600">{data.subtitle}</p>
      {(data.ctaText || data.secondaryCtaText) && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {data.ctaText && (
            <a
              href={data.ctaLink}
              onClick={() => trackCtaClick(ctaButtonKind(data.ctaText))}
              target={data.ctaLink?.startsWith("http") ? "_blank" : undefined}
              rel={data.ctaLink?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-block bg-ink text-white font-semibold px-6 py-3 rounded-full animate-pulse"
            >
              {data.ctaText}
            </a>
          )}
          {data.secondaryCtaText && (
            <a
              href={data.secondaryCtaLink}
              onClick={() => trackCtaClick(ctaButtonKind(data.secondaryCtaText))}
              target={data.secondaryCtaLink?.startsWith("http") ? "_blank" : undefined}
              rel={data.secondaryCtaLink?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-block font-semibold px-6 py-3 rounded-full text-white"
              style={{ background: "#25D366" }}
            >
              {data.secondaryCtaText}
            </a>
          )}
        </div>
      )}
      {data.microCopy && <p className="mt-3 text-xs text-slate-500">{data.microCopy}</p>}
    </section>
  );
}

export const HeroTemplates = { 1: Hero1, 2: Hero2, 3: Hero3 };
