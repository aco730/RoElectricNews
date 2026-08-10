(function () {
  var DATA = window.ADMIN_DATA;
  var tabs = ["stare", "articole", "intrebari", "surse", "categorii", "setari"];
  var state = { tab: "stare", filtroArticolSlug: "" };

  // ---------- Aplicare instantă prin server local (fără foldere, fără scripturi manuale) ----------
  var ENDPOINTS = {
    add_articol: "/api/articol/add", edit_articol: "/api/articol/edit", delete_articol: "/api/articol/delete",
    add_intrebare: "/api/intrebare/add", edit_intrebare: "/api/intrebare/edit", delete_intrebare: "/api/intrebare/delete",
    rename_sursa: "/api/sursa/rename",
    add_categorie: "/api/categorie/add", edit_categorie: "/api/categorie/edit", delete_categorie: "/api/categorie/delete",
  };

  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg, isError) {
    toastEl.textContent = msg;
    toastEl.style.background = isError ? "#B22222" : "var(--navy)";
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, isError ? 8000 : 4000);
  }

  async function saveComanda(payload) {
    var endpoint = ENDPOINTS[payload.op];
    toast("Se aplică...");
    try {
      var resp = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      var data = await resp.json();
      if (!resp.ok || !data.ok) {
        toast("Eroare: " + (data.error || resp.statusText), true);
        return;
      }
      var rb = data.rebuild || {};
      var msg = "Aplicat" + (rb.check_ok === false ? " — ATENȚIE, check_links a găsit probleme (vezi consola serverului)." : ", site regenerat, 0 linkuri moarte.");
      toast(msg);
      setTimeout(function () { window.location.reload(); }, 900);
    } catch (err) {
      toast("Nu m-am putut conecta la serverul local. E pornit pornește-admin.bat?", true);
    }
  }

  // ---------- utilitare ----------
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function catOptions(selected) {
    return DATA.categorii.map(function (c) {
      return '<option value="' + esc(c.nume) + '"' + (c.nume === selected ? " selected" : "") + ">" + esc(c.nume) + "</option>";
    }).join("");
  }
  function articolOptions(selected) {
    return DATA.articole.map(function (a) {
      return '<option value="' + esc(a.slug) + '"' + (a.slug === selected ? " selected" : "") + ">" + esc(a.titlu) + "</option>";
    }).join("");
  }

  var root = document.getElementById("tab-root");

  function renderTabs() {
    var nav = document.getElementById("tab-nav");
    var labels = {
      stare: "Stare sistem", articole: "Articole (" + DATA.articole.length + ")", intrebari: "Întrebări (" + DATA.intrebari.length + ")",
      surse: "Surse (" + DATA.surse.length + ")", categorii: "Categorii (" + DATA.categorii.length + ")", setari: "Setări",
    };
    nav.innerHTML = tabs.map(function (t) {
      return '<button class="tab-btn' + (state.tab === t ? " active" : "") + '" data-tab="' + t + '">' + labels[t] + "</button>";
    }).join("");
    Array.prototype.forEach.call(nav.querySelectorAll(".tab-btn"), function (b) {
      b.addEventListener("click", function () { state.tab = b.getAttribute("data-tab"); renderAll(); });
    });
  }

  // ---------- STARE SISTEM ----------
  function renderStare() {
    root.innerHTML = '<div class="panel-head"><h2>Stare sistem</h2></div><div id="stare-body" class="hint">Se verifică...</div>';
    fetch("/api/stare").then(function (r) { return r.json(); }).then(function (d) {
      function row(ok, label) {
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;"><span style="width:10px;height:10px;border-radius:50%;background:' + (ok ? "#166534" : "#B22222") + ';flex:none;"></span><span>' + label + "</span></div>";
      }
      var body =
        '<div class="card">' +
        row(d.cheie_anthropic, "Cheie API Anthropic (generare automată articole) — " + (d.cheie_anthropic ? "prezentă" : "lipsește (ANTHROPIC_API_KEY în .env)")) +
        row(d.cheie_pexels, "Cheie API Pexels (poze de stoc) — " + (d.cheie_pexels ? "prezentă" : "lipsește (PEXELS_API_KEY în .env)")) +
        row(d.goatcounter_conectat, "GoatCounter (tracking vizite) — " + (d.goatcounter_conectat ? "conectat" : "neconectat")) +
        row(d.goatcounter_stats, "Statistici vizualizări sincronizate — " + (d.goatcounter_stats ? "da" : "nu încă")) +
        '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);font-size:13px;color:var(--muted);">' +
        d.total_articole + " articole în Excel · ultima regenerare a site-ului: " + (d.ultima_regenerare || "necunoscută") +
        '</div></div>' +
        '<button class="btn-primary" id="regenereaza-btn">Regenerează + verifică acum</button>' +
        '<div id="regenereaza-result" style="margin-top:14px;"></div>';
      document.getElementById("stare-body").outerHTML = body;
      document.getElementById("regenereaza-btn").addEventListener("click", function () {
        var btn = document.getElementById("regenereaza-btn");
        btn.disabled = true; btn.textContent = "Se regenerează...";
        fetch("/api/regenereaza", { method: "POST" }).then(function (r) { return r.json(); }).then(function (rd) {
          var rb = rd.rebuild || {};
          document.getElementById("regenereaza-result").innerHTML =
            '<div class="hint">' + (rb.check_ok ? "Site regenerat, 0 linkuri moarte." : "ATENȚIE — verificarea linkurilor a găsit probleme, vezi consola serverului.") + "</div>";
          btn.disabled = false; btn.textContent = "Regenerează + verifică acum";
        });
      });
    });
  }

  // ---------- SETĂRI ----------
  function renderSetari() {
    root.innerHTML = '<div class="panel-head"><h2>Setări generare automată</h2></div><p class="hint">Se încarcă...</p>';
    fetch("/api/setari").then(function (r) { return r.json(); }).then(function (d) {
      var s = d.setari;
      root.innerHTML =
        '<div class="panel-head"><h2>Setări generare automată</h2></div>' +
        '<p class="hint" style="margin-bottom:16px;">Ghid pentru scrierea articolelor noi (ton, lungime, ce să extragă, poze) — Claude le respectă când procesează cererile din „Publică articol nou". Dacă reactivezi vreodată generarea automată prin server, aceleași setări se aplică și acolo. Nu afectează articolele deja publicate.</p>' +
        '<div class="form-card">' +
        '<div class="form-row-grid">' +
        '<div><label>Ton</label><select id="s-ton">' +
        ["tehnic-sobru", "profesional", "informativ-simplu", "conversational"].map(function (t) {
          return '<option value="' + t + '"' + (t === s.ton ? " selected" : "") + ">" + t + "</option>";
        }).join("") + "</select></div>" +
        '<div><label>Număr de întrebări Q&A per articol</label><input type="text" id="s-numar-intrebari" value="' + s.numar_intrebari + '"></div>' +
        "</div>" +
        '<div class="form-row-grid">' +
        '<div><label>Lungime minimă (cuvinte)</label><input type="text" id="s-lungime-min" value="' + s.lungime_min + '"></div>' +
        '<div><label>Lungime maximă (cuvinte)</label><input type="text" id="s-lungime-max" value="' + s.lungime_max + '"></div>' +
        "</div>" +
        '<div class="form-row"><label>Ce să extragă din sursă cu prioritate</label><textarea id="s-focus">' + esc(s.focus_extractie) + "</textarea></div>" +
        '<div class="form-row"><label>Strategie poze (ordinea încercărilor)</label><select id="s-poze-strategie">' +
        [
          ["og_pexels_generata", "Poză reală din sursă → Pexels → generată"],
          ["og_generata", "Poză reală din sursă → generată (fără Pexels)"],
          ["pexels_generata", "Doar Pexels → generată (ignoră poza sursei)"],
          ["doar_generata", "Întotdeauna generată (ilustrativă)"],
        ].map(function (o) {
          return '<option value="' + o[0] + '"' + (o[0] === s.poze_strategie ? " selected" : "") + ">" + o[1] + "</option>";
        }).join("") + "</select></div>" +
        '<div class="form-row"><label>Cuvinte cheie suplimentare pentru căutarea Pexels (opțional, engleză)</label><input type="text" id="s-poze-cuvinte" value="' + esc(s.poze_cuvinte_cheie_extra) + '" placeholder="ex: modern, rooftop"></div>' +
        '<div class="form-actions"><button class="btn-primary" id="save-setari">Salvează setările</button></div>' +
        "</div>";
      document.getElementById("save-setari").addEventListener("click", function () {
        var payload = {
          ton: document.getElementById("s-ton").value,
          numar_intrebari: parseInt(document.getElementById("s-numar-intrebari").value, 10) || 5,
          lungime_min: parseInt(document.getElementById("s-lungime-min").value, 10) || 350,
          lungime_max: parseInt(document.getElementById("s-lungime-max").value, 10) || 500,
          focus_extractie: document.getElementById("s-focus").value.trim(),
          poze_strategie: document.getElementById("s-poze-strategie").value,
          poze_cuvinte_cheie_extra: document.getElementById("s-poze-cuvinte").value.trim(),
        };
        fetch("/api/setari", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
          .then(function (r) { return r.json(); }).then(function () { toast("Setări salvate."); });
      });
    });
  }

  // ---------- ARTICOLE (clonă vizuală a cardurilor de pe site, cu acțiuni de editare/ștergere) ----------
  function articolCardHtml(a) {
    var img = "../../site-local/assets/images/articole/" + encodeURIComponent(a.slug) + ".jpg";
    return (
      '<article class="story-card admin-story-card">' +
      '<div class="admin-card-actions"><button data-edit="' + esc(a.slug) + '">Editează</button><button class="btn-danger" data-del="' + esc(a.slug) + '">Șterge</button></div>' +
      '<img class="story-media" src="' + img + '" alt="' + esc(a.cat) + '" onerror="this.style.display=\'none\'">' +
      '<span class="badge" style="background:' + colorFor(a.cat) + '">' + esc(a.cat) + '</span>' +
      (a.sponsorizat ? ' <span class="badge-sponsor">Sponsorizat</span>' : "") +
      '<h3>' + esc(a.titlu) + '</h3>' +
      '<div class="meta"><span class="date">' + esc(a.data || "") + '</span><span class="surse">' + esc(a.sursa) + '</span></div>' +
      '</article>'
    );
  }

  function renderArticole() {
    var q = (state.articolSearch || "").toLowerCase();
    var catFilter = state.articolCatFilter || "";
    var list = DATA.articole.filter(function (a) {
      if (catFilter && a.cat !== catFilter) return false;
      if (q && a.titlu.toLowerCase().indexOf(q) === -1 && a.slug.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    var cards = list.map(articolCardHtml).join("");
    root.innerHTML =
      '<div class="panel-head"><h2>Articole (' + list.length + '/' + DATA.articole.length + ')</h2><button class="btn-primary" id="add-articol">+ Articol nou</button></div>' +
      '<div class="filter-row">' +
      '<input type="text" id="articol-search" placeholder="Caută după titlu..." value="' + esc(state.articolSearch || "") + '">' +
      '<select id="articol-cat-filter"><option value="">Toate categoriile</option>' + catOptions(catFilter) + '</select>' +
      '</div>' +
      '<div id="articol-form-slot"></div>' +
      '<div class="admin-card-grid">' + (cards || '<p class="hint">Niciun articol nu se potrivește filtrului.</p>') + '</div>';

    document.getElementById("articol-search").addEventListener("input", function (e) { state.articolSearch = e.target.value; renderArticole(); });
    document.getElementById("articol-cat-filter").addEventListener("change", function (e) { state.articolCatFilter = e.target.value; renderArticole(); });
    document.getElementById("add-articol").addEventListener("click", function () { showArticolForm(null); });
    Array.prototype.forEach.call(root.querySelectorAll("[data-edit]"), function (b) {
      b.addEventListener("click", function () { showArticolForm(b.getAttribute("data-edit")); });
    });
    Array.prototype.forEach.call(root.querySelectorAll("[data-del]"), function (b) {
      b.addEventListener("click", function () {
        var slug = b.getAttribute("data-del");
        if (!confirm("Ștergi articolul \"" + slug + "\"? Se șterg și conținutul, poza și întrebările asociate.")) return;
        saveComanda({ op: "delete_articol", slug: slug });
        DATA.articole = DATA.articole.filter(function (a) { return a.slug !== slug; });
        renderArticole();
      });
    });
  }

  function colorFor(catNume) {
    var c = DATA.categorii.filter(function (x) { return x.nume === catNume; })[0];
    return c ? c.culoare : "#5F6368";
  }

  function showArticolForm(slug) {
    var a = slug ? DATA.articole.filter(function (x) { return x.slug === slug; })[0] : null;
    var slot = document.getElementById("articol-form-slot");
    slot.innerHTML =
      '<div class="form-card">' +
      '<div class="form-row"><label>Titlu</label><input type="text" id="f-titlu" value="' + esc(a ? a.titlu : "") + '"></div>' +
      '<div class="form-row-grid">' +
      '<div><label>Categorie</label><select id="f-cat">' + catOptions(a ? a.cat : "") + '</select></div>' +
      '<div><label>Tip</label><select id="f-tip"><option' + (a && a.tip === "Agregat" ? " selected" : "") + '>Agregat</option><option' + (a && a.tip === "Propriu" ? " selected" : "") + '>Propriu</option></select></div>' +
      '</div>' +
      '<div class="form-row-grid">' +
      '<div><label>Sursă (nume)</label><input type="text" id="f-sursa" value="' + esc(a ? a.sursa : "") + '"></div>' +
      '<div><label>URL sursă</label><input type="text" id="f-url" value="' + esc(a ? a.url : "") + '"></div>' +
      '</div>' +
      '<div class="form-row-grid">' +
      '<div><label>Dată (AAAA-LL-ZZ)</label><input type="text" id="f-data" value="' + esc(a ? a.data : "") + '" placeholder="2026-08-09"></div>' +
      '<div><label>Sponsorizat</label><select id="f-sponsor"><option value="Nu"' + (a && !a.sponsorizat ? " selected" : "") + '>Nu</option><option value="Da"' + (a && a.sponsorizat ? " selected" : "") + '>Da</option></select></div>' +
      '</div>' +
      '<div class="form-row"><label>Etichete (separate prin virgulă)</label><input type="text" id="f-etichete" value="' + esc(a ? a.etichete.join(", ") : "") + '"></div>' +
      '<div class="form-row"><label>Conținut articol' + (a ? " — completează doar dacă vrei să-l suprascrii" : "") + '</label><textarea id="f-continut" placeholder="Primul rând = titlu, rând gol, apoi paragrafe separate prin rând gol."></textarea>' +
      '<p class="hint">Gol la un articol nou → rămâne „În așteptare" pe site, fără conținut fabricat.</p></div>' +
      '<div class="form-actions"><button class="btn-primary" id="save-articol">Salvează</button><button class="btn-ghost" id="cancel-articol">Anulează</button></div>' +
      '</div>';

    document.getElementById("cancel-articol").addEventListener("click", function () { slot.innerHTML = ""; });
    document.getElementById("save-articol").addEventListener("click", function () {
      var payload = {
        op: slug ? "edit_articol" : "add_articol",
        slug: slug || undefined,
        titlu: document.getElementById("f-titlu").value.trim(),
        categorie: document.getElementById("f-cat").value,
        tip: document.getElementById("f-tip").value,
        sursa: document.getElementById("f-sursa").value.trim(),
        url: document.getElementById("f-url").value.trim(),
        data: document.getElementById("f-data").value.trim(),
        sponsorizat: document.getElementById("f-sponsor").value,
        etichete: document.getElementById("f-etichete").value.trim(),
        continut: document.getElementById("f-continut").value
      };
      if (!payload.titlu || !payload.categorie) { toast("Titlul și categoria sunt obligatorii."); return; }
      saveComanda(payload);
      slot.innerHTML = "";
      toast("Comandă salvată — rulează apply_admin_comenzi.py.");
    });
  }

  // ---------- INTREBARI ----------
  function renderIntrebari() {
    var filtered = state.filtroArticolSlug ? DATA.intrebari.filter(function (q) { return q.slug === state.filtroArticolSlug; }) : DATA.intrebari;
    var rows = filtered.map(function (q, i) {
      return '<tr><td>' + esc(articolTitlu(q.slug)) + '</td><td>' + esc(q.intrebare) + '</td><td>' + esc(q.raspuns) + '</td>' +
        '<td class="actions"><button class="btn-sm" data-edit="' + q.row + '">Editează</button><button class="btn-sm btn-danger" data-del="' + q.row + '">Șterge</button></td></tr>';
    }).join("");
    root.innerHTML =
      '<div class="panel-head"><h2>Întrebări (Q&amp;A per articol)</h2><button class="btn-primary" id="add-intrebare">+ Întrebare nouă</button></div>' +
      '<div class="form-row" style="max-width:420px;"><label>Filtrează după articol</label><select id="filtro-articol"><option value="">— toate —</option>' + articolOptions(state.filtroArticolSlug) + '</select></div>' +
      '<div id="intrebare-form-slot"></div>' +
      '<table class="admin-table"><thead><tr><th>Articol</th><th>Întrebare</th><th>Răspuns</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';

    document.getElementById("filtro-articol").addEventListener("change", function (e) { state.filtroArticolSlug = e.target.value; renderIntrebari(); });
    document.getElementById("add-intrebare").addEventListener("click", function () { showIntrebareForm(null); });
    Array.prototype.forEach.call(root.querySelectorAll("[data-edit]"), function (b) {
      b.addEventListener("click", function () { showIntrebareForm(parseInt(b.getAttribute("data-edit"), 10)); });
    });
    Array.prototype.forEach.call(root.querySelectorAll("[data-del]"), function (b) {
      b.addEventListener("click", function () {
        var row = parseInt(b.getAttribute("data-del"), 10);
        if (!confirm("Ștergi această întrebare?")) return;
        saveComanda({ op: "delete_intrebare", row: row });
        DATA.intrebari = DATA.intrebari.filter(function (q) { return q.row !== row; });
        renderIntrebari();
      });
    });
  }
  function articolTitlu(slug) {
    var a = DATA.articole.filter(function (x) { return x.slug === slug; })[0];
    return a ? a.titlu : slug;
  }
  function showIntrebareForm(row) {
    var q = row ? DATA.intrebari.filter(function (x) { return x.row === row; })[0] : null;
    var slot = document.getElementById("intrebare-form-slot");
    slot.innerHTML =
      '<div class="form-card">' +
      '<div class="form-row"><label>Articol</label><select id="q-slug">' + articolOptions(q ? q.slug : state.filtroArticolSlug) + '</select></div>' +
      '<div class="form-row"><label>Întrebare</label><input type="text" id="q-intrebare" value="' + esc(q ? q.intrebare : "") + '"></div>' +
      '<div class="form-row"><label>Răspuns</label><textarea id="q-raspuns">' + esc(q ? q.raspuns : "") + '</textarea></div>' +
      '<div class="form-actions"><button class="btn-primary" id="save-intrebare">Salvează</button><button class="btn-ghost" id="cancel-intrebare">Anulează</button></div>' +
      '</div>';
    document.getElementById("cancel-intrebare").addEventListener("click", function () { slot.innerHTML = ""; });
    document.getElementById("save-intrebare").addEventListener("click", function () {
      var payload = {
        op: row ? "edit_intrebare" : "add_intrebare",
        row: row || undefined,
        slug: document.getElementById("q-slug").value,
        intrebare: document.getElementById("q-intrebare").value.trim(),
        raspuns: document.getElementById("q-raspuns").value.trim()
      };
      if (!payload.intrebare || !payload.raspuns) { toast("Completează întrebarea și răspunsul."); return; }
      saveComanda(payload);
      slot.innerHTML = "";
      toast("Comandă salvată — rulează apply_admin_comenzi.py.");
    });
  }

  // ---------- SURSE ----------
  function renderSurse() {
    var rows = DATA.surse.map(function (s) {
      return '<tr><td>' + esc(s.nume) + '</td><td>' + s.count + ' articole</td>' +
        '<td class="actions"><button class="btn-sm" data-rename="' + esc(s.nume) + '">Redenumește</button></td></tr>';
    }).join("");
    root.innerHTML =
      '<div class="panel-head"><h2>Surse</h2></div>' +
      '<p class="hint">Redenumirea unei surse actualizează automat toate articolele care o folosesc — util când aceeași sursă a fost scrisă puțin diferit de mai multe ori.</p>' +
      '<div id="sursa-form-slot"></div>' +
      '<table class="admin-table"><thead><tr><th>Sursă</th><th>Folosită în</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
    Array.prototype.forEach.call(root.querySelectorAll("[data-rename]"), function (b) {
      b.addEventListener("click", function () {
        var veche = b.getAttribute("data-rename");
        var slot = document.getElementById("sursa-form-slot");
        slot.innerHTML = '<div class="form-card"><div class="form-row"><label>Nume nou pentru "' + esc(veche) + '"</label><input type="text" id="sursa-noua" value="' + esc(veche) + '"></div>' +
          '<div class="form-actions"><button class="btn-primary" id="save-sursa">Salvează</button><button class="btn-ghost" id="cancel-sursa">Anulează</button></div></div>';
        document.getElementById("cancel-sursa").addEventListener("click", function () { slot.innerHTML = ""; });
        document.getElementById("save-sursa").addEventListener("click", function () {
          var noua = document.getElementById("sursa-noua").value.trim();
          if (!noua) { toast("Numele nu poate fi gol."); return; }
          saveComanda({ op: "rename_sursa", veche: veche, noua: noua });
          slot.innerHTML = "";
          toast("Comandă salvată — rulează apply_admin_comenzi.py.");
        });
      });
    });
  }

  // ---------- CATEGORII ----------
  function renderCategorii() {
    var rows = DATA.categorii.map(function (c) {
      return '<tr><td><span class="chip" style="background:' + c.culoare + '">' + esc(c.nume) + '</span></td><td>' + esc(c.descriere) + '</td><td>' + (c.exclusaHomepage ? "Da" : "Nu") + '</td>' +
        '<td class="actions"><button class="btn-sm" data-edit="' + esc(c.nume) + '">Editează</button><button class="btn-sm btn-danger" data-del="' + esc(c.nume) + '">Șterge</button></td></tr>';
    }).join("");
    root.innerHTML =
      '<div class="panel-head"><h2>Categorii</h2><button class="btn-primary" id="add-categorie">+ Categorie nouă</button></div>' +
      '<div id="categorie-form-slot"></div>' +
      '<table class="admin-table"><thead><tr><th>Nume</th><th>Descriere</th><th>Exclusă de pe homepage</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
    document.getElementById("add-categorie").addEventListener("click", function () { showCategorieForm(null); });
    Array.prototype.forEach.call(root.querySelectorAll("[data-edit]"), function (b) {
      b.addEventListener("click", function () { showCategorieForm(b.getAttribute("data-edit")); });
    });
    Array.prototype.forEach.call(root.querySelectorAll("[data-del]"), function (b) {
      b.addEventListener("click", function () {
        var nume = b.getAttribute("data-del");
        if (!confirm('Ștergi categoria "' + nume + '"? Refuzat automat dacă mai există articole publicate în ea.')) return;
        saveComanda({ op: "delete_categorie", nume: nume });
        toast("Comandă trimisă — dacă mai există articole în categorie, ștergerea va fi refuzată de script.");
      });
    });
  }
  function showCategorieForm(nume) {
    var c = nume ? DATA.categorii.filter(function (x) { return x.nume === nume; })[0] : null;
    var slot = document.getElementById("categorie-form-slot");
    slot.innerHTML =
      '<div class="form-card">' +
      '<div class="form-row"><label>Nume' + (nume ? " (schimbarea numelui actualizează toate articolele)" : "") + '</label><input type="text" id="c-nume" value="' + esc(c ? c.nume : "") + '"></div>' +
      '<div class="form-row-grid">' +
      '<div><label>Culoare</label><input type="color" id="c-culoare" value="' + esc(c ? c.culoare : "#12213A") + '"></div>' +
      '<div><label>Exclusă de pe homepage</label><select id="c-exclusa"><option value="nu"' + (c && !c.exclusaHomepage ? " selected" : "") + '>Nu</option><option value="da"' + (c && c.exclusaHomepage ? " selected" : "") + '>Da</option></select></div>' +
      '</div>' +
      '<div class="form-row"><label>Descriere (afișată pe pagina categoriei)</label><textarea id="c-descriere">' + esc(c ? c.descriere : "") + '</textarea></div>' +
      '<div class="form-actions"><button class="btn-primary" id="save-categorie">Salvează</button><button class="btn-ghost" id="cancel-categorie">Anulează</button></div>' +
      '</div>';
    document.getElementById("cancel-categorie").addEventListener("click", function () { slot.innerHTML = ""; });
    document.getElementById("save-categorie").addEventListener("click", function () {
      var payload = {
        op: nume ? "edit_categorie" : "add_categorie",
        numeVechi: nume || undefined,
        nume: document.getElementById("c-nume").value.trim(),
        culoare: document.getElementById("c-culoare").value,
        exclusaHomepage: document.getElementById("c-exclusa").value === "da",
        descriere: document.getElementById("c-descriere").value.trim()
      };
      if (!payload.nume) { toast("Numele categoriei e obligatoriu."); return; }
      saveComanda(payload);
      slot.innerHTML = "";
      toast("Comandă salvată — rulează apply_admin_comenzi.py.");
    });
  }

  function renderAll() {
    renderTabs();
    if (state.tab === "stare") renderStare();
    else if (state.tab === "articole") renderArticole();
    else if (state.tab === "intrebari") renderIntrebari();
    else if (state.tab === "surse") renderSurse();
    else if (state.tab === "categorii") renderCategorii();
    else if (state.tab === "setari") renderSetari();
  }

  renderAll();
})();
