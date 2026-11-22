/* Aufgaben-Engine: prüft Antworten (rein, testbar) und zeigt Aufgaben an.
   Typen: wahl, mehrfach, luecke, eingabe, liste, zuordnen, reihenfolge,
   tabelle (auch Zahlzellen), zahl, terme (Funktionsterme mit Zahlfeldern), behauptung, rechnung, punkte. */
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

  /** Tabellenzelle prüfen: Zahlzelle mit relativer Toleranz, sonst Auswahl-Index. */
  function zelleOk(c, v) {
    if (c.zahl != null) return v != null && W.physik.passt(v, c.zahl, c.auch, c.tolRel);
    return v === c.richtig;
  }

  /** Zahlfelder eines Terms (Teile, die keine Texte sind). */
  function termZahlen(term) { return term.filter(function (x) { return typeof x !== 'string'; }); }
  /** Ein Term ist richtig, wenn alle seine Zahlen passen. */
  function termOk(item, term, werte) {
    return Array.isArray(werte) && termZahlen(term).every(function (z, k) {
      return werte[k] != null && W.physik.passt(werte[k], z.zahl, z.auch, item.tolRel);
    });
  }

  /** Standard: y.schritt/4, also nur der nächste Rasterpunkt (Raster y.schritt/2), nicht der Nachbar. */
  function punkteTol(item) { return item.tol == null ? item.achsen.y.schritt / 4 : item.tol; }
  function punktOk(item, i, v) { return v != null && v !== '' && Math.abs(v - item.soll[i]) <= punkteTol(item) + 1e-9; }

  function zahlPasst(item, wert) {
    // Mit tolRel (Prüfung): relative Toleranz wie bei rechnung, „1.125“ gilt in beiden Lesarten.
    if (item.tolRel != null) return W.physik.passt(wert, item.antwort, item.auch, item.tolRel);
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
        case 'tabelle': {
          var o = offeneZellen(item);
          return anteil(o.filter(function (z) { return a[z.zi] && zelleOk(z.c, a[z.zi][z.ci]); }).length, o.length);
        }
        case 'zahl': return zahlPasst(item, a) ? 1 : 0;
        case 'terme': return anteil(item.terme.filter(function (t, i) { return termOk(item, t, a[i]); }).length, item.terme.length);
        case 'rechnung': return W.physik.passt(a, item.antwort, item.auch, item.tolRel) ? 1 : 0;
        case 'punkte': return anteil(item.xs.filter(function (x, i) { return punktOk(item, i, a[i]); }).length, item.xs.length);
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
      case 'tabelle': return item.zeilen.map(function (z) { return z.zellen.map(function (c) { return c.fix != null ? null : c.zahl != null ? String(c.zahl) : c.richtig; }); });
      case 'zahl': return String(item.antwort);
      case 'terme': return item.terme.map(function (t) { return termZahlen(t).map(function (z) { return String(z.zahl); }); });
      case 'rechnung': return String(item.antwort);
      case 'punkte': return item.soll.slice();
      case 'behauptung': return { stimmt: item.stimmt, grund: item.richtig };
    }
    return null;
  }

  function ohneTags(t) { return String(t).replace(/<sub>(.*?)<\/sub>/g, '$1').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
  function zahlText(x) { return String(x).replace('.', ','); }
  /** Text einer Option; bei einem Mini-Diagramm dessen Beschreibung (aria-label). */
  function optText(o) {
    var m = /^\s*<svg[^>]*aria-label="([^"]*)"/.exec(String(o));
    return m ? m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : ohneTags(o);
  }
  function fmt(x) { return W.physik.fmt(x); }
  /** Ergebnis mit zwei Nachkommastellen, mit drei, wenn das Ergebnis genau drei hat (0,625 statt 0,63). */
  function fmtErgebnis(x) {
    var drei = Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-6, zwei = Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;
    return W.physik.fmt(x, drei && !zwei ? 3 : 2);
  }

  /** Die Lösung als lesbarer Text. */
  function loesungText(item) {
    switch (item.typ) {
      case 'wahl': return optText(item.optionen[item.richtig]);
      case 'mehrfach': return item.richtig.map(function (i) { return optText(item.optionen[i]); }).join('; ');
      case 'luecke': return ohneTags(item.text.replace(/\{([^}|]+)[^}]*\}/g, '$1'));
      case 'eingabe': return item.akzeptiert[0];
      case 'liste': return item.gruppen.map(function (g) { return g[0]; }).join(', ') + (item.gruppen.length > item.anzahl ? ' (' + item.anzahl + ' davon genügen)' : '');
      case 'zuordnen': return item.paare.map(function (p) { return ohneTags(p[0]) + ' → ' + ohneTags(p[1]); }).join('; ');
      case 'reihenfolge': return item.schritte.map(ohneTags).join(' → ');
      case 'tabelle': return item.zeilen.map(function (z) {
        return ohneTags(z.kopf) + ': ' + z.zellen.map(function (c) { return c.fix != null ? c.fix : c.zahl != null ? fmt(c.zahl) : c.optionen[c.richtig]; }).join(' | ');
      }).join('; ');
      case 'zahl': return zahlText(item.antwort) + (item.einheit ? ' ' + item.einheit : '');
      case 'terme': return item.terme.map(function (t) { return t.map(function (x) { return typeof x === 'string' ? x : W.physik.fmt(x.zahl, 3); }).join(''); }).join('; ');
      case 'rechnung': return fmtErgebnis(item.antwort) + (item.einheit ? ' ' + item.einheit : '');
      case 'punkte': {
        var ax = item.achsen.x, ay = item.achsen.y;
        return item.xs.map(function (x, i) { return ax.g + ' = ' + fmt(x) + ' ' + ax.e + ': ' + ay.g + ' = ' + fmt(item.soll[i]) + ' ' + ay.e; }).join('; ');
      }
      case 'behauptung': return (item.stimmt ? 'Stimmt. ' : 'Stimmt nicht. ') + ohneTags(item.gruende[item.richtig]);
    }
    return '';
  }

  /** Inhalts-Regel: wahl/mehrfach brauchen einen Erklärsatz je Option, rechnung je Schritt-Option. */
  function optErklOk(item) {
    function passend(o) { return Array.isArray(o.optErkl) && Array.isArray(o.optionen) && o.optErkl.length === o.optionen.length; }
    if (item.typ === 'wahl' || item.typ === 'mehrfach') return passend(item);
    if (item.typ === 'rechnung') return (item.schritte || []).every(passend);
    return item.optErkl == null || passend(item);
  }

  /** Erklärungen nach dem Prüfen: zuerst die gewählte(n) Option(en), bei Fehler zusätzlich die richtige(n). */
  function erklaerungen(item, a) {
    if (!item.optErkl) return [];
    var gew = item.typ === 'mehrfach' ? (a || []).slice() : (a == null ? [] : [a]);
    var soll = item.typ === 'mehrfach' ? item.richtig : [item.richtig];
    var ok = score(item, a) >= 1 - 1e-9;
    var out = gew.map(function (i) { return { i: i, text: item.optErkl[i], gewaehlt: true, richtig: soll.indexOf(i) >= 0 }; });
    // Nachgereichte richtige Option: Die Anzeige sagt schon „Richtig:“, ein „Richtig:“ am Satzanfang fällt weg.
    if (!ok) soll.forEach(function (i) { if (gew.indexOf(i) < 0) out.push({ i: i, text: String(item.optErkl[i] || '').replace(/^Richtig:\s*/, ''), gewaehlt: false, richtig: true }); });
    return out.filter(function (e) { return e.text; });
  }

  /* ---------- Anzeige ---------- */

  /** Abbildung: `abb` ist ein Options-Objekt für W.diagramm.zeichne. */
  function figur(abb) {
    if (!abb || !W.diagramm) return null;
    return h('figure', { class: 'abb' }, W.diagramm.zeichne(abb));
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
    var bilder = item.optionen.some(function (o) { return /<svg/.test(o); });
    var el = h('div', { class: 'opts' + (bilder ? ' opts--raster' : '') }, reihenfolge.map(function (i) {
      var b = h('button', { type: 'button', class: 'opt' + (bilder ? ' opt--bild' : ''), html: item.optionen[i], onclick: function () {
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
      el: h('div', { class: 'reihenfolge' }, h('p', { class: 'hinweis-klein' }, 'Klicke die Schritte in der richtigen Reihenfolge an. Ein Klick in der Liste nimmt einen Schritt wieder heraus.'), reihe, pool),
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

  R.tabelle = function (item) {
    var werte = item.zeilen.map(function (z) { return z.zellen.map(function () { return null; }); });
    var sels = [];
    var tab = h('table', { class: 'tab' },
      h('thead', null, h('tr', null, item.spalten.map(function (s) { return h('th', { html: s }); }))),
      h('tbody', null, item.zeilen.map(function (z, zi) {
        return h('tr', null, h('th', { scope: 'row', html: z.kopf }), z.zellen.map(function (c, ci) {
          if (c.fix != null) return h('td', { class: 'fix', html: c.fix });
          if (c.zahl != null) {
            var inp = h('input', { type: 'text', inputmode: 'decimal', class: 'eingabe eingabe--zelle', autocomplete: 'off', placeholder: '?',
              'aria-label': ohneTags(z.kopf) + ', ' + ohneTags(item.spalten[ci + 1] || ''), oninput: function () { werte[zi][ci] = inp.value; } });
            sels.push({ sel: inp, zi: zi, ci: ci, c: c });
            return h('td', null, inp);
          }
          var sel = auswahl(c.optionen.map(function (o, i) { return { wert: i, text: ohneTags(o) }; }), function (v) { werte[zi][ci] = v == null ? null : +v; }, '?');
          sels.push({ sel: sel, zi: zi, ci: ci, c: c });
          return h('td', null, sel);
        }));
      })));
    return {
      el: h('div', { class: 'tab-wrap' }, tab),
      antwort: function () { return werte.map(function (z) { return z.slice(); }); },
      setze: function (w) { sels.forEach(function (s) { var v = w && w[s.zi] ? w[s.zi][s.ci] : null; if (v != null) { s.sel.value = String(v); werte[s.zi][s.ci] = v; } }); },
      zeige: function () { sels.forEach(function (s) { s.sel.disabled = true; s.sel.classList.add(zelleOk(s.c, werte[s.zi][s.ci]) ? 'richtig' : 'falsch'); }); }
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

  /** Funktionsterme: Text und Zahlfelder in einer Zeile je Term, z. B. „s(t) = [ ] m/s² · t²“. */
  R.terme = function (item) {
    var felder = item.terme.map(function (t) {
      return termZahlen(t).map(function () {
        return h('input', { type: 'text', inputmode: 'decimal', class: 'eingabe eingabe--zelle', autocomplete: 'off', placeholder: '?' });
      });
    });
    var zeilen = item.terme.map(function (t, i) {
      var k = 0;
      return h('p', { class: 'term mono' }, t.map(function (x) {
        if (typeof x === 'string') return h('span', null, x);
        var f = felder[i][k++];
        f.setAttribute('aria-label', ohneTags(t[0]).replace(/=\s*$/, '').trim() + ', Zahl ' + k);
        return f;
      }));
    });
    return {
      el: h('div', { class: 'terme' }, zeilen),
      antwort: function () { return felder.map(function (fs) { return fs.map(function (f) { return f.value; }); }); },
      setze: function (w) { felder.forEach(function (fs, i) { fs.forEach(function (f, k) { var v = Array.isArray(w) && Array.isArray(w[i]) ? w[i][k] : null; f.value = v == null ? '' : String(v); }); }); },
      zeige: function () {
        felder.forEach(function (fs, i) {
          var werte = fs.map(function (f) { return f.value; });
          var ok = termOk(item, item.terme[i], werte);
          fs.forEach(function (f) { f.disabled = true; f.classList.add(ok ? 'richtig' : 'falsch'); });
        });
      }
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

  /** Eine Auswahl, bei der man so lange wählt, bis es stimmt. Falsche Wahl zeigt deren Erklärung.
      weiter: nach der richtigen Wahl; fehler: nach jeder falschen Wahl. */
  function stufe(titel, s, fest, weiter, fehler, klasse) {
    var idx = s.optionen.map(function (o, i) { return i; });
    var erkl = h('p', { class: 'stufe__erkl', 'aria-live': 'polite' });
    var knoepfe = [];
    function richtigWaehlen(b) {
      b.classList.add('richtig');
      box.classList.add('geloest');
      knoepfe.forEach(function (k) { if (k !== b) k.hidden = true; });
    }
    var box = h('div', { class: 'stufe' + (klasse ? ' ' + klasse : '') }, h('p', { class: 'stufe__titel' }, titel),
      h('div', { class: 'opts' }, (fest ? idx : W.shuffle(idx)).map(function (i) {
        var b = h('button', { type: 'button', class: 'opt', html: s.optionen[i], onclick: function () {
          if (box.classList.contains('geloest') || b.disabled) return;
          erkl.innerHTML = '';
          if (s.optErkl && s.optErkl[i]) erkl.textContent = s.optErkl[i];
          if (i === s.richtig) {
            richtigWaehlen(b);
            if (weiter) weiter();
          } else {
            b.classList.add('falsch');
            b.disabled = true;
            if (fehler) fehler();
            // Fokus auf die nächste noch wählbare Option, damit Tastatur und Enter weiter funktionieren.
            var pos = knoepfe.indexOf(b);
            for (var n = 1; n < knoepfe.length; n++) {
              var k = knoepfe[(pos + n) % knoepfe.length];
              if (!k.disabled && !k.hidden) { k.focus({ preventScroll: true }); break; }
            }
          }
        } });
        b.dataset.i = String(i);
        knoepfe.push(b);
        return b;
      })), erkl);
    return {
      el: box,
      sperren: function () { knoepfe.forEach(function (k) { k.disabled = true; }); },
      geloest: function () { return box.classList.contains('geloest'); },
      /** Lösung zeigen: richtige Option markieren, die anderen ausblenden. */
      aufloesen: function () {
        if (!box.classList.contains('geloest')) richtigWaehlen(knoepfe.filter(function (k) { return +k.dataset.i === s.richtig; })[0]);
        box.classList.add('stufe--aufgeloest');
        knoepfe.forEach(function (k) { k.disabled = true; });
      }
    };
  }

  var SCHRITT = { gg: 'Gegeben und gesucht', formel: 'Formel', umstellen: 'Umstellen', einsetzen: 'Einsetzen' };

  /** Geführtes Rechnen: Schritte nacheinander, dann Ergebnis. Von Anfang an geht auch „Ergebnis direkt eingeben“.
      ctx.kurz: nur Ergebnis, Schritte auf Wunsch. Bei falschem Ergebnis werden alle Schritte aufgelöst gezeigt.
      ctx.gutachten: nach richtigem Ergebnis den Antwortsatz wählen (freiwillig, zählt nicht).
      formelOk(): kein Fehlgriff bei den Schritten (dann zählt die Formel für die Kurzform). */
  R.rechnung = function (item, ctx) {
    ctx = ctx || {};
    var schritte = item.schritte || [];
    var stufen = [];
    var fehlgriff = false;
    var inp = h('input', { type: 'text', inputmode: 'decimal', class: 'eingabe eingabe--zahl', placeholder: 'Zahl', autocomplete: 'off', 'aria-label': 'Ergebnis' + (item.einheit ? ' in ' + item.einheit : '') });
    var ergebnis = h('div', { class: 'stufe rechnung__ergebnis' }, h('p', { class: 'stufe__titel' }, 'Ergebnis'),
      h('label', { class: 'zahl' }, inp, item.einheit ? h('span', { class: 'einheit' }, item.einheit) : null));
    var liste = h('div', { class: 'rechnung__schritte' });
    var nach = h('div');
    var direkt = null;
    function ergebnisZeigen(fokus) {
      ergebnis.hidden = false;
      if (direkt) direkt.hidden = true;
      if (fokus && feinerZeiger()) inp.focus();
    }
    function neueStufe(k) {
      var st = stufe(SCHRITT[schritte[k].art] || schritte[k].art, schritte[k], item.fest, function () { schritt(k + 1); }, function () { fehlgriff = true; });
      stufen.push(st);
      liste.appendChild(st.el);
      return st;
    }
    function schritt(k) {
      if (k >= schritte.length) { ergebnisZeigen(k > 0); return; }
      neueStufe(k);
    }
    var hilfe = null;
    if (ctx.kurz && schritte.length) {
      hilfe = h('div', { class: 'aktionen aktionen--links' },
        h('button', { type: 'button', class: 'btn btn--klein', onclick: function () { hilfe.hidden = true; schritt(0); } }, 'Schritte zeigen'));
    } else {
      ergebnis.hidden = true;
      if (schritte.length) {
        direkt = h('div', { class: 'aktionen aktionen--links rechnung__direkt' },
          h('button', { type: 'button', class: 'btn btn--klein', onclick: function () {
            // Offene Schritte ausblenden: Wer direkt rechnet, braucht sie nicht. Bei falschem Ergebnis kommen sie aufgelöst zurück.
            stufen.forEach(function (s) { if (!s.geloest()) s.el.hidden = true; });
            ergebnisZeigen(true);
          } }, 'Ergebnis direkt eingeben'));
      }
      schritt(0);
    }
    return {
      el: h('div', { class: 'rechnung' }, item.gegeben ? h('div', { class: 'rechnung__gegeben', html: item.gegeben }) : null,
        hilfe ? h('p', { class: 'hinweis-klein' }, 'Kurzform: Diese Formel sitzt schon. Gib das Ergebnis ein.') : null,
        liste, direkt, ergebnis, hilfe, nach),
      antwort: function () { return inp.value; },
      setze: function (w) { inp.value = w || ''; if (inp.value) ergebnisZeigen(false); },
      formelOk: function () { return !fehlgriff; },
      zeige: function () {
        var ok = W.physik.passt(inp.value, item.antwort, item.auch, item.tolRel);
        inp.disabled = true;
        inp.classList.add(ok ? 'richtig' : 'falsch');
        if (hilfe) hilfe.hidden = true;
        if (direkt) direkt.hidden = true;
        stufen.forEach(function (s) { s.sperren(); });
        if (!ok) {
          // Falsches Ergebnis: alle Schritte aufgelöst zeigen, die Lösung steht im Feedback.
          for (var k = 0; k < schritte.length; k++) {
            var st = stufen[k] || neueStufe(k);
            st.el.hidden = false;
            st.aufloesen();
          }
        }
        if (ok && ctx.gutachten && item.satz) {
          var satz = item.satz;
          var sst = stufe('Antwortsatz (freiwillig, zählt nicht)', { optionen: satz.optionen, richtig: satz.richtig, optErkl: satz.optErkl }, item.fest, function () {
            nach.dispatchEvent(new CustomEvent('satzfertig', { bubbles: true }));
          }, null, 'stufe--satz');
          nach.appendChild(sst.el);
        }
      }
    };
  };

  /** Punkte setzen: Klick in eine Spalte setzt den eingerasteten Wert, ein weiterer Klick verschiebt. */
  R.punkte = function (item) {
    var ax = item.achsen.x, ay = item.achsen.y;
    var werte = item.xs.map(function () { return null; });
    var fertig = false;
    var svg = W.diagramm.zeichne({ achsen: item.achsen, kurven: [] });
    var L = svg.diagramm;
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'Koordinatengitter ' + ay.g + ' in ' + ay.e + ' über ' + ax.g + ' in ' + ax.e);
    svg.classList.add('dia--tippen');
    var ymin = ay.min || 0;
    var spalten = W.s('g', { class: 'dia-spalten' });
    item.xs.forEach(function (x) { spalten.appendChild(W.s('line', { class: 'dia-spalte', x1: L.px(x), x2: L.px(x), y1: L.oben, y2: L.oben + L.ph })); });
    var ueber = W.s('g');
    var punkteG = W.s('g');
    svg.appendChild(spalten);
    svg.appendChild(ueber);
    svg.appendChild(punkteG);
    var anzeige = h('p', { class: 'punkte__anzeige mono', 'aria-live': 'polite' }, ' ');
    function txt(i, y) { return ax.g + ' = ' + W.physik.fmt(item.xs[i]) + ' ' + ax.e + ': ' + ay.g + ' = ' + (y == null ? '?' : W.physik.fmt(y) + ' ' + ay.e); }
    function punkt(i, y, klasse) {
      return W.s('circle', { class: 'dia-punkt ' + (klasse || ''), cx: L.px(item.xs[i]), cy: L.py(y), r: 7, role: 'img', 'aria-label': txt(i, y) });
    }
    function zeichnen() {
      punkteG.innerHTML = '';
      werte.forEach(function (y, i) { if (y != null) punkteG.appendChild(punkt(i, y)); });
    }
    svg.addEventListener('click', function (ev) {
      if (fertig) return;
      // Bildschirm → SVG-Koordinaten über die CTM: stimmt auch bei max-height, Zentrierung und jeder CSS-Größe.
      var ctm = svg.getScreenCTM();
      if (!ctm) return;
      var pt = svg.createSVGPoint();
      pt.x = ev.clientX;
      pt.y = ev.clientY;
      pt = pt.matrixTransform(ctm.inverse());
      var x = L.xAus(pt.x);
      var y = L.yAus(pt.y);
      var i = 0;
      item.xs.forEach(function (xx, k) { if (Math.abs(xx - x) < Math.abs(item.xs[i] - x)) i = k; });
      werte[i] = Math.min(ay.max, Math.max(ymin, W.diagramm.einrasten(y, ay.schritt / 2)));
      zeichnen();
      anzeige.textContent = 'Gesetzt: ' + txt(i, werte[i]);
    });
    return {
      el: h('div', { class: 'punkte' },
        h('p', { class: 'hinweis-klein' }, 'Klicke für jeden Zeitpunkt in seine Spalte. Der Punkt rastet im Karo ein, ein weiterer Klick verschiebt ihn.'),
        h('figure', { class: 'abb' }, svg), anzeige),
      antwort: function () { return werte.slice(); },
      setze: function (w) { (w || []).forEach(function (y, i) { if (i < werte.length) werte[i] = y == null ? null : y; }); zeichnen(); },
      zeige: function () {
        fertig = true;
        svg.classList.remove('dia--tippen');
        var f = ay.g === 'v' || ay.g === 'a' ? ay.g : 's';
        if (item.kurve && item.kurve.length) {
          var ende = item.kurve[item.kurve.length - 1];
          ueber.appendChild(W.s('path', { class: 'dia-kurve dia-kurve--' + f, d: L.pfad(item.kurve) }));
          ueber.appendChild(W.s('text', { class: 'dia-label dia-label--' + f, x: L.px(ende[0]) - 12, y: L.py(ende[1]) - 12, 'text-anchor': 'end' }, f + '(t)'));
        }
        punkteG.innerHTML = '';
        werte.forEach(function (y, i) {
          var ok = punktOk(item, i, y);
          if (!ok) punkteG.appendChild(punkt(i, item.soll[i], 'dia-punkt--soll'));
          if (y != null) punkteG.appendChild(punkt(i, y, ok ? 'dia-punkt--richtig' : 'dia-punkt--falsch'));
        });
        anzeige.textContent = '';
      }
    };
  };

  /** Eine Aufgabe anzeigen. Gibt { el, antwort(), zeige() } zurück. ctx: { wert, kurz, gutachten } */
  function render(item, ctx) {
    var r = R[item.typ];
    if (!r) throw new Error('Unbekannter Aufgabentyp: ' + item.typ);
    var api = r(item, ctx);
    // Gespeicherte Antwort kann aus einem alten oder kaputten Stand kommen: dann leer anfangen.
    if (ctx && ctx.wert != null && api.setze) { try { api.setze(ctx.wert); } catch (e) { /* leer lassen */ } }
    var kopf = item.typ === 'behauptung' ? h('p', { class: 'frage' }, item.frage ? h('span', { html: item.frage }) : 'Ein Mitschüler behauptet:')
      : item.typ === 'luecke' ? (item.frage ? h('p', { class: 'frage', html: item.frage }) : h('p', { class: 'frage' }, 'Wähle die passenden Wörter.'))
        : h('p', { class: 'frage', html: item.frage });
    var bild = item.abb ? figur(item.abb) : null;
    return {
      el: h('div', { class: 'aufgabe aufgabe--' + item.typ, 'data-id': item.id }, item.plus ? h('span', { class: 'tag tag--plus' }, 'Plus') : null, kopf, bild, api.el),
      antwort: api.antwort, zeige: api.zeige, formelOk: api.formelOk
    };
  }

  var LOB = ['Richtig.', 'Sitzt.', 'Korrekt.', 'Genau so.', 'Sauber.'];
  function lob() { return LOB[Math.floor(Math.random() * LOB.length)]; }

  /** Kurzform, sobald die Formel zweimal richtig gerechnet wurde. */
  function kurzform(item) {
    var f = item.formel && W.state && W.state.data && W.state.data.formeln;
    return !!(f && f[item.formel] >= 2);
  }

  /** Erklärsätze der Optionen als Absätze. */
  function erklAbsaetze(item, a) {
    var mehr = item.typ === 'mehrfach';
    return erklaerungen(item, a).map(function (e) {
      var kopf = mehr ? '„' + optText(item.optionen[e.i]) + '“' + (e.gewaehlt ? '' : ' (fehlte)') + ': ' : e.gewaehlt ? 'Deine Wahl: ' : 'Richtig: ';
      return h('p', { class: 'feedback__erkl' }, h('strong', null, kopf), e.text);
    });
  }

  /** Maus oder Trackpad? Nur dann Felder automatisch fokussieren (am Handy springt sonst die Tastatur auf). */
  function feinerZeiger() {
    try { return window.matchMedia('(pointer: fine)').matches; } catch (e) { return false; }
  }

  /** Erstes sichtbares Zahl- oder Textfeld einer neuen Aufgabe fokussieren (nur mit Maus oder Trackpad, damit am Handy keine Tastatur aufspringt). */
  function zahlFokus(el) {
    if (!feinerZeiger()) return;
    var felder = el.querySelectorAll('input.eingabe');
    for (var k = 0; k < felder.length; k++) {
      if (!felder[k].disabled && felder[k].offsetParent !== null) { felder[k].focus({ preventScroll: true }); return; }
    }
  }

  /** Enter löst den sichtbaren Hauptknopf aus (Prüfen, Weiter, Auswertung …), außer beim Schreiben in einem mehrzeiligen Textfeld.
      Hauptknöpfe tragen das Attribut data-enter. Steht der Fokus auf einer noch nicht gewählten Option, wählt Enter diese Option (Browser).
      Auf einem anderen Knopf der Aufgabe (etwa der schon gewählten Option nach einem Klick) zählt der Hauptknopf. */
  function enterZiel() {
    var dlg = document.querySelector('.dialog');
    var kand = (dlg || document).querySelectorAll('[data-enter]');
    for (var k = kand.length - 1; k >= 0; k--) {
      if (!kand[k].disabled && kand[k].offsetParent !== null) return kand[k];
    }
    return null;
  }
  function enterTaste(e) {
    if (e.key !== 'Enter' || e.repeat || e.defaultPrevented || e.isComposing || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var t = e.target || {};
    var tag = t.tagName;
    if (tag === 'TEXTAREA' || t.isContentEditable) return;
    if (tag === 'INPUT' && t.type === 'range') return;   // Regler im Labor: Enter blättert nicht weiter
    var ziel = enterZiel();
    if (!ziel || t === ziel) return;   // auf dem Hauptknopf selbst löst der Browser aus
    var inAufgabe = t.closest && t.closest('.spiel');
    if (inAufgabe && t.classList && (t.classList.contains('opt') || t.classList.contains('chip')) && !t.classList.contains('gewaehlt')) return;
    if ((tag === 'A' || tag === 'BUTTON' || tag === 'SUMMARY' || (tag === 'INPUT' && t.type === 'checkbox')) && !inAufgabe) return;
    e.preventDefault();
    ziel.click();
  }
  if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('keydown', enterTaste);

  /** Spielt eine Folge von Aufgaben ab. opts: { titel, mischen, melden (default true), gutachten, onFertig(erg), nochmal } */
  function spiele(host, items, opts) {
    opts = opts || {};
    var folge = opts.mischen === false ? items.slice() : W.shuffle(items);
    var i = 0, richtigN = 0, falsch = [];
    function zeigeAufgabe() {
      host.innerHTML = '';
      var item = folge[i];
      var r = render(item, { kurz: item.typ === 'rechnung' && kurzform(item), gutachten: !!opts.gutachten });
      var fb = h('div', { class: 'feedback', 'aria-live': 'polite' });
      var weiter = h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '' }, 'Prüfen');
      var geprueft = false, satzOffen = false;
      weiter.addEventListener('keydown', function (e) { if (e.key === 'Enter' && satzOffen) e.preventDefault(); });
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
          if (!ok) fb.appendChild(h('p', null, h('strong', null, 'Richtig wäre: '), loesungText(item)));
          if (item.typ === 'wahl' || item.typ === 'mehrfach') erklAbsaetze(item, a).forEach(function (p) { fb.appendChild(p); });
          if (item.typ === 'rechnung') {
            // Für die Kurzform zählt die Formel nur, wenn kein Schritt daneben ging (oder das Ergebnis direkt richtig war).
            if (ok && item.formel && W.state && W.state.formelRichtig && (!r.formelOk || r.formelOk())) W.state.formelRichtig(item.formel);
            if (item.loesung) fb.appendChild(h('div', { class: 'loesung', html: item.loesung }));
          }
          if (item.erkl) fb.appendChild(h('p', { html: item.erkl }));
          if (beh.behoben) W.toast('Nachermittlung erledigt', 'ok');
          if (W.ton && ok) W.ton.piep();
          weiter.textContent = i + 1 < folge.length ? 'Weiter' : 'Auswertung';
          weiter.scrollIntoView({ block: 'nearest', behavior: W.reducedMotion() ? 'auto' : 'smooth' });
          // Freiwilliger Antwortsatz: Enter überspringt ihn nicht. Weiter per Enter erst nach der Wahl, per Klick jederzeit.
          var satz = r.el.querySelector('.stufe--satz');
          if (satz) {
            satzOffen = true;
            weiter.removeAttribute('data-enter');
            r.el.addEventListener('satzfertig', function () { satzOffen = false; weiter.setAttribute('data-enter', ''); weiter.focus({ preventScroll: true }); });
            var erste = satz.querySelector('.opt');
            if (erste) erste.focus({ preventScroll: true });
          }
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
      zahlFokus(r.el);
    }
    function ende() {
      host.innerHTML = '';
      var erg = { richtig: richtigN, gesamt: folge.length, falsch: falsch.map(function (x) { return x.id; }) };
      host.appendChild(h('div', { class: 'spiel spiel--ende' },
        h('p', { class: 'ergebnis mono' }, richtigN + ' / ' + folge.length),
        h('p', null, richtigN === folge.length ? 'Alles richtig.' : opts.melden === false ? falsch.length + (falsch.length === 1 ? ' Fehler.' : ' Fehler.') + ' Übung macht den Meister: gleich nochmal.' : falsch.length + (falsch.length === 1 ? ' Aufgabe ist' : ' Aufgaben sind') + ' in der Nachermittlung.'),
        h('div', { class: 'aktionen' },
          falsch.length && opts.nochmal !== false ? h('button', { type: 'button', class: 'btn', onclick: function () { spiele(host, falsch, opts); } }, 'Fehler gleich wiederholen') : null,
          h('button', { type: 'button', class: 'btn btn--haupt', 'data-enter': '', onclick: function () { if (opts.onFertig) opts.onFertig(erg); } }, opts.fertigText || 'Fertig'))));
      if (opts.onEnde) opts.onEnde(erg);
    }
    if (!folge.length) { host.innerHTML = ''; host.appendChild(h('p', null, 'Keine Aufgaben.')); return; }
    zeigeAufgabe();
  }

  W.aufgaben = {
    score: score, richtig: richtig, leer: leer, loesung: loesung, loesungText: loesungText, fmtErgebnis: fmtErgebnis,
    optErklOk: optErklOk, erklaerungen: erklaerungen,
    render: render, spiele: spiele, parseLuecke: parseLuecke, ohneTags: ohneTags, TYPEN: Object.keys(R)
  };
})();
