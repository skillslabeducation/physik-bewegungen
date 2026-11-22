/* Rechentrainer: würfelt Aufgaben vom Typ rechnung mit geführten Schritten.
   Richtige Lösung und falsche Einsetz-Optionen rechnet die Physik-Logik aus. Ohne DOM. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var P = W.physik;
  var F = P.FEHLER;
  var f = P.fmt;
  var G = P.G;

  /* ---------- Helfer ---------- */

  function wahl(r, liste) { return liste[Math.floor(r() * liste.length)]; }
  function bereich(r, b) { return P.ganz(r, b[0], b[1], b[2]); }
  /** Zahl für Erklärsätze: kleine Werte mit mehr Stellen, damit nicht „0“ dasteht. */
  function zahl(x) { return f(x, Math.abs(x) < 0.1 && x !== 0 ? 4 : 2); }
  function gr(sym, w, e) { return sym + ' = ' + f(w) + ' ' + e; }
  function exakt(x) { return Math.abs(x * 100 - Math.round(x * 100)) < 1e-6; }
  /** „= 6 m/s“ wenn exakt auf zwei Stellen, sonst „≈ 63,25 s“. */
  function erg(x, e) { return (exakt(x) ? '=' : '≈') + ' ' + f(x) + ' ' + e; }
  function p(s) { return '<p>' + s + '</p>'; }
  function klein(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  var TAUSCH = { 'm/s²': 'm/s', 'm/s': 'm/s²', 'km/h': 'm/s', 's': 'm', 'm': 's' };
  var NAME = { v: 'die Geschwindigkeit v', s: 'der Weg s', t: 'die Zeit t', a: 'die Beschleunigung a' };
  function falschGesucht(soll, falsch, e) {
    return [falsch + ' in ' + e, 'Gefragt ist ' + NAME[soll] + ', nicht ' + NAME[falsch] + '.'];
  }

  /* Kontexte mit sinnvollen Zahlenbereichen. Bereiche als [min, max, schritt]. */
  var GLEICH = [
    { wer: 'Ein Läufer', verb: 'läuft', pron: 'er', v: [3, 4, 5, 6, 6.25, 7.5, 8], t: [40, 200, 4] },
    { wer: 'Ein Auto', verb: 'fährt', pron: 'es', v: [10, 12.5, 15, 20, 25, 30], t: [8, 60, 4] },
    { wer: 'Ein Güterzug', verb: 'fährt', pron: 'er', v: [12.5, 15, 18.75, 20, 22.5, 25], t: [20, 160, 4] }
  ];
  var ANFAHREN = [
    { wer: 'Ein E-Bike', pron: 'es', a: [1, 1.25, 1.5, 2, 2.5], t: [2, 8, 1], sRund: [10, 20, 25, 30, 40, 50] },
    { wer: 'Ein Auto', pron: 'es', a: [2, 2.5, 3, 4, 5], t: [2, 8, 1], sRund: [25, 50, 75, 100, 150] },
    { wer: 'Ein Zug', pron: 'er', a: [0.25, 0.5, 0.75, 1], t: [10, 40, 5], sRund: [100, 200, 250, 400, 500, 800, 1000] }
  ];
  var AENDERN = [
    { wer: 'Ein E-Bike', a: [0.5, 1, 1.5, 2], t: [2, 6, 1], v1: [2, 6, 1] },
    { wer: 'Ein Auto', a: [1, 1.5, 2, 2.5, 3], t: [2, 8, 1], v1: [5, 20, 1] },
    { wer: 'Ein Zug', a: [0.25, 0.5, 0.75, 1], t: [10, 40, 5], v1: [5, 20, 1] }
  ];
  var BREMSEN = [
    { wer: 'Ein Auto', a: [4, 4.5, 5, 6, 7.5, 8], t: [2, 4, 0.5] },
    { wer: 'Ein E-Bike', a: [2, 2.5, 3, 4, 4.5], t: [1, 3, 0.5] },
    { wer: 'Ein Zug', a: [0.5, 0.75, 1], t: [20, 60, 5] }
  ];

  /* Gemeinsame Formel-Auswahlen. Erste Option ist jeweils richtig. */
  var F_ANF_V = [['v = a·t', 'Richtig: Aus dem Stand gilt v = a·t.'], ['v = s/t', F.gleichfoermig.erkl],
    ['s = a/2·t²', 'Damit rechnest du den Weg aus. Gefragt ist die Geschwindigkeit.']];
  var F_ANF_S = [['s = a/2·t²', 'Richtig: Aus dem Stand gilt s = a/2·t².'], ['s = v·t', F.gleichfoermig.erkl],
    ['v = a·t', 'Damit rechnest du eine Geschwindigkeit aus. Hier geht es um einen Weg.']];
  var F_GLEICH = [['v = s/t', 'Richtig: Bei konstanter Geschwindigkeit gilt v = s/t.'],
    ['s = a/2·t²', 'Hier ist die Geschwindigkeit konstant. s = a/2·t² gilt nur für eine beschleunigte Bewegung.'],
    ['v = a·t', 'Es gibt keine Beschleunigung, die Geschwindigkeit bleibt gleich. v = a·t passt nicht.']];

  /* ---------- Die Trainer ----------
     zahlen(r) würfelt, baue(z) liefert { frage, geg, ges, gesFalsch, formel, umstellen?, ein, antwort, einheit, loesung }.
     ein: { richtig: [text, erkl], fehler: [{ t, w, f, e, erkl }] } mit w aus der Fehlerrechnung, e der Einheit dieses Werts.
     glatt: Ergebnis muss auf zwei Stellen exakt sein. rueck: feste Rückfallzahlen. */

  var DEF = {};

  DEF['kmh-ms'] = {
    titel: 'km/h → m/s',
    zahlen: function (r) {
      var k = wahl(r, [['Ein Radfahrer', [15, 18, 20, 24, 27, 30, 36]], ['Ein Auto', [30, 36, 50, 54, 72, 80, 90, 100, 108, 120, 126]],
        ['Ein Zug', [72, 90, 108, 126, 144, 160, 180, 216]]]);
      return { wer: k[0], v: wahl(r, k[1]) };
    },
    rueck: { wer: 'Ein Auto', v: 72 },
    baue: function (z) {
      var v = z.v, x = P.ms(v);
      return {
        frage: z.wer + ' fährt mit ' + f(v) + ' km/h. Wie viel m/s sind das?',
        geg: [['v', v, 'km/h']], ges: 'v in m/s',
        gesFalsch: ['v in km/h', 'In km/h ist die Geschwindigkeit schon gegeben. Gesucht ist sie in m/s.'],
        formel: [['v in m/s = v in km/h : 3,6', 'Richtig: 1 m/s = 3,6 km/h. Von km/h nach m/s teilst du durch 3,6.'],
          ['v in m/s = v in km/h · 3,6', F.mal36.erkl],
          ['v = s/t', 'Hier ist weder ein Weg noch eine Zeit gegeben. Du rechnest nur die Einheit um.']],
        ein: { richtig: ['v = ' + f(v) + ' : 3,6 m/s', 'Richtig: die Zahl in km/h geteilt durch 3,6.'],
          fehler: [{ t: 'v = ' + f(v) + ' · 3,6 m/s', w: P.kmh(v), f: 'mal36', e: 'm/s', erkl: F.mal36.erkl },
            { t: 'v = 3,6 : ' + f(v) + ' m/s', w: 3.6 / v, f: 'kehrwert', e: 'm/s', erkl: 'Du hast 3,6 durch die Geschwindigkeit geteilt. Es ist umgekehrt: Geschwindigkeit geteilt durch 3,6.' }] },
        antwort: x, einheit: 'm/s',
        loesung: p('v in m/s = v in km/h : 3,6') + p(f(v) + ' km/h = ' + f(v) + ' : 3,6 m/s ' + erg(x, 'm/s'))
      };
    }
  };

  DEF['ms-kmh'] = {
    titel: 'm/s → km/h',
    zahlen: function (r) {
      var k = wahl(r, [['Ein Läufer', 'läuft', [2.5, 3, 4, 5, 6]], ['Ein Radfahrer', 'fährt', [4, 5, 6, 7.5, 8, 10]],
        ['Ein Auto', 'fährt', [10, 12.5, 15, 20, 25, 30, 35]], ['Ein Güterzug', 'fährt', [15, 18.75, 20, 22.5, 25]]]);
      return { wer: k[0], verb: k[1], v: wahl(r, k[2]) };
    },
    rueck: { wer: 'Ein Güterzug', verb: 'fährt', v: 18.75 },
    glatt: true,
    baue: function (z) {
      var v = z.v, x = P.kmh(v);
      return {
        frage: z.wer + ' ' + z.verb + ' mit ' + f(v) + ' m/s. Wie viel km/h sind das?',
        geg: [['v', v, 'm/s']], ges: 'v in km/h',
        gesFalsch: ['v in m/s', 'In m/s ist die Geschwindigkeit schon gegeben. Gesucht ist sie in km/h.'],
        formel: [['v in km/h = v in m/s · 3,6', 'Richtig: 1 m/s = 3,6 km/h. Von m/s nach km/h nimmst du mal 3,6.'],
          ['v in km/h = v in m/s : 3,6', F.durch36.erkl],
          ['v = s/t', 'Hier ist weder ein Weg noch eine Zeit gegeben. Du rechnest nur die Einheit um.']],
        ein: { richtig: ['v = ' + f(v) + ' · 3,6 km/h', 'Richtig: die Zahl in m/s mal 3,6.'],
          fehler: [{ t: 'v = ' + f(v) + ' : 3,6 km/h', w: P.ms(v), f: 'durch36', e: 'km/h', erkl: F.durch36.erkl },
            { t: 'v = 3,6 : ' + f(v) + ' km/h', w: 3.6 / v, f: 'kehrwert', e: 'km/h', erkl: 'Du hast 3,6 durch die Geschwindigkeit geteilt. Richtig ist Geschwindigkeit mal 3,6.' }] },
        antwort: x, einheit: 'km/h',
        loesung: p('v in km/h = v in m/s · 3,6') + p(f(v) + ' m/s = ' + f(v) + ' · 3,6 km/h ' + erg(x, 'km/h'))
      };
    }
  };

  function gleichZahlen(r) {
    var k = wahl(r, GLEICH);
    var v = wahl(r, k.v), t = bereich(r, k.t);
    return { k: k, v: v, t: t, s: P.sGleich(v, t) };
  }

  DEF['v-gleich'] = {
    titel: 'v = s/t',
    zahlen: gleichZahlen,
    rueck: { k: GLEICH[2], v: 18.75, t: 40, s: 750 },
    glatt: true,
    baue: function (z) {
      var s = z.s, t = z.t, x = P.vGleich(s, t);
      return {
        frage: z.k.wer + ' ' + z.k.verb + ' gleichmäßig ' + f(s) + ' m in ' + f(t) + ' s. Wie groß ist die Geschwindigkeit?',
        geg: [['s', s, 'm'], ['t', t, 's']], ges: 'v in m/s', gesFalsch: falschGesucht('v', 's', 'm'),
        formel: F_GLEICH,
        ein: { richtig: ['v = ' + f(s) + ' m / ' + f(t) + ' s', 'Richtig: Weg geteilt durch Zeit.'],
          fehler: [{ t: 'v = ' + f(t) + ' s / ' + f(s) + ' m', w: t / s, f: 'kehrwert', e: 's/m', erkl: F.kehrwert.erkl },
            { t: 'v = ' + f(s) + ' m · ' + f(t) + ' s', w: s * t, f: 'malStattGeteilt', e: 'm·s', erkl: 'Geschwindigkeit ist Weg pro Zeit. Du musst teilen, nicht malnehmen.' }] },
        antwort: x, einheit: 'm/s',
        loesung: p('v = s/t') + p('v = ' + f(s) + ' m / ' + f(t) + ' s ' + erg(x, 'm/s'))
      };
    }
  };

  DEF['s-gleich'] = {
    titel: 's = v·t',
    zahlen: gleichZahlen,
    rueck: { k: GLEICH[1], v: 25, t: 12, s: 300 },
    glatt: true,
    baue: function (z) {
      var v = z.v, t = z.t, x = P.sGleich(v, t);
      return {
        frage: z.k.wer + ' ' + z.k.verb + ' ' + f(t) + ' s lang gleichmäßig mit ' + f(v) + ' m/s. Welche Strecke legt ' + z.k.pron + ' zurück?',
        geg: [['v', v, 'm/s'], ['t', t, 's']], ges: 's in m', gesFalsch: falschGesucht('s', 'v', 'm/s'),
        formel: [['s = v·t', 'Richtig: Bei konstanter Geschwindigkeit gilt s = v·t.']].concat(F_GLEICH.slice(1)),
        ein: { richtig: ['s = ' + f(v) + ' m/s · ' + f(t) + ' s', 'Richtig: Geschwindigkeit mal Zeit, die Sekunden kürzen sich weg.'],
          fehler: [{ t: 's = ' + f(v) + ' m/s / ' + f(t) + ' s', w: v / t, f: 'geteiltStattMal', e: 'm/s²', erkl: 'Der Weg ist Geschwindigkeit mal Zeit. Du hast geteilt.' },
            { t: 's = ' + f(t) + ' s / ' + f(v) + ' m/s', w: t / v, f: 'kehrwert', e: 's²/m', erkl: 'Du hast die Zeit durch die Geschwindigkeit geteilt. Für den Weg rechnest du v mal t.' }] },
        antwort: x, einheit: 'm',
        loesung: p('s = v·t') + p('s = ' + f(v) + ' m/s · ' + f(t) + ' s ' + erg(x, 'm'))
      };
    }
  };

  DEF['t-gleich'] = {
    titel: 't = s/v',
    zahlen: gleichZahlen,
    rueck: { k: GLEICH[2], v: 18.75, t: 128, s: 2400 },
    glatt: true,
    baue: function (z) {
      var v = z.v, s = z.s, x = P.tGleich(s, v);
      return {
        frage: 'Wie lange braucht ' + klein(z.k.wer) + ' mit konstant ' + f(v) + ' m/s für ' + f(s) + ' m?',
        geg: [['v', v, 'm/s'], ['s', s, 'm']], ges: 't in s', gesFalsch: falschGesucht('t', 's', 'm'),
        formel: F_GLEICH,
        umstellen: [['t = s/v', 'Richtig: v = s/t | ·t | :v ergibt t = s/v.'],
          ['t = v·s', 'Beim Umstellen von v = s/t nach t teilst du durch v. Du hast malgenommen.'],
          ['t = v/s', 'Du hast den Bruch auf den Kopf gestellt. Der Weg steht oben: t = s/v.']],
        ein: { richtig: ['t = ' + f(s) + ' m / ' + f(v) + ' m/s', 'Richtig: Weg geteilt durch Geschwindigkeit, die Meter kürzen sich weg.'],
          fehler: [{ t: 't = ' + f(v) + ' m/s / ' + f(s) + ' m', w: v / s, f: 'kehrwert', e: '1/s', erkl: 'Du hast den Bruch auf den Kopf gestellt. Der Weg steht oben: t = s/v.' },
            { t: 't = ' + f(s) + ' m · ' + f(v) + ' m/s', w: s * v, f: 'malStattGeteilt', e: 'm²/s', erkl: 'Für die Zeit teilst du den Weg durch die Geschwindigkeit. Du hast malgenommen.' }] },
        antwort: x, einheit: 's',
        loesung: p('v = s/t ⇒ t = s/v') + p('t = ' + f(s) + ' m / ' + f(v) + ' m/s ' + erg(x, 's'))
      };
    }
  };

  DEF['a-dv'] = {
    titel: 'a = Δv/Δt',
    zahlen: function (r) {
      var k = wahl(r, AENDERN);
      var a = wahl(r, k.a), t = bereich(r, k.t), v1 = bereich(r, k.v1);
      return { k: k, a: a, t: t, v1: v1, v2: v1 + P.vBeschl(a, t) };
    },
    rueck: { k: AENDERN[1], a: 3, t: 5, v1: 10, v2: 25 },
    glatt: true,
    baue: function (z) {
      var v1 = z.v1, v2 = z.v2, t = z.t, x = P.aAusV(v2 - v1, t);
      var dv = '(' + f(v2) + ' m/s − ' + f(v1) + ' m/s)';
      return {
        frage: z.k.wer + ' wird in ' + f(t) + ' s gleichmäßig von ' + f(v1) + ' m/s auf ' + f(v2) + ' m/s schneller. Wie groß ist die Beschleunigung?',
        geg: [['v₁', v1, 'm/s'], ['v₂', v2, 'm/s'], ['Δt', t, 's']], ges: 'a in m/s²',
        gesFalsch: ['Δv in m/s', 'Δv ist nur ein Zwischenschritt. Gefragt ist die Beschleunigung a.'],
        formel: [['a = Δv/Δt', 'Richtig: Beschleunigung ist Geschwindigkeitsänderung pro Zeit.'],
          ['v = s/t', 'Damit rechnest du eine Geschwindigkeit aus. Gefragt ist die Beschleunigung.'],
          ['s = a/2·t²', 'Diese Formel braucht einen Weg. Gegeben sind zwei Geschwindigkeiten und eine Zeit.']],
        ein: { richtig: ['a = ' + dv + ' / ' + f(t) + ' s', 'Richtig: Δv ist Endwert minus Anfangswert, geteilt durch Δt.'],
          fehler: [{ t: 'a = ' + f(v2) + ' m/s / ' + f(t) + ' s', w: v2 / t, f: 'messwertStattDifferenz', e: 'm/s²', erkl: F.messwertStattDifferenz.erkl },
            { t: 'a = ' + f(t) + ' s / ' + dv, w: t / (v2 - v1), f: 'kehrwert', e: 's²/m', erkl: F.kehrwert.erkl }] },
        antwort: x, einheit: 'm/s²',
        loesung: p('a = Δv/Δt = (v₂ − v₁)/Δt') + p('a = ' + dv + ' / ' + f(t) + ' s = ' + f(v2 - v1) + ' m/s / ' + f(t) + ' s ' + erg(x, 'm/s²'))
      };
    }
  };

  function anfahrZahlen(r) {
    var k = wahl(r, ANFAHREN);
    return { k: k, a: wahl(r, k.a), t: bereich(r, k.t) };
  }

  DEF['v-at'] = {
    titel: 'v = a·t',
    zahlen: anfahrZahlen,
    rueck: { k: ANFAHREN[0], a: 1.5, t: 4 },
    glatt: true,
    baue: function (z) {
      var a = z.a, t = z.t, x = P.vBeschl(a, t);
      return {
        frage: z.k.wer + ' fährt aus dem Stand mit a = ' + f(a) + ' m/s² los. Wie schnell ist ' + z.k.pron + ' nach ' + f(t) + ' s?',
        geg: [['a', a, 'm/s²'], ['t', t, 's']], ges: 'v in m/s', gesFalsch: falschGesucht('v', 's', 'm'),
        formel: F_ANF_V,
        ein: { richtig: ['v = ' + f(a) + ' m/s² · ' + f(t) + ' s', 'Richtig: Beschleunigung mal Zeit, eine Sekunde kürzt sich weg.'],
          fehler: [{ t: 'v = ' + f(a) + ' m/s² / ' + f(t) + ' s', w: a / t, f: 'geteiltStattMal', e: 'm/s³', erkl: 'Es gilt v = a·t: Beschleunigung mal Zeit. Du hast geteilt.' },
            { t: 'v = ' + f(a) + ' m/s² / 2 · (' + f(t) + ' s)²', w: P.sBeschl(a, t), f: 'wegStattGeschwindigkeit', e: 'm', erkl: 'Das ist die Formel für den Weg. Für die Geschwindigkeit gilt v = a·t.' }] },
        antwort: x, einheit: 'm/s',
        loesung: p('v = a·t') + p('v = ' + f(a) + ' m/s² · ' + f(t) + ' s ' + erg(x, 'm/s'))
      };
    }
  };

  DEF['t-va'] = {
    titel: 't = v/a',
    zahlen: anfahrZahlen,
    rueck: { k: ANFAHREN[1], a: 2.5, t: 8 },
    glatt: true,
    baue: function (z) {
      var a = z.a, v = P.vBeschl(a, z.t), x = v / a;
      return {
        frage: z.k.wer + ' beschleunigt aus dem Stand gleichmäßig mit ' + f(a) + ' m/s² auf ' + f(v) + ' m/s. Wie lange dauert das?',
        geg: [['a', a, 'm/s²'], ['v', v, 'm/s']], ges: 't in s', gesFalsch: falschGesucht('t', 's', 'm'),
        formel: [F_ANF_V[0], F_ANF_V[1], ['s = a/2·t²', 'Hier ist kein Weg gegeben. Du kennst v und a.']],
        umstellen: [['t = v/a', 'Richtig: v = a·t | :a ergibt t = v/a.'],
          ['t = v·a', 'Beim Umstellen von v = a·t nach t teilst du durch a. Du hast malgenommen.'],
          ['t = a/v', 'Du hast den Bruch auf den Kopf gestellt. Die Geschwindigkeit steht oben: t = v/a.']],
        ein: { richtig: ['t = ' + f(v) + ' m/s / ' + f(a) + ' m/s²', 'Richtig: Geschwindigkeit geteilt durch Beschleunigung ergibt Sekunden.'],
          fehler: [{ t: 't = ' + f(v) + ' m/s · ' + f(a) + ' m/s²', w: v * a, f: 'malStattGeteilt', e: 'm²/s³', erkl: 'Beim Umstellen von v = a·t nach t teilst du durch a. Du hast malgenommen.' },
            { t: 't = ' + f(a) + ' m/s² / ' + f(v) + ' m/s', w: a / v, f: 'kehrwert', e: '1/s', erkl: 'Du hast den Bruch auf den Kopf gestellt. Die Geschwindigkeit steht oben: t = v/a.' }] },
        antwort: x, einheit: 's',
        loesung: p('v = a·t ⇒ t = v/a') + p('t = ' + f(v) + ' m/s / ' + f(a) + ' m/s² ' + erg(x, 's'))
      };
    }
  };

  DEF['s-beschl'] = {
    titel: 's = a/2·t²',
    zahlen: anfahrZahlen,
    rueck: { k: ANFAHREN[2], a: 0.5, t: 60 },
    glatt: true,
    baue: function (z) {
      var a = z.a, t = z.t, x = P.sBeschl(a, t);
      var ein = 's = ' + f(a) + ' m/s² / 2 · (' + f(t) + ' s)²';
      return {
        frage: z.k.wer + ' fährt aus dem Stand mit a = ' + f(a) + ' m/s² los. Welchen Weg hat ' + z.k.pron + ' nach ' + f(t) + ' s zurückgelegt?',
        geg: [['a', a, 'm/s²'], ['t', t, 's']], ges: 's in m', gesFalsch: falschGesucht('s', 'v', 'm/s'),
        formel: F_ANF_S,
        ein: { richtig: [ein, 'Richtig: halbe Beschleunigung mal Zeit zum Quadrat.'],
          fehler: [{ t: 's = ' + f(a) + ' m/s² · (' + f(t) + ' s)²', w: a * t * t, f: 'halbVergessen', e: 'm', erkl: F.halbVergessen.erkl },
            { t: 's = ' + f(a) + ' m/s² / 2 · ' + f(t) + ' s', w: a / 2 * t, f: 'quadratVergessen', e: 'm/s', erkl: F.quadratVergessen.erkl }] },
        antwort: x, einheit: 'm',
        loesung: p('s = a/2·t²') + p(ein + ' = ' + f(a / 2) + ' m/s² · ' + f(t * t) + ' s² ' + erg(x, 'm'))
      };
    }
  };

  /** Anfahren mit Weg: meist aus glatten a und t, manchmal ein runder Weg (dann krummes Ergebnis). */
  function anfahrWegZahlen(rundesErgebnis) {
    return function (r) {
      var k = wahl(r, ANFAHREN);
      var a = wahl(r, k.a), t = bereich(r, k.t);
      if (r() < 0.3) {
        var s = wahl(r, k.sRund);
        return rundesErgebnis === 't' ? { k: k, a: a, s: s } : { k: k, t: t, s: s };
      }
      return { k: k, a: a, t: t, s: P.sBeschl(a, t) };
    };
  }

  /** Wurzel-Umstellung für t-beschl und fall-t; aSym ist 'a' oder 'g'. */
  function wurzelTeil(s, a, aSym) {
    var aT = f(a) + ' m/s²', sT = f(s) + ' m', x = P.tAusS(s, a), innen = 2 * s / a;
    return {
      umstellen: [['t = √(2s/' + aSym + ')', 'Richtig: s = ' + aSym + '/2·t² | ·2 | :' + aSym + ' | √ ergibt t = √(2s/' + aSym + ').'],
        ['t = 2s/' + aSym, F.wurzelVergessen.erkl],
        ['t = √(s/(2' + aSym + '))', 'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler: t = √(2s/' + aSym + ').']],
      ein: { richtig: ['t = √(2·' + sT + ' / ' + aT + ')', 'Richtig: Unter der Wurzel bleiben s² übrig, die Wurzel daraus ergibt Sekunden.'],
        fehler: [{ t: 't = 2·' + sT + ' / ' + aT, w: innen, f: 'wurzelVergessen', e: 's²', erkl: F.wurzelVergessen.erkl },
          { t: 't = √(' + sT + ' / ' + aT + ')', w: Math.sqrt(s / a), f: 'zweiVergessen', e: 's', erkl: 'In t = √(2s/' + aSym + ') steht oben die 2. Du hast sie vergessen.' },
          { t: 't = ' + sT + ' / ' + aT, w: s / a, f: 'gleichfoermig', e: 's²', erkl: F.gleichfoermig.erkl + ' Wie bei t = s/v durch ' + aSym + ' zu teilen, passt nicht.' }] },
      antwort: x,
      loesung: p('s = ' + aSym + '/2·t² ⇒ t = √(2s/' + aSym + ')') +
        p('t = √(2·' + sT + ' / ' + aT + ') ' + (exakt(innen) ? '= √(' + f(innen) + ' s²) ' : '') + erg(x, 's'))
    };
  }

  DEF['t-beschl'] = {
    titel: 't = √(2s/a)',
    zahlen: anfahrWegZahlen('t'),
    rueck: { k: ANFAHREN[2], a: 0.5, s: 1000 },
    baue: function (z) {
      var a = z.a, s = z.s, w = wurzelTeil(s, a, 'a');
      return {
        frage: z.k.wer + ' fährt aus dem Stand mit a = ' + f(a) + ' m/s² los. Wie lange braucht ' + z.k.pron + ' für ' + f(s) + ' m?',
        geg: [['a', a, 'm/s²'], ['s', s, 'm']], ges: 't in s', gesFalsch: falschGesucht('t', 'v', 'm/s'),
        formel: [F_ANF_S[0], F_ANF_S[1], ['v = a·t', 'Hier ist keine Geschwindigkeit gegeben. Du kennst den Weg s und die Beschleunigung a.']],
        umstellen: w.umstellen, ein: w.ein, antwort: w.antwort, einheit: 's', loesung: w.loesung
      };
    }
  };

  DEF['a-beschl'] = {
    titel: 'a = 2s/t²',
    zahlen: anfahrWegZahlen('a'),
    rueck: { k: ANFAHREN[0], t: 6, s: 28 },
    baue: function (z) {
      var t = z.t, s = z.s, x = P.aAusS(s, t);
      var sT = f(s) + ' m', tT = f(t) + ' s';
      return {
        frage: z.k.wer + ' fährt aus dem Stand gleichmäßig beschleunigt los und legt in ' + tT + ' ' + sT + ' zurück. Wie groß ist die Beschleunigung?',
        geg: [['t', t, 's'], ['s', s, 'm']], ges: 'a in m/s²', gesFalsch: falschGesucht('a', 'v', 'm/s'),
        formel: [['s = a/2·t²', 'Richtig: Weg aus dem Stand mit konstanter Beschleunigung.'], ['v = s/t', F.gleichfoermig.erkl],
          ['a = Δv/Δt', 'Dafür bräuchtest du eine Geschwindigkeitsänderung. Gegeben sind aber Weg und Zeit.']],
        umstellen: [['a = 2s/t²', 'Richtig: s = a/2·t² | ·2 | :t² ergibt a = 2s/t².'],
          ['a = s/(2t²)', 'Beim Umstellen nimmst du mal 2. Die 2 gehört in den Zähler: a = 2s/t².'],
          ['a = 2s/t', F.quadratVergessen.erkl]],
        ein: { richtig: ['a = 2·' + sT + ' / (' + tT + ')²', 'Richtig: doppelter Weg geteilt durch die Zeit zum Quadrat.'],
          fehler: [{ t: 'a = ' + sT + ' / (' + tT + ')²', w: s / (t * t), f: 'zweiVergessen', e: 'm/s²', erkl: F.zweiVergessen.erkl },
            { t: 'a = 2·' + sT + ' / ' + tT, w: 2 * s / t, f: 'quadratVergessen', e: 'm/s', erkl: F.quadratVergessen.erkl },
            { t: 'a = ' + sT + ' / ' + tT, w: P.vGleich(s, t), f: 'gleichfoermig', e: 'm/s', erkl: F.gleichfoermig.erkl + ' s/t ist eine Geschwindigkeit, keine Beschleunigung.' }] },
        antwort: x, einheit: 'm/s²',
        loesung: p('s = a/2·t² ⇒ a = 2s/t²') + p('a = 2·' + sT + ' / (' + tT + ')² = ' + f(2 * s) + ' m / ' + f(t * t) + ' s² ' + erg(x, 'm/s²'))
      };
    }
  };

  var EINHOLEN = [
    { a: [1.5, 2, 2.5, 3], t: [4, 8, 1], text: function (v, a) {
      return 'Ein Radfahrer fährt mit konstant ' + f(v) + ' m/s an einer Ampel vorbei. Im selben Moment fährt dort ein Auto mit a = ' + f(a) +
        ' m/s² aus dem Stand los. Nach welcher Zeit holt das Auto den Radfahrer ein?';
    } },
    { a: [0.75, 1, 1.25, 1.5], t: [6, 10, 1], text: function (v, a) {
      return 'Ein E-Bike fährt mit konstant ' + f(v) + ' m/s an einem stehenden E-Bike vorbei. Genau da fährt dieses mit a = ' + f(a) +
        ' m/s² los. Nach welcher Zeit holt es das erste E-Bike ein?';
    } },
    { a: [0.25, 0.5, 0.75], t: [40, 80, 5], text: function (v, a) {
      return 'Ein Güterzug fährt mit konstant ' + f(v) + ' m/s an einem Bahnsteig vorbei. Im selben Moment fährt dort ein Personenzug mit a = ' + f(a) +
        ' m/s² an. Nach welcher Zeit holt der Personenzug den Güterzug ein?';
    } }
  ];

  DEF['einholen'] = {
    titel: 'Einholen: v₁·t = a/2·t²',
    zahlen: function (r) {
      var k = wahl(r, EINHOLEN);
      var a = wahl(r, k.a), t = bereich(r, k.t);
      return { k: k, a: a, v: a * t / 2 };
    },
    rueck: { k: EINHOLEN[2], a: 0.5, v: 18.75 },
    glatt: true,
    baue: function (z) {
      var v = z.v, a = z.a, e = P.einholen(v, a), x = e.t;
      var vT = f(v) + ' m/s', aT = f(a) + ' m/s²';
      return {
        frage: z.k.text(v, a),
        geg: [['v₁', v, 'm/s'], ['a', a, 'm/s²']], ges: 't in s', gesFalsch: falschGesucht('t', 's', 'm'),
        formel: [['v₁·t = a/2·t²', 'Richtig: Einholen heißt gleicher Ort. Beide haben denselben Weg zurückgelegt.'],
          ['v₁ = a·t', 'Dann sind beide nur gleich schnell. Einholen heißt: Beide sind am gleichen Ort, also gleicher Weg.'],
          ['v₁·t = a·t²', F.halbVergessen.erkl]],
        umstellen: [['t = 2·v₁/a', 'Richtig: v₁·t = a/2·t² | :t | ·2 | :a ergibt t = 2·v₁/a.'],
          ['t = v₁/a', 'Das ist der Moment, in dem beide gleich schnell sind. Die 2 aus a/2 fehlt.'],
          ['t = √(2·v₁/a)', 'Du teilst beide Seiten durch t. Danach steht t nicht mehr im Quadrat, eine Wurzel brauchst du nicht.']],
        ein: { richtig: ['t = 2·' + vT + ' / ' + aT, 'Richtig: doppelte Geschwindigkeit geteilt durch die Beschleunigung.'],
          fehler: [{ t: 't = ' + vT + ' / ' + aT, w: v / a, f: 'gleichSchnell', e: 's', erkl: 'Das ist der Moment, in dem beide gleich schnell sind. Eingeholt ist erst, wenn beide denselben Weg haben.' },
            { t: 't = ' + aT + ' / (2·' + vT + ')', w: a / (2 * v), f: 'kehrwert', e: '1/s', erkl: 'Du hast den Bruch auf den Kopf gestellt. Die Geschwindigkeit steht oben: t = 2·v₁/a.' }] },
        antwort: x, einheit: 's',
        loesung: p('v₁·t = a/2·t² | :t ⇒ v₁ = a/2·t ⇒ t = 2·v₁/a') + p('t = 2·' + vT + ' / ' + aT + ' ' + erg(x, 's')) +
          p('Treffpunkt: s = v₁·t = ' + vT + ' · ' + f(x) + ' s ' + erg(e.s, 'm'))
      };
    }
  };

  function bremsZahlen(r) {
    var k = wahl(r, BREMSEN);
    var a = wahl(r, k.a), t = bereich(r, k.t);
    return { k: k, a: a, t: t, v: a * t };
  }

  DEF['brems-a'] = {
    titel: 'Bremsen: a = Δv/Δt',
    zahlen: bremsZahlen,
    rueck: { k: BREMSEN[1], a: 4.5, t: 2, v: 9 },
    glatt: true,
    baue: function (z) {
      var v = z.v, t = z.t, x = P.aAusV(0 - v, t);
      var dv = '(0 m/s − ' + f(v) + ' m/s)';
      return {
        frage: z.k.wer + ' bremst gleichmäßig von ' + f(v) + ' m/s bis zum Stand. Das dauert ' + f(t) + ' s. Wie groß ist die Beschleunigung? Achte auf das Vorzeichen.',
        geg: [['v₀', v, 'm/s'], ['v', 0, 'm/s'], ['Δt', t, 's']], ges: 'a in m/s²',
        gesFalsch: ['s in m', 'Nach dem Bremsweg ist nicht gefragt. Gesucht ist die Beschleunigung a.'],
        formel: [['a = Δv/Δt', 'Richtig: Beschleunigung ist Geschwindigkeitsänderung pro Zeit, auch beim Bremsen.'],
          ['v = s/t', 'Damit rechnest du eine Geschwindigkeit aus. Gefragt ist die Beschleunigung.'],
          ['s = a/2·t²', 'Hier ist kein Weg gegeben, und es geht nicht um ein Anfahren aus dem Stand.']],
        ein: { richtig: ['a = ' + dv + ' / ' + f(t) + ' s', 'Richtig: Endwert minus Anfangswert. Weil die Geschwindigkeit abnimmt, wird a negativ.'],
          fehler: [{ t: 'a = (' + f(v) + ' m/s − 0 m/s) / ' + f(t) + ' s', w: v / t, f: 'vorzeichen', e: 'm/s²', erkl: F.vorzeichen.erkl + ' Δv ist Endwert minus Anfangswert.' },
            { t: 'a = ' + f(t) + ' s / ' + dv, w: t / (0 - v), f: 'kehrwert', e: 's²/m', erkl: F.kehrwert.erkl }] },
        antwort: x, einheit: 'm/s²',
        loesung: p('a = Δv/Δt = (v − v₀)/Δt') + p('a = ' + dv + ' / ' + f(t) + ' s ' + erg(x, 'm/s²')) +
          p('Das Minus zeigt: Das Fahrzeug wird langsamer. Der Betrag der Bremsbeschleunigung ist ' + f(-x) + ' m/s².')
      };
    }
  };

  DEF['bremsweg'] = {
    titel: 'Bremsweg: s = v₀·t − a/2·t²',
    zahlen: bremsZahlen,
    rueck: { k: BREMSEN[0], a: 5, t: 4, v: 20 },
    glatt: true,
    baue: function (z) {
      var v = z.v, a = z.a, t = P.bremsZeit(v, a), x = P.sBrems(v, a, t);
      var vT = f(v) + ' m/s', aT = f(a) + ' m/s²', tT = f(t) + ' s';
      var zeit = 't = ' + vT + ' / ' + aT + ' = ' + tT + '<br>';
      return {
        frage: z.k.wer + ' fährt mit ' + vT + ' und bremst gleichmäßig mit ' + aT + ' bis zum Stand. Wie lang ist der Bremsweg?',
        geg: [['v₀', v, 'm/s'], ['a', a, 'm/s²']], ges: 's in m', gesFalsch: falschGesucht('s', 't', 's'),
        formel: [['s = v₀·t − a/2·t²', 'Richtig: Beim Bremsen startest du mit v₀, die Bremsung zieht a/2·t² ab.'],
          ['s = v₀·t', 'So weit käme das Fahrzeug ohne Bremsen. Beim Bremsen wird a/2·t² abgezogen.'],
          ['s = v₀·t + a/2·t²', 'Beim Bremsen wird abgezogen: s = v₀·t − a/2·t². Mit Plus würde das Fahrzeug schneller.']],
        umstellen: [['t = v₀/a', 'Richtig: Am Ende ist v = 0. Aus 0 = v₀ − a·t folgt t = v₀/a.'],
          ['t = a/v₀', 'Du hast den Bruch auf den Kopf gestellt. Aus 0 = v₀ − a·t folgt t = v₀/a.'],
          ['t = v₀·a', 'Aus 0 = v₀ − a·t folgt a·t = v₀. Du teilst durch a, du nimmst nicht mal.']],
        ein: { richtig: [zeit + 's = ' + vT + ' · ' + tT + ' − ' + aT + ' / 2 · (' + tT + ')²', 'Richtig: erst die Bremszeit, dann beide Teile des Wegs mit Einheiten.'],
          fehler: [{ t: zeit + 's = ' + vT + ' · ' + tT + ' + ' + aT + ' / 2 · (' + tT + ')²', w: v * t + a / 2 * t * t, f: 'vorzeichen', e: 'm', erkl: F.vorzeichen.erkl + ' Deshalb steht in s = v₀·t − a/2·t² ein Minus.' },
            { t: zeit + 's = ' + vT + ' · ' + tT, w: P.sGleich(v, t), f: 'gleichfoermig', e: 'm', erkl: 'Das wäre der Weg ohne Bremsen, mit konstanter Geschwindigkeit. Der Teil − a/2·t² fehlt.' },
            { t: zeit + 's = ' + vT + ' · ' + tT + ' − ' + aT + ' / 2 · ' + tT, w: v * t - a / 2 * t, f: 'quadratVergessen', e: 'm', erkl: 'In s = v₀·t − a/2·t² steht die Zeit im Quadrat. Du hast t nur einfach genommen.' }] },
        antwort: x, einheit: 'm',
        loesung: p('Bremszeit: 0 = v₀ − a·t ⇒ t = v₀/a = ' + vT + ' / ' + aT + ' ' + erg(t, 's')) + p('s = v₀·t − a/2·t²') +
          p('s = ' + vT + ' · ' + tT + ' − ' + aT + ' / 2 · (' + tT + ')² = ' + f(v * t) + ' m − ' + f(a / 2 * t * t) + ' m ' + erg(x, 'm'))
      };
    }
  };

  var FALLEN = [
    { s: [15, 20, 25, 30, 40, 45, 50], text: function (s) { return 'Ein Stein fällt von einer Brücke ' + f(s) + ' m tief ins Wasser. Wie lange dauert der Fall?'; } },
    { s: [3, 5, 7.5, 10], text: function (s) { return 'Eine Kugel fällt vom ' + f(s) + '-m-Turm ins Becken. Wie lange dauert der Fall?'; } },
    { s: [60, 80, 100, 125], text: function (s) { return 'Ein Stein fällt von einer Klippe ' + f(s) + ' m tief. Wie lange dauert der Fall?'; } }
  ];

  DEF['fall-t'] = {
    titel: 'Freier Fall: t = √(2s/g)',
    zahlen: function (r) { var k = wahl(r, FALLEN); return { k: k, s: wahl(r, k.s) }; },
    rueck: { k: FALLEN[1], s: 5 },
    baue: function (z) {
      var s = z.s, w = wurzelTeil(s, G, 'g');
      return {
        frage: z.k.text(s) + ' Den Luftwiderstand lässt du weg.',
        geg: [['s', s, 'm'], ['g', G, 'm/s²']], ges: 't in s', gesFalsch: falschGesucht('t', 'v', 'm/s'),
        formel: [['s = g/2·t²', 'Richtig: Der freie Fall ist eine beschleunigte Bewegung aus dem Stand mit a = g.'], ['s = v·t', F.gleichfoermig.erkl],
          ['v = g·t', 'Damit rechnest du die Geschwindigkeit aus. Gegeben ist die Fallhöhe.']],
        umstellen: w.umstellen, ein: w.ein, antwort: w.antwort, einheit: 's', loesung: w.loesung
      };
    }
  };

  var FALLZEIT = [
    { wer: 'Ein Stein', wo: ' von einer Brücke', t: [1.5, 2, 2.5, 3, 3.5, 4] },
    { wer: 'Ein Apfel', wo: ' vom Baum', t: [0.5, 0.6, 0.7, 0.8, 1] },
    { wer: 'Ein Schlüsselbund', wo: ' aus einem Fenster', t: [0.5, 1, 1.2, 1.5, 2] }
  ];

  DEF['fall-v'] = {
    titel: 'Freier Fall: v = g·t',
    zahlen: function (r) { var k = wahl(r, FALLZEIT); return { k: k, t: wahl(r, k.t) }; },
    rueck: { k: FALLZEIT[0], t: 1.5 },
    baue: function (z) {
      var t = z.t, x = P.vBeschl(G, t), gT = f(G) + ' m/s²', tT = f(t) + ' s';
      return {
        frage: z.k.wer + ' fällt ' + tT + ' lang frei' + z.k.wo + '. Wie schnell ist er dann? Den Luftwiderstand lässt du weg.',
        geg: [['t', t, 's'], ['g', G, 'm/s²']], ges: 'v in m/s', gesFalsch: falschGesucht('v', 's', 'm'),
        formel: [['v = g·t', 'Richtig: Freier Fall aus dem Stand mit a = g, also v = g·t.'], ['v = s/t', F.gleichfoermig.erkl],
          ['s = g/2·t²', 'Damit rechnest du den Fallweg aus. Gefragt ist die Geschwindigkeit.']],
        ein: { richtig: ['v = ' + gT + ' · ' + tT, 'Richtig: Fallbeschleunigung mal Zeit.'],
          fehler: [{ t: 'v = ' + gT + ' / ' + tT, w: G / t, f: 'geteiltStattMal', e: 'm/s³', erkl: 'Es gilt v = g·t: Fallbeschleunigung mal Zeit. Du hast geteilt.' },
            { t: 'v = ' + gT + ' / 2 · (' + tT + ')²', w: P.sBeschl(G, t), f: 'wegStattGeschwindigkeit', e: 'm', erkl: 'Das ist die Formel für den Fallweg. Für die Geschwindigkeit gilt v = g·t.' }] },
        antwort: x, einheit: 'm/s',
        loesung: p('v = g·t') + p('v = ' + gT + ' · ' + tT + ' ' + erg(x, 'm/s'))
      };
    }
  };

  var IDS = ['kmh-ms', 'ms-kmh', 'v-gleich', 's-gleich', 't-gleich', 'a-dv', 'v-at', 't-va', 's-beschl', 't-beschl',
    'a-beschl', 'einholen', 'brems-a', 'bremsweg', 'fall-t', 'fall-v'];

  /* ---------- Schritte bauen ---------- */

  function ggOptionen(a, r) {
    function zeile(liste, ges) {
      return 'Gegeben: ' + liste.map(function (g) { return gr(g[0], g[1], g[2]); }).join(', ') + '<br>Gesucht: ' + ges;
    }
    var k = Math.floor(r() * a.geg.length), g = a.geg[k];
    var falsch = a.geg.map(function (x, i) { return i === k ? [x[0], x[1], TAUSCH[x[2]]] : x; });
    return [
      [zeile(a.geg, a.ges), 'Richtig: Alle Größen mit Einheit, gesucht ist ' + a.ges + '.'],
      [zeile(falsch, a.ges), 'Schau auf die Einheit: ' + gr(g[0], g[1], g[2]) + ', nicht ' + f(g[1]) + ' ' + TAUSCH[g[2]] + '.'],
      [zeile(a.geg, a.gesFalsch[0]), a.gesFalsch[1]]
    ];
  }

  function einOptionen(a) {
    return [a.ein.richtig].concat(a.ein.fehler.map(function (x) {
      return [x.t, x.erkl + ' Das ergäbe ' + zahl(x.w) + ' ' + x.e + '.'];
    }));
  }

  /** Mischt die Optionen (erste ist richtig) mit dem Zufallsgenerator. */
  function schritt(art, opts, r) {
    var idx = opts.map(function (o, i) { return i; });
    for (var i = idx.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = idx[i]; idx[i] = idx[j]; idx[j] = t;
    }
    return {
      art: art,
      optionen: idx.map(function (i) { return opts[i][0]; }),
      richtig: idx.indexOf(0),
      optErkl: idx.map(function (i) { return opts[i][1]; })
    };
  }

  function zurueck(text) { return Number(text.replace('−', '-').replace(',', '.')); }
  function verschieden(liste) { return liste.every(function (x, i) { return liste.indexOf(x) === i; }); }
  function texte(opts) { return opts.map(function (o) { return o[0]; }); }

  /** Kollisionen und unschöne Zahlen ausschließen. */
  function taugt(d, a) {
    var werte = [a.antwort].concat(a.ein.fehler.map(function (x) { return x.w; }));
    if (!werte.every(function (w) { return typeof w === 'number' && isFinite(w); })) return false;
    if (!verschieden(werte.map(function (w) { return f(w); }))) return false;
    if (a.ein.fehler.some(function (x) { return P.passt(x.w, a.antwort, null, 0.01); })) return false;
    if (d.glatt && !exakt(a.antwort)) return false;
    // Auch ohne glatt: Das auf zwei Stellen gerundete Ergebnis muss innerhalb der Toleranz liegen.
    if (Math.abs(zurueck(f(a.antwort)) - a.antwort) > Math.abs(a.antwort) * 0.005) return false;
    if (!a.geg.every(function (g) { return exakt(g[1]); })) return false;
    var listen = [a.formel, einOptionen(a)];
    if (a.umstellen) listen.push(a.umstellen);
    return listen.every(function (l) { return verschieden(texte(l)); });
  }

  function erzeuge(id, r) {
    var d = DEF[id];
    if (!d) throw new Error('Unbekannter Trainer: ' + id);
    r = r || Math.random;
    var a = null;
    for (var i = 0; i < 20 && !a; i++) {
      var kand = d.baue(d.zahlen(r));
      if (taugt(d, kand)) a = kand;
    }
    if (!a) a = d.baue(d.rueck);
    var schritte = [schritt('gg', ggOptionen(a, r), r), schritt('formel', a.formel, r)];
    if (a.umstellen) schritte.push(schritt('umstellen', a.umstellen, r));
    schritte.push(schritt('einsetzen', einOptionen(a), r));
    return {
      id: 't:' + id,
      typ: 'rechnung',
      frage: a.frage,
      schritte: schritte,
      antwort: a.antwort,
      einheit: a.einheit,
      loesung: a.loesung,
      formel: id,
      fehlerwerte: a.ein.fehler.map(function (x) { return { fehler: x.f, wert: x.w }; })
    };
  }

  function titel(id) { return DEF[id] ? DEF[id].titel : id; }

  W.trainer = { IDS: IDS, erzeuge: erzeuge, titel: titel };
})();
