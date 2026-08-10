import re, os, glob, json, openpyxl
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = f"{ROOT}/site-local"
XLSX = f"{ROOT}/electric-news-calendar-editorial.xlsx"
IMG_MANIFEST_PATH = f"{BASE}/assets/images/articole/.image-manifest.json"

wb = openpyxl.load_workbook(XLSX, data_only=True)
ws = wb["Calendar editorial"]
valid_external = set()
for r in range(2, ws.max_row+1):
    url = ws.cell(row=r, column=7).value
    if url and str(url).startswith("http"):
        valid_external.add(str(url).strip())

# domenii de incredere pentru linkuri de credit foto sau infrastructură (analytics), generate de scripturile noastre / cod, nu inventate manual
TRUSTED_DOMAINS = {"pexels.com", "www.pexels.com", "gc.zgo.at"}
if os.path.exists(IMG_MANIFEST_PATH):
    manifest = json.load(open(IMG_MANIFEST_PATH, encoding="utf-8"))
    for entry in manifest.values():
        for key in ("photographer_url", "pexels_url"):
            if entry.get(key):
                valid_external.add(entry[key])

def is_trusted(link):
    if link in valid_external:
        return True
    host = urlparse(link).netloc.lower()
    return host in TRUSTED_DOMAINS

files = glob.glob(BASE + "/**/index.html", recursive=True) + glob.glob(BASE + "/*.html")
files = sorted(set(files))
print(f"Verific {len(files)} pagini...")

href_re = re.compile(r'(?:href|src)="([^"]+)"')

broken = []              # target file chiar nu există pe disc
local_incompatible = []  # link intern care se termină în "/" -> nu se deschide direct din file:// (dublu-click)
unknown_external = []    # URL extern care nu apare exact în Excel (posibil inventat)
checked_internal = 0
checked_external = 0

for path in files:
    page_dir = os.path.dirname(path)
    html = open(path, encoding="utf-8").read()
    for m in href_re.finditer(html):
        link = m.group(1)
        if link.startswith("#") or link.startswith("mailto:") or link.startswith("tel:"):
            continue
        if link.startswith("http://") or link.startswith("https://"):
            checked_external += 1
            if not is_trusted(link):
                unknown_external.append((path, link))
            continue
        checked_internal += 1
        if link.endswith("/"):
            local_incompatible.append((path, link))
        target = os.path.normpath(os.path.join(page_dir, link))
        if not os.path.exists(target):
            broken.append((path, link, target))

print(f"Linkuri interne verificate: {checked_internal}")
print(f"Linkuri externe verificate: {checked_external}")
print(f"Linkuri interne moarte (fișier inexistent): {len(broken)}")
for b in broken:
    print("  BROKEN:", b)
print(f"Linkuri incompatibile cu deschidere locală (dublu-click), se termină în '/': {len(local_incompatible)}")
for l in local_incompatible:
    print("  LOCAL-INCOMPATIBLE:", l)
print(f"Linkuri externe NEVERIFICATE (nu apar exact în Excel): {len(unknown_external)}")
for u in unknown_external:
    print("  UNKNOWN:", u)

if not broken and not unknown_external and not local_incompatible:
    print("\nOK — niciun link mort, niciun link incompatibil cu file://, niciun link extern inventat.")
else:
    print("\nATENȚIE — site-ul NU e curat, vezi problemele de mai sus.")
