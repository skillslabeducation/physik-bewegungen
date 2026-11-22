/* Ansichten: Aktenschrank, Akte (Auftrag, Verstehen, Üben, Beschreiben, Gutachten), Nachermittlung, Einstellungen, Begrüßung. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };

  var STATUS_TEXT = { neu: 'neu', offen: 'offen', geschlossen: 'geschlossen', folgt: 'folgt' };
  var STATUS_ZEICHEN = { neu: '○', offen: '●', geschlossen: '✓', folgt: '…' };
  var CHEFIN = 'Dr. Hansen, Büroleiterin';
  var TRAINER_ANZAHL = 5;

  /** Frage ohne Material-Block, für Listen. */
  function kurz(frage) { return String(frage).replace(/<p class="material">[\s\S]*?<\/p>/, ''); }

  /** Alle neun Akten nach Nummer: Inhalt, falls geladen, sonst Platzhalter („folgt“). Akten außerhalb der Liste kommen dazu. */
  function akten() {
    var liste = W.AKTEN_LISTE || [];
    var geladen = {};
    (W.akten || []).forEach(function (a) {
      if (!a || !a.id) return;
      var bisher = geladen[a.id];
      if (!bisher || (bisher.folgt && !a.folgt)) geladen[a.id] = a;
    });
    var out = liste.map(function (e) { return geladen[e.id] || W.aktePlatzhalter(e.id); });
    Object.keys(geladen).forEach(function (id) {
      if (!liste.some(function (e) { return e.id === id; })) out.push(geladen[id]);
    });
    return out.sort(function (a, b) { return a.nr - b.nr; });
  }
  function akteNachId(id) { return akten().filter(function (a) { return a.id === id; })[0]; }
  function status(a) { return W.logic.akteStatus(a, W.state.data); }

  function naechsteAkte() {
    return akten().filter(function (a) { return !a.folgt && status(a).status !== 'geschlossen'; })[0] || null;
  }

  /** Aufgabe zu einer ID: Rechentrainer ('t:<id>', jedes Mal neue Zahlen), Prüfung, Akten. */
  var wurf = 0;
  function trainerBekannt(id) { return !!(W.trainer && W.trainer.IDS.indexOf(id) >= 0); }
  function itemNachId(id) {
    if (id.indexOf('t:') === 0) {
      var tid = id.slice(2);
      return trainerBekannt(tid) ? W.trainer.erzeuge(tid, W.physik.rnd(Date.now() + (wurf++))) : null;
    }
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

  function stempel(st) { return h('span', { class: 'stempel stempel--' + st }, STATUS_ZEICHEN[st] + ' ' + STATUS_TEXT[st]); }
  function link(href, text, cls) { return h('a', { href: href, class: cls || '' }, text); }
  function karte(cls) { var args = Array.prototype.slice.call(arguments, 1); return h.apply(null, ['section', { class: 'karte ' + (cls || '') }].concat(args)); }
  function prozent(x) { return Math.round(100 * x) + ' %'; }

  /* ---------- Aktenschrank ---------- */
  function aktenschrank(host) {
    var alle = akten();
    var rang = W.logic.rang(W.state.data, alle);
    var next = naechsteAkte();
    var nm = nmAnzahl();
    var best = W.state.data.pruefung.best || {};
    var laufend = W.state.pruefungLaufend();
    var pruefHinweis = laufend && !laufend.abgegeben ? h('a', { href: '#/pruefung', class: 'karte pruef-hinweis' }, h('strong', null, 'Prüfung läuft'), ' · weiter zur Prüfung →') : null;

    function zeile(a) {
      var st = status(a);
      var istNext = next && next.id === a.id;
      var inhalt = [
        h('span', { class: 'akte-zeile__nr mono' }, String(a.nr)),
        h('span', { class: 'akte-zeile__mitte' },
          h('span', { class: 'akte-zeile__fall' }, a.fall || ''),
          h('span', { class: 'akte-zeile__thema' }, a.titel, istNext ? h('span', { class: 'tag tag--next' }, 'als Nächstes') : null)),
        stempel(st.status)];
      return h('li', null, a.folgt
        ? h('div', { class: 'akte-zeile akte-zeile--folgt', 'aria-label': 'Akte ' + a.nr + ': ' + a.fall + ', folgt' }, inhalt)
        : h('a', { href: '#/akte/' + a.id, class: 'akte-zeile akte-zeile--' + st.status + (istNext ? ' akte-zeile--next' : '') }, inhalt));
    }

    host.appendChild(h('div', { class: 'seite schrank' },
      h('div', { class: 'seitenkopf' },
        h('p', { class: 'seitenkopf__ort mono' }, 'Gutachterbüro Bremsspur · Hamburg'),
        h('h1', null, 'Aktenschrank')),
      pruefHinweis,
      karte('rang',
        h('div', { class: 'rang__kopf' }, h('span', { class: 'rang__titel' }, rang.titel),
          h('span', { class: 'mono hinweis-klein' }, rang.geschlossen + ' von ' + alle.length + ' Akten geschlossen')),
        h('div', { class: 'balken', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(alle.length), 'aria-valuenow': String(rang.geschlossen) },
          h('span', { style: { width: Math.round(100 * rang.geschlossen / Math.max(1, alle.length)) + '%' } })),
        rang.naechster ? h('p', { class: 'hinweis-klein' }, 'Nächster Rang: ' + rang.naechster) : null),
      h('div', { class: 'protokoll' },
        h('div', { class: 'protokoll__kopf mono', 'aria-hidden': 'true' }, h('span', null, 'Nr.'), h('span', null, 'Fall und Thema'), h('span', null, 'Status')),
        h('ol', { class: 'akten-liste' }, alle.map(zeile))),
      h('div', { class: 'kacheln' },
        h('a', { href: '#/nachermittlung', class: 'kachel' + (nm ? ' kachel--amber' : '') }, h('span', { class: 'kachel__zahl mono' }, String(nm)), h('span', null, 'Nachermittlung')),
        h('a', { href: '#/pruefung', class: 'kachel' }, h('span', { class: 'kachel__zahl mono' }, best['1'] ? prozent(best['1']) : '—'), h('span', null, 'Prüfung')),
        h('a', { href: '#/formelkarte', class: 'kachel' }, h('span', { class: 'kachel__zahl mono' }, 'A4'), h('span', null, 'Formelkarte')),
        h('a', { href: '#/radarfalle', class: 'kachel' }, h('span', { class: 'kachel__zahl mono' }, W.radar ? String(W.state.data.radar.best || 0) : 'folgt'), h('span', null, 'Radarfalle')))));
  }

  /* ---------- Akte ---------- */
  function tabsFuer(a) {
    var t = [['auftrag', 'Auftrag'], ['verstehen', 'Verstehen'], ['ueben', 'Üben']];
    if (a.erklaeren && a.erklaeren.length) t.push(['beschreiben', 'Beschreiben']);
    t.push(['gutachten', 'Gutachten']);
    return t;
  }

  function fehltListe(st, a) {
    if (st.status === 'geschlossen') return h('p', { class: 'ok-text' }, '✓ Akte geschlossen.');
    function ziel(t) { return /Übung/.test(t) ? 'ueben' : 'gutachten'; }
    return h('div', { class: 'fehlt' }, h('p', { class: 'fehlt__titel' }, 'Bis zum Schließen fehlt:'),
      h('ul', null, st.fehlt.map(function (t) { return h('li', null, h('a', { href: '#/akte/' + a.id + '/' + ziel(t) }, t)); })));
  }

  function akte(host, id, tab) {
    var a = akteNachId(id);
    if (!a || a.folgt) {
      host.appendChild(h('div', { class: 'seite' }, karte('', h('p', null, a ? 'Akte ' + a.nr + ' („' + a.fall + '“) folgt.' : 'Diese Akte gibt es nicht.'),
        h('div', { class: 'aktionen' }, link('#/', 'Zum Aktenschrank', 'btn btn--haupt')))));
      return;
    }
    var tabs = tabsFuer(a);
    if (!tabs.some(function (t) { return t[0] === tab; })) tab = 'auftrag';
    var st = status(a);
    var inhalt = h('div', { class: 'akte__inhalt' });
    host.appendChild(h('div', { class: 'seite akte' },
      h('div', { class: 'akte__kopf' },
        link('#/', '← Aktenschrank', 'zurueck'),
        h('p', { class: 'akte__nr mono' }, 'Akte ' + a.nr + ' · ' + a.titel),
        h('div', { class: 'akte__titelzeile' }, h('h1', null, a.fall), stempel(st.status))),
      h('nav', { class: 'tabs', 'aria-label': 'Abschnitte der Akte' }, tabs.map(function (t) {
        return h('a', { href: '#/akte/' + a.id + '/' + t[0], class: 'reiter' + (t[0] === tab ? ' reiter--an' : ''), 'aria-current': t[0] === tab ? 'page' : null }, t[1]);
      })),
      inhalt));
    ({ auftrag: auftrag, verstehen: verstehen, ueben: ueben, beschreiben: beschreiben, gutachten: gutachten }[tab])(inhalt, a, st);
  }

  function auftrag(host, a, st) {
    var t = a.auftrag || {};
    host.appendChild(h('div', null,
      karte('blatt', h('p', { class: 'blatt__kopf mono' }, 'Auftrag · Akte ' + a.nr),
        h('div', { class: 'auftrag__text', html: t.text || '' }),
        t.daten ? h('div', { class: 'messdaten' }, h('p', { class: 'messdaten__titel mono' }, 'Messdaten'), h('div', { class: 'tab-wrap', html: t.daten })) : null),
      t.chefin ? h('blockquote', { class: 'chefin' }, h('p', null, t.chefin), h('footer', { class: 'chefin__wer mono' }, CHEFIN)) : null,
      t.leitfrage ? h('div', { class: 'leitfrage' }, h('p', { class: 'leitfrage__titel mono' }, 'Leitfrage'), h('p', { class: 'leitfrage__text' }, t.leitfrage)) : null,
      fehltListe(st, a),
      h('div', { class: 'aktionen' }, h('a', { href: '#/akte/' + a.id + '/verstehen', class: 'btn btn--haupt', 'data-enter': '' }, 'Akte übernehmen'))));
  }

  /** Video-Links der Akte (nie eingebettet). */
  function videoLinks(a) {
    var v = (W.videos && W.videos[a.id]) || [];
    if (!v.length) return null;
    return h('div', { class: 'videos' }, v.map(function (x) {
      var teile = [x.titel, x.kanal];
      if (x.dauer) teile.push(x.dauer);
      teile.push('öffnet YouTube');
      return h('a', { class: 'video', href: 'https://www.youtube.com/watch?v=' + encodeURIComponent(x.id), target: '_blank', rel: 'noopener' },
        h('strong', null, 'Video: '), teile.join(' · '));
    }));
  }

  function verstehen(host, a) {
    var karten = a.karten || [];
    if (!karten.length) { host.appendChild(karte('', h('p', null, 'Keine Karten.'))); return; }
    var gesehen = W.state.data.karten[a.id];
    var i = gesehen == null || gesehen >= karten.length - 1 ? 0 : gesehen;
    function zeigen() {
      host.innerHTML = '';
      var k = karten[i];
      W.state.karteGesehen(a.id, i);
      var letzte = i === karten.length - 1;
      host.appendChild(h('div', null, h('article', { class: 'wissen' },
        h('div', { class: 'wissen__kopf' }, h('span', { class: 'mono hinweis-klein' }, 'Karte ' + (i + 1) + ' / ' + karten.length), k.plus ? h('span', { class: 'tag tag--plus' }, 'Plus') : null),
        i === 0 ? videoLinks(a) : null,
        h('h2', null, k.titel),
        h('div', { class: 'wissen__text', html: k.text || '' }),
        k.abb && W.diagramm ? h('figure', { class: 'abb' }, W.diagramm.zeichne(k.abb)) : null,
        k.merk ? h('div', { class: 'merk' }, h('strong', null, 'Merke'), h('p', { html: k.merk })) : null,
        k.achtung ? h('div', { class: 'achtung' }, h('strong', null, 'Achtung, Falle'), h('div', { html: k.achtung })) : null),
        h('div', { class: 'aktionen aktionen--zwei' },
          h('button', { type: 'button', class: 'btn', disabled: i === 0, onclick: function () { i--; zeigen(); } }, '← Zurück'),
          letzte ? h('a', { href: '#/akte/' + a.id + '/ueben', class: 'btn btn--haupt', 'data-enter': '' }, 'Zu den Übungen →')
            : h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: function () { i++; zeigen(); window.scrollTo(0, 0); } }, 'Weiter →'))));
    }
    zeigen();
  }

  /** Rechentrainer: neue Zahlen bei jedem Start, reihum aus den Trainern der Akte. */
  function trainerItems(a) {
    var ids = W.shuffle((a.trainer || []).filter(trainerBekannt));
    var out = [];
    for (var k = 0; k < TRAINER_ANZAHL && ids.length; k++) {
      out.push(W.trainer.erzeuge(ids[k % ids.length], W.physik.rnd(Date.now() + (wurf++) * 7919)));
    }
    return out;
  }

  function ueben(host, a, st) {
    var d = W.state.data.items;
    var liste = a.ueben || [];
    var pflicht = liste.filter(function (u) { return !u.plus; });
    var offen = pflicht.filter(function (u) { return !(d[u.id] && d[u.id].ok); });
    var plus = liste.length - pflicht.length;
    var hatTrainer = (a.trainer || []).some(trainerBekannt);
    function los(items, titel) {
      host.innerHTML = '';
      var spielHost = h('div');
      host.appendChild(spielHost);
      W.aufgaben.spiele(spielHost, items, { titel: titel, melden: true, mischen: true, onFertig: function () { W.app.zeige(); } });
    }
    host.appendChild(h('div', null,
      karte('',
        h('p', null, h('span', { class: 'mono' }, prozent(st.quote)), ' der Pflichtaufgaben sind gelöst. Zum Schließen brauchst du 80 %.'),
        h('div', { class: 'balken' }, h('span', { style: { width: Math.round(st.quote * 100) + '%' } })),
        h('p', { class: 'hinweis-klein' }, liste.length + ' Aufgaben' + (plus ? ', davon ' + plus + ' Plus (freiwillig, kommen in der Prüfung nicht vor).' : '.'))),
      h('div', { class: 'aktionen aktionen--stapel' },
        offen.length ? h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: function () { los(offen, 'Offene Aufgaben'); } }, 'Offene üben (' + offen.length + ')') : null,
        pflicht.length ? h('button', { type: 'button', class: 'btn' + (offen.length ? '' : ' btn--haupt'), onclick: function () { los(pflicht, 'Pflichtaufgaben'); } }, 'Alle Pflichtaufgaben (' + pflicht.length + ')') : null,
        plus ? h('button', { type: 'button', class: 'btn', onclick: function () { los(liste.filter(function (u) { return u.plus; }), 'Plus'); } }, 'Nur Plus (' + plus + ')') : null),
      hatTrainer ? karte('trainer',
        h('h2', null, 'Rechentrainer'),
        h('p', { class: 'hinweis-klein' }, TRAINER_ANZAHL + ' Rechenaufgaben mit neuen Zahlen bei jedem Start. Zählt nicht zur Quote, Fehler kommen in die Nachermittlung.'),
        h('div', { class: 'aktionen aktionen--links' },
          h('button', { type: 'button', class: 'btn', onclick: function () { los(trainerItems(a), 'Rechentrainer'); } }, 'Rechentrainer starten'))) : null,
      h('div', { class: 'aktionen' }, link('#/akte/' + a.id + '/' + (a.erklaeren && a.erklaeren.length ? 'beschreiben' : 'gutachten'), 'Weiter: ' + (a.erklaeren && a.erklaeren.length ? 'Beschreiben' : 'Gutachten') + ' →', 'btn'))));
  }

  function beschreiben(host, a) {
    var d = W.state.data.erkl;
    function liste() {
      host.innerHTML = '';
      host.appendChild(h('div', null,
        h('p', { class: 'hinweis-klein' }, '„Beschreibe den Graphen“ wie in der Arbeit: schreiben, dann mit dem Erwartungshorizont vergleichen. Zählt nicht zum Schließen der Akte.'),
        h('ol', { class: 'erkl-liste' }, a.erklaeren.map(function (e, i) {
          var r = d[e.id];
          var p = r ? Math.round(100 * r.best) : null;
          return h('li', null, h('button', { type: 'button', class: 'erkl-zeile', onclick: function () { oeffnen(e); } },
            h('span', { class: 'mono erkl-zeile__nr' }, String(i + 1)),
            h('span', { class: 'erkl-zeile__frage', html: kurz(e.frage) }),
            e.plus ? h('span', { class: 'tag tag--plus' }, 'Plus') : null,
            h('span', { class: 'mono erkl-zeile__p ' + (p == null ? '' : p >= 60 ? 'gut' : 'schwach') }, p == null ? 'offen' : p + ' %')));
        })),
        h('div', { class: 'aktionen' }, link('#/akte/' + a.id + '/gutachten', 'Weiter: Gutachten →', 'btn'))));
    }
    function oeffnen(e) {
      host.innerHTML = '';
      var e2 = h('div');
      host.appendChild(e2);
      W.erklaeren.render(e2, e, { onFertig: function () { W.app.zeige(); } });
    }
    liste();
  }

  function gutachten(host, a, st) {
    function ergebnis() {
      var neu = status(a);
      return h('div', null,
        karte('blatt gutachten-blatt',
          h('p', { class: 'blatt__kopf mono' }, 'Gutachten · Akte ' + a.nr),
          h('div', { html: a.ergebnis || '' }),
          neu.status === 'geschlossen' ? h('p', { class: 'stempel stempel--gross stempel--geschlossen' }, 'Akte geschlossen') : null),
        fehltListe(neu, a),
        h('div', { class: 'aktionen' }, link('#/', 'Zurück zum Aktenschrank', 'btn btn--haupt')));
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
              karte('', h('p', null, 'Noch nicht alles richtig. Für das Gutachten müssen alle Fragen sitzen. Versuche sind unbegrenzt.')),
              h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: start }, 'Nochmal'))));
          }
        }
      });
    }
    if (st.gutachten) {
      host.appendChild(h('div', null, ergebnis(),
        h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn', onclick: start }, 'Gutachten wiederholen'))));
      return;
    }
    host.appendChild(h('div', null,
      karte('', h('p', null, (a.gutachten || []).length + ' Fragen zum Fall. Sind alle richtig, ist das Gutachten bestanden.'),
        a.auftrag && a.auftrag.leitfrage ? h('p', { class: 'hinweis-klein' }, 'Leitfrage: ' + a.auftrag.leitfrage) : null),
      h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: start }, 'Gutachten erstellen'))));
  }

  /* ---------- Nachermittlung ---------- */
  function aufloesbar(id) {
    if (id.indexOf('e:') === 0) return !!erklNachId(id.slice(2));
    if (id.indexOf('t:') === 0) return trainerBekannt(id.slice(2));
    return !!itemNachId(id);
  }
  /** Einträge entfernen, deren Aufgabe es nicht mehr gibt (z. B. nach einer Inhaltsänderung). */
  function aufraeumen() { W.state.wvListe().forEach(function (id) { if (!aufloesbar(id)) W.state.wvEntfernen(id); }); }
  function nmAnzahl() { return W.state.wvListe().filter(aufloesbar).length; }

  function nachermittlung(host) {
    aufraeumen();
    var ids = W.state.wvListe();
    var items = ids.filter(function (id) { return id.indexOf('e:') !== 0; }).map(itemNachId).filter(Boolean);
    var erkl = ids.filter(function (id) { return id.indexOf('e:') === 0; }).map(function (id) { return erklNachId(id.slice(2)); }).filter(Boolean);
    var seite = h('div', { class: 'seite' });
    host.appendChild(seite);
    seite.appendChild(h('div', { class: 'seitenkopf' }, h('p', { class: 'seitenkopf__ort mono' }, 'Offene Punkte'), h('h1', null, 'Nachermittlung')));
    if (!items.length && !erkl.length) {
      seite.appendChild(karte('', h('p', null, 'Nichts offen. Falsch gelöste Aufgaben landen hier und bleiben, bis sie zweimal hintereinander sitzen. Aufgaben aus dem Rechentrainer kommen mit neuen Zahlen zurück.')));
      return;
    }
    var spiel = h('div');
    seite.appendChild(h('div', null,
      items.length ? karte('nm-karte', h('p', null, items.length + (items.length === 1 ? ' Aufgabe kommt' : ' Aufgaben kommen') + ' zurück. Erledigt ist eine Aufgabe nach zwei richtigen Antworten hintereinander.'),
        h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: function () {
          seite.innerHTML = '';
          seite.appendChild(spiel);
          W.aufgaben.spiele(spiel, items, { titel: 'Nachermittlung', nochmal: false, onFertig: function () { W.app.zeige(); } });
        } }, 'Abarbeiten'))) : null,
      erkl.length ? h('div', null, h('h2', { class: 'zwischen' }, 'Beschreibungen'),
        h('ol', { class: 'erkl-liste' }, erkl.map(function (x) {
          return h('li', null, h('button', { type: 'button', class: 'erkl-zeile', onclick: function () {
            seite.innerHTML = '';
            var e2 = h('div');
            seite.appendChild(e2);
            W.erklaeren.render(e2, x.erkl, { onFertig: function () { W.app.zeige(); } });
          } }, h('span', { class: 'erkl-zeile__frage', html: kurz(x.erkl.frage) }), h('span', { class: 'mono erkl-zeile__p schwach' }, prozent((W.state.data.erkl[x.erkl.id] || {}).prozent || 0))));
        })),
        h('p', { class: 'hinweis-klein' }, 'Erledigt, sobald du sie einmal mit mindestens 80 % neu bearbeitet hast.')) : null));
  }

  /* ---------- Einstellungen ---------- */
  function einstellungen(host) {
    var d = W.state.data;
    var name = h('input', { type: 'text', class: 'eingabe', maxlength: '30', placeholder: 'Vorname', value: d.name || '' });
    var code = h('textarea', { class: 'erkl__text', rows: '3', placeholder: 'Code hier einfügen' });
    function speichern() { W.state.setName(name.value); W.toast('Gespeichert', 'ok'); W.app.kopf(); }
    name.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); speichern(); } });
    host.appendChild(h('div', { class: 'seite' },
      h('div', { class: 'seitenkopf' }, h('p', { class: 'seitenkopf__ort mono' }, 'Namensschild'), h('h1', null, 'Einstellungen')),
      karte('', h('label', { class: 'feld' }, h('span', null, 'Dein Vorname (nur für das Namensschild)'), name),
        h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', onclick: speichern }, 'Speichern'))),
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
        h('p', { class: 'mono seitenkopf__ort' }, 'Gutachterbüro Bremsspur · Hamburg'),
        h('h1', { id: 'dlg-titel' }, 'Erster Tag im Büro'),
        h('p', null, 'Du arbeitest als Gutachter für Verkehrsunfälle. In jeder Akte lernst du eine Bewegungsart, übst und schreibst das Gutachten. Am Ende steht die Sachverständigenprüfung.'),
        h('label', { class: 'feld' }, h('span', null, 'Dein Vorname fürs Namensschild. Bleibt auf diesem Gerät.'), name),
        h('div', { class: 'aktionen aktionen--zwei' },
          h('button', { type: 'button', class: 'btn', onclick: function () { fertig(false); } }, 'Ohne Namen'),
          h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { fertig(true); } }, 'Anfangen'))));
    name.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fertig(true); } });
    document.body.appendChild(dlg);
    name.focus();
  }

  W.ansichten = {
    aktenschrank: aktenschrank, akte: akte, nachermittlung: nachermittlung, einstellungen: einstellungen,
    begruessung: begruessung, akten: akten, nmAnzahl: nmAnzahl, akteNachId: akteNachId, itemNachId: itemNachId,
    naechsteAkte: naechsteAkte, karte: karte, link: link
  };
})();
