import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CERERI_DIR = f"{ROOT}/cereri-publicare"
MANIFEST = f"{CERERI_DIR}/.processed-manifest.json"

TIP_LABEL = {
    "link": "Link articol",
    "youtube": "Transcript YouTube",
    "lista": "Listă de linkuri",
    "sursa": "Site de știri de monitorizat",
}

def main():
    os.makedirs(CERERI_DIR, exist_ok=True)
    manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else {}
    files = sorted(f for f in os.listdir(CERERI_DIR) if f.lower().endswith(".json") and not f.startswith("."))
    new_files = [f for f in files if f not in manifest]

    if not new_files:
        print("Nicio cerere nouă de procesat.")
        return

    print(f"{len(new_files)} cerere(i) nouă(i) găsită(e):\n")
    for f in new_files:
        path = f"{CERERI_DIR}/{f}"
        try:
            data = json.load(open(path, encoding="utf-8"))
        except Exception as e:
            print(f"=== {f} === EROARE la citire: {e}\n")
            continue
        tip = data.get("tip", "?")
        print(f"=== {f} ===")
        print(f"Tip: {TIP_LABEL.get(tip, tip)}")
        print(f"Titlu propus: {data.get('titlu_propus') or '(niciunul — va fi generat automat)'}")
        print(f"Categorie sugerată: {data.get('categorie_sugerata') or '(automat, din conținut)'}")
        continut = data.get("continut", "")
        print(f"Conținut ({len(continut)} caractere): {continut[:300]}{'...' if len(continut) > 300 else ''}")
        if data.get("nota"):
            print(f"Notă: {data['nota']}")
        print(f"Sponsorizat: {data.get('sponsorizat', 'Nu')}")
        print(f"Creat la: {data.get('creat_la', '?')}")
        print()

if __name__ == "__main__":
    main()
