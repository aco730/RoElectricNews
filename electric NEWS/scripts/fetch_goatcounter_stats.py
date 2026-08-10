"""Extrage vizualizări reale per articol din GoatCounter și le salvează în goatcounter_stats.json.

Cerințe (fișiere locale, niciodată în cod):
  - goatcounter_site_code.txt  -> codul site-ului (ex. "electricnews" pentru electricnews.goatcounter.com)
  - goatcounter_api_token.txt  -> API token generat din GoatCounter (Settings -> API)

Rulare: py scripts\\fetch_goatcounter_stats.py
Fără cele două fișiere, scriptul nu face nimic (site-ul încă nu are trafic real de urmărit).
build_site.py citește goatcounter_stats.json dacă există; dacă lipsește sau e gol,
widget-urile de „vizualizări"/„cele mai citite" rămân ascunse — niciodată numere inventate.
"""
import json
import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODE_PATH = f"{ROOT}/goatcounter_site_code.txt"
TOKEN_PATH = f"{ROOT}/goatcounter_api_token.txt"
STATS_PATH = f"{ROOT}/goatcounter_stats.json"

if not (os.path.exists(CODE_PATH) and os.path.exists(TOKEN_PATH)):
    print("Lipsesc goatcounter_site_code.txt / goatcounter_api_token.txt — nimic de făcut încă.")
    print("Creează un cont gratuit pe goatcounter.com, apoi salvează codul site-ului și un API token în cele două fișiere.")
    raise SystemExit(0)

site_code = open(CODE_PATH, encoding="utf-8").read().strip()
token = open(TOKEN_PATH, encoding="utf-8").read().strip()

url = f"https://{site_code}.goatcounter.com/api/v0/stats/hits?limit=100"
req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})

try:
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.load(resp)
except Exception as e:
    print(f"EROARE la interogarea GoatCounter: {e}")
    raise SystemExit(1)

stats = {}
pattern = re.compile(r"^/articol/([^/]+)/?$")
for hit in data.get("hits", []):
    m = pattern.match(hit.get("path", ""))
    if m:
        stats[m.group(1)] = hit.get("count", 0)

with open(STATS_PATH, "w", encoding="utf-8") as f:
    json.dump(stats, f, ensure_ascii=False, indent=2)

print(f"Salvat {len(stats)} articole cu vizualizări în {STATS_PATH}")
