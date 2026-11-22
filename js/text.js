/* Eingaben vergleichen: Normalisieren, Tippfehler tolerieren, Fachbegriff-Radar. Ohne DOM. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});

  var TIEF = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
  var ARTIKEL = /^(der|die|das|den|dem|des|ein|eine|einen|einem|im|in den|in der)\s+/;

  function norm(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[₀-₉]/g, function (c) { return TIEF[c]; })
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\bc02\b/g, 'co2').replace(/\bh20\b/g, 'h2o');
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  /** Einfacher Wortstamm für Singular/Plural: Alveole/Alveolen, Kapillare/Kapillaren. */
  function stamm(w) { return w.replace(/(en|n|e|s)$/, ''); }

  function passtEins(e, a) {
    if (!e || !a) return false;
    if (e === a) return true;
    var se = stamm(e), sa = stamm(a);
    if (se.length >= 4 && se === sa) return true;
    // Enzym (-ase) und Substrat (-ose) unterscheiden sich oft nur in einem Buchstaben: das ist kein Tippfehler.
    if (/ase$/.test(e) !== /ase$/.test(a) && (/ose$/.test(e) || /ose$/.test(a))) return false;
    var erlaubt = a.length >= 10 ? 2 : a.length >= 5 ? 1 : 0;
    return erlaubt > 0 && levenshtein(e, a) <= erlaubt;
  }

  /** Passt die Eingabe zu einem der akzeptierten Begriffe? */
  function passt(eingabe, akzeptiert, nicht) {
    var e = norm(eingabe).replace(ARTIKEL, '');
    if (!e) return false;
    // Sperrliste: typische Verwechslungen (z. B. Bronchien statt Bronchiolen) zählen nie als Tippfehler.
    if ((nicht || []).some(function (n) { var x = norm(n); return x === e || stamm(x) === stamm(e); })) return false;
    return (akzeptiert || []).some(function (a) { return passtEins(e, norm(a).replace(ARTIKEL, '')); });
  }

  /** Mehrere Eingaben gegen Gruppen von Synonymen; jede Gruppe zählt höchstens einmal. */
  function liste(eingaben, gruppen, anzahl) {
    var frei = gruppen.map(function () { return true; });
    var zuordnung = [];
    var treffer = 0;
    (eingaben || []).forEach(function (e, i) {
      zuordnung[i] = -1;
      for (var g = 0; g < gruppen.length; g++) {
        if (frei[g] && passt(e, gruppen[g])) { frei[g] = false; zuordnung[i] = g; treffer++; break; }
      }
    });
    return { treffer: Math.min(treffer, anzahl == null ? treffer : anzahl), zuordnung: zuordnung };
  }

  /** Welche erwarteten Fachbegriffe kommen im Text vor? Nur ein Hinweis, keine Note. */
  function radar(text, begriffe) {
    var t = ' ' + norm(text) + ' ';
    return (begriffe || []).map(function (b) {
      return {
        name: b.name,
        gefunden: b.muster.some(function (m) {
          // Mehrere Wörter: Jedes muss vorkommen, die Reihenfolge ist egal („zieht sich das Zwerchfell zusammen“).
          return norm(m).split(' ').every(function (w) {
            // Kurze Muster (o2, 00) nur am Wortanfang, sonst passt o2 auch in co2.
            return w.length <= 3 ? t.indexOf(' ' + w) >= 0 : t.indexOf(w) >= 0;
          });
        })
      };
    });
  }

  /** Die letzte Zahl im Text: „ca. 192“, „25*4+8*9+5*4=192“, „197,4 kcal“. */
  function parseZahl(s) {
    var m = String(s == null ? '' : s).match(/-?\d+(?:[.,]\d+)?/g);
    if (!m) return NaN;
    var n = parseFloat(m[m.length - 1].replace(',', '.'));
    return isNaN(n) ? NaN : n;
  }

  W.text = { norm: norm, passt: passt, liste: liste, radar: radar, parseZahl: parseZahl, levenshtein: levenshtein };
})();
