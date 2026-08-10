"""Adauga poze noi in portofoliu, pornind de la fisiere puse manual intr-un folder.

Flux de lucru:
  1. Pui poza(ele) intr-un folder din poze-noi/, cu un nume la alegere:
     - daca numele folderului e un project_id existent (ex: p1, p30, other-electrice),
       pozele se adauga la acel santier.
     - daca numele folderului e NOU (ex: "Vila Popescu Sibiu"), se creeaza automat un
       santier nou cu acel nume — apare ca si card + galerie noua pe site.
  2. Rulezi: py scripts/add_photos.py  (sau: npm run add-photos)
  3. Scriptul: redimensioneaza fiecare poza (thumb_s ~500px, thumb_l ~1600px, webp),
     le pune in public/images/portofoliu/thumbs/, adauga santierul nou (daca e cazul)
     in src/data/proiecte-portofoliu.json, adauga fiecare poza in
     scripts/portfolio_photos_source.json (nota goala, editabila ulterior din admin),
     si regenereaza automat src/data/portofoliu.json.
  4. Poza originala e mutata in poze-noi/_procesate/ (ca sa nu se proceseze de doua ori).

Pentru STERGERE unei poze sau unui santier: foloseste panoul de admin
(/admin/portofoliu), sau editeaza direct src/data/proiecte-portofoliu.json /
scripts/portfolio_photos_source.json si ruleaza py scripts/regenereaza_portofoliu.py.
"""
import json, os, secrets, shutil, sys
from datetime import datetime, timezone

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = f"{ROOT}/poze-noi"
PROCESSED = f"{INBOX}/_procesate"
THUMBS_DIR = f"{ROOT}/public/images/portofoliu/thumbs"
PHOTOS_SRC = f"{ROOT}/scripts/portfolio_photos_source.json"
PROIECTE = f"{ROOT}/src/data/proiecte-portofoliu.json"

THUMB_S_WIDTH = 500
THUMB_L_WIDTH = 1600

FOTOVOLTAIC_HINTS = ("foto", "solar", "panou", "panouri", "fv", "invertor")


def make_thumb(im, width):
    im = ImageOps.exif_transpose(im)
    ratio = width / im.width
    return im.convert("RGB").resize((width, max(1, int(im.height * ratio))))


def slugify(s):
    repl = {"ă": "a", "â": "a", "î": "i", "ș": "s", "ş": "s", "ț": "t", "ţ": "t",
            "Ă": "a", "Â": "a", "Î": "i", "Ș": "s", "Ț": "t"}
    out = "".join(repl.get(ch, ch) for ch in s).lower()
    keep = [ch if ch.isalnum() else (" " if ch in " -_/" else "") for ch in out]
    return "-".join("".join(keep).split())[:60].strip("-")


def regenereaza_portofoliu(proiecte, photo_src):
    photos_by_project = {}
    for p in photo_src["photos"]:
        if p.get("ascunsa"):
            continue
        photos_by_project.setdefault(p["project_id"], []).append(
            {k: v for k, v in p.items() if k != "ascunsa"}
        )

    proiecte_out = []
    for p in proiecte:
        if p.get("ascuns"):
            continue
        pid = p["id"]
        cover_info = photo_src["projects_source"].get(pid, {})
        poze_proiect = photos_by_project.get(pid, [])
        cover = next((f["thumb_l"] for f in poze_proiect if f["id"] == cover_info.get("cover_id")), None)
        if not cover and poze_proiect:
            cover = poze_proiect[0]["thumb_l"]
        proiecte_out.append({
            "id": pid, "nume": p["nume"], "album": p.get("album") or "",
            "locatie": p.get("locatie") or "", "note": p.get("note") or "",
            "dataDe": p.get("dataDe") or "", "dataPana": p.get("dataPana") or "",
            "etichete": p.get("etichete") or [],
            "poze": poze_proiect, "cover": cover,
        })

    with open(f"{ROOT}/src/data/portofoliu.json", "w", encoding="utf-8") as f:
        json.dump({"albume": photo_src["albums"], "proiecte": proiecte_out}, f, ensure_ascii=False)


def main():
    if not os.path.isdir(INBOX):
        print(f"Nu exista folderul {INBOX} — creeaza-l si pune poze in subfoldere.")
        return

    photo_src = json.load(open(PHOTOS_SRC, encoding="utf-8"))
    existing_ids = {p["id"] for p in photo_src["photos"]}

    proiecte = json.load(open(PROIECTE, encoding="utf-8"))
    project_ids = {p["id"] for p in proiecte}

    os.makedirs(PROCESSED, exist_ok=True)
    os.makedirs(THUMBS_DIR, exist_ok=True)

    added = []
    new_projects = []
    for folder_name in sorted(os.listdir(INBOX)):
        proj_dir = f"{INBOX}/{folder_name}"
        if folder_name == "_procesate" or not os.path.isdir(proj_dir):
            continue

        files = [
            fn for fn in sorted(os.listdir(proj_dir))
            if os.path.isfile(f"{proj_dir}/{fn}") and fn.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
        ]
        if not files:
            continue

        if folder_name in project_ids:
            project_id = folder_name
        else:
            # folder nou -> santier nou, creat automat
            project_id = slugify(folder_name) or f"santier-{secrets.token_hex(3)}"
            suffix = 2
            base_id = project_id
            while project_id in project_ids:
                project_id = f"{base_id}-{suffix}"
                suffix += 1
            project_ids.add(project_id)

            album = "fotovoltaice" if any(h in folder_name.lower() for h in FOTOVOLTAIC_HINTS) else "electrice"
            today = datetime.now().date().isoformat()
            proiecte.append({
                "id": project_id, "nume": folder_name, "album": album,
                "locatie": "", "note": "", "dataDe": today, "dataPana": today,
                "ascuns": False,
                "etichete": [],
            })
            new_projects.append((project_id, folder_name))
            print(f"Șantier nou: '{folder_name}' -> id '{project_id}'")

        for fn in files:
            path = f"{proj_dir}/{fn}"
            new_id = secrets.token_hex(8)
            while new_id in existing_ids:
                new_id = secrets.token_hex(8)
            existing_ids.add(new_id)

            im = Image.open(path)
            make_thumb(im, THUMB_S_WIDTH).save(f"{THUMBS_DIR}/{new_id}_s.webp", "WEBP", quality=82)
            make_thumb(im, THUMB_L_WIDTH).save(f"{THUMBS_DIR}/{new_id}_l.webp", "WEBP", quality=88)

            album = "fotovoltaice" if any(h in project_id.lower() for h in FOTOVOLTAIC_HINTS) else "electrice"
            entry = {
                "id": new_id,
                "album": album,
                "project_id": project_id,
                "date": datetime.now(timezone.utc).isoformat(),
                "thumb_s": f"/images/portofoliu/thumbs/{new_id}_s.webp",
                "thumb_l": f"/images/portofoliu/thumbs/{new_id}_l.webp",
                "nota": "",
                "ascunsa": False,
            }
            photo_src["photos"].append(entry)
            added.append(entry)

            dest = f"{PROCESSED}/{project_id}__{fn}"
            shutil.move(path, dest)
            print(f"Adaugat: {fn} -> {project_id} (id {new_id})")

    if not added:
        print("Nicio poza noua de procesat (verifica poze-noi/<folder>/).")
        return

    with open(PHOTOS_SRC, "w", encoding="utf-8") as f:
        json.dump(photo_src, f, ensure_ascii=False)
    with open(PROIECTE, "w", encoding="utf-8") as f:
        json.dump(proiecte, f, ensure_ascii=False, indent=2)

    regenereaza_portofoliu(proiecte, photo_src)

    print(f"\n{len(added)} poze noi adaugate", end="")
    if new_projects:
        print(f", {len(new_projects)} șantiere noi create", end="")
    print(".")


if __name__ == "__main__":
    main()
