"""Regenereaza src/data/portofoliu.json din src/data/proiecte-portofoliu.json
+ scripts/portfolio_photos_source.json. Ruleaza asta dupa ce editezi manual
unul din cele doua fisiere (ex: ai bifat "ascuns" pe un santier).

Utilizare: py scripts/regenereaza_portofoliu.py
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROIECTE = f"{ROOT}/src/data/proiecte-portofoliu.json"
PHOTOS_SRC = f"{ROOT}/scripts/portfolio_photos_source.json"


def main():
    proiecte = json.load(open(PROIECTE, encoding="utf-8"))
    photo_src = json.load(open(PHOTOS_SRC, encoding="utf-8"))

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

    print(f"Portofoliu regenerat: {len(proiecte_out)} proiecte, {sum(len(v) for v in photos_by_project.values())} poze vizibile.")


if __name__ == "__main__":
    main()
