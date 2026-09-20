import type { SectionData } from "@/lib/types";

export function Breadcrumb1({ data }: { data: SectionData }) {
  const items = data.breadcrumbItems ?? [];
  if (items.length === 0) return null;

  return (
    <nav className="max-w-[1180px] mx-auto px-6 pt-4 flex flex-wrap items-center gap-1.5 text-[13px]" style={{ color: "var(--text-dim)" }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.id} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {isLast ? (
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                {item.label}
              </span>
            ) : (
              <a href={item.href} className="no-underline hover:underline" style={{ color: "var(--text-dim)" }}>
                {item.label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export const BreadcrumbTemplates = { 1: Breadcrumb1 };
