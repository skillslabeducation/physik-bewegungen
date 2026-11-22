/* Ansichten: Board, Akte (Auftrag, Verstehen, Üben, Gutachten), Wiedervorlage, Einstellungen. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };

  var STATUS_TEXT = { neu: 'neu', offen: 'offen', geschlossen: 'geschlossen', folgt: 'folgt' };
  var STATUS_ZEICHEN = { neu: '○', offen: '●', geschlossen: '✓', folgt: '…' };
  var TABS = [['auftrag', 'Auftrag'], ['verstehen', 'Verstehen'], ['ueben', 'Üben'], ['gutachten', 'Gutachten']];

  /** Frage ohne Material-Block, für Listen. */
  function kurz(frage) { return String(frage).replace(/<p class="material">[\s\S]*?<\/p>/, ''); }

  function akten() { return (W.akten || []).slice().sort(function (a, b) { return a.nr - b.nr; }); }
  function akteNachId(id) { return akten().filter(function (a) { return a.id === id; })[0]; }
  function status(a) { return W.logic.akteStatus(a, W.state.data); }

  function naechsteAkte() {
    var l = akten().filter(function (a) { return !a.folgt && status(a).status !== 'geschlossen'; });
    return l[0] || null;
  }

  /** Aufgabe zu einer ID finden: Akten und Prüfung. */
  function itemNachId(id) {
    if (/^p\d/.test(id) && W.pruefung && W.pruefung.itemNachId) return W.pruefung.itemNachId(id);
    var gefunden = null;
    akten().forEach(function (a) {
      (a.ueben || []).concat(a.gutachten || []).forEach(function (it) { if (it.id === id) gefunden = it; });
    });
    return gefunden;
  }
  function erklNachId(id) {
    var gefunden = null;
    akten().forEach(function (a) { (a.erklaeren || []).forEach(function (e) { if (e.id === id) gefunden = { erkl: e, akte: a }; }); });
    if (!gefunden && W.pruefung && W.pruefung.erklNachId) {
      var e = W.pruefung.erklNachId(id, (W.state.data.erkl[id] || {}).frage);
      if (e) gefunden = { erkl: e, akte: null };
    }
    return gefunden;
  }

  function pille(st) { return h('span', { class: 'pille pille--' + st }, STATUS_ZEICHEN[st] + ' ' + STATUS_TEXT[st]); }
  function link(href, text, cls) { return h('a', { href: href, class: cls || '' }, text); }
  function karte(cls) { var args = Array.prototype.slice.call(arguments, 1); return h.apply(null, ['section', { class: 'karte ' + (cls || '') }].concat(args)); }

  /* ---------- Board ---------- */
  function board(host) {
    var alle = akten();
    var rang = W.logic.rang(W.state.data, alle);
    var next = naechsteAkte();
    var wv = wvAnzahl();
    var best = W.state.data.pruefung.best || {};
    var laufend = W.state.pruefungLaufend();
    var pruefHinweis = laufend && !laufend.abgegeben ? h('a', { href: '#/pruefung', class: 'karte pruef-hinweis' }, h('strong', null, 'Prüfung läuft'), ' · weiter zur Prüfung →') : null;
    host.appendChild(h('div', { class: 'seite' },
      h('h1', null, 'Bremsspur'),
      pruefHinweis,
      karte('rang', h('div', { class: 'rang__kopf' }, h('span', { class: 'rang__titel' }, rang.titel), h('span', { class: 'mono hinweis-klein' }, rang.geschlossen + ' von ' + alle.length + ' Akten geschlossen')),
        h('div', { class: 'balken' }, h('span', { style: { width: Math.round(100 * rang.geschlossen / Math.max(1, alle.length)) + '%' } })),
        rang.naechster ? h('p', { class: 'hinweis-klein' }, 'Nächster Rang: ' + rang.naechster) : null),
      alle.length ? h('ol', { class: 'board' }, alle.map(function (a) {
        var st = status(a);
        var istNext = next && next.id === a.id;
        var inhalt = [h('span', { class: 'box__nr mono' }, String(a.nr)),
          h('span', { class: 'box__mitte' }, h('span', { class: 'box__patient' }, a.fall || ''), h('span', { class: 'box__thema' }, a.titel + (istNext ? ' · als Nächstes' : ''))),
          pille(st.status)];
        return h('li', null, a.folgt ? h('div', { class: 'box box--folgt' }, inhalt) : h('a', { href: '#/akte/' + a.id, class: 'box box--' + st.status + (istNext ? ' box--next' : '') }, inhalt));
      })) : karte('', h('p', null, 'Die Akten kommen gleich.')),
      h('div', { class: 'kacheln' },
        h('a', { href: '#/wv', class: 'kachel' + (wv ? ' kachel--amber' : '') }, h('span', { class: 'kachel__zahl mono' }, String(wv)), h('span', null, 'Wiedervorlage')),
        h('a', { href: '#/pruefung', class: 'kachel' }, h('span', { class: 'kachel__zahl mono' }, best['1'] ? Math.round(100 * best['1']) + ' %' : '—'), h('span', null, 'Prüfung')))));
  }

  /* ---------- Akte ---------- */
  function fehltListe(st, a) {
    if (st.status === 'geschlossen') return h('p', { class: 'ok-text' }, '✓ Akte geschlossen.');
    function ziel(t) { return /Übung/.test(t) ? 'ueben' : 'gutachten'; }
    return h('div', { class: 'fehlt' }, h('p', { class: 'fehlt__titel' }, 'Bis zum Schließen fehlt:'),
      h('ul', null, st.fehlt.map(function (t) { return h('li', null, h('a', { href: '#/akte/' + a.id + '/' + ziel(t) }, t)); })));
  }

  function akte(host, id, tab) {
    var a = akteNachId(id);
    if (!a || a.folgt) { host.appendChild(h('p', { class: 'seite' }, 'Diese Akte gibt es noch nicht. ', link('#/', 'Zum Board'))); return; }
    tab = tab || 'auftrag';
    var st = status(a);
    var inhalt = h('div', { class: 'fall__inhalt' });
    host.appendChild(h('div', { class: 'seite fall' },
      h('div', { class: 'fall__kopf' },
        link('#/', '← Board', 'zurueck'),
        h('div', { class: 'fall__titelzeile' }, h('span', { class: 'mono box__nr box__nr--klein' }, String(a.nr)), h('h1', null, a.fall), pille(st.status)),
        h('p', { class: 'fall__thema' }, a.titel)),
      h('nav', { class: 'tabs', 'aria-label': 'Abschnitte' }, TABS.map(function (t) {
        return h('a', { href: '#/akte/' + a.id + '/' + t[0], class: 'reiter' + (t[0] === tab ? ' reiter--an' : ''), 'aria-current': t[0] === tab ? 'page' : null }, t[1]);
      })),
      inhalt));
    ({ auftrag: auftrag, verstehen: verstehen, ueben: ueben, gutachten: gutachten }[tab] || auftrag)(inhalt, a, st);
  }

  function auftrag(host, a, st) {
    var t = a.auftrag || {};
    host.appendChild(h('div', null,
      karte('aufnahme', h('p', { class: 'aufnahme__kopf mono' }, 'AKTE ' + a.nr), h('div', { html: t.text || '' }), t.daten ? h('div', { html: t.daten }) : null),
      t.chefin ? h('p', { class: 'funk' }, h('span', { class: 'funk__wer' }, 'Chefin'), t.chefin) : null,
      t.leitfrage ? karte('leitfrage', h('p', { class: 'leitfrage__titel' }, 'Leitfrage'), h('p', null, t.leitfrage)) : null,
      fehltListe(st, a),
      h('div', { class: 'aktionen' }, link('#/akte/' + a.id + '/verstehen', 'Akte übernehmen', 'btn btn--haupt'))));
  }

  function verstehen(host, a) {
    var karten = a.karten || [];
    if (!karten.length) { host.appendChild(h('p', null, 'Keine Karten.')); return; }
    var gesehen = W.state.data.karten[a.id];
    var i = gesehen == null || gesehen >= karten.length - 1 ? 0 : gesehen;
    function zeigen() {
      host.innerHTML = '';
      var k = karten[i];
      W.state.karteGesehen(a.id, i);
      host.appendChild(h('article', { class: 'wissen' },
        h('div', { class: 'wissen__kopf' }, h('span', { class: 'mono hinweis-klein' }, 'Karte ' + (i + 1) + ' / ' + karten.length), k.plus ? h('span', { class: 'tag tag--plus' }, 'Plus') : null),
        h('h2', null, k.titel),
        h('div', { class: 'wissen__text', html: k.text }),
        k.merk ? h('div', { class: 'merk' }, h('strong', null, 'Merke'), h('p', null, k.merk)) : null,
        k.achtung ? h('div', { class: 'achtung', html: k.achtung }) : null,
        h('div', { class: 'aktionen aktionen--zwei' },
          h('button', { type: 'button', class: 'btn', disabled: i === 0, onclick: function () { i--; zeigen(); } }, '← Zurück'),
          i < karten.length - 1 ? h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { i++; zeigen(); window.scrollTo(0, 0); } }, 'Weiter →')
            : link('#/akte/' + a.id + '/ueben', 'Zu den Übungen', 'btn btn--haupt'))));
    }
    zeigen();
  }

  function ueben(host, a, st) {
    var d = W.state.data.items;
    var liste = a.ueben || [];
    var pflicht = liste.filter(function (u) { return !u.plus; });
    var offen = pflicht.filter(function (u) { return !(d[u.id] && d[u.id].ok); });
    var plus = liste.length - pflicht.length;
    function los(items, titel) {
      host.innerHTML = '';
      var spielHost = h('div');
      host.appendChild(spielHost);
      W.aufgaben.spiele(spielHost, items, { titel: titel, melden: true, mischen: true, onFertig: function () { W.app.zeige(); } });
    }
    host.appendChild(h('div', null,
      karte('',
        h('p', null, h('span', { class: 'mono' }, Math.round(st.quote * 100) + ' %'), ' der Pflichtaufgaben sind gelöst. Zum Schließen brauchst du 80 %.'),
        h('div', { class: 'balken' }, h('span', { style: { width: Math.round(st.quote * 100) + '%' } })),
        h('p', { class: 'hinweis-klein' }, liste.length + ' Aufgaben, davon ' + plus + ' Plus (freiwillig, kommen in der Prüfung nicht vor).')),
      h('div', { class: 'aktionen aktionen--stapel' },
        offen.length ? h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { los(offen, 'Offene Aufgaben'); } }, 'Offene üben (' + offen.length + ')') : null,
        pflicht.length ? h('button', { type: 'button', class: 'btn' + (offen.length ? '' : ' btn--haupt'), onclick: function () { los(pflicht, 'Pflicht'); } }, 'Alle Pflichtaufgaben (' + pflicht.length + ')') : null,
        plus ? h('button', { type: 'button', class: 'btn', onclick: function () { los(liste.filter(function (u) { return u.plus; }), 'Plus'); } }, 'Nur Plus (' + plus + ')') : null,
        link('#/akte/' + a.id + '/gutachten', 'Weiter: Gutachten →', 'btn'))));
  }

  function gutachten(host, a, st) {
    function ergebnis() {
      var neu = status(a);
      return h('div', null,
        karte('epikrise', h('p', { class: 'aufnahme__kopf mono' }, 'ERGEBNIS · AKTE ' + a.nr), h('div', { html: a.ergebnis || '' })),
        fehltListe(neu, a),
        h('div', { class: 'aktionen' }, link('#/', 'Zurück zum Board', 'btn btn--haupt')));
    }
    if (st.gutachten) {
      host.appendChild(h('div', null, ergebnis(),
        h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn', onclick: start }, 'Gutachten wiederholen'))));
      return;
    }
    function start() {
      host.innerHTML = '';
      var sp = h('div');
      host.appendChild(sp);
      W.aufgaben.spiele(sp, a.gutachten || [], {
        titel: 'Gutachten', mischen: false, nochmal: false, gutachten: true, fertigText: 'Weiter',
        onFertig: function (erg) {
          host.innerHTML = '';
          if (erg.richtig === erg.gesamt) {
            W.state.abschlussSetzen(a.id);
            host.appendChild(ergebnis());
          } else {
            host.appendChild(h('div', null,
              karte('', h('p', null, 'Noch nicht alles richtig. Für das Gutachten müssen alle Aufgaben sitzen.')),
              h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', onclick: start }, 'Nochmal'))));
          }
        }
      });
    }
    host.appendChild(h('div', null,
      karte('', h('p', null, (a.gutachten || []).length + ' Aufgaben zum Fall. Alle richtig: Gutachten bestanden.')),
      h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', onclick: start }, 'Gutachten erstellen'))));
  }

  /* ---------- Wiedervorlage ---------- */
  function aufloesbar(id) { return id.indexOf('e:') === 0 ? !!erklNachId(id.slice(2)) : !!itemNachId(id); }
  /** Einträge entfernen, deren Aufgabe es nicht mehr gibt (z. B. nach einer Inhaltsänderung). */
  function aufraeumen() { W.state.wvListe().forEach(function (id) { if (!aufloesbar(id)) W.state.wvEntfernen(id); }); }
  function wvAnzahl() { return W.state.wvListe().filter(aufloesbar).length; }

  function wiedervorlage(host) {
    aufraeumen();
    var ids = W.state.wvListe();
    var items = ids.filter(function (id) { return id.indexOf('e:') !== 0; }).map(itemNachId).filter(Boolean);
    var erkl = ids.filter(function (id) { return id.indexOf('e:') === 0; }).map(function (id) { return erklNachId(id.slice(2)); }).filter(Boolean);
    var seite = h('div', { class: 'seite' });
    host.appendChild(seite);
    seite.appendChild(h('h1', null, 'Wiedervorlage'));
    if (!items.length && !erkl.length) {
      seite.appendChild(karte('', h('p', null, 'Keine Wiedervorlagen. Falsch beantwortete Aufgaben landen hier und bleiben, bis sie zweimal hintereinander sitzen.')));
      return;
    }
    var spiel = h('div');
    seite.appendChild(h('div', null,
      items.length ? karte('', h('p', null, items.length + (items.length === 1 ? ' Aufgabe' : ' Aufgaben') + ' kommen zurück. Erledigt ist eine Aufgabe nach zwei richtigen Antworten hintereinander.'),
        h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () {
          seite.innerHTML = '';
          seite.appendChild(spiel);
          W.aufgaben.spiele(spiel, items, { titel: 'Wiedervorlage', nochmal: false, onFertig: function () { W.app.zeige(); } });
        } }, 'Abarbeiten'))) : null,
      erkl.length ? h('div', null, h('h2', { class: 'zwischen' }, 'Erklärungen'),
        h('ol', { class: 'erkl-liste' }, erkl.map(function (x) {
          return h('li', null, h('button', { type: 'button', class: 'erkl-zeile', onclick: function () {
            seite.innerHTML = '';
            var e2 = h('div');
            seite.appendChild(e2);
            W.erklaeren.render(e2, x.erkl, { onFertig: function () { W.app.zeige(); } });
          } }, h('span', { class: 'erkl-zeile__frage', html: kurz(x.erkl.frage) }), h('span', { class: 'mono erkl-zeile__p schwach' }, Math.round(100 * ((W.state.data.erkl[x.erkl.id] || {}).prozent || 0)) + ' %')));
        })),
        h('p', { class: 'hinweis-klein' }, 'Erledigt, sobald du sie einmal mit mindestens 80 % neu bearbeitet hast.')) : null));
  }

  /* ---------- Einstellungen ---------- */
  function einstellungen(host) {
    var d = W.state.data;
    var name = h('input', { type: 'text', class: 'eingabe', maxlength: '30', placeholder: 'Vorname', value: d.name || '' });
    var code = h('textarea', { class: 'erkl__text', rows: '3', placeholder: 'Code hier einfügen' });
    host.appendChild(h('div', { class: 'seite' },
      h('h1', null, 'Einstellungen'),
      karte('', h('label', { class: 'feld' }, h('span', null, 'Dein Name (nur für die Kopfzeile)'), name),
        h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { W.state.setName(name.value); W.toast('Gespeichert', 'ok'); W.app.kopf(); } }, 'Speichern'))),
      W.ton ? karte('', h('label', { class: 'schalter' }, h('input', { type: 'checkbox', checked: !!d.ton, onchange: function (e) { W.state.set('ton', e.target.checked); } }), h('span', null, 'Ton bei richtigen Antworten'))) : null,
      karte('', h('h2', null, 'Fortschritt übertragen'),
        h('p', { class: 'hinweis-klein' }, 'Der Fortschritt bleibt nur auf diesem Gerät. Um auf einem anderen Gerät weiterzumachen, kopierst du den Code und fügst ihn dort ein.'),
        h('div', { class: 'aktionen aktionen--zwei' },
          h('button', { type: 'button', class: 'btn', onclick: function () {
            var c = W.state.exportCode();
            code.value = c;
            code.select();
            try { navigator.clipboard.writeText(c).then(function () { W.toast('Code kopiert', 'ok'); }, function () {}); } catch (e) { /* manuell kopieren */ }
          } }, 'Code erzeugen'),
          h('button', { type: 'button', class: 'btn', onclick: function () {
            if (!code.value.trim()) { W.toast('Erst einen Code einfügen'); return; }
            if (!window.confirm('Der Fortschritt auf diesem Gerät wird durch den Code ersetzt. Fortfahren?')) return;
            if (W.state.importCode(code.value)) { W.toast('Fortschritt übernommen', 'ok'); W.app.kopf(); } else W.toast('Code ungültig');
          } }, 'Code übernehmen')), code),
      karte('', h('h2', null, 'Neu anfangen'), h('p', { class: 'hinweis-klein' }, 'Löscht den gesamten Fortschritt auf diesem Gerät.'),
        h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--gefahr', onclick: function () {
          if (window.confirm('Wirklich alles löschen? Das lässt sich nicht rückgängig machen.')) { W.state.reset(); location.hash = '#/'; W.app.kopf(); }
        } }, 'Alles zurücksetzen'))),
      h('p', { class: 'hinweis-klein fuss' }, 'Alles bleibt auf diesem Gerät. Kein Konto, kein Server, kein Tracking.')));
  }

  /* ---------- Erster Start ---------- */
  function begruessung(onFertig) {
    var name = h('input', { type: 'text', class: 'eingabe', maxlength: '30', placeholder: 'Vorname', autocomplete: 'given-name' });
    function fertig(mitName) {
      if (mitName) W.state.setName(name.value);
      W.state.set('begruesst', true);
      dlg.remove();
      onFertig();
    }
    var dlg = h('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'dlg-titel' },
      h('div', { class: 'dialog__box' },
        h('p', { class: 'mono hinweis-klein' }, 'GUTACHTERBÜRO'),
        h('h1', { id: 'dlg-titel' }, 'Bremsspur'),
        h('p', null, 'Du bist Gutachter für Unfälle: Du lernst die Bewegungen in Akten, übst, schreibst Gutachten und schließt die Akten. Am Ende wartet die Prüfung.'),
        h('label', { class: 'feld' }, h('span', null, 'Wie heißt du? Bleibt auf diesem Gerät.'), name),
        h('div', { class: 'aktionen aktionen--zwei' },
          h('button', { type: 'button', class: 'btn', onclick: function () { fertig(false); } }, 'Ohne Namen'),
          h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { fertig(true); } }, 'Los geht’s'))));
    name.addEventListener('keydown', function (e) { if (e.key === 'Enter') fertig(true); });
    document.body.appendChild(dlg);
    name.focus();
  }

  W.ansichten = {
    board: board, akte: akte, wiedervorlage: wiedervorlage, einstellungen: einstellungen,
    begruessung: begruessung, akten: akten, wvAnzahl: wvAnzahl, akteNachId: akteNachId, itemNachId: itemNachId, karte: karte, link: link
  };
})();
