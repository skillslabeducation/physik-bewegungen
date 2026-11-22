/* Akte 7 (Bremsen): Beinahe-Unfall auf dem Radweg. Blatt 2 A2 a–g (korrigiert), Tafel S. 12 und S. 14 A2 d.
   Plus: Reaktionsweg und Anhalteweg. Alle Zahlen kommen aus W.physik. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik, D = W.diagramm, F = P.FEHLER;
  W.akten = W.akten || [];

  var f = P.fmt;
  function f4(x) { return P.fmt(x, 4); }
  function p(s) { return '<p>' + s + '</p>'; }

  /* ---------- Messung (Blatt 2, A2): Weg seit Beginn des Bremsens ---------- */
  var V0 = 9, A = 4.5;                                   // v₀ in m/s, Betrag der Bremsbeschleunigung in m/s²
  var TS = [0, 0.5, 1, 1.5, 2];
  var SS = TS.map(function (t) { return P.sBrems(V0, A, t); });   // 0; 3,9375; 6,75; 8,4375; 9
  var MV = P.mittel(TS, SS);                             // v̄ bei 0,25; 0,75; 1,25; 1,75 s
  var MA = P.mittel(MV.t, MV.wert);                      // ā bei 0,5; 1; 1,5 s (je −4,5)
  var T_STOP = P.bremsZeit(V0, A);                       // 2 s
  var V0_KMH = P.kmh(V0);                                // 32,4 km/h
  function sF(t) { return P.sBrems(V0, A, t); }
  function vF(t) { return V0 - A * t; }

  /* ---------- Tafel S. 12: 100 km/h, Stillstand nach 5 s bzw. 3 s ---------- */
  var V100 = P.ms(100);                                  // 27,78 m/s
  var A5 = V100 / 5, S5 = P.sBrems(V100, A5, 5);         // 5,56 m/s², 69,44 m
  var A3 = V100 / 3, S3 = P.sBrems(V100, A3, 3);         // 9,26 m/s², 41,67 m

  /* ---------- Tafel S. 14, A2 d: Bremsweg ab 80 m/s mit 12 m/s² ---------- */
  var T14 = P.bremsZeit(80, 12), S14 = P.bremsWeg(80, 12);   // 6,67 s, 266,67 m

  /* ---------- Gutachten: Behauptung 18 km/h ---------- */
  var V18 = P.ms(18), S18 = P.bremsWeg(V18, A);         // 5 m/s, 2,78 m

  /* ---------- Plus: Reaktionsweg ---------- */
  var TR = 1, SR = P.sGleich(V0, TR), SB = P.bremsWeg(V0, A), SA = SR + SB;   // 9 m + 9 m = 18 m

  /* ---------- Diagramme ---------- */
  var X_T = { g: 't', e: 's', max: 2.5, schritt: 0.5 };
  var ACH_S = { x: X_T, y: { g: 's', e: 'm', max: 10, schritt: 1 } };
  var ACH_V = { x: X_T, y: { g: 'v', e: 'm/s', max: 10, schritt: 1 } };
  var ACH_A = { x: X_T, y: { g: 'a', e: 'm/s²', min: -6, max: 2, schritt: 2 } };
  var KURVE_S = D.kurve(sF, 0, T_STOP);
  var KURVE_V = D.kurve(vF, 0, T_STOP);
  var MARKEN_S = TS.map(function (t, i) { return [t, SS[i]]; });
  var MARKEN_V = MV.t.map(function (t, i) { return [t, MV.wert[i]]; });
  var ABB_S = { achsen: ACH_S, kurven: [{ punkte: KURVE_S, farbe: 's', label: 's(t)' }], marken: MARKEN_S };
  var ABB_V = { achsen: ACH_V, kurven: [{ punkte: KURVE_V, farbe: 'v', label: 'v(t)' }], marken: MARKEN_V };
  var ABB_A = { achsen: ACH_A, kurven: [{ punkte: [[0, -A], [T_STOP, -A]], farbe: 'a', label: 'a(t)' }] };

  var TAB1 = '<table class="tab"><thead><tr><th>t in s</th>' + TS.map(function (t) { return '<td>' + f(t) + '</td>'; }).join('') + '</tr></thead>' +
    '<tbody><tr><th>s in m</th>' + SS.map(function (s) { return '<td>' + f4(s) + '</td>'; }).join('') + '</tr></tbody></table>';
  var TAB2 = '<table class="tab"><thead><tr><th>t in s</th>' + MV.t.map(function (t) { return '<td>' + f(t) + '</td>'; }).join('') + '</tr></thead>' +
    '<tbody><tr><th>v̄ in m/s</th>' + MV.wert.map(function (v) { return '<td>' + f4(v) + '</td>'; }).join('') + '</tr></tbody></table>';

  var WEG_V = MV.wert.map(function (v, i) {
    return p('v̄(' + f(MV.t[i]) + ' s) = (' + f4(SS[i + 1]) + ' m − ' + f4(SS[i]) + ' m) / (' + f(TS[i + 1]) + ' s − ' + f(TS[i]) + ' s) = ' + f4(v) + ' m/s');
  }).join('');
  var WEG_A = MA.wert.map(function (a, i) {
    return p('ā(' + f(MA.t[i]) + ' s) = (' + f4(MV.wert[i + 1]) + ' m/s − ' + f4(MV.wert[i]) + ' m/s) / (' + f(MV.t[i + 1]) + ' s − ' + f(MV.t[i]) + ' s) = ' + f(a) + ' m/s²');
  }).join('');

  W.akten.push({
    id: 'bremsen', nr: 7, titel: 'Bremsen', fall: 'Beinahe-Unfall auf dem Radweg',

    auftrag: {
      text: p('Osterstraße in Eimsbüttel, später Nachmittag. Ein E-Bike fährt auf dem Radfahrstreifen an parkenden Autos vorbei. Zwischen zwei Autos läuft ein kleines Kind auf den Radweg. Der Fahrer macht eine Vollbremsung und steht nach ' + f(T_STOP) + ' s, knapp vor dem Kind. Niemand wurde berührt.') +
        p('Der Fahrer sagt: „Ich war höchstens 18 km/h schnell.“ Die Kamera eines Lieferwagens hat die Bremsung gefilmt. Daraus hat das Büro den Weg s seit Beginn des Bremsens bestimmt (Tabelle 1).') +
        '<p class="hinweis-klein">Zum Blatt (2. Vorbereitung, A2): Dort steht „Bei s = 15 m steht es still“ und unter Tabelle 1 „Abstand vom Punkt, wo es schließlich anhält“; laut Tabelle steht das Rad aber bei s = ' + f(SS[4]) + ' m, und s ist der Weg seit Beginn des Bremsens, so wie hier.</p>',
      daten: TAB1,
      chefin: 'Akte 7. Der Radfahrer sagt, er war langsam. Die Tabelle sagt etwas anderes. Rechne nach.',
      leitfrage: 'Wie schnell fuhr das E-Bike unmittelbar, bevor es bremste?'
    },

    karten: [
      {
        titel: 'Bremsen heißt: Beschleunigung mit Minus',
        text: p('Beim Bremsen nimmt die Geschwindigkeit ab. Δv = v − v₀ ist negativ, also ist auch a = Δv/Δt negativ. Für das E-Bike: a = (0 m/s − ' + f(V0) + ' m/s) / ' + f(T_STOP) + ' s = ' + f(-A) + ' m/s². Das Blatt sagt deshalb „mittlere (negative!) Beschleunigung“.') +
          p('An der Tafel (S. 12) steht für das gleichmäßige Abbremsen <strong>v = v₀ − a·t</strong> und <strong>s = v₀·t − a/2·t²</strong>. Dort steckt das Minus schon in der Formel. Für a setzt du deshalb nur den Betrag ein, also ' + f(A) + ' m/s².'),
        abb: ABB_A,
        merk: 'Die Beschleunigung beim Bremsen ist negativ (a = ' + f(-A) + ' m/s²). In v = v₀ − a·t und s = v₀·t − a/2·t² setzt du den Betrag ein (' + f(A) + ' m/s²).',
        achtung: p('Setzt du −' + f(A) + ' in v = v₀ − a·t ein, wird aus minus mal minus plus: Das Rad würde rechnerisch schneller. Ein Minus reicht.')
      },
      {
        titel: 'Die drei Graphen beim Bremsen',
        text: p('<strong>s(t):</strong> Der Graph steigt und wird immer flacher, bis er waagerecht ist. Er ist ein Stück einer nach unten offenen Parabel bis zum Scheitel. Am Scheitel steht das Fahrzeug, beim E-Bike bei t = ' + f(T_STOP) + ' s und s = ' + f(SS[4]) + ' m.') +
          p('<strong>v(t):</strong> fallende Gerade, sie beginnt bei v₀ und erreicht beim Stillstand die Zeitachse.') +
          p('<strong>a(t):</strong> waagerechte Linie unterhalb der Zeitachse, weil a konstant und negativ ist.'),
        abb: ABB_S,
        merk: 'Bremsen bis zum Stand: s(t) wird immer flacher und endet waagerecht, v(t) fällt geradlinig auf null, a(t) liegt unter der t-Achse.',
        achtung: p('Der s(t)-Graph fällt beim Bremsen nicht. Das Rad fährt weiter vorwärts, nur immer langsamer. Fallend ist der v(t)-Graph.')
      },
      {
        titel: 'Anhaltezeit und Bremsweg',
        text: p('Beim Stillstand ist v = 0. Aus v = v₀ − a·t wird 0 = v₀ − a·t. Seitentausch: | + a·t, dann | : a. So bekommst du die Anhaltezeit <strong>t = v₀/a</strong> oder, wenn die Zeit bekannt ist, <strong>a = v₀/t</strong>.') +
          p('Tafel S. 12: Ein Auto fährt 100 km/h = ' + f(V100) + ' m/s und steht nach 5 s. Dann ist a = ' + f(V100) + ' m/s / 5 s ≈ ' + f(A5) + ' m/s² und der Bremsweg s = v₀·t − a/2·t² ≈ ' + f(S5, 1) + ' m. Steht es schon nach 3 s, ist a ≈ ' + f(A3) + ' m/s² und s ≈ ' + f(S3, 1) + ' m.'),
        abb: { achsen: { x: { g: 't', e: 's', max: 6, schritt: 1 }, y: { g: 'v', e: 'm/s', max: 30, schritt: 5 } },
          kurven: [{ punkte: [[0, V100], [5, 0]], farbe: 'v', label: 'v(t), 5 s' }, { punkte: [[0, V100], [3, 0]], farbe: 'v', label: 'v(t), 3 s' }] },
        merk: 'Erst die Bremszeit t = v₀/a, dann der Bremsweg s = v₀·t − a/2·t².',
        achtung: p('Rechne km/h vorher in m/s um: geteilt durch 3,6. Mit 100 statt ' + f(V100) + ' wird alles falsch.')
      },
      {
        titel: 'Messtabelle beim Bremsen auswerten',
        text: p('Aus zwei aufeinanderfolgenden Orten bekommst du die mittlere Geschwindigkeit v̄ = Δs/Δt. Sie gehört zur Mitte des Zeitintervalls. Aus zwei solchen Geschwindigkeiten bekommst du ā = Δv/Δt, wieder in der Mitte.') +
          p('Beim E-Bike sinkt v̄ in jeder halben Sekunde um ' + f(MV.wert[0] - MV.wert[1]) + ' m/s. Gleiche Schritte heißt: ā ist konstant, ā = ' + f(MA.wert[0]) + ' m/s².') +
          p('v₀ bekommst du, indem du die v(t)-Gerade bis t = 0 verlängerst, oder mit v₀ = a·t = ' + f(A) + ' m/s² · ' + f(T_STOP) + ' s = ' + f(V0) + ' m/s.'),
        abb: ABB_V,
        merk: 'Die mittlere Geschwindigkeit zwischen zwei Messungen gehört zur Mitte des Zeitintervalls. Aus 5 Orten werden 4 Geschwindigkeiten und 3 Beschleunigungen.',
        achtung: p('Der erste Wert v̄ = ' + f4(MV.wert[0]) + ' m/s gehört zu t = ' + f(MV.t[0]) + ' s, nicht zu t = 0. Die Anfangsgeschwindigkeit ist größer: ' + f(V0) + ' m/s.')
      },
      {
        titel: 'Reaktionsweg und Anhalteweg',
        plus: true,
        text: p('Bevor jemand bremst, vergeht die Reaktionszeit (oft etwa 1 s). In dieser Zeit fährt das Fahrzeug ungebremst weiter, also gleichförmig: Reaktionsweg s<sub>R</sub> = v₀·t<sub>R</sub>.') +
          p('Anhalteweg = Reaktionsweg + Bremsweg. Beim E-Bike mit 1 s Reaktionszeit: ' + f(SR) + ' m + ' + f(SB) + ' m = ' + f(SA) + ' m.'),
        abb: { achsen: { x: { g: 't', e: 's', max: 3.5, schritt: 0.5 }, y: { g: 'v', e: 'm/s', max: 10, schritt: 1 } },
          kurven: [{ punkte: [[0, V0], [TR, V0], [TR + T_STOP, 0]], farbe: 'v', label: 'v(t)' }] },
        merk: 'Anhalteweg = Reaktionsweg (v₀·t<sub>R</sub>) + Bremsweg (v₀·t − a/2·t²).'
      }
    ],

    ueben: [
      {
        id: 'bremsen-u1', typ: 'punkte', quelle: 'Blatt 2, A2 a',
        frage: 'Zeichne den Graphen von s(t) nach Tabelle 1. Setze für jeden Zeitpunkt den Punkt (auf das nächste Karo gerundet).' + '<div class="tab-wrap">' + TAB1 + '</div>',
        achsen: ACH_S, xs: TS.slice(), soll: SS.slice(), tol: 0.3, kurve: KURVE_S
      },
      {
        id: 'bremsen-u2', typ: 'wahl', quelle: 'Blatt 2, A2 b',
        frage: 'Welche Beschreibung passt zum s(t)-Graphen der Bremsung?',
        abb: ABB_S,
        optionen: [
          'Der Graph steigt und wird immer flacher, bis er bei t = 2 s waagerecht ist: ein Stück einer nach unten offenen Parabel. Das E-Bike legt pro halbe Sekunde immer weniger Weg zurück, bis es steht.',
          'Der Graph ist eine Ursprungsgerade. Das E-Bike legt in jeder halben Sekunde gleich viel Weg zurück.',
          'Der Graph wird immer steiler, wie eine nach oben offene Parabel. Das E-Bike wird schneller.',
          'Der Graph fällt, weil das E-Bike langsamer wird.'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: Form (flacher werdend, Scheitel bei 2 s) und Bedeutung (immer weniger Weg pro Zeit, dann Stillstand) gehören beide in die Beschreibung.',
          'Das wäre gleichförmige Bewegung. Rechne nach: In der ersten halben Sekunde sind es ' + f4(SS[1]) + ' m, in der letzten nur ' + f4(SS[4] - SS[3]) + ' m.',
          'So sieht s(t) beim Anfahren aus dem Stand aus. Hier wird der Graph flacher, weil das Rad langsamer wird.',
          'Du verwechselst s(t) mit v(t). Der Weg wächst weiter, solange das Rad rollt, nur der Zuwachs wird kleiner. Fallend ist der v(t)-Graph.'
        ]
      },
      {
        id: 'bremsen-u3', typ: 'wahl', quelle: 'Blatt 2, A2 b',
        frage: 'Welcher Funktionsterm passt zu Tabelle 1?' + '<div class="tab-wrap">' + TAB1 + '</div>',
        optionen: [
          's(t) = 9 m/s · t − 2,25 m/s² · t²',
          's(t) = 9 m/s · t − 4,5 m/s² · t²',
          's(t) = 2,25 m/s² · t²',
          's(t) = 4,5 m/s · t'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: v₀ = ' + f(V0) + ' m/s und a/2 = ' + f(A) + ' m/s² / 2 = ' + f(A / 2) + ' m/s². Probe: s(2 s) = 18 m − 9 m = 9 m.',
          F.halbVergessen.erkl + ' Mit 4,5 käme s(2 s) = 18 m − 18 m = 0 m heraus.',
          'Das ist die Form für das Anfahren aus dem Stand. Das E-Bike startet aber mit 9 m/s: s(1 s) wäre nur 2,25 m statt 6,75 m.',
          'Das wäre gleichförmige Bewegung mit v̄ = 9 m / 2 s. Sie passt nur zum Endpunkt, nicht zu s(1 s) = 6,75 m.'
        ]
      },
      {
        id: 'bremsen-u4', typ: 'rechnung', quelle: 'Blatt 2, A2 c',
        frage: 'Berechne aus den ersten beiden Werten von Tabelle 1 die mittlere Geschwindigkeit v̄(t = 0,25 s).',
        gegeben: p('t₁ = 0 s, s₁ = 0 m; t₂ = 0,5 s, s₂ = ' + f4(SS[1]) + ' m'),
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: t₁ = 0 s, s₁ = 0 m, t₂ = 0,5 s, s₂ = 3,9375 m<br>Gesucht: v̄ in m/s',
            'Gegeben: t₁ = 0 s, s₁ = 0 m, t₂ = 0,5 s, s₂ = 3,9375 m<br>Gesucht: ā in m/s²',
            'Gegeben: t₁ = 0 s, s₁ = 0 m/s, t₂ = 0,5 s, s₂ = 3,9375 m/s<br>Gesucht: v̄ in m/s'
          ], richtig: 0, optErkl: [
            'Richtig: zwei Orte mit ihren Zeiten, gesucht ist die mittlere Geschwindigkeit.',
            'Aus zwei Orten bekommst du erst eine Geschwindigkeit. Für eine Beschleunigung brauchst du zwei Geschwindigkeiten.',
            'Schau auf die Einheit: In Tabelle 1 stehen Orte in m, keine Geschwindigkeiten.'
          ] },
          { art: 'formel', optionen: ['v̄ = Δs/Δt', 'ā = Δv/Δt', 's = a/2·t²'], richtig: 0, optErkl: [
            'Richtig: Wegänderung geteilt durch Zeitspanne.',
            'Das ist die Beschleunigung. Hier hast du Orte, keine Geschwindigkeiten.',
            'Diese Formel gilt fürs Anfahren aus dem Stand. Aus Messwerten bestimmst du v̄ mit Δs/Δt.'
          ] },
          { art: 'einsetzen', optionen: [
            'v̄ = (3,9375 m − 0 m) / (0,5 s − 0 s)',
            'v̄ = (0,5 s − 0 s) / (3,9375 m − 0 m)',
            'v̄ = 3,9375 m / 0,25 s'
          ], richtig: 0, optErkl: [
            'Richtig: Endwert minus Anfangswert, oben der Weg, unten die Zeit.',
            F.kehrwert.erkl,
            'Durch 0,25 s teilst du nicht: Das ist der Zeitpunkt, zu dem v̄ gehört. Die Zeitspanne ist Δt = 0,5 s.'
          ] }
        ],
        antwort: MV.wert[0], einheit: 'm/s', formel: 'v-gleich',
        loesung: p('v̄ = Δs/Δt = (s₂ − s₁)/(t₂ − t₁)') +
          p('v̄(0,25 s) = (' + f4(SS[1]) + ' m − 0 m)/(0,5 s − 0 s) = ' + f4(SS[1]) + ' m / 0,5 s = ' + f4(MV.wert[0]) + ' m/s') +
          p('Der Wert gehört zur Mitte des Intervalls: (0 s + 0,5 s)/2 = 0,25 s.')
      },
      {
        id: 'bremsen-u5', typ: 'tabelle', quelle: 'Blatt 2, A2 c',
        frage: 'Bestimme aus aufeinanderfolgenden Werten von Tabelle 1 alle vier mittleren Geschwindigkeiten und trage sie in Tabelle 2 ein.' + '<div class="tab-wrap">' + TAB1 + '</div>',
        spalten: ['t in s'].concat(MV.t.map(function (t) { return f(t); })),
        zeilen: [{ kopf: 'v̄ in m/s', zellen: MV.wert.map(function (v) { return { zahl: v }; }) }],
        erkl: WEG_V + p('Die Werte sinken in gleichen Schritten: Das Rad wird gleichmäßig langsamer.')
      },
      {
        id: 'bremsen-u6', typ: 'punkte', quelle: 'Blatt 2, A2 d',
        frage: 'Zeichne den Graphen von v(t) nach Tabelle 2. Setze die vier Punkte (auf das nächste Karo gerundet).' + '<div class="tab-wrap">' + TAB2 + '</div>',
        achsen: ACH_V, xs: MV.t.slice(), soll: MV.wert.slice(), tol: 0.3, kurve: KURVE_V
      },
      {
        id: 'bremsen-u7', typ: 'wahl', quelle: 'Blatt 2, A2 e',
        frage: 'Welche Beschreibung passt zum v(t)-Graphen der Bremsung?',
        abb: ABB_V,
        optionen: [
          'Eine fallende Gerade: v nimmt in jeder halben Sekunde um 2,25 m/s ab und erreicht bei t = 2 s die Zeitachse. Das E-Bike bremst gleichmäßig bis zum Stand.',
          'Eine waagerechte Linie: Das E-Bike fährt mit konstanter Geschwindigkeit.',
          'Eine Kurve, die immer flacher wird, wie der s(t)-Graph.',
          'Eine fallende Gerade. Bei t = 2 s ist die Beschleunigung null.'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: Form (fallende Gerade bis zur Zeitachse) und Bedeutung (gleichmäßiges Abbremsen bis zum Stand).',
          'Waagerecht wäre v(t) nur bei gleichförmiger Bewegung. Die Werte in Tabelle 2 sinken aber.',
          'Die Werte sinken in gleichen Schritten um ' + f(MV.wert[0] - MV.wert[1]) + ' m/s. Gleiche Schritte ergeben eine Gerade, keine Kurve.',
          'Bei t = 2 s ist die Geschwindigkeit null, nicht die Beschleunigung. a ist die ganze Zeit ' + f(-A) + ' m/s².'
        ]
      },
      {
        id: 'bremsen-u8', typ: 'wahl', quelle: 'Blatt 2, A2 e',
        frage: 'Welcher Funktionsterm passt zum v(t)-Graphen?',
        optionen: [
          'v(t) = 9 m/s − 4,5 m/s² · t',
          'v(t) = 9 m/s − 2,25 m/s² · t',
          'v(t) = 9 m/s + 4,5 m/s² · t',
          'v(t) = 7,875 m/s − 4,5 m/s² · t'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: Start bei v₀ = 9 m/s, pro Sekunde 4,5 m/s weniger. Probe: v(2 s) = 9 m/s − 9 m/s = 0.',
          'Die 2,25 ist a/2 aus dem s(t)-Term. In v = v₀ − a·t steht die ganze Beschleunigung. Mit 2,25 stünde das Rad erst nach ' + f(P.bremsZeit(V0, A / 2)) + ' s.',
          F.vorzeichen.erkl + ' Mit Plus würde das Rad schneller.',
          'Die 7,875 m/s ist der erste Wert aus Tabelle 2 und gehört zu t = 0,25 s, nicht zu t = 0. v₀ ist der Wert bei t = 0: 9 m/s.'
        ]
      },
      {
        id: 'bremsen-u9', typ: 'rechnung', quelle: 'Blatt 2, A2 f',
        frage: 'Berechne aus den ersten beiden Werten von Tabelle 2 die mittlere (negative) Beschleunigung ā(t = 0,5 s). Auf dem Blatt steht hier versehentlich „v(t = 0,5 s)“, gemeint ist a.',
        gegeben: p('v̄(0,25 s) = ' + f4(MV.wert[0]) + ' m/s, v̄(0,75 s) = ' + f4(MV.wert[1]) + ' m/s'),
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: t₁ = 0,25 s, v₁ = 7,875 m/s, t₂ = 0,75 s, v₂ = 5,625 m/s<br>Gesucht: ā in m/s²',
            'Gegeben: t₁ = 0,25 s, v₁ = 7,875 m/s, t₂ = 0,75 s, v₂ = 5,625 m/s<br>Gesucht: v̄ in m/s',
            'Gegeben: t₁ = 0,25 s, v₁ = 7,875 m/s², t₂ = 0,75 s, v₂ = 5,625 m/s²<br>Gesucht: ā in m/s²'
          ], richtig: 0, optErkl: [
            'Richtig: zwei Geschwindigkeiten mit ihren Zeitpunkten, gesucht ist die Beschleunigung.',
            'Die Geschwindigkeiten hast du schon. Gesucht ist, wie schnell sie sich ändern: die Beschleunigung.',
            'Schau auf die Einheit: Geschwindigkeiten haben m/s, nicht m/s².'
          ] },
          { art: 'formel', optionen: ['ā = Δv/Δt', 'v̄ = Δs/Δt', 'a = 2s/t²'], richtig: 0, optErkl: [
            'Richtig: Geschwindigkeitsänderung geteilt durch Zeitspanne, auch beim Bremsen.',
            'Das ist die mittlere Geschwindigkeit. Die hast du in c) schon bestimmt.',
            'Diese Formel gilt nur fürs Anfahren aus dem Stand und braucht einen Weg.'
          ] },
          { art: 'einsetzen', optionen: [
            'ā = (5,625 m/s − 7,875 m/s) / (0,75 s − 0,25 s)',
            'ā = (7,875 m/s − 5,625 m/s) / (0,75 s − 0,25 s)',
            'ā = 7,875 m/s / 0,25 s',
            'ā = (0,75 s − 0,25 s) / (5,625 m/s − 7,875 m/s)'
          ], richtig: 0, optErkl: [
            'Richtig: Endwert minus Anfangswert, oben und unten in derselben Reihenfolge.',
            'Du hast Anfangswert minus Endwert gerechnet. ' + F.vorzeichen.erkl,
            F.messwertStattDifferenz.erkl,
            F.kehrwert.erkl
          ] }
        ],
        antwort: MA.wert[0], auch: [-MA.wert[0]], einheit: 'm/s²', formel: 'brems-a',
        loesung: p('ā = Δv/Δt = (v₂ − v₁)/(t₂ − t₁)') +
          p('ā(0,5 s) = (' + f4(MV.wert[1]) + ' m/s − ' + f4(MV.wert[0]) + ' m/s)/(0,75 s − 0,25 s) = ' + f(MV.wert[1] - MV.wert[0]) + ' m/s / 0,5 s = ' + f(MA.wert[0]) + ' m/s²') +
          p('Zeitpunkt: Mitte zwischen 0,25 s und 0,75 s, also 0,5 s. Das Minus zeigt: Das Rad wird langsamer. Der Betrag ' + f(A) + ' m/s² ist die Bremsverzögerung.')
      },
      {
        id: 'bremsen-u10', typ: 'tabelle', quelle: 'Blatt 2, A2 f',
        frage: 'Bestimme aus aufeinanderfolgenden Werten von Tabelle 2 alle drei mittleren Beschleunigungen und trage sie in Tabelle 3 ein.' + '<div class="tab-wrap">' + TAB2 + '</div>',
        spalten: ['t in s'].concat(MA.t.map(function (t) { return f(t); })),
        zeilen: [{ kopf: 'ā in m/s²', zellen: MA.wert.map(function (a) { return { zahl: a, auch: [-a] }; }) }],
        erkl: WEG_A + p('Alle drei Werte sind gleich: Die Beschleunigung ist konstant, das Rad bremst gleichmäßig. Das Minus gehört dazu; den Betrag ' + f(A) + ' lässt die App auch gelten.')
      },
      {
        id: 'bremsen-u11', typ: 'rechnung', quelle: 'Blatt 2, A2 g',
        frage: 'Wie schnell fuhr das E-Bike unmittelbar, bevor es bremste? Nutze ā = ' + f(-A) + ' m/s² und den Stillstand nach ' + f(T_STOP) + ' s.',
        gegeben: p('ā = ' + f(-A) + ' m/s² (Betrag ' + f(A) + ' m/s²), Stillstand nach t = ' + f(T_STOP) + ' s, also v(2 s) = 0'),
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: a = 4,5 m/s² (Betrag), t = 2 s, v = 0 m/s<br>Gesucht: v₀ in m/s',
            'Gegeben: a = 4,5 m/s² (Betrag), t = 2 s, v = 0 m/s<br>Gesucht: s in m',
            'Gegeben: a = 4,5 m/s (Betrag), t = 2 s, v = 0 m/s<br>Gesucht: v₀ in m/s'
          ], richtig: 0, optErkl: [
            'Richtig: gesucht ist die Geschwindigkeit vor dem Bremsen, v₀.',
            'Den Weg (9 m) kennst du schon aus der Tabelle. Gesucht ist die Geschwindigkeit vor dem Bremsen.',
            'Schau auf die Einheit: a = 4,5 m/s², nicht m/s.'
          ] },
          { art: 'formel', optionen: ['v = v₀ − a·t', 'v = s/t', 's = a/2·t²'], richtig: 0, optErkl: [
            'Richtig: gleichmäßiges Abbremsen, a als Betrag eingesetzt.',
            'Mit 9 m / 2 s bekommst du nur die mittlere Geschwindigkeit während der Bremsung (' + f(SS[4] / T_STOP) + ' m/s). Am Anfang war das Rad schneller.',
            'Diese Formel gilt fürs Anfahren aus dem Stand und liefert einen Weg, keine Geschwindigkeit.'
          ] },
          { art: 'umstellen', optionen: ['v₀ = a·t', 'v₀ = a/t', 'v₀ = −a·t'], richtig: 0, optErkl: [
            'Richtig: Beim Stillstand ist v = 0. Aus 0 = v₀ − a·t wird mit | + a·t: v₀ = a·t.',
            'Aus 0 = v₀ − a·t folgt v₀ = a·t. Durch t teilst du hier nicht.',
            'Beim Seitentausch | + a·t steht a·t ohne Minus auf der anderen Seite. v₀ ist positiv, a ist hier schon der Betrag.'
          ] },
          { art: 'einsetzen', optionen: ['v₀ = 4,5 m/s² · 2 s', 'v₀ = 2,25 m/s² · 2 s', 'v₀ = 4,5 m/s² · 1,75 s'], richtig: 0, optErkl: [
            'Richtig: Betrag der Beschleunigung mal Anhaltezeit.',
            'Die 2,25 ist a/2 aus dem s(t)-Term. In v = v₀ − a·t steht die ganze Beschleunigung.',
            '1,75 s ist der letzte Zeitpunkt aus Tabelle 2. Das Rad steht aber erst bei t = 2 s.'
          ] }
        ],
        antwort: V0, einheit: 'm/s', formel: 'v-at',
        loesung: p('0 = v₀ − a·t | + a·t') +
          p('v₀ = a·t = ' + f(A) + ' m/s² · ' + f(T_STOP) + ' s = ' + f(V0) + ' m/s') +
          p('Zweiter Weg: v(t)-Gerade bis t = 0 verlängern. Von t = 0,25 s zurück bis t = 0: v₀ = ' + f4(MV.wert[0]) + ' m/s + ' + f(A) + ' m/s² · 0,25 s = ' + f4(MV.wert[0]) + ' m/s + ' + f4(A * 0.25) + ' m/s = ' + f(V0) + ' m/s') +
          p('In km/h: ' + f(V0) + ' m/s · 3,6 = ' + f(V0_KMH) + ' km/h')
      },
      {
        id: 'bremsen-u12', typ: 'wahl',
        frage: 'Welcher a(t)-Graph passt zu einer gleichmäßigen Bremsung?',
        optionen: [D.mini('a-brems'), D.mini('a-beschl'), D.mini('a-gleich'), D.mini('v-brems')],
        richtig: 0,
        optErkl: [
          'Richtig: a ist konstant und negativ, die Linie liegt waagerecht unter der t-Achse.',
          'Oberhalb der t-Achse ist a positiv. So sieht a(t) beim Anfahren aus. Beim Bremsen ist a negativ.',
          'a = 0 gilt bei konstanter Geschwindigkeit. Beim Bremsen ändert sich v, also ist a nicht null.',
          'Das ist der v(t)-Graph der Bremsung, schau auf die Achse. Die Beschleunigung selbst ändert sich nicht, sie ist konstant.'
        ]
      },
      {
        id: 'bremsen-u13', typ: 'rechnung', quelle: 'Tafel S. 12',
        frage: 'Ein Auto fährt mit 100 km/h und bremst gleichmäßig. Nach 5 s steht es. Wie groß ist der Betrag der Bremsbeschleunigung?',
        gegeben: p('v₀ = 100 km/h, Stillstand nach t = 5 s'),
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: v₀ = 100 km/h = 27,78 m/s, t = 5 s, v = 0 m/s<br>Gesucht: a in m/s²',
            'Gegeben: v₀ = 100 km/h = 360 m/s, t = 5 s, v = 0 m/s<br>Gesucht: a in m/s²',
            'Gegeben: v₀ = 100 km/h = 27,78 m/s, t = 5 s, v = 0 m/s<br>Gesucht: s in m'
          ], richtig: 0, optErkl: [
            'Richtig: v₀ in m/s umgerechnet, gesucht ist a.',
            F.mal36.erkl,
            'Nach dem Bremsweg fragt die nächste Aufgabe. Hier ist a gesucht.'
          ] },
          { art: 'formel', optionen: ['v = v₀ − a·t', 'v = a·t', 's = v₀·t − a/2·t²'], richtig: 0, optErkl: [
            'Richtig: Tafel S. 12, gleichmäßiges Abbremsen mit a als Betrag.',
            'Das gilt fürs Anfahren aus dem Stand. Beim Bremsen startest du bei v₀.',
            'Den Weg kennst du nicht. Mit dieser Formel rechnest du danach den Bremsweg aus.'
          ] },
          { art: 'umstellen', optionen: ['a = v₀/t', 'a = t/v₀', 'a = v₀·t'], richtig: 0, optErkl: [
            'Richtig: 0 = v₀ − a·t, dann | + a·t und | : t, wie an der Tafel.',
            F.kehrwert.erkl,
            'Aus a·t = v₀ wird durch Teilen durch t: a = v₀/t. Malnehmen ist der falsche Seitentausch.'
          ] },
          { art: 'einsetzen', optionen: ['a = 27,78 m/s / 5 s', 'a = 100 km/h / 5 s', 'a = 5 s / 27,78 m/s'], richtig: 0, optErkl: [
            'Richtig: Geschwindigkeit in m/s, geteilt durch die Zeit in s.',
            'Erst in m/s umrechnen: 100 km/h = 27,78 m/s. Sonst kommt keine Beschleunigung in m/s² heraus.',
            F.kehrwert.erkl
          ] }
        ],
        antwort: A5, auch: [-A5], einheit: 'm/s²', formel: 'brems-a',
        loesung: p('100 km/h = 100 : 3,6 m/s ≈ ' + f(V100) + ' m/s') +
          p('0 = v₀ − a·t | + a·t') + p('a·t = v₀ | : t') +
          p('a = v₀/t = 27,78 m/s / 5 s = 5,556 m/s² ≈ ' + f(A5) + ' m/s²') +
          p('Das ist der Betrag. Die Beschleunigung selbst ist negativ: a ≈ ' + f(-A5) + ' m/s².')
      },
      {
        id: 'bremsen-u14', typ: 'rechnung', quelle: 'Tafel S. 12',
        frage: 'Ein Auto bremst gleichmäßig von 100 km/h (27,78 m/s) in 5 s bis zum Stand, a = 5,556 m/s² (Betrag). Wie lang ist der Bremsweg?',
        gegeben: p('v₀ = 27,78 m/s, t = 5 s, a = 5,556 m/s²'),
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: v₀ = 27,78 m/s, t = 5 s, a = 5,556 m/s²<br>Gesucht: s in m',
            'Gegeben: v₀ = 27,78 m/s, t = 5 s, a = 5,556 m/s<br>Gesucht: s in m',
            'Gegeben: v₀ = 27,78 m/s, t = 5 s, a = 5,556 m/s²<br>Gesucht: v in m/s'
          ], richtig: 0, optErkl: [
            'Richtig: alles in m, s und m/s², gesucht ist der Bremsweg.',
            'Schau auf die Einheit: a = 5,556 m/s², nicht m/s.',
            'Die Geschwindigkeit am Ende ist 0. Gesucht ist der Weg.'
          ] },
          { art: 'formel', optionen: ['s = v₀·t − a/2·t²', 's = v₀·t', 's = v₀·t + a/2·t²', 's = a/2·t²'], richtig: 0, optErkl: [
            'Richtig: Beim Bremsen startest du mit v₀, die Bremsung zieht a/2·t² ab.',
            'So weit käme das Auto ohne Bremsen (' + f(V100 * 5, 1) + ' m). Der Teil − a/2·t² fehlt.',
            'Beim Bremsen wird abgezogen: s = v₀·t − a/2·t². Mit Plus würde das Auto schneller.',
            'Das gilt fürs Anfahren aus dem Stand. Das Auto startet aber mit 27,78 m/s.'
          ] },
          { art: 'einsetzen', optionen: [
            's = 27,78 m/s · 5 s − 5,556 m/s² / 2 · (5 s)²',
            's = 27,78 m/s · 5 s − 5,556 m/s² / 2 · 5 s',
            's = 27,78 m/s · 5 s − 5,556 m/s² · (5 s)²'
          ], richtig: 0, optErkl: [
            'Richtig: beide Teile des Wegs mit Einheiten.',
            F.quadratVergessen.erkl,
            F.halbVergessen.erkl + ' Ohne die Hälfte käme beim Bremsen bis zum Stand immer 0 m heraus.'
          ] }
        ],
        antwort: S5, auch: [69.45], einheit: 'm', formel: 'bremsweg',
        loesung: p('s = v₀·t − a/2·t²') +
          p('s = 27,78 m/s · 5 s − 5,556 m/s² / 2 · (5 s)² = 138,9 m − 69,45 m = 69,45 m') +
          p('Mit ungerundeten Werten: s ≈ ' + f(S5) + ' m. Beides zählt.')
      },
      {
        id: 'bremsen-u15', typ: 'tabelle', quelle: 'Tafel S. 12',
        frage: 'Dasselbe Auto (100 km/h = 27,78 m/s) soll schon nach 3 s stehen. Ergänze die Zeile für 3 s (Betrag von a, Bremsweg).',
        spalten: ['Stillstand nach', 'Betrag von a in m/s²', 'Bremsweg in m'],
        zeilen: [
          { kopf: '5 s', zellen: [{ fix: f(A5) }, { fix: f(S5, 1) }] },
          { kopf: '3 s', zellen: [{ zahl: A3, auch: [-A3] }, { zahl: S3 }] }
        ],
        erkl: p('a = v₀/t = 27,78 m/s / 3 s = 9,26 m/s²') +
          p('s = 27,78 m/s · 3 s − 9,26 m/s² / 2 · (3 s)² = 83,34 m − 41,67 m = 41,67 m') +
          p('Kürzere Bremszeit heißt größere Bremsbeschleunigung und kürzerer Bremsweg.')
      },
      {
        id: 'bremsen-u16', typ: 'rechnung', quelle: 'Tafel S. 14, A2 d',
        frage: 'Ein Fahrzeug hat nach 400 m die Geschwindigkeit 80 m/s erreicht. Dann bremst es mit a = −12 m/s² bis zum Stand. Wie lang ist der Bremsweg?',
        gegeben: p('v₀ = 80 m/s, a = −12 m/s²'),
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: v₀ = 80 m/s, a = −12 m/s² (Betrag 12 m/s²)<br>Gesucht: s in m',
            'Gegeben: v₀ = 80 m/s, a = −12 m/s² (Betrag 12 m/s²)<br>Gesucht: t in s',
            'Gegeben: v₀ = 80 m/s, a = −12 m/s (Betrag 12 m/s)<br>Gesucht: s in m'
          ], richtig: 0, optErkl: [
            'Richtig: gesucht ist der Bremsweg.',
            'Die Bremszeit brauchst du unterwegs, gefragt ist aber der Bremsweg.',
            'Schau auf die Einheit: a = −12 m/s², nicht m/s.'
          ] },
          { art: 'formel', optionen: ['s = v₀·t − a/2·t²', 's = v₀·t', 's = a/2·t²'], richtig: 0, optErkl: [
            'Richtig: gleichmäßiges Abbremsen, a als Betrag.',
            F.gleichfoermig.erkl.replace('Hier wird beschleunigt.', 'Hier wird gebremst.'),
            'Das gilt fürs Anfahren aus dem Stand. Das Fahrzeug startet aber mit 80 m/s.'
          ] },
          { art: 'umstellen', optionen: ['t = v₀/a', 't = a/v₀', 't = v₀·a'], richtig: 0, optErkl: [
            'Richtig: Am Ende ist v = 0. Aus 0 = v₀ − a·t folgt die Bremszeit t = v₀/a.',
            F.kehrwert.erkl,
            'Aus a·t = v₀ folgt durch Teilen durch a: t = v₀/a. Malnehmen ist der falsche Seitentausch.'
          ] },
          { art: 'einsetzen', optionen: [
            't = 80 m/s / 12 m/s² ≈ 6,667 s<br>s = 80 m/s · 6,667 s − 12 m/s² / 2 · (6,667 s)²',
            't = 80 m/s / 12 m/s² ≈ 6,667 s<br>s = 80 m/s · 6,667 s − (−12 m/s²) / 2 · (6,667 s)²',
            't = 80 m/s / 12 m/s² ≈ 6,667 s<br>s = 80 m/s · 6,667 s − 12 m/s² · (6,667 s)²'
          ], richtig: 0, optErkl: [
            'Richtig: Betrag der Beschleunigung, Hälfte und Quadrat.',
            'Das Minus steht schon in der Formel. Setzt du −12 ein, wird aus minus mal minus plus, und der Weg wird größer statt kleiner. Setz den Betrag 12 m/s² ein.',
            F.halbVergessen.erkl + ' Ohne die Hälfte käme beim Bremsen bis zum Stand immer 0 m heraus.'
          ] }
        ],
        antwort: S14, einheit: 'm', formel: 'bremsweg',
        loesung: p('Bremszeit: 0 = v₀ − a·t ⇒ t = v₀/a = 80 m/s / 12 m/s² ≈ ' + f(T14, 3) + ' s') +
          p('s = v₀·t − a/2·t²') +
          p('s ≈ 80 m/s · 6,667 s − 12 m/s² / 2 · (6,667 s)² ≈ 533,36 m − 266,69 m = 266,67 m') +
          p('Der Bremsweg beträgt rund ' + f(S14, 0) + ' m.')
      },
      {
        id: 'bremsen-u17', typ: 'rechnung', plus: true,
        frage: 'Das E-Bike fährt 9 m/s, sein Bremsweg ist 9 m. Der Fahrer braucht aber 1 s, bis er überhaupt bremst (Reaktionszeit). Wie lang ist der Anhalteweg?',
        gegeben: p('v₀ = ' + f(V0) + ' m/s, t<sub>R</sub> = ' + f(TR) + ' s, Bremsweg s<sub>B</sub> = ' + f(SB) + ' m'),
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: v₀ = 9 m/s, t<sub>R</sub> = 1 s, s<sub>B</sub> = 9 m<br>Gesucht: Anhalteweg s<sub>A</sub> in m',
            'Gegeben: v₀ = 9 m/s, t<sub>R</sub> = 1 s, s<sub>B</sub> = 9 m<br>Gesucht: Reaktionsweg s<sub>R</sub> in m'
          ], richtig: 0, optErkl: [
            'Richtig: gefragt ist der ganze Weg bis zum Stillstand.',
            'Der Reaktionsweg ist nur der erste Teil. Gefragt ist der ganze Weg bis zum Stillstand.'
          ] },
          { art: 'formel', optionen: ['s<sub>A</sub> = v₀·t<sub>R</sub> + s<sub>B</sub>', 's<sub>A</sub> = s<sub>B</sub>', 's<sub>A</sub> = v₀·t<sub>R</sub> − s<sub>B</sub>'], richtig: 0, optErkl: [
            'Richtig: In der Reaktionszeit fährt das Rad gleichförmig weiter, danach kommt der Bremsweg.',
            'Du hast den Reaktionsweg vergessen. In der Reaktionszeit fährt das Rad ungebremst weiter.',
            'Die beiden Wege liegen hintereinander. Sie werden addiert.'
          ] },
          { art: 'einsetzen', optionen: ['s<sub>A</sub> = 9 m/s · 1 s + 9 m', 's<sub>A</sub> = 9 m/s · 3 s'], richtig: 0, optErkl: [
            'Richtig: Reaktionsweg plus Bremsweg.',
            'Mit konstant 9 m/s fährt das Rad nur in der Reaktionszeit. Beim Bremsen wird es langsamer.'
          ] }
        ],
        antwort: SA, einheit: 'm', formel: 's-gleich',
        loesung: p('Reaktionsweg: s<sub>R</sub> = v₀·t<sub>R</sub> = ' + f(V0) + ' m/s · ' + f(TR) + ' s = ' + f(SR) + ' m') +
          p('Anhalteweg: s<sub>A</sub> = s<sub>R</sub> + s<sub>B</sub> = ' + f(SR) + ' m + ' + f(SB) + ' m = ' + f(SA) + ' m')
      },
      {
        id: 'bremsen-u18', typ: 'wahl', plus: true,
        frage: 'Ein Fahrzeug fährt doppelt so schnell. Reaktionszeit und Bremsbeschleunigung bleiben gleich. Was passiert mit Reaktionsweg und Bremsweg?',
        optionen: [
          'Der Reaktionsweg verdoppelt sich, der Bremsweg vervierfacht sich.',
          'Beide Wege verdoppeln sich.',
          'Der Reaktionsweg bleibt gleich, nur der Bremsweg wird länger.',
          'Beide Wege vervierfachen sich.'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: s<sub>R</sub> = v₀·t<sub>R</sub> wächst mit v₀. Die Bremszeit t = v₀/a verdoppelt sich auch, deshalb werden beide Teile von s = v₀·t − a/2·t² viermal so groß.',
          'Für den Reaktionsweg stimmt das. Beim Bremsweg verdoppeln sich aber v₀ und die Bremszeit, zusammen ergibt das den Faktor 4.',
          'Die Reaktionszeit bleibt gleich, aber in dieser Zeit fährst du doppelt so schnell, also doppelt so weit.',
          'Der Reaktionsweg ist gleichförmig: s<sub>R</sub> = v₀·t<sub>R</sub>. Doppelte Geschwindigkeit heißt doppelter Weg, nicht vierfacher.'
        ]
      }
    ],

    trainer: ['brems-a', 'bremsweg', 'kmh-ms'],

    erklaeren: [
      {
        id: 'bremsen-e1', quelle: 'Blatt 2, A2 b',
        frage: 'Beschreibe den Graphen von s(t) für die Bremsung des E-Bikes und gib den Funktionsterm an.',
        abb: ABB_S,
        tipp: 'Sag, welche Form der Graph hat, wie sich die Steigung ändert und was bei t = 2 s passiert. Übersetze das dann in die Bewegung.',
        begriffe: [
          { name: 'Parabel', muster: ['parabel'] },
          { name: 'nach unten offen', muster: ['unten offen', 'nach unten geoeffnet'] },
          { name: 'flacher', muster: ['flacher', 'flach'] },
          { name: 'waagerecht', muster: ['waagerecht', 'waagrecht', 'horizontal'] },
          { name: 'Scheitel', muster: ['scheitel', 'hochpunkt'] },
          { name: 'Stillstand', muster: ['stillstand', 'steht', 'still', 'haelt an', 'anhalten'] },
        ],
        punkte: [
          { text: 'Der Graph beginnt im Ursprung, steigt und wird immer flacher.', p: 1 },
          { text: 'Bei t = 2 s ist er waagerecht (Scheitel einer nach unten offenen Parabel), s = 9 m.', p: 1 },
          { text: 'Bedeutung: Das E-Bike legt pro Zeitabschnitt immer weniger Weg zurück, bis es steht.', p: 1 },
          { text: 'Funktionsterm: s(t) = 9 m/s · t − 2,25 m/s² · t².', p: 1 }
        ],
        muster: 'Der Graph beginnt im Ursprung und steigt zuerst steil an. Dann wird er immer flacher, bis er bei t = 2 s und s = 9 m waagerecht ist. Er ist ein Stück einer nach unten offenen Parabel, der Scheitel liegt bei t = 2 s. Das bedeutet: Das E-Bike legt in jeder halben Sekunde weniger Weg zurück als vorher, es wird also langsamer, bis es nach 9 m steht. Funktionsterm: s(t) = 9 m/s · t − 2,25 m/s² · t².'
      },
      {
        id: 'bremsen-e2', quelle: 'Blatt 2, A2 e',
        frage: 'Beschreibe den Graphen von v(t) für die Bremsung des E-Bikes und gib den Funktionsterm an.',
        abb: ABB_V,
        tipp: 'Welche Form hat der Graph, wo beginnt er, wo trifft er die Zeitachse? Was bedeutet das für die Geschwindigkeit?',
        begriffe: [
          { name: 'Gerade', muster: ['gerade'] },
          { name: 'fallend', muster: ['faellt', 'fallend', 'sinkt', 'abnehm', 'nimmt ab'] },
          { name: 'gleichmäßig', muster: ['gleichmaessig', 'gleich viel', 'konstant'] },
          { name: 'Zeitachse', muster: ['zeitachse', 't achse', 'stillstand', 'steht'] },
          { name: 'negative Beschleunigung', muster: ['negativ', 'brems'] },
        ],
        punkte: [
          { text: 'Der Graph ist eine fallende Gerade.', p: 1 },
          { text: 'Er beginnt bei v₀ = 9 m/s und erreicht bei t = 2 s die Zeitachse (v = 0).', p: 1 },
          { text: 'Bedeutung: Die Geschwindigkeit nimmt gleichmäßig ab, um 4,5 m/s pro Sekunde. Das Rad bremst mit konstanter (negativer) Beschleunigung.', p: 1 },
          { text: 'Funktionsterm: v(t) = 9 m/s − 4,5 m/s² · t.', p: 1 }
        ],
        muster: 'Der Graph ist eine fallende Gerade. Sie beginnt bei t = 0 mit v₀ = 9 m/s und erreicht bei t = 2 s die Zeitachse, dort steht das E-Bike. Die Geschwindigkeit nimmt in gleichen Zeitabschnitten um gleich viel ab, in jeder Sekunde um 4,5 m/s. Das Rad bremst also gleichmäßig, die Beschleunigung ist konstant und negativ: a = −4,5 m/s². Funktionsterm: v(t) = 9 m/s − 4,5 m/s² · t.'
      }
    ],

    gutachten: [
      {
        id: 'bremsen-g1', typ: 'rechnung', quelle: 'Blatt 2, A2 g',
        frage: 'Bestimme, wie schnell das E-Bike unmittelbar vor dem Bremsen fuhr, in km/h. Aus der Messung: ā = ' + f(-A) + ' m/s², Stillstand nach ' + f(T_STOP) + ' s.',
        gegeben: p('ā = ' + f(-A) + ' m/s² (Betrag ' + f(A) + ' m/s²), t = ' + f(T_STOP) + ' s, v(2 s) = 0'),
        schritte: [
          { art: 'formel', optionen: ['v = v₀ − a·t', 'v = s/t', 's = a/2·t²'], richtig: 0, optErkl: [
            'Richtig: gleichmäßiges Abbremsen, a als Betrag.',
            'Mit 9 m / 2 s bekommst du nur die mittlere Geschwindigkeit während der Bremsung (' + f(SS[4] / T_STOP) + ' m/s). Am Anfang war das Rad schneller.',
            'Diese Formel gilt fürs Anfahren aus dem Stand und liefert einen Weg.'
          ] },
          { art: 'umstellen', optionen: ['v₀ = a·t', 'v₀ = a/t', 'v₀ = t/a'], richtig: 0, optErkl: [
            'Richtig: Aus 0 = v₀ − a·t folgt v₀ = a·t.',
            'Aus 0 = v₀ − a·t folgt v₀ = a·t. Durch t teilst du hier nicht.',
            F.kehrwert.erkl
          ] },
          { art: 'einsetzen', optionen: [
            'v₀ = 4,5 m/s² · 2 s, dann · 3,6',
            'v₀ = 4,5 m/s² · 2 s, dann : 3,6',
            'v₀ = 2,25 m/s² · 2 s, dann · 3,6'
          ], richtig: 0, optErkl: [
            'Richtig: erst v₀ in m/s, dann mal 3,6 für km/h.',
            F.durch36.erkl,
            'Die 2,25 ist a/2 aus dem s(t)-Term. In v = v₀ − a·t steht die ganze Beschleunigung.'
          ] }
        ],
        antwort: V0_KMH, einheit: 'km/h', formel: 'v-at',
        loesung: p('0 = v₀ − a·t ⇒ v₀ = a·t') +
          p('v₀ = ' + f(A) + ' m/s² · ' + f(T_STOP) + ' s = ' + f(V0) + ' m/s') +
          p(f(V0) + ' m/s · 3,6 = ' + f(V0_KMH) + ' km/h'),
        satz: {
          optionen: [
            'Das E-Bike fuhr vor dem Bremsen ' + f(V0_KMH) + ' km/h. Die Angabe „höchstens 18 km/h“ ist widerlegt.',
            'Das E-Bike fuhr im Mittel ' + f(P.kmh(SS[4] / T_STOP)) + ' km/h. Die Angabe „höchstens 18 km/h“ stimmt.',
            'Das E-Bike fuhr ' + f(V0) + ' km/h, also langsamer als angegeben.'
          ],
          richtig: 0,
          optErkl: [
            'Richtig: Ergebnis mit Einheit und Bezug zur Behauptung.',
            'Das ist die mittlere Geschwindigkeit während der Bremsung. Gefragt ist die Geschwindigkeit davor.',
            'Die 9 ist in m/s. In km/h sind das ' + f(V0_KMH) + ' km/h.'
          ]
        }
      },
      {
        id: 'bremsen-g2', typ: 'rechnung',
        frage: 'Prüfe die Aussage auch andersherum: Wäre der Fahrer wirklich 18 km/h gefahren und hätte genauso gebremst (' + f(A) + ' m/s²), wie lang wäre sein Bremsweg gewesen?',
        gegeben: p('v₀ = 18 km/h, a = ' + f(A) + ' m/s² (Betrag)'),
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: v₀ = 18 km/h = 5 m/s, a = 4,5 m/s²<br>Gesucht: s in m',
            'Gegeben: v₀ = 18 km/h = 64,8 m/s, a = 4,5 m/s²<br>Gesucht: s in m',
            'Gegeben: v₀ = 18 km/h = 5 m/s, a = 4,5 m/s²<br>Gesucht: t in s'
          ], richtig: 0, optErkl: [
            'Richtig: v₀ in m/s, gesucht ist der Bremsweg.',
            F.mal36.erkl,
            'Die Bremszeit brauchst du unterwegs, gefragt ist aber der Bremsweg.'
          ] },
          { art: 'formel', optionen: ['s = v₀·t − a/2·t²', 's = v₀·t', 's = v₀·t + a/2·t²'], richtig: 0, optErkl: [
            'Richtig: gleichmäßiges Abbremsen bis zum Stand.',
            'Das wäre der Weg ohne Bremsen. Der Teil − a/2·t² fehlt.',
            F.vorzeichen.erkl + ' Deshalb steht in s = v₀·t − a/2·t² ein Minus.'
          ] },
          { art: 'umstellen', optionen: ['t = v₀/a', 't = a/v₀', 't = v₀·a'], richtig: 0, optErkl: [
            'Richtig: Am Ende ist v = 0, aus 0 = v₀ − a·t folgt t = v₀/a.',
            F.kehrwert.erkl,
            'Aus a·t = v₀ folgt durch Teilen durch a: t = v₀/a.'
          ] },
          { art: 'einsetzen', optionen: [
            't = 5 m/s / 4,5 m/s² ≈ 1,111 s<br>s = 5 m/s · 1,111 s − 4,5 m/s² / 2 · (1,111 s)²',
            't = 5 m/s / 4,5 m/s² ≈ 1,111 s<br>s = 5 m/s · 1,111 s − 4,5 m/s² / 2 · 1,111 s',
            't = 5 m/s / 4,5 m/s² ≈ 1,111 s<br>s = 5 m/s · 1,111 s'
          ], richtig: 0, optErkl: [
            'Richtig: erst die Bremszeit, dann beide Teile des Wegs.',
            F.quadratVergessen.erkl,
            'Das wäre der Weg ohne Bremsen. Der Teil − a/2·t² fehlt.'
          ] }
        ],
        antwort: S18, einheit: 'm', formel: 'bremsweg',
        loesung: p('18 km/h = 18 : 3,6 m/s = ' + f(V18) + ' m/s') +
          p('t = v₀/a = 5 m/s / 4,5 m/s² ≈ 1,111 s') +
          p('s = 5 m/s · 1,111 s − 4,5 m/s² / 2 · (1,111 s)² ≈ 5,555 m − 2,777 m ≈ ' + f(S18) + ' m'),
        satz: {
          optionen: [
            'Mit 18 km/h hätte das Rad schon nach rund ' + f(S18, 1) + ' m gestanden. Gemessen sind ' + f(SS[4]) + ' m, also war es schneller.',
            'Mit 18 km/h wären es auch rund 9 m gewesen. Die Aussage passt.',
            'Mit 18 km/h wäre der Bremsweg länger als 9 m gewesen.'
          ],
          richtig: 0,
          optErkl: [
            'Richtig: Der berechnete Bremsweg ist viel kürzer als der gemessene.',
            'Vergleiche die Zahlen: ' + f(S18) + ' m sind viel weniger als 9 m.',
            'Langsamer fahren heißt kürzerer Bremsweg, nicht längerer.'
          ]
        }
      },
      {
        id: 'bremsen-g3', typ: 'wahl',
        frage: 'Für das Gutachten: Welche Aussage über die Beschleunigung des E-Bikes ist richtig?',
        optionen: [
          'a = −4,5 m/s². Das Minus zeigt, dass das E-Bike langsamer wird. In v = v₀ − a·t setzt man den Betrag 4,5 m/s² ein.',
          'a = +4,5 m/s², weil das E-Bike vorwärts fährt.',
          'Die Beschleunigung nimmt beim Bremsen ab, bis sie bei t = 2 s null ist.',
          'In v = v₀ − a·t setzt man a = −4,5 m/s² ein.'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: Beide Schreibweisen passen zusammen, wenn das Minus nur einmal vorkommt.',
          'Die Fahrtrichtung entscheidet nicht über das Vorzeichen von a. a ist negativ, weil die Geschwindigkeit abnimmt: Δv = 0 m/s − 9 m/s.',
          'Du verwechselst a mit v. Die Geschwindigkeit nimmt ab, bis sie null ist. Die Beschleunigung bleibt die ganze Zeit ' + f(-A) + ' m/s².',
          'Dann steht in der Formel minus mal minus, also plus: v = 9 m/s + 4,5 m/s² · t. Das Rad würde schneller. In diese Formel gehört der Betrag.'
        ]
      },
      {
        id: 'bremsen-g4', typ: 'wahl',
        frage: 'Welcher s(t)-Graph gehört zur Bremsung des E-Bikes?',
        optionen: [D.mini('s-brems'), D.mini('s-beschl'), D.mini('s-gleich'), D.mini('v-brems')],
        richtig: 0,
        optErkl: [
          'Richtig: Der Graph steigt, wird immer flacher und endet waagerecht. Dort steht das Rad.',
          'Dieser Graph wird immer steiler: So sieht s(t) beim Anfahren aus. Beim Bremsen wird er flacher.',
          'Eine Gerade bedeutet konstante Geschwindigkeit. Das E-Bike wird aber langsamer.',
          'Das ist der v(t)-Graph der Bremsung, schau auf die Achse. Der Weg nimmt nicht ab.'
        ]
      }
    ],

    ergebnis: p('<strong>Ergebnis:</strong> Das E-Bike bremste gleichmäßig mit a = ' + f(-A) + ' m/s² und stand nach ' + f(T_STOP) + ' s und ' + f(SS[4]) + ' m. Unmittelbar vor dem Bremsen fuhr es ' + f(V0) + ' m/s = ' + f(V0_KMH) + ' km/h. Die Angabe „höchstens 18 km/h“ ist widerlegt: Mit 18 km/h hätte das Rad schon nach rund ' + f(S18, 1) + ' m gestanden.')
  });
})();
