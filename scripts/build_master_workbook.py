"""Construieste continut-site.xlsx (baza de date a site-ului) pornind din
sursele existente in electric NEWS: calendarul editorial, textele articolelor
si foile de Q&A. Se ruleaza o singura data la migrare; dupa asta, singura
sursa de adevar e continut-site.xlsx (editat manual sau prin admin ulterior).
"""
import os
import openpyxl
from openpyxl.utils import get_column_letter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEWS = f"{ROOT}/electric NEWS"
OUT_XLSX = f"{ROOT}/continut-site.xlsx"

CATEGORII = [
    ("electric-instalatii", "Electric & instalații", "#12213A"),
    ("smart-home", "Smart Home & Automatizări", "#6A3D9A"),
    ("fotovoltaic", "Fotovoltaic", "#E97B0F"),
    ("baterii-stocare", "Baterii & Stocare", "#0EA5A0"),
    ("reglementari-preturi", "Reglementări & Prețuri energie", "#B22222"),
    ("youtube", "YouTube", "#FF0000"),
    ("colaboratori", "Colaboratori", "#A0722F"),
]
NUME_TO_SLUG = {nume: slug for slug, nume, _ in CATEGORII}


def slugify(s):
    repl = {"ă":"a","â":"a","î":"i","ș":"s","ş":"s","ț":"t","ţ":"t","Ă":"a","Â":"a","Î":"i","Ș":"s","Ț":"t"}
    out = "".join(repl.get(ch, ch) for ch in s)
    out = out.lower()
    keep = [ch if ch.isalnum() else (" " if ch in " -_/" else "") for ch in out]
    out = "".join(keep)
    return "-".join(out.split())[:80].strip("-")


def main():
    wb_src = openpyxl.load_workbook(f"{NEWS}/electric-news-calendar-editorial.xlsx", data_only=True)
    cal_rows = list(wb_src["Calendar editorial"].iter_rows(values_only=True))[1:]
    by_slug = {}
    for row in cal_rows:
        title = row[4]
        if title:
            by_slug[slugify(title)] = row

    qa_cat_rows = list(wb_src["Q&A"].iter_rows(values_only=True))[1:]
    qa_art_rows = list(wb_src["Q&A Articole"].iter_rows(values_only=True))[1:]

    out = openpyxl.Workbook()
    out.remove(out.active)

    # --- Categorii ---
    ws = out.create_sheet("Categorii")
    ws.append(["slug", "nume", "culoare", "descriere"])
    for slug, nume, culoare in CATEGORII:
        ws.append([slug, nume, culoare, f"Articole și ghiduri despre {nume.lower()}."])

    # --- Articole ---
    ws = out.create_sheet("Articole")
    ws.append(["slug", "titlu", "categorie", "data", "sursaNume", "sursaUrl", "imagine", "continut"])
    img_dir = f"{NEWS}/site-local/assets/images/articole"
    art_dir = f"{NEWS}/articole-text"
    for fn in sorted(os.listdir(art_dir)):
        if not fn.endswith(".txt"):
            continue
        slug = fn[:-4]
        row = by_slug.get(slug)
        text = open(f"{art_dir}/{fn}", encoding="utf-8").read().strip()
        lines = text.split("\n")
        titlu = lines[0].strip()
        continut = "\n".join(lines[1:]).strip()
        if row:
            categorie_nume, data, sursa_nume, sursa_url = row[2], row[1], row[5], row[6]
            categorie = NUME_TO_SLUG.get(categorie_nume, slugify(categorie_nume or ""))
        else:
            categorie, data, sursa_nume, sursa_url = "", None, "", ""
        img_name = f"{slug}.jpg" if os.path.exists(f"{img_dir}/{slug}.jpg") else ""
        ws.append([slug, titlu, categorie, data, sursa_nume, sursa_url, img_name, continut])

    # --- QA_Categorii ---
    ws = out.create_sheet("QA_Categorii")
    ws.append(["categorie", "intrebare", "raspuns", "articole"])
    for categorie_nume, intrebare, raspuns, slugs in qa_cat_rows:
        if not categorie_nume or not intrebare:
            continue
        slug_cat = NUME_TO_SLUG.get(categorie_nume, slugify(categorie_nume))
        clean_slugs = ",".join(
            s.strip() for s in str(slugs or "").split(",") if s.strip() and not s.strip().startswith("pagina:")
        )
        ws.append([slug_cat, intrebare, raspuns, clean_slugs])

    # --- QA_Articole ---
    ws = out.create_sheet("QA_Articole")
    ws.append(["slug", "intrebare", "raspuns"])
    for slug, intrebare, raspuns in qa_art_rows:
        if slug and intrebare:
            ws.append([slug, intrebare, raspuns])

    # latime coloane rezonabila
    for sheet in out.worksheets:
        for i, col in enumerate(sheet.columns, 1):
            sheet.column_dimensions[get_column_letter(i)].width = 30

    out.save(OUT_XLSX)
    print(f"Scris {OUT_XLSX}")
    print(f"  Categorii: {len(CATEGORII)}")
    print(f"  Articole: {ws.max_row if False else len(os.listdir(art_dir))}")


if __name__ == "__main__":
    main()
