/* Nebenseiten: Formelkarte, Radarfalle (60 Sekunden stimmt/stimmt nicht) und Labor (Bewegungs-Simulator). */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };
  var uhr = null, tasten = null;

  /** Seite für etwas, das noch kommt: Titel, ein Satz, zurück zum Aktenschrank. */
  function folgt(host, titel, text) {
    host.appendChild(h('div', { class: 'seite' },
      h('div', { class: 'seitenkopf' }, h('p', { class: 'seitenkopf__ort mono' }, 'Folgt'), h('h1', null, titel)),
      W.ansichten.karte('', h('p', null, text),
        h('div', { class: 'aktionen' }, h('a', { href: '#/', class: 'btn btn--haupt' }, 'Zum Aktenschrank')))));
  }

  function kopf(ort, titel) {
    return h('div', { class: 'seitenkopf' }, h('p', { class: 'seitenkopf__ort mono' }, ort), h('h1', null, titel));
  }

  function aufhoeren() {
    if (uhr) { clearInterval(uhr); uhr = null; }
    if (tasten) { document.removeEventListener('keydown', tasten); tasten = null; }
  }

  /* ---------- Radarfalle ---------- */
  function radarfalle(host) {
    aufhoeren();
    var R = W.radar;
    var seite = h('div', { class: 'seite falle' });
    host.appendChild(seite);

    function start() {
      seite.innerHTML = '';
      seite.appendChild(kopf('Blitzrunde', 'Radarfalle'));
      seite.appendChild(W.ansichten.karte('',
        h('p', null, R.DAUER + ' Sekunden, eine Aussage nach der anderen, aus allen Akten: Stimmt sie oder stimmt sie nicht?'),
        h('p', null, h('strong', null, 'Wertung: '), 'Richtig gibt einen Punkt, falsch kostet einen. Nach einem Fehler steht die Erklärung zwei Sekunden lang da, die Uhr läuft weiter. Die Hälfte der Aussagen stimmt, Raten bringt also nichts.'),
        h('p', { class: 'hinweis-klein' }, 'Tastatur: Pfeil links = stimmt, Pfeil rechts = stimmt nicht. Fehler kommen in die Nachermittlung.'),
        h('p', { class: 'hinweis-klein' }, 'Bestwert: ', h('span', { class: 'mono' }, String(W.state.data.radar.best || 0)))));
      seite.appendChild(h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: runde }, 'Los')));
    }

    function runde() {
      aufhoeren();
      var reihe = [], pos = 0, richtig = 0, fehler = [], gesperrt = false, aktuell = -1;
      var ende = Date.now() + R.DAUER * 1000;
      var zeit = h('span', { class: 'mono pruef-uhr' });
      var stand = h('span', { class: 'mono falle__stand' }, '0');
      var aussage = h('p', { class: 'falle__aussage' });
      var erkl = h('p', { class: 'falle__erkl' });
      var karte = h('div', { class: 'falle__karte', 'aria-live': 'polite' }, h('div', null, aussage, erkl));
      var ja = h('button', { type: 'button', class: 'btn falle__btn falle__btn--ja', onclick: function () { antwort(true); } }, 'Stimmt');
      var nein = h('button', { type: 'button', class: 'btn falle__btn falle__btn--nein', onclick: function () { antwort(false); } }, 'Stimmt nicht');

      function naechste() {
        if (pos >= reihe.length) { reihe = W.shuffle(R.aussagen.map(function (a, i) { return i; })); pos = 0; }
        aktuell = reihe[pos++];
        aussage.textContent = R.aussagen[aktuell].text;
        erkl.textContent = '';
        karte.classList.remove('falle__karte--falsch');
        ja.disabled = nein.disabled = false;
      }
      function antwort(stimmt) {
        if (gesperrt || aktuell < 0) return;
        var i = aktuell, a = R.aussagen[i];
        var ok = a.stimmt === stimmt;
        if (ok) richtig++; else fehler.push(i);
        W.state.itemErgebnis('r:' + i, ok);
        if (ok && W.ton) W.ton.piep();
        stand.textContent = String(R.punkte(richtig, fehler.length));
        karte.classList.remove('falle__karte--ok');
        void karte.offsetWidth;
        gesperrt = true;
        if (ok) {
          karte.classList.add('falle__karte--ok');
          naechste();
          setTimeout(function () { gesperrt = false; }, 200);
        } else {
          karte.classList.add('falle__karte--falsch');
          erkl.textContent = (a.stimmt ? 'Stimmt. ' : 'Stimmt nicht. ') + a.erkl;
          ja.disabled = nein.disabled = true;
          setTimeout(function () {
            gesperrt = false;
            if (!document.body.contains(karte) || Date.now() >= ende) return;
            naechste();
          }, R.SPERRE_MS);
        }
      }
      function tick() {
        if (!document.body.contains(zeit)) { aufhoeren(); return; }
        var rest = Math.max(0, Math.ceil((ende - Date.now()) / 1000));
        zeit.textContent = Math.floor(rest / 60) + ':' + String(rest % 60).padStart(2, '0');
        if (rest <= 0) { aufhoeren(); auswertung(richtig, fehler); }
      }
      tasten = function (e) {
        if (!document.body.contains(karte)) { aufhoeren(); return; }
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); antwort(true); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); antwort(false); }
      };
      document.addEventListener('keydown', tasten);

      seite.innerHTML = '';
      seite.appendChild(h('div', { class: 'pruef-leiste' }, h('span', { class: 'hinweis-klein' }, 'Zeit'), zeit, h('span', { class: 'hinweis-klein' }, 'Punkte'), stand));
      seite.appendChild(karte);
      seite.appendChild(h('div', { class: 'falle__knoepfe' }, ja, nein));
      seite.appendChild(h('p', { class: 'hinweis-klein' }, 'Pfeil links = stimmt, Pfeil rechts = stimmt nicht.'));
      naechste();
      ja.focus({ preventScroll: true });
      tick();
      uhr = setInterval(tick, 250);
    }

    function auswertung(richtig, fehler) {
      var punkte = R.punkte(richtig, fehler.length);
      var neu = W.state.recordRadar(punkte);
      var gesamt = richtig + fehler.length;
      seite.innerHTML = '';
      seite.appendChild(kopf('Blitzrunde', 'Radarfalle'));
      seite.appendChild(W.ansichten.karte('falle-auswertung', h('p', { class: 'ergebnis mono' }, String(punkte)),
        h('p', null, richtig + ' von ' + gesamt + ' richtig, ' + fehler.length + ' falsch. Punkte = richtig minus falsch.' + (neu ? ' Neuer Bestwert.' : '')),
        h('p', { class: 'hinweis-klein' }, 'Bestwert: ', h('span', { class: 'mono' }, String(W.state.data.radar.best || 0)))));
      if (fehler.length) {
        seite.appendChild(h('h2', { class: 'zwischen' }, 'Daneben, jetzt in der Nachermittlung'));
        seite.appendChild(h('ul', { class: 'erkl-liste' }, fehler.map(function (i) {
          var a = R.aussagen[i];
          return h('li', { class: 'karte falle__fehler' }, h('p', null, '„' + a.text + '“'),
            h('p', { class: 'hinweis-klein' }, h('strong', null, a.stimmt ? 'Stimmt. ' : 'Stimmt nicht. '), a.erkl));
        })));
      }
      seite.appendChild(h('div', { class: 'aktionen' },
        h('a', { href: '#/', class: 'btn' }, 'Zum Aktenschrank'),
        fehler.length ? h('a', { href: '#/nachermittlung', class: 'btn' }, 'Zur Nachermittlung') : null,
        h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: runde }, 'Nochmal')));
    }

    start();
  }

  /* ---------- Labor ---------- */
  function labor(host, args) {
    aufhoeren();
    var P = W.labor.PRESETS;
    var p = args && P.indexOf(args[0]) >= 0 ? args[0] : P[0];
    var sim = h('div', { class: 'labor-seite__sim' });
    host.appendChild(h('div', { class: 'seite labor-seite' },
      kopf('Bewegungs-Simulator', 'Labor'),
      h('p', { class: 'hinweis-klein' }, 'Stell die Regler ein, starte die Fahrt und sieh zu, wie s(t), v(t) und a(t) entstehen.'),
      h('nav', { class: 'labor-wahl', 'aria-label': 'Voreinstellungen' }, P.map(function (q) {
        return h('a', { href: '#/labor/' + q, class: 'btn btn--klein' + (q === p ? ' btn--haupt' : ''), 'aria-current': q === p ? 'page' : null }, W.labor.preset(q).titel);
      })),
      sim));
    W.labor.mount(sim, p);
  }

  W.extras = {
    folgt: folgt,
    formelkarte: function (host) {
      aufhoeren();
      host.appendChild(W.formelkarte.erzeuge());
    },
    radarfalle: radarfalle,
    labor: labor,
    aufhoeren: aufhoeren
  };
})();
