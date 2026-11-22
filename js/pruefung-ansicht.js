/* Facharztprüfung: Start, Prüfung mit Timer (übersteht Neuladen), Abgabe, Selbstbewertung, Auswertung. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };
  var timer = null;

  function stoppeTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function aufgabenFuer(l) {
    if (l.teil === 'beide') {
      return [{ teil: 1, aufgaben: W.pruefung.erzeugen(1, l.seed) }, { teil: 2, aufgaben: W.pruefung.erzeugen(2, l.seed + 1) }];
    }
    return [{ teil: l.teil, aufgaben: W.pruefung.erzeugen(l.teil, l.seed) }];
  }

  function rest(l) { return Math.round(l.dauerMin * 60 - (Date.now() - l.start) / 1000); }
  function mmss(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function pText(p) { return String(p).replace('.', ','); }
  function karte() { return W.ansichten.karte.apply(null, arguments); }
  function teilName(teil) { return teil === 3 ? 'Schwerpunkt' : teil === 'beide' ? 'Beide Teile' : 'Teil ' + teil; }
  /** Anzeige des Teils: „a)“, „b, c)“, „c) Rechenweg“. */
  function bLabel(t) { return t.buchst.replace(/\d$/, '').split('').join(', ') + ')' + (t.zusatz ? ' ' + t.zusatz : ''); }

  /* ---------- Start ---------- */
  function startseite(host) {
    var best = W.state.data.pruefung.best || {};
    var laeufe = (W.state.data.pruefung.laeufe || []).slice(-6).reverse();
    function starten(teil) {
      if (!window.confirm('Prüfung starten? Der Timer läuft sofort.')) return;
      var dauer = teil === 'beide' ? 105 : W.pruefung.DAUER[teil];
      W.state.pruefungStarten(teil, Math.floor(Math.random() * 1e9), dauer);
      location.hash = '#/pruefung/laeuft';
    }
    function wahl(teil, titel, info) {
      return h('button', { type: 'button', class: 'erkl-zeile pruef-wahl', onclick: function () { starten(teil); } },
        h('span', { class: 'erkl-zeile__frage' }, h('strong', null, titel), h('br'), h('span', { class: 'hinweis-klein' }, info)),
        h('span', { class: 'mono erkl-zeile__p' }, teil === 'beide' ? '' : (best[String(teil)] ? Math.round(100 * best[String(teil)]) + ' %' : '—')));
    }
    host.appendChild(h('div', { class: 'seite' },
      h('h1', null, 'Facharztprüfung'),
      h('p', { class: 'funk' }, h('span', { class: 'funk__wer' }, 'Dr. Brandt'), 'Fang mit dem Schwerpunkt an: nur die fünf Themen der Lehrerin. Papier daneben, Handy auf lautlos.'),
      h('div', { class: 'erkl-liste' },
        wahl(3, 'Schwerpunkt · Stoffliste der Lehrerin (empfohlen)', '45 Minuten · 50 Punkte · Gasaustausch, Weg des Blutes, Vererbung, Zusammenhang, Formen äußerer Atmung'),
        wahl(1, 'Teil 1 · Grundlagen, Atmung und Kreislauf', '45 Minuten · 50 Punkte · wie das Übungsblatt'),
        wahl(2, 'Teil 2 · Kreislauf, Ernährung und Stoffwechsel', '60 Minuten · 60 Punkte · wie das Übungsblatt'),
        wahl('beide', 'Beide Teile', '105 Minuten · 110 Punkte')),
      karte('', h('p', { class: 'hinweis-klein' }, 'So läuft es: Aufgaben zum Antippen prüft die App selbst. Erklär-Aufgaben schreibst du am besten auf Papier (oder tippst sie) und bewertest sie nach der Abgabe mit dem Erwartungshorizont. Die Note ist ein Richtwert, deine Schule kann anders werten. Oberarzt wirst du mit mindestens 80 % in der Schwerpunkt-Probearbeit oder in beiden Teilen.')),
      laeufe.length ? h('div', null, h('h2', { class: 'zwischen' }, 'Letzte Prüfungen'),
        h('ul', { class: 'plan-ziele' }, laeufe.map(function (l) {
          var p = l.max ? Math.round(100 * l.punkte / l.max) : 0;
          return h('li', { class: 'mono hinweis-klein' }, teilName(l.teil) + ': ' + pText(l.punkte) + ' / ' + l.max + ' P. · ' + p + ' % · Note ' + W.logic.note(p));
        }))) : null));
  }

  function fortsetzenFrage(host, l) {
    var r = rest(l);
    host.appendChild(h('div', { class: 'seite' },
      h('h1', null, 'Prüfung läuft'),
      karte('', h('p', null, teilName(l.teil) + ' · Restzeit ', h('span', { class: 'mono' }, mmss(r))),
        h('p', { class: 'hinweis-klein' }, r > 0 ? 'Deine Antworten sind gespeichert.' : 'Die Zeit ist abgelaufen. Die Prüfung wird jetzt abgegeben.'),
        h('div', { class: 'aktionen aktionen--zwei' },
          h('button', { type: 'button', class: 'btn btn--gefahr', onclick: function () {
            if (window.confirm('Prüfung abbrechen? Die Antworten gehen verloren.')) { W.state.pruefungVerwerfen(); W.app.zeige(); }
          } }, 'Abbrechen'),
          h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () {
            if (r <= 0) { W.state.pruefungAbgeben(); location.hash = '#/pruefung/bewerten'; } else location.hash = '#/pruefung/laeuft';
          } }, r > 0 ? 'Fortsetzen' : 'Weiter zur Bewertung')))));
  }

  /* ---------- Prüfung ---------- */
  function pruefung(host, l) {
    var antworten = l.antworten || {};
    var bloecke = aufgabenFuer(l);
    var uhr = h('span', { class: 'mono pruef-uhr' }, mmss(rest(l)));
    function abgeben(auto) {
      stoppeTimer();
      W.state.pruefungAbgeben();
      if (auto) W.toast('Zeit ist um. Abgegeben.');
      location.hash = '#/pruefung/bewerten';
    }
    var leiste = h('div', { class: 'pruef-leiste' },
      h('span', { class: 'hinweis-klein' }, 'Restzeit'), uhr,
      h('button', { type: 'button', class: 'btn btn--haupt btn--klein', onclick: function () { if (window.confirm('Prüfung jetzt abgeben?')) abgeben(false); } }, 'Abgeben'));
    var seite = h('div', { class: 'seite pruefung' });
    seite.appendChild(leiste);
    bloecke.forEach(function (b) {
      seite.appendChild(h('h1', null, W.pruefung.TITEL[b.teil]));
      b.aufgaben.forEach(function (a) {
        var sum = a.teile.reduce(function (s, t) { return s + t.punkte; }, 0);
        var box = h('section', { class: 'pruef-aufgabe' },
          h('h2', null, h('span', { class: 'mono' }, a.nr + ' | '), a.titel, h('span', { class: 'hinweis-klein' }, ' (' + pText(sum) + ' P.)')),
          a.text ? h('p', null, a.text) : null);
        a.teile.forEach(function (t) {
          var kopf = h('p', { class: 'pruef-teil' }, h('strong', null, bLabel(t)), ' ', h('span', { class: 'hinweis-klein' }, '(' + pText(t.punkte) + ' P.)'));
          if (t.item) {
            var r = W.aufgaben.render(t.item, { wert: antworten[t.key] });
            var speichern = function () { setTimeout(function () { W.state.pruefungAntwort(t.key, r.antwort()); }, 0); };
            ['input', 'change', 'click'].forEach(function (ev) { r.el.addEventListener(ev, speichern); });
            box.appendChild(h('div', { class: 'pruef-teilbox' }, kopf, r.el));
          } else {
            var ta = h('textarea', { class: 'erkl__text erkl__text--klein', rows: '4', placeholder: 'Antwort tippen oder auf Papier schreiben' });
            ta.value = antworten[t.key] || '';
            ta.addEventListener('input', function () { W.state.pruefungAntwort(t.key, ta.value); });
            box.appendChild(h('div', { class: 'pruef-teilbox' }, kopf,
              h('div', { class: 'aufgabe' }, h('div', { class: 'frage', html: t.erkl.frage }),
                t.erkl.abb ? h('figure', { class: 'abb' }, W.abb.zeichne(t.erkl.abb, t.erkl.abbOpts || {})) : null,
                t.erkl.tipp ? h('details', { class: 'tipp' }, h('summary', null, 'Schreibgerüst'), h('p', null, t.erkl.tipp)) : null, ta)));
          }
        });
        seite.appendChild(box);
      });
    });
    seite.appendChild(h('div', { class: 'aktionen aktionen--zwei' },
      h('button', { type: 'button', class: 'btn btn--gefahr', onclick: function () {
        if (window.confirm('Prüfung abbrechen? Die Antworten gehen verloren.')) { stoppeTimer(); W.state.pruefungVerwerfen(); location.hash = '#/pruefung'; }
      } }, 'Abbrechen'),
      h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { if (window.confirm('Prüfung jetzt abgeben?')) abgeben(false); } }, 'Abgeben')));
    host.appendChild(seite);
    stoppeTimer();
    timer = setInterval(function () {
      if (!document.body.contains(uhr)) { stoppeTimer(); return; }
      var r = rest(l);
      uhr.textContent = mmss(r);
      uhr.classList.toggle('pruef-uhr--knapp', r <= 300);
      if (r <= 0) abgeben(true);
    }, 1000);
  }

  /* ---------- Selbstbewertung und Auswertung ---------- */
  function bewerten(host, l) {
    var antworten = l.antworten || {};
    var bloecke = aufgabenFuer(l);
    var seite = h('div', { class: 'seite' }, h('h1', null, 'Erklärungen bewerten'),
      h('p', { class: 'hinweis-klein' }, 'Lies deine Antwort (oder dein Blatt), vergleiche mit dem Erwartungshorizont und hake ehrlich ab, was sinngemäß und fachlich richtig drin ist.'));
    bloecke.forEach(function (b) {
      b.aufgaben.forEach(function (a) {
        a.teile.filter(function (t) { return t.erkl; }).forEach(function (t) {
          var haken = (antworten['bew:' + t.key] || []).slice();
          var anzeige = h('span', { class: 'mono' });
          function neu() {
            var s = Math.min(t.punkte, haken.reduce(function (x, i) { return x + t.erkl.punkte[i].p; }, 0));
            anzeige.textContent = pText(s) + ' / ' + pText(t.punkte);
          }
          var liste = h('ul', { class: 'check' }, t.erkl.punkte.map(function (p, i) {
            var an = haken.indexOf(i) >= 0;
            var btn = h('button', { type: 'button', class: 'check__punkt' + (an ? ' an' : ''), 'aria-pressed': an ? 'true' : 'false', onclick: function () {
              var k = haken.indexOf(i);
              if (k >= 0) haken.splice(k, 1); else haken.push(i);
              btn.classList.toggle('an', k < 0);
              btn.setAttribute('aria-pressed', k < 0 ? 'true' : 'false');
              W.state.pruefungAntwort('bew:' + t.key, haken.slice());
              neu();
            } }, h('span', { class: 'check__box' }), h('span', { class: 'check__text' }, p.text), h('span', { class: 'check__p mono' }, pText(p.p) + ' P.'));
            return h('li', null, btn);
          }));
          neu();
          var text = antworten[t.key];
          seite.appendChild(h('section', { class: 'erkl pruef-bewertung' },
            h('p', { class: 'horizont__titel' }, teilName(b.teil) + ' · Aufgabe ' + a.nr + ' ' + bLabel(t), anzeige),
            h('div', { class: 'frage', html: t.erkl.frage }),
            text && String(text).trim() ? h('blockquote', { class: 'erkl__eigen' }, text) : h('p', { class: 'hinweis-klein' }, '(auf Papier geschrieben)'),
            liste,
            h('details', { class: 'muster' }, h('summary', null, 'Musterantwort'), h('p', { html: t.erkl.muster }))));
        });
      });
    });
    seite.appendChild(h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { auswerten(host, l); } }, 'Auswerten')));
    host.appendChild(seite);
  }

  function auswerten(host, l) {
    var antworten = l.antworten || {};
    var bloecke = aufgabenFuer(l);
    var bewertung = {};
    Object.keys(antworten).forEach(function (k) { if (k.indexOf('bew:') === 0) bewertung[k.slice(4)] = antworten[k]; });
    var ergebnisse = bloecke.map(function (b) {
      var e = W.pruefung.auswerten(b.aufgaben, antworten, bewertung);
      e.teil = b.teil;
      e.bloecke = b.aufgaben;
      return e;
    });
    var rangVorher = W.logic.rang(W.state.data, W.ansichten.faelle()).titel;
    // Fehler in die Wiedervorlage
    ergebnisse.forEach(function (e) {
      e.falsch.forEach(function (key) { W.state.itemErgebnis(key, false); });
      Object.keys(e.erklProzent).forEach(function (key) {
        if (e.erklProzent[key] < W.logic.ERKL_OK) {
          var frage = null;
          e.bloecke.forEach(function (a) { a.teile.forEach(function (t) { if (t.key === key && t.erkl) frage = t.erkl.frage; }); });
          W.state.erklSpeichern(key, { text: antworten[key] || '', haken: bewertung[key] || [], prozent: e.erklProzent[key], frage: frage });
        }
      });
    });
    W.state.pruefungBeenden(ergebnisse.map(function (e) { return { teil: e.teil, punkte: e.punkte, max: e.max }; }));
    var rangNachher = W.logic.rang(W.state.data, W.ansichten.faelle()).titel;
    var gesamt = ergebnisse.reduce(function (s, e) { return s + e.punkte; }, 0);
    var max = ergebnisse.reduce(function (s, e) { return s + e.max; }, 0);
    var prozent = max ? 100 * gesamt / max : 0;
    var fallIds = {};
    host.innerHTML = '';
    var seite = h('div', { class: 'seite' },
      h('h1', null, 'Auswertung'),
      karte('auswertung', h('p', { class: 'ergebnis mono' }, pText(gesamt) + ' / ' + max),
        h('p', null, Math.round(prozent) + ' % · Note ' + W.logic.note(prozent) + ' (Richtwert)'),
        h('p', { class: 'hinweis-klein' }, 'Schlüssel: ab 87,5 % Note 1, ab 72,5 % Note 2, ab 57,5 % Note 3, ab 45 % Note 4, ab 20 % Note 5. Deine Schule kann anders werten.'),
        rangNachher !== rangVorher ? h('p', { class: 'ok-text' }, 'Neuer Rang: ' + rangNachher + '.') : null));
    ergebnisse.forEach(function (e) {
      seite.appendChild(h('h2', { class: 'zwischen' }, W.pruefung.TITEL[e.teil] + ' · ' + pText(e.punkte) + ' / ' + e.max));
      seite.appendChild(h('div', { class: 'tab-wrap' }, h('table', { class: 'tab' },
        h('tbody', null, e.aufgaben.map(function (a) {
          var schwach = a.max && a.punkte / a.max < 0.75;
          if (schwach) fallIds[a.fall] = true;
          var f = W.ansichten.fallNachId(a.fall);
          return h('tr', null, h('th', { scope: 'row' }, a.nr + ' ' + a.titel),
            h('td', { class: 'mono nowrap' }, pText(a.punkte) + ' / ' + a.max),
            h('td', { class: 'nowrap' }, schwach && f ? h('a', { href: '#/fall/' + f.id }, 'Box ' + f.box) : (schwach ? '' : '✓')));
        })))));
    });
    var schwache = Object.keys(fallIds).map(W.ansichten.fallNachId).filter(Boolean);
    if (schwache.length) seite.appendChild(karte('', h('p', null, 'Wiederholen: '), h('p', null, schwache.map(function (f, i) { return [i ? ' · ' : '', h('a', { href: '#/fall/' + f.id }, 'Box ' + f.box + ' ' + f.titel)]; })),
      h('p', { class: 'hinweis-klein' }, 'Fehler aus der Prüfung liegen jetzt in der Wiedervorlage.')));
    // Lösungen der automatisch geprüften Aufgaben
    var loes = h('div', { class: 'pruef-loesungen' });
    ergebnisse.forEach(function (e) {
      e.bloecke.forEach(function (a) {
        a.teile.filter(function (t) { return t.item; }).forEach(function (t) {
          var r = W.aufgaben.render(t.item, { wert: antworten[t.key] });
          r.zeige();
          var ok = W.aufgaben.richtig(t.item, antworten[t.key]);
          loes.appendChild(h('div', { class: 'pruef-teilbox' },
            h('p', { class: 'pruef-teil' }, h('strong', null, teilName(e.teil) + ' · ' + a.nr + ' ' + bLabel(t)), ' ', ok ? h('span', { class: 'ok-text' }, '✓') : h('span', { class: 'hinweis-klein' }, 'Richtig: ' + W.aufgaben.loesungText(t.item, t.item.nummern))),
            r.el));
        });
      });
    });
    seite.appendChild(h('details', { class: 'muster' }, h('summary', null, 'Lösungen der Aufgaben ansehen'), loes));
    seite.appendChild(h('div', { class: 'aktionen' }, h('a', { href: '#/', class: 'btn' }, 'Zum Board'), h('a', { href: '#/pruefung', class: 'btn btn--haupt' }, 'Neue Prüfung')));
    host.appendChild(seite);
    window.scrollTo(0, 0);
  }

  W.pruefungAnsicht = function (host, args) {
    stoppeTimer();
    var l = W.state.pruefungLaufend();
    var modus = args && args[0];
    if (!l) { if (modus) { location.hash = '#/pruefung'; return; } startseite(host); return; }
    if (l.abgegeben) { bewerten(host, l); return; }
    if (rest(l) <= 0) { W.state.pruefungAbgeben(); bewerten(host, W.state.pruefungLaufend()); return; }
    if (modus === 'laeuft') pruefung(host, l); else fortsetzenFrage(host, l);
  };
})();
