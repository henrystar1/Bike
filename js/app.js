/* =============================================================================
   CUBE Nuroad Bike Builder 3D – Anwendungslogik
   Keine KI, keine externe API, keine Datenbank. Alle Daten liegen lokal.
============================================================================= */
(function () {
  'use strict';

  var BIKES = window.CUBE_BIKES;
  var ACCS = window.CUBE_ACCESSORIES;
  var STORAGE_KEY = 'cube-nuroad-builder:v1';

  var state = { bikeId: BIKES[0].id, colorId: null, acc: [] };

  var viewer, M, current = { bike: null, accGroups: {} };

  var $ = function (id) { return document.getElementById(id); };

  function fmt(v) {
    return v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
  function bikeById(id) { return BIKES.filter(function (b) { return b.id === id; })[0]; }
  function accById(id) { return ACCS.filter(function (a) { return a.id === id; })[0]; }

  function currentBike() { return bikeById(state.bikeId); }
  function currentColor() {
    var b = currentBike();
    if (!b.colors.length) return null;
    return b.colors.filter(function (c) { return c.id === state.colorId; })[0] || b.colors[0];
  }

  function isCompatible(a, bikeId) {
    return a.compatible === '*' || a.compatible.indexOf(bikeId) !== -1;
  }
  /* Serienmaessig verbautes Zubehoer (Fully-Equipped-Modelle) */
  function isStock(accId) {
    var b = currentBike();
    return !!(b.includedAccessories && b.includedAccessories.indexOf(accId) !== -1);
  }
  function isActive(accId) {
    return isStock(accId) || state.acc.indexOf(accId) !== -1;
  }

  /* ------------------------------ 3D-Aufbau ------------------------------ */

  function bikeConfigFor(b) {
    var spec = b.spec || {};
    var text = JSON.stringify(spec);
    var dt = b.drivetrain || {};
    return {
      profile: b.geometry === 'hpa' ? 'hpa' : 'superlite',
      carbonFork: false,   // Nuroad-Gabeln sind lackiert (Farbwert forkHex aus den Farbdaten)
      chainrings: dt.chainrings,
      cassette: dt.cassette,
      rotorRadius: /180\/180/.test(text) ? 0.09 : 0.08,
      tireWidth: 0.045
    };
  }

  function applyColors() {
    var c = currentColor();
    if (c) {
      M.paint.color.set(c.hex);
      M.paintAccent.color.set(c.accent || c.hex);
      M.fork.color.set(c.forkHex || '#1a1c1f');
    } else {
      // Keine offiziellen Farben hinterlegt -> neutrale Darstellung, nichts erfunden.
      M.paint.color.set('#8b9299');
      M.paintAccent.color.set('#5c646c');
      M.fork.color.set('#2a2d31');
    }
  }

  function rebuildBike() {
    viewer.clearRoot();
    current.accGroups = {};
    var b = currentBike();
    applyColors();
    current.bike = CubeBikeBuilder.build(M, bikeConfigFor(b));
    viewer.root.add(current.bike.group);
    // Serienzubehoer sofort mit aufbauen
    (b.includedAccessories || []).forEach(function (id) { addAccessoryMesh(id, false); });
    state.acc.forEach(function (id) { addAccessoryMesh(id, false); });
  }

  function addAccessoryMesh(id, animate) {
    if (current.accGroups[id]) return;
    var acc = accById(id);
    var g = CubeAccessoryBuilder.build(id, M, current.bike.mounts, { color: acc && acc.color });
    if (!g) return;
    viewer.root.add(g);
    current.accGroups[id] = g;
    if (animate) {
      var t0 = performance.now();
      g.scale.setScalar(0.001);
      (function step(now) {
        var t = Math.min(1, (now - t0) / 320);
        var e = 1 - Math.pow(1 - t, 3);
        g.scale.setScalar(0.001 + e * 0.999);
        if (t < 1) requestAnimationFrame(step);
      })(t0);
    }
  }

  function removeAccessoryMesh(id) {
    var g = current.accGroups[id];
    if (!g) return;
    var t0 = performance.now();
    (function step(now) {
      var t = Math.min(1, (now - t0) / 200);
      g.scale.setScalar(Math.max(0.001, 1 - t));
      if (t < 1) { requestAnimationFrame(step); }
      else {
        viewer.root.remove(g);
        g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
      }
    })(t0);
    delete current.accGroups[id];
  }

  /* --------------------- Animation, Kette, Schaltung --------------------- */

  var anim = { running: false, cadence: 70 };

  function drivetrain() { return current.bike && current.bike.drivetrain; }

  function updateGearHud() {
    var d = drivetrain();
    if (!d) return;
    var ring = d.gearing.chainrings[d.state.front];
    var cog = d.gearing.cassette[d.state.rear];
    var wheelOmega = (anim.cadence * 2 * Math.PI / 60) * (ring / cog);
    var kmh = wheelOmega * 0.352 * 3.6;
    $('gearRatio').textContent = ring + 'T \u00d7 ' + cog + 'T';
    var gearNo = d.state.rear + 1;   // Gang 1 = groesstes Ritzel
    $('gearSpeed').textContent = 'Gang ' + gearNo + '/' + d.gearing.cassette.length +
      ' \u00b7 ' + kmh.toFixed(1).replace('.', ',') + ' km/h';
    $('cadValue').textContent = anim.cadence;
  }

  function vChainOf(d, w) { return w * d.ringRadius(); }

  function animate(dt) {
    var d = drivetrain();
    if (!d || !anim.running) return;
    var w = anim.cadence * 2 * Math.PI / 60;          // Kurbel-Winkelgeschwindigkeit
    d.crank.rotation.z -= w * dt;
    d.crank.children.forEach(function (c) {
      if (c.userData.keepLevel) c.rotation.z = -d.crank.rotation.z;   // Pedale bleiben waagerecht
    });
    var wheelOmega = w * d.ratio();
    current.bike.rearWheel.rotation.z -= wheelOmega * dt;
    current.bike.frontWheel.rotation.z -= wheelOmega * dt;
    d.cassette.rotation.z -= wheelOmega * dt;
    var pulleyOmega = vChainOf(d, w) / 0.0165;
    d.pulleys.forEach(function (p) { p.rotation.z -= pulleyOmega * dt; });
    var vChain = vChainOf(d, w);
    d.chain.advance(-(vChain * dt) / d.chain.length);
    // Speichen werden bei hoher Drehzahl unschaerfer, sonst entsteht ein Stroboskop-Effekt
    M.spoke.opacity = Math.max(0.22, Math.min(1, 1 - (Math.abs(wheelOmega) - 12) / 34));
  }

  function shift(which, dir) {
    var d = drivetrain();
    if (!d) return;
    if (which === 'front' && d.gearing.chainrings.length < 2) {
      toast('Dieses Modell hat einen 1-fach-Antrieb – kein Umwerfer vorhanden.');
      return;
    }
    if (d.shift(which, dir)) {
      updateGearHud();
    } else {
      toast(dir > 0 ? 'Größter Gang erreicht.' : 'Kleinster Gang erreicht.');
    }
  }

  function bindShifting() {
    var ray = new THREE.Raycaster();
    var v2 = new THREE.Vector2();
    var el = viewer.renderer.domElement;

    function pick(e) {
      if (!current.bike || !current.bike.shifters) return null;
      var r = el.getBoundingClientRect();
      v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(v2, viewer.camera);
      var hits = ray.intersectObjects(current.bike.shifters, false);
      return hits.length ? hits[0].object.userData.shifter : null;
    }

    el.addEventListener('pointerdown', function (e) {
      var which = pick(e);
      if (!which) return;
      e.preventDefault();
      e.stopPropagation();
      shift(which, e.button === 2 ? -1 : 1);
    }, true);

    el.addEventListener('contextmenu', function (e) {
      if (pick(e)) e.preventDefault();
    });

    el.addEventListener('pointermove', function (e) {
      el.style.cursor = pick(e) ? 'pointer' : '';
    });
  }

  /* ------------------------------- Preise -------------------------------- */

  function priceSummary() {
    var b = currentBike();
    var items = [], sum = 0, unknown = 0;
    state.acc.forEach(function (id) {
      var a = accById(id);
      if (!a) return;
      items.push(a);
      if (typeof a.price === 'number') sum += a.price; else unknown++;
    });
    var base = typeof b.price === 'number' ? b.price : null;
    return {
      bike: b, base: base, items: items,
      accSum: sum, unknownCount: unknown,
      total: base === null ? null : base + sum
    };
  }

  function weightSummary() {
    var b = currentBike();
    var known = b.weightKg !== null ? b.weightKg * 1000 : null;
    var accKnown = 0, accUnknown = 0;
    state.acc.forEach(function (id) {
      var a = accById(id);
      if (a && typeof a.weightG === 'number') accKnown += a.weightG; else accUnknown++;
    });
    return { base: known, accKnown: accKnown, accUnknown: accUnknown };
  }

  /* ---------------------------- UI: Fahrräder ---------------------------- */

  function renderBikes() {
    var host = $('bikeList');
    host.innerHTML = '';
    BIKES.forEach(function (b) {
      var el = document.createElement('div');
      el.className = 'bike-item' + (b.id === state.bikeId ? ' active' : '');
      var price = typeof b.price === 'number'
        ? '<span class="bi-price">' + fmt(b.price) + '</span>'
        : '<span class="bi-price na">Preis nicht hinterlegt</span>';
      var flag = b.dataStatus === 'verified'
        ? '<span class="flag ok">Ausstattung belegt</span>'
        : b.dataStatus === 'partial'
          ? '<span class="flag warn">teilweise belegt</span>'
          : '<span class="flag warn">MY' + b.year + ' – Daten offen</span>';
      el.innerHTML =
        '<div class="bi-row"><span class="bi-name">' + b.model + '</span>' + price + '</div>' +
        '<div class="bi-row"><span class="bi-year">' + b.year + ' · ' + b.series + '</span></div>' +
        flag;
      el.onclick = function () { selectBike(b.id); };
      host.appendChild(el);
    });
  }

  function selectBike(id) {
    state.bikeId = id;
    var b = currentBike();
    state.colorId = b.colors.length ? b.colors[0].id : null;
    // inkompatibles Zubehoer entfernen
    state.acc = state.acc.filter(function (a) {
      var acc = accById(a);
      return acc && isCompatible(acc, id) && !isStock(a);
    });
    rebuildBike();
    renderAll();
    updateGearHud();
  }

  /* ------------------------------ UI: Farben ----------------------------- */

  function renderColors() {
    var host = $('colorList');
    var b = currentBike();
    host.innerHTML = '';
    if (!b.colors.length) {
      $('colorHint').textContent = b.colorNote || 'Für dieses Modell sind keine Farben hinterlegt.';
      return;
    }
    $('colorHint').textContent = 'Farbwerte in der 3D-Ansicht sind visuelle Annäherungen an die CUBE-Farbbezeichnung.';
    b.colors.forEach(function (c) {
      var el = document.createElement('div');
      el.className = 'color-chip' + (c.id === (currentColor() || {}).id ? ' active' : '');
      el.innerHTML = '<span class="swatch" style="--c1:' + c.hex + ';--c2:' + (c.accent || c.hex) + '"></span>' +
        '<span>' + c.name + '</span>';
      el.onclick = function () {
        state.colorId = c.id;
        applyColors();
        renderColors();
        renderSummary();
      };
      host.appendChild(el);
    });
  }

  /* ----------------------------- UI: Zubehör ----------------------------- */

  function blockedReason(a) {
    if (!isCompatible(a, state.bikeId)) {
      return 'Für dieses Fahrrad nicht verfügbar.' + (a.incompatibleNote ? ' ' + a.incompatibleNote : '');
    }
    if (isStock(a.id)) return 'Serienmäßig enthalten (Fully Equipped).';
    var conflict = (a.conflicts || []).filter(function (c) { return isActive(c); })[0];
    if (conflict) {
      var ca = accById(conflict);
      return 'Nicht kombinierbar mit „' + (ca ? ca.name : conflict) + '“.' +
        (a.conflictNote ? ' ' + a.conflictNote : '');
    }
    var req = a.requires || [];
    var missing = a.requiresAny
      ? (req.some(function (r) { return isActive(r); }) ? null : req[0])
      : req.filter(function (r) { return !isActive(r); })[0];
    if (missing) {
      var ra = accById(missing);
      return 'Benötigt zuerst „' + (ra ? ra.name : missing) + '“.';
    }
    return null;
  }

  function renderAccessories() {
    var host = $('accessoryList');
    host.innerHTML = '';
    var cats = [];
    ACCS.forEach(function (a) { if (cats.indexOf(a.category) === -1) cats.push(a.category); });

    cats.forEach(function (cat) {
      var h = document.createElement('div');
      h.className = 'acc-cat';
      h.textContent = cat.toUpperCase();
      host.appendChild(h);

      ACCS.filter(function (a) { return a.category === cat; }).forEach(function (a) {
        var reason = blockedReason(a);
        var on = isActive(a.id);
        var blocked = !!reason && !on;
        var el = document.createElement('div');
        el.className = 'acc-item' + (on ? ' on' : '') + (blocked ? ' off' : '');

        var priceHtml = isStock(a.id)
          ? '<span class="acc-price na">inklusive</span>'
          : typeof a.price === 'number'
            ? '<span class="acc-price">' + fmt(a.price) + '</span>'
            : '<span class="acc-price na">Preis n. h.</span>';

        el.innerHTML =
          '<span class="acc-box"></span>' +
          '<span class="acc-main"><span class="acc-name">' + a.name + '</span>' +
          '<span class="acc-sub">' + (reason || a.description) + '</span></span>' +
          priceHtml +
          '<button class="acc-info" title="Produktinformationen">ⓘ</button>';

        el.querySelector('.acc-info').onclick = function (ev) {
          ev.stopPropagation();
          showAccessoryInfo(a);
        };
        el.onclick = function () {
          if (isStock(a.id)) { toast('Dieses Teil ist bei diesem Modell serienmäßig verbaut.'); return; }
          if (blocked) { toast(reason); return; }
          toggleAccessory(a.id);
        };
        host.appendChild(el);
      });
    });
  }

  function toggleAccessory(id) {
    var i = state.acc.indexOf(id);
    if (i === -1) {
      state.acc.push(id);
      addAccessoryMesh(id, true);
    } else {
      state.acc.splice(i, 1);
      removeAccessoryMesh(id);
      // abhaengiges Zubehoer mit entfernen
      ACCS.forEach(function (a) {
        var req = a.requires || [];
        var stillOk = a.requiresAny && req.some(function (r) { return r !== id && isActive(r); });
        if (req.indexOf(id) !== -1 && !stillOk && state.acc.indexOf(a.id) !== -1) {
          state.acc.splice(state.acc.indexOf(a.id), 1);
          removeAccessoryMesh(a.id);
        }
      });
    }
    renderAll();
  }

  /* ------------------------- UI: Rechte Übersicht ------------------------ */

  function renderSummary() {
    var b = currentBike();
    var c = currentColor();
    var s = priceSummary();

    $('sumTitle').textContent = b.model + ' ' + b.year;
    $('sumMeta').innerHTML = b.series + (c ? ' · <b>' + c.name + '</b>' : ' · Farbe nicht hinterlegt') +
      (c && c.articleNo ? ' · Art.-Nr. ' + c.articleNo : '');
    $('btnBikePage').href = (c && c.url) || b.url;

    var t = $('priceTable');
    t.innerHTML = '';
    var row = document.createElement('div');
    row.className = 'price-row base';
    row.innerHTML = '<span>Grundpreis</span>' + (s.base === null
      ? '<span class="na">nicht hinterlegt</span>' : '<b>' + fmt(s.base) + '</b>');
    t.appendChild(row);

    s.items.forEach(function (a) {
      var r = document.createElement('div');
      r.className = 'price-row';
      r.innerHTML = '<span>' + a.name + '</span>' + (typeof a.price === 'number'
        ? '<b>' + fmt(a.price) + '</b>' : '<span class="na">Preis n. h.</span>');
      t.appendChild(r);
    });
    if (b.includedAccessories) {
      var r2 = document.createElement('div');
      r2.className = 'price-row';
      r2.innerHTML = '<span>Serienzubehör (Schutzbleche, Träger, Ständer, Licht)</span><b>inklusive</b>';
      t.appendChild(r2);
    }

    $('totalPrice').textContent = s.total === null ? '—' : fmt(s.total);
    var hints = [];
    if (s.base === null) hints.push(b.priceNote);
    else if (!b.priceVerified) hints.push('Grundpreis: ' + b.priceNote);
    if (s.unknownCount) hints.push(s.unknownCount + ' gewähltes Zubehörteil ohne hinterlegten Preis ist im Gesamtpreis nicht enthalten.');
    $('priceHint').textContent = hints.join(' ');

    var w = weightSummary();
    var wtxt;
    if (w.base === null) {
      wtxt = 'Herstellergewicht nicht offiziell angegeben' + (b.weightNote ? ' – ' + b.weightNote : '');
    } else {
      wtxt = ((w.base + w.accKnown) / 1000).toFixed(2).replace('.', ',') + ' kg';
      if (w.accUnknown) wtxt += ' (ohne ' + w.accUnknown + ' Zubehörteile ohne Gewichtsangabe)';
    }
    $('weightValue').textContent = wtxt;

    var st = $('specTable');
    st.innerHTML = '';
    Object.keys(b.spec).forEach(function (k) {
      var r = document.createElement('div');
      r.className = 'spec-row';
      r.innerHTML = '<span>' + k + '</span><b>' + b.spec[k] + '</b>';
      st.appendChild(r);
    });

    $('stageBadge').textContent = b.model + ' ' + b.year + (c ? ' · ' + c.name : '') +
      (state.acc.length ? ' · ' + state.acc.length + ' Zubehörteile' : '');
  }

  function renderAll() {
    renderBikes(); renderColors(); renderAccessories(); renderSummary();
  }

  /* -------------------------------- Modals ------------------------------- */

  function openModal(html) {
    $('modalBody').innerHTML = html;
    $('modal').hidden = false;
  }
  $('modalClose').onclick = function () { $('modal').hidden = true; };
  $('modal').onclick = function (e) { if (e.target === $('modal')) $('modal').hidden = true; };

  function showAccessoryInfo(a) {
    var price = typeof a.price === 'number'
      ? fmt(a.price) + ' <small>(' + a.priceType + ')</small>'
      : 'kein belegbarer Preis hinterlegt' + (a.priceNote ? ' – ' + a.priceNote : '');
    openModal(
      '<h2>' + a.name + '</h2>' +
      '<p>' + a.description + '</p>' +
      '<table>' +
      '<tr><td>Marke</td><td>' + a.brand + '</td></tr>' +
      (a.articleNo ? '<tr><td>Artikelnummer</td><td>' + a.articleNo + '</td></tr>' : '') +
      '<tr><td>Preis</td><td>' + price + '</td></tr>' +
      '<tr><td>Kompatibilität</td><td>' + (a.compatible === '*' ? 'alle hinterlegten Nuroad-Modelle'
        : a.compatible.map(function (id) { var b = bikeById(id); return b ? b.model + ' ' + b.year : id; }).join('<br>')) + '</td></tr>' +
      '<tr><td>Montageposition</td><td>' + a.mount + '</td></tr>' +
      '</table>' +
      '<p style="margin-top:16px"><a class="btn primary" href="' + a.url + '" target="_blank" rel="noopener">Artikel bei CUBE öffnen</a></p>' +
      '<p class="hint">Der Link führt auf die offizielle CUBE-Produkt- bzw. Kategorieseite.</p>'
    );
  }

  function showConfiguration() {
    var b = currentBike(), c = currentColor(), s = priceSummary(), w = weightSummary();
    var rows = s.items.map(function (a) {
      return '<tr><td><a href="' + a.url + '" target="_blank" rel="noopener">' + a.name + '</a></td><td>' +
        (typeof a.price === 'number' ? fmt(a.price) : 'n. h.') + '</td></tr>';
    }).join('');
    openModal(
      '<h2>Meine Konfiguration</h2>' +
      '<table>' +
      '<tr><td>Fahrrad</td><td>' + b.model + '</td></tr>' +
      '<tr><td>Modelljahr</td><td>' + b.year + '</td></tr>' +
      '<tr><td>Farbe</td><td>' + (c ? c.name : 'nicht hinterlegt') + '</td></tr>' +
      '<tr><td>Grundpreis</td><td>' + (s.base === null ? 'n. h.' : fmt(s.base)) + '</td></tr>' +
      (b.includedAccessories ? '<tr><td>Serienzubehör</td><td>inklusive</td></tr>' : '') +
      rows +
      '<tr><td><b>Gesamtpreis</b></td><td><b>' + (s.total === null ? '—' : fmt(s.total)) + '</b></td></tr>' +
      '<tr><td>Gewicht</td><td>' + (w.base === null ? 'n. h.' : ((w.base + w.accKnown) / 1000).toFixed(2).replace('.', ',') + ' kg') + '</td></tr>' +
      '</table>' +
      '<p style="margin-top:14px"><a class="btn" href="' + ((c && c.url) || b.url) + '" target="_blank" rel="noopener">CUBE Produktseite</a></p>' +
      '<p class="hint">Preisstand der Recherche: ' + window.CUBE_BIKES_META.researchedAt + '. ' +
      window.CUBE_BIKES_META.disclaimer + '</p>'
    );
  }

  function showCompare() {
    var rows = BIKES.map(function (b) {
      return '<tr><td>' + b.model + ' ' + b.year + '<br><small style="color:var(--text-dim)">' + b.series + '</small></td><td>' +
        (typeof b.price === 'number' ? fmt(b.price) : 'n. h.') + '<br><small style="color:var(--text-dim)">' +
        (b.weightKg ? b.weightKg.toFixed(1).replace('.', ',') + ' kg' : 'Gewicht n. h.') + '</small></td></tr>';
    }).join('');
    openModal('<h2>Preisvergleich der hinterlegten Modelle</h2><table>' + rows + '</table>' +
      '<p class="hint">„n. h.“ = kein belegbarer Wert hinterlegt. Es werden bewusst keine Preise geschätzt.</p>');
  }

  /* ------------------------ Speichern / Laden / Export ------------------- */

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.hidden = true; }, 3200);
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      toast('Konfiguration im Browser gespeichert.');
    } catch (e) { toast('Speichern nicht möglich: ' + e.message); }
  }
  function loadConfig() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { toast('Keine gespeicherte Konfiguration gefunden.'); return; }
      applyState(JSON.parse(raw));
      toast('Konfiguration geladen.');
    } catch (e) { toast('Laden fehlgeschlagen: ' + e.message); }
  }
  function applyState(s) {
    if (!s || !bikeById(s.bikeId)) { toast('Konfiguration passt nicht zu den hinterlegten Daten.'); return; }
    state.bikeId = s.bikeId;
    state.colorId = s.colorId;
    state.acc = (s.acc || []).filter(function (id) {
      var a = accById(id);
      return a && isCompatible(a, state.bikeId);
    });
    rebuildBike();
    renderAll();
  }
  function exportConfig() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cube-nuroad-konfiguration.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function importConfig(file) {
    var fr = new FileReader();
    fr.onload = function () {
      try { applyState(JSON.parse(fr.result)); toast('Konfiguration importiert.'); }
      catch (e) { toast('Datei konnte nicht gelesen werden.'); }
    };
    fr.readAsText(file);
  }

  /* ------------------------------ Screenshot ----------------------------- */

  function screenshot() {
    var src = viewer.renderer.domElement;
    viewer.renderer.render(viewer.scene, viewer.camera);
    var b = currentBike(), c = currentColor(), s = priceSummary();

    var pad = 26, barH = 92;
    var cv = document.createElement('canvas');
    cv.width = src.width; cv.height = src.height + barH * (src.width / 1000);
    var g = cv.getContext('2d');
    var scale = src.width / 1000;
    g.fillStyle = document.body.classList.contains('theme-light') ? '#eef1f5' : '#0b0d10';
    g.fillRect(0, 0, cv.width, cv.height);
    g.drawImage(src, 0, 0);

    var y = src.height + 34 * scale;
    g.fillStyle = document.body.classList.contains('theme-light') ? '#131720' : '#e8edf2';
    g.font = 'bold ' + (22 * scale) + 'px Segoe UI, sans-serif';
    g.fillText(b.model + ' ' + b.year, pad * scale, y);
    g.font = (15 * scale) + 'px Segoe UI, sans-serif';
    g.fillStyle = '#97a1ad';
    g.fillText((c ? c.name : 'Farbe nicht hinterlegt') +
      (s.items.length ? ' · ' + s.items.map(function (a) { return a.name; }).join(', ') : ' · ohne Zubehör'),
      pad * scale, y + 24 * scale);
    if (s.total !== null) {
      g.textAlign = 'right';
      g.fillStyle = document.body.classList.contains('theme-light') ? '#131720' : '#e8edf2';
      g.font = 'bold ' + (22 * scale) + 'px Segoe UI, sans-serif';
      g.fillText(fmt(s.total), cv.width - pad * scale, y);
      g.textAlign = 'left';
    }

    var a = document.createElement('a');
    a.href = cv.toDataURL('image/png');
    a.download = 'cube-nuroad-' + b.id + (c ? '-' + c.id : '') + '.png';
    a.click();
    toast('Screenshot gespeichert.');
  }

  /* --------------------------- Kaufen / Links ---------------------------- */

  function openAll() {
    var b = currentBike(), c = currentColor();
    var urls = [(c && c.url) || b.url].concat(state.acc.map(function (id) {
      var a = accById(id); return a ? a.url : null;
    }).filter(Boolean));
    urls.forEach(function (u, i) {
      setTimeout(function () { window.open(u, '_blank', 'noopener'); }, i * 220);
    });
    toast(urls.length + ' CUBE-Seite(n) geöffnet. Ein direktes Befüllen des CUBE-Warenkorbs ist technisch nicht möglich.');
  }

  /* -------------------------------- Start -------------------------------- */

  function bindUI() {
    document.querySelectorAll('.tool[data-view]').forEach(function (btn) {
      btn.onclick = function () {
        document.querySelectorAll('.tool[data-view]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        viewer.root.rotation.y = 0;
        viewer.setView(btn.dataset.view);
      };
    });
    $('btnAnim').onclick = function () {
      anim.running = !anim.running;
      this.classList.toggle('active', anim.running);
      this.textContent = anim.running ? '⏸ Animation' : '▶ Animation';
      if (!anim.running) M.spoke.opacity = 1;
      updateGearHud();
    };
    $('cadUp').onclick = function () { anim.cadence = Math.min(120, anim.cadence + 5); updateGearHud(); };
    $('cadDown').onclick = function () { anim.cadence = Math.max(40, anim.cadence - 5); updateGearHud(); };
    $('btnAutoRotate').onclick = function () {
      viewer.autoRotate = !viewer.autoRotate;
      this.classList.toggle('active', viewer.autoRotate);
    };
    $('btnResetCam').onclick = function () {
      viewer.root.rotation.y = 0;
      viewer.autoRotate = false;
      $('btnAutoRotate').classList.remove('active');
      viewer.setView('threequarter');
    };
    $('btnShot').onclick = screenshot;
    $('btnConfig').onclick = showConfiguration;
    $('btnCompare').onclick = showCompare;
    $('btnBuyAll').onclick = openAll;
    $('btnSave').onclick = saveConfig;
    $('btnLoad').onclick = loadConfig;
    $('btnExport').onclick = exportConfig;
    $('btnImport').onclick = function () { $('fileImport').click(); };
    $('fileImport').onchange = function () { if (this.files[0]) importConfig(this.files[0]); this.value = ''; };
    $('btnReset').onclick = function () {
      state.acc = [];
      selectBike(BIKES[0].id);
      toast('Konfiguration zurückgesetzt.');
    };
    $('btnTheme').onclick = function () {
      var light = document.body.classList.toggle('theme-light');
      document.body.classList.toggle('theme-dark', !light);
      viewer.setBackground(!light);
    };
    $('btnFullscreen').onclick = function () {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    };
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') $('modal').hidden = true;
    });
  }

  function start() {
    if (!window.THREE) {
      document.body.innerHTML = '<p style="padding:40px;color:#fff">three.js konnte nicht geladen werden. ' +
        'Bitte prüfen, ob der Ordner <code>vendor/</code> vorhanden ist.</p>';
      return;
    }
    viewer = new CubeViewer($('viewport'));
    M = CubeMaterials.create();
    bindUI();
    viewer.updaters.push(animate);
    bindShifting();
    selectBike(state.bikeId);
    setTimeout(function () { viewer.resize(); }, 60);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
