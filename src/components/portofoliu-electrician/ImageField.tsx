"use client";

import { useEffect, useRef, useState } from "react";

interface GalleryProject {
  id: string;
  name: string;
  categoryLabel: string;
  photos: { id: string; thumbS: string; thumbL: string }[];
}

export function ImageField({ value, onChange, label }: { value?: string; onChange: (url: string) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/electrician/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) onChange(json.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        {value && <img src={value} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="text-xs bg-slate-100 px-3 py-2 rounded-lg font-medium"
          disabled={uploading}
        >
          {uploading ? "Se încarcă..." : value ? "Schimbă imaginea" : "Alege imagine"}
        </button>
      </div>

      {pickerOpen && (
        <ImagePickerModal
          onClose={() => setPickerOpen(false)}
          onPickFromPortfolio={(url) => {
            onChange(url);
            setPickerOpen(false);
          }}
          onPickFromDisk={() => {
            setPickerOpen(false);
            inputRef.current?.click();
          }}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}

function ImagePickerModal({
  onClose,
  onPickFromPortfolio,
  onPickFromDisk,
}: {
  onClose: () => void;
  onPickFromPortfolio: (url: string) => void;
  onPickFromDisk: () => void;
}) {
  const [tab, setTab] = useState<"portfolio" | "disk">("portfolio");
  const [projects, setProjects] = useState<GalleryProject[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/electrician/photos")
      .then((r) => r.json())
      .then((json) => setProjects(json.projects))
      .catch(() => setProjects([]));
  }, []);

  const filtered = (projects ?? []).filter(
    (p) => p.photos.length > 0 && (!query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("portfolio")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${tab === "portfolio" ? "bg-ink text-white" : "bg-slate-100"}`}
            >
              Din portofoliu
            </button>
            <button
              onClick={() => setTab("disk")}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${tab === "disk" ? "bg-ink text-white" : "bg-slate-100"}`}
            >
              De pe calculator
            </button>
          </div>
          <button onClick={onClose} className="text-slate-500 text-xl leading-none">
            ×
          </button>
        </div>

        {tab === "portfolio" ? (
          <div className="flex-1 overflow-y-auto p-5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută proiect (ex: fotovoltaic, tablou electric...)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4"
            />
            {projects === null && <p className="text-sm text-slate-500">Se încarcă pozele...</p>}
            {projects !== null && filtered.length === 0 && (
              <p className="text-sm text-slate-500">Nicio poză găsită.</p>
            )}
            <div className="space-y-6">
              {filtered.map((p) => (
                <div key={p.id}>
                  <div className="text-xs font-semibold text-slate-500 mb-1.5">
                    {p.name} <span className="text-slate-400">— {p.categoryLabel}</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {p.photos.map((ph) => (
                      <button
                        key={ph.id}
                        type="button"
                        onClick={() => onPickFromPortfolio(ph.thumbL)}
                        className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-accent hover:ring-2 hover:ring-accent"
                      >
                        <img src={ph.thumbS} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10">
            <p className="text-sm text-slate-500 text-center">Alege o imagine de pe calculatorul tău. Va fi încărcată pe server.</p>
            <button onClick={onPickFromDisk} className="bg-ink text-white px-5 py-2.5 rounded-lg font-semibold text-sm">
              Deschide selectorul de fișiere
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
