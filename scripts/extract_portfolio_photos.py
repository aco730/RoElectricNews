"""Extrage datele de poze (nemodificabile manual) din vechiul portofoliu
si le salveaza ca sursa statica pentru sync_content.py. Se ruleaza o
singura data la migrare.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f"{ROOT}/portofoliu poze solar electric panel/deploy/data.js"
OUT = f"{ROOT}/scripts/portfolio_photos_source.json"

text = open(SRC, encoding="utf-8").read()
text = text[text.index("{"):].rstrip().rstrip(";")
data = json.loads(text)

photos = [
    {
        "id": p["id"],
        "album": p["album"],
        "project_id": p["project_id"],
        "date": p["date"],
        "thumb_s": f"/images/portofoliu/thumbs/{p['id']}_s.webp",
        "thumb_l": f"/images/portofoliu/thumbs/{p['id']}_l.webp",
    }
    for p in data["photos"]
]

projects_source = {
    p["id"]: {"cover_id": p.get("cover_id"), "count": p["count"], "date_from": p["date_from"], "date_to": p["date_to"]}
    for p in data["projects"]
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump({"photos": photos, "projects_source": projects_source, "albums": data["albums"]}, f, ensure_ascii=False)

print(f"Poze: {len(photos)}, proiecte: {len(projects_source)}")
