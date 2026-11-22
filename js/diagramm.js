/* Diagramme wie auf den Arbeitsblättern: Karo-Gitter, Achsen mit Pfeilen, Beschriftung „t in s“ / „s in m“.
   Farben der Tafel: s(t) braun, v(t) blau, a(t) rot (CSS-Klassen dia-kurve--s/v/a), jede Kurve zusätzlich beschriftet.
   Markup entsteht als Text (in Node testbar), zeichne() macht daraus ein SVG-Element. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});

  function rund(x) { return Math.round(x * 1e6) / 1e6; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function zahl(x) { return W.physik ? W.physik.fmt(x) : String(x).replace('.', ','); }
  function farbe(f) { return f === 'v' || f === 'a' ? f : 's'; }

  /** Auf das nächste Vielfache von `schritt` runden (R.punkte rastet auf y.schritt/2 ein, das Karo). */
  function einrasten(wert, schritt) { return rund(Math.round(wert / schritt) * schritt); }

  /** Wertetabelle einer Funktion: n Abschnitte, also n + 1 Punkte von `von` bis `bis`. */
  function kurve(fn, von, bis, n) {
    n = n || 40;
    var out = [];
    for (var i = 0; i <= n; i++) {
      var x = rund(von + (bis - von) * i / n);
      out.push([x, fn(x)]);
    }
    return out;
  }

  function ticks(min, max, schritt) {
    var out = [];
    for (var v = Math.ceil(min / schritt - 1e-9) * schritt; v <= max + 1e-9; v += schritt) out.push(rund(v));
    return out;
  }

  function pfeil(x, y, richtung) {
    var p = richtung === 'oben' ? [[x, y], [x - 4.5, y + 9], [x + 4.5, y + 9]] : [[x, y], [x - 9, y - 4.5], [x - 9, y + 4.5]];
    return '<polygon class="dia-pfeil" points="' + p.map(function (q) { return r1(q[0]) + ',' + r1(q[1]); }).join(' ') + '"/>';
  }

  /** Maße und Umrechnung Wert ↔ SVG-Koordinate. */
  function layout(achsen, klein) {
    var ax = achsen.x, ay = achsen.y;
    var xmin = ax.min || 0, ymin = ay.min || 0;
    var nx = Math.max(1, Math.round((ax.max - xmin) / (ax.schritt / 2)));
    var ny = Math.max(1, Math.round((ay.max - ymin) / (ay.schritt / 2)));
    var c = Math.min(klein ? 16 : 26, (klein ? 200 : 290) / nx, (klein ? 140 : 230) / ny);
    var yt = ticks(ymin, ay.max, ay.schritt);
    var lang = yt.reduce(function (m, v) { return Math.max(m, zahl(v).length); }, 1);
    var L = {
      links: 12 + lang * 7.4, oben: 30, rechts: 24, unten: 44,
      pw: nx * c, ph: ny * c, c: c, nx: nx, ny: ny, achsen: achsen
    };
    L.breite = r1(L.links + L.pw + L.rechts);
    L.hoehe = r1(L.oben + L.ph + L.unten);
    L.px = function (x) { return r1(L.links + (x - xmin) / (ax.max - xmin) * L.pw); };
    L.py = function (y) { return r1(L.oben + L.ph - (y - ymin) / (ay.max - ymin) * L.ph); };
    L.xAus = function (px) { return xmin + (px - L.links) / L.pw * (ax.max - xmin); };
    L.yAus = function (py) { return ymin + (L.oben + L.ph - py) / L.ph * (ay.max - ymin); };
    L.pfad = function (punkte) { return punkte.map(function (p, i) { return (i ? 'L' : 'M') + L.px(p[0]) + ' ' + L.py(p[1]); }).join(' '); };
    L.yAchse = L.py(ymin < 0 && ay.max > 0 ? 0 : ymin);
    return L;
  }

  /** opts = { achsen, kurven: [{ punkte, farbe: 's'|'v'|'a', label }], marken?: [[x,y]…], klein? } → { svg: Markup, L } */
  function markup(opts) {
    var A = opts.achsen, ax = A.x, ay = A.y;
    var L = layout(A, opts.klein);
    var x0 = L.links, x1 = L.links + L.pw, y1 = L.oben, y0 = L.oben + L.ph, ya = L.yAchse;
    var t = [];
    // Karo
    var karo = '';
    for (var i = 0; i <= L.nx; i++) { var gx = r1(x0 + i * L.c); karo += 'M' + gx + ' ' + y1 + 'V' + r1(y0); }
    for (var j = 0; j <= L.ny; j++) { var gy = r1(y0 - j * L.c); karo += 'M' + r1(x0) + ' ' + gy + 'H' + r1(x1); }
    t.push('<path class="dia-karo" d="' + karo + '"/>');
    // Achsen mit Pfeilen
    t.push('<line class="dia-achse" x1="' + r1(x0) + '" y1="' + ya + '" x2="' + r1(x1 + 12) + '" y2="' + ya + '"/>' + pfeil(x1 + 18, ya, 'rechts'));
    t.push('<line class="dia-achse" x1="' + r1(x0) + '" y1="' + r1(y0) + '" x2="' + r1(x0) + '" y2="' + (y1 - 12) + '"/>' + pfeil(x0, y1 - 18, 'oben'));
    // Skala
    ticks(ax.min || 0, ax.max, ax.schritt).forEach(function (v) {
      var p = L.px(v);
      t.push('<line class="dia-strich" x1="' + p + '" y1="' + (ya - 3) + '" x2="' + p + '" y2="' + (ya + 3) + '"/>');
      t.push('<text class="dia-zahl" x="' + p + '" y="' + r1(ya + 16) + '" text-anchor="middle">' + esc(zahl(v)) + '</text>');
    });
    ticks(ay.min || 0, ay.max, ay.schritt).forEach(function (v) {
      if (v === 0 && !(ay.min < 0)) return;   // die 0 am Ursprung steht schon an der t-Achse
      var p = L.py(v);
      t.push('<line class="dia-strich" x1="' + r1(x0 - 3) + '" y1="' + p + '" x2="' + r1(x0 + 3) + '" y2="' + p + '"/>');
      t.push('<text class="dia-zahl" x="' + r1(x0 - 6) + '" y="' + r1(p + 4) + '" text-anchor="end">' + esc(zahl(v)) + '</text>');
    });
    // Achsentitel
    t.push('<text class="dia-titel" x="' + r1(x1 + 18) + '" y="' + r1(ya + 34) + '" text-anchor="end">' + esc(ax.g + ' in ' + ax.e) + '</text>');
    t.push('<text class="dia-titel" x="' + r1(x0 + 10) + '" y="' + (y1 - 11) + '">' + esc(ay.g + ' in ' + ay.e) + '</text>');
    // Kurven
    var namen = [];
    (opts.kurven || []).forEach(function (k) {
      if (!k.punkte || !k.punkte.length) return;
      var f = farbe(k.farbe), label = k.label || f + '(t)', last = k.punkte[k.punkte.length - 1];
      namen.push(label);
      t.push('<path class="dia-kurve dia-kurve--' + f + '" d="' + L.pfad(k.punkte) + '"/>');
      t.push('<text class="dia-label dia-label--' + f + '" x="' + r1(L.px(last[0]) - 4) + '" y="' + r1(L.py(last[1]) - 8) + '" text-anchor="end">' + esc(label) + '</text>');
    });
    (opts.marken || []).forEach(function (m) {
      t.push('<circle class="dia-marke" cx="' + L.px(m[0]) + '" cy="' + L.py(m[1]) + '" r="4.5"/>');
    });
    var aria = 'Diagramm: ' + ay.g + ' in ' + ay.e + ' über ' + ax.g + ' in ' + ax.e + (namen.length ? ', ' + namen.join(', ') : '');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="abb-svg dia' + (opts.klein ? ' dia--klein' : '') + '" viewBox="0 0 ' + L.breite + ' ' + L.hoehe +
      '" role="img" aria-label="' + esc(aria) + '">' + t.join('') + '</svg>';
    return { svg: svg, L: L };
  }

  /** SVG-Element; die Umrechnung hängt als `.diagramm` daran (für Punkte setzen). */
  function zeichne(opts) {
    var m = markup(opts);
    var el = W.frag(m.svg);
    el.diagramm = m.L;
    return el;
  }

  /* ---------- Mini-Graphen für Auswahloptionen ---------- */

  var MINI = {
    's-gleich': { f: function (t) { return 0.85 * t; }, text: 'Gerade, steigt gleichmäßig an' },
    'v-gleich': { f: function () { return 0.55; }, text: 'waagerechte Linie oberhalb der t-Achse' },
    'a-gleich': { f: function () { return 0; }, text: 'Linie auf der t-Achse (a = 0)' },
    's-beschl': { f: function (t) { return 0.9 * t * t; }, text: 'Kurve, wird immer steiler' },
    'v-beschl': { f: function (t) { return 0.85 * t; }, text: 'Gerade, steigt vom Ursprung an' },
    'a-beschl': { f: function () { return 0.5; }, text: 'waagerechte Linie oberhalb der t-Achse' },
    's-brems': { f: function (t) { return 0.9 * (2 * t - t * t); }, text: 'Kurve, wird immer flacher' },
    'v-brems': { f: function (t) { return 0.85 * (1 - t); }, text: 'Gerade, fällt bis auf null' },
    'a-brems': { f: function () { return -0.5; }, text: 'waagerechte Linie unterhalb der t-Achse' },
    's-ruhe': { f: function () { return 0.5; }, text: 'waagerechte Linie oberhalb der t-Achse' },
    'v-ruhe': { f: function () { return 0; }, text: 'Linie auf der t-Achse (v = 0)' }
  };

  /** SVG-Markup eines kleinen Graphen ohne Zahlen (für wahl-Optionen). */
  function mini(art) {
    var d = MINI[art];
    if (!d) return '';
    var g = art.charAt(0), neg = g === 'a';
    var x0 = 16, x1 = 104, yTop = 10, yBot = neg ? 78 : 72, ya = neg ? 44 : 72, skala = neg ? 28 : 56;
    var t = [], karo = '';
    for (var x = x0; x <= x1 + 0.1; x += 8) karo += 'M' + x + ' ' + yTop + 'V' + yBot;
    for (var y = yBot; y >= yTop - 0.1; y -= 8) karo += 'M' + x0 + ' ' + y + 'H' + x1;
    t.push('<path class="dia-karo" d="' + karo + '"/>');
    t.push('<line class="dia-achse" x1="' + x0 + '" y1="' + ya + '" x2="' + (x1 + 6) + '" y2="' + ya + '"/>' + pfeil(x1 + 12, ya, 'rechts'));
    t.push('<line class="dia-achse" x1="' + x0 + '" y1="' + yBot + '" x2="' + x0 + '" y2="' + (yTop - 2) + '"/>' + pfeil(x0, yTop - 8, 'oben'));
    t.push('<text class="dia-titel" x="' + (x0 + 7) + '" y="' + (yTop + 3) + '">' + g + '</text>');
    t.push('<text class="dia-titel" x="' + (x1 + 12) + '" y="' + (ya - 7) + '" text-anchor="end">t</text>');
    var pts = kurve(d.f, 0, 1, 24).map(function (p, i) { return (i ? 'L' : 'M') + r1(x0 + p[0] * (x1 - 8 - x0)) + ' ' + r1(ya - p[1] * skala); });
    t.push('<path class="dia-kurve dia-kurve--' + g + '" d="' + pts.join(' ') + '"/>');
    return '<svg xmlns="http://www.w3.org/2000/svg" class="dia dia--mini" viewBox="0 0 120 ' + (yBot + 4) + '" role="img" aria-label="' +
      esc(g + '-t-Diagramm: ' + d.text) + '">' + t.join('') + '</svg>';
  }

  W.diagramm = { zeichne: zeichne, markup: markup, mini: mini, kurve: kurve, einrasten: einrasten, layout: layout, MINI: Object.keys(MINI) };
})();
