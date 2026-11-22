/* Akte 4: Diagramme s(t), v(t) und a(t).
   Fall: Fahrtenschreiber eines ICE nach der Abfahrt in Hamburg-Harburg (Anfahren, gleichförmige Fahrt, Bremsen bis zum Halt am Signal).
   Quellen: Tafel 17.11. (Graphen beider Bewegungsarten), Tafel S. 3 (v = a·t Ursprungsgerade, s = a/2·t² Parabel, a = 2 m/s²),
   Tafel S. 12 (Bremsen: v(t) fallende Gerade, s(t) nach unten offene Parabel). Plus: Tafel S. 11 (Trapez), Fläche unter v(t) = Weg.
   Alle Zahlen über W.physik gerechnet. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik, D = W.diagramm;
  W.akten = W.akten || [];
  var F = P.FEHLER;
  var f = function (x, n) { return P.fmt(x, n); };

  /* ---------- Fall: ICE-Fahrt laut Fahrtenschreiber ---------- */
  var A1 = 0.5, T1 = 80;                          // Anfahren aus dem Stand, 0 bis 80 s
  var V = P.vBeschl(A1, T1);                      // 40 m/s
  var V_KMH = P.kmh(V);                           // 144 km/h
  var S1 = P.sBeschl(A1, T1);                     // 1600 m
  var T2 = 200;                                   // Ende der gleichförmigen Fahrt
  var S2 = S1 + P.sGleich(V, T2 - T1);            // 1600 m + 4800 m = 6400 m
  var TB = 50;                                    // Bremsdauer 200 s bis 250 s
  var AB = P.aAusV(V, TB);                        // Betrag 0,8 m/s²
  var SB = P.sBrems(V, AB, TB);                   // 2000 m − 1000 m = 1000 m
  var T3 = T2 + TB;                               // 250 s, Halt am Signal
  var SE = S2 + SB;                               // 7400 m
  var TE = 300;                                   // Ende der Aufzeichnung
  var S1_FALSCH = V * T1;                         // Bericht: s = v·t mit Endgeschwindigkeit, 3200 m
  var SB_FALSCH = V * TB;                         // Bericht: 2000 m
  var T_AB = 225, V_AB = V - AB * (T_AB - T2);    // Ablesen mitten in der Bremsung: 20 m/s

  function sICE(t) {
    if (t <= T1) return P.sBeschl(A1, t);
    if (t <= T2) return S1 + P.sGleich(V, t - T1);
    if (t <= T3) return S2 + P.sBrems(V, AB, t - T2);
    return SE;
  }

  var X_ICE = { g: 't', e: 's', max: TE, schritt: 50 };
  var ABB_V = { achsen: { x: X_ICE, y: { g: 'v', e: 'm/s', max: 50, schritt: 10 } },
    kurven: [{ punkte: [[0, 0], [T1, V], [T2, V], [T3, 0], [TE, 0]], farbe: 'v', label: 'v(t)' }] };
  var ABB_S = { achsen: { x: X_ICE, y: { g: 's', e: 'm', max: 8000, schritt: 1000 } },
    kurven: [{ punkte: D.kurve(sICE, 0, TE, 120), farbe: 's', label: 's(t)' }], marken: [[T1, S1], [T2, S2], [T3, SE]] };
  var ABB_A = { achsen: { x: X_ICE, y: { g: 'a', e: 'm/s²', min: -1, max: 0.6, schritt: 0.2 } },
    // Waagerechte Stücke durchgezogen, die Sprünge (a ändert sich schlagartig) dünn gestrichelt.
    kurven: [[0, T1, A1], [T1, T2, 0], [T2, T3, -AB]].map(function (k) { return { punkte: [[k[0], k[2]], [k[1], k[2]]], farbe: 'a', label: false }; })
      .concat([[T1, A1, 0], [T2, 0, -AB], [T3, -AB, 0]].map(function (k) { return { punkte: [[k[0], k[1]], [k[0], k[2]]], farbe: 'a', label: false, gestrichelt: true }; }))
      .concat([{ punkte: [[T3, 0], [TE, 0]], farbe: 'a', label: 'a(t)' }]) };

  /* ---------- Tafel S. 3: a = 2 m/s² aus dem Stand ---------- */
  var A3 = 2;
  var ABB_V3 = { achsen: { x: { g: 't', e: 's', max: 4, schritt: 1 }, y: { g: 'v', e: 'm/s', max: 8, schritt: 2 } },
    kurven: [{ punkte: D.kurve(function (t) { return P.vBeschl(A3, t); }, 0, 4, 4), farbe: 'v', label: 'v(t)' }], marken: [[1, 2], [3, 6]] };
  var A_STEIG = P.aAusV(6 - 2, 3 - 1);            // 2 m/s²

  /* ---------- Steigung von s(t): gleichförmige Fahrt, Uhr neu gestartet ---------- */
  var ABB_SG = { achsen: { x: { g: 't', e: 's', max: 50, schritt: 10 }, y: { g: 's', e: 'm', max: 2000, schritt: 400 } },
    kurven: [{ punkte: D.kurve(function (t) { return P.sGleich(V, t); }, 0, 50, 5), farbe: 's', label: 's(t)' }], marken: [[10, 400], [40, 1600]] };
  var V_STEIG = P.vGleich(1600 - 400, 40 - 10);   // 40 m/s

  /* ---------- Tafel S. 12: Bremsen des ICE, Uhr bei Bremsbeginn auf null ---------- */
  var ABB_SB = { achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 's', e: 'm', max: 1200, schritt: 200 } },
    kurven: [{ punkte: D.kurve(function (t) { return t <= TB ? P.sBrems(V, AB, t) : SB; }, 0, 60, 60), farbe: 's', label: 's(t)' }], marken: [[TB, SB]] };

  /* ---------- Plus, Tafel S. 11: Trapez ---------- */
  var VT = P.ms(300);                             // 83,33 m/s
  var AT1 = P.aAusV(P.ms(135), 60);               // 0,625 m/s² (Tafel S. 10)
  var TT1 = VT / AT1;                             // 133,33 s
  var TTB = 112.5;                                // Bremszeit an der Tafel
  var ATB = VT / TTB;                             // 0,74074 m/s² (Betrag)
  var TT = 480;
  var TTK = TT - TT1 - TTB;                       // ≈ 234,17 s
  var ST1 = P.sBeschl(AT1, TT1);                  // ≈ 5555,56 m (Dreieck)
  var STK = P.sGleich(VT, TTK);                   // ≈ 19513,89 m (Rechteck)
  var STB = P.sBrems(VT, ATB, TTB);               // 4687,5 m (Dreieck)
  var ST = ST1 + STK + STB;                       // ≈ 29756,94 m
  var ABB_TRAPEZ = { achsen: { x: { g: 't', e: 's', max: 500, schritt: 100 }, y: { g: 'v', e: 'm/s', max: 100, schritt: 20 } },
    kurven: [{ punkte: [[0, 0], [TT1, VT], [TT1 + TTK, VT], [TT, 0]], farbe: 'v', label: 'v(t)' }] };

  var MINI_TAB = '<table style="width:100%;table-layout:fixed"><tr><th style="width:28%"></th><th>s(t)</th><th>v(t)</th><th>a(t)</th></tr>' +
    [['gleichförmig', 'gleich'], ['beschleunigt aus dem Stand', 'beschl'], ['Bremsen bis zum Stillstand', 'brems']].map(function (z) {
      return '<tr><th>' + z[0] + '</th>' + ['s', 'v', 'a'].map(function (g) { return '<td>' + D.mini(g + '-' + z[1]) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</table>';

  W.akten.push({
    id: 'diagramme', nr: 4, titel: 'Diagramme: s(t), v(t) und a(t)', fall: 'Fahrtenschreiber eines ICE',

    auftrag: {
      text: '<p>Ein ICE fährt nach einem Halt in Hamburg-Harburg an, fährt eine Weile gleichmäßig und hält dann vor einem roten Signal. Niemand kam zu Schaden. ' +
        'Das Eisenbahnunternehmen will aber den Fahrtbericht prüfen lassen, bevor er ins Archiv geht.</p>' +
        '<p>Der Fahrtenschreiber hat drei Ausdrucke geliefert: s(t), v(t) und a(t). Auf Ausdruck B ist die Beschriftung der Hochachse abgerissen. ' +
        'Daneben liegt der Bericht eines Kollegen mit drei Angaben.</p>',
      daten: '<table><tr><th>Abschnitt</th><th>Zeit</th><th>v(t)-Ausdruck</th></tr>' +
        '<tr><th>Anfahren</th><td>0 bis ' + T1 + ' s</td><td>v steigt gleichmäßig von 0 auf ' + f(V) + ' m/s</td></tr>' +
        '<tr><th>gleichmäßige Fahrt</th><td>' + T1 + ' bis ' + T2 + ' s</td><td>v = ' + f(V) + ' m/s</td></tr>' +
        '<tr><th>Bremsen</th><td>' + T2 + ' bis ' + T3 + ' s</td><td>v fällt gleichmäßig auf 0</td></tr>' +
        '<tr><th>Halt am Signal</th><td>' + T3 + ' bis ' + TE + ' s</td><td>v = 0</td></tr></table>' +
        '<table><tr><th>Bericht</th><th>Angabe</th></tr>' +
        '<tr><th>1</th><td>„Anfahren mit 0,5 m/s², nach 80 s 144 km/h.“</td></tr>' +
        '<tr><th>2</th><td>„Anfahrweg bis 144 km/h: 3,2 km.“</td></tr>' +
        '<tr><th>3</th><td>„Bremsweg bis zum Halt am Signal: 2,0 km.“</td></tr></table>',
      chefin: 'Akte 4. Drei Ausdrucke, eine abgerissene Achse und ein Bericht mit glatten Zahlen. Lies die Graphen, bevor du dem Bericht glaubst.',
      leitfrage: 'Passen die drei Angaben im Fahrtbericht zu den Diagrammen des Fahrtenschreibers, und was zeigt Ausdruck B?'
    },

    karten: [
      { titel: 'Ein Diagramm lesen',
        text: '<p>Der Fahrtenschreiber zeichnet die Geschwindigkeit über der Zeit auf. Nach rechts steht immer die Zeit t in s, nach oben die Größe, die sich mit der Zeit ändert, hier v in m/s. ' +
          'Jede Achse hat Größe, Einheit und eine gleichmäßige Skala.</p>' +
          '<p>Ablesen: Bei t = 50 s senkrecht hoch bis zum Graphen, dann waagerecht nach links zur v-Achse: 25 m/s. ' +
          'Zwischen ' + T1 + ' s und ' + T2 + ' s fährt der ICE konstant ' + f(V) + ' m/s = ' + f(V_KMH) + ' km/h, ab ' + T3 + ' s steht er.</p>',
        abb: { achsen: ABB_V.achsen, kurven: ABB_V.kurven, marken: [[50, 25]] },
        merk: 'Erst die Achsen lesen (Größe und Einheit), dann die Form des Graphen, dann die Werte.',
        achtung: '<p>Eine Ursprungsgerade bedeutet in s(t) etwas anderes als in v(t). Schau immer zuerst, was an der Hochachse steht.</p>' },

      { titel: 'Drei Bewegungsarten, neun Graphen', demo: 'labor:anfahren',
        text: '<p>Tafel 17.11.: Gleichförmige Bewegung: a = 0, v = v₀ = konst, s(t) = v₀·t ist eine Gerade. ' +
          'Gleichmäßig beschleunigte Bewegung aus dem Stand: a = a₀ = konst, v(t) = a₀·t ist eine Ursprungsgerade, s(t) = a₀/2·t² eine Parabel. ' +
          'Tafel S. 12: Beim gleichmäßigen Abbremsen fällt v(t) als Gerade bis zur t-Achse, s(t) ist eine nach unten offene Parabel.</p>' + MINI_TAB,
        merk: 'Gleichförmig: s Gerade, v waagerecht, a = 0. Beschleunigt aus dem Stand: s Parabel, v Ursprungsgerade, a waagerecht über der t-Achse. ' +
          'Bremsen: s nach unten offene Parabel, v fallende Gerade, a waagerecht unter der t-Achse.',
        achtung: '<p>Eine waagerechte Linie oberhalb der t-Achse kann v(t) bei konstanter Fahrt sein oder a(t) beim Anfahren. Nur die Beschriftung der Hochachse entscheidet.</p>' },

      { titel: 'Steigung: aus s(t) wird v, aus v(t) wird a',
        text: '<p>Die Steigung eines Graphen bestimmst du mit einem Steigungsdreieck: zwei Punkte auf dem Graphen wählen, die Differenz nach oben durch die Differenz nach rechts teilen.</p>' +
          '<p>Steigung von s(t): v = Δs/Δt. Steigung von v(t): a = Δv/Δt.</p>' +
          '<p>Tafel S. 3 mit a = 2 m/s²: Die Punkte (1 s | 2 m/s) und (3 s | 6 m/s) liegen auf v(t). ' +
          'a = (6 m/s − 2 m/s) / (3 s − 1 s) = 4 m/s / 2 s = ' + f(A_STEIG) + ' m/s².</p>',
        abb: ABB_V3,
        merk: 'Steiler s(t)-Graph: schnell. Steiler v(t)-Graph: starke Beschleunigung. Waagerecht: Steigung null.',
        achtung: '<p>Für die Steigung brauchst du Differenzen. Ein einzelner abgelesener Wert ist nicht die Steigung. Nur bei einer Ursprungsgeraden darfst du den Ursprung als zweiten Punkt nehmen.</p>' },

      { titel: 'Anfahren: Ursprungsgerade und Parabel',
        text: '<p>Aus dem Stand gilt v = a·t: Der v(t)-Graph ist eine Ursprungsgerade mit der Steigung a. Für den Weg gilt s = a/2·t²: Der s(t)-Graph ist eine nach oben offene Halbparabel.</p>' +
          '<p>Tafel S. 3 mit a = 2 m/s²: Nach 1 s, 2 s und 3 s ist v = 2 m/s, 4 m/s und 6 m/s, der Weg s = 1 m, 4 m und 9 m. ' +
          'Die Parabel wird immer steiler, weil das Fahrzeug immer schneller wird. Ihre Steigung ist in jedem Moment die Geschwindigkeit.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 4, schritt: 1 }, y: { g: 's', e: 'm', max: 16, schritt: 2 } },
          kurven: [{ punkte: D.kurve(function (t) { return P.sBeschl(A3, t); }, 0, 4), farbe: 's', label: 's(t)' }], marken: [[1, 1], [2, 4], [3, 9]] },
        merk: 'v(t) = a·t: Ursprungsgerade. s(t) = a/2·t²: Parabel. a(t) = a₀: waagerechte Linie.',
        achtung: '<p>Doppelte Zeit heißt beim Anfahren doppelte Geschwindigkeit, aber vierfacher Weg (t steht im Quadrat).</p>' },

      { titel: 'Bremsen: fallende Gerade, Parabel nach unten offen',
        text: '<p>Tafel S. 12: Beim gleichmäßigen Abbremsen gilt v = v₀ − a·t. Der v(t)-Graph ist eine fallende Gerade, die beim Stillstand die t-Achse erreicht. ' +
          'Für den Weg gilt s = v₀·t − a/2·t², eine nach unten offene Parabel. Sie wird immer flacher und ist am Scheitel waagerecht, dort steht das Fahrzeug.</p>' +
          '<p>ICE ab Bremsbeginn (Uhr auf null gesetzt): v₀ = ' + f(V) + ' m/s, a = ' + f(AB) + ' m/s² (Betrag). Er steht nach ' + f(TB) + ' s. ' +
          'Bremsweg: s = ' + f(V) + ' m/s · ' + f(TB) + ' s − ' + f(AB / 2) + ' m/s² · (' + f(TB) + ' s)² = ' + f(V * TB) + ' m − ' + f(AB / 2 * TB * TB) + ' m = ' + f(SB) + ' m.</p>',
        abb: ABB_SB,
        merk: 'Beim Bremsen ist die Beschleunigung negativ (Tafel S. 11: a = −0,74074 m/s²). In v = v₀ − a·t steht a als Betrag, das Minus steckt im Rechenzeichen.',
        achtung: '<p>Der s(t)-Graph fällt beim Bremsen nicht, er wird nur flacher. Der Zug fährt weiter vorwärts, nur immer langsamer.</p>' },

      { titel: 'Achsen beschriften und skalieren',
        text: '<p>Auf den Blättern steht oft „Beschrifte das Diagramm sinnvoll“. Das heißt:</p>' +
          '<p>1. Nach rechts die Zeit: t in s. Nach oben die Größe mit Einheit: s in m, v in m/s oder a in m/s².<br>' +
          '2. Gleichmäßige Skala in glatten Schritten (zum Beispiel 1, 2, 5, 10, 50).<br>' +
          '3. Der größte Wert muss draufpassen, der Graph soll das Blatt aber gut ausnutzen.<br>' +
          '4. Den Graphen beschriften: s(t), v(t) oder a(t).</p>' +
          '<p>Beim a(t)-Ausdruck des ICE reicht die Hochachse von −1 m/s² bis 0,6 m/s², weil beim Bremsen negative Werte vorkommen. ' +
          'Die senkrechten Stücke sind Sprünge: Dort ändert sich a schlagartig, zum Beispiel bei t = ' + T1 + ' s von ' + f(A1) + ' m/s² auf 0.</p>',
        abb: ABB_A,
        merk: 'Größe in Einheit an jede Achse, glatte Schritte, der größte Wert passt drauf.' },

      { titel: 'Trapez: Fläche unter v(t) ist der Weg', plus: true,
        text: '<p>Tafel S. 11: Ein Zug fährt in ' + f(TT1) + ' s aus dem Stand auf 300 km/h = ' + f(VT) + ' m/s, fährt dann konstant und bremst mit a = −0,74074 m/s² in ' + f(TTB) + ' s bis zum Stillstand. ' +
          'Die ganze Fahrt dauert ' + TT + ' s, die konstante Fahrt also ' + TT + ' s − ' + f(TT1) + ' s − ' + f(TTB) + ' s ≈ ' + f(TTK) + ' s (an der Tafel 234 s). Der v(t)-Graph ist ein Trapez.</p>' +
          '<p>Die Fläche unter v(t) ist der zurückgelegte Weg: Dreieck beim Anfahren ½ · ' + f(TT1) + ' s · ' + f(VT) + ' m/s ≈ ' + f(ST1, 0) + ' m, ' +
          'Rechteck ' + f(TTK) + ' s · ' + f(VT) + ' m/s ≈ ' + f(STK, 0) + ' m, Dreieck beim Bremsen ½ · ' + f(TTB) + ' s · ' + f(VT) + ' m/s ≈ ' + f(STB, 0) + ' m. ' +
          'Zusammen rund ' + f(ST / 1000) + ' km.</p>',
        abb: ABB_TRAPEZ,
        merk: 'Fläche unter v(t) = Weg. Rechteck: Höhe mal Breite. Dreieck: die Hälfte davon, also s = ½·v·t = a/2·t².' }
    ],

    ueben: [
      { id: 'diagramme-u1', typ: 'wahl', quelle: 'Tafel 17.11.',
        frage: 'Tafel 17.11.: Zwischen t = ' + T1 + ' s und t = ' + T2 + ' s fährt der ICE mit konstant ' + f(V_KMH) + ' km/h. Welcher v(t)-Graph passt zu diesem Abschnitt?',
        optionen: [D.mini('v-gleich'), D.mini('v-beschl'), D.mini('v-ruhe'), D.mini('a-beschl')],
        richtig: 0,
        optErkl: ['Richtig: v = v₀ = konst. Der v(t)-Graph ist eine waagerechte Linie oberhalb der t-Achse.',
          'Eine steigende Gerade heißt: Der Zug wird gleichmäßig schneller. Das ist das Anfahren, nicht die Fahrt mit konstanter Geschwindigkeit.',
          'v = 0 auf der t-Achse heißt: Der Zug steht. Er fährt aber ' + f(V_KMH) + ' km/h.',
          'Die Form stimmt, aber an der Hochachse steht a, nicht v. Dieser Graph zeigt eine konstante Beschleunigung, also das Anfahren.'] },

      { id: 'diagramme-u2', typ: 'wahl', quelle: 'Tafel S. 3',
        frage: 'Tafel S. 3: Der ICE fährt aus dem Stand gleichmäßig beschleunigt an, s = a/2·t². Welcher s(t)-Graph passt zum Anfahren?',
        optionen: [D.mini('s-beschl'), D.mini('s-gleich'), D.mini('s-brems'), D.mini('v-beschl')],
        richtig: 0,
        optErkl: ['Richtig: s = a/2·t² ist eine nach oben offene Halbparabel. Sie wird immer steiler, weil der Zug immer schneller wird.',
          'Eine Gerade gehört zur gleichförmigen Bewegung (s = v·t). Beim Anfahren legt der Zug in jeder Sekunde mehr Weg zurück, der Graph muss steiler werden.',
          'Ein Graph, der immer flacher wird, gehört zum Bremsen (Tafel S. 12). Beim Anfahren wird er immer steiler.',
          'Die Ursprungsgerade gehört zu v(t) beim Anfahren. An der Hochachse steht v, gefragt ist s(t).'] },

      { id: 'diagramme-u3', typ: 'mehrfach', quelle: ['Tafel S. 12', 'Tafel 17.11.'],
        frage: 'Tafel S. 12: Ab t = ' + T2 + ' s bremst der ICE gleichmäßig bis zum Stillstand (Uhr und Weg ab Bremsbeginn auf null). Wähle alle Graphen, die zu dieser Bremsung passen.',
        optionen: ['s-gleich', 'v-gleich', 'a-gleich', 's-beschl', 'v-beschl', 'a-beschl', 's-brems', 'v-brems', 'a-brems'].map(function (a) { return D.mini(a); }),
        richtig: [6, 7, 8],
        optErkl: ['Eine Gerade in s(t) heißt konstante Geschwindigkeit. Beim Bremsen wird s(t) immer flacher.',
          'Waagerecht in v(t) heißt konstante Geschwindigkeit. Beim Bremsen fällt v(t).',
          'a = 0 gehört zur gleichförmigen Bewegung. Beim Bremsen ist a negativ.',
          'Ein immer steilerer s(t)-Graph heißt: Der Zug wird schneller. Das ist das Anfahren.',
          'Eine steigende Gerade in v(t) gehört zum Anfahren. Beim Bremsen fällt die Gerade.',
          'Eine waagerechte Linie oberhalb der t-Achse heißt a > 0, der Zug wird schneller. Beim Bremsen liegt a(t) unterhalb der t-Achse.',
          'Richtig: s(t) ist eine nach unten offene Parabel. Sie wird immer flacher und ist am Scheitel waagerecht, dort steht der Zug.',
          'Richtig: v(t) ist eine fallende Gerade bis zur t-Achse, v = v₀ − a·t.',
          'Richtig: Die Beschleunigung ist konstant und negativ. a(t) ist eine waagerechte Linie unterhalb der t-Achse.'] },

      { id: 'diagramme-u4', typ: 'zuordnen', quelle: ['Tafel 17.11.', 'Tafel S. 12'],
        frage: 'Ordne jedem Graphen die passende Bewegung zu.',
        paare: [['s(t) ist eine Ursprungsgerade.', 'gleichförmige Bewegung'],
          ['v(t) ist eine Ursprungsgerade.', 'gleichmäßig beschleunigt aus dem Stand'],
          ['v(t) ist eine fallende Gerade bis zur t-Achse.', 'gleichmäßiges Abbremsen bis zum Stillstand'],
          ['s(t) ist eine waagerechte Linie.', 'Stillstand: der Zug steht']],
        erkl: 'Erst auf die Hochachse schauen, dann auf die Form. Eine Ursprungsgerade in s(t) heißt konstante Geschwindigkeit, in v(t) heißt sie konstante Beschleunigung. ' +
          'Ein waagerechter s(t)-Graph heißt: Der Ort ändert sich nicht, der Zug steht.' },

      { id: 'diagramme-u5', typ: 'zahl',
        frage: 'Ablesen: Der Ausdruck zeigt v(t) der ganzen ICE-Fahrt. Wie schnell war der ICE bei t = ' + T_AB + ' s?',
        abb: ABB_V,
        antwort: V_AB, tol: 1, einheit: 'm/s',
        erkl: 'Bei t = ' + T_AB + ' s senkrecht hoch bis zum Graphen, dann waagerecht zur v-Achse: ' + f(V_AB) + ' m/s, das sind ' + f(P.kmh(V_AB)) + ' km/h. ' +
          'Der Punkt liegt mitten in der Bremsung, ' + f(T_AB - T2) + ' s nach Bremsbeginn. Probe: v = v₀ − a·t = 40 m/s − 0,8 m/s² · ' + f(T_AB - T2) + ' s = ' + f(V_AB) + ' m/s.' },

      { id: 'diagramme-u6', typ: 'rechnung', quelle: 'Tafel S. 3',
        frage: 'Tafel S. 3: Bestimme aus dem v(t)-Graphen die Beschleunigung. Nimm die beiden markierten Punkte.',
        abb: ABB_V3,
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v₁ = 2 m/s bei t₁ = 1 s, v₂ = 6 m/s bei t₂ = 3 s<br>Gesucht: a in m/s²',
            'Gegeben: v₁ = 1 m/s bei t₁ = 2 s, v₂ = 3 m/s bei t₂ = 6 s<br>Gesucht: a in m/s²',
            'Gegeben: v₁ = 2 m/s bei t₁ = 1 s, v₂ = 6 m/s bei t₂ = 3 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Für jeden Punkt t auf der Rechtsachse und v auf der Hochachse ablesen.',
              'Du hast die Achsen vertauscht. Nach rechts steht t in s, nach oben v in m/s.',
              'Die Steigung des v(t)-Graphen ist die Beschleunigung, nicht der Weg.'] },
          { art: 'formel', optionen: ['a = Δv/Δt', 'v = Δs/Δt', 's = a/2·t²'], richtig: 0,
            optErkl: ['Richtig: Die Steigung des v(t)-Graphen ist a = Δv/Δt.',
              'Δs/Δt ist die Steigung eines s(t)-Graphen. Hier ist v über t aufgetragen.',
              'Damit rechnest du einen Weg aus. Gesucht ist die Steigung.'] },
          { art: 'einsetzen', optionen: ['a = (6 m/s − 2 m/s) / (3 s − 1 s)', 'a = (6 m/s − 2 m/s) / 3 s', 'a = (3 s − 1 s) / (6 m/s − 2 m/s)'], richtig: 0,
            optErkl: ['Richtig: Δv = 4 m/s und Δt = 2 s.',
              F.messwertStattDifferenz.erkl + ' Für Δt gilt 3 s − 1 s = 2 s. So ergäbe sich ≈ ' + f(4 / 3) + ' m/s².',
              F.kehrwert.erkl + ' Das ergäbe ' + f(2 / 4) + '.'] }
        ],
        antwort: A_STEIG, einheit: 'm/s²', formel: 'a-dv',
        loesung: '<p>a = Δv/Δt = (v₂ − v₁)/(t₂ − t₁)</p><p>a = (6 m/s − 2 m/s) / (3 s − 1 s) = 4 m/s / 2 s = 2 m/s²</p>' +
          '<p>Weil der Graph im Ursprung beginnt, geht auch a = v/t = 6 m/s / 3 s = 2 m/s². Wie an der Tafel: In jeder Sekunde kommen 2 m/s dazu.</p>' },

      { id: 'diagramme-u7', typ: 'rechnung', quelle: 'Tafel 17.11.',
        frage: 'Tafel 17.11.: Ausschnitt aus dem s(t)-Ausdruck während der gleichförmigen Fahrt. Uhr und Weg sind am Anfang des Ausschnitts auf null gesetzt. Bestimme aus den markierten Punkten die Geschwindigkeit des ICE.',
        abb: ABB_SG,
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s₁ = 400 m bei t₁ = 10 s, s₂ = 1600 m bei t₂ = 40 s<br>Gesucht: v in m/s',
            'Gegeben: s₁ = 400 m bei t₁ = 10 s, s₂ = 1600 m bei t₂ = 40 s<br>Gesucht: a in m/s²',
            'Gegeben: s₁ = 10 m bei t₁ = 400 s, s₂ = 40 m bei t₂ = 1600 s<br>Gesucht: v in m/s'],
            richtig: 0,
            optErkl: ['Richtig: Die Steigung des s(t)-Graphen ist die Geschwindigkeit.',
              'Die Steigung eines s(t)-Graphen ist eine Geschwindigkeit. Die Beschleunigung ist die Steigung von v(t).',
              'Du hast die Achsen vertauscht. Nach rechts steht t in s, nach oben s in m.'] },
          { art: 'formel', optionen: ['v = Δs/Δt', 'a = Δv/Δt', 's = a/2·t²'], richtig: 0,
            optErkl: ['Richtig: v = Δs/Δt ist die Steigung der Geraden.',
              'Das ist die Steigung eines v(t)-Graphen. Hier ist s über t aufgetragen.',
              'Die Parabel-Formel gilt beim Anfahren. Hier ist der Graph eine Gerade, der Zug fährt gleichförmig.'] },
          { art: 'einsetzen', optionen: ['v = (1600 m − 400 m) / (40 s − 10 s)', 'v = 1600 m / (40 s − 10 s)', 'v = (40 s − 10 s) / (1600 m − 400 m)'], richtig: 0,
            optErkl: ['Richtig: Δs = 1200 m und Δt = 30 s.',
              F.messwertStattDifferenz.erkl + ' Für Δs gilt 1600 m − 400 m = 1200 m. So ergäbe sich ≈ ' + f(1600 / 30) + ' m/s.',
              F.kehrwert.erkl + ' Das ergäbe ' + f(30 / 1200, 3) + '.'] }
        ],
        antwort: V_STEIG, einheit: 'm/s', formel: 'v-mittel',
        loesung: '<p>v = Δs/Δt = (s₂ − s₁)/(t₂ − t₁)</p><p>v = (1600 m − 400 m) / (40 s − 10 s) = 1200 m / 30 s = ' + f(V_STEIG) + ' m/s</p>' +
          '<p>In km/h: ' + f(V_STEIG) + ' m/s · 3,6 = ' + f(P.kmh(V_STEIG)) + ' km/h. Das ist die Höhe der waagerechten Linie im v(t)-Ausdruck.</p>' },

      { id: 'diagramme-u8', typ: 'rechnung', quelle: 'Tafel S. 3',
        frage: 'Tafel S. 3: An der Tafel ist für a = 2 m/s² (aus dem Stand) die Parabel s(t) gezeichnet. Welcher Weg s gehört zu t = 3 s? Rechne nach.',
        gegeben: '<p>a = 2 m/s², t = 3 s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: a = 2 m/s², t = 3 s<br>Gesucht: s in m', 'Gegeben: a = 2 m/s², t = 3 s<br>Gesucht: v in m/s', 'Gegeben: a = 2 m/s, t = 3 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Die Parabel ist der s(t)-Graph, gesucht ist der Weg.', 'Die Parabel zeigt den Weg s, nicht die Geschwindigkeit v.', 'Schau auf die Einheit: a = 2 m/s², nicht 2 m/s.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt s = a/2·t².', F.gleichfoermig.erkl, 'Damit rechnest du die Geschwindigkeit aus, das ist die Gerade an der Tafel. Gesucht ist der Weg.'] },
          { art: 'einsetzen', optionen: ['s = 2 m/s² / 2 · (3 s)²', 's = 2 m/s² · (3 s)²', 's = 2 m/s² / 2 · 3 s'], richtig: 0,
            optErkl: ['Richtig: 1 m/s² · 9 s² ergibt 9 m.',
              F.halbVergessen.erkl + ' Das ergäbe ' + f(A3 * 9) + ' m.',
              F.quadratVergessen.erkl + ' Dann bleibt als Einheit m/s übrig, kein Weg.'] }
        ],
        antwort: P.sBeschl(A3, 3), einheit: 'm', formel: 's-beschl',
        loesung: '<p>s = a/2·t²</p><p>s = 2 m/s² / 2 · (3 s)² = 1 m/s² · 9 s² = ' + f(P.sBeschl(A3, 3)) + ' m</p>' +
          '<p>Genauso: nach 1 s 1 m, nach 2 s 4 m. Die Werte wachsen mit t², darum ist der Graph eine Parabel.</p>' },

      { id: 'diagramme-u9', typ: 'punkte', quelle: 'Tafel S. 3',
        frage: 'Tafel S. 3: Zeichne den Graphen von v(t) = 2 m/s² · t (aus dem Stand). Setze die Punkte für t = 1 s, 2 s, 3 s und 4 s.',
        achsen: { x: { g: 't', e: 's', max: 4, schritt: 1 }, y: { g: 'v', e: 'm/s', max: 10, schritt: 2 } },
        xs: [1, 2, 3, 4],
        soll: [1, 2, 3, 4].map(function (t) { return P.vBeschl(A3, t); }),
        kurve: D.kurve(function (t) { return P.vBeschl(A3, t); }, 0, 4, 4),
        erkl: 'v = a·t: In jeder Sekunde kommen 2 m/s dazu (2, 4, 6, 8 m/s). Die Punkte liegen auf einer Ursprungsgeraden mit der Steigung 2 m/s².' },

      { id: 'diagramme-u10', typ: 'punkte', quelle: 'Tafel S. 3',
        frage: 'Tafel S. 3: Zeichne den Graphen von s(t) = a/2·t² mit a = 2 m/s², also s(t) = 1 m/s² · t². Setze die Punkte für t = 1 s, 2 s, 3 s und 4 s.',
        achsen: { x: { g: 't', e: 's', max: 4, schritt: 1 }, y: { g: 's', e: 'm', max: 18, schritt: 2 } },
        xs: [1, 2, 3, 4],
        soll: [1, 2, 3, 4].map(function (t) { return P.sBeschl(A3, t); }),
        kurve: D.kurve(function (t) { return P.sBeschl(A3, t); }, 0, 4),
        erkl: 'Die Werte wachsen mit t²: 1 m, 4 m, 9 m, 16 m. Die Abstände zwischen den Punkten werden immer größer, der Graph ist eine Halbparabel und wird immer steiler.' },

      { id: 'diagramme-u11', typ: 'punkte', quelle: 'Tafel S. 12',
        frage: 'Tafel S. 12: Der ICE bremst gleichmäßig von 40 m/s bis zum Stillstand, v(t) = 40 m/s − 0,8 m/s² · t (Uhr bei Bremsbeginn auf null). Setze die Punkte für t = 0 s, 10 s, …, 50 s.',
        achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 'v', e: 'm/s', max: 48, schritt: 8 } },
        xs: [0, 10, 20, 30, 40, 50],
        soll: [0, 10, 20, 30, 40, 50].map(function (t) { return V - AB * t; }),
        kurve: D.kurve(function (t) { return V - AB * t; }, 0, TB, 5),
        erkl: 'v = v₀ − a·t mit v₀ = 40 m/s und a = 0,8 m/s²: In 10 s nimmt v um 8 m/s ab (40, 32, 24, 16, 8, 0). Die fallende Gerade erreicht bei t = 50 s die t-Achse, dort steht der Zug.' },

      { id: 'diagramme-u12', typ: 'wahl',
        frage: 'Beschrifte das Diagramm sinnvoll: Du willst v(t) der ganzen ICE-Fahrt zeichnen (v bis 40 m/s, t bis 300 s). Nach oben hast du 10 Kästchen. Welche Beschriftung der Hochachse ist sinnvoll?',
        optionen: ['v in m/s, 1 Kästchen = 5 m/s (0 bis 50 m/s)', 'v in m/s, 1 Kästchen = 1 m/s (0 bis 10 m/s)',
          'v in m/s, 1 Kästchen = 50 m/s (0 bis 500 m/s)', 'v in km/h, 1 Kästchen = 5 km/h (0 bis 50 km/h)'],
        richtig: 0,
        optErkl: ['Richtig: Der größte Wert 40 m/s passt drauf, und der Graph nutzt fast die ganze Höhe. In 5er-Schritten lässt sich gut ablesen.',
          'Dann endet die Achse bei 10 m/s. Der Graph mit 40 m/s passt nicht aufs Blatt.',
          'Dann ist 40 m/s nicht einmal ein Kästchen hoch. Der Graph wäre fast flach und nicht ablesbar.',
          'Die Achse ist zu kurz: 40 m/s sind ' + f(V_KMH) + ' km/h, eine Achse bis 50 km/h reicht dafür nicht.'] },

      { id: 'diagramme-u13', typ: 'wahl',
        frage: 'Beschrifte das Diagramm sinnvoll: Wie beschriftest du die Achsen eines a(t)-Diagramms für die ICE-Fahrt?',
        optionen: ['nach rechts: t in s, nach oben: a in m/s²', 'nach rechts: t in s, nach oben: a in m/s',
          'nach rechts: a in m/s², nach oben: t in s', 'nach rechts: t in s, nach oben: a (ohne Einheit)'],
        richtig: 0,
        optErkl: ['Richtig: Die Zeit kommt nach rechts, die Größe, die sich mit der Zeit ändert, nach oben. a hat die Einheit m/s².',
          'm/s ist die Einheit der Geschwindigkeit. Die Beschleunigung hat m/s², weil sie angibt, um wie viel m/s die Geschwindigkeit pro Sekunde zunimmt. Auf Blatt 1, A3 steht dieser Fehler in der Tabelle.',
          'Bei s(t), v(t) und a(t) steht t immer nach rechts. a(t) heißt: a abhängig von t.',
          'Ohne Einheit weiß niemand, was die Zahlen an der Achse bedeuten. Jede Achse bekommt Größe und Einheit.'] },

      /* ---------- Plus: Tafel S. 11, Trapez ---------- */
      { id: 'diagramme-u14', typ: 'rechnung', quelle: 'Tafel S. 11', plus: true,
        frage: 'Tafel S. 11: Ein Zug fährt mit 300 km/h und bremst gleichmäßig mit a = −0,74074 m/s² bis zum Stillstand. Wie lange dauert das Bremsen?',
        gegeben: '<p>v₀ = 300 km/h, a = −0,74074 m/s², am Ende v = 0</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v₀ = 300 km/h = 83,33 m/s, a = 0,74074 m/s² (Betrag), v = 0<br>Gesucht: t in s',
            'Gegeben: v₀ = 300 m/s, a = 0,74074 m/s² (Betrag), v = 0<br>Gesucht: t in s',
            'Gegeben: v₀ = 300 km/h = 83,33 m/s, a = 0,74074 m/s² (Betrag), v = 0<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: 300 : 3,6 ≈ 83,33, gesucht ist die Bremszeit.', '300 ist der Wert in km/h. Erst durch 3,6 teilen: 83,33 m/s.', 'Gefragt ist die Dauer des Bremsens, nicht der Bremsweg.'] },
          { art: 'formel', optionen: ['v = v₀ − a·t', 'v = a·t', 's = v₀·t − a/2·t²'], richtig: 0,
            optErkl: ['Richtig: Gleichmäßiges Abbremsen wie auf Tafel S. 12, a als Betrag.',
              'v = a·t gilt beim Anfahren aus dem Stand. Hier startet der Zug mit 83,33 m/s und wird langsamer.',
              'Das ist die Weg-Formel. Den Bremsweg kennst du nicht, gesucht ist die Zeit.'] },
          { art: 'umstellen', optionen: ['0 = v₀ − a·t | +a·t | :a<br>t = v₀/a', '0 = v₀ − a·t | :a<br>t = v₀ − a', '0 = v₀ − a·t | +a·t | :a<br>t = a/v₀'], richtig: 0,
            optErkl: ['Richtig: Am Ende ist v = 0. Erst a·t auf die andere Seite bringen, dann durch a teilen.',
              'Durch a teilen heißt: jede Seite ganz durch a teilen. Erst +a·t rechnen, dann :a.',
              'Du hast den Bruch umgedreht. Aus v₀ = a·t | :a folgt t = v₀/a, die Geschwindigkeit steht oben.'] },
          { art: 'einsetzen', optionen: ['t = 83,33 m/s / 0,74074 m/s²', 't = 83,33 m/s · 0,74074 m/s²', 't = 300 km/h / 0,74074 m/s²'], richtig: 0,
            optErkl: ['Richtig: m/s durch m/s² ergibt s.',
              'Du hast multipliziert statt geteilt. Das ergäbe ≈ ' + f(VT * ATB) + ' und keine Zeit.',
              'Erst km/h in m/s umrechnen. Sonst kommt ≈ ' + f(300 / ATB) + ' heraus, und die Einheiten kürzen sich nicht zu s.'] }
        ],
        antwort: TTB, einheit: 's', formel: 't-brems',
        loesung: '<p>300 km/h = 300 : 3,6 m/s ≈ 83,33 m/s</p><p>v = v₀ − a·t, am Ende ist v = 0:</p>' +
          '<p>0 = 83,33 m/s − 0,74074 m/s² · t | + 0,74074 m/s² · t<br>83,33 m/s = 0,74074 m/s² · t | : 0,74074 m/s²<br>t = 83,33 m/s / 0,74074 m/s² ≈ ' + f(TTB, 1) + ' s</p>' +
          '<p>Wie an der Tafel: 112,5 s. Das Minus von a = −0,74074 m/s² steckt im Minuszeichen der Formel.</p>' },

      { id: 'diagramme-u15', typ: 'wahl', quelle: 'Tafel S. 11', plus: true,
        frage: 'Tafel S. 11: Die ganze Fahrt dauert ' + TT + ' s. Das Anfahren auf 300 km/h dauert ' + f(TT1) + ' s, das Bremsen ' + f(TTB) + ' s. Wie lange fährt der Zug mit konstanter Geschwindigkeit?',
        abb: ABB_TRAPEZ,
        optionen: ['≈ ' + f(TTK) + ' s', '≈ ' + f(TT - TT1) + ' s', '≈ ' + f(TT1 + TTB) + ' s', TT + ' s'],
        richtig: 0,
        optErkl: ['Richtig: ' + TT + ' s − ' + f(TT1) + ' s − ' + f(TTB) + ' s ≈ ' + f(TTK) + ' s, an der Tafel rund 234 s. Im v(t)-Graphen ist das die obere, waagerechte Seite des Trapezes.',
          'Du hast nur das Anfahren abgezogen. Die Bremszeit gehört auch nicht zur konstanten Fahrt.',
          'Das ist die Zeit für Anfahren und Bremsen zusammen. Gesucht ist der Rest bis ' + TT + ' s.',
          'Das ist die Dauer der ganzen Fahrt, mit Anfahren und Bremsen.'] },

      { id: 'diagramme-u16', typ: 'wahl', quelle: 'Tafel S. 11', plus: true,
        frage: 'Tafel S. 11: Was gibt die Fläche unter dem v(t)-Graphen während des Anfahrens an (Dreieck von 0 bis ' + f(TT1) + ' s, Höhe ' + f(VT) + ' m/s), und wie groß ist sie?',
        abb: ABB_TRAPEZ,
        optionen: ['den Weg: ½ · ' + f(TT1) + ' s · ' + f(VT) + ' m/s ≈ ' + f(ST1, 0) + ' m',
          'den Weg: ' + f(TT1) + ' s · ' + f(VT) + ' m/s ≈ ' + f(TT1 * VT, 0) + ' m',
          'die Beschleunigung: ' + f(VT) + ' m/s / ' + f(TT1) + ' s = ' + f(AT1, 3) + ' m/s²',
          'die Geschwindigkeit: ' + f(VT) + ' m/s'],
        richtig: 0,
        optErkl: ['Richtig: Fläche unter v(t) = Weg. Das Dreieck ergibt s = ½·v·t, das ist genau s = a/2·t² ≈ ' + f(ST1, 0) + ' m wie auf Tafel S. 10.',
          'Das ist das ganze Rechteck. Unter der schrägen Seite liegt nur das halbe Rechteck, das Dreieck. So rechnet, wer s = v·t mit der Endgeschwindigkeit nimmt.',
          'Das ist die Steigung der Geraden, nicht die Fläche darunter. Die Steigung von v(t) ist a, die Fläche ist der Weg.',
          'Das ist ein abgelesener Wert, die Höhe am Ende. Die Fläche ist Höhe mal Breite, beim Dreieck die Hälfte davon.'] }
    ],

    trainer: ['v-at', 's-beschl'],

    erklaeren: [
      { id: 'diagramme-e1', quelle: 'Tafel 17.11.',
        frage: 'Beschreibe den v(t)-Graphen der ICE-Fahrt. Sag zu jedem Abschnitt, wie der Graph aussieht und was der Zug dort macht.',
        abb: ABB_V,
        tipp: 'Geh die Abschnitte der Reihe nach durch: 0 bis 80 s, 80 bis 200 s, 200 bis 250 s, ab 250 s. Nenne jeweils die Form, die Werte und die Bewegungsart.',
        begriffe: [
          { name: 'Ursprungsgerade', muster: ['ursprungsgerade', 'ursprung'] },
          { name: 'gleichmäßig beschleunigt', muster: ['beschleunigt', 'anfahren'] },
          { name: 'waagerecht', muster: ['waagerecht', 'waagrecht', 'horizontal'] },
          { name: 'konstant', muster: ['konstant', 'gleichfoermig'] },
          { name: 'fallende Gerade', muster: ['faellt', 'fallend', 'sinkt'] },
          { name: 'Bremsen', muster: ['bremst', 'bremsen', 'abbremsen'] },
          { name: 'Stillstand', muster: ['stillstand', 'steht', 'haelt'] }
        ],
        punkte: [
          { text: '0 bis 80 s: Ursprungsgerade bis 40 m/s. Der Zug fährt aus dem Stand gleichmäßig beschleunigt an (Steigung a = 0,5 m/s²).', p: 1 },
          { text: '80 bis 200 s: waagerechte Linie bei 40 m/s = 144 km/h. Gleichförmige Bewegung, a = 0.', p: 1 },
          { text: '200 bis 250 s: fallende Gerade bis zur t-Achse. Der Zug bremst gleichmäßig (a = −0,8 m/s²).', p: 1 },
          { text: 'Ab 250 s liegt der Graph auf der t-Achse: v = 0, der Zug steht am Signal.', p: 1 }
        ],
        muster: 'Von 0 bis 80 s ist der Graph eine Ursprungsgerade, die bis 40 m/s ansteigt. Der ICE fährt also aus dem Stand gleichmäßig beschleunigt an, die Steigung ist a = 40 m/s / 80 s = 0,5 m/s². ' +
          'Von 80 s bis 200 s verläuft der Graph waagerecht bei 40 m/s, das sind 144 km/h. Hier fährt der Zug gleichförmig, die Beschleunigung ist null. ' +
          'Von 200 s bis 250 s fällt der Graph als Gerade bis auf die t-Achse. Der Zug bremst gleichmäßig, a = −40 m/s / 50 s = −0,8 m/s². ' +
          'Ab 250 s liegt der Graph auf der t-Achse: v = 0, der Zug steht vor dem Signal.' },

      { id: 'diagramme-e2', quelle: ['Tafel S. 3', 'Tafel S. 12'],
        frage: 'Beschreibe den s(t)-Graphen derselben ICE-Fahrt. Sag zu jedem Abschnitt, wie der Graph aussieht und was das für die Geschwindigkeit bedeutet.',
        abb: ABB_S,
        tipp: 'Achte auf die Steigung: Wird der Graph steiler, gleich steil, flacher oder waagerecht? Die Steigung von s(t) ist die Geschwindigkeit.',
        begriffe: [
          { name: 'Parabel', muster: ['parabel'] },
          { name: 'steiler', muster: ['steiler', 'immer steiler'] },
          { name: 'Gerade', muster: ['gerade'] },
          { name: 'flacher', muster: ['flacher'] },
          { name: 'nach unten offen', muster: ['unten offen', 'nach unten geoeffnet'] },
          { name: 'waagerecht', muster: ['waagerecht', 'waagrecht', 'horizontal'] },
          { name: 'Steigung', muster: ['steigung'] }
        ],
        punkte: [
          { text: '0 bis 80 s: nach oben offene Parabel, immer steiler bis 1600 m. Der Zug wird schneller (Anfahren).', p: 1 },
          { text: '80 bis 200 s: Gerade mit gleichbleibender Steigung bis 6400 m. Konstante Geschwindigkeit 40 m/s.', p: 1 },
          { text: '200 bis 250 s: wird immer flacher (nach unten offene Parabel) bis 7400 m. Der Zug bremst.', p: 1 },
          { text: 'Ab 250 s waagerecht bei 7400 m: Steigung null, der Zug steht. Der Graph fällt nie, weil der Zug nur vorwärts fährt.', p: 1 }
        ],
        muster: 'Von 0 bis 80 s ist der Graph ein Stück einer nach oben offenen Parabel und wird immer steiler. Weil die Steigung von s(t) die Geschwindigkeit ist, wird der ICE immer schneller, er fährt an. Bei 80 s hat er 1600 m zurückgelegt. ' +
          'Von 80 s bis 200 s ist der Graph eine Gerade mit gleichbleibender Steigung: Der Zug fährt mit konstant 40 m/s und kommt bis 6400 m. ' +
          'Von 200 s bis 250 s wird der Graph immer flacher, er ist ein Stück einer nach unten offenen Parabel. Der Zug bremst, bis die Steigung bei 7400 m null ist. ' +
          'Ab 250 s verläuft der Graph waagerecht bei 7400 m: Der Ort ändert sich nicht mehr, der Zug steht. Der Graph fällt nirgends, weil der Zug nicht rückwärts fährt.' }
    ],

    gutachten: [
      { id: 'diagramme-g1', typ: 'rechnung',
        frage: 'Bericht, Punkt 1: „Anfahren mit 0,5 m/s², nach 80 s 144 km/h.“ Bestimme aus dem v(t)-Ausdruck die Beschleunigung beim Anfahren (Steigung von 0 bis 80 s).',
        abb: ABB_V,
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v₁ = 0 m/s bei t₁ = 0 s, v₂ = 40 m/s bei t₂ = 80 s<br>Gesucht: a in m/s²',
            'Gegeben: v₁ = 0 m/s bei t₁ = 0 s, v₂ = 144 m/s bei t₂ = 80 s<br>Gesucht: a in m/s²',
            'Gegeben: v₁ = 0 m/s bei t₁ = 0 s, v₂ = 40 m/s bei t₂ = 80 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Am Ende des Anfahrens zeigt der Ausdruck 40 m/s bei 80 s.',
              '144 ist der Wert in km/h. An der Achse steht v in m/s, abgelesen sind es 40 m/s.',
              'Punkt 1 nennt eine Beschleunigung. Um den Weg geht es in Punkt 2.'] },
          { art: 'formel', optionen: ['a = Δv/Δt', 'v = Δs/Δt', 'a = 2s/t²'], richtig: 0,
            optErkl: ['Richtig: Die Steigung des v(t)-Graphen ist die Beschleunigung.',
              'Das ist die Steigung eines s(t)-Graphen. Hier liest du v(t).',
              'Diese Formel braucht einen Weg. Aus dem v(t)-Ausdruck hast du Geschwindigkeit und Zeit.'] },
          { art: 'einsetzen', optionen: ['a = (40 m/s − 0 m/s) / (80 s − 0 s)', 'a = (80 s − 0 s) / (40 m/s − 0 m/s)', 'a = (144 km/h − 0 km/h) / (80 s − 0 s)'], richtig: 0,
            optErkl: ['Richtig: 40 m/s durch 80 s.',
              F.kehrwert.erkl + ' Das ergäbe ' + f(T1 / V) + '.',
              'km/h und s passen nicht zusammen. Bleib bei m/s, sonst kommt ' + f(V_KMH / T1) + ' heraus, und das ist keine Beschleunigung in m/s².'] }
        ],
        antwort: P.aAusV(V, T1), einheit: 'm/s²', formel: 'a-dv',
        loesung: '<p>a = Δv/Δt = (v₂ − v₁)/(t₂ − t₁)</p><p>a = (40 m/s − 0 m/s) / (80 s − 0 s) = 40 m/s / 80 s = ' + f(P.aAusV(V, T1)) + ' m/s²</p>' +
          '<p>Abgelesen bei 80 s: 40 m/s · 3,6 = ' + f(V_KMH) + ' km/h.</p>',
        satz: {
          optionen: ['Der ICE fährt mit 0,5 m/s² an und hat nach 80 s 40 m/s = 144 km/h. Punkt 1 des Berichts stimmt.',
            'Der ICE fährt mit 2 m/s² an. Punkt 1 des Berichts ist falsch.',
            'Der ICE hat nach 80 s erst 40 km/h. Punkt 1 des Berichts ist falsch.'],
          richtig: 0,
          optErkl: ['Richtig: Steigung 0,5 m/s², Endwert 144 km/h.',
            '2 kommt heraus, wenn man den Bruch umdreht (80 s / 40 m/s). Die Zeit gehört in den Nenner.',
            '40 ist der Wert in m/s. Mal 3,6 sind das 144 km/h.'] } },

      { id: 'diagramme-g2', typ: 'rechnung',
        frage: 'Bericht, Punkt 2: „Anfahrweg bis 144 km/h: 3,2 km.“ Welchen Weg legt der ICE beim Anfahren aus dem Stand mit a = 0,5 m/s² in den ersten 80 s zurück?',
        gegeben: '<p>a = 0,5 m/s², t = 80 s, Start aus dem Stand</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: a = 0,5 m/s², t = 80 s<br>Gesucht: s in m', 'Gegeben: a = 0,5 m/s², t = 80 s<br>Gesucht: v in m/s', 'Gegeben: v = 40 m/s, t = 80 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Punkt 2 nennt einen Weg.',
              'Die Geschwindigkeit hast du schon geprüft (40 m/s). Jetzt geht es um den Weg.',
              'Mit v = 40 m/s und s = v·t käme der doppelte Weg heraus, genau der Fehler des Berichts. Für s = a/2·t² brauchst du a.'] },
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt s = a/2·t², der s(t)-Graph ist eine Halbparabel.',
              F.gleichfoermig.erkl + ' Genau so ist der Bericht auf 3,2 km gekommen.',
              'Das liefert die Geschwindigkeit, gesucht ist der Weg.'] },
          { art: 'einsetzen', optionen: ['s = 0,5 m/s² / 2 · (80 s)²', 's = 0,5 m/s² · (80 s)²', 's = 40 m/s · 80 s', 's = 0,5 m/s² / 2 · 80 s'], richtig: 0,
            optErkl: ['Richtig: 0,25 m/s² · 6400 s².',
              F.halbVergessen.erkl + ' Das ergäbe ' + f(A1 * T1 * T1) + ' m.',
              '40 m/s erreicht der Zug erst am Ende. Damit zu rechnen ergibt den doppelten Weg (' + f(S1_FALSCH) + ' m), genau den Wert im Bericht.',
              F.quadratVergessen.erkl + ' Dann bleibt m/s als Einheit, kein Weg.'] }
        ],
        antwort: S1, einheit: 'm', formel: 's-beschl',
        loesung: '<p>s = a/2·t²</p><p>s = 0,5 m/s² / 2 · (80 s)² = 0,25 m/s² · 6400 s² = ' + f(S1) + ' m</p>' +
          '<p>Probe über die Fläche unter v(t): Dreieck ½ · 80 s · 40 m/s = ' + f(0.5 * T1 * V) + ' m.</p>',
        satz: {
          optionen: ['Der ICE braucht bis 144 km/h nur 1,6 km. Die 3,2 km im Bericht sind doppelt so viel, dort wurde s = v·t mit der Endgeschwindigkeit gerechnet.',
            'Der ICE braucht 3,2 km bis 144 km/h. Punkt 2 des Berichts stimmt.',
            'Der ICE braucht 1,6 km. Der Bericht hat nur gerundet und stimmt.'],
          richtig: 0,
          optErkl: ['Richtig: 1600 m sind die Hälfte von 3200 m.', 'Gerechnet hast du 1600 m, nicht 3200 m.', '3,2 km ist doppelt so viel wie 1,6 km. Das ist keine Rundung.'] } },

      { id: 'diagramme-g3', typ: 'wahl',
        frage: 'Bericht, Punkt 3: „Bremsweg bis zum Halt am Signal: 2,0 km.“ Der ICE bremst ab t = 200 s gleichmäßig von 40 m/s bis zum Stillstand bei t = 250 s (a = −0,8 m/s²). Wie lang ist der Bremsweg?',
        abb: ABB_V,
        optionen: [f(SB) + ' m', f(SB_FALSCH) + ' m', f(V * TB + AB / 2 * TB * TB) + ' m', f(V * TB - AB * TB * TB) + ' m'],
        richtig: 0,
        optErkl: ['Richtig: s = v₀·t − a/2·t² = 40 m/s · 50 s − 0,4 m/s² · (50 s)² = 2000 m − 1000 m = 1000 m. Das ist auch die Dreiecksfläche unter v(t): ½ · 50 s · 40 m/s.',
          'Das ist s = v·t mit der Anfangsgeschwindigkeit, als wäre der Zug 50 s lang mit 40 m/s weitergefahren. Genau so kommt der Bericht auf 2,0 km.',
          'Beim Bremsen wird a/2·t² abgezogen, nicht addiert: s = v₀·t − a/2·t².',
          'In s = v₀·t − a/2·t² steckt die Hälfte. Du hast sie vergessen. Dann bliebe 0 m übrig, als wäre der Zug beim Bremsen gar nicht gefahren.'] },

      { id: 'diagramme-g4', typ: 'wahl',
        frage: 'Auf Ausdruck B ist die Beschriftung der Hochachse abgerissen. Der Graph liegt von 0 bis 80 s waagerecht oberhalb der t-Achse, von 80 s bis 200 s auf der t-Achse, ' +
          'von 200 s bis 250 s waagerecht unterhalb der t-Achse und danach wieder auf der t-Achse. Welche Beschriftung gehört an die Hochachse?',
        optionen: ['a in m/s²', 'v in m/s', 's in m', 'a in m/s'],
        richtig: 0,
        optErkl: ['Richtig: Waagerechte Stücke heißen konstante Beschleunigung: positiv beim Anfahren, null bei der gleichförmigen Fahrt, negativ beim Bremsen.',
          'Dann stünde der Zug zwischen 80 s und 200 s (v = 0), dabei fährt er dort 144 km/h. Außerdem wäre v beim Bremsen negativ, der Zug führe rückwärts.',
          'Der zurückgelegte Weg nimmt nie ab und wird nicht negativ. Ein s(t)-Graph kann nicht unter die t-Achse springen, wenn der Zug nur vorwärts fährt.',
          'Die Größe stimmt, die Einheit nicht: Die Beschleunigung hat die Einheit m/s².'] }
    ],

    ergebnis: '<p><strong>Ergebnis:</strong> Der Fahrtenschreiber ist in Ordnung, der Bericht nur zum Teil. Punkt 1 stimmt: Der ICE fährt mit 0,5 m/s² an und hat nach 80 s 40 m/s = 144 km/h. ' +
      'Punkt 2 und 3 sind falsch: Der Anfahrweg beträgt ' + f(S1 / 1000, 1) + ' km statt 3,2 km, der Bremsweg ' + (SB / 1000).toFixed(1).replace('.', ',') + ' km statt 2,0 km. ' +
      'Im Bericht wurde beide Male s = v·t gerechnet, als wäre der Zug die ganze Zeit mit 144 km/h gefahren. Ausdruck B ist der a(t)-Graph.</p>'
  });
})();
