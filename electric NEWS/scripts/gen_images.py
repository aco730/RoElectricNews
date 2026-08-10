from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os, random, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Reguli din 9 august 2026: NU se suprascrie niciodata automat o poza de categorie
# deja existenta pe disc — indiferent daca a fost generata de script sau incarcata
# manual de utilizator. Se genereaza doar pentru categorii noi (fisier lipsa), sau
# pentru sloguri trecute explicit cu --force (cerute explicit de utilizator).
FORCE_ALL = "--force-all" in sys.argv
FORCE_SLUGS = set()
if "--force" in sys.argv:
    idx = sys.argv.index("--force")
    if idx + 1 < len(sys.argv):
        FORCE_SLUGS = set(sys.argv[idx + 1].split(","))

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG  = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
if not os.path.exists(FONT_BOLD):
    FONT_BOLD = next((p for p in ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/segoeuib.ttf"] if os.path.exists(p)), FONT_BOLD)
    FONT_REG = next((p for p in ["C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/segoeui.ttf"] if os.path.exists(p)), FONT_REG)
W, H = 1200, 630

CAT_SLUG = {
    "Electric & instalații": "electric-instalatii",
    "Smart Home & Automatizări": "smart-home",
    "Fotovoltaic": "fotovoltaic",
    "Baterii & Stocare": "baterii-stocare",
    "Reglementări & Prețuri energie": "reglementari-preturi",
    "YouTube": "youtube",
    "Colaboratori": "colaboratori",
}

def lerp(a, b, t): return tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))

def vgrad(size, top, bottom):
    w,h = size
    img = Image.new("RGB", size, top)
    px = img.load()
    for y in range(h):
        c = lerp(top, bottom, y/h)
        for x in range(0, w, 4):
            for dx in range(4):
                if x+dx < w: px[x+dx, y] = c
    return img

def soft_glow(base, center, radius, color, alpha=140, blur=60):
    layer = Image.new("RGBA", base.size, (0,0,0,0))
    d = ImageDraw.Draw(layer)
    d.ellipse([center[0]-radius, center[1]-radius, center[0]+radius, center[1]+radius], fill=color+(alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.paste(Image.alpha_composite(base.convert("RGBA"), layer).convert("RGB"), (0,0))

def stars(draw, n, area, color=(255,255,255)):
    random.seed(42)
    for _ in range(n):
        x = random.randint(area[0], area[2]); y = random.randint(area[1], area[3])
        r = random.choice([1,1,1,2])
        a = random.randint(60,180)
        draw.ellipse([x-r,y-r,x+r,y+r], fill=color+(a,))

def label(draw, cat_name):
    f_small = ImageFont.truetype(FONT_REG, 22)
    draw.text((44,36), "ELECTRIC NEWS", font=f_small, fill=(255,255,255,215))

def save(img, slug):
    path = f"{ROOT}/site-local/assets/images/categorii/{slug}.jpg"
    if os.path.exists(path) and not FORCE_ALL and slug not in FORCE_SLUGS:
        print(f"SĂRIT {slug} — fișierul există deja, nu se suprascrie automat "
              f"(rulează cu --force {slug} dacă chiar vrei să-l regenerezi)")
        return
    img.convert("RGB").save(path, quality=90)
    print("saved", slug)

# ============ 1. FOTOVOLTAIC ============
def make_fotovoltaic():
    img = vgrad((W,H), (74,140,209), (255,214,145)).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    soft_glow(img, (860,150), 230, (255,236,150), alpha=170, blur=70)
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse([790,80,930,220], fill=(255,244,190,255), outline=(255,255,255,255), width=3)
    for ang in range(0,360,30):
        rad = math.radians(ang)
        x0 = 860+80*math.cos(rad); y0 = 150+80*math.sin(rad)
        x1 = 860+105*math.cos(rad); y1 = 150+105*math.sin(rad)
        draw.line([(x0,y0),(x1,y1)], fill=(255,255,255,220), width=4)
    # clouds
    for cx,cy,s in [(220,120,60),(300,140,45),(180,150,40),(980,380,50),(1060,400,35)]:
        draw.ellipse([cx-s,cy-s*0.5,cx+s,cy+s*0.5], fill=(255,255,255,180))
    # birds
    for bx,by in [(500,110),(540,95),(575,120)]:
        draw.line([(bx-12,by),(bx,by-8),(bx+12,by)], fill=(60,70,90,200), width=3, joint="curve")
    # ground
    draw.rectangle([0,470,W,H], fill=(20,26,40,255))
    draw.polygon([(0,470),(W,470),(W,420),(0,440)], fill=(28,36,54,255))
    # house silhouette + roof
    draw.polygon([(120,470),(430,470),(430,300),(275,190),(120,300)], fill=(16,22,36,255))
    # solar panel array on roof (perspective grid)
    ox,oy = 150,300
    rows,cols = 3,4
    for r_ in range(rows):
        for c_ in range(cols):
            x0 = ox + c_*42 + r_*6
            y0 = oy + r_*30 - 40
            poly = [(x0,y0-90+r_*30),(x0+38,y0-98+r_*30),(x0+38,y0-72+r_*30),(x0,y0-64+r_*30)]
    # simpler: draw a tilted panel block
    panel_pts = [(150,300),(400,300),(370,205),(190,205)]
    draw.polygon(panel_pts, fill=(30,42,66,255), outline=(255,255,255,180))
    for i in range(1,5):
        t = i/5
        x_top = 190+(370-190)*t; x_bot = 150+(400-150)*t
        draw.line([(x_bot,300),(x_top,205)], fill=(255,255,255,90), width=2)
    for j in range(1,3):
        y = 205+(300-205)*j/3
        draw.line([(150+ (400-150)*(j/3), 300-(300-205)*0), (150,300)], fill=None)
    draw.line([(150,205+(300-205)/3),(400,205+(300-205)/3)], fill=(255,255,255,60), width=2)
    draw.line([(150,205+2*(300-205)/3),(400,205+2*(300-205)/3)], fill=(255,255,255,60), width=2)
    # small ground panel array (freestanding), rows receding
    for row in range(3):
        y = 430 + row*14
        x0 = 520 + row*30
        w_ = 620 - row*70
        draw.polygon([(x0,y),(x0+w_,y),(x0+w_-30,y-38),(x0+30,y-38)], fill=(24,60,90,255), outline=(140,200,255,120))
        for k in range(1,6):
            xk = x0+30 + (w_-60)*k/6
            draw.line([(x0+w_-30-(w_-60-((w_-60)*k/6)),y-38),(xk,y-38)], fill=None)
    f_big = ImageFont.truetype(FONT_BOLD, 40)
    draw.text((60,560), "Fotovoltaic", font=f_big, fill=(255,255,255,255))
    label(draw, "Fotovoltaic")
    save(img, CAT_SLUG["Fotovoltaic"])

# ============ 2. ELECTRIC & INSTALAȚII ============
def make_electric():
    img = vgrad((W,H), (30,38,58), (12,16,26)).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    soft_glow(img, (900,160), 220, (247,166,60), alpha=90, blur=90)
    draw = ImageDraw.Draw(img, "RGBA")
    # subtle brick/wall texture lines
    for y in range(0,H,26):
        draw.line([(0,y),(W,y)], fill=(255,255,255,10))
    # breaker box
    bx,by,bw,bh = 330,110,540,420
    draw.rounded_rectangle([bx,by,bx+bw,by+bh], radius=16, fill=(20,26,40,255), outline=(255,255,255,60), width=2)
    draw.rounded_rectangle([bx+16,by+16,bx+bw-16,by+bh-16], radius=10, outline=(255,255,255,40), width=2)
    cols, rows = 4,5
    pad=40
    cw = (bw-2*pad-16*2)/cols
    ch = (bh-2*pad-16*2-40)/rows
    random.seed(7)
    for r_ in range(rows):
        for c_ in range(cols):
            x0 = bx+pad+16 + c_*cw + c_*8
            y0 = by+pad+16+30 + r_*ch + r_*8
            on = random.random() > 0.25
            col = (247,166,60,255) if on else (70,80,100,255)
            draw.rounded_rectangle([x0,y0,x0+cw-8,y0+ch-8], radius=4, fill=(40,48,66,255), outline=(255,255,255,50), width=1)
            ind_y1 = y0+6 + ((ch-8)*0.5 if on else 6)
            draw.rectangle([x0+cw*0.35,y0+6,x0+cw*0.5,ind_y1], fill=col)
    # top wires
    for i,x in enumerate(range(bx+60, bx+bw-60, 70)):
        c = (247,166,60,255) if i%3==0 else (90,140,180,255) if i%3==1 else (200,200,210,255)
        draw.line([(x,0),(x,by+8)], fill=c, width=6)
    # bonding bar
    draw.rounded_rectangle([bx+pad, by+bh-52, bx+bw-pad, by+bh-30], radius=6, fill=(180,186,196,255))
    for x in range(bx+pad+20, bx+bw-pad-10, 26):
        draw.ellipse([x-4,by+bh-46,x+4,by+bh-38], fill=(90,96,106,255))
    f_big = ImageFont.truetype(FONT_BOLD, 40)
    draw.text((60,560), "Electric & instalații", font=f_big, fill=(255,255,255,255))
    label(draw, "Electric")
    save(img, CAT_SLUG["Electric & instalații"])

# ============ 3. SMART HOME ============
def make_smart_home():
    img = vgrad((W,H), (35,20,66), (16,10,36)).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    stars(draw, 70, (0,0,0,W,320))
    soft_glow(img, (330,420), 200, (255,214,120), alpha=120, blur=80)
    draw = ImageDraw.Draw(img, "RGBA")
    # ground
    draw.rectangle([0,470,W,H], fill=(14,10,26,255))
    # house silhouette
    draw.polygon([(150,470),(520,470),(520,270),(335,150),(150,270)], fill=(24,16,44,255), outline=(120,90,180,120))
    # glowing windows
    for (wx,wy,ww,wh) in [(210,330,60,60),(300,330,60,60),(390,330,60,60),(300,220,50,50)]:
        draw.rounded_rectangle([wx,wy,wx+ww,wy+wh], radius=6, fill=(255,214,130,235))
        draw.rounded_rectangle([wx,wy,wx+ww,wy+wh], radius=6, outline=(255,255,255,120), width=2)
    # door
    draw.rounded_rectangle([440,380,490,470], radius=6, fill=(60,40,90,255), outline=(255,255,255,60))
    # wifi arcs from roof
    for r,a0,a1 in [(50,200,340),(80,200,340),(110,200,340)]:
        bbox=[335-r,150-40-r,335+r,150-40+r]
        draw.arc(bbox, a0,a1, fill=(190,150,255,220), width=6)
    # floating device icons with dotted connectors
    icons = [(760,220,"phone"),(920,320,"bulb"),(820,440,"thermo")]
    for (ix,iy,kind) in icons:
        draw.line([(400,260),(ix,iy)], fill=(190,150,255,90), width=2)
        for t in range(0,100,10):
            pass
        draw.ellipse([ix-46,iy-46,ix+46,iy+46], fill=(40,26,68,230), outline=(190,150,255,200), width=2)
        if kind=="phone":
            draw.rounded_rectangle([ix-16,iy-26,ix+16,iy+26], radius=6, outline=(255,255,255,230), width=3)
            draw.ellipse([ix-3,iy+16,ix+3,iy+22], fill=(255,255,255,230))
        elif kind=="bulb":
            draw.ellipse([ix-18,iy-22,ix+18,iy+10], outline=(255,255,255,230), width=3)
            draw.line([(ix-8,iy+10),(ix+8,iy+10)], fill=(255,255,255,230), width=3)
            draw.line([(ix-6,iy+16),(ix+6,iy+16)], fill=(255,255,255,230), width=3)
        else:
            draw.ellipse([ix-20,iy-20,ix+20,iy+20], outline=(255,255,255,230), width=3)
            draw.line([(ix,iy),(ix+10,iy-10)], fill=(255,255,255,230), width=3)
    f_big = ImageFont.truetype(FONT_BOLD, 40)
    draw.text((60,560), "Smart Home & Automatizări", font=f_big, fill=(255,255,255,255))
    label(draw, "Smart Home")
    save(img, CAT_SLUG["Smart Home & Automatizări"])

# ============ 4. BATERII & STOCARE ============
def make_baterii():
    img = vgrad((W,H), (10,90,90), (6,40,42)).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    soft_glow(img, (430,300), 220, (45,212,191), alpha=150, blur=80)
    draw = ImageDraw.Draw(img, "RGBA")
    # wall panel
    draw.rectangle([0,0,W,H], fill=None)
    for y in range(0,H,30):
        draw.line([(0,y),(W,y)], fill=(255,255,255,8))
    # battery unit (rounded rect wall-mounted)
    bx,by,bw,bh = 300,140,260,340
    draw.rounded_rectangle([bx,by,bx+bw,by+bh], radius=22, fill=(8,26,28,255), outline=(255,255,255,60), width=2)
    draw.rounded_rectangle([bx+14,by+14,bx+bw-14,by+bh-14], radius=14, outline=(45,212,191,140), width=2)
    # charge level
    lvl = 0.72
    fill_h = (bh-60)*lvl
    draw.rounded_rectangle([bx+30, by+bh-30-fill_h, bx+bw-30, by+bh-30], radius=10, fill=(45,212,191,235))
    draw.rounded_rectangle([bx+30, by+30, bx+bw-30, by+bh-30], radius=10, outline=(255,255,255,50), width=2)
    # bolt icon center
    cx,cy = bx+bw/2, by+bh/2
    draw.polygon([(cx+10,cy-70),(cx-30,cy+5),(cx-4,cy+5),(cx-14,cy+70),(cx+34,cy-8),(cx+6,cy-8)], fill=(255,255,255,235))
    # cable down to inverter
    draw.line([(bx+bw/2, by+bh),(bx+bw/2, by+bh+60)], fill=(255,255,255,140), width=6)
    ix,iy,iw,ih = bx+bw/2-60, by+bh+60, 120, 70
    draw.rounded_rectangle([ix,iy,ix+iw,iy+ih], radius=10, fill=(8,26,28,255), outline=(45,212,191,160), width=2)
    draw.text((ix+18,iy+22), "INV", font=ImageFont.truetype(FONT_BOLD,20), fill=(45,212,191,255))
    # energy flow dots toward a house icon on right
    hx,hy = 920,340
    draw.polygon([(hx-70,hy+40),(hx+70,hy+40),(hx+70,hy-30),(hx,hy-90),(hx-70,hy-30)], fill=(6,40,42,255), outline=(45,212,191,120))
    for i in range(6):
        t = i/6
        px = bx+bw+ 40 + (hx-70-(bx+bw+40))*t
        py = by+bh/2 + (hy-(by+bh/2))*t
        r = 5
        draw.ellipse([px-r,py-r,px+r,py+r], fill=(45,212,191,220))
    f_big = ImageFont.truetype(FONT_BOLD, 40)
    draw.text((60,560), "Baterii & Stocare", font=f_big, fill=(255,255,255,255))
    label(draw, "Baterii")
    save(img, CAT_SLUG["Baterii & Stocare"])

# ============ 5. REGLEMENTĂRI & PREȚURI ============
def make_reglementari():
    img = vgrad((W,H), (120,30,30), (60,12,12)).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    soft_glow(img, (860,220), 200, (255,180,150), alpha=100, blur=80)
    draw = ImageDraw.Draw(img, "RGBA")
    for y in range(0,H,30):
        draw.line([(0,y),(W,y)], fill=(255,255,255,8))
    # building: columns + pediment
    base_y = 430
    draw.polygon([(560,base_y-150),(760,base_y-150),(840,base_y-70),(480,base_y-70)], fill=(30,8,8,255))
    draw.rectangle([480,base_y-70,840,base_y-40], fill=(40,12,12,255), outline=(255,255,255,50))
    for cx in range(510,820,45):
        draw.rectangle([cx,base_y-40,cx+22,base_y+60], fill=(50,16,16,255), outline=(255,255,255,50))
    draw.rectangle([470,base_y+60,850,base_y+90], fill=(30,8,8,255))
    # steps
    for i,yy in enumerate(range(base_y+90, base_y+130, 12)):
        wgap = i*14
        draw.rectangle([470-wgap,yy,850+wgap,yy+12], fill=(24,6,6,255))
    # document / contract to the left
    dx,dy,dw,dh = 140,220,260,340
    draw.rounded_rectangle([dx+10,dy+16,dx+dw+10,dy+dh+16], radius=8, fill=(60,18,18,220))
    draw.rounded_rectangle([dx,dy,dx+dw,dy+dh], radius=8, fill=(250,247,240,255), outline=(255,255,255,80), width=2)
    for i,ly in enumerate(range(dy+40, dy+dh-40, 26)):
        lw = dw-60 if i%3 else dw-100
        draw.rectangle([dx+30,ly,dx+30+lw,ly+8], fill=(180,60,60,200) if i==0 else (210,200,195,255))
    # stamp circle
    scx,scy = dx+dw-60, dy+dh-70
    draw.ellipse([scx-38,scy-38,scx+38,scy+38], outline=(178,34,34,220), width=5)
    draw.text((scx-26,scy-12), "ANRE", font=ImageFont.truetype(FONT_BOLD,16), fill=(178,34,34,230))
    f_big = ImageFont.truetype(FONT_BOLD, 36)
    draw.text((60,560), "Reglementări & Prețuri energie", font=f_big, fill=(255,255,255,255))
    label(draw, "Reglementari")
    save(img, CAT_SLUG["Reglementări & Prețuri energie"])

# ============ 6. YOUTUBE ============
def make_youtube():
    img = vgrad((W,H), (26,8,8), (10,3,3)).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    soft_glow(img, (600,290), 260, (255,60,60), alpha=130, blur=90)
    draw = ImageDraw.Draw(img, "RGBA")
    for y in range(0,H,30):
        draw.line([(0,y),(W,y)], fill=(255,255,255,8))
    # panou rosu rotunjit, cu triunghi play alb in centru
    bw,bh = 260,180
    bx,by = 600-bw/2, 290-bh/2
    draw.rounded_rectangle([bx,by,bx+bw,by+bh], radius=36, fill=(224,16,16,255), outline=(255,255,255,60), width=3)
    s = 46
    cx,cy = 600,290
    draw.polygon([(cx-s*0.5,cy-s*0.9),(cx-s*0.5,cy+s*0.9),(cx+s*0.95,cy)], fill=(255,255,255,240))
    # cateva dreptunghiuri suggesting playlist/video cards in fundal
    for i,(rx,ry) in enumerate([(140,140),(980,120),(160,460),(1000,470)]):
        rw,rh = 150,90
        draw.rounded_rectangle([rx,ry,rx+rw,ry+rh], radius=10, fill=(50,14,14,220), outline=(255,255,255,40), width=2)
        s2=18
        draw.polygon([(rx+rw/2-s2*0.5,ry+rh/2-s2*0.9),(rx+rw/2-s2*0.5,ry+rh/2+s2*0.9),(rx+rw/2+s2*0.95,ry+rh/2)], fill=(255,255,255,200))
    f_big = ImageFont.truetype(FONT_BOLD, 40)
    draw.text((60,560), "YouTube", font=f_big, fill=(255,255,255,255))
    label(draw, "YouTube")
    save(img, CAT_SLUG["YouTube"])

# ============ 7. COLABORATORI ============
def make_colaboratori():
    img = vgrad((W,H), (58,44,22), (24,18,10)).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    soft_glow(img, (620,300), 250, (230,190,120), alpha=120, blur=90)
    draw = ImageDraw.Draw(img, "RGBA")
    for y in range(0,H,30):
        draw.line([(0,y),(W,y)], fill=(255,255,255,8))
    # doua maini simplificate care se strang (handshake stilizat)
    cx, cy = 600, 300
    draw.polygon([(cx-220,cy+40),(cx-40,cy-10),(cx-10,cy+30),(cx-190,cy+90)], fill=(230,190,120,255), outline=(255,255,255,60), width=2)
    draw.polygon([(cx+220,cy+40),(cx+40,cy-10),(cx+10,cy+30),(cx+190,cy+90)], fill=(180,140,80,255), outline=(255,255,255,60), width=2)
    draw.ellipse([cx-30,cy-5,cx+30,cy+45], fill=(245,215,160,255), outline=(255,255,255,120), width=2)
    f_big = ImageFont.truetype(FONT_BOLD, 40)
    draw.text((60,560), "Colaboratori", font=f_big, fill=(255,255,255,255))
    label(draw, "Colaboratori")
    save(img, CAT_SLUG["Colaboratori"])

make_fotovoltaic()
make_electric()
make_smart_home()
make_baterii()
make_reglementari()
make_youtube()
make_colaboratori()
print("Gata — vezi mai sus ce s-a generat efectiv și ce a fost sărit (deja exista).")
