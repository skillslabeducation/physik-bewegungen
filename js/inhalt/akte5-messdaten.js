/* Akte 5: Messtabellen auswerten (mittlere Geschwindigkeit und mittlere Beschleunigung, Mittelpunkt-Regel).
   Quellen: Tafel 17.11. (Messtabelle t 0/2/4/6 s, s 0/5/12/20 m), Tafel S. 13 Aufgabe 1 (Lauf-App, Schrittlänge 0,8 m).
   Alle Zahlen kommen aus W.physik (P.mittel = Differenzenquotient mit Intervallmitte). */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik, D = W.diagramm;
  var F = P.FEHLER, f = P.fmt;
  W.akten = W.akten || [];

  function r(x) { return Math.round(x * 1e6) / 1e6; }
  function rund(liste) { return liste.map(r); }
  function paare(ts, ws) { return ts.map(function (t, i) { return [t, ws[i]]; }); }

  /* ---------- Daten Tafel 17.11. ---------- */
  var T1 = [0, 2, 4, 6], S1 = [0, 5, 12, 20];
  var V1 = P.mittel(T1, S1);                       // t 1, 3, 5 s; v̄ 2,5; 3,5; 4 m/s
  V1 = { t: rund(V1.t), wert: rund(V1.wert) };
  var A1 = P.mittel(V1.t, V1.wert);                // t 2, 4 s; ā 0,5; 0,25 m/s²
  A1 = { t: rund(A1.t), wert: rund(A1.wert) };

  /* ---------- Daten Tafel S. 13 (Lauf-App) ---------- */
  var SL = 0.8;
  var T2 = [0, 20, 40, 60, 80, 100], N2 = [0, 50, 110, 180, 250, 310];
  var S2 = N2.map(function (n) { return r(n * SL); });   // 0; 40; 88; 144; 200; 248 m
  var V2 = P.mittel(T2, S2);                              // t 10 … 90 s; v̄ 2,0; 2,4; 2,8; 2,8; 2,4 m/s
  V2 = { t: rund(V2.t), wert: rund(V2.wert) };
  var A2 = P.mittel(V2.t, V2.wert);                       // t 20 … 80 s; ā 0,02; 0,02; 0; −0,02 m/s²
  A2 = { t: rund(A2.t), wert: rund(A2.wert) };

  /* Gutachten: ganze Aufzeichnung und Vergleich mit einem E-Scooter (20 km/h). */
  var vGesamt = P.vGleich(S2[5] - S2[0], T2[5] - T2[0]);   // 2,48 m/s
  var vScooter = P.ms(20);                                  // 5,56 m/s
  var sScooter = P.sGleich(vScooter, 20);                   // 111,1 m in 20 s
  var nScooter = sScooter / SL;                             // 138,9 Schritte
  var nMax = 0;
  for (var i = 1; i < N2.length; i++) nMax = Math.max(nMax, N2[i] - N2[i - 1]);   // 70 Schritte

  /* ---------- Tabellen (HTML) ---------- */
  function zeile(kopf, werte, tag) { return '<tr><th>' + kopf + '</th>' + werte.map(function (w) { return '<' + (tag || 'td') + '>' + w + '</' + (tag || 'td') + '>'; }).join('') + '</tr>'; }
  var TAB_1711 = '<table><tr><th>Messung</th><th>t in s</th><th>s in m</th></tr>' +
    T1.map(function (t, k) { return '<tr><td>' + (k + 1) + '</td><td>' + f(t) + '</td><td>' + f(S1[k]) + '</td></tr>'; }).join('') + '</table>';
  var TAB_APP = '<table>' + zeile('t in s', T2.map(f)) + zeile('Schritte n', N2.map(f)) + '</table>';
  var TAB_APP_S = '<table>' + zeile('t in s', T2.map(f)) + zeile('Schritte n', N2.map(f)) + zeile('Strecke s in m', S2.map(f)) + '</table>';
  var TAB_APP_V = '<table>' + zeile('t₁₂ in s', V2.t.map(f)) + zeile('v̄ in m/s', V2.wert.map(f)) + '</table>';

  /* ---------- Achsen ---------- */
  var AX_1711 = { g: 't', e: 's', max: 6, schritt: 1 };
  var AX_APP = { g: 't', e: 's', max: 100, schritt: 20 };

  W.akten.push({
    id: 'messdaten', nr: 5, titel: 'Messtabellen auswerten', fall: 'Alibi per Lauf-App',

    auftrag: {
      text: '<p>Sonntagvormittag am Uferweg der Außenalster, Höhe Schöne Aussicht. Ein E-Scooter streift einen geparkten Wagen und fährt weiter, der Außenspiegel ist hin. Eine Zeugin hat nur eine gelbe Jacke gesehen.</p>' +
        '<p>Ein Mann in gelber Laufjacke sagt: „Ich bin gelaufen, nicht gefahren. Meine Lauf-App hat alles aufgezeichnet.“ Die App zählt alle 20 s, wie viele Schritte er seit dem Start gemacht hat. Seine Schrittlänge laut App-Profil: ' + f(SL) + ' m. Du wertest die Aufzeichnung aus.</p>',
      daten: TAB_APP,
      chefin: 'Akte 5. Eine App ist noch kein Alibi, eine sauber ausgewertete Tabelle schon. Rechne nach.',
      leitfrage: 'Passen die Daten der Lauf-App zu einem Läufer oder zu einem E-Scooter mit etwa 20 km/h?'
    },

    karten: [
      { titel: 'Aus zwei Messungen wird eine Geschwindigkeit',
        text: '<p>Eine Messtabelle liefert Paare aus Zeit und Weg. Die Geschwindigkeit steht nicht in der Tabelle. Du rechnest sie für jedes Zeitintervall zwischen zwei Messungen aus:</p>' +
          '<p><strong>v̄₁₂ = (s₂ − s₁)/(t₂ − t₁) = Δs/Δt</strong></p>' +
          '<p>Beispiel von der Tafel (17.11.):</p>' + TAB_1711 +
          '<p>v̄₁₂ = (5 m − 0 m)/(2 s − 0 s) = 5 m / 2 s = ' + f(V1.wert[0]) + ' m/s<br>' +
          'v̄₂₃ = (12 m − 5 m)/(4 s − 2 s) = 7 m / 2 s = ' + f(V1.wert[1]) + ' m/s<br>' +
          'v̄₃₄ = (20 m − 12 m)/(6 s − 4 s) = 8 m / 2 s = ' + f(V1.wert[2]) + ' m/s</p>',
        abb: { achsen: { x: AX_1711, y: { g: 's', e: 'm', max: 25, schritt: 5 } }, kurven: [{ punkte: paare(T1, S1), farbe: 's' }], marken: paare(T1, S1) },
        merk: 'v̄ = (s₂ − s₁)/(t₂ − t₁): Endwert minus Anfangswert, geteilt durch die Zeitspanne. Der Strich über dem v heißt „mittlere“.',
        achtung: '<p>Nicht den Messwert durch die Zeit teilen. 12 m / 4 s = 3 m/s ist der Mittelwert vom Start bis 4 s, nicht der im Intervall von 2 s bis 4 s. Richtig: (12 m − 5 m)/(4 s − 2 s) = ' + f(V1.wert[1]) + ' m/s.</p>' },

      { titel: 'Mittelpunkt-Regel: Wohin gehört v̄?',
        text: '<p>v̄₁₂ ist ein Mittelwert über das ganze Intervall von t₁ bis t₂. Deshalb gehört er zur Mitte des Intervalls:</p>' +
          '<p><strong>t₁₂ = (t₁ + t₂)/2</strong></p>' +
          '<p>Tafel 17.11.: v̄₁₂ = ' + f(V1.wert[0]) + ' m/s gehört zu t = (0 s + 2 s)/2 = ' + f(V1.t[0]) + ' s, v̄₂₃ = ' + f(V1.wert[1]) + ' m/s zu (2 s + 4 s)/2 = ' + f(V1.t[1]) + ' s, v̄₃₄ = ' + f(V1.wert[2]) + ' m/s zu (4 s + 6 s)/2 = ' + f(V1.t[2]) + ' s.</p>' +
          '<p>Darum stehen die v̄-Werte in der Tafel-Tabelle versetzt, jeweils zwischen den Zeilen der beiden Messungen. Im v(t)-Diagramm trägst du sie bei 1 s, 3 s und 5 s ein.</p>',
        abb: { achsen: { x: AX_1711, y: { g: 'v', e: 'm/s', max: 5, schritt: 1 } }, kurven: [{ punkte: paare(V1.t, V1.wert), farbe: 'v' }], marken: paare(V1.t, V1.wert) },
        merk: 'Die mittlere Geschwindigkeit zwischen zwei Messungen gehört zur Intervallmitte t₁₂ = (t₁ + t₂)/2.',
        achtung: '<p>Nicht beim Anfang des Intervalls eintragen. v̄₂₃ = ' + f(V1.wert[1]) + ' m/s gehört nicht zu t = 2 s, sondern zu t = 3 s. Wer immer am Anfang (oder am Ende) einträgt, verschiebt den ganzen Graphen um ein halbes Intervall.</p>' },

      { titel: 'Aus den Geschwindigkeiten wird eine Beschleunigung',
        text: '<p>Mit den v̄-Werten machst du dasselbe noch einmal: Änderung der Geschwindigkeit geteilt durch den Abstand ihrer Zeitpunkte.</p>' +
          '<p><strong>ā₁₋₃ = (v̄₂₃ − v̄₁₂)/(t₂₃ − t₁₂)</strong></p>' +
          '<p>ā₁₋₃ = (3,5 m/s − 2,5 m/s)/(3 s − 1 s) = 1 m/s / 2 s = ' + f(A1.wert[0]) + ' m/s², Zeitpunkt (1 s + 3 s)/2 = ' + f(A1.t[0]) + ' s<br>' +
          'ā₂₋₄ = (4 m/s − 3,5 m/s)/(5 s − 3 s) = 0,5 m/s / 2 s = ' + f(A1.wert[1]) + ' m/s², Zeitpunkt (3 s + 5 s)/2 = ' + f(A1.t[1]) + ' s</p>' +
          '<p>Aus 4 Messungen werden 3 Geschwindigkeiten und daraus 2 Beschleunigungen. Jede Stufe hat einen Wert weniger, weil sie immer zwei Werte der Stufe davor braucht.</p>',
        abb: { achsen: { x: AX_1711, y: { g: 'a', e: 'm/s²', max: 0.6, schritt: 0.1 } }, kurven: [{ punkte: paare(A1.t, A1.wert), farbe: 'a' }], marken: paare(A1.t, A1.wert) },
        merk: 'n Messwerte → n − 1 Geschwindigkeiten → n − 2 Beschleunigungen. Jeder neue Wert gehört zur Mitte zwischen den Zeitpunkten der beiden Werte, aus denen er entsteht.',
        achtung: '<p>Auch hier eine Differenz durch eine Differenz: (3,5 m/s − 2,5 m/s)/(3 s − 1 s). Wer 3,5 m/s / 3 s rechnet, teilt einen einzelnen Wert durch einen Zeitpunkt und bekommt keine Beschleunigung. Und die Einheit ist m/s², nicht m/s.</p>' },

      { titel: 'Lauf-App: erst Schritte in Meter',
        text: '<p>Die App misst keine Meter, sie zählt Schritte. Mit der Schrittlänge rechnest du sie in Meter um:</p>' +
          '<p><strong>s = Schrittzahl · Schrittlänge</strong></p>' +
          '<p>Tafel S. 13: 50 · 0,8 m = ' + f(S2[1]) + ' m, 110 · 0,8 m = ' + f(S2[2]) + ' m, 180 · 0,8 m = ' + f(S2[3]) + ' m.</p>' + TAB_APP_S +
          '<p>Erst danach rechnest du v̄, zum Beispiel zwischen 20 s und 40 s:<br>v̄ = (88 m − 40 m)/(40 s − 20 s) = 48 m / 20 s = ' + f(V2.wert[1]) + ' m/s, Zeitpunkt (20 s + 40 s)/2 = ' + f(V2.t[1]) + ' s.</p>',
        abb: { achsen: { x: AX_APP, y: { g: 's', e: 'm', max: 250, schritt: 50 } }, kurven: [{ punkte: paare(T2, S2), farbe: 's' }], marken: paare(T2, S2) },
        merk: 'Erst umrechnen (Schritte · Schrittlänge), dann Differenzen bilden.',
        achtung: '<p>Mit Schrittzahlen statt Metern gerechnet: (110 − 50)/(40 s − 20 s) = 3 Schritte pro Sekunde. Das ist keine Geschwindigkeit in m/s.</p>' },

      { titel: 'Den Graphen der Ergebnisse lesen',
        text: '<p>Trägst du die v̄-Werte der Lauf-App bei den Intervallmitten 10, 30, 50, 70 und 90 s ein, siehst du den Lauf: Erst wird der Läufer schneller (' + f(V2.wert[0], 1) + ' → ' + f(V2.wert[1]) + ' → ' + f(V2.wert[2]) + ' m/s), dann läuft er gleich schnell (' + f(V2.wert[3]) + ' m/s), am Ende wird er langsamer (' + f(V2.wert[4]) + ' m/s).</p>' +
          '<p>Die Beschleunigungen sagen dasselbe: ā = ' + f(A2.wert[0]) + ' m/s² bei ' + f(A2.t[0]) + ' s und ' + f(A2.t[1]) + ' s (schneller werden), ā = ' + f(A2.wert[2]) + ' bei ' + f(A2.t[2]) + ' s (gleich schnell), ā = ' + f(A2.wert[3]) + ' m/s² bei ' + f(A2.t[3]) + ' s (langsamer werden).</p>',
        abb: { achsen: { x: AX_APP, y: { g: 'v', e: 'm/s', max: 3, schritt: 0.5 } }, kurven: [{ punkte: paare(V2.t, V2.wert), farbe: 'v' }], marken: paare(V2.t, V2.wert) },
        merk: 'ā > 0: schneller werden. ā = 0: gleich schnell. ā < 0: langsamer werden.' }
    ],

    ueben: [
      /* ----- Tafel 17.11. ----- */
      { id: 'messdaten-u1', typ: 'rechnung', quelle: 'Tafel 17.11.',
        frage: 'Messtabelle von der Tafel (17.11.): Berechne die mittlere Geschwindigkeit v̄₂₃ zwischen Messung 2 und Messung 3.',
        gegeben: TAB_1711,
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: t₂ = 2 s, s₂ = 5 m, t₃ = 4 s, s₃ = 12 m<br>Gesucht: v̄₂₃ in m/s',
            'Gegeben: t₂ = 2 s, s₂ = 5 m, t₃ = 4 s, s₃ = 12 m<br>Gesucht: ā in m/s²',
            'Gegeben: t₃ = 4 s, s₃ = 12 m<br>Gesucht: v̄₂₃ in m/s'],
            richtig: 0,
            optErkl: ['Richtig: Du brauchst beide Messungen, die das Intervall begrenzen.',
              'Gefragt ist eine Geschwindigkeit. Die Beschleunigung kommt erst danach, aus zwei v̄-Werten.',
              'Mit einer einzigen Messung kannst du keine Differenz bilden. Du brauchst Anfang und Ende des Intervalls.'] },
          { art: 'formel', optionen: ['v̄₂₃ = (s₃ − s₂)/(t₃ − t₂)', 'v̄₂₃ = s₃/t₃', 'v̄₂₃ = (t₃ − t₂)/(s₃ − s₂)'],
            richtig: 0,
            optErkl: ['Richtig: Δs/Δt für das Intervall von Messung 2 bis Messung 3.', F.messwertStattDifferenz.erkl, F.kehrwert.erkl] },
          { art: 'einsetzen', optionen: ['v̄₂₃ = (12 m − 5 m)/(4 s − 2 s)', 'v̄₂₃ = 12 m / 4 s', 'v̄₂₃ = (12 m − 5 m)/4 s'],
            richtig: 0,
            optErkl: ['Richtig: Endwert minus Anfangswert, oben die Meter, unten die Sekunden.',
              F.messwertStattDifferenz.erkl + ' Das ergäbe ' + f(12 / 4) + ' m/s.',
              'Oben steht die Differenz, unten nur der Zeitpunkt 4 s. Auch die Zeit braucht die Differenz: 4 s − 2 s = 2 s. Das ergäbe ' + f(7 / 4) + ' m/s.'] }
        ],
        antwort: V1.wert[1], einheit: 'm/s', formel: 'v-gleich',
        loesung: '<p>v̄₂₃ = (s₃ − s₂)/(t₃ − t₂)<br>v̄₂₃ = (12 m − 5 m)/(4 s − 2 s) = 7 m / 2 s = ' + f(V1.wert[1]) + ' m/s<br>Zeitpunkt: t₂₃ = (2 s + 4 s)/2 = ' + f(V1.t[1]) + ' s</p>' },

      { id: 'messdaten-u2', typ: 'wahl', quelle: 'Tafel 17.11.',
        frage: 'Tafel 17.11.: v̄₂₃ = ' + f(V1.wert[1]) + ' m/s ist die mittlere Geschwindigkeit zwischen Messung 2 (t = 2 s) und Messung 3 (t = 4 s). Bei welchem Zeitpunkt trägst du den Wert ins v(t)-Diagramm ein?',
        optionen: ['t = 3 s', 't = 2 s', 't = 4 s', 't = 1 s'], richtig: 0,
        optErkl: ['Richtig: Intervallmitte, t₂₃ = (2 s + 4 s)/2 = 3 s.',
          F.intervallAnfang.erkl + ' Hier: (2 s + 4 s)/2 = 3 s.',
          'Das ist das Ende des Intervalls. Der Mittelwert gehört weder zum Anfang noch zum Ende, sondern zur Mitte: (2 s + 4 s)/2 = 3 s.',
          'Du hast die halbe Intervalllänge genommen: (4 s − 2 s)/2 = 1 s. Die Mitte ist (t₁ + t₂)/2, mit Plus: (2 s + 4 s)/2 = 3 s.'] },

      { id: 'messdaten-u3', typ: 'rechnung', quelle: 'Tafel 17.11.',
        frage: 'Tafel 17.11.: Aus der Messtabelle kennst du v̄₂₃ = ' + f(V1.wert[1]) + ' m/s (bei t = ' + f(V1.t[1]) + ' s) und v̄₃₄ = ' + f(V1.wert[2]) + ' m/s (bei t = ' + f(V1.t[2]) + ' s). Berechne die mittlere Beschleunigung ā₂₋₄.',
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: v̄₂₃ = 3,5 m/s bei t₂₃ = 3 s, v̄₃₄ = 4 m/s bei t₃₄ = 5 s<br>Gesucht: ā₂₋₄ in m/s²',
            'Gegeben: v̄₂₃ = 3,5 m/s bei t₂₃ = 3 s, v̄₃₄ = 4 m/s bei t₃₄ = 5 s<br>Gesucht: ā₂₋₄ in m/s',
            'Gegeben: v̄₂₃ = 3,5 m/s bei t = 2 s, v̄₃₄ = 4 m/s bei t = 4 s<br>Gesucht: ā₂₋₄ in m/s²'],
            richtig: 0,
            optErkl: ['Richtig: zwei Geschwindigkeiten mit ihren Zeitpunkten (Intervallmitten), gesucht ist ā in m/s².',
              'Die Einheit der Beschleunigung ist m/s², nicht m/s: Geschwindigkeit (m/s) geteilt durch Zeit (s).',
              F.intervallAnfang.erkl + ' v̄₂₃ gehört zu 3 s, v̄₃₄ zu 5 s.'] },
          { art: 'formel', optionen: ['ā₂₋₄ = (v̄₃₄ − v̄₂₃)/(t₃₄ − t₂₃)', 'ā₂₋₄ = v̄₃₄/t₃₄', 'ā₂₋₄ = (s₄ − s₂)/(t₄ − t₂)'],
            richtig: 0,
            optErkl: ['Richtig: ā = Δv/Δt mit den beiden v̄-Werten und ihren Zeitpunkten.', F.messwertStattDifferenz.erkl,
              'Weg geteilt durch Zeit ist wieder eine Geschwindigkeit. Für die Beschleunigung teilst du eine Geschwindigkeitsänderung durch die Zeit.'] },
          { art: 'einsetzen', optionen: ['ā₂₋₄ = (4 m/s − 3,5 m/s)/(5 s − 3 s)', 'ā₂₋₄ = 4 m/s / 5 s', 'ā₂₋₄ = (4 m/s − 3,5 m/s)/5 s', 'ā₂₋₄ = (5 s − 3 s)/(4 m/s − 3,5 m/s)'],
            richtig: 0,
            optErkl: ['Richtig: Δv = 0,5 m/s, Δt = 2 s.',
              F.messwertStattDifferenz.erkl + ' Das ergäbe ' + f(4 / 5) + ' m/s².',
              'Oben die Differenz, unten aber nur der Zeitpunkt 5 s. Δt = 5 s − 3 s = 2 s. Das ergäbe ' + f(0.5 / 5) + ' m/s².',
              F.kehrwert.erkl + ' Das ergäbe ' + f(2 / 0.5) + ' s²/m.'] }
        ],
        antwort: A1.wert[1], einheit: 'm/s²', formel: 'a-dv',
        loesung: '<p>ā₂₋₄ = (v̄₃₄ − v̄₂₃)/(t₃₄ − t₂₃)<br>ā₂₋₄ = (4 m/s − 3,5 m/s)/(5 s − 3 s) = 0,5 m/s / 2 s = ' + f(A1.wert[1]) + ' m/s²<br>Zeitpunkt: (3 s + 5 s)/2 = ' + f(A1.t[1]) + ' s</p>' },

      { id: 'messdaten-u4', typ: 'tabelle', quelle: 'Tafel 17.11.',
        frage: 'Tafel 17.11.: Werte die ganze Messtabelle aus. Trage jeden Wert und den Zeitpunkt ein, zu dem er gehört (Mittelpunkt-Regel).' + TAB_1711,
        spalten: ['', 'Wert', 'gehört zu t in s'],
        zeilen: [
          { kopf: 'v̄₁₂ in m/s', zellen: [{ zahl: V1.wert[0] }, { zahl: V1.t[0] }] },
          { kopf: 'v̄₂₃ in m/s', zellen: [{ zahl: V1.wert[1] }, { zahl: V1.t[1] }] },
          { kopf: 'v̄₃₄ in m/s', zellen: [{ zahl: V1.wert[2] }, { zahl: V1.t[2] }] },
          { kopf: 'ā₁₋₃ in m/s²', zellen: [{ zahl: A1.wert[0] }, { zahl: A1.t[0] }] },
          { kopf: 'ā₂₋₄ in m/s²', zellen: [{ zahl: A1.wert[1] }, { zahl: A1.t[1] }] }
        ] },

      { id: 'messdaten-u5', typ: 'punkte', quelle: 'Tafel 17.11.',
        frage: 'Tafel 17.11.: Zeichne die drei mittleren Geschwindigkeiten ins v(t)-Diagramm, jeweils bei der Intervallmitte (v̄₁₂ = ' + f(V1.wert[0]) + ' m/s, v̄₂₃ = ' + f(V1.wert[1]) + ' m/s, v̄₃₄ = ' + f(V1.wert[2]) + ' m/s).',
        achsen: { x: AX_1711, y: { g: 'v', e: 'm/s', min: 0, max: 5, schritt: 1 } },
        xs: V1.t.slice(), soll: V1.wert.slice(), tol: 0.25,
        kurve: paare(V1.t, V1.wert) },

      /* ----- Tafel S. 13, Aufgabe 1: Lauf-App ----- */
      { id: 'messdaten-u6', typ: 'tabelle', quelle: 'Tafel S. 13, A1',
        frage: 'Tafel S. 13, Aufgabe 1: Ein Läufer misst mit einer App alle 20 s, wie viele Schritte er seit dem Start gemacht hat. Seine Schrittlänge ist ' + f(SL) + ' m. Rechne die Schrittzahlen in Strecken um.',
        spalten: ['t in s'].concat(T2.map(f)),
        zeilen: [
          { kopf: 'Schritte n', zellen: N2.map(function (n) { return { fix: f(n) }; }) },
          { kopf: 'Strecke s in m', zellen: S2.map(function (s, k) { return k === 0 ? { fix: f(s) } : { zahl: s }; }) }
        ] },

      { id: 'messdaten-u7', typ: 'rechnung', quelle: 'Tafel S. 13, A1',
        frage: 'Tafel S. 13 (Lauf-App, Schrittlänge ' + f(SL) + ' m): Berechne die mittlere Geschwindigkeit zwischen t = 20 s und t = 40 s.',
        gegeben: TAB_APP,
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: t₁ = 20 s, s₁ = 50 · 0,8 m = 40 m, t₂ = 40 s, s₂ = 110 · 0,8 m = 88 m<br>Gesucht: v̄ in m/s',
            'Gegeben: t₁ = 20 s, s₁ = 50 m, t₂ = 40 s, s₂ = 110 m<br>Gesucht: v̄ in m/s',
            'Gegeben: t₁ = 20 s, s₁ = 40 m, t₂ = 40 s, s₂ = 88 m<br>Gesucht: ā in m/s²'],
            richtig: 0,
            optErkl: ['Richtig: erst die Schritte mit der Schrittlänge in Meter umrechnen.',
              'Die App zählt Schritte, nicht Meter. 50 Schritte sind 50 · 0,8 m = 40 m.',
              'Gefragt ist die mittlere Geschwindigkeit. Für ā brauchst du erst zwei v̄-Werte.'] },
          { art: 'formel', optionen: ['v̄ = (s₂ − s₁)/(t₂ − t₁)', 'v̄ = s₂/t₂', 'v̄ = (t₂ − t₁)/(s₂ − s₁)'],
            richtig: 0,
            optErkl: ['Richtig: so steht es an der Tafel, Δs/Δt für das Intervall.', F.messwertStattDifferenz.erkl, F.kehrwert.erkl] },
          { art: 'einsetzen', optionen: ['v̄ = (88 m − 40 m)/(40 s − 20 s)', 'v̄ = 88 m / 40 s', 'v̄ = (110 − 50)/(40 s − 20 s)', 'v̄ = (40 s − 20 s)/(88 m − 40 m)'],
            richtig: 0,
            optErkl: ['Richtig: 48 m in 20 s.',
              F.messwertStattDifferenz.erkl + ' Das ergäbe ' + f(88 / 40) + ' m/s, den Mittelwert vom Start an.',
              'Das sind Schritte, keine Meter. Heraus kämen ' + f(60 / 20) + ' Schritte pro Sekunde, keine Geschwindigkeit in m/s.',
              F.kehrwert.erkl + ' Das ergäbe etwa ' + f(20 / 48) + ' s/m.'] }
        ],
        antwort: V2.wert[1], einheit: 'm/s', formel: 'v-gleich',
        loesung: '<p>s₁ = 50 · 0,8 m = ' + f(S2[1]) + ' m, s₂ = 110 · 0,8 m = ' + f(S2[2]) + ' m<br>v̄ = (s₂ − s₁)/(t₂ − t₁)<br>v̄ = (88 m − 40 m)/(40 s − 20 s) = 48 m / 20 s = ' + f(V2.wert[1]) + ' m/s<br>Zeitpunkt: t₁₂ = (20 s + 40 s)/2 = ' + f(V2.t[1]) + ' s</p>' },

      { id: 'messdaten-u8', typ: 'behauptung', quelle: 'Tafel S. 13, A1',
        aussage: 'Zwischen 20 s und 40 s ist v̄ = ' + f(V2.wert[1]) + ' m/s. Im v(t)-Diagramm gehört der Punkt zu t = 20 s, weil dort das Intervall anfängt.',
        stimmt: false,
        gruende: ['Der Wert gilt für das ganze Intervall und gehört zu seiner Mitte: (20 s + 40 s)/2 = 30 s.',
          'Der Wert gehört zu t = 40 s, weil die App ihn erst am Ende des Intervalls kennt.',
          'Der Wert gehört zu t = 10 s, das ist die halbe Intervalllänge.'],
        richtig: 0,
        erkl: F.intervallAnfang.erkl + ' t₁₂ = (t₁ + t₂)/2 = (20 s + 40 s)/2 = 30 s.' },

      { id: 'messdaten-u9', typ: 'tabelle', quelle: 'Tafel S. 13, A1',
        frage: 'Tafel S. 13: Berechne für jedes Intervall die mittlere Geschwindigkeit v̄ = (s₂ − s₁)/(t₂ − t₁) und ihren Zeitpunkt t₁₂ = (t₁ + t₂)/2.' + TAB_APP_S,
        spalten: ['Intervall', '0 bis 20 s', '20 bis 40 s', '40 bis 60 s', '60 bis 80 s', '80 bis 100 s'],
        zeilen: [
          { kopf: 'v̄ in m/s', zellen: V2.wert.map(function (v) { return { zahl: v }; }) },
          { kopf: 't₁₂ in s', zellen: V2.t.map(function (t) { return { zahl: t }; }) }
        ] },

      { id: 'messdaten-u10', typ: 'rechnung', quelle: 'Tafel S. 13, A1',
        frage: 'Tafel S. 13: Die Lauf-App ergibt v̄ = ' + f(V2.wert[1]) + ' m/s bei t = ' + f(V2.t[1]) + ' s und v̄ = ' + f(V2.wert[2]) + ' m/s bei t = ' + f(V2.t[2]) + ' s. Berechne die mittlere Beschleunigung dazwischen.',
        gegeben: TAB_APP_V,
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: v₁ = 2,4 m/s bei t₁ = 30 s, v₂ = 2,8 m/s bei t₂ = 50 s<br>Gesucht: ā in m/s²',
            'Gegeben: v₁ = 2,4 m/s bei t₁ = 20 s, v₂ = 2,8 m/s bei t₂ = 40 s<br>Gesucht: ā in m/s²',
            'Gegeben: v₁ = 2,4 m/s bei t₁ = 30 s, v₂ = 2,8 m/s bei t₂ = 50 s<br>Gesucht: ā in m/s'],
            richtig: 0,
            optErkl: ['Richtig: die beiden v̄-Werte mit ihren Intervallmitten.',
              F.intervallAnfang.erkl + ' Die v̄-Werte gehören zu 30 s und 50 s.',
              'Die Einheit der Beschleunigung ist m/s², nicht m/s.'] },
          { art: 'formel', optionen: ['ā = (v₂ − v₁)/(t₂ − t₁)', 'ā = v₂/t₂', 'ā = (s₂ − s₁)/(t₂ − t₁)'],
            richtig: 0,
            optErkl: ['Richtig: ā = Δv/Δt.', F.messwertStattDifferenz.erkl,
              'Weg durch Zeit ergibt eine Geschwindigkeit. Für ā teilst du eine Geschwindigkeitsänderung durch die Zeit.'] },
          { art: 'einsetzen', optionen: ['ā = (2,8 m/s − 2,4 m/s)/(50 s − 30 s)', 'ā = 2,8 m/s / 50 s', 'ā = (2,8 m/s − 2,4 m/s)/50 s', 'ā = (50 s − 30 s)/(2,8 m/s − 2,4 m/s)'],
            richtig: 0,
            optErkl: ['Richtig: Δv = 0,4 m/s, Δt = 20 s.',
              F.messwertStattDifferenz.erkl + ' Das ergäbe ' + f(2.8 / 50, 3) + ' m/s².',
              'Oben die Differenz, unten nur der Zeitpunkt 50 s. Δt = 50 s − 30 s = 20 s. Das ergäbe ' + f(0.4 / 50, 3) + ' m/s².',
              F.kehrwert.erkl + ' Das ergäbe ' + f(20 / 0.4) + ' s²/m.'] }
        ],
        antwort: A2.wert[1], einheit: 'm/s²', formel: 'a-dv',
        loesung: '<p>ā = (v₂ − v₁)/(t₂ − t₁)<br>ā = (2,8 m/s − 2,4 m/s)/(50 s − 30 s) = 0,4 m/s / 20 s = ' + f(A2.wert[1]) + ' m/s²<br>Zeitpunkt: (30 s + 50 s)/2 = ' + f(A2.t[1]) + ' s</p>' },

      { id: 'messdaten-u11', typ: 'wahl', quelle: 'Tafel S. 13, A1',
        frage: 'Tafel S. 13: Zwischen t = 70 s und t = 90 s fällt v̄ von ' + f(V2.wert[3]) + ' m/s auf ' + f(V2.wert[4]) + ' m/s. Welche mittlere Beschleunigung gehört wohin?',
        optionen: ['ā = ' + f(A2.wert[3]) + ' m/s² bei t = 80 s', 'ā = ' + f(-A2.wert[3]) + ' m/s² bei t = 80 s', 'ā = ' + f(A2.wert[3]) + ' m/s² bei t = 70 s', 'ā = ' + f(V2.wert[4] / 20) + ' m/s² bei t = 80 s'],
        richtig: 0,
        optErkl: ['Richtig: (2,4 m/s − 2,8 m/s)/(90 s − 70 s) = −0,4 m/s / 20 s = ' + f(A2.wert[3]) + ' m/s², Zeitpunkt (70 s + 90 s)/2 = 80 s. Negativ, weil der Läufer langsamer wird.',
          'Du hast Anfangswert minus Endwert gerechnet. Es heißt Endwert minus Anfangswert: 2,4 m/s − 2,8 m/s = −0,4 m/s. Der Läufer wird langsamer, also ist ā negativ.',
          F.intervallAnfang.erkl + ' Hier: (70 s + 90 s)/2 = 80 s.',
          F.messwertStattDifferenz.erkl + ' 2,4 m/s / 20 s = ' + f(V2.wert[4] / 20) + ' m/s².'] },

      { id: 'messdaten-u12', typ: 'tabelle', quelle: 'Tafel S. 13, A1',
        frage: 'Tafel S. 13: Berechne aus den mittleren Geschwindigkeiten die mittleren Beschleunigungen ā = (v₂ − v₁)/(t₂ − t₁) und ihre Zeitpunkte. Ein negatives Vorzeichen schreibst du mit.' + TAB_APP_V,
        spalten: ['aus v̄ bei', '10 s und 30 s', '30 s und 50 s', '50 s und 70 s', '70 s und 90 s'],
        zeilen: [
          { kopf: 'ā in m/s²', zellen: A2.wert.map(function (a) { return { zahl: a }; }) },
          { kopf: 't in s', zellen: A2.t.map(function (t) { return { zahl: t }; }) }
        ] },

      { id: 'messdaten-u13', typ: 'punkte', quelle: 'Tafel S. 13, A1',
        frage: 'Tafel S. 13: Stelle die mittleren Geschwindigkeiten der Lauf-App grafisch dar. Setze jeden Punkt bei der Intervallmitte.' + TAB_APP_V,
        achsen: { x: AX_APP, y: { g: 'v', e: 'm/s', min: 0, max: 3.2, schritt: 0.4 } },
        xs: V2.t.slice(), soll: V2.wert.slice(), tol: 0.1,
        kurve: paare(V2.t, V2.wert) },

      /* ----- Regel und Deutung ----- */
      { id: 'messdaten-u14', typ: 'wahl', quelle: 'Tafel S. 13, A1',
        frage: 'Die Lauf-App liefert 6 Messwerte (t = 0 s bis 100 s). Wie viele mittlere Geschwindigkeiten und wie viele mittlere Beschleunigungen kannst du daraus berechnen?',
        optionen: ['5 Geschwindigkeiten und 4 Beschleunigungen', '6 Geschwindigkeiten und 6 Beschleunigungen', '6 Geschwindigkeiten und 5 Beschleunigungen', '5 Geschwindigkeiten und 5 Beschleunigungen'],
        richtig: 0,
        optErkl: ['Richtig: n Messwerte → n − 1 Geschwindigkeiten → n − 2 Beschleunigungen. Jede Stufe braucht zwei Werte der Stufe davor.',
          'Für eine Geschwindigkeit brauchst du zwei Messungen. Zwischen 6 Messungen liegen nur 5 Intervalle, also 5 Geschwindigkeiten.',
          'Zwischen 6 Messungen liegen nur 5 Intervalle, also 5 Geschwindigkeiten. Daraus entstehen 4 Beschleunigungen.',
          'Eine Beschleunigung braucht zwei Geschwindigkeiten. Aus 5 Geschwindigkeiten entstehen nur 4 Beschleunigungen.'] },

      { id: 'messdaten-u15', typ: 'wahl', quelle: 'Tafel 17.11.',
        frage: 'Tafel 17.11.: Die Auswertung ergibt ā = ' + f(A1.wert[0]) + ' m/s² bei t = ' + f(A1.t[0]) + ' s und ā = ' + f(A1.wert[1]) + ' m/s² bei t = ' + f(A1.t[1]) + ' s. Was sagt das über die Bewegung?',
        optionen: ['Sie wird weiter schneller, aber immer weniger stark. Gleichmäßig beschleunigt ist sie nicht.',
          'Sie wird langsamer, weil ā kleiner wird.',
          'Sie ist gleichmäßig beschleunigt, weil ā positiv ist.',
          'Sie ist gleichförmig, weil ā so klein ist.'],
        richtig: 0,
        optErkl: ['Richtig: ā > 0 heißt, v nimmt zu (2,5 → 3,5 → 4 m/s). Weil ā nicht konstant ist, ist die Bewegung nicht gleichmäßig beschleunigt.',
          'Langsamer wird sie nur bei negativem ā. Hier ist ā positiv, v steigt von 2,5 auf 4 m/s. Nur der Zuwachs wird kleiner.',
          'Gleichmäßig beschleunigt heißt a = konst. Hier ändert sich ā von 0,5 auf 0,25 m/s².',
          'Gleichförmig heißt a = 0 und v = konst. Hier steigt v von 2,5 auf 4 m/s.'] },

      { id: 'messdaten-u16', typ: 'wahl', quelle: 'Tafel S. 13, A1',
        frage: 'Tafel S. 13: Bei t = 50 s und t = 70 s zeigt die Lauf-App beide Male v̄ = ' + f(V2.wert[2]) + ' m/s, also ā = 0 bei 60 s. Welcher v(t)-Graph passt zu diesem Abschnitt?',
        optionen: [D.mini('v-gleich'), D.mini('v-beschl'), D.mini('v-brems'), D.mini('v-ruhe')],
        richtig: 0,
        optErkl: ['Richtig: konstante Geschwindigkeit, waagerechte Linie oberhalb der t-Achse.',
          'Eine steigende Gerade heißt: v nimmt zu, ā > 0. Hier ist ā = 0.',
          'Eine fallende Gerade heißt: v nimmt ab, ā < 0. Das passt eher zum Ende des Laufs, nicht zu diesem Abschnitt.',
          'Eine Linie auf der t-Achse heißt v = 0, der Läufer stünde still. Er läuft aber ' + f(V2.wert[2]) + ' m/s.'] }
    ],

    trainer: ['v-gleich', 'a-dv'],

    gutachten: [
      { id: 'messdaten-g1', typ: 'rechnung',
        frage: 'Wie groß ist die mittlere Geschwindigkeit des Läufers über die ganzen 100 s der Aufzeichnung?',
        gegeben: TAB_APP + '<p>Schrittlänge ' + f(SL) + ' m</p>',
        schritte: [
          { art: 'gg', optionen: [
            'Gegeben: t₁ = 0 s, s₁ = 0 m, t₂ = 100 s, s₂ = 310 · 0,8 m = 248 m<br>Gesucht: v̄ in m/s',
            'Gegeben: t₁ = 0 s, s₁ = 0 m, t₂ = 100 s, s₂ = 310 m<br>Gesucht: v̄ in m/s',
            'Gegeben: t₁ = 0 s, s₁ = 0 m, t₂ = 100 s, s₂ = 248 m<br>Gesucht: ā in m/s²'],
            richtig: 0,
            optErkl: ['Richtig: Erst die Schritte in Meter umrechnen.',
              'Die App zählt Schritte, nicht Meter. 310 Schritte sind 310 · 0,8 m = 248 m.',
              'Gefragt ist die mittlere Geschwindigkeit über die ganze Aufzeichnung, keine Beschleunigung.'] },
          { art: 'formel', optionen: ['v̄ = (s₂ − s₁)/(t₂ − t₁)', 'v = a·t', 'v̄ = (t₂ − t₁)/(s₂ − s₁)'],
            richtig: 0,
            optErkl: ['Richtig: Δs/Δt über das ganze Intervall von 0 s bis 100 s.',
              'v = a·t gilt für eine gleichmäßig beschleunigte Bewegung aus dem Stand. Hier ist der Mittelwert aus Weg und Zeit gefragt.',
              F.kehrwert.erkl] },
          { art: 'einsetzen', optionen: ['v̄ = (248 m − 0 m)/(100 s − 0 s)', 'v̄ = (310 − 0)/(100 s − 0 s)', 'v̄ = (100 s − 0 s)/(248 m − 0 m)'],
            richtig: 0,
            optErkl: ['Richtig: 248 m in 100 s.',
              'Das sind Schritte, keine Meter. Heraus kämen ' + f(310 / 100) + ' Schritte pro Sekunde.',
              F.kehrwert.erkl + ' Das ergäbe etwa ' + f(100 / 248) + ' s/m.'] }
        ],
        antwort: r(vGesamt), einheit: 'm/s', formel: 'v-gleich',
        loesung: '<p>s₂ = 310 · 0,8 m = ' + f(S2[5]) + ' m<br>v̄ = (s₂ − s₁)/(t₂ − t₁)<br>v̄ = (248 m − 0 m)/(100 s − 0 s) = 248 m / 100 s = ' + f(vGesamt) + ' m/s<br>In km/h: ' + f(vGesamt) + ' m/s · 3,6 ≈ ' + f(P.kmh(vGesamt)) + ' km/h</p>',
        satz: { optionen: [
          'Der Läufer war im Mittel mit ' + f(vGesamt) + ' m/s unterwegs, das sind rund ' + f(P.kmh(vGesamt), 1) + ' km/h: ein normales Lauftempo.',
          'Der Läufer war im Mittel mit ' + f(vGesamt) + ' km/h unterwegs, also sehr langsam.',
          'Der Läufer war im Mittel mit ' + f(vGesamt) + ' m/s unterwegs, das sind rund ' + f(vGesamt / 3.6, 1) + ' km/h.'],
          richtig: 0,
          optErkl: ['Richtig: m/s mal 3,6 ergibt km/h.',
            'Die Rechnung liefert m/s, nicht km/h. ' + f(vGesamt) + ' m/s sind rund ' + f(P.kmh(vGesamt), 1) + ' km/h.',
            F.durch36.erkl] } },

      { id: 'messdaten-g2', typ: 'wahl',
        frage: 'Wäre der Mann mit einem E-Scooter gefahren, etwa mit 20 km/h: Wie viele Schritte hätte die App dann in 20 s gezählt (Schrittlänge ' + f(SL) + ' m)? Zum Vergleich: In der Aufzeichnung sind es höchstens ' + nMax + ' Schritte pro 20 s.',
        optionen: ['etwa ' + Math.round(nScooter) + ' Schritte', 'etwa ' + Math.round(sScooter) + ' Schritte', 'etwa ' + Math.round(20 * 20 / SL) + ' Schritte', 'etwa ' + Math.round(sScooter * SL) + ' Schritte'],
        richtig: 0,
        optErkl: ['Richtig: 20 km/h : 3,6 ≈ ' + f(vScooter) + ' m/s. In 20 s sind das s = v·t ≈ ' + f(sScooter, 1) + ' m, geteilt durch 0,8 m rund ' + Math.round(nScooter) + ' Schritte, also etwa doppelt so viele wie in der Aufzeichnung.',
          'Das sind die Meter in 20 s. Die App zählt Schritte: ' + f(sScooter, 1) + ' m : 0,8 m ≈ ' + Math.round(nScooter) + ' Schritte.',
          'Du hast 20 km/h wie 20 m/s behandelt. Erst umrechnen: 20 km/h : 3,6 ≈ ' + f(vScooter) + ' m/s.',
          'Du hast die Strecke mit der Schrittlänge malgenommen. Schrittzahl = Strecke : Schrittlänge, also ' + f(sScooter, 1) + ' m : 0,8 m.'] },

      { id: 'messdaten-g3', typ: 'wahl',
        frage: 'Die Lauf-App zeichnet ihre Geschwindigkeitskurve selbst. Sie trägt jeden v̄-Wert am Ende seines Intervalls ein, also bei 20 s, 40 s, 60 s … Was heißt das für die Kurve der App?',
        optionen: ['Jeder Punkt liegt 10 s zu spät. Richtig wäre die Intervallmitte, zum Beispiel ' + f(V2.wert[1]) + ' m/s bei 30 s statt bei 40 s.',
          'Nichts. Hauptsache, die Werte stimmen.',
          'Jeder Punkt liegt 20 s zu spät, ein ganzes Intervall.',
          'Die Werte selbst werden falsch, weil am Ende des Intervalls schon mehr Schritte gezählt sind.'],
        richtig: 0,
        optErkl: ['Richtig: Der Mittelwert gehört zur Intervallmitte. Vom Ende bis zur Mitte ist es ein halbes Intervall, also 10 s.',
          'Zum Wert gehört auch sein Zeitpunkt. Wer am falschen t einträgt, verschiebt den ganzen Graphen.',
          'Die Mitte liegt nur ein halbes Intervall vor dem Ende: 40 s − 30 s = 10 s.',
          'v̄ = Δs/Δt bleibt derselbe Wert, egal wo er eingetragen wird. Falsch ist nur der Zeitpunkt.'] },

      { id: 'messdaten-g4', typ: 'wahl',
        frage: 'Die mittleren Beschleunigungen der Lauf-App liegen zwischen ' + f(A2.wert[3]) + ' m/s² und ' + f(A2.wert[0]) + ' m/s². Was folgt daraus für das Gutachten?',
        optionen: ['Der Läufer lief fast gleichmäßig: Seine Geschwindigkeit änderte sich in 20 s um höchstens ' + f(A2.wert[0] * 20) + ' m/s.',
          'Der Läufer stand fast still, weil ā so klein ist.',
          'Bei t = 80 s lief der Läufer rückwärts, weil ā dort negativ ist.',
          'Der Läufer lief mit 0,02 m/s, also extrem langsam.'],
        richtig: 0,
        optErkl: ['Richtig: Δv = ā · Δt = 0,02 m/s² · 20 s = ' + f(A2.wert[0] * 20) + ' m/s. Kleines ā heißt: kaum Tempowechsel, nicht: langsam.',
          'Ein kleines ā heißt nicht, dass er langsam war. Es sagt nur, dass sich seine Geschwindigkeit kaum ändert. Er lief ' + f(V2.wert[0], 1) + ' bis ' + f(V2.wert[2]) + ' m/s.',
          'Negatives ā heißt: Er wird langsamer. Seine Geschwindigkeit bleibt positiv (' + f(V2.wert[4]) + ' m/s), er läuft weiter vorwärts.',
          'Du verwechselst Beschleunigung und Geschwindigkeit. 0,02 m/s² ist eine Änderung der Geschwindigkeit pro Sekunde. Er lief ' + f(V2.wert[0], 1) + ' bis ' + f(V2.wert[2]) + ' m/s.'] }
    ],

    ergebnis: '<p><strong>Ergebnis:</strong> Laut Lauf-App hat der Mann in 100 s 310 Schritte gemacht, also ' + f(S2[5]) + ' m zurückgelegt. Seine mittlere Geschwindigkeit war ' + f(vGesamt) + ' m/s (rund ' + f(P.kmh(vGesamt), 1) + ' km/h), in den einzelnen Intervallen ' + f(V2.wert[0], 1) + ' bis ' + f(V2.wert[2]) + ' m/s. Die Beschleunigungen liegen nur zwischen ' + f(A2.wert[3]) + ' und ' + f(A2.wert[0]) + ' m/s².</p>' +
      '<p>Ein E-Scooter mit 20 km/h hätte rund ' + Math.round(nScooter) + ' Schritte in 20 s ergeben, die App zeigt höchstens ' + nMax + '. Die Messdaten passen zu einem Läufer und stützen seine Aussage. Ob die App-Daten echt sind, ist keine Frage der Physik.</p>'
  });
})();
