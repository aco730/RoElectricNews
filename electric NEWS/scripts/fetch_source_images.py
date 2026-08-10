import os, json, hashlib, datetime, io, sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from PIL import Image
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = f"{ROOT}/electric-news-calendar-editorial.xlsx"
IMG_ART_DIR = f"{ROOT}/site-local/assets/images/articole"
MANIFEST = f"{IMG_ART_DIR}/.image-manifest.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "ro-RO,ro;q=0.9,en;q=0.8",
}

DIACRITICE = {"ă":"a","â":"a","î":"i","ș":"s","ş":"s","ț":"t","ţ":"t"}
def slugify(s):
    out = "".join(DIACRITICE.get(c, c) for c in s.lower())
    keep = []
    for ch in out:
        if ch.isalnum():
            keep.append(ch)
        elif ch in " -_/":
            keep.append(" ")
    out = "".join(keep)
    return "-".join(out.split())[:80].strip("-")

def md5_of(path):
    return hashlib.md5(open(path, "rb").read()).hexdigest()

def find_og_image(page_url, html):
    soup = BeautifulSoup(html, "html.parser")
    for sel in [
        ("meta", {"property": "og:image"}),
        ("meta", {"property": "og:image:secure_url"}),
        ("meta", {"name": "twitter:image"}),
        ("meta", {"name": "twitter:image:src"}),
    ]:
        tag = soup.find(*sel)
        if tag and tag.get("content"):
            return urljoin(page_url, tag["content"].strip())
    # fallback: prima imagine mare dintr-un <article>/<main>, ignorând iconițe/logo mici
    container = soup.find("article") or soup.find("main") or soup
    for img in container.find_all("img"):
        src = img.get("src")
        if not src or src.strip().startswith("data:"):
            src = img.get("data-src") or img.get("data-lazy-src") or img.get("data-original")
        if not src or src.strip().startswith("data:"):
            continue
        if any(x in src.lower() for x in ["logo", "icon", "sprite", "avatar", "1x1", "pixel"]):
            continue
        return urljoin(page_url, src)
    return None

def download_image(img_url):
    r = requests.get(img_url, headers=HEADERS, timeout=20)
    r.raise_for_status()
    ctype = r.headers.get("Content-Type", "")
    if "image" not in ctype and not img_url.lower().split("?")[0].endswith((".jpg",".jpeg",".png",".webp",".gif")):
        raise ValueError(f"Nu pare imagine (Content-Type: {ctype})")
    img = Image.open(io.BytesIO(r.content))
    if img.width < 300 or img.height < 150:
        raise ValueError(f"Imagine prea mică ({img.width}x{img.height}) — probabil iconiță, nu foto articol")
    return img.convert("RGB")

def fetch_for_item(slug, titlu, page_url):
    try:
        r = requests.get(page_url, headers=HEADERS, timeout=20)
        r.raise_for_status()
    except Exception as e:
        return None, f"eșec acces pagină sursă ({e})"
    img_url = find_og_image(page_url, r.text)
    if not img_url:
        return None, "nicio imagine găsită în pagina sursă"
    try:
        img = download_image(img_url)
    except Exception as e:
        return None, f"eșec descărcare imagine ({e})"
    out_path = f"{IMG_ART_DIR}/{slug}.jpg"
    img.save(out_path, quality=90)
    return (out_path, img_url), None

def main(target_slugs=None, force=False):
    os.makedirs(IMG_ART_DIR, exist_ok=True)
    manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else {}

    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb["Calendar editorial"]
    seen_slugs, items = {}, []
    for r in range(2, ws.max_row + 1):
        titlu = ws.cell(row=r, column=5).value
        cat = ws.cell(row=r, column=3).value
        url = (ws.cell(row=r, column=7).value or "").strip()
        if not titlu or not cat:
            continue
        base_slug = slugify(titlu)
        slug = base_slug
        n = 2
        while slug in seen_slugs:
            slug = f"{base_slug}-{n}"
            n += 1
        seen_slugs[slug] = True
        if url.startswith("http"):
            items.append((slug, titlu, url))

    if target_slugs:
        items = [it for it in items if it[0] in target_slugs]

    ok, skipped_manual, failed = 0, 0, []
    for slug, titlu, page_url in items:
        out_path = f"{IMG_ART_DIR}/{slug}.jpg"
        if os.path.exists(out_path) and not force:
            # regula simpla: daca fisierul exista deja, nu se atinge automat — niciodata,
            # decat daca e cerut explicit (slug trecut + --force)
            skipped_manual += 1
            continue
        result, err = fetch_for_item(slug, titlu, page_url)
        if err:
            failed.append((slug, err))
            continue
        (out_path, img_url) = result
        manifest[slug] = {
            "source": "external", "origin_image_url": img_url, "page_url": page_url,
            "md5": md5_of(out_path),
            "fetched_at": datetime.datetime.now().isoformat(timespec="seconds"),
        }
        ok += 1
        print(f"OK  {slug}  <-  {img_url}")

    json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"\nPoze reale descărcate: {ok}. Sărite (poză înlocuită manual): {skipped_manual}. Eșuate: {len(failed)}.")
    for slug, err in failed:
        print(f"  EȘUAT {slug}: {err}")

if __name__ == "__main__":
    args = sys.argv[1:]
    force = "--force" in args
    targets = [a for a in args if a != "--force"]
    if force and not targets:
        print("Eroare: --force cere cel puțin un slug explicit (nu se aplică în bloc, la toate).")
        sys.exit(1)
    main(set(targets) if targets else None, force=force)
