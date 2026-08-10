import os, sys, json, hashlib, datetime
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_CAT_DIR = f"{ROOT}/site-local/assets/images/categorii"
MANIFEST = f"{IMG_CAT_DIR}/.image-manifest.json"

def load_env(path):
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

def md5_of(path):
    return hashlib.md5(open(path, "rb").read()).hexdigest()

def main(slug, query, force=False):
    load_env(f"{ROOT}/.env")
    api_key = os.environ.get("PEXELS_API_KEY")
    if not api_key:
        raise RuntimeError("Lipsește PEXELS_API_KEY din .env la rădăcina proiectului.")
    os.makedirs(IMG_CAT_DIR, exist_ok=True)
    manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else {}

    out_path = f"{IMG_CAT_DIR}/{slug}.jpg"
    if os.path.exists(out_path) and not force:
        print(f"SĂRIT {slug}: fișierul există deja, nu se suprascrie automat (adaugă --force).")
        return

    r = requests.get(
        "https://api.pexels.com/v1/search",
        headers={"Authorization": api_key},
        params={"query": query, "per_page": 5, "orientation": "landscape"},
        timeout=20,
    )
    r.raise_for_status()
    photos = r.json().get("photos", [])
    if not photos:
        print(f"NIMIC GĂSIT pentru query='{query}'")
        return

    photo = photos[0]
    img_resp = requests.get(photo["src"]["large2x"], timeout=30)
    img_resp.raise_for_status()
    with open(out_path, "wb") as f:
        f.write(img_resp.content)

    manifest[slug] = {
        "source": "stock-pexels", "photographer": photo.get("photographer"),
        "photographer_url": photo.get("photographer_url"),
        "pexels_url": photo.get("url"), "query": query,
        "md5": md5_of(out_path),
        "fetched_at": datetime.datetime.now().isoformat(timespec="seconds"),
    }
    json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"OK {slug} <- Pexels, foto de {photo.get('photographer')} (query: '{query}')")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print('Utilizare: py fetch_stock_category_image.py <slug> "<query engleza>" [--force]')
        sys.exit(1)
    main(sys.argv[1], sys.argv[2], force="--force" in sys.argv)
