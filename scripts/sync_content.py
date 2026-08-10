"""Sincronizeaza site-ul Astro cu continut-site.xlsx (baza de date veche, pe Excel).

ATENTIE: articolele, categoriile si Q&A se editeaza acum din panoul de admin
(/admin), care scrie DIRECT in src/content/articole/*.md, src/data/qa-*.json —
nu mai trece prin acest Excel. Daca rulezi acest script, regenereaza acele
fisiere DIN Excel si suprascrie orice modificare facuta din admin care nu a
fost introdusa manual si in continut-site.xlsx. Foloseste-l doar daca stii ca
lucrezi intentionat cu fluxul vechi, bazat pe Excel.

Portofoliul (poze/santiere) NU mai e generat din Excel de acest script — vezi
scripts/add_photos.py, scripts/delete_project.py si scripts/regenereaza_portofoliu.py,
care lucreaza direct pe src/data/proiecte-portofoliu.json si
scripts/portfolio_photos_source.json.

Regenereaza (doar daca rulat manual):
  - src/data/categories.json
  - src/content/articole/*.md  (frontmatter + continut)
  - src/data/qa-categorii.json
  - src/data/qa-articole.json
"""
import json
import os
import shutil
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = f"{ROOT}/continut-site.xlsx"
DATA_DIR = f"{ROOT}/src/data"
CONTENT_DIR = f"{ROOT}/src/content/articole"
IMAGES_SRC = f"{ROOT}/electric NEWS/site-local/assets/images/articole"
IMAGES_DEST = f"{ROOT}/public/images/articole"


def rows_of(wb, sheet):
    it = wb[sheet].iter_rows(values_only=True)
    header = next(it)
    return [dict(zip(header, r)) for r in it if any(v is not None and v != "" for v in r)]


def yaml_str(s):
    s = "" if s is None else str(s)
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)

    categorii = rows_of(wb, "Categorii")
    articole = rows_of(wb, "Articole")
    qa_categorii = rows_of(wb, "QA_Categorii")
    qa_articole = rows_of(wb, "QA_Articole")

    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(IMAGES_DEST, exist_ok=True)

    # --- categories.json ---
    cats_out = [
        {"slug": c["slug"], "name": c["nume"], "color": c["culoare"], "description": c.get("descriere") or ""}
        for c in categorii
    ]
    with open(f"{DATA_DIR}/categories.json", "w", encoding="utf-8") as f:
        json.dump(cats_out, f, ensure_ascii=False, indent=2)

    # --- qa-categorii.json (keyed by category slug) ---
    qa_cat_out = {}
    for r in qa_categorii:
        slugs = [s.strip() for s in str(r.get("articole") or "").split(",") if s.strip()]
        qa_cat_out.setdefault(r["categorie"], []).append(
            {"intrebare": r["intrebare"], "raspuns": r["raspuns"], "articole": slugs}
        )
    with open(f"{DATA_DIR}/qa-categorii.json", "w", encoding="utf-8") as f:
        json.dump(qa_cat_out, f, ensure_ascii=False, indent=2)

    # --- qa-articole.json (keyed by article slug) ---
    qa_art_out = {}
    for r in qa_articole:
        qa_art_out.setdefault(r["slug"], []).append({"intrebare": r["intrebare"], "raspuns": r["raspuns"]})
    with open(f"{DATA_DIR}/qa-articole.json", "w", encoding="utf-8") as f:
        json.dump(qa_art_out, f, ensure_ascii=False, indent=2)

    # --- content/articole/*.md (regenerat integral din Excel) ---
    if os.path.exists(CONTENT_DIR):
        shutil.rmtree(CONTENT_DIR)
    os.makedirs(CONTENT_DIR)

    for a in articole:
        slug = a["slug"]
        data_val = a.get("data")
        data_str = data_val.date().isoformat() if hasattr(data_val, "date") else (str(data_val) if data_val else "")
        imagine = a.get("imagine") or ""
        img_field = f"/images/articole/{imagine}" if imagine else ""

        if imagine and os.path.exists(f"{IMAGES_SRC}/{imagine}"):
            shutil.copyfile(f"{IMAGES_SRC}/{imagine}", f"{IMAGES_DEST}/{imagine}")

        frontmatter = [
            "---",
            f"title: {yaml_str(a.get('titlu'))}",
            f"categorie: {a.get('categorie') or ''}",
            f"data: {data_str}",
            f"sursaNume: {yaml_str(a.get('sursaNume'))}",
            f"sursaUrl: {yaml_str(a.get('sursaUrl'))}",
            f"imagine: {yaml_str(img_field)}",
            "---",
            "",
            (a.get("continut") or "").strip(),
            "",
        ]
        with open(f"{CONTENT_DIR}/{slug}.md", "w", encoding="utf-8") as f:
            f.write("\n".join(frontmatter))

    print(f"Categorii: {len(cats_out)}")
    print(f"Articole: {len(articole)}")
    print(f"Q&A categorii: {sum(len(v) for v in qa_cat_out.values())} intrebari in {len(qa_cat_out)} categorii")
    print(f"Q&A articole: {sum(len(v) for v in qa_art_out.values())} intrebari pentru {len(qa_art_out)} articole")


if __name__ == "__main__":
    main()
