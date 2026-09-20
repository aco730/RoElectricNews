import type { Section } from "@/lib/types";
import { HeaderTemplates } from "./sections/Header";
import { HeroTemplates } from "./sections/Hero";
import { CardGridTemplates } from "./sections/CardGrid";
import { CtaTemplates } from "./sections/Cta";
import { FaqTemplates } from "./sections/Faq";
import { PricingTemplates } from "./sections/Pricing";
import { FooterTemplates } from "./sections/Footer";
import { GalleryTemplates } from "./sections/Gallery";
import { CalcBatteryTemplates } from "./sections/CalcBattery";
import { CalcSolarTemplates } from "./sections/CalcSolar";
import { CalcElectricTemplates } from "./sections/CalcElectric";
import { CalcQuickTemplates } from "./sections/CalcQuick";
import { PortfolioPreviewTemplates } from "./sections/PortfolioPreview";
import { BreadcrumbTemplates } from "./sections/Breadcrumb";

const REGISTRY = {
  header: HeaderTemplates,
  hero: HeroTemplates,
  cardGrid: CardGridTemplates,
  cta: CtaTemplates,
  faq: FaqTemplates,
  pricing: PricingTemplates,
  footer: FooterTemplates,
  gallery: GalleryTemplates,
  calcBattery: CalcBatteryTemplates,
  calcSolar: CalcSolarTemplates,
  calcElectric: CalcElectricTemplates,
  calcQuick: CalcQuickTemplates,
  portfolioPreview: PortfolioPreviewTemplates,
  breadcrumb: BreadcrumbTemplates,
} as const;

export const SECTION_LABELS: Record<string, string> = {
  header: "Antet / Meniu",
  hero: "Hero (titlu principal)",
  cardGrid: "Grilă de carduri",
  cta: "Banner CTA",
  faq: "Întrebări frecvente",
  pricing: "Prețuri",
  footer: "Footer / Contact",
  gallery: "Galerie foto",
  calcBattery: "Calculator baterie",
  calcSolar: "Calculator sistem fotovoltaic",
  calcElectric: "Calculator cost instalație electrică",
  calcQuick: "Calculator rapid (pași pill)",
  portfolioPreview: "Preview portofoliu",
  breadcrumb: "Breadcrumb (fir de Ariadna)",
};

export function SectionRenderer({ section, editMode }: { section: Section; editMode?: boolean }) {
  const group = REGISTRY[section.type as keyof typeof REGISTRY];
  if (!group) return null;
  const Comp = group[section.template as 1 | 2 | 3] ?? group[1];
  // The header is itself `position: sticky` — wrapping it in a div here would
  // shrink-wrap that div to the header's own height, leaving the sticky
  // element no room to "float" within its containing block while scrolling
  // (it would un-stick almost immediately). Render it unwrapped so its real
  // containing block is the full-page sections list instead.
  if (section.type === "header") {
    return <Comp data={section.data} editMode={editMode} />;
  }
  // Anchor id for #section-style nav links — the section's own `id` (e.g.
  // renamed to "servicii"/"preturi") becomes the DOM target.
  return (
    <div id={section.id}>
      <Comp data={section.data} editMode={editMode} />
    </div>
  );
}
