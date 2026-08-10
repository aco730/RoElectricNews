"""Sterge DEFINITIV un santier din portofoliu: randul lui din
src/data/proiecte-portofoliu.json, pozele lui din
scripts/portfolio_photos_source.json si fisierele thumbnail de pe disc.
Ireversibil.

Utilizare: py scripts/delete_project.py <project_id>
  (project_id e coloana 'id', ex: p5, vila-popescu-sibiu)

Pentru stergere REVERSIBILA (ascundere, nu stergere), seteaza "ascuns": true
pe randul lui din src/data/proiecte-portofoliu.json si ruleaza
py scripts/regenereaza_portofoliu.py — fara acest script.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROIECTE = f"{ROOT}/src/data/proiecte-portofoliu.json"
PHOTOS_SRC = f"{ROOT}/scripts/portfolio_photos_source.json"
THUMBS_DIR = f"{ROOT}/public/images/portofoliu/thumbs"


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
    args = [a for a in sys.argv[1:] if a != "--yes"]
    non_interactiv = "--yes" in sys.argv
    if len(args) != 1:
        print("Utilizare: py scripts/delete_project.py <project_id> [--yes]")
        return
    project_id = args[0]

    proiecte = json.load(open(PROIECTE, encoding="utf-8"))
    target = next((p for p in proiecte if p["id"] == project_id), None)
    if target is None:
        print(f"Nu exista niciun santier cu id '{project_id}'.")
        return

    if not non_interactiv:
        confirm = input(f"Sigur stergi definitiv santierul '{target['nume']}' (id: {project_id}) si toate pozele lui? Scrie 'da' ca sa confirmi: ")
        if confirm.strip().lower() != "da":
            print("Anulat.")
            return

    proiecte = [p for p in proiecte if p["id"] != project_id]

    photo_src = json.load(open(PHOTOS_SRC, encoding="utf-8"))
    deleted = [p for p in photo_src["photos"] if p["project_id"] == project_id]
    photo_src["photos"] = [p for p in photo_src["photos"] if p["project_id"] != project_id]
    photo_src["projects_source"].pop(project_id, None)

    with open(PROIECTE, "w", encoding="utf-8") as f:
        json.dump(proiecte, f, ensure_ascii=False, indent=2)
    with open(PHOTOS_SRC, "w", encoding="utf-8") as f:
        json.dump(photo_src, f, ensure_ascii=False)

    removed_files = 0
    for p in deleted:
        for suffix in ("_s.webp", "_l.webp"):
            path = f"{THUMBS_DIR}/{p['id']}{suffix}"
            if os.path.exists(path):
                os.remove(path)
                removed_files += 1

    regenereaza_portofoliu(proiecte, photo_src)

    print(f"\nȘters definitiv: santierul '{target['nume']}' ({project_id}), {len(deleted)} poze, {removed_files} fisiere thumbnail.")


if __name__ == "__main__":
    main()
