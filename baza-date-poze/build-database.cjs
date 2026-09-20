// Construiește baza de date centrală de poze din datele reconstruite ale site-ului.
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join('..', 'Firmă montaj fotovoltaic stocare zona Făgăraș', 'site-solar-electric-panel');

const dataRaw = fs.readFileSync(path.join(SITE_DIR, 'data.js'), 'utf8');
const DATA = JSON.parse(dataRaw.replace(/^const PORTFOLIO_DATA = /, '').replace(/;\s*$/, ''));

const log = JSON.parse(fs.readFileSync(path.join(SITE_DIR, 'analiza-carduri-log.json'), 'utf8'));

const CATEGORY_LABELS = {
  fotovoltaic_rezidential: 'Fotovoltaic rezidențial',
  fotovoltaic_comercial: 'Fotovoltaic comercial',
  tablou_electric: 'Tablou electric & instalații',
  diagnoza_reparatii: 'Diagnoză & reparații',
  smart_home: 'Smart Home & automatizări',
  cctv_it: 'CCTV & rețele IT',
  altele: 'Altele',
  altele_verificare: 'Altele',
};

// keyword tags detectate în titluri/note — util pentru căutare ulterioară
const KEYWORD_TAGS = [
  'Huawei', 'DAH Solar', 'Deye', 'Growatt', 'Noark', 'Schrack', 'Schneider',
  'Moeller', 'ABB', 'ETI', 'Leader Solar', 'LUKOIL', 'StartUp Nation',
  'Smart Fotovoltaic Solutions', 'EV', 'wallbox', 'baterie', 'invertor',
  'tablou general', 'branșament', 'MT', 'FDCP', 'pergolă', 'carport',
];
function extractTags(text) {
  const found = new Set();
  KEYWORD_TAGS.forEach(kw => {
    if (text.toLowerCase().includes(kw.toLowerCase())) found.add(kw);
  });
  return [...found];
}

// index redundant photos (physically moved out) with whatever context the log has
const redundantIndex = {}; // photoId -> { cardId, cardOriginalName, note }
Object.entries(log).forEach(([cardId, card]) => {
  (card.jobs_found || []).forEach(job => {
    const moved = job.photo_ids_moved_redundant || [];
    moved.forEach(pid => {
      redundantIndex[pid] = {
        original_card_id: cardId,
        original_card_name: card.original_name,
        job_label: job.label,
        job_date_range: job.date_range || null,
        job_category: job.category || null,
        reason: 'aproape identică cu altă poză păstrată în același grup',
      };
    });
  });
});

const projectsById = Object.fromEntries(DATA.projects.map(p => [p.id, p]));

// ---------- kept (live) photos ----------
const keptPhotos = DATA.photos
  .filter(ph => projectsById[ph.project_id]) // only photos that belong to a real card, not the "other-*" pool
  .map(ph => {
    const proj = projectsById[ph.project_id];
    const text = `${proj.name} ${proj.notes || ''}`;
    return {
      photo_id: ph.id,
      status: 'kept',
      filename: path.basename(ph.original || ''),
      thumb_small: ph.thumb_s,
      thumb_large: ph.thumb_l,
      original_path: ph.original || null,
      date: ph.date,
      year: ph.date ? ph.date.slice(0, 4) : null,
      is_video: !!ph.is_video,
      width: ph.w || null,
      height: ph.h || null,
      card_id: proj.id,
      card_title: proj.name,
      card_description: proj.notes || '',
      category_id: proj.category,
      category_label: CATEGORY_LABELS[proj.category] || proj.category,
      is_cover_photo: ph.id === proj.cover_id,
      location: proj.location || null,
      tags: extractTags(text),
      site_source: 'sep / Firmă montaj fotovoltaic stocare zona Făgăraș / site-solar-electric-panel',
    };
  });

// ---------- redundant (moved-out) photos ----------
const redundantDir = path.join(SITE_DIR, 'pozeredundante');
const redundantFiles = fs.existsSync(redundantDir) ? fs.readdirSync(redundantDir) : [];
const redundantIds = [...new Set(redundantFiles.filter(f => f.endsWith('_l.webp')).map(f => f.replace('_l.webp', '')))];

// original photo metadata (date etc.) — reconstructed from the pre-reconstruction backup, which still has every photo
const backupRaw = fs.readFileSync(path.join(SITE_DIR, 'data.js.backup-monthly'), 'utf8');
const BACKUP_DATA = JSON.parse(backupRaw.replace(/^const PORTFOLIO_DATA = /, '').replace(/;\s*$/, ''));
const backupPhotosById = Object.fromEntries(BACKUP_DATA.photos.map(ph => [ph.id, ph]));

const redundantPhotos = redundantIds.map(pid => {
  const ph = backupPhotosById[pid] || {};
  const ctx = redundantIndex[pid] || {};
  return {
    photo_id: pid,
    status: 'redundant',
    filename: path.basename(ph.original || ''),
    thumb_small: `pozeredundante/${pid}_s.webp`,
    thumb_large: `pozeredundante/${pid}_l.webp`,
    original_path: ph.original || null,
    date: ph.date || null,
    year: ph.date ? ph.date.slice(0, 4) : null,
    is_video: !!ph.is_video,
    width: ph.w || null,
    height: ph.h || null,
    card_id: null,
    card_title: null,
    card_description: null,
    category_id: ctx.job_category || null,
    category_label: ctx.job_category ? (CATEGORY_LABELS[ctx.job_category] || ctx.job_category) : null,
    is_cover_photo: false,
    location: null,
    tags: extractTags(ctx.job_label || ''),
    duplicate_context: ctx.job_label || null,
    duplicate_reason: ctx.reason || 'poză aproape identică, mutată din card în timpul indexării',
    original_card_name: ctx.original_card_name || null,
    site_source: 'sep / Firmă montaj fotovoltaic stocare zona Făgăraș / site-solar-electric-panel',
  };
});

// ---------- cards summary table ----------
const cards = DATA.projects.map(p => ({
  card_id: p.id,
  title: p.name,
  category_id: p.category,
  category_label: CATEGORY_LABELS[p.category] || p.category,
  description: p.notes || '',
  date_from: p.date_from,
  date_to: p.date_to,
  photo_count: p.count,
  cover_photo_id: p.cover_id,
  location: p.location || null,
  tags: extractTags(`${p.name} ${p.notes || ''}`),
}));

const database = {
  generated_at: new Date().toISOString(),
  schema_version: '1.0',
  description: 'Bază de date de poze indexate din arhiva foto a proiectelor fotovoltaice/electrice — generată prin analiză vizuală asistată de Claude, câte o intrare per poză + un tabel sumar per card/lucrare.',
  stats: {
    total_cards: cards.length,
    total_photos_kept: keptPhotos.length,
    total_photos_redundant: redundantPhotos.length,
    total_photos_indexed: keptPhotos.length + redundantPhotos.length,
  },
  cards,
  photos: [...keptPhotos, ...redundantPhotos],
};

fs.writeFileSync('poze-index.json', JSON.stringify(database, null, 2));
console.log('cards:', cards.length);
console.log('photos kept:', keptPhotos.length);
console.log('photos redundant:', redundantPhotos.length);
console.log('total indexed:', keptPhotos.length + redundantPhotos.length);
