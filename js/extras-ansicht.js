/* Triage (60 Sekunden stimmt/stimmt nicht) und Kitteltasche (Spickzettel zum Drucken). */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };
  var uhr = null;

  /* ---------- Triage ---------- */
  W.triageAnsicht = function (host) {
    if (uhr) { clearInterval(uhr); uhr = null; }
    var seite = h('div', { class: 'seite' });
    host.appendChild(seite);
    function start() {
      seite.innerHTML = '';
      seite.appendChild(h('h1', null, 'Triage'));
      seite.appendChild(h('p', { class: 'funk' }, h('span', { class: 'funk__wer' }, 'Dr. Brandt'), 'Sechzig Sekunden. Stimmt oder stimmt nicht. Nicht nachdenken, wissen.'));
      seite.appendChild(W.ansichten.karte('', h('p', null, 'Richtig gibt einen Punkt, falsch kostet einen. Raten lohnt sich also nicht. Fehler landen in der Wiedervorlage.'),
        h('p', { class: 'hinweis-klein' }, 'Bestwert: ', h('span', { class: 'mono' }, String(W.state.data.radar.best || 0)))));
      seite.appendChild(h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', onclick: runde }, 'Los')));
    }
    function runde() {
      // Nur Aussagen zu den Themen der Lehrerin und ihren Grundlagen; Zusatz bleibt draußen.
      var reihe = W.shuffle(W.triage.pool.map(function (a, i) { return i; }).filter(function (i) { return W.logic.stufe(W.triage.pool[i].fall) !== 'zusatz'; }));
      var pos = 0, richtig = 0, fehler = [], gesperrt = false;
      var ende = Date.now() + W.triage.DAUER * 1000;
      var zeit = h('span', { class: 'mono pruef-uhr' });
      var stand = h('span', { class: 'mono' }, '0');
      var aussage = h('p', { class: 'triage__aussage' });
      var blitz = h('div', { class: 'triage__karte' }, aussage);
      seite.innerHTML = '';
      function antwort(stimmt) {
        if (gesperrt) return;
        gesperrt = true;
        setTimeout(function () { gesperrt = false; }, 150);
        var i = reihe[pos % reihe.length];
        var a = W.triage.pool[i];
        var ok = a.stimmt === stimmt;
        if (ok) richtig++; else fehler.push(i);
        W.state.itemErgebnis('t-' + i, ok);
        if (ok && W.ton) W.ton.piep();
        blitz.classList.remove('triage__karte--ok', 'triage__karte--falsch');
        void blitz.offsetWidth;
        blitz.classList.add(ok ? 'triage__karte--ok' : 'triage__karte--falsch');
        stand.textContent = String(W.triage.punkte(richtig, fehler.length));
        pos++;
        zeige();
      }
      function zeige() { aussage.textContent = W.triage.pool[reihe[pos % reihe.length]].s; }
      seite.appendChild(h('div', { class: 'pruef-leiste' }, h('span', { class: 'hinweis-klein' }, 'Zeit'), zeit, h('span', { class: 'hinweis-klein' }, 'Punkte'), stand));
      seite.appendChild(blitz);
      seite.appendChild(h('div', { class: 'triage__knoepfe' },
        h('button', { type: 'button', class: 'btn triage__btn triage__btn--ja', onclick: function () { antwort(true); } }, 'Stimmt'),
        h('button', { type: 'button', class: 'btn triage__btn triage__btn--nein', onclick: function () { antwort(false); } }, 'Stimmt nicht')));
      zeige();
      function tick() {
        if (!document.body.contains(zeit)) { clearInterval(uhr); uhr = null; return; }
        var rest = Math.max(0, Math.ceil((ende - Date.now()) / 1000));
        zeit.textContent = Math.floor(rest / 60) + ':' + String(rest % 60).padStart(2, '0');
        if (rest <= 0) { clearInterval(uhr); uhr = null; auswertung(richtig, pos, fehler); }
      }
      tick();
      uhr = setInterval(tick, 250);
    }
    function auswertung(richtig, gesamt, fehler) {
      var punkte = W.triage.punkte(richtig, fehler.length);
      var neu = W.state.recordRadar(punkte);
      seite.innerHTML = '';
      seite.appendChild(h('h1', null, 'Triage'));
      seite.appendChild(W.ansichten.karte('auswertung', h('p', { class: 'ergebnis mono' }, String(punkte)),
        h('p', null, richtig + ' von ' + gesamt + ' richtig. Punkte = richtig minus falsch.' + (neu ? ' Neuer Bestwert.' : ''))));
      if (fehler.length) {
        seite.appendChild(h('h2', { class: 'zwischen' }, 'Daneben'));
        seite.appendChild(h('ul', { class: 'erkl-liste' }, fehler.map(function (i) {
          var a = W.triage.pool[i];
          return h('li', { class: 'karte' }, h('p', null, '„' + a.s + '“'), h('p', { class: 'hinweis-klein' }, h('strong', null, a.stimmt ? 'Stimmt. ' : 'Stimmt nicht. '), a.erkl));
        })));
      }
      seite.appendChild(h('div', { class: 'aktionen' }, h('a', { href: '#/', class: 'btn' }, 'Zum Board'), h('button', { type: 'button', class: 'btn btn--haupt', onclick: runde }, 'Nochmal')));
    }
    start();
  };

  /* ---------- Kitteltasche ---------- */
  W.kittelAnsicht = function (host) {
    var ab = W.kitteltasche.abschnitte(W.ansichten.faelle());
    host.appendChild(h('div', { class: 'seite kittel' },
      h('div', { class: 'kittel__kopf' },
        h('h1', null, 'Kitteltasche'),
        h('button', { type: 'button', class: 'btn btn--klein nicht-drucken', onclick: function () { window.print(); } }, 'Drucken')),
      h('p', { class: 'hinweis-klein nicht-drucken' }, 'Merksätze zu den Themen der Lehrerin und ihren Grundlagen, dazu Übersichten. Plus- und Zusatzinhalte sind nicht dabei.'),
      h('div', { class: 'kittel__abb' },
        h('figure', { class: 'abb' }, W.abb.zeichne('kreislauf', { beschriftet: true })),
        h('figure', { class: 'abb' }, W.abb.zeichne('alveole', { beschriftet: true, pfeile: 'gase' })),
        h('figure', { class: 'abb' }, W.abb.zeichne('atemwege', { beschriftet: true }))),
      h('div', { class: 'kittel__spalten' }, ab.map(function (a) {
        return h('section', { class: 'kittel__abschnitt' }, h('h2', null, a.titel),
          a.merk.length ? h('ul', null, a.merk.map(function (m) { return h('li', { html: m }); })) : null,
          a.extra ? h('div', { html: a.extra }) : null);
      }))));
  };
})();
