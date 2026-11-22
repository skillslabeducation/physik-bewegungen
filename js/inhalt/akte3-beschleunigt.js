/* Akte 3: Gleichmäßig beschleunigte Bewegung aus dem Stand.
   Fall: anfahrender Personenzug in Harburg und ein Beschleunigungstest für eine Versicherung.
   Quellen: Blatt 1 A2 a–c, Tafel S. 3, 7, 9 (A4), 10 (1), 14 (A2 a–c). Zahlen aus ENTWURF „Fachliche Festlegungen“. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik, D = W.diagramm;
  W.akten = W.akten || [];
  var F = P.FEHLER;
  var f = function (x, n) { return P.fmt(x, n); };

  /* Zahlen der Akte, alle aus W.physik */
  var tZug = P.tAusS(1000, 0.5);                // Blatt 1 A2 c: ≈ 63,25 s
  var tZugGenau = 60 + (1000 - P.sBeschl(0.5, 60)) / P.vBeschl(0.5, 60); // Feinheit: ≈ 63,33 s
  var aA4 = P.aAusS(1000, 18);                  // Tafel S. 9 A4: ≈ 6,17 m/s²
  var vA4 = P.vBeschl(aA4, 18);                 // ≈ 111,11 m/s = 400 km/h
  var a10 = P.aAusV(P.ms(135), 60);             // Tafel S. 10: 0,625 m/s²
  var t10 = P.ms(300) / a10;                    // ≈ 133,33 s
  var s10 = P.sBeschl(a10, t10);                // ≈ 5555,56 m
  var t14b = P.tAusS(200, 8);                   // Tafel S. 14 b: √50 s ≈ 7,07 s
  var t14c = P.tAusS(600, 8);                   // √150 s ≈ 12,25 s
  var aAuto = P.aAusS(100, 5);                  // Fall: 8 m/s²
  var tAuto = P.ms(100) / aAuto;                // ≈ 3,47 s

  W.akten.push({
    id: 'beschleunigt', nr: 3, titel: 'Gleichmäßig beschleunigte Bewegung',
    fall: 'Anfahrender Personenzug und ein Beschleunigungstest',

    auftrag: {
      text: '<p>Zwei Messungen landen am selben Tag im Büro. Im Bahnhof Hamburg-Harburg fährt ein Personenzug aus dem Stand an, gleichmäßig beschleunigt mit a = 0,5 m/s². ' +
        'Der Verkehrsbetrieb schreibt in einen Fahrplanentwurf: „Nach einer Minute hat der Zug den ersten Kilometer hinter sich.“</p>' +
        '<p>Außerdem lässt eine Versicherung auf einer gesperrten Messstrecke in Hamburg-Waltershof einen Sportwagen testen. ' +
        'Er startet aus dem Stand, eine Lichtschranke steht 100 m hinter der Startlinie. Im Datenblatt des Herstellers steht: „0 auf 100 km/h in 3,5 s“.</p>',
      daten: '<table><tr><th></th><th>Personenzug</th><th>Sportwagen</th></tr>' +
        '<tr><th>Start</th><td>aus dem Stand</td><td>aus dem Stand</td></tr>' +
        '<tr><th>Messung</th><td>a = 0,5 m/s² (konstant)</td><td>Lichtschranke bei s = 100 m nach t = 5,0 s</td></tr>' +
        '<tr><th>Behauptung</th><td>„1 km nach einer Minute“</td><td>„0 auf 100 km/h in 3,5 s“</td></tr></table>',
      chefin: 'Akte 3. Zwei Fahrzeuge, zwei Behauptungen, beide aus dem Stand. Rechne nach, bevor wir unterschreiben.',
      leitfrage: 'Hat der Personenzug nach einer Minute wirklich 1 km geschafft, und hält der Sportwagen die Angabe im Datenblatt?'
    },

    karten: [
      { titel: 'Beschleunigung: a = Δv/Δt',
        text: '<p>Die Beschleunigung sagt, um wie viel die Geschwindigkeit in jeder Sekunde zunimmt: a = Δv/Δt. Bei der gleichmäßig beschleunigten Bewegung ist a konstant.</p>' +
          '<p>Beispiel von der Tafel: a = 2 m/s². Nach 1 s ist das Fahrzeug 2 m/s schneller, nach 2 s 4 m/s, nach 3 s 6 m/s. ' +
          'Mit Seitentausch umgestellt: a = Δv/Δt | ·Δt ergibt Δv = a·Δt.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 4, schritt: 1 }, y: { g: 'v', e: 'm/s', max: 8, schritt: 2 } },
          kurven: [{ punkte: D.kurve(function (t) { return 2 * t; }, 0, 4, 4), farbe: 'v', label: 'v(t)' }], marken: [[1, 2], [2, 4], [3, 6]] },
        merk: 'a = Δv/Δt = konst. Einheit m/s²: pro Sekunde kommen a Meter pro Sekunde dazu.' },
      { titel: 'Aus dem Stand: v = a·t',
        text: '<p>Startet das Fahrzeug aus dem Stand, also v(t = 0) = 0, dann ist Δv die Geschwindigkeit selbst: v = a·t. ' +
          'Der v(t)-Graph ist eine Ursprungsgerade, ihre Steigung ist a. Der a(t)-Graph ist eine waagerechte Linie.</p>' +
          '<p>Personenzug von Blatt 1: a = 0,5 m/s². Nach 60 s gilt v = 0,5 m/s² · 60 s = 30 m/s = 108 km/h.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 'v', e: 'm/s', max: 30, schritt: 5 } },
          kurven: [{ punkte: D.kurve(function (t) { return 0.5 * t; }, 0, 60, 6), farbe: 'v', label: 'v(t)' }] },
        merk: 'v = a·t (aus dem Stand). Umgestellt: a = v/t und t = v/a.',
        achtung: '<p>Zeit in Sekunden einsetzen: eine Minute sind 60 s. Und km/h erst durch 3,6 teilen, dann rechnen.</p>' },
      { titel: 'Weg aus dem Stand: s = a/2·t²', demo: 'labor:anfahren',
        text: '<p>Weil das Fahrzeug ständig schneller wird, legt es in jeder Sekunde mehr Weg zurück als in der Sekunde davor. Aus dem Stand gilt s = a/2·t². ' +
          'Der s(t)-Graph ist eine nach oben offene Halbparabel.</p>' +
          '<p>Tafel: a = 2 m/s², Δt = 5 s: s = 2 m/s² / 2 · (5 s)² = 1 m/s² · 25 s² = 25 m. Nach 1 s, 2 s und 3 s sind es 1 m, 4 m und 9 m.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 5, schritt: 1 }, y: { g: 's', e: 'm', max: 25, schritt: 5 } },
          kurven: [{ punkte: D.kurve(function (t) { return t * t; }, 0, 5), farbe: 's', label: 's(t)' }], marken: [[1, 1], [2, 4], [3, 9], [5, 25]] },
        merk: 's = a/2·t² (aus dem Stand). Die Zeit steht im Quadrat: doppelte Zeit, vierfacher Weg.',
        achtung: '<p>s = v·t gilt hier nicht. Wer die Endgeschwindigkeit nimmt, bekommt den doppelten Weg: 10 m/s · 5 s = 50 m statt 25 m. ' +
          'Umgekehrt ist die Endgeschwindigkeit doppelt so groß wie s/t.</p><p>Die Hälfte in a/2 nicht vergessen.</p>' },
      { titel: 'Umstellen: Zeit und Beschleunigung aus dem Weg',
        text: '<p>Seitentausch wie an der Tafel:</p>' +
          '<p>s = a/2·t² | ·2<br>2s = a·t² | :a<br>2s/a = t² | √<br>t = √(2s/a)</p>' +
          '<p>2s = a·t² | :t²<br>a = 2s/t²</p>' +
          '<p>Tafel S. 14: 400 m in 10 s ergibt a = 2·400 m / (10 s)² = 800 m / 100 s² = 8 m/s². Die ersten 200 m schafft das Fahrzeug nach t = √(2·200 m / 8 m/s²) = √(50 s²) ≈ ' + f(t14b) + ' s.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 10, schritt: 2 }, y: { g: 's', e: 'm', max: 400, schritt: 100 } },
          kurven: [{ punkte: D.kurve(function (t) { return 4 * t * t; }, 0, 10), farbe: 's', label: 's(t)' }], marken: [[t14b, 200], [10, 400]] },
        merk: 't = √(2s/a) und a = 2s/t².',
        achtung: '<p>Am Ende die Wurzel ziehen: 2s/a ergibt s², erst die Wurzel liefert Sekunden.</p>' +
          '<p>Halber Weg heißt nicht halbe Zeit: 200 m schafft das Fahrzeug nach ' + f(t14b) + ' s, nicht nach 5 s, weil es am Anfang noch langsam ist.</p>' },
      { titel: 'Mit Anfangsgeschwindigkeit', plus: true,
        text: '<p>Fährt das Fahrzeug schon mit v₀, wenn die Uhr startet, und steht es bei s₀, dann gilt allgemein v = v₀ + a·t und s = s₀ + v₀·t + ½·a·t².</p>' +
          '<p>Aus dem Stand sind v₀ = 0 und s₀ = 0. Dann bleiben v = a·t und s = a/2·t² übrig, die Formeln dieser Akte.</p>' }
    ],

    ueben: [
      { id: 'beschleunigt-u1', typ: 'rechnung', quelle: 'Blatt 1, A2 a',
        frage: 'Blatt 1, A2 a: Der Personenzug fährt aus dem Stand an und beschleunigt gleichmäßig mit a = 0,5 m/s². Welche Geschwindigkeit v hat er nach einer Minute?',
        gegeben: '<p>a = 0,5 m/s², t = 1 min</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: a = 0,5 m/s², t = 60 s<br>Gesucht: v in m/s', 'Gegeben: a = 0,5 m/s², t = 1 s<br>Gesucht: v in m/s', 'Gegeben: a = 0,5 m/s², t = 60 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Eine Minute sind 60 s, gesucht ist die Geschwindigkeit.', 'Eine Minute ist nicht 1 s. Rechne die Zeit in Sekunden um: 1 min = 60 s.', 'Gefragt ist die Geschwindigkeit v, nicht der Weg s.'] },
          { art: 'formel', optionen: ['v = a·t', 's = a/2·t²', 'v = s/t'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt v = a·t.', 'Das ist die Formel für den Weg. Gesucht ist die Geschwindigkeit.', 'v = s/t gilt bei konstanter Geschwindigkeit, und einen Weg kennst du hier nicht.'] },
          { art: 'einsetzen', optionen: ['v = 0,5 m/s² · 60 s', 'v = 0,5 m/s² / 60 s', 'v = 0,5 m/s² / 2 · 60 s', 'v = 0,5 m/s² · 1 min'], richtig: 0,
            optErkl: ['Richtig: s² gekürzt mit s ergibt m/s.',
              'Aus a = v/t wird mit | ·t die Formel v = a·t. Du hast geteilt statt multipliziert. Das ergäbe ≈ ' + f(0.5 / 60, 4) + ' und keine Geschwindigkeit.',
              'Die Hälfte gehört nur in die Weg-Formel s = a/2·t². Für die Geschwindigkeit gilt v = a·t. Das ergäbe ' + f(0.5 / 2 * 60) + ' m/s.',
              'Minuten und m/s² passen nicht zusammen. Erst umrechnen: 1 min = 60 s.'] }
        ],
        antwort: P.vBeschl(0.5, 60), einheit: 'm/s', formel: 'v-at',
        loesung: '<p>v = a·t</p><p>v = 0,5 m/s² · 60 s = 30 m/s</p><p>In km/h: 30 m/s · 3,6 = ' + f(P.kmh(30)) + ' km/h</p>' },

      { id: 'beschleunigt-u2', typ: 'wahl', quelle: 'Blatt 1, A2 b',
        frage: 'Blatt 1, A2 b: Welcher Funktionsterm beschreibt die Geschwindigkeit des Personenzugs (aus dem Stand, a = 0,5 m/s²)?',
        optionen: ['v(t) = 0,5 m/s² · t', 'v(t) = 0,25 m/s² · t²', 'v(t) = 30 m/s', 'v(t) = 0,5 m/s · t'],
        richtig: 0,
        optErkl: ['Richtig: v = a·t mit a = 0,5 m/s². Der Graph ist eine Ursprungsgerade.',
          'Das ist der Term für den Weg: s(t) = a/2·t² = 0,25 m/s² · t². Gefragt ist v(t).',
          '30 m/s ist nur der Wert nach 60 s. Der Zug wird aber ständig schneller, v hängt von t ab.',
          'Die Einheit stimmt nicht: m/s · s ergibt m, also einen Weg. a hat die Einheit m/s².'] },

      { id: 'beschleunigt-u3', typ: 'punkte', quelle: 'Blatt 1, A2 b',
        frage: 'Blatt 1, A2 b: Zeichne den Graphen von v(t) = 0,5 m/s² · t für 0 ≤ t ≤ 60 s. Setze die Punkte für t = 10 s, 20 s, …, 60 s.',
        achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 'v', e: 'm/s', max: 35, schritt: 5 } },
        xs: [10, 20, 30, 40, 50, 60],
        soll: [10, 20, 30, 40, 50, 60].map(function (t) { return P.vBeschl(0.5, t); }),
        kurve: D.kurve(function (t) { return P.vBeschl(0.5, t); }, 0, 60, 6),
        erkl: 'Der Graph ist eine Ursprungsgerade mit der Steigung a = 0,5 m/s²: In 10 s kommen jeweils 5 m/s dazu, nach 60 s sind es 30 m/s.' },

      { id: 'beschleunigt-u4', typ: 'rechnung', quelle: 'Blatt 1, A2 c',
        frage: 'Blatt 1, A2 c: Der Personenzug fährt aus dem Stand an und beschleunigt gleichmäßig mit a = 0,5 m/s². Nach welcher Zeit t ist er 1000 m weit gefahren?',
        gegeben: '<p>s = 1000 m, a = 0,5 m/s²</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = 1000 m, a = 0,5 m/s²<br>Gesucht: t in s', 'Gegeben: s = 1000 m, a = 0,5 m/s²<br>Gesucht: v in m/s', 'Gegeben: s = 1000 m, a = 0,5 m/s<br>Gesucht: t in s'],
            richtig: 0,
            optErkl: ['Richtig: Weg und Beschleunigung sind gegeben, gesucht ist die Zeit.', 'Gefragt ist die Zeit t, nicht die Geschwindigkeit v.', 'Schau auf die Einheit: a = 0,5 m/s², nicht 0,5 m/s.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt s = a/2·t².', F.gleichfoermig.erkl, 'Eine Geschwindigkeit ist nicht gegeben. Du kennst den Weg s und die Beschleunigung a.'] },
          { art: 'umstellen', optionen: ['t = √(2s/a)', 't = 2s/a', 't = √(s/(2a))', 't = √(2a/s)'], richtig: 0,
            optErkl: ['Richtig: s = a/2·t² | ·2 | :a | √ ergibt t = √(2s/a).', F.wurzelVergessen.erkl, 'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler: t = √(2s/a).', 'Du hast den Bruch umgedreht. In t = √(2s/a) steht der Weg oben, a unten.'] },
          { art: 'einsetzen', optionen: ['t = √(2·1000 m / 0,5 m/s²)', 't = 2·1000 m / 0,5 m/s²', 't = √(1000 m / 0,5 m/s²)', 't = 1000 m / 0,5 m/s²'], richtig: 0,
            optErkl: ['Richtig: Unter der Wurzel bleiben s² übrig, die Wurzel daraus ergibt Sekunden.',
              F.wurzelVergessen.erkl + ' Das ergäbe ' + f(2 * 1000 / 0.5) + ' s².',
              'In t = √(2s/a) steht oben die 2. Du hast sie vergessen. Das ergäbe ' + f(Math.sqrt(1000 / 0.5)) + ' s.',
              'So rechnet man nur bei konstanter Geschwindigkeit (t = s/v), und a ist keine Geschwindigkeit. Das ergäbe ' + f(1000 / 0.5) + ' s².'] }
        ],
        antwort: tZug, auch: [63.25, tZugGenau], einheit: 's', formel: 't-beschl',
        loesung: '<p>s = a/2·t² | ·2 | :a | √<br>t = √(2s/a)</p>' +
          '<p>t = √(2·1000 m / 0,5 m/s²) = √(4000 s²) ≈ ' + f(tZug) + ' s</p>' +
          '<p><strong>Plus:</strong> Auf dem Blatt steht, dass der Zug nur eine Minute lang beschleunigt; nach 60 s hat er aber erst ' + f(P.sBeschl(0.5, 60)) + ' m geschafft und fährt dann mit 30 m/s gleichmäßig weiter. ' +
          'Genau genommen braucht er also 60 s + 100 m / (30 m/s) ≈ ' + f(tZugGenau, 1) + ' s; im Unterricht wurde ohne Zeitgrenze gerechnet, beide Werte gelten.</p>' },

      { id: 'beschleunigt-u5', typ: 'wahl', quelle: 'Tafel S. 3',
        frage: 'Tafel S. 3: Ein Fahrzeug fährt aus dem Stand mit a = 2 m/s² an. Was bedeutet das?',
        optionen: ['In jeder Sekunde wird es um 2 m/s schneller.', 'Es fährt mit 2 m/s, legt also in jeder Sekunde 2 m zurück.', 'Nach 1 s ist es schon 2 m weit gefahren.', 'Es braucht 2 s, um 1 m/s schneller zu werden.'],
        richtig: 0,
        optErkl: ['Richtig: a = Δv/Δt. Pro Sekunde kommen 2 m/s dazu, nach 3 s sind es 6 m/s.',
          'Das wäre eine Geschwindigkeit (m/s). Die Beschleunigung (m/s²) sagt, wie schnell sich die Geschwindigkeit ändert.',
          'Nach 1 s ist es 2 m/s schnell. Gefahren ist es erst s = 2 m/s² / 2 · (1 s)² = 1 m. Geschwindigkeit und Weg sind verschiedene Größen.',
          'Du hast den Bruch umgedreht. In 1 s wird es 2 m/s schneller, nicht in 2 s um 1 m/s.'] },

      { id: 'beschleunigt-u6', typ: 'tabelle', quelle: 'Tafel S. 3',
        frage: 'Tafel S. 3: Ein Fahrzeug fährt aus dem Stand mit a = 2 m/s² an. Um wie viel ist es nach 1 s, 2 s und 3 s schneller geworden? Rechne mit Δv = a·Δt.',
        spalten: ['Δt in s', '1', '2', '3'],
        zeilen: [{ kopf: 'Δv in m/s', zellen: [1, 2, 3].map(function (t) { return { zahl: P.vBeschl(2, t) }; }) }],
        erkl: 'Δv = a·Δt = 2 m/s² · 1 s = 2 m/s, dann 2 m/s² · 2 s = 4 m/s und 2 m/s² · 3 s = 6 m/s. Aus dem Stand ist Δv gleich der Geschwindigkeit v.' },

      { id: 'beschleunigt-u7', typ: 'rechnung', quelle: 'Tafel S. 7',
        frage: 'Tafel S. 7: Ein Fahrzeug fährt aus dem Stand mit a = 2 m/s² an. Welchen Weg hat es nach 5 s zurückgelegt?',
        gegeben: '<p>a = 2 m/s², Δt = 5 s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: a = 2 m/s², t = 5 s<br>Gesucht: s in m', 'Gegeben: a = 2 m/s², t = 5 s<br>Gesucht: v in m/s', 'Gegeben: a = 2 m/s, t = 5 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Gesucht ist der Weg s in m.', 'Gefragt ist der Weg s, nicht die Geschwindigkeit v.', 'Schau auf die Einheit: a = 2 m/s², nicht 2 m/s.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t', 's = a·t²'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt s = a/2·t².', F.gleichfoermig.erkl, F.halbVergessen.erkl] },
          { art: 'einsetzen', optionen: ['s = 2 m/s² / 2 · (5 s)²', 's = 2 m/s² · (5 s)²', 's = 2 m/s² / 2 · 5 s', 's = 10 m/s · 5 s'], richtig: 0,
            optErkl: ['Richtig: s² kürzt sich weg, übrig bleibt m.',
              F.halbVergessen.erkl + ' Das ergäbe ' + f(2 * 25) + ' m.',
              F.quadratVergessen.erkl + ' Dann bleibt als Einheit m/s übrig, kein Weg.',
              'Mit der Endgeschwindigkeit 10 m/s zu rechnen, als wäre sie die ganze Zeit gefahren worden, ergibt den doppelten Weg (' + f(10 * 5) + ' m). Das Fahrzeug war am Anfang langsamer.'] }
        ],
        antwort: P.sBeschl(2, 5), einheit: 'm', formel: 's-beschl',
        loesung: '<p>s = a/2·(Δt)²</p><p>s = 2 m/s² / 2 · (5 s)² = 1 m/s² · 25 s² = 25 m</p>' },

      { id: 'beschleunigt-u8', typ: 'wahl', quelle: 'Tafel S. 7',
        frage: 'Tafel S. 7: Wie schnell ist dasselbe Fahrzeug (aus dem Stand, a = 2 m/s²) nach 5 s, in km/h?',
        optionen: [f(P.kmh(P.vBeschl(2, 5))) + ' km/h', f(P.vBeschl(2, 5) / 3.6) + ' km/h', f(P.vBeschl(2, 5)) + ' km/h', f(P.kmh(2 / 2 * 5)) + ' km/h'],
        richtig: 0,
        optErkl: ['Richtig: v = a·t = 2 m/s² · 5 s = 10 m/s, mal 3,6 ergibt 36 km/h.',
          F.durch36.erkl,
          '10 ist der Wert in m/s. Für km/h musst du noch mal 3,6 rechnen.',
          'Die Hälfte gehört nur in die Weg-Formel. Für die Geschwindigkeit gilt v = a·t = 10 m/s, nicht 5 m/s.'] },

      { id: 'beschleunigt-u9', typ: 'rechnung', quelle: 'Tafel S. 9, A4',
        frage: 'Tafel S. 9, A4: Ein Fahrzeug beschleunigt gleichmäßig aus dem Stand und schafft 1000 m in 18 s. Wie groß ist seine Beschleunigung a?',
        gegeben: '<p>s = 1000 m, t = 18 s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = 1000 m, t = 18 s<br>Gesucht: a in m/s²', 'Gegeben: s = 1000 m, t = 18 s<br>Gesucht: v in m/s', 'Gegeben: s = 1000 m, t = 18 m<br>Gesucht: a in m/s²'],
            richtig: 0,
            optErkl: ['Richtig: Weg und Zeit sind gegeben, gesucht ist die Beschleunigung.', 'Zuerst ist die Beschleunigung gefragt, die Endgeschwindigkeit kommt danach.', 'Die Zeit hat die Einheit s, nicht m.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 'a = Δv/Δt', 'v = s/t'], richtig: 0,
            optErkl: ['Richtig: s = a/2·t² verbindet Weg, Zeit und Beschleunigung.', 'Die Endgeschwindigkeit kennst du noch nicht. Gegeben sind Weg und Zeit.', 'v = s/t gilt bei konstanter Geschwindigkeit. Hier wird beschleunigt.'] },
          { art: 'umstellen', optionen: ['a = 2s/t²', 'a = s/t²', 'a = 2s/t', 'a = t²/(2s)'], richtig: 0,
            optErkl: ['Richtig: s = a/2·t² | ·2 | :t² ergibt a = 2s/t².', F.zweiVergessen.erkl, F.quadratVergessen.erkl, F.kehrwert.erkl] },
          { art: 'einsetzen', optionen: ['a = 2·1000 m / (18 s)²', 'a = 1000 m / (18 s)²', 'a = 2·1000 m / 18 s'], richtig: 0,
            optErkl: ['Richtig: m durch s² ergibt m/s².',
              F.zweiVergessen.erkl + ' Das ergäbe ' + f(1000 / 324) + ' m/s².',
              F.quadratVergessen.erkl + ' Das ergäbe ' + f(2000 / 18) + ' m/s. Das ist zufällig die Endgeschwindigkeit v_Ende (siehe nächste Aufgabe), gefragt ist aber a.'] }
        ],
        antwort: aA4, auch: [6.17], einheit: 'm/s²', formel: 'a-beschl',
        loesung: '<p>s = a/2·t² | ·2 | :t²<br>a = 2s/t²</p><p>a = 2·1000 m / (18 s)² = 2000 m / 324 s² ≈ ' + f(aA4) + ' m/s²</p>' },

      { id: 'beschleunigt-u10', typ: 'wahl', quelle: 'Tafel S. 9, A4',
        frage: 'Tafel S. 9, A4: Welche Endgeschwindigkeit v(1000 m) hat das Fahrzeug, das 1000 m in 18 s aus dem Stand schafft (a ≈ ' + f(aA4) + ' m/s²)?',
        optionen: ['≈ ' + f(vA4) + ' m/s, also ' + f(P.kmh(vA4)) + ' km/h', '≈ ' + f(1000 / 18) + ' m/s, also ' + f(P.kmh(1000 / 18)) + ' km/h', '≈ ' + f(aA4 * 18 * 18) + ' m/s', '≈ ' + f(vA4, 0) + ' km/h'],
        richtig: 0,
        optErkl: ['Richtig: v = a·t = 2000 m / 324 s² · 18 s ≈ 111,11 m/s, mal 3,6 ergibt 400 km/h.',
          '1000 m / 18 s ist die mittlere Geschwindigkeit. Aus dem Stand ist die Endgeschwindigkeit doppelt so groß.',
          'Du hast t² statt t eingesetzt. Es gilt v = a·t, nicht a·t².',
          '111 ist der Wert in m/s. In km/h musst du noch mal 3,6 rechnen: 400 km/h.'] },

      { id: 'beschleunigt-u11', typ: 'rechnung', quelle: 'Tafel S. 10, (1) a',
        frage: 'Tafel S. 10, (1): Ein Fahrzeug beschleunigt gleichmäßig in 60 s von 0 auf 135 km/h. Wie groß ist seine Beschleunigung a?',
        gegeben: '<p>v = 135 km/h, Δt = 60 s. Tipp: 1 km/h = 1/3,6 m/s.</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v = 135 km/h = 37,5 m/s, Δt = 60 s<br>Gesucht: a in m/s²', 'Gegeben: v = 135 km/h = 486 m/s, Δt = 60 s<br>Gesucht: a in m/s²', 'Gegeben: v = 135 km/h = 37,5 m/s, Δt = 60 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: 135 : 3,6 = 37,5, gesucht ist a.', F.mal36.erkl, 'Gefragt ist zuerst die Beschleunigung a, nicht der Weg.'] },
          { art: 'formel', optionen: ['a = Δv/Δt', 'a = 2s/t²', 'v = s/t'], richtig: 0,
            optErkl: ['Richtig: Geschwindigkeitsänderung durch Zeit. Aus dem Stand ist Δv = v.', 'Diese Formel braucht einen Weg. Gegeben sind Geschwindigkeit und Zeit.', 'v = s/t gilt bei konstanter Geschwindigkeit. Hier wird beschleunigt.'] },
          { art: 'einsetzen', optionen: ['a = 37,5 m/s / 60 s', 'a = 135 km/h / 60 s', 'a = 60 s / 37,5 m/s', 'a = 486 m/s / 60 s'], richtig: 0,
            optErkl: ['Richtig: m/s durch s ergibt m/s².',
              'km/h und s passen nicht zusammen. Erst in m/s umrechnen, sonst kommt ' + f(135 / 60) + ' heraus, und das ist keine Beschleunigung in m/s².',
              F.kehrwert.erkl + ' Das ergäbe ' + f(60 / 37.5) + '.',
              F.mal36.erkl + ' Das ergäbe ' + f(486 / 60) + ' m/s².'] }
        ],
        antwort: a10, einheit: 'm/s²', formel: 'a-dv',
        loesung: '<p>135 km/h = 135 : 3,6 m/s = 37,5 m/s</p><p>a = Δv/Δt (aus dem Stand ist Δv = v)</p><p>a = Δv/Δt = 37,5 m/s / 60 s = ' + f(a10, 3) + ' m/s²</p>' },

      { id: 'beschleunigt-u12', typ: 'rechnung', quelle: 'Tafel S. 10, (1) a',
        frage: 'Tafel S. 10, (1) a: Wie lange dauert es, bis dasselbe Fahrzeug (aus dem Stand, a = 0,625 m/s²) die Geschwindigkeit 300 km/h hat?',
        gegeben: '<p>a = 0,625 m/s², v = 300 km/h</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: a = 0,625 m/s², v = 300 km/h = 83,33 m/s<br>Gesucht: t in s', 'Gegeben: a = 0,625 m/s², v = 300 km/h = 1080 m/s<br>Gesucht: t in s', 'Gegeben: a = 0,625 m/s², v = 300 km/h = 83,33 m/s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: 300 : 3,6 ≈ 83,33, gesucht ist die Zeit.', F.mal36.erkl, 'In Teil a ist die Zeit gefragt. Der Weg kommt in Teil b.'] },
          { art: 'formel', optionen: ['v = a·t', 's = a/2·t²', 'a = 2s/t²'], richtig: 0,
            optErkl: ['Richtig: v = a·t verbindet Geschwindigkeit, Beschleunigung und Zeit.', 'Den Weg kennst du nicht. Gegeben sind v und a.', 'Diese Formel braucht einen Weg. Gegeben sind v und a.'] },
          { art: 'umstellen', optionen: ['t = v/a', 't = v·a', 't = a/v'], richtig: 0,
            optErkl: ['Richtig: v = a·t | :a ergibt t = v/a.', 'Um t allein zu bekommen, teilst du durch a. Du hast multipliziert.', 'Du hast den Bruch umgedreht. Aus v = a·t | :a folgt t = v/a, die Geschwindigkeit steht oben.'] },
          { art: 'einsetzen', optionen: ['t = 83,33 m/s / 0,625 m/s²', 't = 300 km/h / 0,625 m/s²', 't = 83,33 m/s · 0,625 m/s²', 't = 0,625 m/s² / 83,33 m/s'], richtig: 0,
            optErkl: ['Richtig: m/s durch m/s² ergibt s.',
              'Erst km/h in m/s umrechnen. Sonst kommt ' + f(300 / 0.625) + ' heraus, und die Einheiten kürzen sich nicht zu s.',
              'Du hast multipliziert statt geteilt. Das ergäbe ' + f(P.ms(300) * 0.625) + ' und keine Zeit.',
              'Du hast den Bruch umgedreht. Aus v = a·t | :a folgt t = v/a, die Geschwindigkeit steht oben.' + ' Das ergäbe ' + f(0.625 / P.ms(300), 4) + '.'] }
        ],
        antwort: t10, auch: [133.33], einheit: 's', formel: 't-va',
        loesung: '<p>300 km/h = 300 : 3,6 m/s ≈ 83,33 m/s</p><p>v = a·t | :a<br>t = v/a</p><p>t = 83,33 m/s / 0,625 m/s² ≈ ' + f(t10) + ' s</p>' +
          '<p>Kürzer: 300 km/h ist 300/135-mal so viel wie 135 km/h, also dauert es 300/135 · 60 s ≈ ' + f(300 / 135 * 60) + ' s.</p>' },

      { id: 'beschleunigt-u13', typ: 'rechnung', quelle: 'Tafel S. 10, (1) b',
        frage: 'Tafel S. 10, (1) b: Welche Strecke hat das Fahrzeug (aus dem Stand, a = 0,625 m/s²) zurückgelegt, wenn es nach ' + f(t10) + ' s die 300 km/h erreicht?',
        gegeben: '<p>a = 0,625 m/s², t ≈ ' + f(t10) + ' s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: a = 0,625 m/s², t = 133,33 s<br>Gesucht: s in m', 'Gegeben: a = 0,625 m/s², t = 133,33 s<br>Gesucht: v in m/s', 'Gegeben: a = 0,625 m/s, t = 133,33 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Gesucht ist der Weg bis 300 km/h.', 'Die Geschwindigkeit ist schon bekannt (300 km/h). Gesucht ist der Weg.', 'Schau auf die Einheit: a = 0,625 m/s², nicht m/s.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt s = a/2·(Δt)².', F.gleichfoermig.erkl, 'Das ist die Formel für die Geschwindigkeit. Gesucht ist der Weg.'] },
          { art: 'einsetzen', optionen: ['s = 0,625 m/s² / 2 · (133,33 s)²', 's = 0,625 m/s² · (133,33 s)²', 's = 83,33 m/s · 133,33 s', 's = 0,625 m/s² / 2 · 133,33 s'], richtig: 0,
            optErkl: ['Richtig: m/s² mal s² ergibt m.',
              F.halbVergessen.erkl + ' Das ergäbe ' + f(a10 * t10 * t10, 0) + ' m.',
              'Mit der Endgeschwindigkeit zu rechnen, als wäre sie die ganze Zeit gefahren worden, ergibt den doppelten Weg (' + f(P.ms(300) * t10, 0) + ' m).',
              F.quadratVergessen.erkl + ' Dann bleibt m/s als Einheit, kein Weg.'] }
        ],
        antwort: s10, auch: [5555.5], einheit: 'm', formel: 's-beschl',
        loesung: '<p>s = a/2·(Δt)²</p><p>s = 0,625 m/s² / 2 · (133,33 s)² = 0,3125 m/s² · ' + f(t10 * t10, 1) + ' s² ≈ ' + f(s10, 1) + ' m</p>' +
          '<p>Mit t genau 400/3 s gerechnet. An der Tafel steht 5555,5 m, das sind rund 5,6 km.</p>' },

      { id: 'beschleunigt-u14', typ: 'rechnung', quelle: 'Tafel S. 14, A2 a',
        frage: 'Tafel S. 14, A2 a: Ein Fahrzeug soll aus dem Stand 400 m in 10 s schaffen. Wie groß muss die (gleichmäßige) Beschleunigung sein?',
        gegeben: '<p>s = 400 m, t = 10 s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = 400 m, t = 10 s<br>Gesucht: a in m/s²', 'Gegeben: s = 400 m, t = 10 s<br>Gesucht: v in m/s', 'Gegeben: s = 400 m, t = 10 m<br>Gesucht: a in m/s²'],
            richtig: 0,
            optErkl: ['Richtig: Weg und Zeit gegeben, gesucht ist a.', 'Gefragt ist die Beschleunigung, nicht die Geschwindigkeit.', 'Die Zeit hat die Einheit s, nicht m.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t', 'a = Δv/Δt'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt s = a/2·t².', F.gleichfoermig.erkl, 'Die Endgeschwindigkeit kennst du nicht. Gegeben sind Weg und Zeit.'] },
          { art: 'umstellen', optionen: ['a = 2s/t²', 'a = s/t²', 'a = 2s/t', 'a = s/(2t²)'], richtig: 0,
            optErkl: ['Richtig: s = a/2·t² | ·2 | :t² ergibt a = 2s/t².', F.zweiVergessen.erkl, F.quadratVergessen.erkl, 'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler: a = 2s/t².'] },
          { art: 'einsetzen', optionen: ['a = 2·400 m / (10 s)²', 'a = 400 m / (10 s)²', 'a = 2·400 m / 10 s'], richtig: 0,
            optErkl: ['Richtig: 800 m durch 100 s².',
              F.zweiVergessen.erkl + ' Das ergäbe ' + f(400 / 100) + ' m/s².',
              F.quadratVergessen.erkl + ' Das ergäbe ' + f(800 / 10) + ' m/s, und das ist keine Beschleunigung.'] }
        ],
        antwort: P.aAusS(400, 10), einheit: 'm/s²', formel: 'a-beschl',
        loesung: '<p>s = a/2·t² | ·2<br>2s = a·t² | :t²<br>a = 2s/t²</p><p>a = 2·400 m / (10 s)² = 800 m / 100 s² = 8 m/s²</p><p>Antwort: Die Beschleunigung muss a = 8 m/s² betragen.</p>' },

      { id: 'beschleunigt-u15', typ: 'rechnung', quelle: 'Tafel S. 14, A2 b',
        frage: 'Tafel S. 14, A2 b: Wann hat dasselbe Fahrzeug (aus dem Stand, a = 8 m/s²) 200 m geschafft?',
        gegeben: '<p>s = 200 m, a = 8 m/s²</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = 200 m, a = 8 m/s²<br>Gesucht: t in s', 'Gegeben: s = 200 m, a = 8 m/s²<br>Gesucht: v in m/s', 'Gegeben: s = 200 m, a = 8 m/s<br>Gesucht: t in s'],
            richtig: 0,
            optErkl: ['Richtig: Gesucht ist der Zeitpunkt t.', 'Gefragt ist die Zeit, nicht die Geschwindigkeit. Die kommt in Teil c.', 'Schau auf die Einheit: a = 8 m/s², nicht 8 m/s.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt s = a/2·t².', F.gleichfoermig.erkl, 'Eine Geschwindigkeit ist nicht gegeben. Du kennst s und a.'] },
          { art: 'umstellen', optionen: ['t = √(2s/a)', 't = 2s/a', 't = √(s/(2a))'], richtig: 0,
            optErkl: ['Richtig: s = a/2·t² | ·2/a | √ ergibt t = √(2s/a).', F.wurzelVergessen.erkl, 'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler: t = √(2s/a).'] },
          { art: 'einsetzen', optionen: ['t = √(2·200 m / 8 m/s²)', 't = 2·200 m / 8 m/s²', 't = √(200 m / 8 m/s²)'], richtig: 0,
            optErkl: ['Richtig: Unter der Wurzel steht 50 s².',
              F.wurzelVergessen.erkl + ' Das ergäbe ' + f(400 / 8) + ' s².',
              'In t = √(2s/a) steht oben die 2. Du hast sie vergessen. Das ergäbe ' + f(Math.sqrt(200 / 8)) + ' s, also die Hälfte der 10 s für 400 m. Halber Weg heißt aber nicht halbe Zeit.'] }
        ],
        antwort: t14b, auch: [7.07], einheit: 's', formel: 't-beschl',
        loesung: '<p>s = a/2·t² | ·2/a<br>2s/a = t² | √<br>t = √(2s/a)</p><p>t = √(2·200 m / 8 m/s²) = √(50 s²) ≈ ' + f(t14b) + ' s</p>' +
          '<p>Halber Weg heißt nicht halbe Zeit: Am Anfang ist das Fahrzeug langsam, deshalb braucht es für die ersten 200 m mehr als 5 s.</p>' },

      { id: 'beschleunigt-u16', typ: 'tabelle', quelle: 'Tafel S. 14, A2 c',
        frage: 'Tafel S. 14, A2 c: Wie schnell ist das Fahrzeug (aus dem Stand, a = 8 m/s²) bei s = 200 m, 400 m und 600 m? Bei 600 m beschleunigt es weiter. Trage die fehlende Zeit und die Geschwindigkeiten ein.',
        spalten: ['s in m', '200', '400', '600'],
        zeilen: [
          { kopf: 't in s', zellen: [{ fix: f(t14b) }, { fix: '10' }, { zahl: t14c, auch: [12.25] }] },
          { kopf: 'v in m/s', zellen: [{ zahl: P.vBeschl(8, t14b), auch: [56.6] }, { zahl: P.vBeschl(8, 10) }, { zahl: P.vBeschl(8, t14c), auch: [98] }] }
        ],
        erkl: 'Erst t = √(2s/a), dann v = a·t. Bei 200 m: v = 8 m/s² · ' + f(t14b) + ' s ≈ ' + f(P.vBeschl(8, t14b)) + ' m/s. Bei 400 m: v = 8 m/s² · 10 s = 80 m/s. ' +
          'Bei 600 m: t = √(2·600 m / 8 m/s²) = √(150 s²) ≈ ' + f(t14c) + ' s, v ≈ ' + f(P.vBeschl(8, t14c)) + ' m/s. Doppelter Weg heißt nicht doppelte Geschwindigkeit.' }
    ],

    trainer: ['a-dv', 'v-at', 't-va', 's-beschl', 't-beschl', 'a-beschl'],

    gutachten: [
      { id: 'beschleunigt-g1', typ: 'rechnung',
        frage: 'Prüfe den Fahrplanentwurf: Welchen Weg hat der Personenzug (aus dem Stand, a = 0,5 m/s²) nach einer Minute zurückgelegt?',
        gegeben: '<p>a = 0,5 m/s², t = 1 min</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: a = 0,5 m/s², t = 60 s<br>Gesucht: s in m', 'Gegeben: a = 0,5 m/s², t = 60 s<br>Gesucht: v in m/s', 'Gegeben: a = 0,5 m/s², t = 1 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Die Behauptung handelt vom Weg nach 60 s.', 'Die Behauptung nennt einen Weg (1 km), also ist s gesucht.', 'Eine Minute sind 60 s, nicht 1 s.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt s = a/2·t².', F.gleichfoermig.erkl, 'Das liefert die Geschwindigkeit, gesucht ist der Weg.'] },
          { art: 'einsetzen', optionen: ['s = 0,5 m/s² / 2 · (60 s)²', 's = 0,5 m/s² · (60 s)²', 's = 30 m/s · 60 s', 's = 0,5 m/s² / 2 · 60 s'], richtig: 0,
            optErkl: ['Richtig: 0,25 m/s² · 3600 s².',
              F.halbVergessen.erkl + ' Das ergäbe ' + f(0.5 * 3600) + ' m.',
              '30 m/s erreicht der Zug erst am Ende. Damit zu rechnen ergibt den doppelten Weg (' + f(30 * 60) + ' m).',
              F.quadratVergessen.erkl + ' Dann bleibt m/s als Einheit, kein Weg.'] }
        ],
        antwort: P.sBeschl(0.5, 60), einheit: 'm', formel: 's-beschl',
        loesung: '<p>s = a/2·t²</p><p>s = 0,5 m/s² / 2 · (60 s)² = 0,25 m/s² · 3600 s² = 900 m</p>' +
          '<p>Für 1000 m braucht der Zug t = √(2·1000 m / 0,5 m/s²) ≈ ' + f(tZug) + ' s, also gut 3 s länger als eine Minute.</p>',
        satz: {
          optionen: ['Nach einer Minute hat der Zug erst 900 m geschafft. Die Angabe „1 km nach einer Minute“ stimmt nicht.',
            'Nach einer Minute hat der Zug 1800 m geschafft. Die Angabe ist zu vorsichtig.',
            'Nach einer Minute fährt der Zug 30 m/s. Damit ist die Angabe bestätigt.'],
          richtig: 0,
          optErkl: ['Richtig: 900 m sind weniger als 1 km.', 'Das wäre der Weg ohne die Hälfte in a/2. Gerechnet hast du 900 m.', 'Die Behauptung nennt einen Weg, keine Geschwindigkeit.'] } },

      { id: 'beschleunigt-g2', typ: 'rechnung',
        frage: 'Beschleunigungstest: Der Sportwagen erreicht die Lichtschranke bei 100 m genau 5,0 s nach dem Start aus dem Stand. Wie groß ist seine Beschleunigung?',
        gegeben: '<p>s = 100 m, t = 5,0 s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = 100 m, t = 5 s<br>Gesucht: a in m/s²', 'Gegeben: s = 100 m, t = 5 s<br>Gesucht: v in m/s', 'Gegeben: s = 100 m, a = 5 m/s²<br>Gesucht: t in s'],
            richtig: 0,
            optErkl: ['Richtig: Weg und Zeit sind gemessen, gesucht ist a.', 'Zuerst ist die Beschleunigung gefragt.', 'Die 5,0 ist die gemessene Zeit in s, keine Beschleunigung.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 'v = s/t', 'a = Δv/Δt'], richtig: 0,
            optErkl: ['Richtig: s = a/2·t² verbindet Weg, Zeit und Beschleunigung.', 'v = s/t gilt bei konstanter Geschwindigkeit. Der Wagen beschleunigt.', 'Die Geschwindigkeit an der Lichtschranke ist nicht gemessen. Gegeben sind Weg und Zeit.'] },
          { art: 'umstellen', optionen: ['a = 2s/t²', 'a = s/t²', 'a = 2s/t'], richtig: 0,
            optErkl: ['Richtig: s = a/2·t² | ·2 | :t² ergibt a = 2s/t².', F.zweiVergessen.erkl, F.quadratVergessen.erkl] },
          { art: 'einsetzen', optionen: ['a = 2·100 m / (5 s)²', 'a = 100 m / (5 s)²', 'a = 2·100 m / 5 s'], richtig: 0,
            optErkl: ['Richtig: 200 m durch 25 s².',
              F.zweiVergessen.erkl + ' Das ergäbe ' + f(100 / 25) + ' m/s².',
              F.quadratVergessen.erkl + ' Das ergäbe ' + f(200 / 5) + ' m/s, und das ist keine Beschleunigung.'] }
        ],
        antwort: aAuto, einheit: 'm/s²', formel: 'a-beschl',
        loesung: '<p>s = a/2·t² | ·2 | :t²<br>a = 2s/t²</p><p>a = 2·100 m / (5 s)² = 200 m / 25 s² = 8 m/s²</p>' },

      { id: 'beschleunigt-g3', typ: 'rechnung',
        frage: 'Datenblatt: „0 auf 100 km/h in 3,5 s“. Wie lange braucht der Sportwagen mit der gemessenen Beschleunigung a = 8 m/s² aus dem Stand bis 100 km/h?',
        gegeben: '<p>a = 8 m/s², v = 100 km/h</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: a = 8 m/s², v = 100 km/h = 27,78 m/s<br>Gesucht: t in s', 'Gegeben: a = 8 m/s², v = 100 km/h = 360 m/s<br>Gesucht: t in s', 'Gegeben: a = 8 m/s², v = 100 km/h = 27,78 m/s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: 100 : 3,6 ≈ 27,78, gesucht ist die Zeit.', F.mal36.erkl, 'Das Datenblatt nennt eine Zeit, also ist t gesucht.'] },
          { art: 'formel', optionen: ['v = a·t', 's = a/2·t²', 'v = s/t'], richtig: 0,
            optErkl: ['Richtig: v = a·t verbindet Geschwindigkeit, Beschleunigung und Zeit.', 'Den Weg bis 100 km/h kennst du nicht. Gegeben sind v und a.', 'v = s/t gilt bei konstanter Geschwindigkeit. Der Wagen beschleunigt.'] },
          { art: 'umstellen', optionen: ['t = v/a', 't = v·a', 't = a/v'], richtig: 0,
            optErkl: ['Richtig: v = a·t | :a ergibt t = v/a.', 'Um t allein zu bekommen, teilst du durch a. Du hast multipliziert.', 'Du hast den Bruch umgedreht. Aus v = a·t | :a folgt t = v/a, die Geschwindigkeit steht oben.'] },
          { art: 'einsetzen', optionen: ['t = 27,78 m/s / 8 m/s²', 't = 100 km/h / 8 m/s²', 't = 27,78 m/s · 8 m/s²', 't = 360 m/s / 8 m/s²'], richtig: 0,
            optErkl: ['Richtig: m/s durch m/s² ergibt s.',
              'Erst km/h in m/s umrechnen. Sonst kommt ' + f(100 / 8) + ' heraus, und die Einheiten kürzen sich nicht zu s.',
              'Du hast multipliziert statt geteilt. Das ergäbe ' + f(P.ms(100) * 8) + ' und keine Zeit.',
              F.mal36.erkl + ' Das ergäbe ' + f(360 / 8) + ' s.'] }
        ],
        antwort: tAuto, auch: [3.47], einheit: 's', formel: 't-va',
        loesung: '<p>100 km/h = 100 : 3,6 m/s ≈ 27,78 m/s</p><p>v = a·t | :a<br>t = v/a</p><p>t = 27,78 m/s / 8 m/s² ≈ ' + f(tAuto) + ' s</p>',
        satz: {
          optionen: ['Der Wagen braucht rund 3,5 s bis 100 km/h. Die Angabe im Datenblatt ist bestätigt.',
            'Der Wagen braucht 12,5 s bis 100 km/h. Das Datenblatt übertreibt stark.',
            'Der Wagen braucht 45 s bis 100 km/h. Das Datenblatt ist falsch.'],
          richtig: 0,
          optErkl: ['Richtig: ' + f(tAuto) + ' s sind gerundet 3,5 s.', 'Das kommt heraus, wenn man km/h nicht in m/s umrechnet.', 'Das kommt heraus, wenn man mal 3,6 statt durch 3,6 rechnet.'] } },

      { id: 'beschleunigt-g4', typ: 'wahl',
        frage: 'Ein Kollege notiert für die Lichtschranke (100 m nach 5,0 s): „v = 100 m / 5 s = 20 m/s.“ Wie schnell war der Sportwagen dort wirklich (a = 8 m/s²)?',
        optionen: [f(P.vBeschl(aAuto, 5)) + ' m/s, also ' + f(P.kmh(P.vBeschl(aAuto, 5))) + ' km/h', f(100 / 5) + ' m/s, also ' + f(P.kmh(100 / 5)) + ' km/h', f(aAuto * 25) + ' m/s', f(P.kmh(P.vBeschl(aAuto, 5))) + ' m/s'],
        richtig: 0,
        optErkl: ['Richtig: v = a·t = 8 m/s² · 5 s = 40 m/s. Aus dem Stand ist die Endgeschwindigkeit doppelt so groß wie die mittlere.',
          '100 m / 5 s ist die mittlere Geschwindigkeit. Der Wagen startet bei 0 und wird schneller, an der Lichtschranke ist er doppelt so schnell.',
          'Du hast t² statt t eingesetzt. Es gilt v = a·t, nicht a·t².',
          '144 ist der Wert in km/h. In m/s sind es 40 m/s.'] }
    ],

    ergebnis: '<p><strong>Ergebnis:</strong> Der Personenzug hat nach einer Minute erst 900 m zurückgelegt, für 1000 m braucht er rund ' + f(tZug, 0) + ' s. ' +
      'Die Angabe im Fahrplanentwurf ist widerlegt. Der Sportwagen beschleunigt mit 8 m/s² und erreicht 100 km/h nach rund ' + f(tAuto, 1) + ' s. Die Angabe im Datenblatt ist bestätigt.</p>'
  });
})();
