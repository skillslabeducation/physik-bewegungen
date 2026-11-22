/* Akte 2: Gleichförmige Bewegung. Fall: Güterzug auf der Hafenbahn (Altenwerder, erfunden).
   Quellen: Blatt 1, A1 a–c; Tafel 17.11. (gleichförmige Bewegung, drei Graphen). Alle Zahlen über W.physik. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik, D = W.diagramm;
  var f = P.fmt, F = P.FEHLER;
  W.akten = W.akten || [];

  // Blatt 1, A1: 750 m in 40 s, konstant.
  var S = 750, T = 40;
  var V = P.vGleich(S, T);            // 18,75 m/s
  var VKMH = P.kmh(V);                // 67,5 km/h
  var S_C = 2400;                     // 2,4 km
  var T_C = P.tGleich(S_C, V);        // 128 s
  // Angabe des Lokführers
  var ANGABE = 60, ANGABE_MS = P.ms(ANGABE);   // ≈ 16,67 m/s
  // Übung s₀ + v·t
  var S0_U = 500, T_U = 40, S_U = P.sGleich(V, T_U, S0_U);   // 1250 m
  // Gutachten: zweite Messung und Bahnübergang
  var S_G1 = 1200, T_G1 = 64, V_G1 = P.vGleich(S_G1, T_G1);  // 18,75 m/s
  var S_BUE = 3000, S0_B = S;                               // Bahnübergang 3 km hinter A, Schranke B 750 m hinter A
  var T_G2 = P.tGleich(S_BUE - S0_B, V);                    // 120 s
  var T_AB_A = P.tGleich(S_BUE, V);                         // 160 s

  function minis(arten) { return arten.map(function (a) { return D.mini(a); }); }

  W.akten.push({
    id: 'gleichfoermig', nr: 2, titel: 'Gleichförmige Bewegung', fall: 'Güterzug auf der Hafenbahn',

    auftrag: {
      text: '<p>Hafenbahn in Altenwerder, ein gerader, flacher Abschnitt am Containerterminal. Ein Güterzug fährt mit konstanter Geschwindigkeit an drei Lichtschranken vorbei. ' +
        'Der Lokführer gibt an, er sei mit ' + f(ANGABE) + ' km/h gefahren. Die Disposition will außerdem wissen, wann der Zug den Bahnübergang erreicht, damit die Schranke rechtzeitig schließt.</p>',
      daten: '<table><tr><th>Lichtschranke</th><td>A</td><td>M</td><td>B</td></tr>' +
        '<tr><th>t in s</th><td>0</td><td>20</td><td>' + f(T) + '</td></tr>' +
        '<tr><th>s in m</th><td>0</td><td>' + f(P.sGleich(V, 20)) + '</td><td>' + f(S) + '</td></tr></table>',
      chefin: 'Akte 2. Laut Lokführer ' + f(ANGABE) + ' km/h, laut Lichtschranken ' + f(S) + ' m in ' + f(T) + ' s. Rechne nach.',
      leitfrage: 'Wie schnell fuhr der Güterzug wirklich, und wann erreicht er den Bahnübergang 3 km hinter Lichtschranke A?'
    },

    karten: [
      { titel: 'Gleichförmig heißt: v bleibt gleich',
        text: '<p>Der Güterzug wird weder schneller noch langsamer. In jeder Sekunde legt er dieselbe Strecke zurück: ' + f(V) + ' m. ' +
          'In 20 s sind es ' + f(P.sGleich(V, 20)) + ' m, in 40 s ' + f(S) + ' m. Darum ist der v(t)-Graph eine waagerechte Linie.</p>' +
          '<p>An der Tafel (17.11.): <strong>a = 0</strong> und <strong>v = v₀ = konst</strong>.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 'v', e: 'm/s', max: 25, schritt: 5 } },
          kurven: [{ punkte: [[0, V], [60, V]], farbe: 'v', label: 'v(t) = ' + f(V) + ' m/s' }] },
        merk: 'Gleichförmige Bewegung: a = 0, v = v₀ = konst. In gleichen Zeiten werden gleiche Strecken zurückgelegt.' },

      { titel: 'v = s/t, s = v·t, t = s/v',
        text: '<p>Aus v = s/t entstehen durch Seitentausch die beiden anderen Formen:</p>' +
          '<p>v = s/t &nbsp;| ·t &nbsp;⇒&nbsp; s = v·t<br>s = v·t &nbsp;| :v &nbsp;⇒&nbsp; t = s/v</p>' +
          '<p>Der s(t)-Graph ist eine Ursprungsgerade. Ihre Steigung ist die Geschwindigkeit: ' + f(S) + ' m / ' + f(T) + ' s = ' + f(V) + ' m/s.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 's', e: 'm', max: 1250, schritt: 250 } },
          kurven: [{ punkte: D.kurve(function (t) { return P.sGleich(V, t); }, 0, 60, 2), farbe: 's', label: 's(t) = ' + f(V) + ' m/s · t' }],
          marken: [[T, S]] },
        merk: 'v = s/t<br>s = v·t<br>t = s/v',
        achtung: '<p>Erst Einheiten angleichen, dann einsetzen: 2,4 km = 2400 m. Mit „2,4“ statt „2400“ kommt 0,128 s heraus, also Unsinn.</p>' },

      { titel: 'Start nicht bei null: s = s₀ + v·t',
        text: '<p>s = v·t gilt nur, wenn für t = 0 auch s = 0 ist. Steht der Zug beim Start der Uhr schon bei s₀, kommt dieser Startwert dazu:</p>' +
          '<p><strong>s = s₀ + v·t</strong></p>' +
          '<p>Der Graph ist dann immer noch eine Gerade mit derselben Steigung, beginnt aber bei s₀ auf der s-Achse.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 40, schritt: 10 }, y: { g: 's', e: 'm', max: 1000, schritt: 250 } },
          kurven: [
            { punkte: [[0, 250], [40, P.sGleich(V, 40, 250)]], farbe: 's', label: 's = s₀ + v·t' },
            { punkte: [[0, 0], [40, P.sGleich(V, 40)]], farbe: 's', label: 's = v·t' }] },
        merk: 's = v·t (wenn für t = 0 auch s = 0), sonst s = s₀ + v·t.',
        achtung: '<p>s₀ ist ein Weg, keine Geschwindigkeit. Er wird addiert, nicht mit t malgenommen.</p>' },

      { titel: 'Die drei Graphen der gleichförmigen Bewegung',
        text: '<p>Diese drei Bilder musst du sofort erkennen:</p>' +
          '<p>' + minis(['s-gleich', 'v-gleich', 'a-gleich']).join(' ') + '</p>' +
          '<p>s(t): Ursprungsgerade, die Steigung ist v. &nbsp;v(t): waagerechte Linie in Höhe v₀. &nbsp;a(t) = 0: Linie auf der t-Achse.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 'a', e: 'm/s²', max: 1, schritt: 0.5 } },
          kurven: [{ punkte: [[0, 0], [60, 0]], farbe: 'a', label: 'a(t) = 0' }] },
        achtung: '<p>Eine waagerechte Linie heißt nicht immer dasselbe. Im v(t)-Diagramm: konstante Geschwindigkeit. Im s(t)-Diagramm: der Zug steht. Erst auf die Achse schauen.</p>' },

      { titel: 'km/h und m/s',
        text: '<p>1 m/s = 3,6 km/h. Von m/s nach km/h nimmst du <strong>mal 3,6</strong>, von km/h nach m/s <strong>geteilt durch 3,6</strong>.</p>' +
          '<p>' + f(V) + ' m/s · 3,6 = ' + f(VKMH) + ' km/h. Die Angabe ' + f(ANGABE) + ' km/h wären nur ' + f(ANGABE_MS) + ' m/s.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 'v', e: 'km/h', max: 80, schritt: 20 } },
          kurven: [
            { punkte: [[0, VKMH], [60, VKMH]], farbe: 'v', label: 'gemessen ' + f(VKMH) + ' km/h' },
            // Linie bis 60 s, letzter Punkt bei 30 s: Die Beschriftung steht dann seitlich versetzt zur oberen.
            { punkte: [[0, ANGABE], [60, ANGABE], [30, ANGABE]], farbe: 'v', label: 'Angabe ' + f(ANGABE) + ' km/h' }] },
        merk: 'm/s → km/h: mal 3,6<br>km/h → m/s: geteilt durch 3,6' }
    ],

    ueben: [
      { id: 'gleichfoermig-u1', typ: 'wahl', quelle: 'Tafel 17.11.',
        frage: 'Was gilt bei einer gleichförmigen Bewegung?',
        optionen: ['a = 0 und v = v₀ = konst', 'a = konst und v nimmt gleichmäßig zu', 'v = 0 und s = konst', 'a = 0 und deshalb auch v = 0'],
        richtig: 0,
        optErkl: [
          'Richtig: Keine Beschleunigung, die Geschwindigkeit bleibt beim Anfangswert v₀.',
          'Das ist die gleichmäßig beschleunigte Bewegung. Bei der gleichförmigen ändert sich v gar nicht.',
          'Das beschreibt einen Körper in Ruhe. Der Güterzug fährt aber.',
          'a = 0 heißt nur: v ändert sich nicht. Der Zug fährt mit gleichbleibender Geschwindigkeit weiter, er steht nicht.'] },

      { id: 'gleichfoermig-u2', typ: 'rechnung', quelle: 'Blatt 1, A1 a',
        frage: 'Der Güterzug durchfährt mit konstanter Geschwindigkeit eine ' + f(S) + ' m lange, gerade und flache Strecke in ' + f(T) + ' s. Berechne seine Geschwindigkeit in m/s.',
        gegeben: '<p>s = ' + f(S) + ' m, t = ' + f(T) + ' s</p>',
        schritte: [
          { art: 'gg',
            optionen: ['Gegeben: s = ' + f(S) + ' m, t = ' + f(T) + ' s<br>Gesucht: v in m/s',
              'Gegeben: s = ' + f(S) + ' m, t = ' + f(T) + ' s<br>Gesucht: s in m',
              'Gegeben: v = ' + f(S) + ' m/s, t = ' + f(T) + ' s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Weg und Zeit sind gegeben, gesucht ist die Geschwindigkeit.',
              'Der Weg ist schon gegeben. Gefragt ist die Geschwindigkeit v.',
              f(S) + ' m ist ein Weg, keine Geschwindigkeit. Schau auf die Einheit.'] },
          { art: 'formel',
            optionen: ['v = s/t', 'v = t/s', 's = a/2·t²', 'v = a·t'],
            richtig: 0,
            optErkl: ['Richtig: Bei konstanter Geschwindigkeit gilt v = s/t.',
              F.kehrwert.erkl,
              'Hier ist die Geschwindigkeit konstant. s = a/2·t² gilt nur für eine beschleunigte Bewegung.',
              'Es gibt keine Beschleunigung, a = 0. v = a·t passt nicht.'] },
          { art: 'einsetzen',
            optionen: ['v = ' + f(S) + ' m / ' + f(T) + ' s', 'v = ' + f(T) + ' s / ' + f(S) + ' m', 'v = ' + f(S) + ' m · ' + f(T) + ' s'],
            richtig: 0,
            optErkl: ['Richtig: Weg geteilt durch Zeit.',
              F.kehrwert.erkl + ' Das ergäbe ' + f(T / S, 4) + ' s/m.',
              'Geschwindigkeit ist Weg pro Zeit. Du musst teilen, nicht malnehmen. Das ergäbe ' + f(S * T) + ' m·s.'] }
        ],
        antwort: V, einheit: 'm/s', formel: 'v-gleich',
        loesung: '<p>Gegeben: s = ' + f(S) + ' m, t = ' + f(T) + ' s<br>Gesucht: v<br>v = s/t<br>v = ' + f(S) + ' m / ' + f(T) + ' s = ' + f(V) + ' m/s</p>' },

      { id: 'gleichfoermig-u3', typ: 'rechnung', quelle: 'Blatt 1, A1 a',
        frage: 'Der Güterzug fährt mit ' + f(V) + ' m/s. Gib seine Geschwindigkeit in km/h an.',
        gegeben: '<p>v = ' + f(V) + ' m/s</p>',
        schritte: [
          { art: 'gg',
            optionen: ['Gegeben: v = ' + f(V) + ' m/s<br>Gesucht: v in km/h',
              'Gegeben: v = ' + f(V) + ' km/h<br>Gesucht: v in m/s',
              'Gegeben: v = ' + f(V) + ' m/s²<br>Gesucht: v in km/h'],
            richtig: 0,
            optErkl: ['Richtig: Gegeben in m/s, gesucht in km/h.',
              'Du hast die Richtung vertauscht. Gegeben sind m/s, gesucht sind km/h.',
              'm/s² ist die Einheit der Beschleunigung. Die Geschwindigkeit hat m/s.'] },
          { art: 'formel',
            optionen: ['v in km/h = v in m/s · 3,6', 'v in km/h = v in m/s : 3,6', 'v = s/t'],
            richtig: 0,
            optErkl: ['Richtig: 1 m/s = 3,6 km/h. Von m/s nach km/h nimmst du mal 3,6.',
              F.durch36.erkl,
              'Weg und Zeit brauchst du hier nicht mehr. Du rechnest nur die Einheit um.'] },
          { art: 'einsetzen',
            optionen: ['v = ' + f(V) + ' · 3,6 km/h', 'v = ' + f(V) + ' : 3,6 km/h', 'v = 3,6 : ' + f(V) + ' km/h'],
            richtig: 0,
            optErkl: ['Richtig: die Zahl in m/s mal 3,6.',
              'Das ergäbe nur ' + f(P.ms(V)) + ' km/h, Schritttempo, kein Güterzug. Von m/s nach km/h rechnest du mal 3,6.',
              'Du hast 3,6 durch die Geschwindigkeit geteilt. Richtig ist Geschwindigkeit mal 3,6. Das ergäbe ' + f(3.6 / V, 3) + ' km/h.'] }
        ],
        antwort: VKMH, einheit: 'km/h', formel: 'ms-kmh',
        loesung: '<p>v in km/h = v in m/s · 3,6<br>' + f(V) + ' m/s = ' + f(V) + ' · 3,6 km/h = ' + f(VKMH) + ' km/h</p>' },

      { id: 'gleichfoermig-u4', typ: 'wahl', quelle: 'Blatt 1, A1 b',
        frage: 'Gib den Funktionsterm für s(t) an, die vom Güterzug zurückgelegte Strecke (' + f(S) + ' m in ' + f(T) + ' s, konstant).',
        optionen: ['s(t) = ' + f(V) + ' m/s · t', 's(t) = ' + f(S) + ' m · t', 's(t) = ' + f(V / 2, 4) + ' m/s² · t²', 's(t) = ' + f(V) + ' m/s'],
        richtig: 0,
        optErkl: [
          'Richtig: s = v·t mit v = ' + f(S) + ' m / ' + f(T) + ' s = ' + f(V) + ' m/s. Für t = 0 ist auch s = 0.',
          'Du hast den Messwert ' + f(S) + ' m statt der Geschwindigkeit eingesetzt. Vor das t gehört v = s/t. Die Einheit m·s ist auch kein Weg.',
          'Hier wurde v halbiert in s = a/2·t² eingesetzt (' + f(V) + ' : 2 = ' + f(V / 2, 4) + '). Das ist die Formel der beschleunigten Bewegung, der Zug fährt aber gleichförmig: s = v·t.',
          'Das ist v(t), die Geschwindigkeit. s(t) muss von t abhängen: s(t) = v·t.'] },

      { id: 'gleichfoermig-u5', typ: 'punkte', quelle: 'Blatt 1, A1 b',
        frage: 'Zeichne den Graphen für s(t) = ' + f(V) + ' m/s · t im Bereich 0 s ≤ t ≤ 60 s. Setze die Punkte bei t = 0, 20, 40 und 60 s.',
        achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 's', e: 'm', min: 0, max: 1250, schritt: 250 } },
        xs: [0, 20, 40, 60],
        soll: [0, P.sGleich(V, 20), P.sGleich(V, 40), P.sGleich(V, 60)],
        kurve: D.kurve(function (t) { return P.sGleich(V, t); }, 0, 60),
        erkl: 's(20 s) = ' + f(V) + ' m/s · 20 s = ' + f(P.sGleich(V, 20)) + ' m, s(40 s) = ' + f(S) + ' m, s(60 s) = ' + f(P.sGleich(V, 60)) +
          ' m. Die Punkte liegen auf einer Ursprungsgeraden. Achsen beschriften: t in s nach rechts, s in m nach oben.' },

      { id: 'gleichfoermig-u6', typ: 'rechnung', quelle: 'Blatt 1, A1 c',
        frage: 'Nach welcher Zeit t hat der Güterzug (v = ' + f(V) + ' m/s) 2,4 km zurückgelegt?',
        gegeben: '<p>v = ' + f(V) + ' m/s, s = 2,4 km</p>',
        schritte: [
          { art: 'gg',
            optionen: ['Gegeben: v = ' + f(V) + ' m/s, s = 2,4 km = 2400 m<br>Gesucht: t in s',
              'Gegeben: v = ' + f(V) + ' m/s, s = 2,4 m<br>Gesucht: t in s',
              'Gegeben: v = ' + f(V) + ' m/s, t = 2,4 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Kilometer gleich in Meter umrechnen, gesucht ist die Zeit.',
              '2,4 km sind 2400 m, nicht 2,4 m. 1 km = 1000 m.',
              '2,4 km ist ein Weg, keine Zeit. Gesucht ist hier t.'] },
          { art: 'formel',
            optionen: ['v = s/t', 's = a/2·t²', 'v = a·t'],
            richtig: 0,
            optErkl: ['Richtig: Bei konstanter Geschwindigkeit gilt v = s/t. Gleich nach t umstellen.',
              'Hier ist die Geschwindigkeit konstant. s = a/2·t² gilt nur für eine beschleunigte Bewegung.',
              'Es gibt keine Beschleunigung, a = 0. v = a·t passt nicht.'] },
          { art: 'umstellen',
            optionen: ['t = s/v', 't = v·s', 't = v/s'],
            richtig: 0,
            optErkl: ['Richtig: v = s/t | ·t | :v ergibt t = s/v.',
              'Beim Umstellen von v = s/t nach t teilst du durch v. Du hast malgenommen.',
              'Du hast den Bruch auf den Kopf gestellt. Der Weg steht oben: t = s/v.'] },
          { art: 'einsetzen',
            optionen: ['t = 2400 m / ' + f(V) + ' m/s', 't = 2,4 km / ' + f(V) + ' m/s', 't = ' + f(V) + ' m/s / 2400 m', 't = 2400 m · ' + f(V) + ' m/s'],
            richtig: 0,
            optErkl: ['Richtig: Weg in Metern geteilt durch die Geschwindigkeit, die Meter kürzen sich weg.',
              'km und m/s passen nicht zusammen. Mit 2,4 statt 2400 kämen ' + f(2.4 / V, 3) + ' s heraus. Erst 2,4 km = 2400 m umrechnen.',
              'Du hast den Bruch auf den Kopf gestellt. Der Weg steht oben: t = s/v. Das ergäbe ' + f(V / S_C, 4) + ' 1/s.',
              'Für die Zeit teilst du den Weg durch die Geschwindigkeit. Du hast malgenommen. Das ergäbe ' + f(S_C * V) + ' m²/s.'] }
        ],
        antwort: T_C, einheit: 's', formel: 't-gleich',
        loesung: '<p>Gegeben: v = ' + f(V) + ' m/s, s = 2,4 km = 2400 m<br>Gesucht: t<br>v = s/t &nbsp;| ·t &nbsp;| :v<br>t = s/v<br>t = 2400 m / ' + f(V) + ' m/s = ' + f(T_C) + ' s</p>' },

      { id: 'gleichfoermig-u7', typ: 'wahl', quelle: 'Tafel 17.11.',
        frage: 'Welcher s(t)-Graph passt zum Güterzug mit konstanter Geschwindigkeit?',
        optionen: minis(['s-gleich', 's-beschl', 's-brems', 's-ruhe']),
        richtig: 0,
        optErkl: [
          'Richtig: eine Gerade aus dem Ursprung. In gleichen Zeiten kommen gleiche Strecken dazu.',
          'Die Kurve wird immer steiler: Der Zug würde immer schneller. Das ist eine beschleunigte Bewegung.',
          'Die Kurve wird immer flacher: Der Zug würde bremsen.',
          'Eine waagerechte Linie im s(t)-Diagramm heißt: s ändert sich nicht, der Zug steht.'] },

      { id: 'gleichfoermig-u8', typ: 'wahl', quelle: 'Tafel 17.11.',
        frage: 'Welcher v(t)-Graph passt zum Güterzug mit konstanter Geschwindigkeit?',
        optionen: minis(['v-gleich', 'v-beschl', 'v-brems', 'v-ruhe']),
        richtig: 0,
        optErkl: [
          'Richtig: v bleibt gleich, also eine waagerechte Linie in Höhe von v₀.',
          'Eine Ursprungsgerade im v(t)-Diagramm heißt: v wächst gleichmäßig, der Zug beschleunigt. Typische Verwechslung mit dem s(t)-Graphen.',
          'Hier nimmt v ab, das ist Bremsen.',
          'Die Linie liegt auf der t-Achse: v = 0, der Zug steht.'] },

      { id: 'gleichfoermig-u9', typ: 'wahl', quelle: 'Tafel 17.11.',
        frage: 'Welcher a(t)-Graph passt zum Güterzug mit konstanter Geschwindigkeit?',
        optionen: minis(['a-gleich', 'a-beschl', 'a-brems']),
        richtig: 0,
        optErkl: [
          'Richtig: a = 0, die Linie liegt auf der t-Achse.',
          'Eine waagerechte Linie oberhalb der Achse heißt a = konst größer als null: gleichmäßig beschleunigt. Konstante Geschwindigkeit ist nicht dasselbe wie konstante Beschleunigung.',
          'Unterhalb der Achse ist die Beschleunigung negativ, der Zug würde bremsen.'] },

      { id: 'gleichfoermig-u10', typ: 'rechnung', quelle: 'Tafel 17.11.',
        frage: 'Auf einem anderen Abschnitt startet die Uhr, als der Güterzug schon ' + f(S0_U) + ' m hinter dem Stellwerk ist. Er fährt konstant ' + f(V) + ' m/s. Wie weit ist er ' + f(T_U) + ' s später vom Stellwerk entfernt?',
        gegeben: '<p>s₀ = ' + f(S0_U) + ' m, v = ' + f(V) + ' m/s, t = ' + f(T_U) + ' s</p>',
        schritte: [
          { art: 'gg',
            optionen: ['Gegeben: s₀ = ' + f(S0_U) + ' m, v = ' + f(V) + ' m/s, t = ' + f(T_U) + ' s<br>Gesucht: s in m',
              'Gegeben: v = ' + f(V) + ' m/s, t = ' + f(T_U) + ' s<br>Gesucht: s in m',
              'Gegeben: s₀ = ' + f(S0_U) + ' m, v = ' + f(V) + ' m/s, t = ' + f(T_U) + ' s<br>Gesucht: t in s'],
            richtig: 0,
            optErkl: ['Richtig: Der Startwert s₀ gehört zu den gegebenen Größen.',
              'Der Startwert s₀ = ' + f(S0_U) + ' m fehlt. Der Zug beginnt nicht bei s = 0.',
              'Die Zeit ist gegeben. Gesucht ist die Entfernung s.'] },
          { art: 'formel',
            optionen: ['s = s₀ + v·t', 's = v·t', 's = a/2·t²'],
            richtig: 0,
            optErkl: ['Richtig: Startet der Zug nicht bei s = 0, kommt s₀ dazu.',
              's = v·t gilt nur, wenn für t = 0 auch s = 0 ist. Hier fehlt s₀.',
              'Hier ist die Geschwindigkeit konstant. s = a/2·t² gilt nur für eine beschleunigte Bewegung.'] },
          { art: 'einsetzen',
            optionen: ['s = ' + f(S0_U) + ' m + ' + f(V) + ' m/s · ' + f(T_U) + ' s',
              's = ' + f(V) + ' m/s · ' + f(T_U) + ' s',
              's = (' + f(S0_U) + ' m + ' + f(V) + ' m/s) · ' + f(T_U) + ' s'],
            richtig: 0,
            optErkl: ['Richtig: Startwert plus die Strecke, die in ' + f(T_U) + ' s dazukommt.',
              'Das ist nur die Strecke seit dem Start der Uhr (' + f(P.sGleich(V, T_U)) + ' m). Der Startwert s₀ fehlt.',
              'Punkt vor Strich: Nur v wird mit t malgenommen. Außerdem kannst du m und m/s nicht addieren.'] }
        ],
        antwort: S_U, einheit: 'm', formel: 's-gleich-s0',
        loesung: '<p>Gegeben: s₀ = ' + f(S0_U) + ' m, v = ' + f(V) + ' m/s, t = ' + f(T_U) + ' s<br>Gesucht: s<br>s = s₀ + v·t<br>s = ' + f(S0_U) + ' m + ' + f(V) + ' m/s · ' + f(T_U) + ' s<br>s = ' + f(S0_U) + ' m + ' + f(P.sGleich(V, T_U)) + ' m = ' + f(S_U) + ' m</p>' },

      { id: 'gleichfoermig-u11', typ: 'wahl', quelle: 'Tafel 17.11.',
        frage: 'Ein zweiter Zug auf der Hafenbahn: Welcher Funktionsterm passt zu diesem Graphen?',
        abb: { achsen: { x: { g: 't', e: 's', max: 40, schritt: 10 }, y: { g: 's', e: 'm', max: 1000, schritt: 250 } },
          kurven: [{ punkte: [[0, 250], [40, P.sGleich(V, 40, 250)]], farbe: 's' }] },
        optionen: ['s(t) = 250 m + ' + f(V) + ' m/s · t', 's(t) = ' + f(P.vGleich(1000, 40)) + ' m/s · t', 's(t) = ' + f(V) + ' m/s · t', 's(t) = 250 m · t'],
        richtig: 0,
        optErkl: [
          'Richtig: Der Graph beginnt bei s₀ = 250 m und steigt in 40 s um 1000 m − 250 m = 750 m, also v = 750 m / 40 s = ' + f(V) + ' m/s.',
          'Du hast 1000 m / 40 s gerechnet, also den Messwert statt der Änderung. In 40 s kommen nur 1000 m − 250 m = 750 m dazu. Außerdem fehlt s₀.',
          'Die Steigung stimmt, aber s₀ fehlt. Dieser Graph würde im Ursprung beginnen.',
          '250 m ist der Startwert s₀, keine Geschwindigkeit. Er wird addiert, nicht mit t malgenommen.'] },

      { id: 'gleichfoermig-u12', typ: 'luecke', quelle: 'Tafel 17.11.',
        frage: 'Ergänze den Merksatz zur gleichförmigen Bewegung.',
        text: 'Bei einer gleichförmigen Bewegung ist die Beschleunigung {null|konstant und größer als null|negativ}. Die Geschwindigkeit ist {konstant|gleichmäßig steigend|null}. ' +
          'Der s(t)-Graph ist eine {Gerade|Parabel|waagerechte Linie}, der v(t)-Graph eine {waagerechte Linie|Ursprungsgerade|Parabel}.',
        erkl: 'Tafel 17.11.: a = 0, v = v₀ = konst. Darum steigt s gleichmäßig (Gerade), und v(t) bleibt auf einer Höhe (waagerecht).' },

      { id: 'gleichfoermig-u13', typ: 'behauptung',
        aussage: 'Fährt der Güterzug mit gleicher Geschwindigkeit doppelt so lange, legt er auch die doppelte Strecke zurück.',
        stimmt: true,
        gruende: ['Bei konstantem v ist s = v·t. Doppeltes t ergibt doppeltes s: ' + f(T) + ' s → ' + f(S) + ' m, ' + f(2 * T) + ' s → ' + f(P.sGleich(V, 2 * T)) + ' m.',
          'Nein, die Strecke wächst mit t², also vierfache Strecke.',
          'Nein, der Zug wird mit der Zeit immer schneller.'],
        richtig: 0,
        erkl: 's und t sind bei der gleichförmigen Bewegung proportional (Ursprungsgerade). Das t² gehört zur beschleunigten Bewegung s = a/2·t².' },

      { id: 'gleichfoermig-u14', typ: 'wahl',
        frage: 'Der Lokführer gibt ' + f(ANGABE) + ' km/h an. Wie viel m/s sind das?',
        optionen: ['≈ ' + f(ANGABE_MS) + ' m/s', f(P.kmh(ANGABE)) + ' m/s', f(ANGABE / 60) + ' m/s', f(3.6 / ANGABE) + ' m/s'],
        richtig: 0,
        optErkl: [
          'Richtig: ' + f(ANGABE) + ' : 3,6 ≈ ' + f(ANGABE_MS) + '. Das ist weniger als die gemessenen ' + f(V) + ' m/s.',
          F.mal36.erkl + ' ' + f(P.kmh(ANGABE)) + ' m/s wären über 750 km/h.',
          'Du hast durch 60 geteilt, als ginge es um Minuten. Eine Stunde hat 3600 s und ein Kilometer 1000 m, daher der Faktor 3,6.',
          'Du hast 3,6 durch die Geschwindigkeit geteilt. Es ist umgekehrt: Geschwindigkeit geteilt durch 3,6.'] },

      { id: 'gleichfoermig-u15', typ: 'zuordnen', quelle: 'Tafel 17.11.',
        frage: 'Ordne jeder Frage die passende Formel zu.',
        paare: [['Gesucht ist v, gegeben sind s und t.', 'v = s/t'],
          ['Gesucht ist s, der Zug startet bei s = 0.', 's = v·t'],
          ['Gesucht ist t, gegeben sind s und v.', 't = s/v'],
          ['Gesucht ist s, der Zug startet bei s₀.', 's = s₀ + v·t']],
        erkl: 'Alle vier Formeln kommen aus v = s/t. s = v·t gilt nur, wenn für t = 0 auch s = 0 ist, sonst s = s₀ + v·t.' }
    ],

    trainer: ['v-gleich', 's-gleich', 't-gleich', 'kmh-ms', 'ms-kmh'],

    gutachten: [
      { id: 'gleichfoermig-g1', typ: 'rechnung', quelle: 'Blatt 1, A1 a',
        frage: 'Eine zweite Messung auf demselben Abschnitt: Der Güterzug braucht für ' + f(S_G1) + ' m genau ' + f(T_G1) + ' s, wieder mit konstanter Geschwindigkeit. Wie schnell fuhr er in km/h?',
        gegeben: '<p>s = ' + f(S_G1) + ' m, t = ' + f(T_G1) + ' s</p>',
        schritte: [
          { art: 'gg',
            optionen: ['Gegeben: s = ' + f(S_G1) + ' m, t = ' + f(T_G1) + ' s<br>Gesucht: v in km/h',
              'Gegeben: v = ' + f(S_G1) + ' m/s, t = ' + f(T_G1) + ' s<br>Gesucht: s in m',
              'Gegeben: s = ' + f(S_G1) + ' m, t = ' + f(T_G1) + ' s<br>Gesucht: t in s'],
            richtig: 0,
            optErkl: ['Richtig: Weg und Zeit gegeben, gesucht ist v, am Ende in km/h.',
              f(S_G1) + ' m ist ein Weg, keine Geschwindigkeit. Schau auf die Einheit.',
              'Die Zeit ist gegeben. Gesucht ist die Geschwindigkeit.'] },
          { art: 'formel',
            optionen: ['v = s/t, dann · 3,6', 'v = s/t, dann : 3,6', 'v = s·t, dann · 3,6', 'v = a·t'],
            richtig: 0,
            optErkl: ['Richtig: Erst v in m/s, dann mal 3,6 für km/h.',
              F.durch36.erkl,
              'Geschwindigkeit ist Weg pro Zeit. Du musst teilen, nicht malnehmen.',
              'Es gibt keine Beschleunigung, a = 0. v = a·t passt nicht.'] },
          { art: 'einsetzen',
            optionen: ['v = ' + f(S_G1) + ' m / ' + f(T_G1) + ' s, dann · 3,6', 'v = ' + f(S_G1) + ' m / ' + f(T_G1) + ' s, dann : 3,6', 'v = ' + f(T_G1) + ' s / ' + f(S_G1) + ' m, dann · 3,6'],
            richtig: 0,
            optErkl: ['Richtig: Weg durch Zeit, danach mal 3,6.',
              F.durch36.erkl + ' Das ergäbe ' + f(P.ms(V_G1)) + ' km/h.',
              F.kehrwert.erkl + ' Das ergäbe ' + f(T_G1 / S_G1 * 3.6, 3) + ' km/h.'] }
        ],
        antwort: P.kmh(V_G1), einheit: 'km/h', formel: 'v-gleich-kmh',
        loesung: '<p>Gegeben: s = ' + f(S_G1) + ' m, t = ' + f(T_G1) + ' s<br>Gesucht: v in km/h<br>v = s/t<br>v = ' + f(S_G1) + ' m / ' + f(T_G1) + ' s = ' + f(V_G1) + ' m/s<br>' +
          f(V_G1) + ' m/s = ' + f(V_G1) + ' · 3,6 km/h = ' + f(P.kmh(V_G1)) + ' km/h</p>',
        satz: {
          optionen: ['Der Zug fuhr konstant ' + f(P.kmh(V_G1)) + ' km/h. Die Angabe von ' + f(ANGABE) + ' km/h ist widerlegt.',
            'Der Zug fuhr ' + f(ANGABE) + ' km/h. Die Angabe des Lokführers stimmt.',
            'Der Zug fuhr langsamer als ' + f(ANGABE) + ' km/h.'],
          richtig: 0,
          optErkl: ['Richtig: Beide Messungen ergeben ' + f(V) + ' m/s = ' + f(VKMH) + ' km/h.',
            f(ANGABE) + ' km/h wären nur ' + f(ANGABE_MS) + ' m/s. Gemessen sind ' + f(V) + ' m/s.',
            f(VKMH) + ' km/h ist mehr als ' + f(ANGABE) + ' km/h, nicht weniger.'] } },

      { id: 'gleichfoermig-g2', typ: 'rechnung', quelle: 'Tafel 17.11.',
        frage: 'Die Disposition stellt die Uhr auf t = 0, wenn der Güterzug Lichtschranke B passiert. B liegt ' + f(S0_B) + ' m hinter A, der Bahnübergang 3 km hinter A. ' +
          'Der Zug fährt konstant ' + f(V) + ' m/s. Nach welcher Zeit erreicht er den Bahnübergang?',
        gegeben: '<p>s₀ = ' + f(S0_B) + ' m, s = 3 km, v = ' + f(V) + ' m/s (Ort s ab Lichtschranke A gemessen)</p>',
        schritte: [
          { art: 'gg',
            optionen: ['Gegeben: s₀ = ' + f(S0_B) + ' m, s = 3 km = 3000 m, v = ' + f(V) + ' m/s<br>Gesucht: t in s',
              'Gegeben: s = 3 km = 3000 m, v = ' + f(V) + ' m/s<br>Gesucht: t in s',
              'Gegeben: s₀ = ' + f(S0_B) + ' m, s = 3 m, v = ' + f(V) + ' m/s<br>Gesucht: t in s'],
            richtig: 0,
            optErkl: ['Richtig: Der Zug ist bei t = 0 schon ' + f(S0_B) + ' m weit, das ist s₀.',
              'Der Startwert s₀ = ' + f(S0_B) + ' m fehlt. Bei t = 0 steht der Zug an B, nicht an A.',
              '3 km sind 3000 m, nicht 3 m.'] },
          { art: 'formel',
            optionen: ['s = s₀ + v·t', 's = v·t', 's = a/2·t²', 'v = a·t'],
            richtig: 0,
            optErkl: ['Richtig: Der Zug startet bei s₀, also s = s₀ + v·t.',
              's = v·t gilt nur, wenn für t = 0 auch s = 0 ist. Hier ist s₀ = ' + f(S0_B) + ' m.',
              'Hier ist die Geschwindigkeit konstant. s = a/2·t² gilt nur für eine beschleunigte Bewegung.',
              'Es gibt keine Beschleunigung, a = 0. v = a·t passt nicht.'] },
          { art: 'umstellen',
            optionen: ['t = (s − s₀)/v', 't = (s + s₀)/v', 't = v/(s − s₀)', 't = s/v − s₀'],
            richtig: 0,
            optErkl: ['Richtig: s = s₀ + v·t | − s₀ | : v ergibt t = (s − s₀)/v.',
              'Beim Umstellen wird s₀ abgezogen, nicht addiert: | − s₀.',
              'Du hast den Bruch auf den Kopf gestellt. Die Strecke steht oben.',
              'Erst s₀ abziehen, dann durch v teilen. So ziehst du Meter von Sekunden ab.'] },
          { art: 'einsetzen',
            optionen: ['t = (3000 m − ' + f(S0_B) + ' m) / ' + f(V) + ' m/s', 't = 3000 m / ' + f(V) + ' m/s', 't = (3000 m + ' + f(S0_B) + ' m) / ' + f(V) + ' m/s'],
            richtig: 0,
            optErkl: ['Richtig: Von B bis zum Bahnübergang sind es 3000 m − ' + f(S0_B) + ' m = ' + f(S_BUE - S0_B) + ' m.',
              'Das ist die Zeit ab Lichtschranke A (' + f(T_AB_A) + ' s). Die Uhr startet aber an B, s₀ fehlt.',
              'Vorzeichen: s₀ wird abgezogen. Das ergäbe ' + f(P.tGleich(S_BUE + S0_B, V)) + ' s.'] }
        ],
        antwort: T_G2, einheit: 's', formel: 't-gleich-s0',
        loesung: '<p>Gegeben: s₀ = ' + f(S0_B) + ' m, s = 3 km = 3000 m, v = ' + f(V) + ' m/s<br>Gesucht: t<br>s = s₀ + v·t &nbsp;| − s₀<br>s − s₀ = v·t &nbsp;| :v<br>t = (s − s₀)/v<br>' +
          't = (3000 m − ' + f(S0_B) + ' m) / ' + f(V) + ' m/s = ' + f(S_BUE - S0_B) + ' m / ' + f(V) + ' m/s = ' + f(T_G2) + ' s</p>',
        satz: {
          optionen: ['Der Zug erreicht den Bahnübergang ' + f(T_G2) + ' s nach Lichtschranke B, also ' + f(T_AB_A) + ' s nach A.',
            'Der Zug erreicht den Bahnübergang ' + f(T_AB_A) + ' s nach Lichtschranke B.',
            'Der Zug erreicht den Bahnübergang ' + f(T_G2) + ' s nach Lichtschranke A.'],
          richtig: 0,
          optErkl: ['Richtig: ' + f(T) + ' s von A bis B plus ' + f(T_G2) + ' s ergibt ' + f(T_AB_A) + ' s.',
            f(T_AB_A) + ' s ist die Zeit ab A. Ab B sind es ' + f(T_G2) + ' s.',
            'Die Uhr startet an B, nicht an A.'] } },

      { id: 'gleichfoermig-g3', typ: 'mehrfach', quelle: 'Tafel 17.11.',
        frage: 'Welche Aussagen über die gemessene Fahrt des Güterzugs (' + f(S) + ' m in ' + f(T) + ' s, konstant) sind richtig?',
        optionen: ['Die Beschleunigung ist a = 0.',
          'Der s(t)-Graph ist eine Ursprungsgerade mit der Steigung ' + f(V) + ' m/s.',
          'In ' + f(2 * T) + ' s legt der Zug ' + f(P.sGleich(V, 2 * T)) + ' m zurück.',
          'Der v(t)-Graph steigt gleichmäßig an.',
          'In ' + f(2 * T) + ' s legt der Zug ' + f(4 * S) + ' m zurück.'],
        richtig: [0, 1, 2],
        optErkl: ['Richtig: v bleibt gleich, also a = 0.',
          'Richtig: Die Steigung des s(t)-Graphen ist v = ' + f(S) + ' m / ' + f(T) + ' s.',
          'Richtig: s = ' + f(V) + ' m/s · ' + f(2 * T) + ' s = ' + f(P.sGleich(V, 2 * T)) + ' m, doppelte Zeit, doppelte Strecke.',
          'Ein steigender v(t)-Graph heißt: Der Zug wird schneller. Bei konstanter Geschwindigkeit ist v(t) waagerecht.',
          'Hier wurde mit t² gerechnet wie bei der beschleunigten Bewegung. Bei konstantem v verdoppelt sich die Strecke nur.'] },

      { id: 'gleichfoermig-g4', typ: 'wahl', quelle: 'Tafel 17.11.',
        frage: 'Die Disposition startet die Uhr an Lichtschranke B (' + f(S0_B) + ' m hinter A). Der Ort s wird weiter ab A gemessen. Welcher Funktionsterm beschreibt die Fahrt ab B?',
        optionen: ['s(t) = ' + f(S0_B) + ' m + ' + f(V) + ' m/s · t', 's(t) = ' + f(V) + ' m/s · t', 's(t) = ' + f(S0_B) + ' m · t', 's(t) = ' + f(S0_B) + ' m + ' + f(V / 2, 4) + ' m/s² · t²'],
        richtig: 0,
        optErkl: ['Richtig: Bei t = 0 ist der Zug schon bei s₀ = ' + f(S0_B) + ' m, danach kommen ' + f(V) + ' m pro Sekunde dazu.',
          's₀ fehlt. Dieser Term gilt nur, wenn die Uhr an A startet.',
          f(S0_B) + ' m ist der Startwert, keine Geschwindigkeit. Er wird addiert, nicht mit t malgenommen.',
          'Hier wurde v halbiert in s = a/2·t² eingesetzt (' + f(V) + ' : 2 = ' + f(V / 2, 4) + '). Das ist die Formel der beschleunigten Bewegung, der Zug fährt aber gleichförmig: s = s₀ + v·t.'] }
    ],

    ergebnis: '<p><strong>Ergebnis:</strong> Der Güterzug fuhr konstant ' + f(V) + ' m/s = ' + f(VKMH) + ' km/h, nicht ' + f(ANGABE) + ' km/h. Die Angabe des Lokführers ist widerlegt. ' +
      'Den Bahnübergang 3 km hinter Lichtschranke A erreicht er ' + f(T_AB_A) + ' s nach A, also ' + f(T_G2) + ' s nach Lichtschranke B. Bis dahin muss die Schranke geschlossen sein.</p>'
  });
})();
