/* Akte 1: Mittlere Geschwindigkeit v̄ = Δs/Δt.
   Fall: Lkw im Elbtunnel (erfundene Messung, 3,3 km, Tempo 80). Vergleichsfahrt eines Transporters (Fahrtenschreiber).
   Quellen: Tafel S. 1 (84,7 m in 61,5 s, 82,8 m in 60 s, 4968 m in 1 h). Alle Zahlen über W.physik. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik, D = W.diagramm;
  W.akten = W.akten || [];
  var F = P.FEHLER;
  var f = function (x, n) { return P.fmt(x, n); };

  /* Tafel S. 1: Unterrichtsmessung */
  var VT = P.vGleich(84.7, 61.5);          // ≈ 1,3772 m/s (Tafel: 1,38 m/s)
  var VT_KMH = P.kmh(VT);                  // ≈ 4,958 km/h (Tafel: 4,95 km/h)
  var S60 = P.sGleich(1.38, 60);           // 82,8 m (Tafel, mit gerundetem 1,38 m/s)
  var S3600 = P.sGleich(1.38, 3600);       // 4968 m (Tafel)

  /* Fall: Lkw im Elbtunnel, Kameras 3,3 km auseinander, 14:32:08 und 14:34:23 Uhr */
  var DS = 3300, DT = 2 * 60 + 15;         // 135 s
  var V_LKW = P.vGleich(DS, DT);           // ≈ 24,44 m/s
  var V_LKW_KMH = P.kmh(V_LKW);            // 88 km/h
  var V80 = P.ms(80);                      // ≈ 22,22 m/s
  var T80 = P.tGleich(DS, V80);            // 148,5 s
  /* Zweiter Lkw: 2 min 35 s */
  var DT2 = 2 * 60 + 35;                   // 155 s
  var V2 = P.vGleich(DS, DT2);             // ≈ 21,29 m/s
  var V2_KMH = P.kmh(V2);                  // ≈ 76,65 km/h
  /* Reisebus (Üben): 09:15:40 bis 09:18:25 */
  var DT_BUS = 2 * 60 + 45;                // 165 s
  var V_BUS = P.vGleich(DS, DT_BUS);       // 20 m/s = 72 km/h

  /* Vergleichsfahrt Transporter: 20 m/s bis 40 s, 25 m/s bis 100 s, 12,5 m/s bis 180 s */
  var TR_T = [0, 40, 100, 180];
  var TR_S = [0, P.sGleich(20, 40), P.sGleich(25, 60, P.sGleich(20, 40)), 0];
  TR_S[3] = P.sGleich(12.5, 80, TR_S[2]);  // 0; 800; 2300; 3300 m
  var TR_V = P.mittel(TR_T, TR_S).wert;    // 20; 25; 12,5 m/s
  var TR_VM = P.vGleich(TR_S[3], TR_T[3]); // ≈ 18,33 m/s = 66 km/h
  var TR_PUNKTE = TR_T.map(function (t, i) { return [t, TR_S[i]]; });
  var TR_VT = [[0, TR_V[0]], [40, TR_V[0]], [40, TR_V[1]], [100, TR_V[1]], [100, TR_V[2]], [180, TR_V[2]]];
  var AX_TR_T = { g: 't', e: 's', max: 180, schritt: 20 };

  /* Plus: halbe Strecke 60 km/h, halbe Strecke 100 km/h */
  var T_H1 = P.tGleich(DS / 2, P.ms(60));  // 99 s
  var T_H2 = P.tGleich(DS / 2, P.ms(100)); // 59,4 s
  var V_HALB = P.kmh(P.vGleich(DS, T_H1 + T_H2)); // 75 km/h

  W.akten.push({
    id: 'mittel', nr: 1, titel: 'Mittlere Geschwindigkeit',
    fall: 'Lkw im Elbtunnel: „Ich war nicht zu schnell.“',

    auftrag: {
      text: '<p>Elbtunnel, Fahrtrichtung Süd. Für eine Verkehrsstudie hat ein Messteam am Nordportal (Othmarschen) und am Südportal (Waltershof) je eine Kamera mit genauer Uhr aufgestellt. ' +
        'Die beiden Kameras liegen ' + f(DS / 1000) + ' km auseinander, im Tunnel gilt Tempo 80. Die Messung ist für diese Akte erfunden.</p>' +
        '<p>Ein Lkw fällt auf. Die Spedition lässt das prüfen, denn der Fahrer sagt: „Ich war nicht zu schnell. Bei der Einfahrt zeigte mein Tacho 70.“</p>',
      daten: '<table><tr><th></th><th>Kamera Nord</th><th>Kamera Süd</th></tr>' +
        '<tr><th>Ort</th><td>0 km</td><td>' + f(DS / 1000) + ' km</td></tr>' +
        '<tr><th>Uhrzeit</th><td>14:32:08</td><td>14:34:23</td></tr></table>',
      chefin: 'Akte 1. Der Fahrer sagt, er war nicht zu schnell. Zwei Uhrzeiten und ' + f(DS / 1000) + ' km Tunnel reichen, um das zu prüfen.',
      leitfrage: 'War der Lkw im Elbtunnel zu schnell, obwohl sein Tacho bei der Einfahrt 70 km/h zeigte?'
    },

    karten: [
      { titel: 'Mittlere Geschwindigkeit: v̄ = Δs/Δt',
        text: '<p>Die mittlere Geschwindigkeit ist die ganze Strecke geteilt durch die ganze Zeit, die dafür gebraucht wurde: <strong>v̄ = Δs/Δt</strong>. Der Strich über dem v heißt „Mittelwert“.</p>' +
          '<p>Δ (Delta) heißt „Differenz“: Δs = s₂ − s₁ ist die zurückgelegte Strecke, Δt = t₂ − t₁ die Zeitspanne, jeweils Endwert minus Anfangswert.</p>' +
          '<p>Messung aus dem Unterricht (Tafel S. 1): 84,7 m in 61,5 s.<br>v̄ = Δs/Δt = 84,7 m / 61,5 s ≈ ' + f(VT) + ' m/s ≈ ' + f(VT_KMH) + ' km/h (an der Tafel 4,95 km/h), also etwa Schritttempo.</p>',
        merk: 'v̄ = Δs/Δt. Δ heißt Differenz: Endwert minus Anfangswert.',
        achtung: '<p>Δt ist eine Zeitspanne, kein Zeitpunkt. Bei Uhrzeiten erst die Differenz bilden: 14:34:23 − 14:32:08 = 2 min 15 s.</p>' },

      { titel: 'Mittel ist nicht momentan',
        text: '<p>Der Tacho zeigt die <strong>Momentangeschwindigkeit</strong>, also wie schnell ein Fahrzeug in genau diesem Augenblick ist. Die mittlere Geschwindigkeit tut so, als wäre es die ganze Zeit gleich schnell gefahren.</p>' +
          '<p>Beispiel Transporter im Tunnel: erst ' + f(P.kmh(TR_V[0])) + ' km/h, dann ' + f(P.kmh(TR_V[1])) + ' km/h, am Ende im zähen Verkehr nur noch ' + f(P.kmh(TR_V[2])) + ' km/h. ' +
          'Insgesamt ' + f(TR_S[3]) + ' m in ' + f(TR_T[3]) + ' s, also v̄ ≈ ' + f(TR_VM) + ' m/s = ' + f(P.kmh(TR_VM)) + ' km/h. Dazwischen war er schneller und langsamer als v̄.</p>' +
          '<p>Das Diagramm ist vereinfacht: Die Tempowechsel passieren darin sofort.</p>',
        abb: { achsen: { x: AX_TR_T, y: { g: 'v', e: 'm/s', max: 30, schritt: 5 } },
          kurven: [{ punkte: TR_VT, farbe: 'v', label: 'v(t)' }, { punkte: [[0, TR_VM], [180, TR_VM]], farbe: 'v', label: 'v̄ ≈ ' + f(TR_VM) + ' m/s' }] },
        merk: 'Liegt v̄ über dem Tempolimit, war das Fahrzeug mindestens zeitweise zu schnell. Liegt v̄ darunter, kann es trotzdem zeitweise zu schnell gewesen sein.',
        achtung: '<p>Ein einzelner Tachowert sagt nichts über die ganze Fahrt. Wer eine Zeit lang langsamer als v̄ war, muss an anderer Stelle schneller als v̄ gewesen sein.</p>' },

      { titel: 'Im s(t)-Graphen: Steigung zwischen zwei Punkten',
        text: '<p>Der Fahrtenschreiber des Transporters liefert seinen Ort s zu jeder Zeit t. Für die mittlere Geschwindigkeit zwischen zwei Zeitpunkten brauchst du nur zwei Punkte des Graphen:</p>' +
          '<p>zwischen 0 s und ' + f(TR_T[1]) + ' s: v̄ = (' + f(TR_S[1]) + ' m − 0 m)/(' + f(TR_T[1]) + ' s − 0 s) = ' + f(TR_V[0]) + ' m/s.</p>' +
          '<p>Je steiler der Graph, desto schneller das Fahrzeug. v̄ ist die Steigung der geraden Verbindungslinie zwischen den beiden Punkten.</p>',
        abb: { achsen: { x: AX_TR_T, y: { g: 's', e: 'm', max: 3500, schritt: 500 } },
          kurven: [{ punkte: TR_PUNKTE, farbe: 's', label: 's(t)' }], marken: TR_PUNKTE.slice(1) },
        merk: 'v̄ = (s₂ − s₁)/(t₂ − t₁): Differenz der Orte durch Differenz der Zeiten.',
        achtung: '<p>Für den Abschnitt von ' + f(TR_T[1]) + ' s bis ' + f(TR_T[2]) + ' s rechnest du nicht ' + f(TR_S[2]) + ' m / ' + f(TR_T[2]) + ' s. Das wäre die mittlere Geschwindigkeit ab der Einfahrt. Immer beide Differenzen bilden: Ort minus Ort, Zeit minus Zeit.</p>' },

      { titel: 'Umrechnen: Sekunden, Meter, km/h',
        text: '<p>Gerechnet wird in Metern und Sekunden. Erst danach rechnest du das Ergebnis in km/h um, damit du es mit dem Tempolimit vergleichen kannst.</p>' +
          '<p>Zeit: 2 min 15 s = 2·60 s + 15 s = 135 s. Eine Stunde: 1 h = 60·60 s = 3600 s.<br>Strecke: ' + f(DS / 1000) + ' km = ' + f(DS) + ' m.<br>' +
          'Geschwindigkeit: m/s · 3,6 ergibt km/h, km/h : 3,6 ergibt m/s. Tempo 80 sind 80 : 3,6 ≈ ' + f(V80) + ' m/s.</p>',
        merk: 'min → s: mal 60. km → m: mal 1000. m/s → km/h: mal 3,6.',
        achtung: '<p>2 min 15 s sind nicht 2,15 min und nicht 215 s. Eine Minute hat 60 s, nicht 100 s: 2 min 15 s = 2,25 min = 135 s.</p>' },

      { titel: 'Rückwärts: Strecke aus v̄',
        text: '<p>Mit Seitentausch wird aus v = s/t die Formel für die Strecke: v = s/t | ·t ergibt s = v·t. ' +
          'Das gilt auch mit v̄: Wer im selben Tempo weitergeht, legt in der Zeit t die Strecke s = v̄·t zurück.</p>' +
          '<p>Tafel S. 1 mit v̄ = 1,38 m/s:<br>in 60 s: s = 1,38 m/s · 60 s = ' + f(S60) + ' m<br>in 1 h: s = 1,38 m/s · 3600 s = ' + f(S3600) + ' m, also rund 5 km.</p>',
        merk: 's = v̄·t, die Zeit in Sekunden.',
        achtung: '<p>Die Tafel rechnet mit dem gerundeten 1,38 m/s. Mit dem genauen v̄ ≈ ' + f(VT, 4) + ' m/s kommen ' + f(P.sGleich(VT, 60)) + ' m und ' + f(P.sGleich(VT, 3600), 0) + ' m heraus. Beides gilt.</p>' },

      { titel: 'v̄ ist nicht der Mittelwert der Geschwindigkeiten', plus: true,
        text: '<p>Ein Auto fährt die erste Hälfte des Tunnels (1650 m) mit 60 km/h, die zweite mit 100 km/h. v̄ ist nicht (60 + 100)/2 = 80 km/h.</p>' +
          '<p>Zeiten: t₁ = 1650 m / ' + f(P.ms(60)) + ' m/s = ' + f(T_H1) + ' s, t₂ = 1650 m / ' + f(P.ms(100)) + ' m/s = ' + f(T_H2) + ' s.<br>' +
          'v̄ = 3300 m / ' + f(T_H1 + T_H2) + ' s ≈ ' + f(P.vGleich(DS, T_H1 + T_H2)) + ' m/s = ' + f(V_HALB) + ' km/h.</p>' +
          '<p>Im langsamen Abschnitt ist das Auto länger unterwegs, darum zählt er stärker.</p>' }
    ],

    ueben: [
      /* ----- Tafel S. 1 ----- */
      { id: 'mittel-u1', typ: 'rechnung', quelle: 'Tafel S. 1',
        frage: 'Tafel S. 1: Bei einer Messung im Unterricht wurde eine Strecke von 84,7 m in 61,5 s zurückgelegt. Berechne die mittlere Geschwindigkeit v̄.',
        gegeben: '<p>Δs = 84,7 m, Δt = 61,5 s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: Δs = 84,7 m, Δt = 61,5 s<br>Gesucht: v̄ in m/s', 'Gegeben: Δs = 84,7 m, Δt = 61,5 s<br>Gesucht: s in m', 'Gegeben: v = 84,7 m/s, Δt = 61,5 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: Strecke und Zeit sind gemessen, gesucht ist die mittlere Geschwindigkeit.',
              'Die Strecke ist schon gemessen. Gesucht ist die mittlere Geschwindigkeit.',
              '84,7 m ist eine Strecke, keine Geschwindigkeit. Schau auf die Einheit.'] },
          { art: 'formel', optionen: ['v̄ = Δs/Δt', 'v̄ = Δt/Δs', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Strecke geteilt durch die Zeit, die dafür gebraucht wurde.', F.kehrwert.erkl,
              'Eine Beschleunigung ist nicht gegeben. Für v̄ brauchst du nur Strecke und Zeit.'] },
          { art: 'einsetzen', optionen: ['v̄ = 84,7 m / 61,5 s', 'v̄ = 61,5 s / 84,7 m', 'v̄ = 84,7 m · 61,5 s'], richtig: 0,
            optErkl: ['Richtig: Meter durch Sekunden ergibt m/s.',
              F.kehrwert.erkl + ' Das ergäbe ≈ ' + f(61.5 / 84.7) + ' s/m.',
              'Geschwindigkeit ist Strecke pro Zeit. Du musst teilen, nicht malnehmen. Das ergäbe ' + f(84.7 * 61.5) + ' m·s.'] }
        ],
        antwort: VT, auch: [1.38], einheit: 'm/s', formel: 'v-gleich',
        loesung: '<p>v̄ = Δs/Δt</p><p>v̄ = 84,7 m / 61,5 s ≈ ' + f(VT) + ' m/s</p>' },

      { id: 'mittel-u2', typ: 'rechnung', quelle: 'Tafel S. 1',
        frage: 'Tafel S. 1: Rechne die mittlere Geschwindigkeit aus der Unterrichtsmessung (v̄ = 84,7 m / 61,5 s ≈ ' + f(VT, 3) + ' m/s) in km/h um.',
        gegeben: '<p>v̄ ≈ ' + f(VT, 3) + ' m/s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v̄ = ' + f(VT, 3) + ' m/s<br>Gesucht: v̄ in km/h', 'Gegeben: v̄ = ' + f(VT, 3) + ' km/h<br>Gesucht: v̄ in m/s', 'Gegeben: v̄ = ' + f(VT, 3) + ' m/s²<br>Gesucht: v̄ in km/h'],
            richtig: 0,
            optErkl: ['Richtig: Gegeben in m/s, gesucht in km/h.',
              'Du hast die Richtung vertauscht. Gegeben sind m/s, gesucht sind km/h.',
              'm/s² ist die Einheit der Beschleunigung. Die Geschwindigkeit hat m/s.'] },
          { art: 'formel', optionen: ['v in km/h = v in m/s · 3,6', 'v in km/h = v in m/s : 3,6', 'v = s/t'], richtig: 0,
            optErkl: ['Richtig: 1 m/s = 3,6 km/h. Von m/s nach km/h nimmst du mal 3,6.', F.durch36.erkl,
              'v̄ ist schon ausgerechnet. Jetzt rechnest du nur die Einheit um.'] },
          { art: 'einsetzen', optionen: ['v̄ = ' + f(VT, 3) + ' · 3,6 km/h', 'v̄ = ' + f(VT, 3) + ' : 3,6 km/h', 'v̄ = 3,6 : ' + f(VT, 3) + ' km/h'], richtig: 0,
            optErkl: ['Richtig: die Zahl in m/s mal 3,6.',
              F.durch36.erkl + ' Das ergäbe nur ' + f(VT / 3.6) + ' km/h, ein Kriechen.',
              'Du hast 3,6 durch die Geschwindigkeit geteilt. Richtig ist Geschwindigkeit mal 3,6. Das ergäbe ' + f(3.6 / VT) + ' km/h.'] }
        ],
        antwort: VT_KMH, auch: [4.95, P.kmh(1.38)], einheit: 'km/h', formel: 'ms-kmh',
        loesung: '<p>v in km/h = v in m/s · 3,6</p><p>v̄ ≈ ' + f(VT, 3) + ' · 3,6 km/h ≈ ' + f(VT_KMH) + ' km/h</p>' +
          '<p>An der Tafel steht 4,95 km/h. Das ist ungefähr Schritttempo.</p>' },

      { id: 'mittel-u3', typ: 'rechnung', quelle: 'Tafel S. 1',
        frage: 'Tafel S. 1: Welche Strecke wird mit derselben mittleren Geschwindigkeit v̄ = 1,38 m/s in 60 s zurückgelegt?',
        gegeben: '<p>v̄ = 1,38 m/s, t = 60 s</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v̄ = 1,38 m/s, t = 60 s<br>Gesucht: s in m', 'Gegeben: v̄ = 1,38 m/s, t = 60 s<br>Gesucht: v in km/h', 'Gegeben: s = 1,38 m, t = 60 s<br>Gesucht: v in m/s'],
            richtig: 0,
            optErkl: ['Richtig: Geschwindigkeit und Zeit sind gegeben, gesucht ist die Strecke.',
              'Gefragt ist eine Strecke, keine Geschwindigkeit.',
              '1,38 m/s ist eine Geschwindigkeit, keine Strecke. Schau auf die Einheit.'] },
          { art: 'formel', optionen: ['s = v·t', 's = v/t', 's = a/2·t²'], richtig: 0,
            optErkl: ['Richtig: v = s/t | ·t ergibt s = v·t.',
              'Aus v = s/t wird mit | ·t die Formel s = v·t. Du hast geteilt statt malgenommen.',
              'Das ist die Formel für eine beschleunigte Bewegung aus dem Stand. Hier rechnest du mit der mittleren Geschwindigkeit.'] },
          { art: 'einsetzen', optionen: ['s = 1,38 m/s · 60 s', 's = 1,38 m/s / 60 s', 's = 1,38 m/s · 1 min'], richtig: 0,
            optErkl: ['Richtig: Die Sekunden kürzen sich weg, übrig bleibt m.',
              'Du hast geteilt statt malgenommen. Das ergäbe ' + f(1.38 / 60, 3) + ' m/s², keine Strecke.',
              'Die Einheiten kürzen sich nicht. Erst 1 min = 60 s umrechnen, sonst rechnest du 1,38 · 1.'] }
        ],
        antwort: S60, auch: [P.sGleich(VT, 60)], einheit: 'm', formel: 's-gleich',
        loesung: '<p>v = s/t | ·t (Seitentausch)<br>s = v·t</p><p>s = 1,38 m/s · 60 s = ' + f(S60) + ' m</p>' +
          '<p>Mit dem ungerundeten v̄ ≈ ' + f(VT, 4) + ' m/s sind es ≈ ' + f(P.sGleich(VT, 60)) + ' m. Beide Werte gelten.</p>' },

      { id: 'mittel-u4', typ: 'rechnung', quelle: 'Tafel S. 1',
        frage: 'Tafel S. 1: Welche Strecke wird mit derselben mittleren Geschwindigkeit v̄ = 1,38 m/s in einer Stunde zurückgelegt?',
        gegeben: '<p>v̄ = 1,38 m/s, t = 1 h</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v̄ = 1,38 m/s, t = 1 h = 3600 s<br>Gesucht: s in m', 'Gegeben: v̄ = 1,38 m/s, t = 1 h = 60 s<br>Gesucht: s in m', 'Gegeben: v̄ = 1,38 m/s, t = 1 h = 100 s<br>Gesucht: s in m'],
            richtig: 0,
            optErkl: ['Richtig: 1 h = 60 min = 60·60 s = 3600 s.',
              '60 s sind eine Minute. Eine Stunde hat 60 Minuten zu je 60 s, also 3600 s.',
              'Die Zeit ist nicht dezimal eingeteilt: 1 h = 60 min = 3600 s.'] },
          { art: 'formel', optionen: ['s = v·t', 's = v/t', 's = a/2·t²'], richtig: 0,
            optErkl: ['Richtig: v = s/t | ·t ergibt s = v·t.',
              'Aus v = s/t wird mit | ·t die Formel s = v·t. Du hast geteilt statt malgenommen.',
              'Das ist die Formel für eine beschleunigte Bewegung aus dem Stand. Hier rechnest du mit der mittleren Geschwindigkeit.'] },
          { art: 'einsetzen', optionen: ['s = 1,38 m/s · 3600 s', 's = 1,38 m/s · 1 h', 's = 1,38 m/s · 60 s'], richtig: 0,
            optErkl: ['Richtig: Die Sekunden kürzen sich weg, übrig bleibt m.',
              'Die Einheiten kürzen sich nicht. Erst 1 h = 3600 s umrechnen, sonst rechnest du 1,38 · 1.',
              'Das ist eine Minute, keine Stunde. Das ergäbe nur ' + f(S60) + ' m.'] }
        ],
        antwort: S3600, auch: [P.sGleich(VT, 3600)], einheit: 'm', formel: 's-gleich-h',
        loesung: '<p>1 h = 60 · 60 s = 3600 s</p><p>s = v·t</p><p>s = 1,38 m/s · 3600 s = ' + f(S3600) + ' m ≈ 5 km</p>' +
          '<p>Das passt zu rund 5 km/h. Mit dem ungerundeten v̄ ≈ ' + f(VT, 4) + ' m/s sind es ≈ ' + f(P.sGleich(VT, 3600), 0) + ' m.</p>' },

      { id: 'mittel-u5', typ: 'wahl', quelle: 'Tafel S. 1',
        frage: 'Tafel S. 1: Bei der Messung im Unterricht kam v̄ ≈ 1,38 m/s heraus (84,7 m in 61,5 s). Was sagt dieser Wert?',
        optionen: ['Im Mittel wurden pro Sekunde 1,38 m zurückgelegt. Zwischendurch kann das Tempo schneller oder langsamer gewesen sein.',
          'In jeder einzelnen Sekunde wurden genau 1,38 m zurückgelegt.',
          'Schneller als 1,38 m/s war man während der Messung nie.',
          'Nach 1 s war man 1,38 m/s schnell, danach immer schneller.'],
        richtig: 0,
        optErkl: ['Richtig: v̄ tut so, als wäre die ganze Strecke gleich schnell zurückgelegt worden. Was dazwischen geschah, verrät der Wert nicht.',
          'Das wäre eine gleichförmige Bewegung. Gemessen wurden nur Anfang und Ende, über die einzelnen Sekunden sagt v̄ nichts.',
          'v̄ ist kein Höchstwert. War man irgendwann langsamer als 1,38 m/s, muss man an anderer Stelle schneller gewesen sein.',
          'Das beschreibt eine beschleunigte Bewegung. v̄ sagt nichts darüber, ob man schneller oder langsamer wurde.'] },

      /* ----- Zeiten und Differenzen ----- */
      { id: 'mittel-u6', typ: 'wahl',
        frage: 'Ein Reisebus fährt durch den Elbtunnel. Kamera Nord: 09:15:40 Uhr, Kamera Süd: 09:18:25 Uhr. Wie groß ist die Zeitspanne Δt in Sekunden?',
        optionen: [f(DT_BUS) + ' s', '245 s', f(2.45 * 60) + ' s', f(18 * 60 + 25) + ' s'],
        richtig: 0,
        optErkl: ['Richtig: Δt = t₂ − t₁ = 09:18:25 − 09:15:40 = 2 min 45 s = 2·60 s + 45 s = ' + f(DT_BUS) + ' s.',
          'Du hast „2 min 45 s“ als 245 s gelesen. Eine Minute hat 60 s, nicht 100 s: 2·60 s + 45 s = ' + f(DT_BUS) + ' s.',
          'Du hast 2 min 45 s als 2,45 min gerechnet. 45 s sind aber 0,75 min, also 2,75 min = ' + f(DT_BUS) + ' s.',
          'Du hast nur den Messwert t₂ umgerechnet (18 min 25 s nach 9 Uhr). Gesucht ist die Differenz Δt = t₂ − t₁.'] },

      { id: 'mittel-u7', typ: 'zuordnen',
        frage: 'Ordne jeder Zeitangabe die passende Zahl von Sekunden zu.',
        paare: [['2 min 15 s', f(DT) + ' s'], ['2,15 min', f(2.15 * 60) + ' s'], ['1 h 5 min', f(65 * 60) + ' s'], ['0,75 min', f(0.75 * 60) + ' s']],
        erkl: 'Minuten mal 60 ergibt Sekunden. 2 min 15 s = 2·60 s + 15 s = 135 s, aber 2,15 min = 2,15·60 s = 129 s. Die Stellen nach dem Komma sind keine Sekunden.' },

      { id: 'mittel-u8', typ: 'rechnung',
        frage: 'Der Reisebus passiert die Kamera Nord um 09:15:40 Uhr und die Kamera Süd um 09:18:25 Uhr. Die Kameras liegen ' + f(DS / 1000) + ' km auseinander. Wie groß ist seine mittlere Geschwindigkeit in km/h?',
        gegeben: '<p>Δs = ' + f(DS / 1000) + ' km, t₁ = 09:15:40 Uhr, t₂ = 09:18:25 Uhr</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: Δs = ' + f(DS) + ' m, Δt = 2 min 45 s = ' + f(DT_BUS) + ' s<br>Gesucht: v̄ in km/h',
            'Gegeben: Δs = ' + f(DS) + ' m, Δt = 2 min 45 s = 245 s<br>Gesucht: v̄ in km/h',
            'Gegeben: Δs = ' + f(DS) + ' m, t = 09:18:25 Uhr<br>Gesucht: v̄ in km/h'],
            richtig: 0,
            optErkl: ['Richtig: Δt = t₂ − t₁ = 2 min 45 s = 2·60 s + 45 s = ' + f(DT_BUS) + ' s, Δs in Metern.',
              'Eine Minute hat 60 s, nicht 100 s: 2 min 45 s = ' + f(DT_BUS) + ' s.',
              'Eine Uhrzeit ist ein Zeitpunkt, keine Zeitspanne. Du brauchst Δt = t₂ − t₁.'] },
          { art: 'formel', optionen: ['v̄ = Δs/Δt, dann · 3,6', 'v̄ = Δs/Δt, dann : 3,6', 'v̄ = Δt/Δs, dann · 3,6'], richtig: 0,
            optErkl: ['Richtig: Erst v̄ in m/s, dann mal 3,6 für km/h.', F.durch36.erkl, F.kehrwert.erkl] },
          { art: 'einsetzen', optionen: ['v̄ = ' + f(DS) + ' m / ' + f(DT_BUS) + ' s, dann · 3,6', 'v̄ = ' + f(DS / 1000) + ' km / ' + f(DT_BUS) + ' s, dann · 3,6', 'v̄ = ' + f(DS) + ' m / ' + f(DT_BUS) + ' s, dann : 3,6'], richtig: 0,
            optErkl: ['Richtig: Meter durch Sekunden, danach mal 3,6.',
              'Kilometer und Sekunden gemischt: Das ergäbe ' + f(DS / 1000 / DT_BUS * 3.6, 3) + ' km/h. Erst 3,3 km = 3300 m umrechnen.',
              F.durch36.erkl + ' Das ergäbe ' + f(V_BUS / 3.6) + ' km/h.'] }
        ],
        antwort: P.kmh(V_BUS), einheit: 'km/h', formel: 'v-mittel-kmh',
        loesung: '<p>Δs = ' + f(DS / 1000) + ' km = ' + f(DS) + ' m<br>Δt = 09:18:25 − 09:15:40 = 2 min 45 s = ' + f(DT_BUS) + ' s</p>' +
          '<p>v̄ = Δs/Δt</p><p>v̄ = ' + f(DS) + ' m / ' + f(DT_BUS) + ' s = ' + f(V_BUS) + ' m/s<br>' + f(V_BUS) + ' m/s = ' + f(V_BUS) + ' · 3,6 km/h = ' + f(P.kmh(V_BUS)) + ' km/h</p>' },

      { id: 'mittel-u9', typ: 'wahl',
        frage: 'Tempo 80 im Tunnel: Wie viel m/s sind 80 km/h?',
        optionen: ['≈ ' + f(V80) + ' m/s', f(P.kmh(80)) + ' m/s', '≈ ' + f(80 / 60) + ' m/s', f(3.6 / 80, 3) + ' m/s'],
        richtig: 0,
        optErkl: ['Richtig: 80 : 3,6 ≈ ' + f(V80) + '. So kannst du Tempo 80 direkt mit einem Ergebnis in m/s vergleichen.',
          F.mal36.erkl + ' ' + f(P.kmh(80)) + ' m/s wären über 1000 km/h.',
          'Du hast durch 60 geteilt, als ginge es um Minuten. Eine Stunde hat 3600 s und ein Kilometer 1000 m, daher der Faktor 3,6.',
          'Du hast 3,6 durch die Geschwindigkeit geteilt. Es ist umgekehrt: Geschwindigkeit geteilt durch 3,6.'] },

      /* ----- Vergleichsfahrt Transporter: Momentan und mittel ----- */
      { id: 'mittel-u10', typ: 'wahl',
        frage: 'Welcher s(t)-Graph gehört zu einer Fahrt, bei der das Fahrzeug die ganze Zeit fährt und seine Momentangeschwindigkeit immer gleich der mittleren Geschwindigkeit v̄ ist?',
        optionen: ['s-gleich', 's-beschl', 's-brems', 's-ruhe'].map(function (a) { return D.mini(a); }),
        richtig: 0,
        optErkl: ['Richtig: Ist v immer gleich v̄, kommt in jeder Sekunde dieselbe Strecke dazu. Der s(t)-Graph ist eine Ursprungsgerade mit der Steigung v̄.',
          'Dieser Graph wird immer steiler: Das Fahrzeug wird schneller. Am Anfang ist es langsamer als v̄, am Ende schneller.',
          'Dieser Graph wird immer flacher: Das Fahrzeug bremst. Erst ist es schneller als v̄, dann langsamer.',
          'Der Ort ändert sich nicht: Das Fahrzeug steht die ganze Zeit (v = 0). Gefragt ist eine Fahrt, bei der es die ganze Zeit fährt.'] },

      { id: 'mittel-u11', typ: 'wahl',
        frage: 'Fahrtenschreiber eines Transporters im Elbtunnel: Bei t₁ = ' + f(TR_T[1]) + ' s ist er s₁ = ' + f(TR_S[1]) + ' m, bei t₂ = ' + f(TR_T[2]) + ' s ist er s₂ = ' + f(TR_S[2]) + ' m hinter der Einfahrt (markierte Punkte). ' +
          'Wie groß ist seine mittlere Geschwindigkeit zwischen ' + f(TR_T[1]) + ' s und ' + f(TR_T[2]) + ' s?',
        abb: { achsen: { x: AX_TR_T, y: { g: 's', e: 'm', max: 3500, schritt: 500 } },
          kurven: [{ punkte: TR_PUNKTE, farbe: 's', label: 's(t)' }], marken: [TR_PUNKTE[1], TR_PUNKTE[2]] },
        optionen: [f(TR_V[1]) + ' m/s', f(TR_S[2] / TR_T[2]) + ' m/s', f((TR_S[2] - TR_S[1]) / TR_T[2]) + ' m/s', '≈ ' + f(TR_S[2] / (TR_T[2] - TR_T[1])) + ' m/s'],
        richtig: 0,
        optErkl: ['Richtig: v̄ = (' + f(TR_S[2]) + ' m − ' + f(TR_S[1]) + ' m)/(' + f(TR_T[2]) + ' s − ' + f(TR_T[1]) + ' s) = ' + f(TR_S[2] - TR_S[1]) + ' m / ' + f(TR_T[2] - TR_T[1]) + ' s = ' + f(TR_V[1]) + ' m/s = ' + f(P.kmh(TR_V[1])) + ' km/h.',
          F.messwertStattDifferenz.erkl + ' ' + f(TR_S[2]) + ' m / ' + f(TR_T[2]) + ' s gilt ab der Einfahrt, nicht zwischen ' + f(TR_T[1]) + ' s und ' + f(TR_T[2]) + ' s.',
          'Oben steht die Differenz, unten nur der Zeitpunkt ' + f(TR_T[2]) + ' s. Auch die Zeit braucht die Differenz: ' + f(TR_T[2]) + ' s − ' + f(TR_T[1]) + ' s = ' + f(TR_T[2] - TR_T[1]) + ' s.',
          'Unten steht die Differenz, oben aber der Messwert ' + f(TR_S[2]) + ' m. Auch die Strecke braucht die Differenz: ' + f(TR_S[2]) + ' m − ' + f(TR_S[1]) + ' m = ' + f(TR_S[2] - TR_S[1]) + ' m.'] },

      { id: 'mittel-u12', typ: 'rechnung',
        frage: 'Fahrtenschreiber des Transporters: Bei t₁ = ' + f(TR_T[2]) + ' s ist er s₁ = ' + f(TR_S[2]) + ' m hinter der Einfahrt, bei t₂ = ' + f(TR_T[3]) + ' s an der Ausfahrt (s₂ = ' + f(TR_S[3]) + ' m). Berechne seine mittlere Geschwindigkeit in diesem Abschnitt.',
        gegeben: '<p>t₁ = ' + f(TR_T[2]) + ' s, s₁ = ' + f(TR_S[2]) + ' m, t₂ = ' + f(TR_T[3]) + ' s, s₂ = ' + f(TR_S[3]) + ' m</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: t₁ = ' + f(TR_T[2]) + ' s, s₁ = ' + f(TR_S[2]) + ' m, t₂ = ' + f(TR_T[3]) + ' s, s₂ = ' + f(TR_S[3]) + ' m<br>Gesucht: v̄ in m/s',
            'Gegeben: t₂ = ' + f(TR_T[3]) + ' s, s₂ = ' + f(TR_S[3]) + ' m<br>Gesucht: v̄ in m/s',
            'Gegeben: t₁ = ' + f(TR_T[2]) + ' s, s₁ = ' + f(TR_S[2]) + ' m, t₂ = ' + f(TR_T[3]) + ' s, s₂ = ' + f(TR_S[3]) + ' m<br>Gesucht: ā in m/s²'],
            richtig: 0,
            optErkl: ['Richtig: Du brauchst beide Punkte, die den Abschnitt begrenzen.',
              'Mit einem einzigen Punkt kannst du keine Differenz bilden. Du brauchst Anfang und Ende des Abschnitts.',
              'Gefragt ist eine Geschwindigkeit, keine Beschleunigung.'] },
          { art: 'formel', optionen: ['v̄ = (s₂ − s₁)/(t₂ − t₁)', 'v̄ = s₂/t₂', 'v̄ = (t₂ − t₁)/(s₂ − s₁)'], richtig: 0,
            optErkl: ['Richtig: Δs/Δt für den Abschnitt von Punkt 1 bis Punkt 2.', F.messwertStattDifferenz.erkl, F.kehrwert.erkl] },
          { art: 'einsetzen', optionen: ['v̄ = (' + f(TR_S[3]) + ' m − ' + f(TR_S[2]) + ' m)/(' + f(TR_T[3]) + ' s − ' + f(TR_T[2]) + ' s)', 'v̄ = ' + f(TR_S[3]) + ' m / ' + f(TR_T[3]) + ' s', 'v̄ = (' + f(TR_S[3]) + ' m − ' + f(TR_S[2]) + ' m)/' + f(TR_T[3]) + ' s'], richtig: 0,
            optErkl: ['Richtig: Endwert minus Anfangswert, oben die Meter, unten die Sekunden.',
              F.messwertStattDifferenz.erkl + ' Das ergäbe ≈ ' + f(TR_VM) + ' m/s, den Wert für die ganze Tunnelfahrt.',
              'Oben steht die Differenz, unten nur der Zeitpunkt ' + f(TR_T[3]) + ' s. Auch die Zeit braucht die Differenz. Das ergäbe ≈ ' + f((TR_S[3] - TR_S[2]) / TR_T[3]) + ' m/s.'] }
        ],
        antwort: TR_V[2], einheit: 'm/s', formel: 'v-mittel',
        loesung: '<p>v̄ = (s₂ − s₁)/(t₂ − t₁)<br>v̄ = (' + f(TR_S[3]) + ' m − ' + f(TR_S[2]) + ' m)/(' + f(TR_T[3]) + ' s − ' + f(TR_T[2]) + ' s) = ' +
          f(TR_S[3] - TR_S[2]) + ' m / ' + f(TR_T[3] - TR_T[2]) + ' s = ' + f(TR_V[2]) + ' m/s</p><p>Am Ende fuhr der Transporter im zähen Verkehr nur noch ' + f(TR_V[2]) + ' m/s = ' + f(P.kmh(TR_V[2])) + ' km/h.</p>' },

      { id: 'mittel-u13', typ: 'mehrfach',
        frage: 'Der Transporter fuhr ' + f(TR_T[1]) + ' s lang mit ' + f(P.kmh(TR_V[0])) + ' km/h, dann ' + f(TR_T[2] - TR_T[1]) + ' s lang mit ' + f(P.kmh(TR_V[1])) + ' km/h und zuletzt ' + f(TR_T[3] - TR_T[2]) + ' s lang mit ' + f(P.kmh(TR_V[2])) + ' km/h, insgesamt ' + f(TR_S[3]) + ' m in ' + f(TR_T[3]) + ' s. Welche Aussagen stimmen?',
        optionen: ['Über die ganze Tunnelfahrt ist v̄ = ' + f(TR_S[3]) + ' m / ' + f(TR_T[3]) + ' s ≈ ' + f(TR_VM) + ' m/s = ' + f(P.kmh(TR_VM)) + ' km/h.',
          'Zwischen ' + f(TR_T[1]) + ' s und ' + f(TR_T[2]) + ' s war der Transporter schneller als 80 km/h.',
          'Weil v̄ unter 80 km/h liegt, war er nie schneller als 80 km/h.',
          'v̄ ist der Mittelwert der drei Geschwindigkeiten: (' + f(TR_V[0]) + ' + ' + f(TR_V[1]) + ' + ' + f(TR_V[2]) + ') m/s : 3 ≈ ' + f((TR_V[0] + TR_V[1] + TR_V[2]) / 3) + ' m/s.',
          'Ab ' + f(TR_T[2]) + ' s war er langsamer als seine mittlere Geschwindigkeit.'],
        richtig: [0, 1, 4],
        optErkl: ['Richtig: Gesamtstrecke durch Gesamtzeit.',
          'Richtig: ' + f(P.kmh(TR_V[1])) + ' km/h liegen über dem Limit, obwohl v̄ darunter liegt.',
          'v̄ unter dem Limit beweist nichts: Zwischen ' + f(TR_T[1]) + ' s und ' + f(TR_T[2]) + ' s fuhr er ' + f(P.kmh(TR_V[1])) + ' km/h. Die langsame Fahrt im stockenden Verkehr am Ende drückt den Mittelwert.',
          'Die drei Abschnitte dauern verschieden lange (' + f(TR_T[1]) + ' s, ' + f(TR_T[2] - TR_T[1]) + ' s, ' + f(TR_T[3] - TR_T[2]) + ' s). v̄ ist Gesamtstrecke durch Gesamtzeit, nicht der Mittelwert der Geschwindigkeiten.',
          'Richtig: ' + f(TR_V[2]) + ' m/s ist weniger als v̄ ≈ ' + f(TR_VM) + ' m/s.'] },

      { id: 'mittel-u14', typ: 'behauptung',
        aussage: 'Der Lkw-Fahrer aus der Akte: „Bei der Einfahrt zeigte mein Tacho 70 km/h. Also war ich im Tunnel nicht zu schnell.“',
        stimmt: false,
        gruende: ['Der Tacho zeigt nur die Momentangeschwindigkeit in einem Augenblick. Ob er zu schnell war, entscheidet die ganze Fahrt, also Δs und Δt.',
          'Der Tacho zeigt die mittlere Geschwindigkeit seit der Abfahrt, und die liegt über 80 km/h.',
          '70 km/h sind umgerechnet 252 m/s, also viel zu schnell.'],
        richtig: 0,
        erkl: 'Ein Tachowert gilt nur für einen Augenblick. Danach kann der Lkw schneller geworden sein. Erst Δs und Δt zwischen den Kameras zeigen, wie schnell er im Mittel war.' },

      { id: 'mittel-u15', typ: 'luecke',
        frage: 'Ergänze den Merksatz zur mittleren Geschwindigkeit.',
        text: 'Die mittlere Geschwindigkeit ist {die ganze Strecke geteilt durch die ganze Zeit|der Mittelwert aus Anfangs- und Endgeschwindigkeit|die höchste gemessene Geschwindigkeit}: v̄ = Δs/Δt. ' +
          'Der Tacho zeigt dagegen die {Momentangeschwindigkeit|mittlere Geschwindigkeit|Beschleunigung}. ' +
          'Liegt v̄ über dem Tempolimit, war das Fahrzeug {mindestens zeitweise zu schnell|die ganze Zeit zu schnell|nie zu schnell}. ' +
          'Liegt v̄ darunter, {kann es trotzdem zeitweise zu schnell gewesen sein|war es sicher nie zu schnell|war es die ganze Zeit langsamer als v̄}.',
        erkl: 'v̄ = Δs/Δt beschreibt die ganze Fahrt. Wer im Mittel zu schnell war, war es mindestens einmal wirklich. Umgekehrt kann eine schnelle Phase im Mittel verschwinden, wenn später langsam gefahren wird.' },

      { id: 'mittel-u16', typ: 'wahl', plus: true,
        frage: 'Plus: Ein Auto fährt die erste Hälfte des Tunnels (1650 m) mit 60 km/h, die zweite Hälfte (1650 m) mit 100 km/h. Wie groß ist seine mittlere Geschwindigkeit?',
        optionen: [f(V_HALB) + ' km/h', '80 km/h', '160 km/h', 'Das lässt sich ohne Zeitangaben nicht berechnen.'],
        richtig: 0,
        optErkl: ['Richtig: t₁ = 1650 m / ' + f(P.ms(60)) + ' m/s = ' + f(T_H1) + ' s, t₂ = 1650 m / ' + f(P.ms(100)) + ' m/s = ' + f(T_H2) + ' s. v̄ = 3300 m / ' + f(T_H1 + T_H2) + ' s ≈ ' + f(P.vGleich(DS, T_H1 + T_H2)) + ' m/s = ' + f(V_HALB) + ' km/h.',
          '(60 + 100)/2 = 80 wäre richtig, wenn beide Abschnitte gleich lange dauern. Im langsamen Abschnitt ist das Auto aber länger unterwegs (' + f(T_H1) + ' s statt ' + f(T_H2) + ' s).',
          'Geschwindigkeiten addieren sich nicht. v̄ ist Gesamtstrecke durch Gesamtzeit.',
          'Doch: Die Zeiten folgen aus Strecke und Geschwindigkeit, t = s/v.'] }
    ],

    trainer: ['v-gleich', 'kmh-ms', 'ms-kmh'],

    gutachten: [
      { id: 'mittel-g1', typ: 'rechnung',
        frage: 'Der Lkw passiert die Kamera Nord um 14:32:08 Uhr und die Kamera Süd um 14:34:23 Uhr. Die Kameras liegen ' + f(DS / 1000) + ' km auseinander. Wie groß war seine mittlere Geschwindigkeit in km/h?',
        gegeben: '<p>Δs = ' + f(DS / 1000) + ' km, t₁ = 14:32:08 Uhr, t₂ = 14:34:23 Uhr</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: Δs = ' + f(DS) + ' m, Δt = 2 min 15 s = ' + f(DT) + ' s<br>Gesucht: v̄ in km/h',
            'Gegeben: Δs = ' + f(DS) + ' m, Δt = 2 min 15 s = 215 s<br>Gesucht: v̄ in km/h',
            'Gegeben: Δs = ' + f(DS) + ' m, Δt = 2,15 min = ' + f(2.15 * 60) + ' s<br>Gesucht: v̄ in km/h',
            'Gegeben: Δs = ' + f(DS) + ' m, t = 14:34:23 Uhr<br>Gesucht: v̄ in km/h'],
            richtig: 0,
            optErkl: ['Richtig: Δt = t₂ − t₁ = 2 min 15 s = 2·60 s + 15 s = ' + f(DT) + ' s, Δs in Metern.',
              'Eine Minute hat 60 s, nicht 100 s: 2 min 15 s = ' + f(DT) + ' s.',
              '2 min 15 s sind nicht 2,15 min. 15 s sind eine Viertelminute, also 2,25 min = ' + f(DT) + ' s.',
              'Eine Uhrzeit ist ein Zeitpunkt, keine Zeitspanne. Du brauchst Δt = t₂ − t₁.'] },
          { art: 'formel', optionen: ['v̄ = Δs/Δt, dann · 3,6', 'v̄ = Δs/Δt, dann : 3,6', 'v̄ = Δt/Δs, dann · 3,6'], richtig: 0,
            optErkl: ['Richtig: Erst v̄ in m/s, dann mal 3,6 für km/h.', F.durch36.erkl, F.kehrwert.erkl] },
          { art: 'einsetzen', optionen: ['v̄ = ' + f(DS) + ' m / ' + f(DT) + ' s, dann · 3,6', 'v̄ = ' + f(DS / 1000) + ' km / ' + f(DT) + ' s, dann · 3,6', 'v̄ = ' + f(DS) + ' m / ' + f(DT) + ' s, dann : 3,6', 'v̄ = ' + f(DT) + ' s / ' + f(DS) + ' m, dann · 3,6'], richtig: 0,
            optErkl: ['Richtig: Meter durch Sekunden, danach mal 3,6.',
              'Kilometer und Sekunden gemischt: Das ergäbe ' + f(DS / 1000 / DT * 3.6, 3) + ' km/h. Erst 3,3 km = 3300 m umrechnen.',
              F.durch36.erkl + ' Das ergäbe ' + f(V_LKW / 3.6) + ' km/h.',
              F.kehrwert.erkl + ' Das ergäbe ' + f(DT / DS * 3.6, 3) + '.'] }
        ],
        antwort: V_LKW_KMH, einheit: 'km/h', formel: 'v-mittel-kmh',
        loesung: '<p>Δs = ' + f(DS / 1000) + ' km = ' + f(DS) + ' m<br>Δt = 14:34:23 − 14:32:08 = 2 min 15 s = ' + f(DT) + ' s</p>' +
          '<p>v̄ = Δs/Δt</p><p>v̄ = ' + f(DS) + ' m / ' + f(DT) + ' s ≈ ' + f(V_LKW) + ' m/s<br>' + f(V_LKW) + ' m/s · 3,6 ≈ ' + f(V_LKW_KMH) + ' km/h</p>' +
          '<p>Genau gerechnet: 3300 · 3,6 / 135 = 11 880 / 135 = 88.</p>',
        satz: {
          optionen: ['Der Lkw fuhr im Mittel ' + f(V_LKW_KMH) + ' km/h. Er war also mindestens zeitweise schneller als 80 km/h, die Behauptung ist widerlegt.',
            'Der Lkw fuhr im Mittel ' + f(V_LKW_KMH) + ' km/h, war aber vielleicht nie schneller als 80 km/h.',
            'Der Lkw fuhr im Mittel ' + f(V_LKW) + ' km/h und war damit nicht zu schnell.'],
          richtig: 0,
          optErkl: ['Richtig: Wer im Mittel 88 km/h fährt, war mindestens einmal wirklich so schnell.',
            'Liegt v̄ über 80 km/h, muss er zumindest zeitweise schneller als 80 km/h gewesen sein. Sonst käme im Mittel höchstens 80 km/h heraus.',
            f(V_LKW) + ' ist der Wert in m/s, nicht in km/h.'] } },

      { id: 'mittel-g2', typ: 'wahl',
        frage: 'Der Fahrer bleibt dabei: „Bei der Einfahrt zeigte mein Tacho 70 km/h.“ Angenommen, das stimmt. Was folgt daraus zusammen mit v̄ = ' + f(V_LKW_KMH) + ' km/h?',
        optionen: ['Dann muss er später sogar schneller als ' + f(V_LKW_KMH) + ' km/h gefahren sein.',
          'Dann war er nicht zu schnell, denn 70 km/h liegen unter 80 km/h.',
          'Dann ist die Messung falsch, denn v̄ müsste zwischen 70 km/h und 80 km/h liegen.',
          'Dann fuhr er im Mittel (70 km/h + ' + f(V_LKW_KMH) + ' km/h)/2 = ' + f((70 + V_LKW_KMH) / 2) + ' km/h.'],
        richtig: 0,
        optErkl: ['Richtig: Wer eine Zeit lang langsamer als ' + f(V_LKW_KMH) + ' km/h fährt, muss das an anderer Stelle mit mehr als ' + f(V_LKW_KMH) + ' km/h ausgleichen. Sonst käme im Mittel weniger heraus.',
          'Der Tacho zeigt die Momentangeschwindigkeit in einem Augenblick. Über die übrigen gut zwei Minuten sagt dieser Wert nichts.',
          'Ein einzelner Tachowert begrenzt v̄ nicht. v̄ hängt von der ganzen Fahrt ab, und die ist mit Δs und Δt gemessen.',
          'v̄ ist schon das Ergebnis der ganzen Fahrt (3300 m in 135 s). Einen Tachowert mit v̄ zu mitteln ergibt keine sinnvolle Größe.'] },

      { id: 'mittel-g3', typ: 'rechnung',
        frage: 'Wie lange hätte der Lkw für die ' + f(DS / 1000) + ' km zwischen den Kameras mindestens brauchen müssen, wenn er im Mittel nicht schneller als 80 km/h gefahren wäre?',
        gegeben: '<p>Δs = ' + f(DS / 1000) + ' km, v̄ = 80 km/h</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: Δs = ' + f(DS) + ' m, v̄ = 80 km/h ≈ ' + f(V80) + ' m/s<br>Gesucht: Δt in s',
            'Gegeben: Δs = ' + f(DS) + ' m, v̄ = 80 km/h = ' + f(P.kmh(80)) + ' m/s<br>Gesucht: Δt in s',
            'Gegeben: Δs = ' + f(DS) + ' m, Δt = ' + f(DT) + ' s<br>Gesucht: v̄ in km/h'],
            richtig: 0,
            optErkl: ['Richtig: 80 : 3,6 ≈ ' + f(V80) + ', gesucht ist die Zeit.', F.mal36.erkl,
              'Das war die Rechnung von vorhin. Jetzt ist gefragt, wie lange die Fahrt mit 80 km/h dauert.'] },
          { art: 'formel', optionen: ['v̄ = Δs/Δt', 's = a/2·t²', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Strecke, Zeit und mittlere Geschwindigkeit hängen über v̄ = Δs/Δt zusammen.',
              'Das ist die Formel für eine beschleunigte Bewegung aus dem Stand. Eine Beschleunigung ist nicht gegeben.',
              'Eine Beschleunigung ist nicht gegeben. Du kennst die Strecke und die mittlere Geschwindigkeit.'] },
          { art: 'umstellen', optionen: ['Δt = Δs/v̄', 'Δt = v̄·Δs', 'Δt = v̄/Δs'], richtig: 0,
            optErkl: ['Richtig: v̄ = Δs/Δt | ·Δt | :v̄ ergibt Δt = Δs/v̄.',
              'Um Δt allein zu bekommen, teilst du durch v̄. Du hast malgenommen.',
              'Du hast den Bruch umgedreht. Für die Zeit steht die Strecke oben: Δt = Δs/v̄.'] },
          { art: 'einsetzen', optionen: ['Δt = ' + f(DS) + ' m / ' + f(V80) + ' m/s', 'Δt = ' + f(DS) + ' m / 80 km/h', 'Δt = ' + f(DS / 1000) + ' km / ' + f(V80) + ' m/s'], richtig: 0,
            optErkl: ['Richtig: Meter durch m/s ergibt Sekunden.',
              'Erst km/h in m/s umrechnen. Sonst kommt ' + f(DS / 80) + ' heraus, und die Einheiten kürzen sich nicht zu s.',
              'Kilometer und m/s passen nicht zusammen. Das ergäbe ' + f(DS / 1000 / V80, 3) + ' s, viel zu kurz.'] }
        ],
        antwort: T80, einheit: 's', formel: 't-mittel-kmh',
        loesung: '<p>80 km/h = 80 : 3,6 m/s ≈ ' + f(V80) + ' m/s</p><p>v̄ = Δs/Δt | ·Δt | :v̄<br>Δt = Δs/v̄</p>' +
          '<p>Δt = ' + f(DS) + ' m / ' + f(V80) + ' m/s ≈ ' + f(T80, 1) + ' s = 2 min ' + f(T80 - 120, 1) + ' s</p>' +
          '<p>Gemessen wurden nur ' + f(DT) + ' s, also ' + f(T80 - DT, 1) + ' s weniger.</p>' },

      { id: 'mittel-g4', typ: 'wahl',
        frage: 'Am selben Tag braucht ein zweiter Lkw von Kamera zu Kamera (' + f(DS / 1000) + ' km) genau 2 min 35 s. Was kann das Büro über ihn sagen?',
        optionen: ['Im Mittel fuhr er etwa ' + f(V2_KMH, 0) + ' km/h, also unter 80 km/h. Ob er zwischendurch schneller als 80 km/h war, lässt sich aus der Messung nicht sagen.',
          'Im Mittel fuhr er etwa ' + f(V2_KMH, 0) + ' km/h, also war er nie schneller als 80 km/h.',
          'Im Mittel fuhr er etwa ' + f(V2, 0) + ' km/h, also deutlich zu langsam.',
          'Im Mittel fuhr er etwa ' + f(V2 / 3.6, 1) + ' km/h.'],
        richtig: 0,
        optErkl: ['Richtig: v̄ = ' + f(DS) + ' m / ' + f(DT2) + ' s ≈ ' + f(V2) + ' m/s ≈ ' + f(V2_KMH) + ' km/h. Ein v̄ unter dem Limit schließt kurze schnelle Phasen nicht aus, siehe den Transporter.',
          'Ein v̄ unter dem Limit beweist nichts. Der Transporter war im Mittel ' + f(P.kmh(TR_VM)) + ' km/h schnell und fuhr zwischendurch trotzdem ' + f(P.kmh(TR_V[1])) + ' km/h.',
          f(V2) + ' ist der Wert in m/s. Für km/h musst du noch mal 3,6 rechnen.',
          F.durch36.erkl] }
    ],

    ergebnis: '<p><strong>Ergebnis:</strong> Der Lkw brauchte für die ' + f(DS / 1000) + ' km zwischen den Kameras 2 min 15 s = ' + f(DT) + ' s. ' +
      'Das ergibt v̄ = ' + f(DS) + ' m / ' + f(DT) + ' s ≈ ' + f(V_LKW) + ' m/s = ' + f(V_LKW_KMH) + ' km/h. Mit höchstens 80 km/h hätte die Fahrt mindestens ' + f(T80, 1) + ' s gedauert. ' +
      'Weil die mittlere Geschwindigkeit über 80 km/h liegt, war er mindestens zeitweise zu schnell, der Tachowert bei der Einfahrt ändert daran nichts. Die Behauptung „Ich war nicht zu schnell“ ist widerlegt.</p>'
  });
})();
