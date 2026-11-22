/* Akte 6 (Einholen): Zwei E-Bikes an der Ampel. Blatt 2, A1 a–g und Blatt 1, A2 d.
   Methode: beide s(t) aufstellen, gleichsetzen, t ausklammern (t = 0 ist der Start). Falle: gleich schnell ist nicht eingeholt. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik, D = W.diagramm;
  W.akten = W.akten || [];
  var f = P.fmt;
  var FE = P.FEHLER;

  /* Zahlen der Akte, alle aus W.physik. */
  var v1 = P.vGleich(28, 6);            // 4,67 m/s (genau 14/3)
  var a2 = P.aAusS(28, 6);              // 1,56 m/s² (genau 14/9)
  var h2 = a2 / 2;                      // 0,78 m/s² (a₂/2)
  var V1 = f(v1), A2 = f(a2), H2 = f(h2);
  var V1KMH = f(P.kmh(v1));             // 16,8 km/h
  var v2e = P.vBeschl(a2, 6);           // 9,33 m/s beim Einholen
  var tF = P.tAusS(50, a2);             // f) 8,02 s (mit 1,56: 8,01 s, Tafel ≈ 8,0 s)
  var s5 = P.sGleich(v1, 5);            // g) 23,33 m
  var aG = P.aAusS(s5, 5);              // g) 1,87 m/s²
  var zug = P.einholen(18.75, 0.5);     // Blatt 1, A2 d: t = 75 s, s = 1406,25 m
  var morgen = P.einholen(5, 1.25);     // Gutachten: t = 8 s, s = 40 m

  /* Achsen */
  var AX_V = { x: { g: 't', e: 's', max: 7, schritt: 1 }, y: { g: 'v', e: 'm/s', max: 12, schritt: 2 } };
  var AX_S = { x: { g: 't', e: 's', max: 7, schritt: 1 }, y: { g: 's', e: 'm', max: 40, schritt: 5 } };
  var AX_S_KLEIN = { x: { g: 't', e: 's', max: 7, schritt: 1 }, y: { g: 's', e: 'm', max: 40, schritt: 10 } };

  function k(fn, von, bis, label, farbe) { return { punkte: D.kurve(fn, von, bis), farbe: farbe, label: label }; }
  function s1(t) { return v1 * t; }
  function s2(t) { return h2 * t * t; }
  function bild(achsen, kurven) { return D.markup({ achsen: achsen, kurven: kurven, klein: true }).svg; }

  W.akten.push({
    id: 'einholen', nr: 6, titel: 'Einholen und Treffpunkt', fall: 'Zwei E-Bikes an der Ampel',

    auftrag: {
      text: '<p>Radweg an der Lombardsbrücke, morgens um acht. Die Ampel springt auf Grün. Eine Pendlerin auf E-Bike 2 fährt aus dem Stand gleichmäßig beschleunigt los. ' +
        'Im selben Augenblick (t = 0) rollt ein Kurier auf E-Bike 1 mit konstanter Geschwindigkeit von hinten heran und fährt an ihr vorbei.</p>' +
        '<p>Nach 6 s und 28 m sind beide auf gleicher Höhe. Die Lenker berühren sich, eine Klingel bricht ab. Die Pendlerin sagt der Versicherung: ' +
        '„Ich war nie schneller als der Kurier. Er hat mich geschnitten.“ Ein Zeugenvideo liefert die Messdaten.</p>',
      daten: '<table><tr><th></th><th>t = 0</th><th>t = 6 s</th></tr>' +
        '<tr><th>E-Bike 1 (Kurier)</th><td>s = 0 m, fährt konstant</td><td>s = 28 m</td></tr>' +
        '<tr><th>E-Bike 2 (Pendlerin)</th><td>s = 0 m, steht</td><td>s = 28 m</td></tr></table>',
      chefin: 'Akte 6. Sie sagt, sie war nie schneller als er. Rechne nach, wann und wo sie ihn eingeholt hat.',
      leitfrage: 'Wann und wo holt E-Bike 2 den Kurier ein, und wie schnell ist es in diesem Moment?'
    },

    karten: [
      {
        titel: 'Zwei Bewegungen in einem Diagramm', demo: 'labor:einholen',
        text: '<p>Beide starten bei t = 0 an derselben Stelle (s = 0).</p>' +
          '<p><strong>E-Bike 1</strong> fährt gleichförmig: v₁ = konst, also s₁(t) = v₁·t. Der s(t)-Graph ist eine Ursprungsgerade.</p>' +
          '<p><strong>E-Bike 2</strong> fährt aus dem Stand gleichmäßig beschleunigt: v₂(t) = a₂·t und s₂(t) = a₂/2·t². Der s(t)-Graph ist eine Parabel.</p>' +
          '<p>Im Fall: s₁(t) = ' + V1 + ' m/s · t und s₂(t) = ' + H2 + ' m/s² · t². Die Gerade und die Parabel schneiden sich bei t = 6 s und s = 28 m.</p>',
        abb: { achsen: AX_S, kurven: [k(s1, 0, 7, 's₁(t)', 's'), k(s2, 0, 7, 's₂(t)', 's')], marken: [[6, 28]] },
        merk: 'Gleicher Ort, gleiche Startzeit: s₁(t) = v₁·t (Gerade) und s₂(t) = a/2·t² (Parabel). Der Schnittpunkt bei t &gt; 0 ist der Treffpunkt.'
      },
      {
        titel: 'Einholen: gleichsetzen und t ausklammern',
        text: '<p>Eingeholt ist, wenn beide am <strong>gleichen Ort</strong> sind: s₁(t) = s₂(t). Beispiel Blatt 1, A2 d: Der Güterzug fährt konstant 18,75 m/s, ' +
          'der Personenzug fährt neben ihm aus dem Stand mit a = 0,5 m/s² los.</p>' +
          '<p>1. Beide Terme aufstellen: s_G = 18,75 m/s · t und s_P = 0,5 m/s² / 2 · t² = 0,25 m/s² · t²<br>' +
          '2. Gleichsetzen: 0,25 m/s² · t² = 18,75 m/s · t<br>' +
          '3. Alles auf eine Seite, t ausklammern: t·(0,25 m/s² · t − 18,75 m/s) = 0<br>' +
          '4. Ein Produkt ist null, wenn ein Faktor null ist: t = 0 (das ist der Start) oder 0,25 m/s² · t = 18,75 m/s ⇒ t = 75 s<br>' +
          '5. Treffpunkt: s = 18,75 m/s · 75 s = ' + f(zug.s) + ' m</p>',
        abb: {
          achsen: { x: { g: 't', e: 's', max: 80, schritt: 10 }, y: { g: 's', e: 'm', max: 1600, schritt: 200 } },
          kurven: [k(function (t) { return 18.75 * t; }, 0, 80, 'Güterzug', 's'), k(function (t) { return 0.25 * t * t; }, 0, 80, 'Personenzug', 's')],
          marken: [[zug.t, zug.s]]
        },
        merk: 'Einholen: s₁(t) = s₂(t) gleichsetzen, t ausklammern. t = 0 ist der Start, die zweite Lösung ist der Einholzeitpunkt. Aus dem Stand gegen konstante Geschwindigkeit: t = 2·v₁/a (Abkürzung; in der Arbeit über Gleichsetzen herleiten).',
        achtung: '<p>Die Hälfte nicht vergessen: s = a/2·t², also 0,25 m/s² · t² bei a = 0,5 m/s². Mit 0,5 m/s² · t² kommt 37,5 s heraus, das ist falsch.</p>' +
          '<p>Nach dem Ausklammern steht t nur noch einfach da. Keine Wurzel ziehen.</p>'
      },
      {
        titel: 'Gleich schnell ist nicht eingeholt',
        text: '<p>Im v(t)-Diagramm ist v₁ eine waagerechte Linie bei ' + V1 + ' m/s, v₂ eine Ursprungsgerade mit der Steigung ' + A2 + ' m/s². ' +
          'Die beiden Linien schneiden sich bei <strong>t = 3 s</strong>: Dort sind beide gleich schnell.</p>' +
          '<p>Eingeholt ist E-Bike 1 dort aber noch nicht. Bis 3 s ist E-Bike 1 schneller, der Abstand wächst. Bei 3 s ist er am größten: ' +
          's₁ = 14 m, s₂ = 7 m, also 7 m. Danach ist E-Bike 2 schneller und holt auf, bis der Abstand bei 6 s null ist.</p>',
        abb: { achsen: AX_V, kurven: [k(function () { return v1; }, 0, 7, 'v₁(t)', 'v'), k(function (t) { return a2 * t; }, 0, 7, 'v₂(t)', 'v')], marken: [[3, v1]] },
        merk: 'Gleich schnell: v₁(t) = v₂(t), Schnittpunkt im v(t)-Diagramm (hier 3 s). Eingeholt: s₁(t) = s₂(t), Schnittpunkt im s(t)-Diagramm (hier 6 s).',
        achtung: '<p>Der Schnittpunkt im v(t)-Diagramm ist <strong>nicht</strong> der Treffpunkt. Wer dort „eingeholt“ abliest, hat die beiden Diagramme verwechselt.</p>'
      },
      {
        titel: 'Probe: Beim Einholen doppelt so schnell',
        text: '<p>In den 6 s legen beide 28 m zurück. Also haben beide dieselbe mittlere Geschwindigkeit: v̄ = 28 m / 6 s ≈ ' + V1 + ' m/s.</p>' +
          '<p>E-Bike 2 startet bei 0 und wird gleichmäßig schneller. Seine mittlere Geschwindigkeit ist deshalb die Hälfte seiner Endgeschwindigkeit. ' +
          'Beim Einholen fährt es also doppelt so schnell wie E-Bike 1: v₂ = a₂·t = 56/36 m/s² · 6 s ≈ ' + f(v2e) + ' m/s ≈ ' + f(P.kmh(v2e)) + ' km/h.</p>',
        abb: { achsen: AX_V, kurven: [k(function () { return v1; }, 0, 7, 'v₁(t)', 'v'), k(function (t) { return a2 * t; }, 0, 7, 'v₂(t)', 'v')], marken: [[6, v1], [6, v2e]] },
        merk: 'Startet ein Fahrzeug aus dem Stand und holt ein Fahrzeug mit konstanter Geschwindigkeit v₁ ein, fährt es beim Einholen 2·v₁.'
      },
      {
        titel: 'Weiterrechnen mit a₂',
        text: '<p>Mit a₂ = ' + A2 + ' m/s² lassen sich neue Fragen beantworten.</p>' +
          '<p><strong>Zeit für 50 m</strong> (Blatt 2, A1 f): s = a/2·t² | ·2 | :a | √ ⇒ t = √(2s/a) = √(2·50 m / 1,56 m/s²) ≈ 8,0 s.</p>' +
          '<p><strong>Früher einholen</strong> (Blatt 2, A1 g): Soll E-Bike 2 schon nach 5 s gleichauf sein, muss es dann dort sein, wo E-Bike 1 nach 5 s ist: ' +
          's₁(5 s) = 28 m / 6 s · 5 s ≈ ' + f(s5) + ' m. Dann a = 2s/t² = 2·' + f(s5) + ' m / (5 s)² ≈ ' + f(aG) + ' m/s².</p>',
        abb: {
          achsen: { x: { g: 't', e: 's', max: 7, schritt: 1 }, y: { g: 's', e: 'm', max: 50, schritt: 10 } },
          kurven: [k(s1, 0, 7, 's₁(t)', 's'), k(s2, 0, 7, 's₂(t)', 's'), k(function (t) { return aG / 2 * t * t; }, 0, 7, 's₂ mit a = ' + f(aG), 's')],
          marken: [[5, s5], [6, 28]]
        },
        merk: 'Einholen nach einer vorgegebenen Zeit: erst den Ort s₁(t) ausrechnen, dann a = 2s/t².'
      }
    ],

    ueben: [
      {
        id: 'einholen-u1', typ: 'rechnung', quelle: 'Blatt 2, A1 a',
        frage: 'E-Bike 1 fährt mit konstanter Geschwindigkeit. Nach 6 s ist es 28 m hinter der Ampel. Berechne seine Geschwindigkeit v₁ in m/s.',
        gegeben: '<p>s = 28 m, t = 6 s, v₁ = konst</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = 28 m, t = 6 s<br>Gesucht: v₁ in m/s', 'Gegeben: s = 28 m, t = 6 s<br>Gesucht: a in m/s²', 'Gegeben: s = 28 m/s, t = 6 s<br>Gesucht: v₁ in m/s'], richtig: 0,
            optErkl: ['Richtig: Weg und Zeit sind gegeben, gesucht ist die Geschwindigkeit.', 'Eine Beschleunigung hat nur E-Bike 2. E-Bike 1 fährt konstant, gesucht ist v₁.', 'Schau auf die Einheit: 28 m ist ein Weg, keine Geschwindigkeit.'] },
          { art: 'formel', optionen: ['v = s/t', 's = a/2·t²', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: konstante Geschwindigkeit, also Weg durch Zeit.', 'Das gilt für E-Bike 2, das aus dem Stand beschleunigt. E-Bike 1 fährt konstant.', 'Das ist die Geschwindigkeit beim Beschleunigen aus dem Stand. E-Bike 1 beschleunigt nicht.'] },
          { art: 'einsetzen', optionen: ['v₁ = 28 m / 6 s', 'v₁ = 6 s / 28 m', 'v₁ = 2·28 m / 6 s'], richtig: 0,
            optErkl: ['Richtig: Weg geteilt durch Zeit.', FE.kehrwert.erkl + ' Das ergäbe ' + f(6 / 28) + ' s/m.', 'Die 2 gehört zu einer Beschleunigung aus dem Stand. Das ergäbe ' + f(56 / 6) + ' m/s, die Endgeschwindigkeit von E-Bike 2, nicht die von E-Bike 1.'] }
        ],
        antwort: v1, auch: [4.67], einheit: 'm/s', formel: 'v-gleich',
        loesung: '<p>v₁ = s/t<br>v₁ = 28 m / 6 s ≈ ' + V1 + ' m/s</p>'
      },
      {
        id: 'einholen-u2', typ: 'rechnung', quelle: 'Blatt 2, A1 a',
        frage: 'Rechne die Geschwindigkeit von E-Bike 1, v₁ ≈ ' + V1 + ' m/s, in km/h um.',
        gegeben: '<p>v₁ = 28 m / 6 s ≈ ' + V1 + ' m/s</p>',
        schritte: [
          { art: 'formel', optionen: ['m/s → km/h: mal 3,6', 'm/s → km/h: durch 3,6', 'm/s → km/h: mal 60'], richtig: 0,
            optErkl: ['Richtig: 1 m/s = 3,6 km/h.', FE.durch36.erkl, 'Mal 60 macht aus „pro Sekunde“ nur „pro Minute“. Für km/h brauchst du mal 3600 und durch 1000, zusammen mal 3,6.'] },
          { art: 'einsetzen', optionen: ['v₁ = ' + V1 + ' m/s · 3,6', 'v₁ = ' + V1 + ' m/s : 3,6', 'v₁ = ' + V1 + ' m/s · 60'], richtig: 0,
            optErkl: ['Richtig: mit 3,6 multiplizieren.', FE.durch36.erkl + ' Das ergäbe ' + f(v1 / 3.6) + ' km/h, langsamer als ein Fußgänger.', 'Das ergäbe ' + f(v1 * 60) + ' m pro Minute, keine km/h.'] }
        ],
        antwort: P.kmh(v1), einheit: 'km/h', formel: 'ms-kmh',
        loesung: '<p>1 m/s = 3,6 km/h<br>v₁ = 28 m / 6 s · 3,6 = ' + V1KMH + ' km/h<br>Mit dem gerundeten Wert: ' + V1 + ' m/s · 3,6 ≈ ' + V1KMH + ' km/h</p>'
      },
      {
        id: 'einholen-u3', typ: 'rechnung', quelle: 'Blatt 2, A1 b',
        frage: 'E-Bike 2 fährt aus dem Stand und beschleunigt die ganze Zeit gleichmäßig. Nach 6 s hat es 28 m zurückgelegt. Berechne seine Beschleunigung a₂.',
        gegeben: '<p>s = 28 m, t = 6 s, aus dem Stand</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = 28 m, t = 6 s, v₀ = 0<br>Gesucht: a₂ in m/s²', 'Gegeben: s = 28 m, t = 6 s, v₀ = 0<br>Gesucht: v₂ in m/s', 'Gegeben: v = 28 m, t = 6 s<br>Gesucht: a₂ in m/s²'], richtig: 0,
            optErkl: ['Richtig: Weg und Zeit aus dem Stand, gesucht ist die Beschleunigung.', 'Gefragt ist die Beschleunigung a₂, nicht die Geschwindigkeit.', 'Schau auf die Einheit: 28 m ist ein Weg, keine Geschwindigkeit.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 'v = s/t', 'a = Δv/Δt'], richtig: 0,
            optErkl: ['Richtig: Weg aus dem Stand bei konstanter Beschleunigung.', FE.gleichfoermig.erkl, 'Dafür bräuchtest du eine Geschwindigkeitsänderung. Gegeben sind aber Weg und Zeit.'] },
          { art: 'umstellen', optionen: ['a = 2s/t²', 'a = s/(2t²)', 'a = 2s/t'], richtig: 0,
            optErkl: ['Richtig: s = a/2·t² | ·2 | :t² ergibt a = 2s/t².', 'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler: a = 2s/t².', FE.quadratVergessen.erkl] },
          { art: 'einsetzen', optionen: ['a₂ = 2·28 m / (6 s)²', 'a₂ = 28 m / (6 s)²', 'a₂ = 2·28 m / 6 s', 'a₂ = 28 m / 6 s'], richtig: 0,
            optErkl: ['Richtig: doppelter Weg geteilt durch die Zeit zum Quadrat.', FE.zweiVergessen.erkl + ' Das ergäbe ' + f(28 / 36) + ' m/s².', FE.quadratVergessen.erkl + ' Das ergäbe ' + f(56 / 6) + ' m/s, eine Geschwindigkeit.', FE.gleichfoermig.erkl + ' 28 m / 6 s ist die Geschwindigkeit von E-Bike 1.'] }
        ],
        antwort: a2, auch: [1.56], einheit: 'm/s²', formel: 'a-beschl',
        loesung: '<p>s = a/2·t² | ·2 | :t²<br>a₂ = 2s/t²<br>a₂ = 2·28 m / (6 s)² = 56 m / 36 s² ≈ ' + A2 + ' m/s²</p>'
      },
      {
        id: 'einholen-u4', typ: 'wahl', quelle: 'Blatt 2, A1 c',
        frage: 'Gib die genauen Funktionsterme für die Geschwindigkeiten an. Welche Zeile stimmt?',
        optionen: [
          'v₁(t) = ' + V1 + ' m/s und v₂(t) = ' + A2 + ' m/s² · t',
          'v₁(t) = ' + V1 + ' m/s · t und v₂(t) = ' + A2 + ' m/s² · t',
          'v₁(t) = ' + V1 + ' m/s und v₂(t) = ' + H2 + ' m/s² · t²',
          'v₁(t) = ' + V1 + ' m/s und v₂(t) = ' + A2 + ' m/s'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: v₁ ist konstant, v₂ wächst gleichmäßig mit der Zeit: v = a·t.',
          'E-Bike 1 fährt konstant, v₁ hängt nicht von t ab. ' + V1 + ' m/s · t ist der Weg s₁(t), nicht die Geschwindigkeit.',
          'Das ist der Weg s₂(t) = a₂/2·t². Die Geschwindigkeit aus dem Stand ist v₂(t) = a₂·t.',
          'Bei v₂ fehlt das t. Eine konstante Geschwindigkeit hätte E-Bike 2 nur ohne Beschleunigung.'
        ]
      },
      {
        id: 'einholen-u5', typ: 'punkte', quelle: 'Blatt 2, A1 d',
        frage: 'Zeichne den Graphen von v₂(t) = ' + A2 + ' m/s² · t für 0 ≤ t ≤ 7 s. Setze die Punkte bei t = 0, 1, 2, …, 7 s. (v₁(t) = ' + V1 + ' m/s wäre eine waagerechte Linie.)',
        achsen: AX_V,
        xs: [0, 1, 2, 3, 4, 5, 6, 7],
        soll: [0, 1, 2, 3, 4, 5, 6, 7].map(function (t) { return a2 * t; }),
        kurve: D.kurve(function (t) { return a2 * t; }, 0, 7),
        erkl: 'v₂ ist eine Ursprungsgerade mit der Steigung ' + A2 + ' m/s². Bei t = 3 s ist v₂ = ' + V1 + ' m/s, so schnell wie E-Bike 1: Dort schneidet sie die waagerechte v₁-Linie. Bei 7 s sind es ' + f(a2 * 7) + ' m/s. Auf dem Blatt: v₁ als waagerechte Linie bei ' + V1 + ' m/s ergänzen; Achsen: t in s, v in m/s.'
      },
      {
        id: 'einholen-u6', typ: 'wahl', quelle: 'Blatt 2, A1 d',
        frage: 'Welches Diagramm zeigt v₁(t) und v₂(t) für 0 ≤ t ≤ 7 s richtig?',
        optionen: [
          bild(AX_V, [k(function () { return v1; }, 0, 7, 'v₁(t)', 'v'), k(function (t) { return a2 * t; }, 0, 7, 'v₂(t)', 'v')]),
          bild(AX_V, [k(function () { return v2e; }, 0, 7, 'v₁(t)', 'v'), k(function (t) { return a2 * t; }, 0, 7, 'v₂(t)', 'v')]),
          bild(AX_V, [k(function () { return v1; }, 0, 7, 'v₁(t)', 'v'), k(function (t) { return a2 * 7 / 49 * t * t; }, 0, 7, 'v₂(t)', 'v')]),
          bild(AX_V, [k(function (t) { return a2 * t; }, 0, 7, 'v₁(t)', 'v'), k(function () { return v1; }, 0, 7, 'v₂(t)', 'v')])
        ],
        richtig: 0,
        optErkl: [
          'Richtig: v₁ waagerecht bei ' + V1 + ' m/s, v₂ Ursprungsgerade. Beide sind bei t = 3 s gleich schnell.',
          'Hier liegt v₁ bei ' + f(v2e) + ' m/s, sodass sich die Linien bei 6 s schneiden. Das ist der Fehler „gleich schnell = eingeholt“. v₁ ist 28 m / 6 s ≈ ' + V1 + ' m/s, gleich schnell sind beide bei 3 s.',
          'v₂ ist hier eine Parabel. Bei gleichmäßiger Beschleunigung wächst v gleichmäßig, der Graph ist eine Gerade. Die Parabel gehört zu s₂(t).',
          'Vertauscht: E-Bike 1 fährt konstant (waagerechte Linie), E-Bike 2 beschleunigt aus dem Stand (Ursprungsgerade).'
        ]
      },
      {
        id: 'einholen-u7', typ: 'behauptung', quelle: 'Blatt 2, A1 d',
        frage: 'Ein Mitschüler schaut auf das v(t)-Diagramm und behauptet:',
        aussage: 'Bei t = 3 s schneiden sich v₁ und v₂. Also hat E-Bike 2 das E-Bike 1 nach 3 s eingeholt.',
        stimmt: false,
        gruende: [
          'Bei 3 s sind beide nur gleich schnell. Eingeholt ist, wenn beide am gleichen Ort sind (s₁ = s₂). Das ist erst bei 6 s, bei 3 s liegt E-Bike 2 noch 7 m zurück.',
          'Der Schnittpunkt im v(t)-Diagramm ist immer der Treffpunkt, weil dort beide denselben Wert haben.',
          'E-Bike 2 holt nie ein, weil es erst nach 3 s so schnell ist wie E-Bike 1.'
        ],
        richtig: 0
      },
      {
        id: 'einholen-u8', typ: 'wahl', quelle: 'Blatt 2, A1 e',
        frage: 'Gib die Funktionsterme für die zurückgelegten Strecken an. Welche Zeile stimmt?',
        optionen: [
          's₁(t) = ' + V1 + ' m/s · t und s₂(t) = ' + H2 + ' m/s² · t²',
          's₁(t) = ' + V1 + ' m/s · t und s₂(t) = ' + A2 + ' m/s² · t²',
          's₁(t) = ' + V1 + ' m/s · t und s₂(t) = ' + H2 + ' m/s² · t',
          's₁(t) = ' + V1 + ' m/s und s₂(t) = ' + H2 + ' m/s² · t²'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: s₁ = v₁·t (Gerade), s₂ = a₂/2·t² mit a₂/2 = ' + H2 + ' m/s² (Parabel).',
          FE.halbVergessen.erkl + ' Mit ' + A2 + ' m/s² · t² wäre E-Bike 2 nach 6 s schon 56 m weit.',
          FE.quadratVergessen.erkl,
          's₁(t) = ' + V1 + ' m/s ist die Geschwindigkeit v₁. Der Weg wächst mit der Zeit: s₁(t) = v₁·t.'
        ]
      },
      {
        id: 'einholen-u9', typ: 'punkte', quelle: 'Blatt 2, A1 e',
        frage: 'Zeichne den Graphen von s₂(t) = ' + H2 + ' m/s² · t² für 0 ≤ t ≤ 7 s. Setze die Punkte bei t = 0, 1, 2, …, 7 s.',
        achsen: AX_S,
        xs: [0, 1, 2, 3, 4, 5, 6, 7],
        soll: [0, 1, 2, 3, 4, 5, 6, 7].map(s2),
        kurve: D.kurve(s2, 0, 7),
        erkl: 's₂ ist eine Parabel: erst flach, dann immer steiler. Bei t = 6 s ist s₂ = 28 m. Die Gerade s₁(t) = ' + V1 + ' m/s · t geht durch denselben Punkt: Dort ist der Treffpunkt. Auf dem Blatt: s₁ als Ursprungsgerade durch (6 s | 28 m) ergänzen; Achsen: t in s, s in m.'
      },
      {
        id: 'einholen-u10', typ: 'wahl', quelle: 'Blatt 2, A1 e',
        frage: 'Im Diagramm siehst du s₁(t) und s₂(t). Was bedeutet der Schnittpunkt der beiden Graphen bei t &gt; 0?',
        abb: { achsen: AX_S, kurven: [k(s1, 0, 7, 's₁(t)', 's'), k(s2, 0, 7, 's₂(t)', 's')] },
        optionen: [
          'Bei t = 6 s und s = 28 m sind beide am gleichen Ort: Dort holt E-Bike 2 E-Bike 1 ein.',
          'Bei t = 6 s sind beide gleich schnell.',
          'Bei t = 3 s holt E-Bike 2 E-Bike 1 ein.',
          'Der Treffpunkt ist bei t = 0, danach fahren beide auseinander.'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: Im s(t)-Diagramm bedeutet ein Schnittpunkt gleicher Ort zur gleichen Zeit.',
          'Im s(t)-Diagramm heißt Schnittpunkt gleicher Ort. Gleich schnell hieße gleich steil. Bei 6 s ist die Parabel doppelt so steil wie die Gerade: ' + f(v2e) + ' m/s gegen ' + V1 + ' m/s.',
          'Bei 3 s sind beide nur gleich schnell (Schnittpunkt im v(t)-Diagramm). Im s(t)-Diagramm ist s₁(3 s) = 14 m und s₂(3 s) = 7 m.',
          'Bei t = 0 fährt E-Bike 1 an E-Bike 2 vorbei, das ist der Start. Der zweite Schnittpunkt bei 6 s ist der Treffpunkt.'
        ]
      },
      {
        id: 'einholen-u11', typ: 'rechnung', quelle: 'Blatt 2, A1 f',
        frage: 'E-Bike 2 beschleunigt weiter mit a₂ ≈ ' + A2 + ' m/s². Nach welcher Zeit t hat es 50 m zurückgelegt?',
        gegeben: '<p>s = 50 m, a₂ ≈ ' + A2 + ' m/s², aus dem Stand</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = 50 m, a = ' + A2 + ' m/s²<br>Gesucht: t in s', 'Gegeben: s = 50 m, a = ' + A2 + ' m/s<br>Gesucht: t in s', 'Gegeben: s = 50 m, a = ' + A2 + ' m/s²<br>Gesucht: v in m/s'], richtig: 0,
            optErkl: ['Richtig: Weg und Beschleunigung gegeben, gesucht ist die Zeit.', 'Schau auf die Einheit: Beschleunigung hat m/s², nicht m/s.', 'Gefragt ist die Zeit t, nicht die Geschwindigkeit.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Weg aus dem Stand mit konstanter Beschleunigung.', FE.gleichfoermig.erkl, 'Damit rechnest du eine Geschwindigkeit aus. Gegeben ist aber ein Weg.'] },
          { art: 'umstellen', optionen: ['t = √(2s/a)', 't = 2s/a', 't = √(s/a)'], richtig: 0,
            optErkl: ['Richtig: s = a/2·t² | ·2 | :a | √ ergibt t = √(2s/a).', FE.wurzelVergessen.erkl, 'Beim Umstellen nimmst du mal 2. Die 2 gehört unter die Wurzel: t = √(2s/a).'] },
          { art: 'einsetzen', optionen: ['t = √(2·50 m / ' + A2 + ' m/s²)', 't = 2·50 m / ' + A2 + ' m/s²', 't = √(50 m / ' + A2 + ' m/s²)'], richtig: 0,
            optErkl: ['Richtig: doppelter Weg durch die Beschleunigung, dann die Wurzel.', FE.wurzelVergessen.erkl + ' Das ergäbe ' + f(100 / 1.56) + ' s² statt einer Zeit.', 'Die 2 fehlt unter der Wurzel. Das ergäbe ' + f(Math.sqrt(50 / 1.56)) + ' s.'] }
        ],
        antwort: tF, auch: [P.tAusS(50, 1.56), 8], einheit: 's', formel: 't-beschl',
        loesung: '<p>s = a/2·t² | ·2 | :a | √<br>t = √(2s/a)<br>t = √(2·50 m / 1,56 m/s²) ≈ √(' + f(100 / 1.56, 1) + ' s²) ≈ 8,0 s</p>' +
          '<p>Mit dem genauen Wert a₂ = 56/36 m/s² kommt ' + f(tF) + ' s heraus. Beides ist richtig.</p>'
      },
      {
        id: 'einholen-u12', typ: 'rechnung', quelle: 'Blatt 2, A1 g',
        frage: 'Mit welcher Beschleunigung müsste E-Bike 2 losfahren, damit es E-Bike 1 (konstant ' + V1 + ' m/s) schon nach 5 s eingeholt hätte?',
        gegeben: '<p>v₁ = 28 m / 6 s ≈ ' + V1 + ' m/s, Einholen nach t = 5 s, E-Bike 2 aus dem Stand</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v₁ = ' + V1 + ' m/s, t = 5 s<br>Gesucht: a in m/s²', 'Gegeben: s = 28 m, t = 5 s<br>Gesucht: a in m/s²', 'Gegeben: v₁ = ' + V1 + ' m/s, t = 5 s<br>Gesucht: s in m'], richtig: 0,
            optErkl: ['Richtig: Die 28 m gehören zu 6 s. Für 5 s brauchst du den neuen Ort von E-Bike 1.', 'Die 28 m erreicht E-Bike 1 erst nach 6 s. Nach 5 s ist es noch nicht so weit.', 'Den Ort brauchst du als Zwischenschritt. Gesucht ist am Ende die Beschleunigung.'] },
          { art: 'formel', optionen: ['Erst s₁(5 s) = v₁·t, dann a = 2s/t²', 'a = 2s/t² mit s = 28 m', 'a = v₁/t'], richtig: 0,
            optErkl: ['Richtig: Einholen heißt gleicher Ort. Erst den Ort von E-Bike 1 nach 5 s, dann die Beschleunigung für diesen Weg.', 'Die 28 m gelten für 6 s. Nach 5 s ist E-Bike 1 erst bei ' + f(s5) + ' m. Das ergäbe ' + f(P.aAusS(28, 5)) + ' m/s².', 'Damit wäre E-Bike 2 nach 5 s nur gleich schnell wie E-Bike 1, nicht am gleichen Ort. Das ergäbe ' + f(v1 / 5) + ' m/s².'] },
          { art: 'einsetzen', optionen: ['a = 2·' + f(s5) + ' m / (5 s)²', 'a = ' + f(s5) + ' m / (5 s)²', 'a = 2·' + f(s5) + ' m / 5 s'], richtig: 0,
            optErkl: ['Richtig: doppelter Weg geteilt durch die Zeit zum Quadrat.', FE.zweiVergessen.erkl + ' Das ergäbe ' + f(s5 / 25) + ' m/s².', FE.quadratVergessen.erkl + ' Das ergäbe ' + f(2 * s5 / 5) + ' m/s.'] }
        ],
        antwort: aG, auch: [1.87], einheit: 'm/s²', formel: 'a-einholen',
        loesung: '<p>Ort von E-Bike 1 nach 5 s: s₁(5 s) = 28 m / 6 s · 5 s ≈ ' + f(s5) + ' m<br>' +
          's = a/2·t² ⇒ a = 2s/t²<br>a = 2·' + f(s5) + ' m / (5 s)² ≈ ' + f(aG) + ' m/s²</p>' +
          '<p>Kürzer: a = 2·v₁/t = 2 · ' + V1 + ' m/s : 5 s ≈ ' + f(2 * 4.67 / 5) + ' m/s² (Abkürzung; in der Arbeit über Gleichsetzen herleiten)</p>'
      },
      {
        id: 'einholen-u13', typ: 'rechnung', quelle: 'Blatt 1, A2 d',
        frage: 'Der Güterzug aus Aufgabe 1 fährt konstant 18,75 m/s. Bei t = 0 steht die Lok des Personenzugs direkt neben seiner Lok (s = 0 für beide). Der Personenzug fährt aus dem Stand los und beschleunigt gleichmäßig mit a = 0,5 m/s². Wann ist der Personenzug ebenso weit gefahren wie der Güterzug?',
        gegeben: '<p>Güterzug: v = 18,75 m/s, konstant<br>Personenzug: a = 0,5 m/s², aus dem Stand</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v = 18,75 m/s, a = 0,5 m/s²<br>Gesucht: t in s', 'Gegeben: v = 18,75 m/s, a = 0,5 m/s²<br>Gesucht: s in m', 'Gegeben: v = 18,75 m/s², a = 0,5 m/s²<br>Gesucht: t in s'], richtig: 0,
            optErkl: ['Richtig: Gefragt ist der Zeitpunkt, an dem beide gleich weit sind.', 'Gefragt ist „wann“, also die Zeit t. Den Treffpunkt s rechnest du danach.', 'Schau auf die Einheit: Der Güterzug hat eine Geschwindigkeit in m/s, keine Beschleunigung.'] },
          { art: 'formel', optionen: ['18,75 m/s · t = 0,25 m/s² · t²', '18,75 m/s = 0,5 m/s² · t', '18,75 m/s · t = 0,5 m/s² · t²'], richtig: 0,
            optErkl: ['Richtig: Beide Wege gleichsetzen. s_P = a/2·t² = 0,25 m/s² · t².', 'Das setzt die Geschwindigkeiten gleich. Dann sind beide nur gleich schnell (nach 37,5 s), aber nicht gleich weit.', FE.halbVergessen.erkl + ' Das ergäbe 37,5 s.'] },
          { art: 'umstellen', optionen: ['t·(0,25 m/s² · t − 18,75 m/s) = 0 ⇒ t = 0 oder t = 18,75 m/s / 0,25 m/s²', 't = √(18,75 m/s / 0,25 m/s²)', 't = 0,25 m/s² / 18,75 m/s'], richtig: 0,
            optErkl: ['Richtig: t ausklammern. t = 0 ist der Start, die zweite Lösung ist das Einholen.', 'Nach dem Ausklammern steht t nur noch einfach da, eine Wurzel brauchst du nicht. Das ergäbe ' + f(Math.sqrt(75)) + ' s.', FE.kehrwert.erkl] }
        ],
        antwort: zug.t, einheit: 's', formel: 'einholen',
        loesung: '<p>Güterzug: s_G = 18,75 m/s · t<br>Personenzug: s_P = 0,5 m/s² / 2 · t² = 0,25 m/s² · t²<br>' +
          'Gleichsetzen: 0,25 m/s² · t² = 18,75 m/s · t | − 18,75 m/s · t<br>' +
          't·(0,25 m/s² · t − 18,75 m/s) = 0<br>t = 0 (Start) oder 0,25 m/s² · t = 18,75 m/s | :0,25 m/s²<br>t = 75 s<br>' +
          'Treffpunkt: s = 18,75 m/s · 75 s = ' + f(zug.s) + ' m</p>' +
          '<p><em>Plus-Notiz:</em> Auf dem Blatt beschleunigt der Personenzug nur eine Minute lang, 75 s liegen darüber. Genau genommen fährt er ab 60 s mit 30 m/s weiter und ist erst nach 80 s gleichauf. Im Unterricht wird mit 75 s gerechnet.</p>'
      },
      {
        id: 'einholen-u14', typ: 'rechnung', quelle: 'Blatt 1, A2 d',
        frage: 'Personenzug und Güterzug sind nach 75 s gleich weit gefahren. Wie weit ist das?',
        gegeben: '<p>Güterzug: v = 18,75 m/s; Personenzug: a = 0,5 m/s²; t = 75 s</p>',
        schritte: [
          { art: 'formel', optionen: ['s = v·t für den Güterzug', 's = a·t² für den Personenzug', 'v = a·t für den Personenzug'], richtig: 0,
            optErkl: ['Richtig: Beim Güterzug ist es am einfachsten. Probe mit s = a/2·t² beim Personenzug liefert dasselbe.', FE.halbVergessen.erkl, 'Damit bekommst du die Geschwindigkeit des Personenzugs, keinen Weg.'] },
          { art: 'einsetzen', optionen: ['s = 18,75 m/s · 75 s', 's = 0,5 m/s² · (75 s)²', 's = 18,75 m/s : 75 s'], richtig: 0,
            optErkl: ['Richtig: Geschwindigkeit mal Zeit.', FE.halbVergessen.erkl + ' Das ergäbe ' + f(0.5 * 75 * 75) + ' m.', 'Weg ist Geschwindigkeit mal Zeit, nicht geteilt. Das ergäbe ' + f(18.75 / 75) + ' m/s².'] }
        ],
        antwort: zug.s, einheit: 'm', formel: 's-gleich',
        loesung: '<p>s = 18,75 m/s · 75 s = ' + f(zug.s) + ' m<br>Probe: s = 0,25 m/s² · (75 s)² = 0,25 m/s² · 5625 s² = ' + f(zug.s) + ' m</p>'
      },
      {
        id: 'einholen-u15', typ: 'wahl', quelle: 'Blatt 1, A2 d',
        frage: 'Beim Gleichsetzen 0,25 m/s² · t² = 18,75 m/s · t gibt es zwei Lösungen: t = 0 und t = 75 s. Was bedeutet t = 0?',
        optionen: [
          'Das ist der Start: Beide Loks stehen nebeneinander bei s = 0.',
          'Das ist ein Rechenfehler und wird gestrichen.',
          'Das ist der Moment, in dem beide gleich schnell sind.',
          'Das ist der Moment, in dem der Güterzug den Personenzug einholt.'
        ],
        richtig: 0,
        optErkl: [
          'Richtig: Zu Beginn sind beide am gleichen Ort. Die Gleichung findet diesen Punkt mit, das Einholen ist die zweite Lösung.',
          'Kein Fehler: Bei t = 0 sind beide wirklich am gleichen Ort. Für die Frage nach dem Einholen nimmst du aber die zweite Lösung.',
          'Gleich schnell sind beide, wenn 0,5 m/s² · t = 18,75 m/s ist, also bei 37,5 s. Bei t = 0 steht der Personenzug noch.',
          'Bei t = 0 sind beide nebeneinander, keiner holt ein. Danach ist der Güterzug vorn, bis der Personenzug ihn nach 75 s einholt.'
        ]
      },
      {
        id: 'einholen-u16', typ: 'reihenfolge',
        frage: 'Bring die Schritte beim Einholen in die richtige Reihenfolge.',
        schritte: [
          'Beide Funktionsterme aufstellen: s₁(t) = v₁·t und s₂(t) = a/2·t²',
          'Gleichsetzen: s₁(t) = s₂(t)',
          'Alles auf eine Seite bringen und t ausklammern',
          't = 0 ist der Start, die zweite Lösung ist der Einholzeitpunkt',
          'Treffpunkt: t in s₁(t) einsetzen'
        ],
        erkl: 'Erst gleichsetzen, dann ausklammern. Die Lösung t = 0 gehört zum Start, sie ist nicht gefragt.'
      }
    ],

    trainer: ['einholen', 'a-beschl', 'v-gleich'],

    gutachten: [
      {
        id: 'einholen-g1', typ: 'rechnung',
        frage: 'Die Pendlerin sagt: „Ich war nie schneller als der Kurier.“ Wie schnell war E-Bike 2 im Moment des Einholens (t = 6 s)?',
        gegeben: '<p>a₂ = 2·28 m / (6 s)² ≈ ' + A2 + ' m/s², aus dem Stand, t = 6 s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: a₂ = ' + A2 + ' m/s², t = 6 s<br>Gesucht: v₂ in m/s', 'Gegeben: a₂ = ' + A2 + ' m/s², t = 6 s<br>Gesucht: s₂ in m', 'Gegeben: a₂ = ' + A2 + ' m/s, t = 6 s<br>Gesucht: v₂ in m/s'], richtig: 0,
            optErkl: ['Richtig: Gesucht ist die Geschwindigkeit beim Einholen.', 'Der Weg ist schon bekannt (28 m). Gefragt ist die Geschwindigkeit.', 'Schau auf die Einheit: Beschleunigung hat m/s².'] },
          { art: 'formel', optionen: ['v = a·t', 'v = s/t', 's = a/2·t²'], richtig: 0,
            optErkl: ['Richtig: Geschwindigkeit aus dem Stand nach der Zeit t.', '28 m / 6 s ist nur die mittlere Geschwindigkeit von E-Bike 2 (und die von E-Bike 1). E-Bike 2 startet bei 0 und ist am Ende schneller als im Mittel.', 'Damit rechnest du einen Weg aus, keine Geschwindigkeit.'] },
          { art: 'einsetzen', optionen: ['v₂ = ' + A2 + ' m/s² · 6 s', 'v₂ = ' + A2 + ' m/s² · (6 s)²', 'v₂ = ' + A2 + ' m/s² / 6 s'], richtig: 0,
            optErkl: ['Richtig: Beschleunigung mal Zeit.', 'In v = a·t steht t nicht im Quadrat. Das Quadrat gehört zu s = a/2·t².', 'Mal, nicht geteilt: In jeder Sekunde kommen ' + A2 + ' m/s dazu.'] }
        ],
        antwort: v2e, auch: [1.56 * 6], einheit: 'm/s', formel: 'v-at',
        loesung: '<p>v₂ = a₂·t<br>v₂ = 56/36 m/s² · 6 s ≈ ' + f(v2e) + ' m/s (mit a₂ ≈ 1,56 m/s²: ' + f(1.56 * 6) + ' m/s)<br>' +
          f(v2e) + ' m/s · 3,6 ≈ ' + f(P.kmh(v2e)) + ' km/h</p><p>Vergleich: v₁ ≈ ' + V1 + ' m/s ≈ ' + V1KMH + ' km/h. Also v₂ = 2·v₁.</p>',
        satz: {
          optionen: [
            'Beim Einholen fuhr E-Bike 2 rund ' + f(v2e) + ' m/s ≈ ' + f(P.kmh(v2e)) + ' km/h, doppelt so schnell wie der Kurier. Die Aussage ist widerlegt.',
            'Beim Einholen fuhr E-Bike 2 rund ' + V1 + ' m/s, genauso schnell wie der Kurier. Die Aussage stimmt.',
            'Beim Einholen fuhr E-Bike 2 rund ' + f(v2e) + ' km/h, also langsamer als der Kurier. Die Aussage stimmt.'
          ],
          richtig: 0,
          optErkl: [
            'Richtig: Ergebnis mit Einheit, Vergleich und Urteil.',
            V1 + ' m/s ist die mittlere Geschwindigkeit. Am Ende ist E-Bike 2 doppelt so schnell.',
            'Die Einheit stimmt nicht: Das Ergebnis ist in m/s, in km/h sind es ' + f(P.kmh(v2e)) + ' km/h.'
          ]
        }
      },
      {
        id: 'einholen-g2', typ: 'rechnung',
        frage: 'Bei t = 3 s waren beide E-Bikes gleich schnell. Wie weit lag E-Bike 2 in diesem Moment hinter dem Kurier?',
        gegeben: '<p>v₁ ≈ ' + V1 + ' m/s, a₂ ≈ ' + A2 + ' m/s² (a₂/2 ≈ ' + H2 + ' m/s²), t = 3 s</p>',
        schritte: [
          { art: 'formel', optionen: ['Δs = s₁(3 s) − s₂(3 s) = v₁·t − a₂/2·t²', 'Δs = 0, weil beide gleich schnell sind', 'Δs = v₁·t − a₂·t²'], richtig: 0,
            optErkl: ['Richtig: Abstand = Ort von E-Bike 1 minus Ort von E-Bike 2.', 'Gleich schnell heißt nicht gleicher Ort. Bei 3 s ist der Abstand sogar am größten.', FE.halbVergessen.erkl + ' Dann käme 0 m heraus, als wären beide schon gleichauf.'] },
          { art: 'einsetzen', optionen: ['Δs = ' + V1 + ' m/s · 3 s − ' + H2 + ' m/s² · (3 s)²', 'Δs = ' + V1 + ' m/s · 3 s − ' + H2 + ' m/s² · 3 s', 'Δs = ' + V1 + ' m/s · 3 s + ' + H2 + ' m/s² · (3 s)²'], richtig: 0,
            optErkl: ['Richtig: 14 m minus 7 m.', FE.quadratVergessen.erkl, 'Den Abstand bekommst du als Differenz, nicht als Summe. Das ergäbe 21 m.'] }
        ],
        antwort: P.sGleich(v1, 3) - P.sBeschl(a2, 3), einheit: 'm', formel: 'abstand',
        loesung: '<p>s₁(3 s) = 28 m / 6 s · 3 s = 14 m<br>s₂(3 s) = 56/36 m/s² / 2 · (3 s)² = 7 m (mit ' + H2 + ' m/s² · 9 s² ≈ 7 m)<br>Δs = 14 m − 7 m = 7 m</p>' +
          '<p>Bis 3 s ist der Kurier schneller, der Abstand wächst. Danach ist E-Bike 2 schneller und holt auf. Bei 6 s ist der Abstand null.</p>'
      },
      {
        id: 'einholen-g3', typ: 'rechnung',
        frage: 'Nächster Morgen, gleiche Ampel: Der Kurier rollt mit konstant 5 m/s an der Haltelinie vorbei, genau als die Pendlerin mit a = 1,25 m/s² losfährt. Nach welcher Zeit holt sie ihn ein?',
        gegeben: '<p>Kurier: v₁ = 5 m/s, konstant<br>Pendlerin: a = 1,25 m/s², aus dem Stand</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v₁ = 5 m/s, a = 1,25 m/s²<br>Gesucht: t in s', 'Gegeben: v₁ = 5 m/s², a = 1,25 m/s²<br>Gesucht: t in s', 'Gegeben: v₁ = 5 m/s, a = 1,25 m/s²<br>Gesucht: v in m/s'], richtig: 0,
            optErkl: ['Richtig: Gesucht ist der Zeitpunkt des Einholens.', 'Schau auf die Einheit: Der Kurier hat eine Geschwindigkeit in m/s.', 'Gefragt ist „nach welcher Zeit“, also t.'] },
          { art: 'formel', optionen: ['5 m/s · t = 0,625 m/s² · t²', '5 m/s = 1,25 m/s² · t', '5 m/s · t = 1,25 m/s² · t²'], richtig: 0,
            optErkl: ['Richtig: gleicher Ort, also s₁ = s₂ mit a/2 = 0,625 m/s².', 'Das setzt die Geschwindigkeiten gleich: gleich schnell nach 4 s, aber noch nicht gleichauf.', FE.halbVergessen.erkl + ' Das ergäbe 4 s.'] },
          { art: 'umstellen', optionen: ['t·(0,625 m/s² · t − 5 m/s) = 0 ⇒ t = 5 m/s / 0,625 m/s²', 't = √(5 m/s / 0,625 m/s²)', 't = 0,625 m/s² / 5 m/s'], richtig: 0,
            optErkl: ['Richtig: t ausklammern, t = 0 ist der Start.', 'Nach dem Ausklammern steht t nur einfach da, keine Wurzel. Das ergäbe ' + f(Math.sqrt(8)) + ' s.', FE.kehrwert.erkl] }
        ],
        antwort: morgen.t, einheit: 's', formel: 'einholen',
        loesung: '<p>s₁ = 5 m/s · t, s₂ = 1,25 m/s² / 2 · t² = 0,625 m/s² · t²<br>0,625 m/s² · t² = 5 m/s · t<br>t·(0,625 m/s² · t − 5 m/s) = 0<br>' +
          't = 0 (Start) oder t = 5 m/s / 0,625 m/s² = ' + f(morgen.t) + ' s<br>Treffpunkt: s = 5 m/s · ' + f(morgen.t) + ' s = ' + f(morgen.s) + ' m</p>',
        satz: {
          optionen: [
            'Sie holt den Kurier nach ' + f(morgen.t) + ' s ein, ' + f(morgen.s) + ' m hinter der Haltelinie.',
            'Sie holt den Kurier nach 4 s ein, weil sie dann so schnell ist wie er.',
            'Sie holt den Kurier nie ein, weil er einen Vorsprung hat.'
          ],
          richtig: 0,
          optErkl: [
            'Richtig: Zeit und Ort des Treffpunkts.',
            'Nach 4 s ist sie nur gleich schnell, der Abstand ist dann am größten.',
            'Sie wird immer schneller, er nicht. Irgendwann holt sie ihn ein.'
          ]
        }
      },
      {
        id: 'einholen-g4', typ: 'wahl',
        frage: 'Welches Diagramm zeigt die Wege beider E-Bikes an der Lombardsbrücke richtig?',
        optionen: [
          bild(AX_S_KLEIN, [k(s1, 0, 7, 's₁(t)', 's'), k(s2, 0, 7, 's₂(t)', 's')]),
          bild(AX_S_KLEIN, [k(s1, 0, 7, 's₁(t)', 's'), k(function (t) { return a2 * t * t; }, 0, Math.sqrt(40 / a2), 's₂(t)', 's')]),
          bild(AX_S_KLEIN, [k(s2, 0, 7, 's₁(t)', 's'), k(s1, 0, 7, 's₂(t)', 's')]),
          bild(AX_V, [k(function () { return v1; }, 0, 7, 'v₁(t)', 'v'), k(function (t) { return a2 * t; }, 0, 7, 'v₂(t)', 'v')])
        ],
        richtig: 0,
        optErkl: [
          'Richtig: s₁ ist eine Gerade, s₂ eine Parabel. Sie schneiden sich bei 6 s und 28 m.',
          'Hier schneiden sich die Graphen schon bei 3 s. So sähe es mit s₂ = a₂·t² aus. ' + FE.halbVergessen.erkl,
          'Vertauscht: Der Kurier fährt konstant (Gerade), die Pendlerin beschleunigt (Parabel).',
          'Das ist das v(t)-Diagramm. Der Schnittpunkt dort (3 s) zeigt nur gleiche Geschwindigkeit, nicht den Treffpunkt.'
        ]
      }
    ],

    ergebnis: '<p><strong>Ergebnis:</strong> Der Kurier fuhr konstant ' + V1 + ' m/s ≈ ' + V1KMH + ' km/h. E-Bike 2 beschleunigte mit ' + A2 + ' m/s² und holte ihn nach 6 s und 28 m ein. ' +
      'In diesem Moment fuhr es ' + f(v2e) + ' m/s ≈ ' + f(P.kmh(v2e)) + ' km/h, doppelt so schnell wie der Kurier. Gleich schnell waren beide schon bei 3 s, da lag E-Bike 2 noch 7 m zurück. ' +
      'Die Aussage „Ich war nie schneller als der Kurier“ ist widerlegt.</p>'
  });
})();
