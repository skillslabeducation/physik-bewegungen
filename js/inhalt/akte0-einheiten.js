/* Akte 0: Größen, Einheiten und Formeln umstellen.
   Fall: Wette am ersten Tag im Büro, „In einem Monat bin ich zu Fuß in Wladiwostok.“
   Quellen: Tafel S. 2 (Hamburg → Wladiwostok, Einheiten kürzen, Doppelbruch), Tafel S. 10 (Tipp 1 km/h = 1/3,6 m/s, v = a·t | :a),
   Plus: Tafel S. 1 (Lichttag). Zahlen aus ENTWURF „Fachliche Festlegungen“, alle über W.physik gerechnet. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik, D = W.diagramm;
  W.akten = W.akten || [];
  var F = P.FEHLER;
  var f = function (x, n) { return P.fmt(x, n); };

  /* Zahlen der Akte */
  var S_WL = 11200, V_FUSS = 5;                  // Tafel S. 2: 11 200 km mit 5 km/h
  var T_WL = P.tGleich(S_WL, V_FUSS);            // 2240 h
  var T_TAGE = T_WL / 24;                        // ≈ 93,33 Tage
  var T_8H = T_WL / 8;                           // 280 Tage bei 8 h Gehen pro Tag
  var S_MONAT = P.sGleich(V_FUSS, 30 * 24);      // 3600 km in 30 Tagen ohne Pause
  var V_FUSS_MS = P.ms(V_FUSS);                  // ≈ 1,39 m/s
  var S_8H = P.sGleich(V_FUSS, 8);               // 40 km
  var A_RAD = P.aAusV(6, 5);                     // 1,2 m/s²
  var C = 299792458, TAG_S = 24 * 3600;          // Tafel S. 1 (Plus): Licht in einem Tag
  var S_LICHT = P.sGleich(C, TAG_S);             // ≈ 2,59 · 10¹³ m
  var WL = '11 200';                             // Strecke als Text mit Leerzeichen

  /* Zahl in Zehnerpotenz-Schreibweise, z. B. 2,59 · 10¹³ */
  function zehner(x, stellen) {
    var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
    var hoch = String(e).split('').map(function (z) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(+z); }).join('');
    return f(m, stellen == null ? 2 : stellen) + ' · 10' + hoch;
  }

  W.akten.push({
    id: 'einheiten', nr: 0, titel: 'Größen, Einheiten und Formeln umstellen',
    fall: 'Erster Tag im Büro: „Wie lange zu Fuß nach Wladiwostok?“',

    auftrag: {
      text: '<p>Dein erster Tag im Gutachterbüro. In der Kaffeeküche läuft eine Wette: Ein Kollege behauptet, er schaffe es in einem Monat zu Fuß von Hamburg nach Wladiwostok, ' +
        'wenn er nur durchgehend im Schritttempo geht. Die Strecke ist ' + WL + ' km lang.</p>' +
        '<p>Bevor jemand Geld setzt, soll das Büro die Behauptung prüfen. Dafür brauchst du die Werkzeuge, die in jeder Akte vorkommen: Größen mit Einheiten, ' +
        'km/h und m/s umrechnen, Formeln umstellen und mit Einheiten rechnen.</p>',
      daten: '<table><tr><th>Strecke Hamburg → Wladiwostok</th><td>s = ' + WL + ' km</td></tr>' +
        '<tr><th>Gehtempo (Schritttempo, konstant)</th><td>v = 5 km/h</td></tr>' +
        '<tr><th>Behauptung</th><td>„In einem Monat bin ich da.“</td></tr></table>',
      chefin: 'Akte 0. Eine Wette ist noch kein Gutachten. Rechne nach, mit Einheiten.',
      leitfrage: 'Wie lange dauert der Fußweg nach Wladiwostok bei konstant 5 km/h, und reicht dafür ein Monat?'
    },

    karten: [
      { titel: 'Größen und ihre Einheiten',
        text: '<p>In allen Akten kommen vier Größen vor. Jede hat ein Formelzeichen und eine Einheit:</p>' +
          '<table><tr><th>Größe</th><th>Zeichen</th><th>Einheit</th><th>gesprochen</th></tr>' +
          '<tr><td>Weg, Strecke</td><td>s</td><td>m</td><td>Meter</td></tr>' +
          '<tr><td>Zeit</td><td>t</td><td>s</td><td>Sekunde</td></tr>' +
          '<tr><td>Geschwindigkeit</td><td>v</td><td>m/s</td><td>Meter pro Sekunde</td></tr>' +
          '<tr><td>Beschleunigung</td><td>a</td><td>m/s²</td><td>Meter pro Sekunde pro Sekunde</td></tr></table>' +
          '<p>Die Beschleunigung ist die Änderung der Geschwindigkeit pro Sekunde: a = Δv/Δt. Darum ist ihre Einheit (m/s)/s = m/s². ' +
          'a = 2 m/s² heißt: In jeder Sekunde wird das Fahrzeug um 2 m/s schneller.</p>',
        merk: 's in m, t in s, v in m/s, a in m/s².',
        achtung: '<p>Der Buchstabe s hat zwei Bedeutungen: als Größe ist s der Weg, als Einheit steht s für Sekunde. In „s = 25 m“ ist s ein Weg, in „t = 5 s“ eine Einheit.</p>' },

      { titel: 'km/h und m/s umrechnen',
        text: '<p>Tipp von der Tafel (S. 10): 1 km/h = 1/3,6 m/s. Die 3,6 ist kein Messwert, sie folgt aus den Einheiten:</p>' +
          '<p>1 km/h = 1000 m / 3600 s = 1/3,6 m/s</p>' +
          '<p>Also: von km/h nach m/s teilst du durch 3,6, von m/s nach km/h nimmst du mal 3,6. Beispiel: 5 km/h = 5 : 3,6 m/s ≈ ' + f(V_FUSS_MS) + ' m/s und 10 m/s = 10 · 3,6 km/h = 36 km/h.</p>',
        merk: 'km/h → m/s: : 3,6. m/s → km/h: · 3,6.',
        achtung: '<p>Probe mit Gefühl: Die Zahl in m/s ist immer kleiner als die Zahl in km/h. Wer bei 5 km/h auf 18 m/s kommt, hat mal statt durch gerechnet. 18 m/s sind fast 65 km/h.</p>' },

      { titel: 'Formeln umstellen: Seitentausch',
        text: '<p>Gesucht ist meist nicht die Größe, die links steht. Dann stellst du um: Was du auf einer Seite machst, machst du auch auf der anderen. ' +
          'Das Rechenzeichen schreibst du hinter einen senkrechten Strich. So an der Tafel (S. 2):</p>' +
          '<p>v = s/t &nbsp;| ·t<br>v·t = s &nbsp;| :v<br>t = s/v</p>' +
          '<p>Genauso für die anderen Formeln:</p>' +
          '<p>v = a·t &nbsp;| :t &nbsp;⇒ a = v/t<br>v = a·t &nbsp;| :a &nbsp;⇒ t = v/a</p>' +
          '<p>s = a/2·t² &nbsp;| ·2<br>2s = a·t² &nbsp;| :t² &nbsp;⇒ a = 2s/t²<br>2s = a·t² &nbsp;| :a<br>2s/a = t² &nbsp;| √ &nbsp;⇒ t = √(2s/a)</p>',
        merk: 'Steht die gesuchte Größe unter dem Bruchstrich: mit ihr malnehmen. Steht sie in einem Produkt: durch den anderen Faktor teilen.',
        achtung: '<p>Bei gesuchter Zeit steht der Weg oder die Geschwindigkeit oben: t = s/v und t = v/a. Wer den Bruch umdreht, bekommt keine Zeit. Die Probe mit den Einheiten verrät das sofort.</p>' },

      { titel: 'Mit Einheiten rechnen und kürzen',
        text: '<p>Einheiten rechnest du mit wie Zahlen. Gleiche Einheiten über und unter dem Bruchstrich kürzen sich. Tafel S. 2:</p>' +
          '<p>t = s/v = ' + WL + ' km / (5 km/h) = 2240 · km/(km/h) = 2240 · km · h/km = 2240 h</p>' +
          '<p>Dahinter steckt die Regel für den Doppelbruch: Durch einen Bruch teilen heißt mit seinem Kehrwert malnehmen.</p>' +
          '<p>(a/b) / (c/d) = a/b · d/c &nbsp;&nbsp; also auch &nbsp;&nbsp; 1/(1/h) = 1 · h/1 = h</p>' +
          '<p>2240 h sind 2240 : 24 ≈ ' + f(T_TAGE, 1) + ' Tage, rund 3 Monate. Der Fußweg im Diagramm: In jeder Stunde kommen 5 km dazu.</p>',
        abb: { achsen: { x: { g: 't', e: 'h', max: 8, schritt: 1 }, y: { g: 's', e: 'km', max: 40, schritt: 5 } },
          kurven: [{ punkte: D.kurve(function (t) { return P.sGleich(V_FUSS, t); }, 0, 8, 8), farbe: 's', label: 's(t)' }], marken: [[1, 5], [4, 20], [8, 40]] },
        merk: '(a/b) / (c/d) = a/b · d/c. Am Ende muss die Einheit der gesuchten Größe übrig bleiben.',
        achtung: '<p>Bleibt am Ende eine seltsame Einheit wie km²/h oder s/m stehen, ist die Formel falsch umgestellt. Die Einheiten sind deine Probe.</p>' },

      { titel: 'Lichttag', plus: true,
        text: '<p>Tafel S. 1: Licht ist mit 299 792 458 m/s unterwegs. Ein Tag hat 24 · 3600 s = 86 400 s. Wie weit kommt das Licht in einem Tag?</p>' +
          '<p>s = v·t = 299 792 458 m/s · 86 400 s ≈ ' + zehner(S_LICHT) + ' m</p>' +
          '<p>Das sind rund 26 Milliarden Kilometer. Die Sekunden kürzen sich, übrig bleiben Meter. Große Zahlen schreibt man mit Zehnerpotenzen: 10¹³ ist eine 1 mit 13 Nullen.</p>' }
    ],

    ueben: [
      { id: 'einheiten-u1', typ: 'wahl',
        frage: 'Welche Einheit hat die Beschleunigung a?',
        optionen: ['m/s²', 'm/s', 'km/h', 's²/m'],
        richtig: 0,
        optErkl: ['Richtig: a = Δv/Δt, also (m/s)/s = m/s², gesprochen „Meter pro Sekunde pro Sekunde“.',
          'm/s ist die Einheit der Geschwindigkeit. Die Beschleunigung ist die Änderung der Geschwindigkeit pro Sekunde, darum kommt noch einmal „pro Sekunde“ dazu.',
          'km/h ist ebenfalls eine Einheit der Geschwindigkeit, keine Beschleunigung.',
          'Du hast den Bruch umgedreht. Die Meter stehen oben: m/s².'] },

      { id: 'einheiten-u2', typ: 'zuordnen',
        frage: 'Ordne jeder Größe ihre Einheit zu, wie man sie spricht.',
        paare: [['Weg s', 'm (Meter)'],
          ['Zeit t', 's (Sekunde)'],
          ['Geschwindigkeit v', 'm/s (Meter pro Sekunde)'],
          ['Beschleunigung a', 'm/s² (Meter pro Sekunde pro Sekunde)']],
        erkl: 'a = Δv/Δt: Geschwindigkeit in m/s geteilt durch Zeit in s ergibt m/s², also Meter pro Sekunde pro Sekunde. Vorsicht: s ist als Größe der Weg, als Einheit die Sekunde.' },

      { id: 'einheiten-u3', typ: 'wahl', quelle: 'Tafel S. 10, Tipp',
        frage: 'Tafel S. 10, Tipp: 1 km/h = 1/3,6 m/s. Woher kommt die 3,6?',
        optionen: ['1 km = 1000 m und 1 h = 3600 s, also 1 km/h = 1000 m / 3600 s = 1/3,6 m/s.',
          '1 km = 1000 m und 1 h = 60 s, also 1 km/h = 1000 m / 60 s.',
          '1 km/h = 3,6 m/s, weil ein Kilometer länger ist als ein Meter.',
          'Die 3,6 ist ein Messwert und lässt sich nicht herleiten.'],
        richtig: 0,
        optErkl: ['Richtig: 3600 : 1000 = 3,6. Darum ist 1 km/h nur 1/3,6 m/s ≈ ' + f(1 / 3.6) + ' m/s.',
          'Eine Stunde hat 60 Minuten, aber 60 · 60 s = 3600 s. Mit 60 s käme 1 km/h ≈ ' + f(1000 / 60) + ' m/s heraus, viel zu schnell.',
          'Umgekehrt: 1 m/s = 3,6 km/h. 1 km/h ist sehr langsam, nur ≈ ' + f(1 / 3.6) + ' m/s.',
          'Die 3,6 folgt allein aus den Einheiten: 3600 s pro Stunde geteilt durch 1000 m pro Kilometer.'] },

      { id: 'einheiten-u4', typ: 'rechnung', quelle: 'Tafel S. 10, Tipp',
        frage: 'Tafel S. 10, Tipp: Ein Fußgänger geht mit 5 km/h, das ist normales Schritttempo. Wie viel m/s sind das?',
        gegeben: '<p>v = 5 km/h. Tipp: 1 km/h = 1/3,6 m/s.</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v = 5 km/h<br>Gesucht: v in m/s', 'Gegeben: v = 5 m/s<br>Gesucht: v in km/h', 'Gegeben: v = 5 km/h<br>Gesucht: t in s'],
            richtig: 0,
            optErkl: ['Richtig: Die Geschwindigkeit ist in km/h gegeben, gesucht ist sie in m/s.',
              'Schau auf die Einheit: gegeben sind 5 km/h, nicht 5 m/s.',
              'Eine Zeit ist nicht gefragt. Du rechnest nur die Einheit um.'] },
          { art: 'formel', optionen: ['v in m/s = v in km/h : 3,6', 'v in m/s = v in km/h · 3,6', 'v = s/t'], richtig: 0,
            optErkl: ['Richtig: 1 km/h = 1/3,6 m/s. Von km/h nach m/s teilst du durch 3,6.', F.mal36.erkl,
              'Hier ist weder ein Weg noch eine Zeit gegeben. Du rechnest nur die Einheit um.'] },
          { art: 'einsetzen', optionen: ['v = 5 : 3,6 m/s', 'v = 5 · 3,6 m/s', 'v = 3,6 : 5 m/s'], richtig: 0,
            optErkl: ['Richtig: die Zahl in km/h geteilt durch 3,6.',
              F.mal36.erkl + ' Das ergäbe ' + f(P.kmh(5)) + ' m/s, also fast 65 km/h. Das ist kein Schritttempo.',
              'Du hast 3,6 durch die Geschwindigkeit geteilt. Es ist umgekehrt: Geschwindigkeit geteilt durch 3,6. Das ergäbe ' + f(3.6 / 5) + ' m/s.'] }
        ],
        antwort: V_FUSS_MS, auch: [1.39], einheit: 'm/s', formel: 'kmh-ms',
        loesung: '<p>1 km/h = 1000 m / 3600 s = 1/3,6 m/s</p><p>v = 5 km/h = 5 : 3,6 m/s ≈ ' + f(V_FUSS_MS) + ' m/s</p>' +
          '<p>Probe: Die Zahl in m/s ist kleiner als die Zahl in km/h.</p>' },

      { id: 'einheiten-u5', typ: 'wahl', quelle: 'Tafel S. 2',
        frage: 'Tafel S. 2: Du willst v = s/t nach s umstellen (Seitentausch). Was schreibst du hinter den Strich?',
        optionen: ['| ·t', '| :t', '| ·s', '| −t'],
        richtig: 0,
        optErkl: ['Richtig: Mal t auf beiden Seiten. Rechts kürzt sich t weg: v·t = s, also s = v·t.',
          'Durch t teilen macht es schlimmer: v/t = s/t². Weil t unter dem Bruchstrich steht, nimmst du mal t.',
          'Mal s ergibt v·s = s²/t. Dann steht s immer noch nicht allein.',
          't steht nicht als Summand da, sondern unter dem Bruchstrich. Minus t hilft nicht, du musst mal t nehmen.'] },

      { id: 'einheiten-u6', typ: 'reihenfolge', quelle: 'Tafel S. 2',
        frage: 'Tafel S. 2: Bring den Rechenweg für den Fußweg nach Wladiwostok in die richtige Reihenfolge.',
        schritte: [
          'v = s/t   | ·t',
          'v·t = s   | :v',
          't = s/v',
          't = ' + WL + ' km / (5 km/h)',
          't = 2240 · km · h/km = 2240 h'
        ],
        erkl: 'Erst umstellen (Seitentausch mit | ·t und | :v), dann einsetzen, dann die Einheiten kürzen: km/(km/h) = km · h/km = h.' },

      { id: 'einheiten-u7', typ: 'rechnung', quelle: 'Tafel S. 2',
        frage: 'Tafel S. 2: Wie lange dauert es, von Hamburg nach Wladiwostok (' + WL + ' km) zu Fuß mit konstant 5 km/h zu gehen, ohne Pause? Gib die Zeit in Stunden an.',
        gegeben: '<p>s = ' + WL + ' km, v = 5 km/h (konstant)</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = ' + WL + ' km, v = 5 km/h<br>Gesucht: t in h', 'Gegeben: s = ' + WL + ' km, v = 5 km/h<br>Gesucht: v in m/s', 'Gegeben: s = ' + WL + ' km, t = 5 h<br>Gesucht: v in km/h'],
            richtig: 0,
            optErkl: ['Richtig: Weg und Geschwindigkeit sind gegeben, gesucht ist die Zeit.',
              'Die Geschwindigkeit ist schon gegeben. Gefragt ist, wie lange der Weg dauert.',
              '5 km/h ist eine Geschwindigkeit (Kilometer pro Stunde), keine Zeit. Schau auf die Einheit.'] },
          { art: 'formel', optionen: ['v = s/t', 's = a/2·t²', 'v = a·t'], richtig: 0,
            optErkl: ['Richtig: Der Fußgänger geht mit konstanter Geschwindigkeit, also gilt v = s/t.',
              'Das ist die Formel für eine beschleunigte Bewegung aus dem Stand. Der Fußgänger geht aber konstant 5 km/h.',
              'Es gibt keine Beschleunigung, a = 0. Die Geschwindigkeit bleibt die ganze Zeit 5 km/h.'] },
          { art: 'umstellen', optionen: ['t = s/v', 't = v·s', 't = v/s'], richtig: 0,
            optErkl: ['Richtig: v = s/t | ·t ergibt v·t = s, dann | :v ergibt t = s/v.',
              'Um t allein zu bekommen, teilst du am Ende durch v. Du hast malgenommen.',
              'Du hast den Bruch auf den Kopf gestellt. Bei gesuchter Zeit steht der Weg oben: t = s/v.'] },
          { art: 'einsetzen', optionen: ['t = ' + WL + ' km / (5 km/h)', 't = ' + WL + ' km · 5 km/h', 't = 5 km/h / ' + WL + ' km', 't = ' + WL + ' km / (' + f(V_FUSS_MS) + ' m/s)'], richtig: 0,
            optErkl: ['Richtig: km/(km/h) = km · h/km = h. Die km kürzen sich, übrig bleiben Stunden.',
              'Für die Zeit teilst du den Weg durch die Geschwindigkeit. Du hast malgenommen. Das ergäbe ' + f(S_WL * V_FUSS) + ' km²/h, keine Zeit.',
              'Du hast den Bruch auf den Kopf gestellt. Das ergäbe ≈ ' + f(V_FUSS / S_WL, 5) + ' 1/h, keine Zeit.',
              'km und m/s passen nicht zusammen, die Einheiten kürzen sich nicht. Bleib bei km und km/h, dann bleibt h übrig.'] }
        ],
        antwort: T_WL, einheit: 'h', formel: 't-gleich-km',
        loesung: '<p>v = s/t &nbsp;| ·t<br>v·t = s &nbsp;| :v<br>t = s/v</p>' +
          '<p>t = ' + WL + ' km / (5 km/h) = 2240 · km/(km/h) = 2240 · km · h/km = 2240 h</p>' +
          '<p>Doppelbruch: (a/b) / (c/d) = a/b · d/c, also km/(km/h) = km · h/km = h.</p>' +
          '<p>In Tagen: 2240 h : 24 ≈ ' + f(T_TAGE, 1) + ' Tage, rund 3 Monate.</p>' },

      { id: 'einheiten-u8', typ: 'wahl', quelle: 'Tafel S. 2',
        frage: 'Tafel S. 2: Beim Kürzen der Einheiten bleibt 2240 · 1/(1/h) stehen. Was ist 1/(1/h)?',
        optionen: ['h', '1/h', 'h²', '1'],
        richtig: 0,
        optErkl: ['Richtig: Durch einen Bruch teilen heißt mit dem Kehrwert malnehmen: 1/(1/h) = 1 · h/1 = h. Also t = 2240 h.',
          'Du hast nur den unteren Bruch abgeschrieben. Durch 1/h teilen heißt mal h/1 nehmen.',
          'h kommt nur einmal vor. Mit dem Kehrwert malnehmen ergibt 1 · h/1 = h, nicht h².',
          'Die Einheit verschwindet nicht. Kürzen kannst du nur gleiche Einheiten oben und unten, hier steht h nur einmal.'] },

      { id: 'einheiten-u9', typ: 'wahl', quelle: 'Tafel S. 2',
        frage: 'Tafel S. 2: Welche Regel gilt für einen Doppelbruch (a/b) / (c/d)?',
        optionen: ['(a/b) / (c/d) = a/b · d/c', '(a/b) / (c/d) = a/b · c/d', '(a/b) / (c/d) = b/a · c/d'],
        richtig: 0,
        optErkl: ['Richtig: Durch c/d teilen heißt mit dem Kehrwert d/c malnehmen. Der obere Bruch bleibt, wie er ist.',
          'Du hast den unteren Bruch nicht umgedreht. Teilen durch c/d heißt mal d/c.',
          'Du hast den falschen Bruch umgedreht. Der obere bleibt, der untere wird zum Kehrwert.'] },

      { id: 'einheiten-u10', typ: 'mehrfach', quelle: 'Tafel S. 2',
        frage: 'Tafel S. 2: Welche Rechnungen mit Einheiten stimmen? Es gibt mehrere richtige Antworten.',
        optionen: ['km / (km/h) = h', 'm/s · s = m', '(m/s) / s = m/s²', 'm / (m/s) = m²/s', 'm/s² · s = m'],
        richtig: [0, 1, 2],
        optErkl: ['Richtig: km · h/km, die km kürzen sich, h bleibt. So entsteht t = s/v in Stunden.',
          'Richtig: Die Sekunden kürzen sich. Das ist s = v·t.',
          'Richtig: m/s · 1/s = m/s². So entsteht die Einheit der Beschleunigung aus a = Δv/Δt.',
          'Falsch: Durch m/s teilst du, indem du mit s/m malnimmst: m · s/m = s. Das ist t = s/v, eine Zeit.',
          'Falsch: m/s² · s = m/s, eine Geschwindigkeit (v = a·t). Meter entstehen erst mit s², wie in s = a/2·t².'] },

      { id: 'einheiten-u11', typ: 'rechnung',
        frage: 'Ein Fußgänger geht 8 h lang mit konstant 5 km/h. Welche Strecke schafft er? Stelle dazu v = s/t nach s um.',
        gegeben: '<p>v = 5 km/h, t = 8 h</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v = 5 km/h, t = 8 h<br>Gesucht: s in km', 'Gegeben: v = 5 km/h, t = 8 h<br>Gesucht: t in h', 'Gegeben: s = 5 km, t = 8 h<br>Gesucht: v in km/h'],
            richtig: 0,
            optErkl: ['Richtig: Geschwindigkeit und Zeit sind gegeben, gesucht ist die Strecke.',
              'Die Zeit ist schon gegeben (8 h). Gesucht ist die Strecke.',
              '5 km/h ist eine Geschwindigkeit, keine Strecke. Schau auf die Einheit.'] },
          { art: 'formel', optionen: ['v = s/t', 'v = a·t', 's = a/2·t²'], richtig: 0,
            optErkl: ['Richtig: Konstante Geschwindigkeit, also v = s/t.',
              'Es gibt keine Beschleunigung, der Fußgänger geht konstant 5 km/h.',
              'Das ist die Formel für eine beschleunigte Bewegung aus dem Stand. Hier bleibt v gleich.'] },
          { art: 'umstellen', optionen: ['s = v·t', 's = v/t', 's = t/v'], richtig: 0,
            optErkl: ['Richtig: v = s/t | ·t ergibt v·t = s, also s = v·t.',
              'Du hast durch t geteilt. t steht unter dem Bruchstrich, also nimmst du mal t.',
              'Zeit durch Geschwindigkeit ergibt keine Strecke: h/(km/h) = h²/km. Mit | ·t wird daraus s = v·t.'] },
          { art: 'einsetzen', optionen: ['s = 5 km/h · 8 h', 's = 5 km/h / 8 h', 's = 8 h / (5 km/h)'], richtig: 0,
            optErkl: ['Richtig: Die Stunden kürzen sich, übrig bleiben km.',
              'Geteilt ergäbe ' + f(5 / 8, 3) + ' km/h², keine Strecke. Mit | ·t nimmst du mal.',
              'Das ergäbe ' + f(8 / 5) + ' h²/km, keine Strecke.'] }
        ],
        antwort: S_8H, einheit: 'km', formel: 's-umstellen',
        loesung: '<p>v = s/t &nbsp;| ·t<br>s = v·t</p><p>s = 5 km/h · 8 h = 40 km (die h kürzen sich)</p>' },

      { id: 'einheiten-u12', typ: 'rechnung', quelle: 'Tafel S. 10, (1) a',
        frage: 'Eine Radfahrerin fährt an der Ampel aus dem Stand an, beschleunigt gleichmäßig und ist nach 5 s 6 m/s schnell. Stelle v = a·t nach a um und berechne die Beschleunigung.',
        gegeben: '<p>v = 6 m/s, t = 5 s, aus dem Stand</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: v = 6 m/s, t = 5 s<br>Gesucht: a in m/s²', 'Gegeben: v = 6 m/s, t = 5 s<br>Gesucht: s in m', 'Gegeben: a = 6 m/s², t = 5 s<br>Gesucht: v in m/s'],
            richtig: 0,
            optErkl: ['Richtig: Geschwindigkeit und Zeit sind gegeben, gesucht ist die Beschleunigung.',
              'Gefragt ist die Beschleunigung, nicht der Weg.',
              '6 m/s ist eine Geschwindigkeit, keine Beschleunigung. Schau auf die Einheit: m/s, nicht m/s².'] },
          { art: 'formel', optionen: ['v = a·t', 'v = s/t', 's = a/2·t²'], richtig: 0,
            optErkl: ['Richtig: Aus dem Stand gilt v = a·t.',
              'v = s/t gilt bei konstanter Geschwindigkeit. Die Radfahrerin wird aber schneller.',
              'Einen Weg kennst du nicht. Gegeben sind v und t.'] },
          { art: 'umstellen', optionen: ['a = v/t', 'a = v·t', 'a = t/v'], richtig: 0,
            optErkl: ['Richtig: v = a·t | :t ergibt v/t = a, also a = v/t.',
              'Um a allein zu bekommen, teilst du durch t. Du hast malgenommen.',
              F.kehrwert.erkl] },
          { art: 'einsetzen', optionen: ['a = 6 m/s / 5 s', 'a = 6 m/s · 5 s', 'a = 5 s / (6 m/s)'], richtig: 0,
            optErkl: ['Richtig: (m/s)/s = m/s · 1/s = m/s².',
              'Du hast malgenommen. Das ergäbe ' + f(6 * 5) + ' m, und das ist keine Beschleunigung.',
              F.kehrwert.erkl + ' Das ergäbe ≈ ' + f(5 / 6) + ' s²/m.'] }
        ],
        antwort: A_RAD, einheit: 'm/s²', formel: 'a-va',
        loesung: '<p>v = a·t &nbsp;| :t<br>a = v/t</p><p>a = 6 m/s / 5 s = ' + f(A_RAD) + ' m/s²</p><p>Einheit als Doppelbruch: (m/s)/s = m/s · 1/s = m/s².</p>' },

      { id: 'einheiten-u13', typ: 'wahl', quelle: 'Tafel S. 10, (1) a',
        frage: 'Tafel S. 10: Stelle v = a·t nach der Zeit t um.',
        optionen: ['t = v/a', 't = v·a', 't = a/v', 't = v − a'],
        richtig: 0,
        optErkl: ['Richtig: v = a·t | :a ergibt v/a = t. Probe mit Einheiten: (m/s)/(m/s²) = m/s · s²/m = s.',
          'Um t allein zu bekommen, teilst du durch a. Du hast malgenommen.',
          'Du hast den Bruch umgedreht. Bei gesuchter Zeit steht v oben: t = v/a. Bei a/v bliebe die Einheit 1/s übrig.',
          'a·t ist ein Produkt, keine Summe. Darum teilst du durch a, statt a abzuziehen.'] },

      { id: 'einheiten-u14', typ: 'wahl',
        frage: 'Stelle s = a/2·t² nach der Beschleunigung a um.',
        optionen: ['a = 2s/t²', 'a = s/(2t²)', 'a = 2s/t', 'a = s/t²'],
        richtig: 0,
        optErkl: ['Richtig: s = a/2·t² | ·2 ergibt 2s = a·t², dann | :t² ergibt a = 2s/t².',
          'Das „geteilt durch 2“ bei a hebst du mit | ·2 auf. Die 2 landet im Zähler, nicht im Nenner.',
          'Die Zeit steht im Quadrat. Du musst durch t² teilen, nicht durch t.',
          F.zweiVergessen.erkl] },

      { id: 'einheiten-u15', typ: 'wahl',
        frage: 'Stelle s = a/2·t² nach der Zeit t um.',
        optionen: ['t = √(2s/a)', 't = 2s/a', 't = √(s/(2a))', 't = √(2a/s)'],
        richtig: 0,
        optErkl: ['Richtig: s = a/2·t² | ·2 | :a ergibt t² = 2s/a, dann | √ ergibt t = √(2s/a).',
          F.wurzelVergessen.erkl,
          'Die 2 gehört in den Zähler: | ·2 macht aus s den Wert 2s.',
          'Du hast den Bruch umgedreht. Bei gesuchter Zeit steht der Weg oben. Probe: m/(m/s²) = s², die Wurzel daraus ergibt s.'] },

      { id: 'einheiten-u16', typ: 'punkte',
        frage: 'Der Kollege geht mit konstant 5 km/h los. Setze die Punkte des s(t)-Graphen für t = 2 h, 4 h, 6 h und 8 h.',
        achsen: { x: { g: 't', e: 'h', max: 8, schritt: 1 }, y: { g: 's', e: 'km', max: 40, schritt: 5 } },
        xs: [2, 4, 6, 8],
        soll: [2, 4, 6, 8].map(function (t) { return P.sGleich(V_FUSS, t); }),
        kurve: D.kurve(function (t) { return P.sGleich(V_FUSS, t); }, 0, 8, 8),
        erkl: 's = v·t: nach 2 h sind es 5 km/h · 2 h = 10 km, nach 4 h 20 km, nach 6 h 30 km, nach 8 h 40 km. Die Punkte liegen auf einer Ursprungsgeraden mit der Steigung 5 km/h. Die Achsen tragen hier h und km, weil das zu den Zahlen passt.' },

      { id: 'einheiten-u17', typ: 'wahl', quelle: 'Tafel S. 1', plus: true,
        frage: 'Tafel S. 1 (Plus): Licht ist mit 299 792 458 m/s unterwegs. Wie weit kommt es in einem Tag?',
        optionen: ['≈ ' + zehner(S_LICHT) + ' m', '≈ ' + zehner(P.sGleich(C, 3600)) + ' m', '≈ ' + zehner(P.sGleich(C, 24)) + ' m', '≈ ' + f(C / TAG_S, 0) + ' m'],
        richtig: 0,
        optErkl: ['Richtig: s = v·t = 299 792 458 m/s · 86 400 s ≈ ' + zehner(S_LICHT) + ' m. Die Sekunden kürzen sich.',
          'Das ist der Weg in einer Stunde (3600 s). Ein Tag hat 24 · 3600 s = 86 400 s.',
          'Du hast mit 24 gerechnet, also in Stunden, aber v ist in m/s. Erst den Tag in Sekunden umrechnen: 86 400 s.',
          'Du hast durch die Zeit geteilt. Der Weg ist s = v·t, nicht v/t. Bei v/t bliebe auch keine Länge übrig, sondern m/s².'] }
    ],

    trainer: ['kmh-ms', 'ms-kmh', 't-gleich'],

    gutachten: [
      { id: 'einheiten-g1', typ: 'rechnung', quelle: 'Tafel S. 2',
        frage: 'Prüfe die Wette: Wie viele Tage dauert der Fußweg von Hamburg nach Wladiwostok (' + WL + ' km) mit konstant 5 km/h, wenn der Kollege ohne Pause durchgeht?',
        gegeben: '<p>s = ' + WL + ' km, v = 5 km/h, 1 Tag = 24 h</p>',
        schritte: [
          { art: 'gg', optionen: ['Gegeben: s = ' + WL + ' km, v = 5 km/h<br>Gesucht: t in Tagen', 'Gegeben: s = ' + WL + ' km, v = 5 m/s<br>Gesucht: t in Tagen', 'Gegeben: s = ' + WL + ' km, v = 5 km/h<br>Gesucht: v in m/s'],
            richtig: 0,
            optErkl: ['Richtig: Gesucht ist die Dauer, am Ende in Tagen.',
              'Schau auf die Einheit: 5 km/h, nicht 5 m/s. 5 m/s wären 18 km/h, viel zu schnell zum Gehen.',
              'Die Wette handelt von der Dauer. Gesucht ist die Zeit.'] },
          { art: 'formel', optionen: ['t = s/v, dann : 24', 't = s/v, dann · 24', 't = s·v, dann : 24'], richtig: 0,
            optErkl: ['Richtig: Erst die Zeit in Stunden (aus v = s/t | ·t | :v), dann durch 24 h pro Tag.',
              'Ein Tag hat 24 h. Aus Stunden werden Tage, wenn du durch 24 teilst. Mal 24 ergäbe ' + f(T_WL * 24) + ', viel zu viel.',
              'Für die Zeit teilst du den Weg durch die Geschwindigkeit. Mal ergäbe km²/h, keine Zeit.'] },
          { art: 'einsetzen', optionen: ['t = ' + WL + ' km / (5 km/h) : 24 h pro Tag', 't = ' + WL + ' km / (5 km/h) · 24 h pro Tag', 't = ' + WL + ' km / (5 km/h) : 60'], richtig: 0,
            optErkl: ['Richtig: 2240 h geteilt durch 24 h pro Tag, die h kürzen sich, Tage bleiben.',
              'Mal 24 ergäbe ' + f(T_WL * 24) + ' und keine Tage. Stunden teilst du durch 24, um Tage zu bekommen.',
              '60 gehört zu Minuten und Sekunden. Ein Tag hat 24 h. Durch 60 ergäbe ≈ ' + f(T_WL / 60) + ', und das sind keine Tage.'] }
        ],
        antwort: T_TAGE, auch: [93.3], einheit: 'Tage', formel: 't-tage',
        loesung: '<p>v = s/t &nbsp;| ·t &nbsp;| :v<br>t = s/v</p>' +
          '<p>t = ' + WL + ' km / (5 km/h) = 2240 · km · h/km = 2240 h</p>' +
          '<p>t = 2240 h : 24 h pro Tag ≈ ' + f(T_TAGE) + ' Tage, rund 3 Monate</p>',
        satz: {
          optionen: ['Ohne Pause dauert der Fußweg rund 93 Tage, also etwa 3 Monate. In einem Monat ist das nicht zu schaffen.',
            'Der Fußweg dauert 2240 Tage, über sechs Jahre.',
            'Der Fußweg dauert rund 93 Monate, fast acht Jahre.'],
          richtig: 0,
          optErkl: ['Richtig: 93,3 Tage sind rund 3 Monate, dreimal so lang wie behauptet.',
            '2240 ist die Zeit in Stunden, nicht in Tagen.',
            'Du hast Tage und Monate verwechselt. 93 Tage sind rund 3 Monate.'] } },

      { id: 'einheiten-g2', typ: 'wahl',
        frage: 'Der Kollege bleibt bei „ein Monat“. Wie weit käme er in 30 Tagen, wenn er ohne Pause mit konstant 5 km/h geht?',
        optionen: [f(S_MONAT) + ' km', f(P.sGleich(V_FUSS, 30)) + ' km', f(30 * 24 / V_FUSS) + ' km', f(P.sGleich(V_FUSS, 24)) + ' km'],
        richtig: 0,
        optErkl: ['Richtig: t = 30 · 24 h = 720 h, s = v·t = 5 km/h · 720 h = ' + f(S_MONAT) + ' km. Das ist nicht einmal ein Drittel der ' + WL + ' km.',
          'Du hast 30 Tage wie 30 Stunden gerechnet. Erst in Stunden umrechnen: 30 · 24 h = 720 h.',
          'Du hast die Zeit durch die Geschwindigkeit geteilt. Der Weg ist s = v·t: 5 km/h · 720 h, die h kürzen sich.',
          'Das ist der Weg an einem einzigen Tag (24 h). In 30 Tagen ist es 30-mal so viel.'] },

      { id: 'einheiten-g3', typ: 'wahl',
        frage: 'Realistischer: Der Kollege geht jeden Tag nur 8 Stunden, sonst schläft und isst er. Wie viele Tage braucht er dann für die 2240 Stunden Gehzeit?',
        optionen: [f(T_8H) + ' Tage', f(T_TAGE) + ' Tage', f(T_TAGE / 8) + ' Tage', f(T_WL * 8) + ' Tage'],
        richtig: 0,
        optErkl: ['Richtig: 2240 h : 8 h pro Tag = ' + f(T_8H) + ' Tage, gut 9 Monate. Pro Tag schafft er 40 km.',
          'So lange dauert es nur, wenn er 24 h am Tag geht. Mit 8 h am Tag schafft er pro Tag nur 40 km statt 120 km.',
          'Du hast die 93,33 Tage noch einmal durch 8 geteilt. Die 93,33 Tage rechnen schon mit 24 h pro Tag. Richtig ist 2240 h : 8 h pro Tag.',
          'Du hast mit 8 malgenommen. Die Zahl der Tage bekommst du, wenn du die Stunden durch die Stunden pro Tag teilst.'] },

      { id: 'einheiten-g4', typ: 'wahl', quelle: 'Tafel S. 10, Tipp',
        frage: 'Im Gutachten soll das Gehtempo auch in m/s stehen. Welche Zeile stimmt?',
        optionen: ['5 km/h = 5 : 3,6 m/s ≈ ' + f(V_FUSS_MS) + ' m/s', '5 km/h = 5 · 3,6 m/s = ' + f(P.kmh(5)) + ' m/s', '5 km/h = 5000 m / 60 s ≈ ' + f(5000 / 60) + ' m/s', '5 km/h = 5 m/s'],
        richtig: 0,
        optErkl: ['Richtig: 1 km/h = 1/3,6 m/s, also durch 3,6.',
          F.mal36.erkl + ' 18 m/s wären fast 65 km/h, das ist kein Schritttempo.',
          'Eine Stunde hat 3600 s, nicht 60 s. 5000 m / 3600 s ≈ ' + f(V_FUSS_MS) + ' m/s.',
          'Die Zahl ändert sich beim Umrechnen. 5 m/s wären 18 km/h, also Radfahrtempo.'] }
    ],

    ergebnis: '<p><strong>Ergebnis:</strong> Ohne Pause dauert der Fußweg von Hamburg nach Wladiwostok t = ' + WL + ' km / (5 km/h) = 2240 h, das sind rund ' + f(T_TAGE, 1) + ' Tage, also etwa 3 Monate. ' +
      'In einem Monat käme der Kollege nur ' + f(S_MONAT) + ' km weit, mit 8 Stunden Gehen am Tag bräuchte er sogar ' + f(T_8H) + ' Tage. Die Wette ist verloren.</p>'
  });
})();
