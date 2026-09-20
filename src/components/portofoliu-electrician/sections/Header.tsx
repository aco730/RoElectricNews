"use client";

import { useState } from "react";
import type { SectionData } from "@/lib/types";

export function Header1({ data, editMode }: { data: SectionData; editMode?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = data.navLinks ?? [];

  return (
    <div className="sticky z-40 mx-auto max-w-[1180px] px-3.5" style={{ top: editMode ? 70 : 14 }}>
      <header
        className="flex items-center justify-between gap-3 rounded-full border px-3 py-2.5 pl-5 backdrop-blur-[14px]"
        style={{
          background: "color-mix(in srgb, var(--bg-elev) 92%, transparent)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow)",
          color: "var(--text)",
        }}
      >
        <a href="/electrician" className="flex items-center no-underline whitespace-nowrap" aria-label={data.brand}>
          {data.logo && <img src={data.logo} alt={data.brand ?? ""} className="h-9 w-9 rounded-lg object-cover" />}
        </a>
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((l) => (
            <a key={l.id} href={l.href} className="text-[13.5px] font-semibold no-underline whitespace-nowrap" style={{ color: "var(--text-dim)" }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {navLinks.length > 0 && (
            <button
              type="button"
              aria-label="Meniu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border shrink-0"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              {menuOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
          {data.phone && (
            <a
              href={`tel:${data.phone.replace(/\s/g, "")}`}
              className="rounded-full px-[18px] py-2.5 text-[13px] font-bold no-underline inline-flex items-center whitespace-nowrap"
              style={{ background: "var(--accent)", color: "#1a1712" }}
            >
              Sună acum
            </a>
          )}
        </div>
      </header>
      {menuOpen && navLinks.length > 0 && (
        <nav
          className="md:hidden mt-2 flex flex-col overflow-hidden rounded-2xl border backdrop-blur-[14px]"
          style={{
            background: "color-mix(in srgb, var(--bg-elev) 96%, transparent)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow)",
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="px-5 py-3 text-[14px] font-semibold no-underline border-b last:border-b-0"
              style={{ color: "var(--text)", borderColor: "var(--border)" }}
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

export function Header2({ data }: { data: SectionData }) {
  return (
    <header className="px-6 py-5 text-center border-b border-slate-200">
      <a href="/electrician" className="font-bold text-xl">
        {data.brand}
      </a>
      <nav className="flex justify-center gap-5 mt-2 text-sm font-medium flex-wrap">
        {(data.navLinks ?? []).map((l) => (
          <a key={l.id} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export function Header3({ data }: { data: SectionData }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-ink text-white">
      <a href="/electrician" className="font-bold">
        {data.brand}
      </a>
      <nav className="flex gap-4 text-sm">
        {(data.navLinks ?? []).map((l) => (
          <a key={l.id} href={l.href} className="opacity-90 hover:opacity-100">
            {l.label}
          </a>
        ))}
      </nav>
      {data.phone && (
        <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="text-accent font-semibold text-sm">
          {data.phone}
        </a>
      )}
    </header>
  );
}

export const HeaderTemplates = { 1: Header1, 2: Header2, 3: Header3 };
