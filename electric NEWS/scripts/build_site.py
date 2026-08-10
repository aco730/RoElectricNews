import openpyxl, datetime, os, shutil, html, json, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = f"{ROOT}/electric-news-calendar-editorial.xlsx"
BASE = f"{ROOT}/site-local"
ARTICLE_TEXT_DIR = f"{ROOT}/articole-text"
IMG_CAT_DIR = f"{BASE}/assets/images/categorii"
IMG_ART_DIR = f"{BASE}/assets/images/articole"
IMG_MANIFEST_PATH = f"{IMG_ART_DIR}/.image-manifest.json"

os.makedirs(IMG_ART_DIR, exist_ok=True)

IMG_MANIFEST = json.load(open(IMG_MANIFEST_PATH, encoding="utf-8")) if os.path.exists(IMG_MANIFEST_PATH) else {}

# ---------- statistici reale de vizualizări (GoatCounter) ----------
# populate scripts\fetch_goatcounter_stats.py -> goatcounter_stats.json (slug -> nr. vizualizări)
# fișier absent sau gol = site încă fără trafic real, widget-urile de mai jos rămân ascunse (niciodată numere inventate)
GOATCOUNTER_CODE_PATH = f"{ROOT}/goatcounter_site_code.txt"
GOATCOUNTER_CODE = open(GOATCOUNTER_CODE_PATH, encoding="utf-8").read().strip() if os.path.exists(GOATCOUNTER_CODE_PATH) else None
STATS_PATH = f"{ROOT}/goatcounter_stats.json"
VIEW_STATS = json.load(open(STATS_PATH, encoding="utf-8")) if os.path.exists(STATS_PATH) else {}

def views_line(slug):
    v = VIEW_STATS.get(slug)
    if not v:
        return ""
    return f'<span class="views-line">{v} vizualizări</span>'

def is_illustrative(slug):
    entry = IMG_MANIFEST.get(slug)
    return bool(entry) and entry.get("source") == "generated"

def stock_credit(slug):
    entry = IMG_MANIFEST.get(slug)
    if entry and entry.get("source") == "stock-pexels":
        return entry
    return None
os.makedirs(f"{BASE}/categorie", exist_ok=True)
os.makedirs(f"{BASE}/articol", exist_ok=True)
os.makedirs(f"{BASE}/pagina", exist_ok=True)

# categoriile trăiesc în categorii.json (sursă de adevăr editabilă din admin/gestionare/) — nu mai hardcodate aici
CATEGORII_JSON_PATH = f"{ROOT}/categorii.json"
CATEGORII = json.load(open(CATEGORII_JSON_PATH, encoding="utf-8"))
CAT_COLORS = {c["nume"]: c["culoare"] for c in CATEGORII}
CAT_SLUG = {c["nume"]: c["slug"] for c in CATEGORII}
CAT_DESC = {c["nume"]: c["descriere"] for c in CATEGORII}

# categorii excluse din selecția homepage (hero/recente/sidebar) — pagini de tip "despre", nu știri
HOMEPAGE_EXCLUDED_CATEGORIES = {c["nume"] for c in CATEGORII if c.get("exclusaHomepage")}
RO_MONTHS = ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"]
def fmt_date(d):
    return f"{d.day} {RO_MONTHS[d.month-1]} {d.year}"

NA_TEXT = "Conținut propriu — fără sursă externă unică"
TBD_TEXT = "De documentat la redactare — nicio sursă verificată încă"

def slugify(s):
    repl = {"ă":"a","â":"a","î":"i","ș":"s","ş":"s","ț":"t","ţ":"t","Ă":"a","Â":"a","Î":"i","Ș":"s","Ț":"t"}
    out = "".join(repl.get(ch, ch) for ch in s)
    out = out.lower()
    keep = []
    for ch in out:
        if ch.isalnum():
            keep.append(ch)
        elif ch in " -_/":
            keep.append(" ")
    out = "".join(keep)
    out = "-".join(out.split())
    return out[:80].strip("-")

# ---------- load live data from xlsx ----------
wb = openpyxl.load_workbook(XLSX, data_only=True)
ws = wb["Calendar editorial"]
items = []
seen_slugs = {}
for r in range(2, ws.max_row + 1):
    week = ws.cell(row=r, column=1).value
    date_v = ws.cell(row=r, column=2).value
    cat = ws.cell(row=r, column=3).value
    tip = ws.cell(row=r, column=4).value
    titlu = ws.cell(row=r, column=5).value
    sursa = ws.cell(row=r, column=6).value
    url = ws.cell(row=r, column=7).value
    status = ws.cell(row=r, column=8).value
    sponsorizat = ws.cell(row=r, column=9).value
    etichete_raw = ws.cell(row=r, column=10).value
    if not titlu or not cat:
        continue
    if isinstance(date_v, datetime.datetime):
        date_v = date_v.date()
    base_slug = slugify(titlu)
    slug = base_slug
    n = 2
    while slug in seen_slugs:
        slug = f"{base_slug}-{n}"
        n += 1
    seen_slugs[slug] = True
    etichete = [t.strip() for t in str(etichete_raw or "").split(",") if t.strip()]
    items.append(dict(row=r, week=week, date=date_v, cat=cat, tip=tip, titlu=titlu,
                       sursa=sursa or "—", url=(url or "").strip(), slug=slug,
                       status=(status or "").strip(),
                       sponsorizat=str(sponsorizat or "").strip().lower() == "da",
                       etichete=etichete))

items.sort(key=lambda it: (it["date"] or datetime.date.min, it["row"]), reverse=True)
all_slugs = {it["slug"] for it in items}
items = [it for it in items if it["status"] == "Publicat"]
print(f"Încărcate {len(all_slugs)} rânduri din Excel, {len(items)} publicate (restul rămân în așteptare, nu apar pe site).")

# ---------- index de căutare (embedded inline în fiecare pagină — evită fetch()/CORS pe file://) ----------
SEARCH_INDEX_JSON = json.dumps(
    [{"t": it["titlu"], "c": it["cat"], "p": f"articol/{it['slug']}/index.html"} for it in items],
    ensure_ascii=False)

# ---------- curăță paginile articolelor care nu mai sunt publicate ----------
published_slugs = {it["slug"] for it in items}
articol_dir = f"{BASE}/articol"
if os.path.isdir(articol_dir):
    for name in os.listdir(articol_dir):
        if name not in published_slugs:
            shutil.rmtree(f"{articol_dir}/{name}", ignore_errors=True)

# ---------- real article content (articole-text/<slug>.txt), dacă există ----------
# Convenție: primul rând = titlu (ignorat, avem deja titlul din Excel), rând gol, apoi corpul
# articolului cu paragrafe separate prin rând gol. Orice skill de generare conținut (link,
# agregator, YouTube) trebuie doar să scrie acest fișier — build_site.py nu diferențiază sursa.
_content_cache = {}
def load_article_content(it):
    if it["slug"] in _content_cache:
        return _content_cache[it["slug"]]
    path = f"{ARTICLE_TEXT_DIR}/{it['slug']}.txt"
    result = None
    if os.path.exists(path):
        raw = open(path, encoding="utf-8").read()
        lines = raw.split("\n")
        body = "\n".join(lines[1:]).strip()
        paragraphs = [p.strip() for p in body.split("\n\n") if p.strip()]
        if paragraphs:
            result = paragraphs
    _content_cache[it["slug"]] = result
    return result

def excerpt_text(paragraphs, maxlen=150):
    if not paragraphs:
        return ""
    text = paragraphs[0]
    if len(text) <= maxlen:
        return text
    return text[:maxlen].rsplit(" ", 1)[0] + "…"

# ---------- per-article images: copy from category placeholder ----------
for it in items:
    cat_img = f"{IMG_CAT_DIR}/{CAT_SLUG[it['cat']]}.jpg"
    art_img = f"{IMG_ART_DIR}/{it['slug']}.jpg"
    if not os.path.exists(art_img):
        shutil.copyfile(cat_img, art_img)

# ---------- shared page shell ----------
def logo_svg():
    return '<svg width="30" height="30" viewBox="0 0 60 60"><polygon points="30,4 52,17 52,43 30,56 8,43 8,17" fill="none" stroke="#12213A" stroke-width="3"/><circle cx="30" cy="30" r="7" fill="#0EA5A0"/><line x1="30" y1="4" x2="30" y2="23" stroke="#12213A" stroke-width="2.5"/><line x1="30" y1="37" x2="30" y2="56" stroke="#12213A" stroke-width="2.5"/></svg>'

def home_href(root):
    return f"{root}index.html"

def cat_href(root, cat):
    return f"{root}categorie/{CAT_SLUG[cat]}/index.html"

def wip_href(root):
    return f"{root}pagina/in-lucru/index.html"

def newsletter_href(root):
    return f"{root}pagina/newsletter/index.html"

def contact_href(root):
    return f"{root}pagina/contact/index.html"

def trimite_stire_href(root):
    return f"{root}pagina/trimite-o-stire/index.html"

PAGE_HREF = {
    "sursele-noastre": lambda root: f"{root}pagina/sursele-noastre/index.html",
    "trimite-o-stire": trimite_stire_href,
    "cere-oferta": lambda root: f"{root}pagina/cere-oferta/index.html",
    "contact": contact_href,
    "newsletter": newsletter_href,
}

# ---------- foaia Q&A (rubrica de întrebări frecvente, pe categorie) ----------
items_by_slug = {it["slug"]: it for it in items}
qa_by_cat = {}
if "Q&A" in wb.sheetnames:
    qa_ws = wb["Q&A"]
    for r in range(2, qa_ws.max_row + 1):
        qcat = qa_ws.cell(row=r, column=1).value
        intrebare = qa_ws.cell(row=r, column=2).value
        raspuns = qa_ws.cell(row=r, column=3).value
        articole_raw = qa_ws.cell(row=r, column=4).value
        if not qcat or not intrebare or not raspuns:
            continue
        links = []
        for token in [t.strip() for t in str(articole_raw or "").split(",") if t.strip()]:
            if token.startswith("pagina:"):
                page_slug = token.split(":", 1)[1]
                if page_slug in PAGE_HREF:
                    links.append(("pagina", page_slug))
            elif token in items_by_slug:
                links.append(("articol", token))
        qa_by_cat.setdefault(qcat, []).append(dict(intrebare=intrebare, raspuns=raspuns, links=links))

PAGE_LABEL = {
    "sursele-noastre": "Sursele noastre",
    "trimite-o-stire": "Trimite o știre",
    "cere-oferta": "Cere ofertă gratuită",
    "contact": "Contact",
    "newsletter": "Newsletter",
}

def qa_section_html(cat, root):
    qa_items = qa_by_cat.get(cat)
    if not qa_items:
        return ""
    rows = []
    for qa in qa_items:
        link_chips = []
        for kind, ref in qa["links"]:
            if kind == "articol":
                it = items_by_slug[ref]
                link_chips.append(f'<a class="qa-link" href="{art_href(root, it)}">{it["titlu"]}</a>')
            else:
                link_chips.append(f'<a class="qa-link" href="{PAGE_HREF[ref](root)}">{PAGE_LABEL[ref]}</a>')
        links_html = f'<div class="qa-links">{"".join(link_chips)}</div>' if link_chips else ""
        rows.append(f'''
    <details class="qa-item">
      <summary>{html.escape(qa["intrebare"])}</summary>
      <div class="qa-answer"><p>{html.escape(qa["raspuns"])}</p>{links_html}</div>
    </details>''')
    return f'''
<section class="qa-section">
  <h2 class="section-title">Întrebări frecvente</h2>
  <div class="qa-list">{"".join(rows)}</div>
</section>'''

# ---------- foaia Q&A Articole (5 întrebări specifice, în stânga paginii de articol) ----------
article_qa_by_slug = {}
admin_intrebari = []
if "Q&A Articole" in wb.sheetnames:
    aqa_ws = wb["Q&A Articole"]
    for r in range(2, aqa_ws.max_row + 1):
        a_slug = aqa_ws.cell(row=r, column=1).value
        intrebare = aqa_ws.cell(row=r, column=2).value
        raspuns = aqa_ws.cell(row=r, column=3).value
        if not a_slug or not intrebare or not raspuns:
            continue
        article_qa_by_slug.setdefault(a_slug.strip(), []).append((intrebare, raspuns))
        admin_intrebari.append({"row": r, "slug": a_slug.strip(), "intrebare": intrebare, "raspuns": raspuns})

def article_qa_html(slug):
    qa_list = article_qa_by_slug.get(slug)
    if not qa_list:
        return ""
    rows = "".join(f'''
    <details class="qa-item qa-item-compact">
      <summary>{html.escape(q)}</summary>
      <div class="qa-answer"><p>{html.escape(a)}</p></div>
    </details>''' for q, a in qa_list)
    return f'''
<aside class="qa-side">
  <h2 class="section-title">Întrebări despre acest articol</h2>
  <div class="qa-list">{rows}</div>
</aside>'''

def nav_html(root, active=None):
    links = []
    for c in CAT_COLORS:
        cls = "nav-link active" if c == active else "nav-link"
        links.append(f'<a href="{cat_href(root, c)}" class="{cls}" style="--accent:{CAT_COLORS[c]}">{c}</a>')
    return "".join(links)

def header_html(root, active=None):
    return f'''
  <div class="topbar">
    <span>Ediție de previzualizare locală</span>
    <div><a href="{newsletter_href(root)}">Newsletter</a><a href="{contact_href(root)}">Contact</a><a href="{trimite_stire_href(root)}">Trimite o știre</a></div>
  </div>
  <header class="main">
    <a href="{home_href(root)}" class="logo">{logo_svg()}<span>ELECTRIC<span class="news">NEWS</span></span></a>
    <div class="search-box">
      <input type="text" id="site-search" placeholder="Caută articole..." autocomplete="off">
      <div id="site-search-results"></div>
    </div>
    <a class="cta-btn" href="{newsletter_href(root)}">Abonează-te la newsletter</a>
  </header>
  <nav class="cats">{nav_html(root, active)}</nav>'''

def footer_html(root):
    cats = "".join(f'<a href="{cat_href(root, c)}">{c}</a>' for c in CAT_COLORS)
    return f'''
  <footer>
    <div class="foot-wrap">
      <div>
        <div class="foot-brand">ELECTRIC<span class="news">NEWS</span></div>
        <div style="font-size:13px; max-width:280px; color:#9aa5b1;">Sursa românească de referință pentru electric, smart home, fotovoltaic și stocare de energie.</div>
        <div style="margin-top:10px;"><a href="{root}pagina/sursele-noastre/index.html" style="font-size:12.5px;color:#9aa5b1;text-decoration:underline;">Sursele noastre / metodologie</a> · <a href="{root}pagina/etichete/index.html" style="font-size:12.5px;color:#9aa5b1;text-decoration:underline;">Toate etichetele</a></div>
      </div>
      <div class="foot-cats">{cats}</div>
    </div>
    <div class="copy">© 2026 Electric NEWS — previzualizare locală, nepublicată</div>
  </footer>'''

def page_shell(root, title, active, body_main, layout="grid"):
    cls = {"grid": "", "single-col": "single-col", "cat-page": "cat-page", "article-qa": "article-qa"}[layout]
    return f'''<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<link rel="stylesheet" href="{root}assets/style.css">
<script>window.SITE_ROOT = "{root}"; window.ELECTRIC_NEWS_SEARCH = {SEARCH_INDEX_JSON};</script>
</head>
<body>
{header_html(root, active)}
<main class="{cls}">
{body_main}
</main>
{footer_html(root)}
<script src="{root}assets/search.js" defer></script>
<script src="{root}assets/counters.js" defer></script>
{f'<script data-goatcounter="https://{GOATCOUNTER_CODE}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>' if GOATCOUNTER_CODE else ""}
</body>
</html>'''

def badge(cat):
    return f'<span class="badge" style="background:{CAT_COLORS[cat]}">{cat}</span>'

def sponsor_badge(it):
    return '<span class="badge-sponsor">Conținut sponsorizat</span>' if it["sponsorizat"] else ""

def colaborator_embed_html(it, root):
    if it["cat"] != "Colaboratori":
        return ""
    return f'''
    <div class="colaborator-block">
      <h2 class="section-title">Date de contact</h2>
      <ul class="side-list" style="margin-bottom:26px;">
        <li class="side-item"><div><span class="side-title">Adresă</span><div class="side-meta">Bulevardul Timișoara 73, 061323 București</div></div></li>
        <li class="side-item"><div><span class="side-title">Telefon</span><div class="side-meta"><a href="tel:0750405908">0750 405 908</a></div></div></li>
        <li class="side-item"><div><span class="side-title">Email</span><div class="side-meta"><a href="mailto:solarelectricpanel@gmail.com">solarelectricpanel@gmail.com</a></div></div></li>
      </ul>
      <h2 class="section-title">Cere o ofertă gratuită</h2>
      <form name="cere-oferta" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" action="{root}pagina/multumim/index.html">
        <input type="hidden" name="form-name" value="cere-oferta" />
        <p class="honeypot"><label>Nu completa acest câmp: <input name="bot-field" /></label></p>
        <div class="form-field">
          <label for="nume">Nume</label>
          <input type="text" id="nume" name="nume" required>
        </div>
        <div class="form-field">
          <label for="telefon">Telefon</label>
          <input type="text" id="telefon" name="telefon" required>
        </div>
        <div class="form-field">
          <label for="email">Email <span class="hint">Opțional</span></label>
          <input type="email" id="email" name="email">
        </div>
        <div class="form-field">
          <label for="tip_proiect">Tip proiect</label>
          <select id="tip_proiect" name="tip_proiect">
            <option>Sistem fotovoltaic</option>
            <option>Baterie de stocare</option>
            <option>Instalație electrică / tablou</option>
            <option>Altceva</option>
          </select>
        </div>
        <div class="form-field">
          <label for="zona">Localitate / județ</label>
          <input type="text" id="zona" name="zona" required>
        </div>
        <div class="form-field">
          <label for="descriere">Descriere scurtă a proiectului <span class="hint">Opțional</span></label>
          <textarea id="descriere" name="descriere" placeholder="Ce ai nevoie, ce ai deja instalat, orice detaliu util..."></textarea>
        </div>
        <button type="submit" class="form-submit">Trimite cererea</button>
      </form>
    </div>'''

def tag_href(root, tag):
    return f"{root}eticheta/{slugify(tag)}/index.html"

def tags_html(it, root):
    if not it["etichete"]:
        return ""
    chips = "".join(f'<a href="{tag_href(root, t)}" class="tag-chip">{t}</a>' for t in it["etichete"])
    return f'<div class="tag-row">{chips}</div>'

def surse_line(it, root):
    if it["tip"] == "Agregat":
        if it["url"].startswith("http"):
            return f'<span class="surse">Surse: <a href="{it["url"]}" target="_blank" rel="noopener">{it["sursa"]}</a></span>'
        return '<span class="surse surse-tbd">De documentat la redactare</span>'
    return '<span class="surse surse-own">Conținut Electric NEWS</span>'

def art_href(root, it):
    return f'{root}articol/{it["slug"]}/index.html'

def img_src(root, it):
    return f'{root}assets/images/articole/{it["slug"]}.jpg'

def media_tag(it, root, css_class, style=""):
    style_attr = f' style="{style}"' if style else ""
    img = f'<img class="{css_class}"{style_attr} src="{img_src(root, it)}" alt="{it["cat"]}">'
    if is_illustrative(it["slug"]):
        return f'<span class="media-wrap">{img}<span class="media-badge">Ilustrație</span></span>'
    return img

def media_caption(it):
    if is_illustrative(it["slug"]):
        return '<span class="media-caption">Imagine ilustrativă, generată automat — nu este o fotografie a subiectului.</span>'
    credit = stock_credit(it["slug"])
    if credit:
        return (f'<span class="media-caption">Foto: '
                f'<a href="{credit["photographer_url"]}" target="_blank" rel="noopener">{credit["photographer"]}</a>'
                f' / <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a></span>')
    return ""

# ---------- HOMEPAGE ----------
homepage_items = [it for it in items if it["cat"] not in HOMEPAGE_EXCLUDED_CATEGORIES]
hero = homepage_items[0]
secondary = homepage_items[1:7]
sidebar = homepage_items[7:16]

def hero_block(it, root):
    href = art_href(root, it)
    content = load_article_content(it)
    excerpt_html = f'<p class="excerpt">{html.escape(excerpt_text(content))}</p>' if content else ""
    return f'''
    <article class="hero-card">
      <a href="{href}">{media_tag(it, root, "hero-media")}</a>
      <div class="hero-body">
        {media_caption(it)}
        {badge(it["cat"])}{sponsor_badge(it)}
        <h1><a href="{href}">{it["titlu"]}</a></h1>
        {excerpt_html}
        <div class="meta"><span class="date">{fmt_date(it["date"])}</span>{surse_line(it, root)}</div>
      </div>
    </article>'''

def card_block(it, root):
    href = art_href(root, it)
    content = load_article_content(it)
    excerpt_html = f'<p class="excerpt" style="font-size:13px;margin:0 0 10px;">{html.escape(excerpt_text(content, 110))}</p>' if content else ""
    return f'''
    <article class="story-card">
      <a href="{href}">{media_tag(it, root, "story-media")}</a>
      {media_caption(it)}
      {badge(it["cat"])}{sponsor_badge(it)}
      <h3><a href="{href}">{it["titlu"]}</a></h3>
      {excerpt_html}
      <div class="meta"><span class="date">{fmt_date(it["date"])}</span>{surse_line(it, root)}</div>
    </article>'''

def side_item_block(it, root):
    href = art_href(root, it)
    return f'''
    <li class="side-item">
      <span class="dot" style="background:{CAT_COLORS[it["cat"]]}"></span>
      <div><a class="side-title" href="{href}">{it["titlu"]}</a><div class="side-meta">{it["cat"]} · {fmt_date(it["date"])}</div></div>
    </li>'''

stat_card_html = f'''
    <div class="stat-card">
      <div class="stat-icon">📰</div>
      <div>
        <div class="stat-number" data-count-to="{len(items)}">0</div>
        <div class="stat-label">articole publicate pe Electric NEWS</div>
      </div>
    </div>'''

top_read_items = sorted(
    (it for it in homepage_items if VIEW_STATS.get(it["slug"], 0) > 0),
    key=lambda it: VIEW_STATS[it["slug"]], reverse=True
)[:5]

def top_read_item_block(rank, it, root):
    href = art_href(root, it)
    return f'''
    <li class="side-item">
      <span class="rank-badge">{rank}</span>
      <div><a class="side-title" href="{href}">{it["titlu"]}</a><div class="side-meta">{VIEW_STATS[it["slug"]]} vizualizări</div></div>
    </li>'''

top_read_html = ""
if top_read_items:
    top_read_html = f'''
  <h2 class="section-title" style="margin-top:24px;">Cele mai citite</h2>
  <ul class="side-list">{"".join(top_read_item_block(i+1, it, "") for i, it in enumerate(top_read_items))}</ul>'''

home_body = f'''
<section>
  {stat_card_html}
  {hero_block(hero, "")}
  <h2 class="section-title">Cele mai recente</h2>
  <div class="story-grid">{"".join(card_block(it, "") for it in secondary)}</div>
</section>
<aside>
  {top_read_html}
  <h2 class="section-title" style="margin-top:{24 if top_read_html else 0}px;">Ultimele actualizări</h2>
  <ul class="side-list">{"".join(side_item_block(it, "") for it in sidebar)}</ul>
</aside>'''

with open(f"{BASE}/index.html", "w", encoding="utf-8") as f:
    f.write(page_shell("", "Electric NEWS — Electric, Smart Home, Fotovoltaic, Baterii & Stocare", None, home_body))

# ---------- CATEGORY PAGES (toate articolele) ----------
for cat, slug in CAT_SLUG.items():
    root = "../../"
    cat_items = [it for it in items if it["cat"] == cat]
    cards_html = "".join(card_block(it, root) for it in cat_items)
    cat_img = f"{root}assets/images/categorii/{slug}.jpg"
    body = f'''
<div class="breadcrumb"><a href="{home_href(root)}">Acasă</a> / {cat}</div>
<div class="cat-banner">
  <img src="{cat_img}" alt="{cat}">
  <div class="cat-banner-overlay">
    <h1>{cat}</h1>
    <p>{CAT_DESC[cat]}</p>
    <span class="count">{len(cat_items)} articole</span>
  </div>
</div>
<h2 class="section-title">Toate articolele</h2>
<div class="story-grid">{cards_html}</div>
{qa_section_html(cat, root)}'''
    os.makedirs(f"{BASE}/categorie/{slug}", exist_ok=True)
    with open(f"{BASE}/categorie/{slug}/index.html", "w", encoding="utf-8") as f:
        f.write(page_shell(root, f"{cat} — Electric NEWS", cat, body, layout="cat-page"))

# ---------- TAG PAGES (etichete transversale peste categorii, ex. DIY, Opinie, Prețuri, Tehnologie nouă) ----------
tag_dir = f"{BASE}/eticheta"
if os.path.isdir(tag_dir):
    shutil.rmtree(tag_dir, ignore_errors=True)
all_tags = {}
for it in items:
    for t in it["etichete"]:
        all_tags.setdefault(t, []).append(it)

for tag, tag_items in all_tags.items():
    root = "../../"
    tslug = slugify(tag)
    cards_html = "".join(card_block(it, root) for it in tag_items)
    body = f'''
<div class="breadcrumb"><a href="{home_href(root)}">Acasă</a> / Etichetă / {tag}</div>
<h1 style="margin:0 0 6px;">{tag}</h1>
<p style="color:var(--muted);margin:0 0 24px;">{len(tag_items)} articole etichetate „{tag}", din mai multe categorii.</p>
<div class="story-grid">{cards_html}</div>'''
    os.makedirs(f"{tag_dir}/{tslug}", exist_ok=True)
    with open(f"{tag_dir}/{tslug}/index.html", "w", encoding="utf-8") as f:
        f.write(page_shell(root, f"#{tag} — Electric NEWS", None, body, layout="cat-page"))

# ---------- pagina index "Toate etichetele" ----------
root = "../../"
tag_list_html = "".join(
    f'<li class="side-item"><div><a class="side-title" href="{tag_href(root, t)}">{t}</a>'
    f'<div class="side-meta">{len(its)} articole</div></div></li>'
    for t, its in sorted(all_tags.items(), key=lambda x: (-len(x[1]), x[0]))
)
etichete_body = f'''
<div class="article-body" style="max-width:640px;margin:0 auto;">
  <h1>Toate etichetele</h1>
  <p>Etichetele grupează articole din categorii diferite după temă transversală (ex. ghiduri DIY, opinii, prețuri de referință), independent de cele 6 categorii principale.</p>
  <ul class="side-list">{tag_list_html if tag_list_html else '<li class="side-item">Nicio etichetă folosită încă.</li>'}</ul>
</div>'''
os.makedirs(f"{BASE}/pagina/etichete", exist_ok=True)
with open(f"{BASE}/pagina/etichete/index.html", "w", encoding="utf-8") as f:
    f.write(page_shell(root, "Toate etichetele — Electric NEWS", None, etichete_body, layout="single-col"))

# ---------- ARTICLE PAGES (toate cele 53) ----------
ARTICLE_INTRO = {
    "Agregat": "Acesta este un subiect de tip agregat: redacția va documenta și rescrie informația pe baza sursei externe verificate de mai jos, cu ton propriu și verificare factuală înainte de publicare.",
    "Propriu": "Acesta este un ghid original Electric NEWS, aflat în pregătire la redacție. Conținutul final va fi redactat pe baza expertizei tehnice proprii, fără a se baza pe o singură sursă externă.",
}

for it in items:
    root = "../../"
    same_cat = [x for x in items if x["cat"] == it["cat"] and x["slug"] != it["slug"]][:4]
    related_html = "".join(
        f'<li class="side-item"><span class="dot" style="background:{CAT_COLORS[r["cat"]]}"></span>'
        f'<div><a class="side-title" href="{art_href(root, r)}">{r["titlu"]}</a>'
        f'<div class="side-meta">{fmt_date(r["date"])}</div></div></li>' for r in same_cat
    )
    if it["tip"] == "Agregat" and it["url"].startswith("http"):
        source_box = f'<div class="source-note">Acest subiect are la bază o sursă externă verificată. Sursă: <a href="{it["url"]}" target="_blank" rel="noopener">{it["sursa"]}</a> — {it["url"]}</div>'
    elif it["tip"] == "Agregat":
        source_box = f'<div class="source-note surse-tbd-box">Sursă externă încă nedocumentată — <em>{it["url"]}</em>. Nu se publică fără o sursă verificată și citată aici.</div>'
    else:
        source_box = '<div class="source-note surse-own-box">Conținut original Electric NEWS — nu se bazează pe o sursă externă unică.</div>'

    content = load_article_content(it)
    if content:
        article_html = "".join(f"<p>{html.escape(p)}</p>" for p in content)
    else:
        article_html = f'<div class="draft-banner">Pagină de previzualizare — articolul complet va fi redactat de redacție înainte de publicare.</div>\n    <p>{ARTICLE_INTRO[it["tip"]]}</p>'

    article_qa_side = article_qa_html(it["slug"])
    body = f'''
{article_qa_side}
<section>
  <div class="breadcrumb"><a href="{home_href(root)}">Acasă</a> / <a href="{cat_href(root, it["cat"])}">{it["cat"]}</a> / Articol</div>
  <div class="article-body">
    {badge(it["cat"])}{sponsor_badge(it)}
    <h1>{it["titlu"]}</h1>
    <div class="meta"><span class="date">{fmt_date(it["date"])}</span>{views_line(it["slug"])}{surse_line(it, root)}</div>
    <div style="margin-bottom:18px;">
      {media_tag(it, root, "hero-media", "width:100%;border-radius:8px;")}
      {media_caption(it)}
    </div>
    {article_html}
    {tags_html(it, root)}
    {source_box}
    {colaborator_embed_html(it, root)}
  </div>
</section>
<aside>
  <h2 class="section-title">Din aceeași categorie</h2>
  <ul class="side-list">{related_html if related_html else '<li class="side-item">Primul articol din această categorie.</li>'}</ul>
</aside>'''
    os.makedirs(f"{BASE}/articol/{it['slug']}", exist_ok=True)
    with open(f"{BASE}/articol/{it['slug']}/index.html", "w", encoding="utf-8") as f:
        f.write(page_shell(root, f"{it['titlu']} — Electric NEWS", it["cat"], body, layout="article-qa" if article_qa_side else "grid"))

# ---------- pagina "în lucru" (păstrată ca fallback, nimic nu mai leagă spre ea) ----------
root = "../../"
wip_body = f'''
<div class="article-body" style="max-width:640px;margin:60px auto;text-align:center;">
  <h1>În lucru</h1>
  <p>Această funcționalitate nu este încă activă în previzualizarea locală a site-ului.</p>
  <p><a href="{home_href(root)}" style="color:#0EA5A0;font-weight:700;">&larr; Înapoi la homepage</a></p>
</div>'''
os.makedirs(f"{BASE}/pagina/in-lucru", exist_ok=True)
with open(f"{BASE}/pagina/in-lucru/index.html", "w", encoding="utf-8") as f:
    f.write(page_shell(root, "În lucru — Electric NEWS", None, wip_body, layout="single-col"))

# ---------- pagina "mulțumim" (redirect comun după orice formular) ----------
multumim_body = f'''
<div class="form-page" style="text-align:center;">
  <h1>Mulțumim!</h1>
  <p class="form-intro">Am primit mesajul tău. Cineva din redacție îl va citi curând.</p>
  <p><a href="{home_href(root)}" style="color:#0EA5A0;font-weight:700;">&larr; Înapoi la homepage</a></p>
</div>'''
os.makedirs(f"{BASE}/pagina/multumim", exist_ok=True)
with open(f"{BASE}/pagina/multumim/index.html", "w", encoding="utf-8") as f:
    f.write(page_shell(root, "Mulțumim — Electric NEWS", None, multumim_body, layout="single-col"))

def netlify_form_page(form_name, title, intro, fields_html, submit_label):
    return f'''
<div class="form-page">
  <h1>{title}</h1>
  <p class="form-intro">{intro}</p>
  <form name="{form_name}" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" action="{root}pagina/multumim/index.html">
    <input type="hidden" name="form-name" value="{form_name}" />
    <p class="honeypot"><label>Nu completa acest câmp: <input name="bot-field" /></label></p>
    {fields_html}
    <button type="submit" class="form-submit">{submit_label}</button>
  </form>
</div>'''

# ---------- pagina "Trimite o știre" ----------
trimite_fields = '''
    <div class="form-field">
      <label for="url">Link (articol sau video YouTube)</label>
      <input type="url" id="url" name="url" placeholder="https://..." required>
    </div>
    <div class="form-field">
      <label for="tip_continut">Tip conținut</label>
      <select id="tip_continut" name="tip_continut">
        <option>Articol / site de știri</option>
        <option>Video YouTube</option>
        <option>Idee brută (fără link)</option>
      </select>
    </div>
    <div class="form-field">
      <label for="nota">De ce crezi că e relevant? <span class="hint">Opțional</span></label>
      <textarea id="nota" name="nota" placeholder="Context suplimentar pentru redacție..."></textarea>
    </div>
    <div class="form-field">
      <label for="email">Emailul tău <span class="hint">Opțional, dacă vrei să știi când publicăm</span></label>
      <input type="email" id="email" name="email" placeholder="nume@exemplu.ro">
    </div>'''
trimite_body = netlify_form_page(
    "trimite-o-stire", "Trimite o știre",
    "Ai găsit un articol, un video YouTube sau ai o idee de subiect pentru Electric NEWS? Spune-ne aici — redacția verifică fiecare sugestie înainte de publicare.",
    trimite_fields, "Trimite")
os.makedirs(f"{BASE}/pagina/trimite-o-stire", exist_ok=True)
with open(f"{BASE}/pagina/trimite-o-stire/index.html", "w", encoding="utf-8") as f:
    f.write(page_shell(root, "Trimite o știre — Electric NEWS", None, trimite_body, layout="single-col"))

# ---------- pagina "Contact" ----------
contact_fields = '''
    <div class="form-field">
      <label for="nume">Nume</label>
      <input type="text" id="nume" name="nume" required>
    </div>
    <div class="form-field">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required>
    </div>
    <div class="form-field">
      <label for="mesaj">Mesaj</label>
      <textarea id="mesaj" name="mesaj" required></textarea>
    </div>'''
contact_body = netlify_form_page(
    "contact", "Contact",
    "Întrebări, parteneriate sau feedback — scrie-ne și revenim cât de curând.",
    contact_fields, "Trimite mesajul")
os.makedirs(f"{BASE}/pagina/contact", exist_ok=True)
with open(f"{BASE}/pagina/contact/index.html", "w", encoding="utf-8") as f:
    f.write(page_shell(root, "Contact — Electric NEWS", None, contact_body, layout="single-col"))

# ---------- pagina "Newsletter" ----------
newsletter_fields = '''
    <div class="form-field">
      <label for="email">Adresa ta de email</label>
      <input type="email" id="email" name="email" required>
    </div>'''
newsletter_body = netlify_form_page(
    "newsletter", "Abonează-te la newsletter",
    "Un email pe săptămână cu cele mai importante știri despre electric, smart home, fotovoltaic și baterii. Fără spam.",
    newsletter_fields, "Abonează-te")
os.makedirs(f"{BASE}/pagina/newsletter", exist_ok=True)
with open(f"{BASE}/pagina/newsletter/index.html", "w", encoding="utf-8") as f:
    f.write(page_shell(root, "Newsletter — Electric NEWS", None, newsletter_body, layout="single-col"))

# ---------- pagina "Sursele noastre" ----------
source_counts = {}
source_example_url = {}
source_items = {}
for it in items:
    if it["sursa"] and it["sursa"] != "—":
        source_counts[it["sursa"]] = source_counts.get(it["sursa"], 0) + 1
        source_items.setdefault(it["sursa"], []).append(it)
        if it["url"].startswith("http") and it["sursa"] not in source_example_url:
            source_example_url[it["sursa"]] = it["url"]

agregat_n = sum(1 for it in items if it["tip"] == "Agregat")
propriu_n = sum(1 for it in items if it["tip"] == "Propriu")

source_rows = ""
for sursa, cnt in sorted(source_counts.items(), key=lambda x: (-x[1], x[0])):
    link = source_example_url.get(sursa)
    label = f'<a href="{link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">{sursa}</a>' if link else sursa
    plural = "articol" if cnt == 1 else "articole"
    our_links = "".join(
        f'<li><a class="qa-link" href="{art_href(root, a)}">{a["titlu"]}</a></li>'
        for a in sorted(source_items[sursa], key=lambda a: a["date"], reverse=True)
    )
    source_rows += f'''
    <details class="qa-item">
      <summary><span>{label}</span><span class="side-meta" style="flex:none;">{cnt} {plural}</span></summary>
      <div class="qa-answer"><ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;">{our_links}</ul></div>
    </details>'''

surse_body = f'''
<div class="article-body" style="max-width:760px;margin:0 auto;">
  <h1>Sursele noastre</h1>
  <p>Electric NEWS funcționează pe un model hibrid: {agregat_n} articole „Agregat" — rescrise pornind de la o sursă externă reală, verificată, citată explicit — și {propriu_n} articole „Propriu" — ghiduri originale, scrise pe baza expertizei tehnice a redacției, fără să pretindă o sursă externă unde nu există una.</p>
  <p>Pentru fiecare articol Agregat: faptele, cifrele și citatele vin direct din pagina sursă, nu din memorie sau presupuneri. Data de publicare afișată e data reală de pe articolul sursă, extrasă automat, nu o dată artificială. Dacă un detaliu cerut de titlu nu apare în sursă, articolul spune asta direct, în loc să completeze cu ceva plauzibil dar neverificat.</p>
  <p>Imaginile urmează aceeași regulă de transparență: o poză reală (din pagina sursă sau thumbnail oficial YouTube) rămâne fără marcaj; o imagine generată ilustrativ poartă mereu eticheta „Ilustrație" direct pe poză, plus o mențiune sub ea. Niciodată nu prezentăm o imagine generată ca fiind o fotografie reală a subiectului.</p>
  <p>Am găsit o greșeală într-un articol? <a href="{contact_href(root)}" style="color:#0EA5A0;font-weight:700;">Spune-ne</a> — corectăm.</p>
  <h2 class="section-title" style="margin-top:32px;">Surse folosite până acum ({len(source_counts)})</h2>
  <p style="color:var(--muted);font-size:13.5px;margin-top:-8px;">Apasă pe o sursă ca să vezi ce articole am publicat pe baza ei.</p>
  <div class="qa-list">{source_rows}</div>
</div>'''
os.makedirs(f"{BASE}/pagina/sursele-noastre", exist_ok=True)
with open(f"{BASE}/pagina/sursele-noastre/index.html", "w", encoding="utf-8") as f:
    f.write(page_shell(root, "Sursele noastre — Electric NEWS", None, surse_body, layout="single-col"))

# ---------- admin/gestionare/ (CRUD local — nu face parte din site-ul public, nu se publică pe Netlify) ----------
admin_source_counts = {}
for it in items:
    if it["sursa"] and it["sursa"] != "—":
        admin_source_counts[it["sursa"]] = admin_source_counts.get(it["sursa"], 0) + 1

ADMIN_DATA = {
    "articole": [
        {
            "row": it["row"], "slug": it["slug"], "titlu": it["titlu"], "cat": it["cat"], "tip": it["tip"],
            "sursa": it["sursa"], "url": it["url"], "data": it["date"].isoformat() if it["date"] else "",
            "sponsorizat": it["sponsorizat"], "etichete": it["etichete"],
        } for it in items
    ],
    "intrebari": admin_intrebari,
    "surse": [{"nume": n, "count": c} for n, c in sorted(admin_source_counts.items(), key=lambda x: (-x[1], x[0]))],
    "categorii": CATEGORII,
}
# generat ÎNTOTDEAUNA din șablonul curat (index.template.html) — niciodată prin regex pe fișierul
# deja generat: dacă textul unui articol conține "; " (punctuație normală RO), un regex non-greedy
# s-ar opri acolo și ar trunchia/corupe JSON-ul (bug real, întâlnit și reparat pe 9 august 2026)
ADMIN_TEMPLATE_PATH = f"{ROOT}/admin/gestionare/index.template.html"
ADMIN_GESTIONARE_PATH = f"{ROOT}/admin/gestionare/index.html"
if os.path.exists(ADMIN_TEMPLATE_PATH):
    admin_html = open(ADMIN_TEMPLATE_PATH, encoding="utf-8").read()
    admin_html = admin_html.replace("__ADMIN_DATA_JSON__", json.dumps(ADMIN_DATA, ensure_ascii=False))
    with open(ADMIN_GESTIONARE_PATH, "w", encoding="utf-8") as f:
        f.write(admin_html)

print(f"Generat: 1 homepage, {len(CAT_SLUG)} pagini categorie, {len(items)} pagini articol, "
      f"formulare (trimite-o-stire, contact, newsletter) + pagina sursele-noastre + pagină mulțumim + în-lucru.")
