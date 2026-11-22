/* Sachverständigenprüfung: Start, Prüfung mit Timer (übersteht Neuladen), Abgabe, Selbstbewertung des Rechenwegs, Auswertung. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };
  var timer = null;
  var CHEFIN = 'Dr. Hansen, Büroleiterin';
  var TEIL = 1;   // W.state.pruefung.best['1'] zählt für den Rang „Sachverständiger“

  function stoppeTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function rest(l) { return Math.round(l.dauerMin * 60 - (Date.now() - l.start) / 1000); }
  function mmss(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function pText(x) { return W.physik.fmt(x, 1); }
  function karte() { return W.ansichten.karte.apply(null, arguments); }
  function chefin(text) { return h('blockquote', { class: 'chefin' }, h('p', null, text), h('footer', { class: 'chefin__wer mono' }, CHEFIN)); }
  function seitenkopf(ort, titel) { return h('div', { class: 'seitenkopf' }, h('p', { class: 'seitenkopf__ort mono' }, ort), h('h1', null, titel)); }
  function antwort(l, key) { return (l.antworten || {})[key] || {}; }
  /** Ein Feld der Antwort eines Teils speichern ({ auto, haken, text }), die anderen bleiben. */
  function speichere(key, feld, wert) {
    var l = W.state.pruefungLaufend();
    if (!l) return;
    var neu = {}, alt = l.antworten[key] || {};
    Object.keys(alt).forEach(function (k) { neu[k] = alt[k]; });
    neu[feld] = wert;
    W.state.pruefungAntwort(key, neu);
  }
  function loesungKurz(item) {
    return item.typ === 'zahl' ? W.physik.fmt(item.antwort) + ' ' + item.einheit : W.aufgaben.loesungText(item);
  }
  function akteLink(id) {
    var a = W.ansichten.akteNachId(id);
    if (!a) return null;
    var name = 'Akte ' + a.nr + ': ' + a.titel;
    return a.folgt ? h('span', null, name + ' (folgt)') : h('a', { href: '#/akte/' + a.id }, name);
  }

  /* ---------- Start ---------- */
  function startseite(host) {
    var laeufe = (W.state.data.pruefung.laeufe || []).filter(function (x) { return x.teil === TEIL; }).slice(-6).reverse();
    function starten() {
      if (!window.confirm('Prüfung starten? Die Uhr läuft sofort.')) return;
      W.state.pruefungStarten(TEIL, Math.floor(Math.random() * 1e9) + 1, 45);
      location.hash = '#/pruefung/laeuft';
    }
    host.appendChild(h('div', { class: 'seite' },
      seitenkopf('Gutachterbüro Bremsspur · Prüfungsraum', 'Sachverständigenprüfung'),
      chefin('Wie in der Arbeit: 45 Minuten, zwei Aufgaben, Taschenrechner und Papier. Den Rechenweg schreibst du auf, die Ergebnisse trägst du hier ein.'),
      karte('blatt',
        h('p', { class: 'blatt__kopf mono' }, '45 Minuten · 40 Punkte · bei jedem Start neue Zahlen'),
        h('ul', { class: 'pruef-aufbau' },
          h('li', null, h('strong', null, 'Aufgabe 1: '), 'zwei Fahrzeuge, eins gleichförmig, eins beschleunigt aus dem Stand. Geschwindigkeit, Beschleunigung, Funktionsterme, Graph, Einholen.'),
          h('li', null, h('strong', null, 'Aufgabe 2: '), 'Messtabelle, freier Fall oder Bremsen. Graph beschreiben, v̄ und ā nach der Mittelpunkt-Regel, Funktionsterme, eine Endfrage.')),
        h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: starten }, 'Prüfung starten'))),
      karte('', h('h2', null, 'So läuft es'),
        h('p', null, 'Ergebnisse tippst du ein, die App prüft sie. Den Rechenweg schreibst du auf Papier. Nach der Abgabe vergleichst du ihn mit der Musterlösung und hakst ab, was auf deinem Blatt steht: Formel, Umstellen, Einsetzen mit Einheiten. Beschreibungen bewertest du genauso.'),
        h('p', { class: 'hinweis-klein' }, 'Die Note ist ein Richtwert. Die Schule kann anders werten. Sachverständiger wirst du mit fünf geschlossenen Akten und mindestens 80 % in der Prüfung.')),
      laeufe.length ? h('div', null, h('h2', { class: 'zwischen' }, 'Letzte Prüfungen'),
        h('ul', { class: 'pruef-laeufe' }, laeufe.map(function (x) {
          var pz = x.max ? 100 * x.punkte / x.max : 0;
          return h('li', { class: 'mono hinweis-klein' }, pText(x.punkte) + ' / ' + x.max + ' P. · ' + Math.round(pz) + ' % · Note ' + W.logic.note(pz));
        }))) : null));
  }

  function fortsetzenFrage(host, l) {
    var r = rest(l);
    host.appendChild(h('div', { class: 'seite' },
      seitenkopf('Prüfungsraum', 'Prüfung läuft'),
      karte('', h('p', null, 'Restzeit ', h('span', { class: 'mono' }, mmss(r))),
        h('p', { class: 'hinweis-klein' }, 'Deine Antworten sind gespeichert.'),
        h('div', { class: 'aktionen aktionen--zwei' },
          h('button', { type: 'button', class: 'btn btn--gefahr', onclick: function () {
            if (window.confirm('Prüfung abbrechen? Die Antworten gehen verloren.')) { W.state.pruefungVerwerfen(); W.app.zeige(); }
          } }, 'Abbrechen'),
          h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: function () { location.hash = '#/pruefung/laeuft'; } }, 'Fortsetzen')))));
  }

  /* ---------- Prüfung ---------- */
  function aufgabenKopf(a) {
    var sum = a.teile.reduce(function (s, t) { return s + t.p; }, 0);
    return karte('blatt pruef-sachtext',
      h('p', { class: 'blatt__kopf mono' }, 'Aufgabe ' + a.nr + ' · ' + sum + ' Punkte'),
      h('h2', null, a.titel),
      h('div', { class: 'sachtext', html: a.text }));
  }
  function teilKopf(t) {
    return h('p', { class: 'pruef-teil' }, h('strong', { class: 'mono' }, t.b + ')'), ' ', h('span', { class: 'hinweis-klein' }, '(' + t.p + ' P.)'));
  }

  function pruefung(host, l) {
    var pr = W.pruefung.erzeuge(l.seed);
    var uhr = h('span', { class: 'mono pruef-uhr', 'aria-label': 'Restzeit' }, mmss(rest(l)));
    function abgeben(auto) {
      stoppeTimer();
      W.state.pruefungAbgeben();
      if (auto) W.toast('Die Zeit ist um. Abgegeben.');
      location.hash = '#/pruefung/bewerten';
    }
    function abgebenFragen() { if (window.confirm('Prüfung jetzt abgeben?')) abgeben(false); }
    var seite = h('div', { class: 'seite pruefung' },
      h('div', { class: 'pruef-leiste' }, h('span', { class: 'hinweis-klein' }, 'Restzeit'), uhr,
        h('button', { type: 'button', class: 'btn btn--haupt btn--klein', onclick: abgebenFragen }, 'Abgeben')),
      seitenkopf('Prüfungsraum', pr.titel),
      h('p', { class: 'hinweis-klein' }, 'Rechenwege schreibst du auf Papier, Ergebnisse trägst du hier ein. Alles wird sofort gespeichert.'));
    pr.aufgaben.forEach(function (a) {
      var box = h('section', { class: 'pruef-aufgabe' }, aufgabenKopf(a));
      a.teile.forEach(function (t) {
        var key = a.nr + t.b, alt = antwort(l, key);
        if (t.item) {
          var r = W.aufgaben.render(t.item, { wert: alt.auto });
          var merke = function () { setTimeout(function () { speichere(key, 'auto', r.antwort()); }, 0); };
          ['input', 'change', 'click'].forEach(function (ev) { r.el.addEventListener(ev, merke); });
          box.appendChild(h('div', { class: 'pruef-teilbox', 'data-teil': key }, teilKopf(t), r.el,
            t.rechenweg ? h('p', { class: 'hinweis-klein pruef-papier' }, 'Rechenweg auf Papier, Ergebnis hier eintragen.') : null));
        } else {
          var ta = h('textarea', { class: 'erkl__text erkl__text--klein', rows: '4', placeholder: 'Antwort tippen oder auf Papier schreiben', 'aria-label': 'Antwort zu ' + key });
          ta.value = alt.text || '';
          ta.addEventListener('input', function () { speichere(key, 'text', ta.value); });
          box.appendChild(h('div', { class: 'pruef-teilbox', 'data-teil': key }, teilKopf(t),
            h('div', { class: 'aufgabe' }, h('div', { class: 'frage', html: t.erkl.frage }),
              t.erkl.abb ? h('figure', { class: 'abb' }, W.diagramm.zeichne(t.erkl.abb)) : null, ta)));
        }
      });
      seite.appendChild(box);
    });
    seite.appendChild(h('div', { class: 'aktionen aktionen--zwei' },
      h('button', { type: 'button', class: 'btn btn--gefahr', onclick: function () {
        if (window.confirm('Prüfung abbrechen? Die Antworten gehen verloren.')) { stoppeTimer(); W.state.pruefungVerwerfen(); location.hash = '#/pruefung'; }
      } }, 'Abbrechen'),
      h('button', { type: 'button', class: 'btn btn--haupt', onclick: abgebenFragen }, 'Abgeben')));
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

  /* ---------- Selbstbewertung: Rechenweg und Beschreibungen ---------- */
  function checkliste(liste, haken, onwechsel) {
    return h('ul', { class: 'check' }, liste.map(function (x, i) {
      var an = haken.indexOf(i) >= 0;
      var btn = h('button', { type: 'button', class: 'check__punkt' + (an ? ' an' : ''), 'aria-pressed': an ? 'true' : 'false', onclick: function () {
        var k = haken.indexOf(i);
        if (k >= 0) haken.splice(k, 1); else haken.push(i);
        btn.classList.toggle('an', k < 0);
        btn.setAttribute('aria-pressed', k < 0 ? 'true' : 'false');
        onwechsel();
      } }, h('span', { class: 'check__box' }), h('span', { class: 'check__text' }, x.text), h('span', { class: 'check__p mono' }, pText(x.p) + ' P.'));
      return h('li', null, btn);
    }));
  }

  function bewerten(host, l) {
    var pr = W.pruefung.erzeuge(l.seed);
    var seite = h('div', { class: 'seite' }, seitenkopf('Prüfungsraum · abgegeben', 'Rechenweg bewerten'),
      chefin('Leg dein Blatt daneben. Hake nur ab, was wirklich auf dem Blatt steht.'),
      h('p', { class: 'hinweis-klein' }, 'Die Ergebnisse hat die App schon geprüft. Hier bewertest du den Rechenweg an der Musterlösung und die Beschreibung am Erwartungshorizont.'));
    pr.aufgaben.forEach(function (a) {
      a.teile.filter(function (t) { return t.rechenweg || t.erkl; }).forEach(function (t) {
        var key = a.nr + t.b, alt = antwort(l, key);
        var haken = (Array.isArray(alt.haken) ? alt.haken : []).slice();
        var anzeige = h('span', { class: 'mono' });
        var liste = t.erkl ? t.erkl.punkte : t.rechenweg;
        var auto = 0, ok = false;
        if (t.item) {
          ok = W.aufgaben.richtig(t.item, alt.auto);
          auto = W.logic.punkteRunden(W.aufgaben.score(t.item, alt.auto), W.pruefung.pAuto(t));
        }
        function neu() {
          var s = haken.reduce(function (x, i) { return x + (liste[i] ? liste[i].p : 0); }, 0);
          anzeige.textContent = pText(Math.min(t.p, s + auto)) + ' / ' + t.p + ' P.';
        }
        neu();
        var kopf = h('p', { class: 'horizont__titel' }, 'Aufgabe ' + a.nr + ' ' + t.b + ') · ' + t.kurz, anzeige);
        var inhalt;
        if (t.item) {
          var eingabe = W.aufgaben.leer(t.item, alt.auto) ? '(leer)'
            : t.item.typ === 'tabelle' ? alt.auto.map(function (z) { return z.map(function (v) { return v == null || v === '' ? '?' : v; }).join(' | '); }).join('; ')
              : String(alt.auto).trim() + ' ' + t.item.einheit;
          inhalt = [
            h('div', { class: 'frage', html: t.item.frage }),
            h('p', { class: 'pruef-ergebnis' }, 'Dein Ergebnis: ', h('span', { class: 'mono' }, eingabe), ' ',
              ok ? h('span', { class: 'ok-text' }, '✓ richtig') : h('span', { class: 'falsch-text' }, '✗ richtig wäre ' + loesungKurz(t.item))),
            h('details', { class: 'muster', open: true }, h('summary', null, 'Musterlösung'), h('div', { class: 'muster__inhalt', html: t.item.loesung })),
            h('p', { class: 'hinweis-klein' }, 'Was steht auf deinem Blatt?'),
            checkliste(liste, haken, function () { speichere(key, 'haken', haken.slice()); neu(); }),
            h('ul', { class: 'check' }, h('li', null, h('div', { class: 'check__punkt check__punkt--fest' + (ok ? ' an' : '') },
              h('span', { class: 'check__box' }), h('span', { class: 'check__text' }, 'Ergebnis mit Einheit (prüft die App)'),
              h('span', { class: 'check__p mono' }, pText(auto) + ' / ' + pText(W.pruefung.pAuto(t)) + ' P.'))))];
        } else {
          inhalt = [
            h('div', { class: 'frage', html: t.erkl.frage }),
            alt.text && String(alt.text).trim() ? h('blockquote', { class: 'erkl__eigen' }, alt.text) : h('p', { class: 'hinweis-klein' }, '(auf Papier geschrieben)'),
            h('p', { class: 'hinweis-klein' }, 'Erwartungshorizont: Hake ab, was sinngemäß und fachlich richtig in deiner Antwort steht.'),
            checkliste(liste, haken, function () { speichere(key, 'haken', haken.slice()); neu(); }),
            h('details', { class: 'muster' }, h('summary', null, 'Musterantwort'), h('p', { html: t.erkl.muster }))];
        }
        seite.appendChild(h('section', { class: 'erkl pruef-bewertung', 'data-teil': key }, [kopf].concat(inhalt)));
      });
    });
    seite.appendChild(h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { auswertung(host, l); } }, 'Auswerten')));
    host.appendChild(seite);
  }

  /* ---------- Auswertung ---------- */
  function urteil(prozent) {
    if (prozent >= 80) return 'Sauber gearbeitet. So ein Gutachten hält vor Gericht.';
    if (prozent >= 57.5) return 'Brauchbar. Schau dir die Teile mit Abzug an, dann noch eine Runde.';
    return 'So geht das Gutachten nicht raus. Wiederhole die Akten unten und versuch es dann noch einmal.';
  }

  function auswertung(host, l) {
    var pr = W.pruefung.erzeuge(l.seed);
    var antworten = l.antworten || {};
    var e = W.pruefung.auswerten(pr, antworten);
    var nm = W.pruefung.nachermittlung(pr, antworten);
    var rangVorher = W.logic.rang(W.state.data, W.ansichten.akten()).titel;
    nm.trainer.forEach(function (id) { W.state.itemErgebnis(id, false); });
    nm.erkl.forEach(function (x) { W.state.erklSpeichern(x.id, { text: x.text, haken: x.haken, prozent: x.prozent, frage: x.frage }); });
    W.state.pruefungBeenden([{ teil: TEIL, punkte: e.punkte, max: e.max }]);
    var rangNachher = W.logic.rang(W.state.data, W.ansichten.akten()).titel;
    var prozent = e.max ? 100 * e.punkte / e.max : 0;

    var zeilen = [], i = 0;
    pr.aufgaben.forEach(function (a) {
      var reihe = a.teile.map(function () { return e.teile[i++]; });
      var sum = reihe.reduce(function (s, x) { return s + x.punkte; }, 0);
      var max = reihe.reduce(function (s, x) { return s + x.p; }, 0);
      zeilen.push(h('tr', { class: 'pruef-tab__aufgabe' }, h('th', { scope: 'row' }, 'Aufgabe ' + a.nr + ': ' + a.titel), h('td', { class: 'mono nowrap' }, pText(sum) + ' / ' + max), h('td')));
      a.teile.forEach(function (t, k) {
        var x = reihe[k];
        zeilen.push(h('tr', null, h('td', null, t.b + ') ' + t.kurz),
          h('td', { class: 'mono nowrap' }, pText(x.punkte) + ' / ' + x.p),
          h('td', { class: 'nowrap' }, x.punkte >= x.p ? h('span', { class: 'ok-text' }, '✓') : x.punkte > 0 ? 'Abzug' : h('span', { class: 'falsch-text' }, '0'))));
      });
    });

    var loes = h('div', { class: 'pruef-loesungen' });
    pr.aufgaben.forEach(function (a) {
      a.teile.filter(function (t) { return t.item; }).forEach(function (t) {
        var wert = (antworten[a.nr + t.b] || {}).auto;
        var r = W.aufgaben.render(t.item, { wert: wert });
        r.zeige();
        var ok = W.aufgaben.richtig(t.item, wert);
        loes.appendChild(h('div', { class: 'pruef-teilbox' },
          h('p', { class: 'pruef-teil' }, h('strong', null, 'Aufgabe ' + a.nr + ' ' + t.b + ')'), ' ',
            ok ? h('span', { class: 'ok-text' }, '✓') : h('span', { class: 'hinweis-klein' }, 'Richtig: ' + loesungKurz(t.item))),
          r.el));
      });
    });

    var nrVon = function (id) { var a = W.ansichten.akteNachId(id); return a ? a.nr : 99; };
    var wiederholen = nm.akten.slice().sort(function (x, y) { return nrVon(x) - nrVon(y); }).map(akteLink).filter(Boolean);
    host.innerHTML = '';
    host.appendChild(h('div', { class: 'seite' },
      seitenkopf('Prüfungsraum · Auswertung', 'Auswertung'),
      karte('auswertung',
        h('p', { class: 'ergebnis mono' }, pText(e.punkte) + ' / ' + e.max),
        h('p', { class: 'auswertung__note' }, Math.round(prozent) + ' % · Note ' + W.logic.note(prozent) + ' (Richtwert)'),
        h('p', { class: 'hinweis-klein' }, 'Schlüssel: ab 87,5 % Note 1, ab 72,5 % Note 2, ab 57,5 % Note 3, ab 45 % Note 4, ab 20 % Note 5. Die Schule kann anders werten.'),
        rangNachher !== rangVorher ? h('p', { class: 'ok-text' }, 'Neuer Rang: ' + rangNachher + '.') : null),
      chefin(urteil(prozent)),
      h('h2', { class: 'zwischen' }, 'Punkte je Teilaufgabe'),
      h('div', { class: 'tab-wrap' }, h('table', { class: 'tab pruef-tab' }, h('tbody', null, zeilen))),
      wiederholen.length ? karte('', h('h2', null, 'Akten zum Wiederholen'),
        h('ul', { class: 'pruef-akten' }, wiederholen.map(function (x) { return h('li', null, x); }))) : null,
      nm.trainer.length || nm.erkl.length ? h('p', { class: 'hinweis-klein' }, 'Falsche Ergebnisse liegen jetzt in der Nachermittlung, mit neuen Zahlen.') : null,
      h('details', { class: 'muster' }, h('summary', null, 'Ergebnisse und Lösungen ansehen'), loes),
      h('div', { class: 'aktionen aktionen--zwei' }, h('a', { href: '#/', class: 'btn' }, 'Zum Aktenschrank'), h('a', { href: '#/pruefung', class: 'btn btn--haupt' }, 'Neue Prüfung'))));
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
