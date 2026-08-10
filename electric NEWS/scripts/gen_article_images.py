import os, math, json, hashlib, datetime, sys
from PIL import Image, ImageDraw, ImageFont
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Reguli din 9 august 2026: NU se suprascrie niciodata automat o poza de articol
# deja existenta pe disc (generata, reala din sursa, Pexels, YouTube — orice).
# Se genereaza doar pentru articole noi (fisier lipsa), sau pentru sloguri trecute
# explicit cu --force (cerute explicit de utilizator).
FORCE_ALL = "--force-all" in sys.argv
FORCE_SLUGS = set()
if "--force" in sys.argv:
    idx = sys.argv.index("--force")
    if idx + 1 < len(sys.argv):
        FORCE_SLUGS = set(sys.argv[idx + 1].split(","))
XLSX = f"{ROOT}/electric-news-calendar-editorial.xlsx"
IMG_CAT_DIR = f"{ROOT}/site-local/assets/images/categorii"
IMG_ART_DIR = f"{ROOT}/site-local/assets/images/articole"
MANIFEST = f"{IMG_ART_DIR}/.image-manifest.json"

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
if not os.path.exists(FONT_BOLD):
    # fallback pentru rulare locală Windows (nu în sandbox-ul cu fonturi DejaVu)
    win_fonts = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
    ]
    FONT_BOLD = next((p for p in win_fonts if os.path.exists(p)), None)

# categoriile trăiesc în categorii.json (editabile din admin/gestionare/) — nu mai hardcodate aici
_CATEGORII = json.load(open(f"{ROOT}/categorii.json", encoding="utf-8"))
CAT_SLUG = {c["nume"]: c["slug"] for c in _CATEGORII}
CAT_ACCENT = {
    "electric-instalatii": (247, 166, 60),
    "smart-home": (190, 150, 255),
    "fotovoltaic": (255, 236, 150),
    "baterii-stocare": (45, 212, 191),
    "reglementari-preturi": (255, 180, 150),
    "youtube": (255, 70, 70),
    "colaboratori": (230, 190, 120),
}
CAT_DEFAULT_ICON = {
    "electric-instalatii": "bolt",
    "smart-home": "wifi",
    "fotovoltaic": "sun",
    "baterii-stocare": "battery",
    "reglementari-preturi": "doc",
    "youtube": "play",
    "colaboratori": "doc",
}
# categorii noi (adăugate din admin, fără accent/icon predefinit) primesc un fallback rezonabil
for _c in _CATEGORII:
    _slug = _c["slug"]
    if _slug not in CAT_ACCENT:
        _hex = _c["culoare"].lstrip("#")
        CAT_ACCENT[_slug] = tuple(int(_hex[i:i+2], 16) for i in (0, 2, 4)) if len(_hex) == 6 else (150, 150, 150)
    CAT_DEFAULT_ICON.setdefault(_slug, "doc")

DIACRITICE = {"ă":"a","â":"a","î":"i","ș":"s","ş":"s","ț":"t","ţ":"t"}
def norm(s):
    return "".join(DIACRITICE.get(c, c) for c in s.lower())

def slugify(s):
    out = norm(s)
    keep = []
    for ch in out:
        if ch.isalnum():
            keep.append(ch)
        elif ch in " -_/":
            keep.append(" ")
    out = "".join(keep)
    return "-".join(out.split())[:80].strip("-")

def pick_icon(titlu, cat_slug):
    t = norm(titlu)
    if any(k in t for k in ["pret", "cost", "costa", "tarif", "factura", " leu", "eur", "tva", "amortizare", "buget", "finantare"]):
        return "money"
    if any(k in t for k in ["baterie", "baterii", "stocare", "litiu", "lifepo", "kwh"]):
        return "battery"
    if any(k in t for k in ["lege", "anre", "reglement", "ccr", "metodologie", "licenta", "comunitat", "certificat", "afm"]):
        return "doc"
    if any(k in t for k in ["smart", "matter", "zigbee", "wifi", "automat", "camere", "ventilatie"]):
        return "wifi"
    if any(k in t for k in ["panou", "invertor", "fotovoltaic", "kwp", " mw", "solar"]):
        return "sun"
    return CAT_DEFAULT_ICON[cat_slug]

def icon_bolt(draw, cx, cy, r, color):
    s = r * 0.85
    pts = [(cx+0.15*s,cy-0.9*s),(cx-0.45*s,cy+0.05*s),(cx-0.05*s,cy+0.05*s),
           (cx-0.2*s,cy+0.9*s),(cx+0.5*s,cy-0.1*s),(cx+0.08*s,cy-0.1*s)]
    draw.polygon(pts, fill=color)

def icon_sun(draw, cx, cy, r, color):
    draw.ellipse([cx-r*0.4,cy-r*0.4,cx+r*0.4,cy+r*0.4], fill=color)
    for ang in range(0, 360, 45):
        rad = math.radians(ang)
        x0, y0 = cx+r*0.55*math.cos(rad), cy+r*0.55*math.sin(rad)
        x1, y1 = cx+r*0.85*math.cos(rad), cy+r*0.85*math.sin(rad)
        draw.line([(x0,y0),(x1,y1)], fill=color, width=4)

def icon_battery(draw, cx, cy, r, color):
    bw, bh = r*1.0, r*1.4
    draw.rounded_rectangle([cx-bw/2,cy-bh/2,cx+bw/2,cy+bh/2], radius=5, outline=color, width=4)
    draw.rectangle([cx-bw*0.18,cy-bh/2-r*0.16,cx+bw*0.18,cy-bh/2+2], fill=color)
    draw.rectangle([cx-bw*0.32,cy+bh*0.02,cx+bw*0.32,cy+bh/2-8], fill=color)

def icon_doc(draw, cx, cy, r, color):
    dw, dh = r*1.15, r*1.5
    draw.rounded_rectangle([cx-dw/2,cy-dh/2,cx+dw/2,cy+dh/2], radius=4, outline=color, width=4)
    y = cy - dh/2 + r*0.35
    while y < cy + dh/2 - r*0.2:
        draw.line([(cx-dw/2+r*0.22,y),(cx+dw/2-r*0.22,y)], fill=color, width=3)
        y += r*0.3

def icon_wifi(draw, cx, cy, r, color):
    base_y = cy + r*0.3
    for rr in (r*0.35, r*0.6, r*0.85):
        draw.arc([cx-rr,base_y-rr,cx+rr,base_y+rr], 200, 340, fill=color, width=4)
    draw.ellipse([cx-4,base_y-4,cx+4,base_y+4], fill=color)

def icon_money(draw, cx, cy, r, color, font):
    draw.ellipse([cx-r*0.55,cy-r*0.55,cx+r*0.55,cy+r*0.55], outline=color, width=4)
    if font:
        f = ImageFont.truetype(font, int(r*0.75))
        bbox = draw.textbbox((0,0), "€", font=f)
        tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
        draw.text((cx-tw/2-bbox[0], cy-th/2-bbox[1]), "€", font=f, fill=color)
    else:
        draw.line([(cx-r*0.2,cy-r*0.25),(cx-r*0.2,cy+r*0.25)], fill=color, width=4)
        draw.line([(cx+r*0.2,cy-r*0.25),(cx+r*0.2,cy+r*0.25)], fill=color, width=4)

def icon_play(draw, cx, cy, r, color):
    s = r * 0.75
    draw.polygon([(cx-s*0.5, cy-s*0.85), (cx-s*0.5, cy+s*0.85), (cx+s*0.9, cy)], fill=color)

ICON_FN = {"bolt": icon_bolt, "sun": icon_sun, "battery": icon_battery, "doc": icon_doc, "wifi": icon_wifi, "play": icon_play}

def draw_icon(draw, kind, cx, cy, r, color):
    if kind == "money":
        icon_money(draw, cx, cy, r, color, FONT_BOLD)
    else:
        ICON_FN[kind](draw, cx, cy, r, color)

def seed_from_slug(slug):
    return int(hashlib.md5(slug.encode()).hexdigest()[:8], 16)

def hue_shift(img_rgb, degrees):
    hsv = img_rgb.convert("RGB").convert("HSV")
    h, s, v = hsv.split()
    offset = int(degrees / 360 * 255)
    h = h.point(lambda x: (x + offset) % 256)
    return Image.merge("HSV", (h, s, v)).convert("RGB")

def md5_of(path):
    return hashlib.md5(open(path, "rb").read()).hexdigest()

def make_article_image(slug, cat_slug, titlu, out_path):
    base_path = f"{IMG_CAT_DIR}/{cat_slug}.jpg"
    base = Image.open(base_path).convert("RGB")
    seed = seed_from_slug(slug)
    degrees = (seed % 25) - 12  # variație subtilă de nuanță, -12..+12 grade
    img = hue_shift(base, degrees).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    accent = CAT_ACCENT[cat_slug]
    kind = pick_icon(titlu, cat_slug)
    W, H = img.size
    cx, cy, r = W - 90, H - 90, 62
    draw.ellipse([cx-r,cy-r,cx+r,cy+r], fill=(12,15,24,220), outline=accent+(230,), width=3)
    draw_icon(draw, kind, cx, cy, r*0.62, (255,255,255,240))

    img.convert("RGB").save(out_path, quality=90)
    return kind, degrees

def main():
    os.makedirs(IMG_ART_DIR, exist_ok=True)
    manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else {}

    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb["Calendar editorial"]
    seen_slugs = {}
    items = []
    for r in range(2, ws.max_row + 1):
        cat = ws.cell(row=r, column=3).value
        titlu = ws.cell(row=r, column=5).value
        if not titlu or not cat:
            continue
        base_slug = slugify(titlu)
        slug = base_slug
        n = 2
        while slug in seen_slugs:
            slug = f"{base_slug}-{n}"
            n += 1
        seen_slugs[slug] = True
        items.append((slug, CAT_SLUG[cat], titlu))

    generated, skipped_manual, skipped_other_source = 0, 0, 0
    for slug, cat_slug, titlu in items:
        out_path = f"{IMG_ART_DIR}/{slug}.jpg"
        force = FORCE_ALL or slug in FORCE_SLUGS
        if os.path.exists(out_path) and not force:
            # regula simpla, fara excepții: dacă fișierul există deja, nu se atinge automat,
            # indiferent de sursă — generat, real din articol, Pexels sau YouTube
            skipped_other_source += 1
            continue
        kind, degrees = make_article_image(slug, cat_slug, titlu, out_path)
        manifest[slug] = {"source": "generated", "md5": md5_of(out_path), "icon": kind, "hue": degrees,
                           "generated_at": datetime.datetime.now().isoformat(timespec="seconds")}
        generated += 1

    json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"Poze articol generate/actualizate: {generated}. Sărite (înlocuite manual): {skipped_manual}. "
          f"Sărite (au deja sursă reală — articol/Pexels/YouTube): {skipped_other_source}. Total articole: {len(items)}.")

if __name__ == "__main__":
    main()
