import type { SectionData } from "@/lib/types";
import { projectsForCategories, CATEGORY_LABELS, type GalleryProject } from "@/lib/photos";

function PortfolioGrid({ projects }: { projects: GalleryProject[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {projects.map((p) => (
        <a
          key={p.id}
          href={`/electrician/portofoliu/${p.id}`}
          className="group block rounded-xl overflow-hidden border no-underline text-left"
          style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}
        >
          <div className="h-[120px] overflow-hidden">
            {p.coverThumb && (
              <img
                src={p.coverThumb}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
            )}
          </div>
          <div className="px-3 py-2">
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 mb-1"
              style={{ background: "var(--accent-2)", color: "#fff" }}
            >
              {CATEGORY_LABELS[p.category] ?? p.category}
            </span>
            <h3 className="text-[13px] font-semibold leading-snug truncate" style={{ color: "var(--text)" }}>
              {p.name}
            </h3>
          </div>
        </a>
      ))}
    </div>
  );
}

export function PortfolioPreview1({ data }: { data: SectionData }) {
  const allProjects = projectsForCategories();
  const projects = allProjects.slice(0, data.portfolioLimit ?? 8);
  const totalPhotos = allProjects.reduce((sum, p) => sum + p.count, 0);
  const totalProiecte = allProjects.length;

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-12 text-center">
      {data.heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight mb-2" style={{ color: "var(--text)" }}>
          {data.heading}
        </h2>
      )}
      {data.text && (
        <p className="mb-7 max-w-xl mx-auto text-sm" style={{ color: "var(--text-dim)" }}>
          {data.text}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mb-10">
        <div>
          <div className="text-[clamp(32px,5vw,44px)] font-extrabold leading-none" style={{ color: "var(--accent)" }}>
            <span data-count-to={totalPhotos}>0</span>+
          </div>
          <div className="text-xs uppercase tracking-wide mt-1" style={{ color: "var(--text-dim)" }}>poze reale</div>
        </div>
        <div>
          <div className="text-[clamp(32px,5vw,44px)] font-extrabold leading-none" style={{ color: "var(--accent)" }}>
            <span data-count-to={totalProiecte}>0</span>
          </div>
          <div className="text-xs uppercase tracking-wide mt-1" style={{ color: "var(--text-dim)" }}>șantiere documentate</div>
        </div>
      </div>
      <PortfolioGrid projects={projects} />
      <a
        href="/electrician/portofoliu"
        className="mt-8 inline-block rounded-full px-6 py-3 text-sm font-bold no-underline"
        style={{ background: "var(--accent)", color: "#1a1712" }}
      >
        Vezi tot portofoliul ({totalPhotos} poze) →
      </a>
    </section>
  );
}

// Full/category listing pages (/electrician/portofoliu/...) — same
// heading/subtitle/card style as the preview above, just every project (or
// every project in one category) and no "see all" button.
export function PortfolioFull({ heading, text, category }: { heading?: string; text?: string; category?: string }) {
  const projects = projectsForCategories(category ? [category] : undefined);

  return (
    <section className="max-w-[1100px] mx-auto px-6 py-12 text-center">
      {heading && (
        <h2 className="text-[clamp(22px,3.2vw,28px)] font-extrabold tracking-tight mb-2" style={{ color: "var(--text)" }}>
          {heading}
        </h2>
      )}
      {text && (
        <p className="mb-7 max-w-xl mx-auto text-sm" style={{ color: "var(--text-dim)" }}>
          {text}
        </p>
      )}
      <PortfolioGrid projects={projects} />
    </section>
  );
}

export const PortfolioPreviewTemplates = { 1: PortfolioPreview1 };
