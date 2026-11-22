/* Akte 8: Freier Fall. Fall „Sprung vom 5-m-Brett“ (erfundenes Hamburger Freibad).
   Quellen: Blatt 1, A3 a–e (Tabellen korrigiert), Tafel S. 8 (Stein 1000 m), Tafel S. 9 A3 (Mond);
   Plus: Tafel S. 4–6 (geneigte Fahrbahn), Tafel S. 15 (Rakete). Alle Zahlen aus W.physik. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik, D = W.diagramm;
  W.akten = W.akten || [];

  var G = P.G;
  var f = function (x, st) { return P.fmt(x, st); };
  /* Fehlertexte der Physik-Logik, beim freien Fall mit g statt a */
  var FE = {};
  Object.keys(P.FEHLER).forEach(function (k) { FE[k] = { erkl: P.FEHLER[k].erkl.replace('2s/a', '2s/g').replace('s = a/2', 's = g/2') }; });

  /* Blatt 1, A3: Messtabelle und Auswertung nach der Mittelpunkt-Regel */
  var T = [0, 0.2, 0.4, 0.6, 0.8], S = [0, 0.196, 0.785, 1.766, 3.139];
  var V = P.mittel(T, S);            // v̄ = 0,98; 2,945; 4,905; 6,865 bei 0,1; 0,3; 0,5; 0,7 s
  var A = P.mittel(V.t, V.wert);     // ā = 9,825; 9,8; 9,8 bei 0,2; 0,4; 0,6 s
  var t5 = P.tAusS(5, G);            // ≈ 1,01 s
  var v5 = P.vBeschl(G, t5);         // ≈ 9,9 m/s
  var v5r = P.vBeschl(G, 1.01);      // mit gerundetem t
  var s05 = P.sBeschl(G, 0.5);       // ≈ 1,23 m
  var t10 = P.tAusS(10, G);          // ≈ 1,43 s

  /* Tafel S. 8: Stein fällt 1000 m */
  var tStein = P.tAusS(1000, G);     // ≈ 14,28 s (Tafel 14,27 s)
  var vStein = P.vBeschl(G, tStein); // ≈ 140 m/s

  /* Tafel S. 9, A3: Mond */
  var gMond = P.aAusS(10, 3.3);      // ≈ 1,84 m/s²
  var vMond = P.vBeschl(gMond, 3.3); // ≈ 6,06 m/s

  /* Plus: Tafel S. 6, Tisch 6 */
  var sin9 = Math.sin(9 * Math.PI / 180);
  var aTisch = P.aAusV(1.677, 1.08);
  var gTisch = aTisch / sin9;

  /* Plus: Rakete (Text aus ENTWURF) */
  var vRak = P.vBeschl(5.5, 30), sRak = P.sBeschl(5.5, 30);
  var t2Rak = vRak / G, tRak = 30 + t2Rak, hRak = sRak + P.sBrems(vRak, G, t2Rak);

  var MESS = 't in s: 0 | 0,2 | 0,4 | 0,6 | 0,8<br>s in m: 0 | 0,196 | 0,785 | 1,766 | 3,139';
  var VTAB = 't in s: 0,1 | 0,3 | 0,5 | 0,7<br>v̄ in m/s: ' + V.wert.map(function (x) { return f(x, 3); }).join(' | ');
  var ziffer = function (x) { return { zahl: x }; };

  W.akten.push({
    id: 'fall', nr: 8, titel: 'Freier Fall', fall: 'Sprung vom 5-m-Brett',
    auftrag: {
      text: '<p>Ein Hamburger Freibad testet am 5-m-Brett eine Videoanalyse. Eine Springerin springt aufrecht ab, ' +
        'die Software misst den Abstand ihrer Fußsohlen vom Brett. Ein Badegast behauptet: „Vom Fünfer ist man in einer halben Sekunde unten.“ ' +
        'Den Luftwiderstand lässt du weg.</p>',
      daten: '<table><tr><th>t in s</th><td>0</td><td>0,2</td><td>0,4</td><td>0,6</td><td>0,8</td></tr>' +
        '<tr><th>s in m</th><td>0</td><td>0,196</td><td>0,785</td><td>1,766</td><td>3,139</td></tr></table>',
      chefin: 'Akte 8. Ein Badegast sagt, vom Fünfer sei man in einer halben Sekunde unten. Die Videoanalyse hat Messwerte. Rechne nach.',
      leitfrage: 'Ist der Sprung ein freier Fall, wie lange dauert er bis zum Wasser und wie schnell trifft die Springerin auf?'
    },

    karten: [
      { titel: 'Freier Fall',
        text: '<p>Lässt man einen Körper aus der Ruhe fallen und gibt es keinen Luftwiderstand, wird er gleichmäßig schneller. Das heißt <strong>freier Fall</strong>: ' +
          'eine gleichmäßig beschleunigte Bewegung aus dem Stand mit der Fallbeschleunigung <strong>a = g = 9,81 m/s²</strong>.</p>' +
          '<p>Es gelten die Formeln aus Akte 3, nur mit g statt a: <strong>v = g·t</strong> und <strong>s = g/2·t²</strong>. ' +
          'Jede Sekunde wird der Körper um 9,81 m/s schneller.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 1.2, schritt: 0.2 }, y: { g: 'v', e: 'm/s', max: 12, schritt: 2 } },
          kurven: [{ punkte: D.kurve(function (t) { return G * t; }, 0, t5), farbe: 'v', label: 'v(t)' }] },
        merk: 'Freier Fall (ohne Luftwiderstand): a = g = 9,81 m/s², v = g·t, s = g/2·t².',
        achtung: '<p>Die Masse spielt beim freien Fall keine Rolle. Dass eine Feder langsamer fällt als ein Stein, liegt am Luftwiderstand, den wir hier weglassen.</p>' },

      { titel: 'Messtabelle auswerten',
        text: '<p>Aus zwei aufeinanderfolgenden Messwerten bekommst du die mittlere Geschwindigkeit: v̄ = Δs/Δt. ' +
          'Sie gehört zur <strong>Mitte</strong> des Zeitintervalls. Beispiel: v̄(0,1 s) = (0,196 m − 0 m) / (0,2 s − 0 s) = 0,98 m/s.</p>' +
          '<p>Aus zwei aufeinanderfolgenden v̄ bekommst du die mittlere Beschleunigung: ā = Δv̄/Δt. Auch sie gehört zur Mitte, ' +
          'also zwischen 0,1 s und 0,3 s zu 0,2 s.</p>' +
          '<p>Beim Sprung ergibt sich ā ≈ 9,8 m/s², immer gleich: Das ist der freie Fall.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 0.8, schritt: 0.2 }, y: { g: 'v', e: 'm/s', max: 8, schritt: 2 } },
          kurven: [{ punkte: D.kurve(function (t) { return G * t; }, 0, 0.8), farbe: 'v', label: 'v(t)' }],
          marken: V.t.map(function (t, i) { return [t, V.wert[i]]; }) },
        merk: 'Aus n Messwerten werden n − 1 Geschwindigkeiten und n − 2 Beschleunigungen. Zeitpunkt ist jeweils die Intervallmitte.',
        achtung: '<p>Auf Blatt 1 (A3) hat die Tabelle für a vier Spalten bis 0,8 s und die Einheit m/s. Richtig sind drei Werte bei 0,2 s, 0,4 s und 0,6 s mit der Einheit m/s². ' +
          'In b) ist mit „Tabelle 3“ die Tabelle 2 gemeint.</p>' },

      { titel: 'Fallzeit und Aufprallgeschwindigkeit',
        text: '<p>Gegeben ist meist die Fallhöhe. Dann stellst du s = g/2·t² nach t um, wie an der Tafel:</p>' +
          '<p>s = g/2·t² | ·2<br>2s = g·t² | :g<br>2s/g = t² | √<br>t = √(2s/g)</p>' +
          '<p>Danach folgt die Geschwindigkeit beim Aufprall aus v = g·t. Vom 5-m-Brett: t = √(2·5 m / 9,81 m/s²) ≈ ' + f(t5) +
          ' s und v ≈ 9,81 m/s² · ' + f(t5) + ' s ≈ ' + f(v5, 1) + ' m/s ≈ ' + f(Math.round(P.kmh(v5))) + ' km/h.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 1.2, schritt: 0.2 }, y: { g: 's', e: 'm', max: 6, schritt: 1 } },
          kurven: [{ punkte: D.kurve(function (t) { return G / 2 * t * t; }, 0, t5), farbe: 's', label: 's(t)' }],
          marken: [[t5, 5]] },
        merk: 't = √(2s/g) und v = g·t.',
        achtung: '<p>Wurzel nicht vergessen. Und s = v·t gilt hier nicht, denn die Geschwindigkeit ist nicht konstant. ' +
          'Wer 5 m durch 9,81 m/s² teilt, bekommt ' + f(5 / G) + ' s², und das ist nicht einmal eine Zeit.</p>' },

      { titel: 'Die Graphen des freien Falls',
        text: '<p>Der freie Fall hat die Graphen der beschleunigten Bewegung aus dem Stand:</p>' +
          '<p><strong>s(t)</strong>: Halbparabel, nach oben offen, wird immer steiler.<br>' +
          '<strong>v(t)</strong>: Ursprungsgerade mit der Steigung g = 9,81 m/s².<br>' +
          '<strong>a(t)</strong>: waagerechte Linie bei 9,81 m/s² oberhalb der t-Achse.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 1.2, schritt: 0.2 }, y: { g: 'a', e: 'm/s²', max: 12, schritt: 2 } },
          kurven: [{ punkte: [[0, G], [t5, G]], farbe: 'a', label: 'a(t)' }] },
        merk: 'a ist konstant, v wächst gleichmäßig, s wächst immer schneller.',
        achtung: '<p>Doppelte Fallzeit heißt nicht doppelte Fallhöhe: Weil t im Quadrat steht, ist es die vierfache Höhe.</p>' },

      { titel: 'Fallen auf dem Mond',
        text: '<p>Wie stark ein Körper fällt, hängt vom Himmelskörper ab. Auf dem Mond gibt es keine Luft, dort ist jeder Fall frei, aber g ist kleiner.</p>' +
          '<p>Aus einem Fallversuch bestimmst du g mit s = g/2·t², umgestellt <strong>g = 2s/t²</strong>. ' +
          'Tafel S. 9: Ein Stein fällt auf dem Mond 10 m in 3,3 s, also g = 2·10 m / (3,3 s)² ≈ ' + f(gMond) + ' m/s².</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 3.5, schritt: 0.5 }, y: { g: 's', e: 'm', max: 10, schritt: 2 } },
          kurven: [{ punkte: D.kurve(function (t) { return G / 2 * t * t; }, 0, P.tAusS(10, G)), farbe: 's', label: 'Erde' },
            { punkte: D.kurve(function (t) { return gMond / 2 * t * t; }, 0, 3.3), farbe: 's', label: 'Mond' }] },
        merk: 'g = 2s/t² aus Fallstrecke und Fallzeit.',
        achtung: '<p>Auf dem Mond nicht mit 9,81 m/s² rechnen. Plus: Der echte Wert auf dem Mond ist etwa 1,62 m/s², die Zahlen der Tafelaufgabe sind gerundet.</p>' },

      { titel: 'Versuch: Wagen auf der geneigten Fahrbahn', plus: true,
        text: '<p>Ein freier Fall ist zu schnell, um ihn mit der Stoppuhr gut zu messen. Im Unterricht rollte deshalb ein Wagen aus dem Stand eine um den Winkel α geneigte Fahrbahn hinunter (Tafel S. 4 bis 6). ' +
          'Dort wirkt nur ein Teil von g: a = g·sin α.</p>' +
          '<p>Gemessen werden Δt, s und v<sub>Ende</sub>. Daraus a = v<sub>Ende</sub>/Δt (oder a = 2s/(Δt)²) und dann <strong>g = a/sin α</strong>. ' +
          'Tisch 6: Δt = 1,08 s, v<sub>Ende</sub> = 1,677 m/s, α = 9°, also a ≈ ' + f(aTisch) + ' m/s² und g ≈ ' + f(gTisch) + ' m/s². Die Tische lagen um 9,81 m/s².</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 1.2, schritt: 0.2 }, y: { g: 'v', e: 'm/s', max: 2, schritt: 0.5 } },
          kurven: [{ punkte: [[0, 0], [1.08, 1.677]], farbe: 'v', label: 'v(t)' }] },
        merk: 'g = a/sin α' },

      { titel: 'Rakete: erst Antrieb, dann nur noch g', plus: true,
        text: '<p>Tafel S. 15, eindeutig formuliert: Eine Rakete beschleunigt 30 s lang mit a = 5,5 m/s² nach oben, danach wirkt nur noch die Erdanziehung.</p>' +
          '<p>Bei Brennschluss: v = 5,5 m/s² · 30 s = ' + f(vRak) + ' m/s und s = 5,5 m/s² / 2 · (30 s)² = ' + f(sRak) + ' m. ' +
          'Danach wird sie mit g = 9,81 m/s² langsamer, bis v = 0 ist: nach weiteren ' + f(t2Rak, 1) + ' s, also ' + f(tRak, 1) + ' s nach dem Start, in etwa ' + f(Math.round(hRak)) + ' m Höhe.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 50, schritt: 10 }, y: { g: 'v', e: 'm/s', max: 180, schritt: 30 } },
          kurven: [{ punkte: [[0, 0], [30, vRak], [tRak, 0]], farbe: 'v', label: 'v(t)' }] },
        merk: 'Nach Brennschluss bremst nur g: Steigzeit t = v/g.' }
    ],

    ueben: [
      { id: 'fall-u1', typ: 'punkte', quelle: 'Blatt 1, A3 a',
        frage: 'Zeichne s(t) für den Sprung: Setze die Messwerte der Videoanalyse als Punkte (0,2 s bis 0,8 s). Ein halbes Karo sind 0,25 m, setze den Punkt so nah wie möglich.<br>' + MESS,
        achsen: { x: { g: 't', e: 's', max: 1, schritt: 0.2 }, y: { g: 's', e: 'm', max: 3.5, schritt: 0.5 } },
        xs: [0.2, 0.4, 0.6, 0.8], soll: [0.196, 0.785, 1.766, 3.139], tol: 0.15,
        erkl: 'Halbparabel: Die Abschnitte werden immer größer.',
        kurve: D.kurve(function (t) { return G / 2 * t * t; }, 0, 0.8) },

      { id: 'fall-u2', typ: 'wahl', quelle: 'Blatt 1, A3 b',
        frage: 'Wie berechnest du den ersten Wert der mittleren Geschwindigkeit aus der Messtabelle?<br>' + MESS,
        optionen: [
          'v̄(0,1 s) = (0,196 m − 0 m) / (0,2 s − 0 s) = 0,98 m/s',
          'v̄(0,1 s) = 0,196 m / 0,1 s = 1,96 m/s',
          'v̄(0,2 s) = (0,196 m − 0 m) / (0,2 s − 0 s) = 0,98 m/s',
          'v̄(0,1 s) = (0,2 s − 0 s) / (0,196 m − 0 m) ≈ 1,02 s/m'
        ], richtig: 0,
        optErkl: [
          'Richtig: Wegänderung durch Zeitspanne, und der Wert gehört zur Intervallmitte 0,1 s.',
          'Die 0,1 s sind der Zeitpunkt (Intervallmitte), nicht die Zeitspanne. Geteilt wird durch Δt = 0,2 s − 0 s = 0,2 s.',
          'Die Zahl stimmt, der Zeitpunkt nicht: 0,2 s ist das Ende des Intervalls. Der Mittelwert gehört zur Intervallmitte 0,1 s.',
          FE.kehrwert.erkl + ' Die Einheit s/m verrät es.'
        ] },

      { id: 'fall-u3', typ: 'tabelle', quelle: 'Blatt 1, A3 b',
        frage: 'Bestimme aus aufeinanderfolgenden Werten der Messtabelle jeweils die mittlere Geschwindigkeit v̄ und trage sie ein.<br>' + MESS +
          '<br>Auf dem Blatt steht hier „Tabelle 3“, gemeint ist diese Tabelle 2 für v̄.',
        spalten: ['t in s', '0,1', '0,3', '0,5', '0,7'],
        zeilen: [{ kopf: 'v̄ in m/s', zellen: [
          { zahl: V.wert[0] },
          { zahl: V.wert[1], auch: [2.94, 2.95] },
          { zahl: V.wert[2], auch: [4.9, 4.91] },
          { zahl: V.wert[3], auch: [6.86, 6.87] }
        ] }],
        erkl: 'v̄(0,3 s) = (0,785 m − 0,196 m) / 0,2 s = ' + f(V.wert[1], 3) + ' m/s; v̄(0,5 s) = (1,766 m − 0,785 m) / 0,2 s = ' + f(V.wert[2], 3) +
          ' m/s; v̄(0,7 s) = (3,139 m − 1,766 m) / 0,2 s = ' + f(V.wert[3], 3) + ' m/s.' },

      { id: 'fall-u17', typ: 'punkte', quelle: 'Blatt 1, A3 b',
        frage: 'Zeichne v(t): Setze die mittleren Geschwindigkeiten aus der Tabelle als Punkte, jeweils zur Intervallmitte. Der Punkt rastet auf 0,5 m/s ein, setze ihn so nah wie möglich.<br>' + VTAB,
        achsen: { x: { g: 't', e: 's', max: 0.8, schritt: 0.2 }, y: { g: 'v', e: 'm/s', max: 8, schritt: 1 } },
        xs: V.t.map(function (t) { return Math.round(t * 10) / 10; }), soll: V.wert,
        kurve: D.kurve(function (t) { return G * t; }, 0, 0.8),
        erkl: 'Die Punkte liegen auf einer Ursprungsgeraden. Ihre Steigung ist etwa g = 9,81 m/s²: v = g·t.' },

      { id: 'fall-u4', typ: 'wahl', quelle: 'Blatt 1, A3 c',
        frage: 'Wie berechnest du den ersten Wert der mittleren Beschleunigung aus der v̄-Tabelle?<br>' + VTAB,
        optionen: [
          'ā(0,2 s) = (2,945 m/s − 0,98 m/s) / (0,3 s − 0,1 s) = 9,825 m/s²',
          'ā(0,2 s) = (2,945 m/s − 0,98 m/s) / (0,3 s − 0,1 s) = 9,825 m/s',
          'ā(0,2 s) = (2,945 m/s − 0,98 m/s) / 0,1 s = 19,65 m/s²',
          'ā(0,1 s) = (2,945 m/s − 0,98 m/s) / (0,3 s − 0,1 s) = 9,825 m/s²'
        ], richtig: 0,
        optErkl: [
          'Richtig: Geschwindigkeitsänderung durch Zeitspanne. 0,2 s ist die Mitte zwischen 0,1 s und 0,3 s.',
          'Die Rechnung stimmt, die Einheit nicht: m/s geteilt durch s ergibt m/s². Auf dem Blatt steht in Tabelle 3 auch m/s, das ist ein Fehler im Blatt.',
          'Du hast durch 0,1 s geteilt, das ist ein Zeitpunkt. Zwischen 0,1 s und 0,3 s liegt die Zeitspanne Δt = 0,2 s.',
          FE.intervallAnfang.erkl + ' Die Mitte zwischen 0,1 s und 0,3 s ist 0,2 s.'
        ] },

      { id: 'fall-u5', typ: 'tabelle', quelle: 'Blatt 1, A3 c',
        frage: 'Bestimme aus aufeinanderfolgenden Werten der v̄-Tabelle jeweils die mittlere Beschleunigung ā und trage sie ein.<br>' + VTAB +
          '<br>Auf dem Blatt hat diese Tabelle vier Spalten bis 0,8 s und die Einheit m/s. Aus vier Geschwindigkeiten gibt es aber nur drei Beschleunigungen, und a hat die Einheit m/s².',
        spalten: ['t in s', '0,2', '0,4', '0,6'],
        zeilen: [{ kopf: 'ā in m/s²', zellen: [
          { zahl: A.wert[0], auch: [9.82, 9.83] },
          { zahl: A.wert[1], auch: [9.80] },
          { zahl: A.wert[2], auch: [9.80] }
        ] }],
        erkl: 'ā(0,2 s) = (2,945 − 0,98) m/s / 0,2 s = ' + f(A.wert[0], 3) + ' m/s²; ā(0,4 s) = (4,905 − 2,945) m/s / 0,2 s = ' + f(A.wert[1], 3) +
          ' m/s²; ā(0,6 s) = (6,865 − 4,905) m/s / 0,2 s = ' + f(A.wert[2], 3) + ' m/s². Immer etwa g.' },

      { id: 'fall-u6', typ: 'wahl', quelle: 'Blatt 1, A3 d',
        frage: 'Welcher Funktionsterm s(t) passt zu den Messwerten des Sprungs?',
        optionen: ['s(t) = 4,905 m/s² · t²', 's(t) = 9,81 m/s² · t²', 's(t) = 4,905 m/s² · t', 's(t) = 9,81 m/s · t'], richtig: 0,
        optErkl: [
          'Richtig: s = g/2·t² mit g/2 = 4,905 m/s². Probe: 4,905 · 0,2² = 0,196, wie in der Tabelle.',
          FE.halbVergessen.erkl + ' Probe: 9,81 · 0,2² = 0,392, nicht 0,196.',
          FE.quadratVergessen.erkl + ' Probe: 4,905 · 0,2 = 0,981, nicht 0,196.',
          FE.gleichfoermig.erkl + ' Das sieht man daran, dass die Abschnitte immer größer werden.'
        ] },

      { id: 'fall-u7', typ: 'wahl', quelle: 'Blatt 1, A3 d',
        frage: 'Welche Funktionsterme a(t) und v(t) passen zu den berechneten Werten?',
        optionen: [
          'a(t) = 9,81 m/s²; v(t) = 9,81 m/s² · t',
          'a(t) = 9,81 m/s² · t; v(t) = 9,81 m/s² · t²',
          'a(t) = 9,81 m/s²; v(t) = 4,905 m/s² · t',
          'a(t) = 0; v(t) = 9,81 m/s'
        ], richtig: 0,
        optErkl: [
          'Richtig: a ist konstant g, v wächst gleichmäßig. Mit den Messwerten ist auch 9,8 m/s² richtig.',
          'a wächst nicht mit der Zeit: Die Tabelle zeigt drei fast gleiche Werte. Konstant ist a, gleichmäßig wachsend ist v.',
          'Die Hälfte gehört nur in s = g/2·t². Für die Geschwindigkeit gilt v = g·t.',
          'Das wäre eine gleichförmige Bewegung. Die v̄-Werte in der Tabelle steigen aber.'
        ] },

      { id: 'fall-u8', typ: 'rechnung', quelle: 'Blatt 1, A3 e', formel: 'fall-t',
        frage: 'Wann berühren die Fußsohlen der Springerin das Wasser? Das Brett ist 5 m hoch, sie startet aus der Ruhe.',
        gegeben: '<p>Fallhöhe s = 5 m, g = 9,81 m/s², Start aus der Ruhe</p>',
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: s = 5 m, g = 9,81 m/s²<br>Gesucht: t in s',
            'Gegeben: s = 5 m, g = 9,81 m/s²<br>Gesucht: v in m/s',
            'Gegeben: s = 5 m, v = 9,81 m/s<br>Gesucht: t in s'
          ], richtig: 0, optErkl: [
            'Richtig: Fallhöhe und Fallbeschleunigung sind gegeben, gefragt ist der Zeitpunkt.',
            '„Wann“ fragt nach der Zeit t, nicht nach der Geschwindigkeit.',
            '9,81 ist keine Geschwindigkeit, sondern die Fallbeschleunigung g in m/s².'
          ] },
          { art: 'formel', optionen: ['s = g/2·t²', 's = v·t', 'v = g·t'], richtig: 0, optErkl: [
            'Richtig: Freier Fall aus der Ruhe, also s = g/2·t².',
            FE.gleichfoermig.erkl,
            'Damit rechnest du die Geschwindigkeit aus. Gegeben ist aber die Fallhöhe.'
          ] },
          { art: 'umstellen', optionen: ['t = √(2s/g)', 't = 2s/g', 't = √(s/(2g))'], richtig: 0, optErkl: [
            'Richtig: s = g/2·t² | ·2 | :g | √ ergibt t = √(2s/g).',
            FE.wurzelVergessen.erkl,
            'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler: t = √(2s/g).'
          ] },
          { art: 'einsetzen', optionen: [
            't = √(2·5 m / 9,81 m/s²)',
            't = 2·5 m / 9,81 m/s²',
            't = √(5 m / 9,81 m/s²)',
            't = 5 m / 9,81 m/s²'
          ], richtig: 0, optErkl: [
            'Richtig: Unter der Wurzel bleiben s² übrig, die Wurzel daraus ergibt Sekunden.',
            FE.wurzelVergessen.erkl + ' Das ergäbe ' + f(10 / G) + ' s².',
            FE.zweiVergessen.erkl.replace('a = 2s/t²', 't = √(2s/g)') + ' Das ergäbe ' + f(Math.sqrt(5 / G)) + ' s.',
            'So rechnet man nur bei konstanter Geschwindigkeit, und g ist keine Geschwindigkeit. Das ergäbe ' + f(5 / G) + ' s², daher kommt wohl die „halbe Sekunde“.'
          ] }
        ],
        antwort: t5, auch: [1.01], einheit: 's',
        loesung: '<p>s = g/2·t² | ·2<br>2s = g·t² | :g<br>2s/g = t² | √<br>t = √(2s/g)</p>' +
          '<p>t = √(2·5 m / 9,81 m/s²) = √(10 m / 9,81 m/s²) ≈ √(' + f(10 / G, 3) + ' s²) ≈ ' + f(t5) + ' s</p>' +
          '<p>Die Fußsohlen berühren das Wasser nach rund ' + f(t5) + ' s.</p>' },

      { id: 'fall-u9', typ: 'wahl',
        frage: 'Welcher v(t)-Graph passt zum Sprung vom Brett bis zum Eintauchen?',
        optionen: [D.mini('v-beschl'), D.mini('v-gleich'), D.mini('v-brems'), D.mini('v-ruhe')], richtig: 0,
        optErkl: [
          'Richtig: Ursprungsgerade. v = g·t wächst gleichmäßig, die Steigung ist g.',
          'Eine Waagerechte bedeutet konstante Geschwindigkeit. Beim Fall wird die Springerin aber jede Sekunde um 9,81 m/s schneller.',
          'Eine fallende Gerade bedeutet Bremsen. Die Springerin wird schneller, nicht langsamer.',
          'v = 0 bedeutet Stillstand. Das gilt nur vor dem Absprung.'
        ] },

      { id: 'fall-u10', typ: 'rechnung', quelle: 'Tafel S. 8', formel: 'fall-t',
        frage: 'Ein Stein fällt 1000 m tief. Wie lange fällt der Stein? Den Luftwiderstand lässt du weg.',
        gegeben: '<p>Fallhöhe s = 1000 m, a = g = 9,81 m/s², Start aus der Ruhe</p>',
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: s = 1000 m, g = 9,81 m/s²<br>Gesucht: t in s',
            'Gegeben: s = 1000 m, g = 9,81 m/s²<br>Gesucht: v in m/s',
            'Gegeben: t = 1000 s, g = 9,81 m/s²<br>Gesucht: s in m'
          ], richtig: 0, optErkl: [
            'Richtig: Fallhöhe und g sind gegeben, gefragt ist die Fallzeit.',
            'Die Geschwindigkeit kommt danach. Zuerst ist gefragt, wie lange der Stein fällt.',
            '1000 ist die Fallhöhe in m, keine Zeit.'
          ] },
          { art: 'formel', optionen: ['s = g/2·t²', 's = v·t', 'v = g·t'], richtig: 0, optErkl: [
            'Richtig: Freier Fall aus der Ruhe.',
            FE.gleichfoermig.erkl,
            'Damit rechnest du die Geschwindigkeit aus. Gegeben ist die Fallhöhe.'
          ] },
          { art: 'umstellen', optionen: ['t = √(2s/g)', 't = 2s/g', 't = √(s/(2g))'], richtig: 0, optErkl: [
            'Richtig: | ·2 | :g | √ wie an der Tafel.',
            FE.wurzelVergessen.erkl,
            'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler.'
          ] },
          { art: 'einsetzen', optionen: [
            't = √(2·1000 m / 9,81 m/s²)',
            't = 2·1000 m / 9,81 m/s²',
            't = √(1000 m / 9,81 m/s²)',
            't = √(2·9,81 m/s² / 1000 m)'
          ], richtig: 0, optErkl: [
            'Richtig: m kürzt sich, unter der Wurzel bleibt s².',
            FE.wurzelVergessen.erkl + ' Das ergäbe ' + f(2000 / G, 1) + ' s².',
            'In t = √(2s/g) steht oben die 2. Du hast sie vergessen. Das ergäbe ' + f(Math.sqrt(1000 / G)) + ' s.',
            'Du hast den Bruch umgedreht: In t = √(2s/g) steht der Weg oben und g unten. Unter der Wurzel stünde 1/s², das ist keine Zeit.'
          ] }
        ],
        antwort: tStein, auch: [14.27, 14.28], einheit: 's',
        loesung: '<p>s = g/2·t² | ·2<br>2s = g·t² | :g<br>2s/g = t² | √<br>t = √(2s/g)</p>' +
          '<p>t = √(2·1000 m / 9,81 m/s²) = √(2000 s² / 9,81) ≈ √(' + f(2000 / G) + ' s²) ≈ ' + f(tStein) + ' s</p>' +
          '<p>An der Tafel steht 14,27 s (abgeschnitten statt gerundet). Beides zählt.</p>' },

      { id: 'fall-u11', typ: 'rechnung', quelle: 'Tafel S. 8', formel: 'fall-v',
        frage: 'Wie schnell ist der Stein beim Aufschlag nach 1000 m freiem Fall?',
        gegeben: '<p>Fallzeit t ≈ 14,28 s (aus der Aufgabe davor), g = 9,81 m/s²</p>',
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: t = 14,28 s, g = 9,81 m/s²<br>Gesucht: v in m/s',
            'Gegeben: t = 14,28 s, g = 9,81 m/s²<br>Gesucht: s in m',
            'Gegeben: t = 14,28 s, s = 1000 m<br>Gesucht: v̄ in m/s'
          ], richtig: 0, optErkl: [
            'Richtig: gesucht ist die Geschwindigkeit beim Aufschlag.',
            'Die Strecke kennst du schon: 1000 m. Gefragt ist die Geschwindigkeit.',
            'Gefragt ist die Geschwindigkeit beim Aufschlag, nicht die mittlere Geschwindigkeit über die ganze Strecke.'
          ] },
          { art: 'formel', optionen: ['v = g·t', 'v = s/t', 'v = g/2·t'], richtig: 0, optErkl: [
            'Richtig: Freier Fall aus der Ruhe, also v = g·t.',
            'Das ist die mittlere Geschwindigkeit. Der Stein wird immer schneller, am Ende ist er doppelt so schnell wie im Mittel.',
            'Die Hälfte gehört nur in s = g/2·t². Für die Geschwindigkeit gilt v = g·t.'
          ] },
          { art: 'einsetzen', optionen: ['v = 9,81 m/s² · 14,28 s', 'v = 1000 m / 14,28 s', 'v = 9,81 m/s² / 14,28 s'], richtig: 0, optErkl: [
            'Richtig: Fallbeschleunigung mal Zeit, ein s kürzt sich.',
            'Das ergibt die mittlere Geschwindigkeit ' + f(1000 / 14.28) + ' m/s, nicht die beim Aufschlag.',
            'Es gilt v = g·t, du hast geteilt. Das ergäbe ' + f(G / 14.28) + ' m/s³.'
          ] }
        ],
        antwort: vStein, auch: [140, 139.98, P.vBeschl(G, 14.28)], einheit: 'm/s',
        loesung: '<p>v = g·t</p><p>v = 9,81 m/s² · 14,28 s ≈ ' + f(P.vBeschl(G, 14.28)) + ' m/s ≈ 140 m/s</p>' +
          '<p>In km/h: 140 m/s · 3,6 = ' + f(P.kmh(140)) + ' km/h</p>' },

      { id: 'fall-u12', typ: 'wahl', quelle: 'Tafel S. 8',
        frage: 'Der Stein schlägt mit v ≈ 140 m/s auf. Wie viel ist das in km/h?',
        optionen: ['≈ ' + f(P.kmh(140)) + ' km/h', '≈ ' + f(P.ms(140), 1) + ' km/h', '≈ ' + f(P.kmh(1000 / 14.28), 0) + ' km/h', '140 km/h'], richtig: 0,
        optErkl: [
          'Richtig: von m/s nach km/h mal 3,6, also 140 · 3,6 = 504.',
          FE.durch36.erkl,
          'Das ist die mittlere Geschwindigkeit 1000 m / 14,28 s ≈ 70 m/s in km/h. Beim Aufschlag ist der Stein doppelt so schnell.',
          'Nur die Einheit umbenannt: m/s und km/h sind nicht gleich groß. 1 m/s = 3,6 km/h.'
        ] },

      { id: 'fall-u13', typ: 'rechnung', quelle: 'Tafel S. 9, A3', formel: 'a-beschl',
        frage: 'Auf dem Mond braucht ein Stein 3,3 s, um eine Strecke von 10 m zu fallen. Wie groß ist die Fallbeschleunigung auf dem Mond?',
        gegeben: '<p>Fallstrecke s = 10 m, Fallzeit t = 3,3 s, Start aus der Ruhe</p>',
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: s = 10 m, t = 3,3 s<br>Gesucht: g<sub>Mond</sub> in m/s²',
            'Gegeben: s = 10 m, t = 3,3 s, g = 9,81 m/s²<br>Gesucht: v in m/s',
            'Gegeben: s = 10 m, t = 3,3 s<br>Gesucht: v̄ in m/s'
          ], richtig: 0, optErkl: [
            'Richtig: Fallstrecke und Fallzeit sind gegeben, die Mondbeschleunigung ist gesucht.',
            '9,81 m/s² gilt auf der Erde. Auf dem Mond ist g gerade die gesuchte Größe.',
            'Gefragt ist zuerst die Beschleunigung, nicht eine mittlere Geschwindigkeit.'
          ] },
          { art: 'formel', optionen: ['s = g/2·t²', 's = v·t', 'v = g·t'], richtig: 0, optErkl: [
            'Richtig: Auch auf dem Mond ist der Fall eine beschleunigte Bewegung aus der Ruhe.',
            FE.gleichfoermig.erkl,
            'v ist nicht gegeben, damit kommst du nicht an g.'
          ] },
          { art: 'umstellen', optionen: ['g = 2s/t²', 'g = s/(2t²)', 'g = 2s/t'], richtig: 0, optErkl: [
            'Richtig: s = g/2·t² | ·2 | :t² ergibt g = 2s/t².',
            'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler.',
            'Die Zeit steht im Quadrat. Geteilt wird durch t², nicht durch t.'
          ] },
          { art: 'einsetzen', optionen: [
            'g = 2·10 m / (3,3 s)²',
            'g = 10 m / (3,3 s)²',
            'g = 2·10 m / 3,3 s',
            'g = (3,3 s)² / (2·10 m)'
          ], richtig: 0, optErkl: [
            'Richtig: m durch s² ergibt m/s².',
            FE.zweiVergessen.erkl.replace('a = 2s/t²', 'g = 2s/t²') + ' Das ergäbe ' + f(10 / (3.3 * 3.3)) + ' m/s².',
            FE.quadratVergessen.erkl.replace('In s = g/2·t²', 'In g = 2s/t²') + ' Das ergäbe ' + f(20 / 3.3) + ' m/s, und 2s/t ist genau die Endgeschwindigkeit des Steins, keine Beschleunigung.',
            FE.kehrwert.erkl
          ] }
        ],
        antwort: gMond, auch: [1.84], einheit: 'm/s²',
        loesung: '<p>s = g/2·t² | ·2<br>2s = g·t² | :t²<br>g = 2s/t²</p>' +
          '<p>g = 2·10 m / (3,3 s)² = 20 m / 10,89 s² ≈ ' + f(gMond) + ' m/s²</p>' +
          '<p>Plus: Der echte Wert auf dem Mond ist etwa 1,62 m/s². Die Zahlen der Aufgabe sind gerundet.</p>' },

      { id: 'fall-u14', typ: 'rechnung', quelle: 'Tafel S. 9, A3', formel: 'fall-v',
        frage: 'Wie schnell ist der Stein auf dem Mond, wenn er nach 10 m aufkommt?',
        gegeben: '<p>g<sub>Mond</sub> ≈ 1,84 m/s² (aus der Aufgabe davor), t = 3,3 s</p>',
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: g = 1,84 m/s², t = 3,3 s<br>Gesucht: v in m/s',
            'Gegeben: g = 9,81 m/s², t = 3,3 s<br>Gesucht: v in m/s',
            'Gegeben: g = 1,84 m/s², t = 3,3 s<br>Gesucht: s in m'
          ], richtig: 0, optErkl: [
            'Richtig: Mondbeschleunigung und Fallzeit sind bekannt.',
            'Auf dem Mond gilt nicht g = 9,81 m/s², sondern der berechnete Wert 1,84 m/s².',
            'Die Strecke kennst du schon: 10 m. Gefragt ist die Geschwindigkeit.'
          ] },
          { art: 'formel', optionen: ['v = g·t', 'v = s/t', 'v = g/2·t'], richtig: 0, optErkl: [
            'Richtig: v = g·t, mit g des Mondes.',
            'Das ist die mittlere Geschwindigkeit. Beim Aufkommen ist der Stein doppelt so schnell.',
            'Die Hälfte gehört nur in s = g/2·t².'
          ] },
          { art: 'einsetzen', optionen: ['v = 1,84 m/s² · 3,3 s', 'v = 9,81 m/s² · 3,3 s', 'v = 10 m / 3,3 s'], richtig: 0, optErkl: [
            'Richtig: Mondbeschleunigung mal Fallzeit.',
            'Das wäre die Erde. Das ergäbe ' + f(P.vBeschl(G, 3.3), 1) + ' m/s.',
            'Das ergibt die mittlere Geschwindigkeit ' + f(10 / 3.3) + ' m/s, nicht die beim Aufkommen.'
          ] }
        ],
        antwort: vMond, auch: [P.vBeschl(1.84, 3.3)], einheit: 'm/s',
        loesung: '<p>v = g·t</p><p>v = 1,84 m/s² · 3,3 s ≈ ' + f(P.vBeschl(1.84, 3.3)) + ' m/s</p>' +
          '<p>Mit dem ungerundeten g ≈ ' + f(gMond, 4) + ' m/s² ergibt sich ' + f(vMond) + ' m/s. Beides zählt.</p>' },

      { id: 'fall-u15', typ: 'rechnung', plus: true, quelle: 'Tafel S. 4–6', formel: 'g-fahrbahn',
        frage: 'Versuch aus dem Unterricht, Tisch 6: Ein Wagen rollt aus dem Stand eine um α = 9° geneigte Fahrbahn hinunter. Gemessen: Δt = 1,08 s und v<sub>Ende</sub> = 1,677 m/s. Welchen Wert für g liefert der Versuch?',
        gegeben: '<p>Δt = 1,08 s, v<sub>Ende</sub> = 1,677 m/s, α = 9° (sin 9° ≈ ' + f(sin9, 4) + ')</p>',
        schritte: [
          { art: 'formel', optionen: [
            'a = v<sub>Ende</sub>/Δt, dann g = a/sin α',
            'a = v<sub>Ende</sub>/Δt, dann g = a·sin α',
            'a = v<sub>Ende</sub>·Δt, dann g = a/sin α'
          ], richtig: 0, optErkl: [
            'Richtig: Auf der Fahrbahn gilt a = g·sin α, umgestellt g = a/sin α.',
            'Auf der Fahrbahn ist a kleiner als g: a = g·sin α. Beim Umstellen teilst du durch sin α.',
            'Beschleunigung ist Geschwindigkeitsänderung pro Zeit: geteilt durch Δt, nicht mal.'
          ] },
          { art: 'einsetzen', optionen: [
            'g = (1,677 m/s / 1,08 s) / sin 9°',
            'g = (1,677 m/s / 1,08 s) · sin 9°',
            'g = 1,677 m/s / 1,08 s'
          ], richtig: 0, optErkl: [
            'Richtig: erst a, dann durch sin α teilen.',
            'Mal sin α macht den Wert noch kleiner. Das ergäbe ' + f(aTisch * sin9) + ' m/s².',
            'Das ist erst a ≈ ' + f(aTisch) + ' m/s², die Beschleunigung auf der Fahrbahn. Teile noch durch sin α.'
          ] }
        ],
        antwort: gTisch, auch: [9.93, aTisch / 0.156], einheit: 'm/s²',
        loesung: '<p>a = v<sub>Ende</sub>/Δt = 1,677 m/s / 1,08 s ≈ ' + f(aTisch, 3) + ' m/s²</p>' +
          '<p>g = a/sin α ≈ ' + f(aTisch, 3) + ' m/s² / sin 9° ≈ ' + f(aTisch, 3) + ' m/s² / ' + f(sin9, 4) + ' ≈ ' + f(gTisch) + ' m/s²</p>' +
          '<p>Das liegt nahe an 9,81 m/s². Die Abweichung kommt von der Messung (Zeit, Winkel).</p>' },

      { id: 'fall-u16', typ: 'rechnung', plus: true, quelle: 'Tafel S. 15', formel: 'rakete',
        frage: 'Eine Rakete beschleunigt 30 s lang mit a = 5,5 m/s² nach oben, danach wirkt nur noch die Erdanziehung. Wann, vom Start an gerechnet, erreicht sie den höchsten Punkt?',
        gegeben: '<p>Bei Brennschluss: v = 5,5 m/s² · 30 s = ' + f(vRak) + ' m/s. Danach wird sie mit g = 9,81 m/s² langsamer.</p>',
        schritte: [
          { art: 'formel', optionen: [
            'Steigzeit nach Brennschluss: t₂ = v/g',
            'Steigzeit nach Brennschluss: t₂ = v/a mit a = 5,5 m/s²',
            'Steigzeit nach Brennschluss: t₂ = √(2s/g) mit s = 2475 m'
          ], richtig: 0, optErkl: [
            'Richtig: Ab Brennschluss bremst nur g. Am höchsten Punkt ist v = 0, also v = g·t₂.',
            'Nach Brennschluss treibt der Motor nicht mehr. Die Rakete wird mit g = 9,81 m/s² langsamer, nicht mit 5,5 m/s².',
            'Diese Formel gilt für einen Fall aus der Ruhe. Die Rakete fliegt bei Brennschluss aber mit 165 m/s nach oben.'
          ] },
          { art: 'einsetzen', optionen: [
            't = 30 s + 165 m/s / 9,81 m/s²',
            't = 165 m/s / 9,81 m/s²',
            't = 30 s + 165 m/s / 5,5 m/s²'
          ], richtig: 0, optErkl: [
            'Richtig: Brennzeit plus Steigzeit.',
            'Das ist nur die Steigzeit nach Brennschluss (≈ ' + f(t2Rak, 1) + ' s). Gefragt ist die Zeit ab dem Start, die 30 s kommen dazu.',
            'Nach Brennschluss bremst g = 9,81 m/s², nicht 5,5 m/s². Das ergäbe ' + f(30 + vRak / 5.5) + ' s.'
          ] }
        ],
        antwort: tRak, auch: [46.8], einheit: 's',
        loesung: '<p>v(30 s) = 5,5 m/s² · 30 s = ' + f(vRak) + ' m/s<br>s(30 s) = 5,5 m/s² / 2 · (30 s)² = ' + f(sRak) + ' m</p>' +
          '<p>t₂ = v/g = 165 m/s / 9,81 m/s² ≈ ' + f(t2Rak) + ' s<br>t = 30 s + ' + f(t2Rak) + ' s ≈ ' + f(tRak) + ' s</p>' +
          '<p>Höhe dann: 2475 m + 165 m/s · ' + f(t2Rak) + ' s − 9,81 m/s² / 2 · (' + f(t2Rak) + ' s)² ≈ ' + f(Math.round(hRak)) + ' m</p>' }
    ],

    trainer: ['fall-t', 'fall-v', 't-beschl'],

    gutachten: [
      { id: 'fall-g1', typ: 'wahl', quelle: 'Blatt 1, A3 c',
        frage: 'Passen die Messwerte der Videoanalyse zu einem freien Fall?',
        optionen: [
          'Ja: Die mittleren Beschleunigungen sind alle etwa 9,8 m/s², also konstant und gleich g.',
          'Nein: Die mittleren Geschwindigkeiten werden immer größer, also ist die Bewegung nicht gleichmäßig.',
          'Ja: Die Fallstrecke wächst in jedem Zeitabschnitt um gleich viel.',
          'Nein: Bei einem freien Fall müsste ā mit der Zeit zunehmen.'
        ], richtig: 0,
        optErkl: [
          'Richtig: ā ≈ 9,825; 9,8; 9,8 m/s². Konstante Beschleunigung g heißt freier Fall.',
          '„Gleichmäßig beschleunigt“ heißt: a ist konstant. Dass v wächst, gehört gerade dazu.',
          'Die Abschnitte wachsen: ' + [S[1] - S[0], S[2] - S[1], S[3] - S[2], S[4] - S[3]].map(function (x) { return f(x, 3); }).join(' m, ') +
            ' m. Gleich große Abschnitte gäbe es nur bei konstanter Geschwindigkeit.',
          'Beim freien Fall ist a = g konstant. Was mit der Zeit zunimmt, ist v.'
        ] },

      { id: 'fall-g2', typ: 'rechnung', formel: 'fall-v',
        frage: 'Mit welcher Geschwindigkeit trifft die Springerin auf das Wasser? Die Fallzeit kennst du aus der Übung zum Sprung (t ≈ 1,01 s).',
        gegeben: '<p>t ≈ 1,01 s, g = 9,81 m/s², Start aus der Ruhe</p>',
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: t = 1,01 s, g = 9,81 m/s²<br>Gesucht: v in m/s',
            'Gegeben: t = 1,01 s, g = 9,81 m/s²<br>Gesucht: s in m',
            'Gegeben: t = 1,01 m, g = 9,81 m/s²<br>Gesucht: v in m/s'
          ], richtig: 0, optErkl: [
            'Richtig: Fallzeit und g sind bekannt, gesucht ist die Geschwindigkeit.',
            'Die Strecke kennst du: 5 m. Gefragt ist die Geschwindigkeit.',
            'Schau auf die Einheit: t = 1,01 s, nicht 1,01 m.'
          ] },
          { art: 'formel', optionen: ['v = g·t', 'v = s/t', 'v = g/2·t'], richtig: 0, optErkl: [
            'Richtig: Freier Fall aus der Ruhe, also v = g·t.',
            'Das ist die mittlere Geschwindigkeit 5 m / 1,01 s ≈ ' + f(5 / 1.01) + ' m/s. Beim Aufprall ist sie doppelt so groß.',
            'Die Hälfte gehört nur in s = g/2·t².'
          ] },
          { art: 'einsetzen', optionen: ['v = 9,81 m/s² · 1,01 s', 'v = 9,81 m/s² / 1,01 s', 'v = 5 m / 1,01 s'], richtig: 0, optErkl: [
            'Richtig: Fallbeschleunigung mal Zeit.',
            'Es gilt v = g·t, du hast geteilt. Das ergäbe ' + f(G / 1.01) + ' m/s³.',
            'Das ergibt die mittlere Geschwindigkeit, nicht die beim Aufprall.'
          ] }
        ],
        antwort: v5, auch: [v5r, 9.9], einheit: 'm/s',
        loesung: '<p>v = g·t</p><p>v = 9,81 m/s² · 1,01 s ≈ ' + f(v5r) + ' m/s ≈ 9,9 m/s</p>' +
          '<p>In km/h: 9,9 m/s · 3,6 ≈ ' + f(P.kmh(9.9), 1) + ' km/h, rund 36 km/h</p>',
        satz: {
          optionen: [
            'Die Springerin trifft mit rund 9,9 m/s auf das Wasser, das sind etwa 36 km/h.',
            'Die Springerin trifft mit rund 9,9 m/s auf das Wasser, das sind etwa 2,8 km/h.',
            'Die Springerin trifft mit rund 4,95 m/s auf das Wasser, das sind etwa 18 km/h.'
          ], richtig: 0,
          optErkl: [
            'Richtig: 9,9 · 3,6 ≈ 36.',
            FE.durch36.erkl,
            'Das ist die mittlere Geschwindigkeit. Beim Aufprall ist sie doppelt so groß.'
          ] } },

      { id: 'fall-g3', typ: 'wahl',
        frage: 'Der Badegast sagt: „Vom Fünfer ist man in einer halben Sekunde unten.“ Wie tief ist die Springerin nach 0,5 s wirklich?',
        optionen: ['s ≈ ' + f(s05) + ' m', 's ≈ ' + f(G * 0.25) + ' m', 's ≈ ' + f(G * 0.5) + ' m', 's = 2,5 m'], richtig: 0,
        optErkl: [
          'Richtig: s = 4,905 m/s² · (0,5 s)² ≈ ' + f(s05) + ' m. Bis zum Wasser fehlen noch fast 4 m.',
          'Hier fehlt die Hälfte (s = g·t²) oder das Quadrat (s = g/2·t), beides ergibt zufällig ' + f(G * 0.25) + ' m. Richtig ist s = g/2·t².',
          'Das ist g·t = 9,81 m/s² · 0,5 s, eine Geschwindigkeit in m/s, keine Strecke.',
          'Halbe Zeit, halber Weg gilt nur bei konstanter Geschwindigkeit. Beim Fall ist die Springerin am Anfang langsam und schafft in der ersten Hälfte der Zeit nur etwa ein Viertel der Höhe.'
        ] },

      { id: 'fall-g4', typ: 'rechnung', formel: 'fall-t',
        frage: 'Neben dem Brett steht ein 10-m-Turm. Wie lange dauert der Fall von dort bis zum Wasser?',
        gegeben: '<p>Fallhöhe s = 10 m, g = 9,81 m/s², Start aus der Ruhe</p>',
        schritte: [
          { art: 'formel', optionen: ['s = g/2·t²', 's = v·t', 'v = g·t'], richtig: 0, optErkl: [
            'Richtig: Freier Fall aus der Ruhe.',
            FE.gleichfoermig.erkl,
            'Damit rechnest du die Geschwindigkeit aus. Gegeben ist die Fallhöhe.'
          ] },
          { art: 'umstellen', optionen: ['t = √(2s/g)', 't = 2s/g', 't = √(s/(2g))'], richtig: 0, optErkl: [
            'Richtig: | ·2 | :g | √.',
            FE.wurzelVergessen.erkl,
            'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler.'
          ] },
          { art: 'einsetzen', optionen: ['t = √(2·10 m / 9,81 m/s²)', 't = 2·10 m / 9,81 m/s²', 't = 2 · √(2·5 m / 9,81 m/s²)'], richtig: 0, optErkl: [
            'Richtig: m kürzt sich, unter der Wurzel bleibt s².',
            FE.wurzelVergessen.erkl + ' Das ergäbe ' + f(20 / G) + ' s².',
            'Doppelte Höhe heißt nicht doppelte Zeit, denn t steht im Quadrat. Das ergäbe ' + f(2 * t5) + ' s.'
          ] }
        ],
        antwort: t10, auch: [1.43], einheit: 's',
        loesung: '<p>t = √(2s/g) = √(2·10 m / 9,81 m/s²) ≈ √(' + f(20 / G, 3) + ' s²) ≈ ' + f(t10) + ' s</p>' +
          '<p>Vom 5-m-Brett waren es ' + f(t5) + ' s. Doppelte Höhe ergibt nur das √2-fache, etwa das 1,4-fache der Zeit.</p>',
        satz: {
          optionen: [
            'Vom 10-m-Turm dauert der Fall rund 1,43 s, also nicht doppelt so lange wie vom 5-m-Brett.',
            'Vom 10-m-Turm dauert der Fall rund 2,02 s, also doppelt so lange wie vom 5-m-Brett.',
            'Vom 10-m-Turm dauert der Fall rund 2,04 s, weil die Höhe doppelt so groß ist.'
          ], richtig: 0,
          optErkl: [
            'Richtig: √(2·10/9,81) ≈ 1,43.',
            'Doppelte Höhe heißt nicht doppelte Zeit, denn t steht im Quadrat.',
            'Das ist 2s/g ohne Wurzel, und die Einheit wäre s².'
          ] } }
    ],

    ergebnis: '<p><strong>Ergebnis:</strong> Die Videoanalyse zeigt eine konstante Beschleunigung von ā ≈ 9,8 m/s², der Sprung ist ein freier Fall. ' +
      'Vom 5-m-Brett dauert er rund ' + f(t5) + ' s, die Springerin trifft mit etwa 9,9 m/s ≈ 36 km/h auf das Wasser. ' +
      'Die Behauptung „in einer halben Sekunde unten“ ist widerlegt: Nach 0,5 s ist sie erst gut ' + f(s05, 1) + ' m tief.</p>'
  });
})();
