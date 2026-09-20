export type SectionType =
  | "header"
  | "hero"
  | "cardGrid"
  | "cta"
  | "faq"
  | "pricing"
  | "footer"
  | "gallery"
  | "calcBattery"
  | "calcSolar"
  | "calcElectric"
  | "calcQuick"
  | "portfolioPreview"
  | "breadcrumb"
  | "richText";

export interface Card {
  id: string;
  title: string;
  text: string;
  image?: string;
  link?: string;
  price?: string;
  icon?: string;
  bullets?: string[];
  ctaText?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PriceBreakdownLine {
  id: string;
  label: string;
  amount: string;
  highlight?: boolean;
  url?: string;
}

export interface PriceItem {
  id: string;
  name: string;
  price: string;
  unit?: string;
  description?: string;
  image?: string;
  breakdown?: PriceBreakdownLine[];
  sourceNote?: string;
  sourceUrl?: string;
  bullets?: string[];
  ctaText?: string;
  ctaLink?: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface SectionData {
  // header
  brand?: string;
  logo?: string;
  navLinks?: NavLink[];
  phone?: string;
  // hero
  badge?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  microCopy?: string;
  // cardGrid / cta / pricing / faq shared
  heading?: string;
  text?: string;
  cards?: Card[];
  buttonText?: string;
  buttonLink?: string;
  faqItems?: FaqItem[];
  priceItems?: PriceItem[];
  // footer
  whatsapp?: string;
  email?: string;
  location?: string;
  // gallery
  galleryCategories?: string[];
  // portfolioPreview
  portfolioLimit?: number;
  // breadcrumb
  breadcrumbItems?: NavLink[];
  // richText
  html?: string;
}

export interface Section {
  id: string;
  type: SectionType;
  template: 1 | 2 | 3;
  data: SectionData;
}

export interface Page {
  id: string;
  slug: string; // "" = home
  title: string;
  description?: string; // meta description unică per pagină (SEO)
  sections: Section[];
}

export interface Site {
  siteName: string;
  pages: Page[];
}
