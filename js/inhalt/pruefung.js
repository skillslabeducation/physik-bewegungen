/* Sachverständigenprüfung (Probearbeit): zwei große Aufgaben wie auf den Vorbereitungsblättern, 45 Minuten, 40 Punkte.
   Aufgabe 1: gleichförmig gegen beschleunigt aus dem Stand, Einholen. Aufgabe 2: Messtabelle, freier Fall oder Bremsen.
   Alle Zahlen kommen aus dem Seed (W.physik.rnd): gleicher Seed, gleiche Prüfung. Ohne DOM.
   Rechenteile: Ergebnis als 'zahl'-Item (prüft die App) und `rechenweg` zur Selbstbewertung am Erwartungshorizont.
   Funktionsterme als 'terme'-Item: Zahlen in die Terme eintragen, ein Punkt je Term (keine Auswahl, die Ergebnisse verrät). */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik;
  var G = P.G;

  /* ---------- Hilfen ---------- */
  function f(x, st) { return P.fmt(x, st == null ? 4 : st); }
  function rund(x) { return Math.round(x * 1e9) / 1e9; }
  function exakt(x, st) { var m = Math.pow(10, st); return Math.abs(x * m - Math.round(x * m)) < 1e-6; }
  function erg(x, e) { return (exakt(x, 2) ? '= ' : '≈ ') + f(x, 2) + ' ' + e; }
  function p(s) { return '<p>' + s + '</p>'; }
  function gross(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function zufall(r, liste) { return liste[Math.floor(r() * liste.length)]; }
  function aufzaehlen(liste) { return liste.length > 1 ? liste.slice(0, -1).join(', ') + ' und ' + liste[liste.length - 1] : liste[0]; }
  function kurve(fn, von, bis) {
    var out = [];
    for (var i = 0; i <= 24; i++) { var x = rund(von + (bis - von) * i / 24); out.push([x, rund(fn(x))]); }
    return out;
  }
  /** Skala mit höchstens `n` Strichen. */
  function achseY(max, n) {
    var S = [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
    for (var i = 0; i < S.length; i++) if (max / S[i] <= n + 1e-9) return { schritt: S[i], max: Math.ceil(max / S[i] - 1e-9) * S[i] };
    return { schritt: S[S.length - 1], max: Math.ceil(max / 1000) * 1000 };
  }

  function zahl(id, frage, antwort, einheit, loesung, auch) {
    var it = { id: id, typ: 'zahl', frage: frage, antwort: antwort, tolRel: 0.01, einheit: einheit, loesung: loesung };
    if (auch) it.auch = auch;
    return it;
  }
  /** Rechenweg zum Abhaken; bei Zahl-Ergebnissen dazu die Einheit (die App prüft nur die Zahl). Tabellen haben die Einheit im Kopf. */
  function rw(liste, ohneEinheit) {
    return (ohneEinheit ? liste : liste.concat([['Ergebnis mit der richtigen Einheit auf dem Blatt', 0.5]])).map(function (x) { return { text: x[0], p: x[1] }; });
  }
  /** terme-Item: jede Zeile Text und Zahlfelder ({ zahl }). */
  function terme(id, frage, zeilen, loesung) { return { id: id, typ: 'terme', frage: frage, tolRel: 0.01, terme: zeilen, loesung: loesung }; }
  /** Term als Text, für die Musterlösung. */
  function termText(zeile) { return zeile.map(function (x) { return typeof x === 'string' ? x : f(x.zahl); }).join(''); }
  function tabelle(kopfT, ts, kopfS, ss, unterschrift) {
    function zeile(k, werte) { return '<tr><th scope="row">' + k + '</th>' + werte.map(function (w) { return '<td>' + w + '</td>'; }).join('') + '</tr>'; }
    return '<div class="tab-wrap"><table><tbody>' + zeile(kopfT, ts) + zeile(kopfS, ss) + '</tbody></table></div>' +
      '<p class="hinweis-klein">' + unterschrift + '</p>';
  }

  /* ---------- Aufgabe 1: Zwei Fahrzeuge, Einholen ---------- */
  var ZWEI = [
    { titel: 'E-Bikes an der Ampel', a: [1, 1.25, 1.5], T: [6, 8], t0: [2, 3, 4, 5, 6], tA: [2, 3, 4], S: [30, 40, 50, 60], v2Max: 12, xSchritt: 1,
      nom1: 'E-Bike 1', nom2: 'E-Bike 2', akk1: 'E-Bike 1', gen1: 'von E-Bike 1', gen2: 'von E-Bike 2',
      text: function (z) {
        return p('E-Bike 1 fährt mit konstanter Geschwindigkeit auf einem geraden Radweg. Für die ' + f(z.s0) + ' m zwischen zwei Markierungen braucht es ' + f(z.t0) + ' s.') +
          p('E-Bike 2 wartet an einer Ampel, die gerade grün geworden ist. In dem Augenblick, in dem E-Bike 1 an ihm vorbeifährt (t = 0, s = 0 für beide), fährt E-Bike 2 aus dem Stand gleichmäßig beschleunigt los. In den ersten ' +
            f(z.tA) + ' s legt es ' + f(z.sA) + ' m zurück.');
      } },
    { titel: 'Güterzug und Personenzug', a: [0.25, 0.4, 0.5], T: [60, 80, 100], t0: [20, 25, 30, 40, 50], tA: [10, 20, 30], S: [500, 800, 1000, 1500], v2Max: 40, xSchritt: 10,
      nom1: 'der Güterzug', nom2: 'der Personenzug', akk1: 'den Güterzug', gen1: 'des Güterzugs', gen2: 'des Personenzugs',
      text: function (z) {
        return p('Ein Güterzug fährt mit konstanter Geschwindigkeit auf einer geraden, flachen Strecke. Für einen ' + f(z.s0) + ' m langen Abschnitt braucht er ' + f(z.t0) + ' s.') +
          p('Auf dem Nachbargleis steht ein Personenzug. In dem Augenblick, in dem die Lok des Güterzugs an der Lok des Personenzugs vorbeifährt (t = 0, s = 0 für beide), fährt der Personenzug aus dem Stand gleichmäßig beschleunigt los. In den ersten ' +
            f(z.tA) + ' s legt er ' + f(z.sA) + ' m zurück.');
      } },
    { titel: 'Lkw und Auto', a: [2, 2.5, 3], T: [6, 8, 10], t0: [2, 4, 5, 10], tA: [2, 3, 4], S: [50, 80, 100, 150], v2Max: 25, xSchritt: 1,
      nom1: 'der Lkw', nom2: 'das Auto', akk1: 'den Lkw', gen1: 'des Lkw', gen2: 'des Autos',
      text: function (z) {
        return p('Ein Lkw fährt mit konstanter Geschwindigkeit auf einer Landstraße. Für einen ' + f(z.s0) + ' m langen Abschnitt braucht er ' + f(z.t0) + ' s.') +
          p('An einer Einmündung wartet ein Auto. In dem Augenblick, in dem der Lkw an ihm vorbeifährt (t = 0, s = 0 für beide), fährt das Auto aus dem Stand gleichmäßig beschleunigt los. In den ersten ' +
            f(z.tA) + ' s legt es ' + f(z.sA) + ' m zurück.');
      } }
  ];

  function zahlen1(k, a, T, t0, tA, S) {
    var v1 = a * T / 2, s0 = v1 * t0, sA = a / 2 * tA * tA, sM = v1 * T, tS = Math.sqrt(2 * S / a);
    if (!exakt(v1, 2) || !exakt(s0, 1) || !exakt(sA, 2) || !exakt(a / 2, 4)) return null;
    if (2 * v1 > k.v2Max + 1e-9 || tA >= T) return null;
    if (Math.abs(tS - T) / T < 0.1 || Math.abs(S - sM) < 1e-9) return null;
    return { k: k, a: a, T: T, t0: t0, tA: tA, S: S, v1: v1, s0: rund(s0), sA: rund(sA), sM: rund(sM), tS: tS };
  }

  function aufgabe1(r) {
    var z = null;
    for (var i = 0; i < 80 && !z; i++) {
      var k = zufall(r, ZWEI);
      z = zahlen1(k, zufall(r, k.a), zufall(r, k.T), zufall(r, k.t0), zufall(r, k.tA), zufall(r, k.S));
    }
    if (!z) z = zahlen1(ZWEI[0], 1.25, 8, 4, 4, 50);
    var k2 = z.k, a = z.a, T = z.T, v1 = z.v1;
    var v1T = f(v1) + ' m/s', aT = f(a) + ' m/s²', haT = f(a / 2) + ' m/s²', TT = f(T) + ' s';
    var kmh = P.kmh(v1);
    var xs = [T / 4, T / 2, 3 * T / 4, T].map(rund);
    var ay = achseY(z.sM, 8);
    function s2(t) { return a / 2 * t * t; }
    var terme1 = [['s₁(t) = ', { zahl: v1 }, ' m/s · t'], ['s₂(t) = ', { zahl: a / 2 }, ' m/s² · t²']];

    var teile = [
      { b: 'a', p: 2, kurz: 'v₁ in m/s', trainer: 'v-gleich', akte: 'gleichfoermig',
        item: zahl('p:1a', '<strong>Berechne</strong> die Geschwindigkeit v₁ ' + k2.gen1 + ' in m/s.', v1, 'm/s',
          p('v₁ = s/t') + p('v₁ = ' + f(z.s0) + ' m / ' + f(z.t0) + ' s ' + erg(v1, 'm/s'))),
        rechenweg: rw([['Formel: v₁ = s/t', 0.5], ['Eingesetzt mit Einheiten: v₁ = ' + f(z.s0) + ' m / ' + f(z.t0) + ' s', 0.5]]) },
      { b: 'b', p: 1, kurz: 'v₁ in km/h', trainer: 'ms-kmh', akte: 'gleichfoermig',
        item: zahl('p:1b', '<strong>Rechne</strong> v₁ in km/h <strong>um</strong>.', kmh, 'km/h',
          p('m/s → km/h: mal 3,6') + p('v₁ = ' + v1T + ' = ' + f(v1) + ' · 3,6 km/h ' + erg(kmh, 'km/h'))) },
      { b: 'c', p: 3, kurz: 'Beschleunigung a₂', trainer: 'a-beschl', akte: 'beschleunigt',
        item: zahl('p:1c', '<strong>Berechne</strong> die Beschleunigung a₂ ' + k2.gen2 + '.', a, 'm/s²',
          p('s = a/2·t²  | ·2  | :t²  ⇒  a₂ = 2s/t²') + p('a₂ = 2 · ' + f(z.sA) + ' m / (' + f(z.tA) + ' s)² = ' + f(2 * z.sA) + ' m / ' + f(z.tA * z.tA) + ' s² ' + erg(a, 'm/s²'))),
        rechenweg: rw([['Formel s = a/2·t² nach a umgestellt: a₂ = 2s/t²', 1], ['Eingesetzt mit Einheiten: a₂ = 2 · ' + f(z.sA) + ' m / (' + f(z.tA) + ' s)²', 1]]) },
      { b: 'd', p: 2, kurz: 'Funktionsterme s₁(t), s₂(t)', trainer: 's-beschl', akte: 'einholen',
        item: terme('p:1d', '<strong>Gib</strong> die Funktionsterme s₁(t) und s₂(t) für die zurückgelegten Strecken <strong>an</strong>. Trage die fehlenden Zahlen ein.', terme1,
          p(gross(k2.nom1) + ' fährt gleichförmig: s₁(t) = v₁·t. ' + gross(k2.nom2) + ' beschleunigt aus dem Stand: s₂(t) = a₂/2·t².') + p(terme1.map(termText).join('<br>'))) },
      { b: 'e', p: 3, kurz: 'Graph s₂(t)', trainer: 's-beschl', akte: 'beschleunigt',
        item: { id: 'p:1e', typ: 'punkte',
          frage: '<strong>Zeichne</strong> den Graphen von s₂(t) für 0 ≤ t ≤ ' + TT + '. Setze dazu die Punkte für t = ' + aufzaehlen(xs.map(function (x) { return f(x) + ' s'; })) + '.',
          achsen: { x: { g: 't', e: 's', min: 0, max: T, schritt: k2.xSchritt }, y: { g: 's', e: 'm', min: 0, max: ay.max, schritt: ay.schritt } },
          xs: xs, soll: xs.map(function (x) { return rund(s2(x)); }), kurve: kurve(s2, 0, T),
          loesung: p('s₂(t) = ' + haT + ' · t²: ' + xs.map(function (x) { return 's₂(' + f(x) + ' s) = ' + f(s2(x), 2) + ' m'; }).join('; ')) + p('Der Graph ist eine Halbparabel durch den Ursprung.') } },
      { b: 'f', p: 3, kurz: 'Zeit für ' + f(z.S) + ' m', trainer: 't-beschl', akte: 'beschleunigt',
        item: zahl('p:1f', '<strong>Berechne</strong>: Nach welcher Zeit t hat ' + k2.nom2 + ' ' + f(z.S) + ' m zurückgelegt?', z.tS, 's',
          p('s = a/2·t²  ⇒  t = √(2s/a₂)') + p('t = √(2 · ' + f(z.S) + ' m / ' + aT + ') = √(' + f(2 * z.S / a, 2) + ' s²) ' + erg(z.tS, 's'))),
        rechenweg: rw([['Formel s = a/2·t² nach t umgestellt: t = √(2s/a₂)', 1], ['Eingesetzt mit Einheiten: t = √(2 · ' + f(z.S) + ' m / ' + aT + ')', 1]]) },
      { b: 'g', p: 3, kurz: 'Einholzeit', trainer: 'einholen', akte: 'einholen',
        item: zahl('p:1g', '<strong>Berechne</strong>: Nach welcher Zeit holt ' + k2.nom2 + ' ' + k2.akk1 + ' ein?', T, 's',
          p('Einholen heißt: gleicher Ort, s₁(t) = s₂(t).') + p('v₁·t = a₂/2·t²  | :t  ⇒  v₁ = a₂/2·t  ⇒  t = 2·v₁/a₂') +
          p('t = 2 · ' + v1T + ' / ' + aT + ' ' + erg(T, 's'))),
        rechenweg: rw([['Ansatz gleicher Ort: v₁·t = a₂/2·t²', 1], ['Umgestellt t = 2·v₁/a₂ und eingesetzt mit Einheiten: t = 2 · ' + v1T + ' / ' + aT, 1]]) },
      { b: 'h', p: 3, kurz: 'Treffpunkt', trainer: 's-gleich', akte: 'einholen',
        item: zahl('p:1h', '<strong>Berechne</strong>: In welcher Entfernung vom Start (s = 0) holt ' + k2.nom2 + ' ' + k2.akk1 + ' ein?', z.sM, 'm',
          p('s = v₁·t = ' + v1T + ' · ' + TT + ' ' + erg(z.sM, 'm')) + p('Probe: s₂ = a₂/2·t² = ' + haT + ' · (' + TT + ')² ' + erg(s2(T), 'm'))),
        rechenweg: rw([['Ansatz: Treffpunkt ist der Ort zur Einholzeit, s = v₁·t (oder s = a₂/2·t²)', 1], ['Eingesetzt mit Einheiten: s = ' + v1T + ' · ' + TT, 1]]) }
    ];
    return { nr: 1, titel: k2.titel, text: k2.text(z), teile: teile };
  }

  /* ---------- Aufgabe 2: Messtabelle (freier Fall oder Bremsen) ---------- */
  var FALL = [
    { titel: 'Sprungturm', H: [3, 5, 7.5, 10], d: [0.1, 0.15, 0.25], wer: 'die Springerin',
      text: function (H) {
        var platt = H >= 7.5;   // 7,5 m und 10 m sind Plattformen, 3 m und 5 m Bretter
        return p('Eine Springerin springt aufrecht ' + (platt ? 'von der ' + f(H) + '-m-Plattform' : 'vom ' + f(H) + '-m-Brett') + '. Die Tabelle gibt an, wie weit ihre Fußsohlen zur Zeit t unter ' +
          (platt ? 'der Plattform' : 'dem Brett') + ' sind. Den Luftwiderstand lässt du weg.');
      },
      ende: '<strong>Berechne</strong>: Wann berühren ihre Fußsohlen das Wasser?' },
    { titel: 'Stein von der Brücke', H: [10, 15, 20], d: [0.15, 0.25, 0.3], wer: 'der Stein',
      text: function (H) { return p('Ein Stein fällt von einer ' + f(H) + ' m hohen Brücke ins Wasser. Eine Videoanalyse liefert, wie weit er zur Zeit t gefallen ist. Den Luftwiderstand lässt du weg.'); },
      ende: '<strong>Berechne</strong>: Wann trifft der Stein auf das Wasser?' },
    { titel: 'Fallturm', H: [20, 25, 30, 40], d: [0.25, 0.3], wer: 'die Gondel',
      text: function (H) { return p('Im Freizeitpark fällt die Gondel eines Fallturms aus dem Stand ' + f(H) + ' m frei nach unten, dann setzt die Bremse ein. Ein Sensor misst, wie weit sie zur Zeit t gefallen ist. Reibung und Luftwiderstand lässt du weg.'); },
      ende: '<strong>Berechne</strong>: Nach welcher Zeit setzt die Bremse ein?' },
    { titel: 'Kugel im Physikraum', H: [1.5, 2, 2.5], d: [0.1, 0.15], wer: 'die Kugel',
      text: function (H) { return p('Im Physikraum lässt du eine Stahlkugel aus ' + f(H) + ' m Höhe auf den Boden fallen. Eine Videoanalyse liefert, wie weit sie zur Zeit t gefallen ist. Den Luftwiderstand lässt du weg.'); },
      ende: '<strong>Berechne</strong>: Wann schlägt die Kugel auf dem Boden auf?' }
  ];
  var BREMS = [
    { titel: 'Beinahe-Unfall', v0: [6, 7, 8, 10], tS: [2], aMax: 5, wer: 'das E-Bike', es: 'es',
      text: function (tS) { return p('Ein E-Bike fährt an parkenden Autos vorbei. Plötzlich läuft ein Kind auf den Radweg. Das E-Bike bremst gleichmäßig und steht nach ' + f(tS) + ' s, kurz vor dem Kind. Die Tabelle zeigt den Weg s seit Beginn des Bremsens.'); } },
    { titel: 'Wildwechsel', v0: [12, 14, 15, 16, 18, 20], tS: [2, 3, 4], aMax: 8, wer: 'das Auto', es: 'es',
      text: function (tS) { return p('Ein Auto fährt auf einer Landstraße. Ein Reh springt auf die Fahrbahn. Das Auto bremst gleichmäßig und steht nach ' + f(tS) + ' s, rechtzeitig vor dem Reh. Die Tabelle zeigt den Weg s seit Beginn des Bremsens.'); } },
    { titel: 'Gelbe Ampel', v0: [4, 5, 6, 8], tS: [2, 4], aMax: 4, wer: 'die Radfahrerin', es: 'sie',
      text: function (tS) { return p('Eine Radfahrerin sieht eine Ampel auf Gelb springen. Sie bremst gleichmäßig und steht nach ' + f(tS) + ' s an der Haltelinie. Die Tabelle zeigt den Weg s seit Beginn des Bremsens.'); } }
  ];

  function zahlenFall(r) {
    for (var i = 0; i < 60; i++) {
      var k = zufall(r, FALL), H = zufall(r, k.H), d = zufall(r, k.d);
      if (G / 2 * 16 * d * d < H - 0.5) return { k: k, H: H, d: d };
    }
    return { k: FALL[0], H: 5, d: 0.15 };
  }
  function zahlenBrems(r) {
    for (var i = 0; i < 60; i++) {
      var k = zufall(r, BREMS), v0 = zufall(r, k.v0), tS = zufall(r, k.tS), a = v0 / tS;
      if (a <= k.aMax + 1e-9 && exakt(a, 2) && exakt(a / 2, 4) && exakt(v0 * tS / 32, 4)) return { k: k, v0: v0, tS: tS, a: a };
    }
    return { k: BREMS[0], v0: 8, tS: 2, a: 4 };
  }

  /** Beschreibe-Teil (Erwartungshorizont zum Abhaken). */
  function beschreibe(variante, z, abb) {
    var k = z.k;
    if (variante === 'fall') {
      return { id: 'pruefung-fall-e', frage: '<strong>Beschreibe</strong> den Graphen von s(t) im Diagramm. Was sagt er über die Bewegung aus?', abb: abb,
        punkte: [
          { text: 'Der Graph beginnt im Ursprung und ist eine nach oben offene Parabel (Halbparabel).', p: 1 },
          { text: 'Er wird immer steiler: In gleichen Zeitabschnitten kommt immer mehr Strecke dazu.', p: 1 },
          { text: gross(k.wer) + ' wird also immer schneller: gleichmäßig beschleunigte Bewegung, freier Fall mit a = g.', p: 1 }],
        muster: 'Der Graph beginnt im Ursprung und steigt als nach oben offene Parabel an. Er wird immer steiler: In jedem Zeitabschnitt von ' + f(z.d) + ' s kommt mehr Strecke dazu als im vorherigen. ' +
          gross(k.wer) + ' wird also immer schneller. Das ist eine gleichmäßig beschleunigte Bewegung, der freie Fall mit a = g = 9,81 m/s².',
        tipp: 'Form des Graphen, wie er sich verändert, was das für die Geschwindigkeit bedeutet.',
        begriffe: [{ name: 'Parabel', muster: ['parabel'] }, { name: 'steiler', muster: ['steil'] }, { name: 'schneller', muster: ['schneller'] }, { name: 'beschleunigt', muster: ['beschleunig'] }] };
    }
    var sE = z.v0 * z.tS / 2;
    return { id: 'pruefung-bremsen-e', frage: '<strong>Beschreibe</strong> den Graphen von s(t) im Diagramm. Was sagt er über die Bewegung aus?', abb: abb,
      punkte: [
        { text: 'Der Graph steigt vom Ursprung an und wird immer flacher (nach unten offene Parabel).', p: 1 },
        { text: 'Bei t = ' + f(z.tS) + ' s ist er waagerecht: Scheitel bei s = ' + f(sE) + ' m.', p: 1 },
        { text: 'In gleichen Zeitabschnitten kommt immer weniger Strecke dazu: ' + gross(k.wer) + ' wird langsamer, bis ' + k.es + ' steht.', p: 1 }],
      muster: 'Der Graph steigt vom Ursprung an, wird aber immer flacher. Er ist ein Stück einer nach unten offenen Parabel. Bei t = ' + f(z.tS) + ' s ist er waagerecht, der Scheitel liegt bei s = ' + f(sE) + ' m. ' +
        'In jedem Zeitabschnitt kommt weniger Strecke dazu als im vorherigen: ' + gross(k.wer) + ' wird gleichmäßig langsamer, bis ' + k.es + ' steht.',
      tipp: 'Form des Graphen, wie er sich verändert, was am Ende passiert, was das für die Geschwindigkeit bedeutet.',
      begriffe: [{ name: 'flacher', muster: ['flach'] }, { name: 'Parabel', muster: ['parabel'] }, { name: 'waagerecht', muster: ['waagerecht', 'waagrecht'] }, { name: 'langsamer', muster: ['langsamer'] }] };
  }

  function aufgabe2(r, variante) {
    var fall = variante === 'fall';
    var z = fall ? zahlenFall(r) : zahlenBrems(r);
    var k = z.k, d = fall ? z.d : z.tS / 4;
    var ts = [0, 1, 2, 3, 4].map(function (i) { return rund(i * d); });
    var ss = fall ? ts.map(function (t) { return Math.round(G / 2 * t * t * 1000) / 1000; })
      : ts.map(function (t) { return rund(P.sBrems(z.v0, z.a, t)); });
    var v = P.mittel(ts, ss), acc = P.mittel(v.t, v.wert);
    v = { t: v.t.map(rund), wert: v.wert.map(rund) };
    acc = { t: acc.t.map(rund), wert: acc.wert.map(rund) };
    var dT = f(d) + ' s';
    /** Weg aus Tabelle 1: im freien Fall immer dreistellig wie auf Blatt 1 (0,110). */
    function sT(s) { return fall && s ? s.toFixed(3).replace('.', ',') : f(s); }
    var text = (fall ? k.text(z.H) : k.text(z.tS)) +
      tabelle('t in s', ts.map(function (t) { return f(t); }), 's in m', ss.map(sT),
        fall ? 'Tabelle 1: Fallstrecke s als Funktion der Zeit t' : 'Tabelle 1: Weg s seit Beginn des Bremsens als Funktion der Zeit t');

    var sy = achseY(ss[4], 8);
    var abb = { achsen: { x: { g: 't', e: 's', min: 0, max: ts[4], schritt: d }, y: { g: 's', e: 'm', min: 0, max: sy.max, schritt: sy.schritt } },
      kurven: [{ punkte: fall ? kurve(function (t) { return G / 2 * t * t; }, 0, ts[4]) : kurve(function (t) { return P.sBrems(z.v0, z.a, t); }, 0, ts[4]), farbe: 's' }],
      marken: ts.map(function (t, i) { return [t, ss[i]]; }) };
    var vMax = fall ? G * ts[4] : z.v0;
    var vy = achseY(vMax, 10);
    function vt(t) { return fall ? G * t : z.v0 - z.a * t; }

    var vListe = v.t.map(function (t, i) { return 'v̄(' + f(t, 3) + ' s) ' + erg(v.wert[i], 'm/s'); }).join('; ');
    var aListe = acc.t.map(function (t, i) { return 'ā(' + f(t, 3) + ' s) ' + erg(acc.wert[i], 'm/s²'); }).join('; ');
    var ersteV = 'v̄(t = ' + f(v.t[0], 3) + ' s) = (' + sT(ss[1]) + ' m − 0 m) / (' + dT + ' − 0 s)';
    var ersteA = 'ā(t = ' + f(acc.t[0], 3) + ' s) = (' + f(v.wert[1]) + ' m/s − ' + f(v.wert[0]) + ' m/s) / (' + f(v.t[1], 3) + ' s − ' + f(v.t[0], 3) + ' s)';

    var aT = fall ? '' : f(z.a) + ' m/s²';
    var zeilen2 = fall ? [['a(t) = ', { zahl: G }, ' m/s²'], ['v(t) = ', { zahl: G }, ' m/s² · t'], ['s(t) = ', { zahl: G / 2 }, ' m/s² · t²']]
      : [['a(t) = ', { zahl: -z.a }, ' m/s²'], ['v(t) = ', { zahl: z.v0 }, ' m/s − ', { zahl: z.a }, ' m/s² · t'], ['s(t) = ', { zahl: z.v0 }, ' m/s · t − ', { zahl: z.a / 2 }, ' m/s² · t²']];
    var termeLoesung = (fall ? p('Die Werte in Tabelle 3 liegen bei g = 9,81 m/s². Freier Fall aus dem Stand: a = g, v = g·t und s = g/2·t².')
      : p('ā ist konstant und negativ: a = −' + aT + '. Beim Bremsen gilt v = v₀ − a·t und s = v₀·t − a/2·t², dabei ist a der Betrag. v₀ = a·t = ' + aT + ' · ' + f(z.tS) + ' s = ' + f(z.v0) + ' m/s.')) +
      p(zeilen2.map(termText).join('<br>'));

    var ende;
    if (fall) {
      var tF = Math.sqrt(2 * z.H / G);
      ende = { b: 'f', p: 3, kurz: 'Fallzeit', trainer: 'fall-t', akte: 'fall',
        item: zahl('p:2f', k.ende, tF, 's',
          p('s = g/2·t²  ⇒  t = √(2s/g)') + p('t = √(2 · ' + f(z.H) + ' m / 9,81 m/s²) = √(' + f(2 * z.H / G, 2) + ' s²) ' + erg(tF, 's'))),
        rechenweg: rw([['Formel s = g/2·t² nach t umgestellt: t = √(2s/g)', 1], ['Eingesetzt mit Einheiten: t = √(2 · ' + f(z.H) + ' m / 9,81 m/s²)', 1]]) };
    } else {
      ende = { b: 'f', p: 3, kurz: 'Anfangsgeschwindigkeit v₀', trainer: 'v-at', akte: 'bremsen',
        item: zahl('p:2f', '<strong>Bestimme</strong>: Wie schnell fuhr ' + k.wer + ' unmittelbar, bevor ' + k.es + ' bremste?', z.v0, 'm/s',
          p('Am Ende steht ' + k.wer + ': 0 = v₀ − a·t  ⇒  v₀ = a·t') + p('v₀ = ' + aT + ' · ' + f(z.tS) + ' s = ' + f(z.v0) + ' m/s (' + erg(P.kmh(z.v0), 'km/h') + ')') +
          p('Oder: v(t) im Diagramm bis t = 0 verlängern.')),
        rechenweg: rw([['Ansatz: v₀ = a·t (Betrag der Bremsbeschleunigung mal Bremszeit) oder v(t) bis t = 0 verlängert', 1], ['Eingesetzt mit Einheiten: v₀ = ' + aT + ' · ' + f(z.tS) + ' s', 1]]) };
    }

    var teile = [
      { b: 'a', p: 3, kurz: 'Graph s(t) beschreiben', akte: fall ? 'fall' : 'bremsen', erkl: beschreibe(variante, z, abb) },
      { b: 'b', p: 4, kurz: 'Tabelle v̄', trainer: 'v-gleich', akte: 'messdaten',
        item: { id: 'p:2b', typ: 'tabelle',
          frage: '<strong>Bestimme</strong> aus aufeinanderfolgenden Werten der Tabelle 1 jeweils die mittlere Geschwindigkeit v̄ und <strong>trage</strong> alle vier Werte in Tabelle 2 <strong>ein</strong>. Den Rechenweg für den ersten Wert v̄(t = ' + f(v.t[0], 3) + ' s) schreibst du auf Papier.',
          spalten: ['t in s'].concat(v.t.map(function (t) { return f(t, 3); })),
          zeilen: [{ kopf: 'v̄ in m/s', zellen: v.wert.map(function (x) { return { zahl: x }; }) }],
          loesung: p(ersteV + ' ' + erg(v.wert[0], 'm/s')) + p('Die anderen Werte genauso, jeweils zur Mitte des Zeitintervalls: ' + vListe + '.') },
        rechenweg: rw([['Rechenweg für den ersten Wert mit Differenzen und Einheiten: ' + ersteV, 1]], true) },
      { b: 'c', p: 3, kurz: 'Graph v(t)', trainer: fall ? 'fall-v' : 'brems-a', akte: 'messdaten',
        item: { id: 'p:2c', typ: 'punkte',
          frage: '<strong>Zeichne</strong> den Graphen von v(t) mit den Werten aus Tabelle 2: Setze die vier Punkte jeweils zur Mitte ihres Zeitintervalls.',
          achsen: { x: { g: 't', e: 's', min: 0, max: ts[4], schritt: d }, y: { g: 'v', e: 'm/s', min: 0, max: vy.max, schritt: vy.schritt } },
          xs: v.t.slice(), soll: v.wert.slice(), kurve: kurve(vt, 0, ts[4]),
          loesung: p(vListe) + p(fall ? 'Die Punkte liegen auf einer Ursprungsgeraden: v(t) = 9,81 m/s² · t.' : 'Die Punkte liegen auf einer fallenden Geraden, die bei t = ' + f(z.tS) + ' s die Zeitachse erreicht.') } },
      { b: 'd', p: 4, kurz: 'Tabelle ā', trainer: fall ? 'a-dv' : 'brems-a', akte: 'messdaten',
        item: { id: 'p:2d', typ: 'tabelle',
          frage: '<strong>Bestimme</strong> aus aufeinanderfolgenden Werten der Tabelle 2 jeweils die mittlere ' + (fall ? '' : '(negative!) ') + 'Beschleunigung ā und <strong>trage</strong> alle drei Werte in Tabelle 3 <strong>ein</strong>. Den Rechenweg für den ersten Wert ā(t = ' + f(acc.t[0], 3) + ' s) schreibst du auf Papier.',
          spalten: ['t in s'].concat(acc.t.map(function (t) { return f(t, 3); })),
          zeilen: [{ kopf: 'ā in m/s²', zellen: acc.wert.map(function (x) { return fall ? { zahl: x, auch: [G] } : { zahl: x }; }) }],
          loesung: p(ersteA + ' ' + erg(acc.wert[0], 'm/s²')) + p('Die anderen Werte genauso: ' + aListe + '.') +
            p(fall ? 'Alle Werte liegen bei g = 9,81 m/s² (Rundung der Messwerte).' : 'ā ist konstant und negativ: Das Fahrzeug wird gleichmäßig langsamer.') },
        rechenweg: rw([['Rechenweg für den ersten Wert mit Differenzen und Einheiten: ' + ersteA, 1]], true) },
      { b: 'e', p: 3, kurz: 'Funktionsterme', trainer: fall ? 'fall-v' : 'bremsweg', akte: fall ? 'fall' : 'bremsen',
        item: terme('p:2e', '<strong>Gib</strong> passend zu den berechneten Werten die Funktionsterme für a(t), v(t) und s(t) <strong>an</strong>. Trage die fehlenden Zahlen ein' +
          (fall ? '.' : ', bei a(t) mit Vorzeichen.'), zeilen2, termeLoesung) },
      ende
    ];
    return { nr: 2, titel: k.titel, variante: fall ? 'fall' : 'bremsen', text: text, teile: teile };
  }

  /* ---------- Prüfung ---------- */
  function erzeuge(seed) {
    var r = P.rnd(seed);
    var a1 = aufgabe1(r);
    var a2 = aufgabe2(r, r() < 0.5 ? 'fall' : 'bremsen');
    return { titel: 'Sachverständigenprüfung', dauerMin: 45, max: 40, seed: seed, aufgaben: [a1, a2] };
  }

  function summe(liste) { return (liste || []).reduce(function (s, x) { return s + x.p; }, 0); }
  /** Punkte für das automatisch geprüfte Ergebnis. */
  function pAuto(t) { return t.pAuto != null ? t.pAuto : t.p - summe(t.rechenweg); }
  /** Haken: gültige, verschiedene Indizes. */
  function hakenSumme(liste, haken) {
    var gesehen = {};
    return (Array.isArray(haken) ? haken : []).reduce(function (s, i) {
      if (typeof i !== 'number' || !liste[i] || gesehen[i]) return s;
      gesehen[i] = true;
      return s + liste[i].p;
    }, 0);
  }

  /** antworten[nr + b] = { auto, haken: int[], text? } → { punkte, max, teile: [{ nr, b, punkte, p, anteil }] } */
  function auswerten(pr, antworten) {
    antworten = antworten || {};
    var out = [], gesamt = 0;
    pr.aufgaben.forEach(function (a) {
      a.teile.forEach(function (t) {
        var ant = antworten[a.nr + t.b] || {};
        var pk, anteil = null;
        if (t.erkl) pk = Math.min(t.p, hakenSumme(t.erkl.punkte, ant.haken));
        else {
          anteil = W.aufgaben.score(t.item, ant.auto);
          pk = Math.min(t.p, W.logic.punkteRunden(anteil, pAuto(t)) + hakenSumme(t.rechenweg || [], ant.haken));
        }
        gesamt += pk;
        out.push({ nr: a.nr, b: t.b, punkte: pk, p: t.p, anteil: anteil });
      });
    });
    return { punkte: gesamt, max: pr.max, teile: out };
  }

  /** Was in die Nachermittlung kommt: Trainer-ids falscher Auto-Teile (neue Zahlen), schwache Beschreibungen, Akten zum Wiederholen. */
  function nachermittlung(pr, antworten) {
    antworten = antworten || {};
    var e = auswerten(pr, antworten);
    var trainer = [], erkl = [], akten = [];
    var i = 0;
    pr.aufgaben.forEach(function (a) {
      a.teile.forEach(function (t) {
        var x = e.teile[i++], ant = antworten[a.nr + t.b] || {};
        if (t.item && x.anteil < 1 - 1e-9 && trainer.indexOf('t:' + t.trainer) < 0) trainer.push('t:' + t.trainer);
        if (t.erkl) {
          var prozent = t.p ? x.punkte / t.p : 0;
          if (prozent < W.logic.ERKL_OK) erkl.push({ id: t.erkl.id, prozent: prozent, haken: Array.isArray(ant.haken) ? ant.haken.slice() : [], text: ant.text || '', frage: t.erkl.frage });
        }
        if (x.punkte < 0.75 * t.p - 1e-9 && akten.indexOf(t.akte) < 0) akten.push(t.akte);
      });
    });
    return { trainer: trainer, erkl: erkl, akten: akten };
  }

  /** Beschreibe-Teil für die Nachermittlung (feste Zahlen je Variante). */
  function erklNachId(id) {
    var v = id === 'pruefung-fall-e' ? 'fall' : id === 'pruefung-bremsen-e' ? 'bremsen' : null;
    return v ? aufgabe2(P.rnd(1), v).teile[0].erkl : null;
  }

  W.pruefung = { erzeuge: erzeuge, auswerten: auswerten, pAuto: pAuto, nachermittlung: nachermittlung, erklNachId: erklNachId };
})();
