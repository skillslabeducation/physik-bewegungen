/* Aufgaben-Engine: prüft Antworten (rein, testbar) und zeigt Aufgaben an.
   Typen: wahl, mehrfach, luecke, eingabe, liste, zuordnen, reihenfolge, beschriften,
   tabelle, matrix, kreuzung, zahl, behauptung. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };

  /* ---------- reine Hilfen ---------- */

  function parseLuecke(text) {
    var out = [], re = /\{([^}]+)\}/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ text: text.slice(last, m.index) });
      out.push({ optionen: m[1].split('|') });
      last = re.lastIndex;
    }
    if (last < text.length) out.push({ text: text.slice(last) });
    return out;
  }
  function luecken(item) { return parseLuecke(item.text).filter(function (s) { return s.optionen; }); }

  function gleicheMenge(a, b) {
    if (!Array.isArray(a) || a.length !== b.length) return false;
    var x = a.slice().sort(), y = b.slice().sort();
    return x.every(function (v, i) { return v === y[i]; });
  }

  function anteil(n, gesamt) { return gesamt ? n / gesamt : 0; }

  function offeneZellen(item) {
    var out = [];
    item.zeilen.forEach(function (z, zi) {
      z.zellen.forEach(function (c, ci) { if (c.fix == null) out.push({ zi: zi, ci: ci, c: c }); });
    });
    return out;
  }

  /** Prozentfeld lesen. Leer zählt als 0 %, sobald mindestens ein Feld ausgefüllt ist. */
  function prozentWert(prozent, gr) {
    prozent = prozent || {};
    var irgendwas = Object.keys(prozent).some(function (k) { return String(prozent[k] == null ? '' : prozent[k]).trim() !== ''; });
    var roh = String(prozent[gr] == null ? '' : prozent[gr]).trim();
    if (!roh) return irgendwas ? 0 : NaN;
    return W.text.parseZahl(roh);
  }

  function zahlPasst(item, wert) {
    var z = W.text.parseZahl(wert);
    if (isNaN(z)) return false;
    var tol = item.tol == null ? 0.01 : item.tol;
    return [item.antwort].concat(item.auch || []).some(function (a) { return Math.abs(z - a) <= tol + 1e-9; });
  }

  /** Anteil richtig, 0..1. Leere oder kaputte Antworten ergeben 0. */
  function score(item, a) {
    if (a == null) return 0;
    try {
      switch (item.typ) {
        case 'wahl': return a === item.richtig ? 1 : 0;
        case 'mehrfach': return gleicheMenge(a, item.richtig) ? 1 : 0;
        case 'luecke': {
          var l = luecken(item);
          return anteil(l.filter(function (s, i) { return a[i] === s.optionen[0]; }).length, l.length);
        }
        case 'eingabe': return W.text.passt(a, item.akzeptiert, item.nicht) ? 1 : 0;
        case 'liste': return anteil(W.text.liste(a, item.gruppen, item.anzahl).treffer, item.anzahl);
        case 'zuordnen': return anteil(item.paare.filter(function (p, i) { return a[i] === i; }).length, item.paare.length);
        case 'reihenfolge':
          return a.length === item.schritte.length && a.every(function (x, i) { return x === i; }) ? 1 : 0;
        case 'beschriften':
          return anteil(item.strukturen.filter(function (id) { return a[id] === id; }).length, item.strukturen.length);
        case 'tabelle': {
          var o = offeneZellen(item);
          return anteil(o.filter(function (z) { return a[z.zi] && a[z.zi][z.ci] === z.c.richtig; }).length, o.length);
        }
        case 'matrix': {
          var n = 0, ges = 0;
          item.richtig.forEach(function (zeile, i) {
            zeile.forEach(function (v, j) { ges++; if (!!(a[i] && a[i][j]) === v) n++; });
          });
          return anteil(n, ges);
        }
        case 'kreuzung': {
          var soll = W.bio.kreuzung(item.mutter, item.vater), treffer = 0, gesamt = 4;
          soll.forEach(function (z, i) { z.forEach(function (g, j) { if (a.felder && a.felder[i] && a.felder[i][j] === g) treffer++; }); });
          if (item.mitWahrscheinlichkeit) {
            var v = W.bio.verteilung(item.mutter, item.vater);
            W.bio.GRUPPEN.forEach(function (gr) {
              gesamt++;
              var z = prozentWert(a.prozent, gr);
              if (!isNaN(z) && Math.abs(z - v[gr]) < 0.01) treffer++;
            });
          }
          return anteil(treffer, gesamt);
        }
        case 'zahl': return zahlPasst(item, a) ? 1 : 0;
        case 'behauptung': {
          if (a.stimmt !== item.stimmt) return 0;
          return a.grund === item.richtig ? 1 : 0.5;
        }
      }
    } catch (e) { return 0; }
    return 0;
  }

  function richtig(item, a) { return score(item, a) >= 1 - 1e-9; }

  /** Wurde gar nicht geantwortet? Dann zählt „Prüfen“ nicht als Fehler. */
  function leer(item, a) {
    if (a == null) return true;
    function nichts(x) { return x == null || x === '' || x === false || (typeof x === 'string' && !x.trim()); }
    function tief(x) {
      if (Array.isArray(x)) return x.every(tief);
      if (x && typeof x === 'object') return Object.keys(x).every(function (k) { return tief(x[k]); });
      return nichts(x);
    }
    if (item.typ === 'wahl') return a === null;
    if (item.typ === 'behauptung') return a.stimmt == null;
    if (item.typ === 'reihenfolge' && item.startFest) return !a || a.length <= 1;
    return tief(a);
  }

  /** Die Musterlösung im Antwortformat des Typs. */
  function loesung(item) {
    switch (item.typ) {
      case 'wahl': return item.richtig;
      case 'mehrfach': return item.richtig.slice();
      case 'luecke': return luecken(item).map(function (s) { return s.optionen[0]; });
      case 'eingabe': return item.akzeptiert[0];
      case 'liste': return item.gruppen.slice(0, item.anzahl).map(function (g) { return g[0]; });
      case 'zuordnen': return item.paare.map(function (p, i) { return i; });
      case 'reihenfolge': return item.schritte.map(function (s, i) { return i; });
      case 'beschriften': {
        var o = {};
        item.strukturen.forEach(function (id) { o[id] = id; });
        return o;
      }
      case 'tabelle': return item.zeilen.map(function (z) { return z.zellen.map(function (c) { return c.fix != null ? null : c.richtig; }); });
      case 'matrix': return item.richtig.map(function (z) { return z.slice(); });
      case 'kreuzung': return { felder: W.bio.kreuzung(item.mutter, item.vater), prozent: W.bio.verteilung(item.mutter, item.vater) };
      case 'zahl': return String(item.antwort);
      case 'behauptung': return { stimmt: item.stimmt, grund: item.richtig };
    }
    return null;
  }

  function ohneTags(t) { return String(t).replace(/<sub>(.*?)<\/sub>/g, '$1').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
  function zahlText(x) { return String(x).replace('.', ','); }
  function label(abb, id) {
    var l = W.abb && W.abb.liste && W.abb.liste[abb] && W.abb.liste[abb].strukturen[id];
    return l ? l.label : id;
  }

  /** Die Lösung als lesbarer Text. */
  function loesungText(item, nummern) {
    switch (item.typ) {
      case 'wahl': return ohneTags(item.optionen[item.richtig]);
      case 'mehrfach': return item.richtig.map(function (i) { return ohneTags(item.optionen[i]); }).join('; ');
      case 'luecke': return ohneTags(item.text.replace(/\{([^}|]+)[^}]*\}/g, '$1'));
      case 'eingabe': return item.akzeptiert[0];
      case 'liste': return item.gruppen.map(function (g) { return g[0]; }).join(', ') + (item.gruppen.length > item.anzahl ? ' (' + item.anzahl + ' davon genügen)' : '');
      case 'zuordnen': return item.paare.map(function (p) { return ohneTags(p[0]) + ' → ' + ohneTags(p[1]); }).join('; ');
      case 'reihenfolge': return item.schritte.map(ohneTags).join(' → ');
      case 'beschriften':
        return item.strukturen.map(function (id) { return (nummern && nummern[id] ? nummern[id] + ' = ' : '') + label(item.abb, id); })
          .sort(function (x, y) { return parseInt(x, 10) - parseInt(y, 10); }).join(', ');
      case 'tabelle': return item.zeilen.map(function (z) {
        return ohneTags(z.kopf) + ': ' + z.zellen.map(function (c) { return c.fix != null ? c.fix : c.optionen[c.richtig]; }).join(' | ');
      }).join('; ');
      case 'matrix': return item.zeilen.map(function (z, i) {
        var ja = item.spalten.filter(function (s, j) { return item.richtig[i][j]; });
        return z + ' → ' + (ja.length ? ja.join(', ') : 'keine');
      }).join('; ');
      case 'kreuzung': {
        var k = W.bio.kreuzung(item.mutter, item.vater);
        var t = 'Kinder: ' + k[0].concat(k[1]).join(', ');
        if (item.mitWahrscheinlichkeit) {
          var v = W.bio.verteilung(item.mutter, item.vater);
          t += '. Blutgruppe ' + W.bio.GRUPPEN.map(function (g) { return g + ': ' + v[g] + ' %'; }).join(', ');
        }
        return t;
      }
      case 'zahl': return zahlText(item.antwort) + (item.einheit ? ' ' + item.einheit : '');
      case 'behauptung': return (item.stimmt ? 'Stimmt. ' : 'Stimmt nicht. ') + ohneTags(item.gruende[item.richtig]);
    }
    return '';
  }

  /* ---------- Anzeige ---------- */

  function figur(name, opts) {
    if (!name || !W.abb || !W.abb.zeichne) return null;
    return h('figure', { class: 'abb' }, W.abb.zeichne(name, opts || {}));
  }

  function auswahl(optionen, onchange, platzhalter) {
    var sel = h('select', { class: 'auswahl', onchange: function () { onchange(sel.value === '' ? null : sel.value); } },
      h('option', { value: '' }, platzhalter || 'wählen …'),
      optionen.map(function (o) { return h('option', { value: String(o.wert) }, o.text); }));
    return sel;
  }

  var R = {};

  R.wahl = function (item, ctx, mehr) {
    var reihenfolge = item.fest ? item.optionen.map(function (o, i) { return i; }) : W.shuffle(item.optionen.map(function (o, i) { return i; }));
    var gew = mehr ? [] : null;
    var knoepfe = [];
    var el = h('div', { class: 'opts' }, reihenfolge.map(function (i) {
      var b = h('button', { type: 'button', class: 'opt', html: item.optionen[i], onclick: function () {
        if (el.classList.contains('fertig')) return;
        if (mehr) {
          var p = gew.indexOf(i);
          if (p >= 0) gew.splice(p, 1); else gew.push(i);
          b.classList.toggle('gewaehlt', p < 0);
          b.setAttribute('aria-pressed', p < 0 ? 'true' : 'false');
        } else {
          gew = i;
          knoepfe.forEach(function (k) { k.b.classList.toggle('gewaehlt', k.i === i); });
        }
      } });
      knoepfe.push({ b: b, i: i });
      return b;
    }));
    return {
      el: h('div', null, mehr ? h('p', { class: 'hinweis-klein' }, 'Mehrere Antworten können richtig sein.') : null, el),
      antwort: function () { return mehr ? gew.slice() : gew; },
      setze: function (w) {
        gew = mehr ? (w || []).slice() : w;
        knoepfe.forEach(function (k) {
          var an = mehr ? gew.indexOf(k.i) >= 0 : gew === k.i;
          k.b.classList.toggle('gewaehlt', an);
          if (mehr) k.b.setAttribute('aria-pressed', an ? 'true' : 'false');
        });
      },
      zeige: function () {
        el.classList.add('fertig');
        var soll = mehr ? item.richtig : [item.richtig];
        knoepfe.forEach(function (k) {
          var gewaehlt = mehr ? gew.indexOf(k.i) >= 0 : gew === k.i;
          if (soll.indexOf(k.i) >= 0) k.b.classList.add('richtig');
          else if (gewaehlt) k.b.classList.add('falsch');
        });
      }
    };
  };
  R.mehrfach = function (item, ctx) { return R.wahl(item, ctx, true); };

  R.luecke = function (item) {
    var werte = [], sels = [];
    var teile = parseLuecke(item.text);
    var gi = 0;
    var el = h('p', { class: 'luecke' }, teile.map(function (s) {
      if (s.text != null) return h('span', { html: s.text });
      var idx = gi++;
      werte[idx] = null;
      var sel = auswahl(W.shuffle(s.optionen).map(function (o) { return { wert: o, text: o }; }), function (v) { werte[idx] = v; }, '…');
      sels.push({ sel: sel, soll: s.optionen[0] });
      return sel;
    }));
    return {
      el: el, antwort: function () { return werte.slice(); },
      setze: function (w) { sels.forEach(function (s, i) { if (w[i] != null) { s.sel.value = w[i]; werte[i] = w[i]; } }); },
      zeige: function () { sels.forEach(function (s, i) { s.sel.disabled = true; s.sel.classList.add(werte[i] === s.soll ? 'richtig' : 'falsch'); }); }
    };
  };

  function textfeld(ph, onin) {
    return h('input', { type: 'text', class: 'eingabe', placeholder: ph || 'Antwort', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', oninput: onin });
  }

  R.eingabe = function (item) {
    var inp = textfeld('Fachbegriff');
    return {
      el: inp, antwort: function () { return inp.value; },
      setze: function (w) { inp.value = w || ''; },
      zeige: function () { inp.disabled = true; inp.classList.add(W.text.passt(inp.value, item.akzeptiert, item.nicht) ? 'richtig' : 'falsch'); }
    };
  };

  R.liste = function (item) {
    var felder = [];
    for (var i = 0; i < item.anzahl; i++) felder.push(textfeld((i + 1) + '.'));
    return {
      el: h('div', { class: 'liste' }, felder),
      antwort: function () { return felder.map(function (f) { return f.value; }); },
      setze: function (w) { felder.forEach(function (f, i) { f.value = (w && w[i]) || ''; }); },
      zeige: function () {
        var z = W.text.liste(felder.map(function (f) { return f.value; }), item.gruppen, item.anzahl).zuordnung;
        felder.forEach(function (f, i) { f.disabled = true; f.classList.add(z[i] >= 0 ? 'richtig' : 'falsch'); });
      }
    };
  };

  R.zuordnen = function (item) {
    var werte = item.paare.map(function () { return null; });
    var rechts = W.shuffle(item.paare.map(function (p, i) { return { wert: i, text: ohneTags(p[1]) }; }));
    var sels = [];
    var el = h('div', { class: 'zuordnen' }, item.paare.map(function (p, i) {
      var sel = auswahl(rechts, function (v) { werte[i] = v == null ? null : +v; });
      sels.push(sel);
      return h('label', { class: 'zuordnen__zeile' }, h('span', { html: p[0] }), sel);
    }));
    return {
      el: el, antwort: function () { return werte.slice(); },
      setze: function (w) { sels.forEach(function (s, i) { if (w[i] != null) { s.value = String(w[i]); werte[i] = w[i]; } }); },
      zeige: function () { sels.forEach(function (s, i) { s.disabled = true; s.classList.add(werte[i] === i ? 'richtig' : 'falsch'); }); }
    };
  };

  R.reihenfolge = function (item) {
    var gewaehlt = [];
    var reihe = h('ol', { class: 'reihe' });
    var pool = h('div', { class: 'pool' });
    var start = item.startFest ? [0] : [];
    var rest = W.shuffleNot(item.schritte.map(function (s, i) { return i; }).filter(function (i) { return start.indexOf(i) < 0; }));
    function zeichnen() {
      reihe.innerHTML = '';
      pool.innerHTML = '';
      start.concat(gewaehlt).forEach(function (i, pos) {
        var fest = pos < start.length;
        reihe.appendChild(h('li', null, h('button', { type: 'button', class: 'chip chip--reihe' + (fest ? ' chip--fest' : ''), html: item.schritte[i], disabled: fest || reihe.classList.contains('fertig'), onclick: function () {
          gewaehlt.splice(gewaehlt.indexOf(i), 1); zeichnen();
        } })));
      });
      rest.filter(function (i) { return gewaehlt.indexOf(i) < 0; }).forEach(function (i) {
        pool.appendChild(h('button', { type: 'button', class: 'chip', html: item.schritte[i], onclick: function () { gewaehlt.push(i); zeichnen(); } }));
      });
    }
    zeichnen();
    return {
      el: h('div', { class: 'reihenfolge' }, h('p', { class: 'hinweis-klein' }, 'Tippe die Stationen in der richtigen Reihenfolge an. Antippen in der Liste nimmt sie wieder heraus.'), reihe, pool),
      antwort: function () { return start.concat(gewaehlt); },
      setze: function (w) { gewaehlt = (w || []).filter(function (i) { return start.indexOf(i) < 0; }); zeichnen(); },
      zeige: function () {
        reihe.classList.add('fertig');
        Array.prototype.forEach.call(reihe.querySelectorAll('button'), function (b, pos) {
          b.disabled = true;
          b.classList.add(start.concat(gewaehlt)[pos] === pos ? 'richtig' : 'falsch');
        });
      }
    };
  };

  /** Nummern für die Beschriftung: fest aus dem Item oder neu gemischt. */
  function nummernFuer(item, rnd) {
    if (item.nummern) return Object.assign({}, item.nummern);
    var o = {};
    W.shuffle(item.strukturen, rnd).forEach(function (id, i) { o[id] = i + 1; });
    return o;
  }

  R.beschriften = function (item, ctx) {
    var nummern = (ctx && ctx.nummern) || nummernFuer(item);
    var werte = {};
    var optionen = item.strukturen.map(function (id) { return { wert: id, text: label(item.abb, id) }; })
      .sort(function (a, b) { return a.text.localeCompare(b.text, 'de'); });
    var nachNr = item.strukturen.slice().sort(function (a, b) { return nummern[a] - nummern[b]; });
    var sels = {};
    var liste = h('div', { class: 'beschriften' }, nachNr.map(function (id) {
      var sel = auswahl(optionen, function (v) { werte[id] = v; });
      sels[id] = sel;
      return h('label', { class: 'beschriften__zeile' }, h('span', { class: 'nr' }, String(nummern[id])), sel);
    }));
    return {
      el: h('div', null, figur(item.abb, { nummern: nummern }), liste),
      nummern: nummern,
      antwort: function () { return Object.assign({}, werte); },
      setze: function (w) { Object.keys(w || {}).forEach(function (id) { if (sels[id] && w[id] != null) { sels[id].value = w[id]; werte[id] = w[id]; } }); },
      zeige: function () { Object.keys(sels).forEach(function (id) { sels[id].disabled = true; sels[id].classList.add(werte[id] === id ? 'richtig' : 'falsch'); }); }
    };
  };

  R.tabelle = function (item) {
    var werte = item.zeilen.map(function (z) { return z.zellen.map(function () { return null; }); });
    var sels = [];
    var tab = h('table', { class: 'tab' },
      h('thead', null, h('tr', null, item.spalten.map(function (s) { return h('th', { html: s }); }))),
      h('tbody', null, item.zeilen.map(function (z, zi) {
        return h('tr', null, h('th', { scope: 'row', html: z.kopf }), z.zellen.map(function (c, ci) {
          if (c.fix != null) return h('td', { class: 'fix', html: c.fix });
          var sel = auswahl(c.optionen.map(function (o, i) { return { wert: i, text: ohneTags(o) }; }), function (v) { werte[zi][ci] = v == null ? null : +v; }, '?');
          sels.push({ sel: sel, zi: zi, ci: ci, soll: c.richtig });
          return h('td', null, sel);
        }));
      })));
    return {
      el: h('div', { class: 'tab-wrap' }, tab),
      antwort: function () { return werte.map(function (z) { return z.slice(); }); },
      setze: function (w) { sels.forEach(function (s) { var v = w && w[s.zi] ? w[s.zi][s.ci] : null; if (v != null) { s.sel.value = String(v); werte[s.zi][s.ci] = v; } }); },
      zeige: function () { sels.forEach(function (s) { s.sel.disabled = true; s.sel.classList.add(werte[s.zi][s.ci] === s.soll ? 'richtig' : 'falsch'); }); }
    };
  };

  R.matrix = function (item) {
    var werte = item.zeilen.map(function () { return item.spalten.map(function () { return false; }); });
    var knoepfe = [];
    var tab = h('table', { class: 'tab tab--matrix' },
      h('thead', null, h('tr', null, h('th', { class: 'ecke' }, item.zeilenKopf + ' ↓ / ' + item.spaltenKopf + ' →'), item.spalten.map(function (s) { return h('th', null, s); }))),
      h('tbody', null, item.zeilen.map(function (z, i) {
        return h('tr', null, h('th', { scope: 'row' }, z), item.spalten.map(function (s, j) {
          var b = h('button', { type: 'button', class: 'kreuz', 'aria-label': item.zeilenKopf + ' ' + z + ', ' + item.spaltenKopf + ' ' + s, 'aria-pressed': 'false', onclick: function () {
            if (b.disabled) return;
            werte[i][j] = !werte[i][j];
            b.textContent = werte[i][j] ? '✕' : '';
            b.setAttribute('aria-pressed', werte[i][j] ? 'true' : 'false');
          } });
          knoepfe.push({ b: b, i: i, j: j });
          return h('td', null, b);
        }));
      })));
    return {
      el: h('div', { class: 'tab-wrap' }, tab),
      antwort: function () { return werte.map(function (z) { return z.slice(); }); },
      setze: function (w) {
        knoepfe.forEach(function (k) {
          var v = !!(w && w[k.i] && w[k.i][k.j]);
          werte[k.i][k.j] = v;
          k.b.textContent = v ? '✕' : '';
          k.b.setAttribute('aria-pressed', v ? 'true' : 'false');
        });
      },
      zeige: function () {
        knoepfe.forEach(function (k) {
          k.b.disabled = true;
          var soll = item.richtig[k.i][k.j];
          k.b.classList.add(werte[k.i][k.j] === soll ? 'richtig' : 'falsch');
          if (soll && !werte[k.i][k.j]) k.b.textContent = '○';
        });
      }
    };
  };

  R.kreuzung = function (item) {
    var felder = [[null, null], [null, null]];
    var prozent = {};
    var sels = [];
    var gen = W.bio.GENOTYPEN.map(function (g) { return { wert: g, text: g }; });
    var m = item.mutter.split(''), v = item.vater.split('');
    var tab = h('table', { class: 'tab tab--kreuzung' },
      h('thead', null, h('tr', null, h('th', { class: 'ecke' }, 'Mutter ↓ / Vater →'), v.map(function (a) { return h('th', { class: 'allel' }, a); }))),
      h('tbody', null, m.map(function (a, i) {
        return h('tr', null, h('th', { class: 'allel', scope: 'row' }, a), v.map(function (b, j) {
          var sel = auswahl(gen, function (x) { felder[i][j] = x; }, '?');
          sels.push({ sel: sel, i: i, j: j });
          return h('td', null, sel);
        }));
      })));
    var pf = {};
    var prozentEl = item.mitWahrscheinlichkeit ? h('div', { class: 'prozente' },
      h('p', { class: 'hinweis-klein' }, 'Mit welcher Wahrscheinlichkeit hat ein Kind diese Blutgruppe? Leere Felder zählen als 0 %.'),
      W.bio.GRUPPEN.map(function (g) {
        var inp = h('input', { type: 'text', inputmode: 'decimal', class: 'eingabe eingabe--zahl', placeholder: '–', oninput: function () { prozent[g] = inp.value; } });
        pf[g] = inp;
        return h('label', { class: 'prozent' }, h('span', null, g), inp, h('span', null, '%'));
      })) : null;
    return {
      el: h('div', null, h('p', { class: 'hinweis-klein' }, 'Mutter: ' + item.mutter + ' · Vater: ' + item.vater), h('div', { class: 'tab-wrap' }, tab), prozentEl),
      antwort: function () { return { felder: felder.map(function (z) { return z.slice(); }), prozent: Object.assign({}, prozent) }; },
      setze: function (w) {
        if (!w) return;
        sels.forEach(function (s) { var g = w.felder && w.felder[s.i] ? w.felder[s.i][s.j] : null; if (g) { s.sel.value = g; felder[s.i][s.j] = g; } });
        Object.keys(pf).forEach(function (g) { if (w.prozent && w.prozent[g] != null) { pf[g].value = w.prozent[g]; prozent[g] = w.prozent[g]; } });
      },
      zeige: function () {
        var soll = W.bio.kreuzung(item.mutter, item.vater);
        sels.forEach(function (s) { s.sel.disabled = true; s.sel.classList.add(felder[s.i][s.j] === soll[s.i][s.j] ? 'richtig' : 'falsch'); });
        if (item.mitWahrscheinlichkeit) {
          var vt = W.bio.verteilung(item.mutter, item.vater);
          Object.keys(pf).forEach(function (g) { pf[g].disabled = true; pf[g].classList.add(Math.abs(prozentWert(prozent, g) - vt[g]) < 0.01 ? 'richtig' : 'falsch'); });
        }
      }
    };
  };

  R.zahl = function (item) {
    var inp = h('input', { type: 'text', inputmode: 'decimal', class: 'eingabe eingabe--zahl', placeholder: 'Zahl', autocomplete: 'off' });
    return {
      el: h('label', { class: 'zahl' }, inp, item.einheit ? h('span', null, item.einheit) : null),
      antwort: function () { return inp.value; },
      setze: function (w) { inp.value = w || ''; },
      zeige: function () { inp.disabled = true; inp.classList.add(zahlPasst(item, inp.value) ? 'richtig' : 'falsch'); }
    };
  };

  R.behauptung = function (item) {
    var urteil = null, grund = null;
    var ja = h('button', { type: 'button', class: 'opt opt--kurz', onclick: function () { urteil = true; ja.classList.add('gewaehlt'); nein.classList.remove('gewaehlt'); } }, 'Stimmt');
    var nein = h('button', { type: 'button', class: 'opt opt--kurz', onclick: function () { urteil = false; nein.classList.add('gewaehlt'); ja.classList.remove('gewaehlt'); } }, 'Stimmt nicht');
    var reihenfolge = W.shuffle(item.gruende.map(function (g, i) { return i; }));
    var gk = [];
    var gruende = h('div', { class: 'opts' }, reihenfolge.map(function (i) {
      var b = h('button', { type: 'button', class: 'opt', html: item.gruende[i], onclick: function () {
        grund = i; gk.forEach(function (k) { k.b.classList.toggle('gewaehlt', k.i === i); });
      } });
      gk.push({ b: b, i: i });
      return b;
    }));
    return {
      el: h('div', null, h('blockquote', { class: 'aussage', html: '„' + item.aussage + '“' }),
        h('div', { class: 'urteil' }, ja, nein), h('p', { class: 'hinweis-klein' }, 'Und warum?'), gruende),
      antwort: function () { return { stimmt: urteil, grund: grund }; },
      setze: function (w) {
        if (!w) return;
        urteil = w.stimmt == null ? null : w.stimmt;
        grund = w.grund == null ? null : w.grund;
        ja.classList.toggle('gewaehlt', urteil === true);
        nein.classList.toggle('gewaehlt', urteil === false);
        gk.forEach(function (k) { k.b.classList.toggle('gewaehlt', k.i === grund); });
      },
      zeige: function () {
        [ja, nein].forEach(function (b) { b.disabled = true; });
        (item.stimmt ? ja : nein).classList.add('richtig');
        if (urteil !== null && urteil !== item.stimmt) (urteil ? ja : nein).classList.add('falsch');
        gk.forEach(function (k) {
          k.b.disabled = true;
          if (k.i === item.richtig) k.b.classList.add('richtig'); else if (k.i === grund) k.b.classList.add('falsch');
        });
      }
    };
  };

  /** Eine Aufgabe anzeigen. Gibt { el, antwort(), zeige(), nummern? } zurück. */
  function render(item, ctx) {
    var r = R[item.typ];
    if (!r) throw new Error('Unbekannter Aufgabentyp: ' + item.typ);
    var api = r(item, ctx);
    if (ctx && ctx.wert != null && api.setze) api.setze(ctx.wert);
    var kopf = item.typ === 'behauptung' ? h('p', { class: 'frage' }, item.frage ? h('span', { html: item.frage }) : 'Ein Mitschüler behauptet:')
      : item.typ === 'luecke' ? (item.frage ? h('p', { class: 'frage', html: item.frage }) : h('p', { class: 'frage' }, 'Wähle die passenden Wörter.'))
        : h('p', { class: 'frage', html: item.frage });
    var bild = item.typ !== 'beschriften' && item.abb ? figur(item.abb, item.abbOpts) : null;
    return {
      el: h('div', { class: 'aufgabe aufgabe--' + item.typ }, item.plus ? h('span', { class: 'tag tag--plus' }, 'Plus') : null, kopf, bild, api.el),
      antwort: api.antwort, zeige: api.zeige, nummern: api.nummern
    };
  }

  var LOB = ['Richtig.', 'Sitzt.', 'Korrekt.', 'Genau so.', 'Sauber.'];
  function lob() { return LOB[Math.floor(Math.random() * LOB.length)]; }

  /** Spielt eine Folge von Aufgaben ab. opts: { titel, mischen, melden (default true), onFertig(erg), nochmal } */
  function spiele(host, items, opts) {
    opts = opts || {};
    var folge = opts.mischen === false ? items.slice() : W.shuffle(items);
    var i = 0, richtigN = 0, falsch = [];
    function zeigeAufgabe() {
      host.innerHTML = '';
      var item = folge[i];
      var r = render(item);
      var fb = h('div', { class: 'feedback', 'aria-live': 'polite' });
      var weiter = h('button', { type: 'button', class: 'btn btn--haupt' }, 'Prüfen');
      var geprueft = false;
      weiter.addEventListener('click', function () {
        if (!geprueft) {
          var a = r.antwort();
          if (leer(item, a)) { W.toast('Erst antworten, dann prüfen.'); return; }
          geprueft = true;
          var sc = score(item, a);
          var ok = sc >= 1 - 1e-9;
          r.zeige();
          if (ok) richtigN++; else falsch.push(item);
          var beh = opts.melden === false ? { behoben: false } : W.state.itemErgebnis(item.id, ok);
          fb.className = 'feedback ' + (ok ? 'feedback--ok' : 'feedback--falsch');
          fb.appendChild(h('p', { class: 'feedback__kopf' }, ok ? lob() : (sc > 0 ? 'Teilweise richtig.' : 'Nicht ganz.')));
          if (!ok) fb.appendChild(h('p', null, h('strong', null, 'Richtig wäre: '), loesungText(item, r.nummern)));
          if (item.erkl) fb.appendChild(h('p', { html: item.erkl }));
          if (beh.behoben) W.toast('Wiedervorlage erledigt', 'ok');
          if (W.ton && ok) W.ton.piep();
          weiter.textContent = i + 1 < folge.length ? 'Weiter' : 'Auswertung';
          weiter.scrollIntoView({ block: 'nearest', behavior: W.reducedMotion() ? 'auto' : 'smooth' });
        } else {
          i++;
          if (i < folge.length) zeigeAufgabe(); else ende();
        }
      });
      host.appendChild(h('div', { class: 'spiel' },
        h('div', { class: 'spiel__kopf' }, h('span', null, opts.titel || ''), h('span', { class: 'mono' }, (i + 1) + ' / ' + folge.length)),
        h('div', { class: 'fortschritt' }, h('span', { style: { width: Math.round(100 * i / folge.length) + '%' } })),
        r.el, fb, h('div', { class: 'aktionen' }, weiter)));
      if (opts.scrollen !== false && host.lastChild) host.lastChild.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    function ende() {
      host.innerHTML = '';
      var erg = { richtig: richtigN, gesamt: folge.length, falsch: falsch.map(function (x) { return x.id; }) };
      host.appendChild(h('div', { class: 'spiel spiel--ende' },
        h('p', { class: 'ergebnis mono' }, richtigN + ' / ' + folge.length),
        h('p', null, richtigN === folge.length ? 'Alles richtig.' : opts.melden === false ? falsch.length + (falsch.length === 1 ? ' Fehler.' : ' Fehler.') + ' Übung macht den Meister: gleich nochmal.' : falsch.length + (falsch.length === 1 ? ' Aufgabe ist' : ' Aufgaben sind') + ' in der Wiedervorlage.'),
        h('div', { class: 'aktionen' },
          falsch.length && opts.nochmal !== false ? h('button', { type: 'button', class: 'btn', onclick: function () { spiele(host, falsch, opts); } }, 'Fehler gleich wiederholen') : null,
          h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { if (opts.onFertig) opts.onFertig(erg); } }, opts.fertigText || 'Fertig'))));
      if (opts.onEnde) opts.onEnde(erg);
    }
    if (!folge.length) { host.innerHTML = ''; host.appendChild(h('p', null, 'Keine Aufgaben.')); return; }
    zeigeAufgabe();
  }

  W.aufgaben = {
    score: score, richtig: richtig, leer: leer, loesung: loesung, loesungText: loesungText,
    render: render, spiele: spiele, nummernFuer: nummernFuer, parseLuecke: parseLuecke, ohneTags: ohneTags, TYPEN: Object.keys(R)
  };
})();
