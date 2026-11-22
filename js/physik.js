/* Physik-Logik: Formeln, Mittelpunkt-Regel, Zahlenformat, Antwortvergleich, Fehlertexte. Ohne DOM. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});

  var G = 9.81;

  function kmh(ms) { return ms * 3.6; }
  function ms(kmh) { return kmh / 3.6; }

  function vGleich(s, t) { return s / t; }
  function tGleich(s, v) { return s / v; }
  function sGleich(v, t, s0) { return (s0 || 0) + v * t; }

  function vBeschl(a, t, v0) { return (v0 || 0) + a * t; }
  function sBeschl(a, t, v0, s0) { return (s0 || 0) + (v0 || 0) * t + a / 2 * t * t; }
  function tAusS(s, a) { return Math.sqrt(2 * s / a); }
  function aAusS(s, t) { return 2 * s / (t * t); }
  function aAusV(dv, dt) { return dv / dt; }

  function bremsZeit(v0, aBetrag) { return v0 / aBetrag; }
  function bremsWeg(v0, aBetrag) { return v0 * v0 / (2 * aBetrag); }
  function sBrems(v0, aBetrag, t) { return v0 * t - aBetrag / 2 * t * t; }

  /** Mittelpunkt-Regel: Differenzenquotient je Intervall, Zeit = Intervallmitte. */
  function mittel(ts, werte) {
    var t = [], wert = [];
    for (var i = 0; i < ts.length - 1; i++) {
      t.push((ts[i] + ts[i + 1]) / 2);
      wert.push((werte[i + 1] - werte[i]) / (ts[i + 1] - ts[i]));
    }
    return { t: t, wert: wert };
  }

  /** Konstante Geschwindigkeit v1 gegen Start aus dem Stand mit a2, beide bei s = 0. */
  function einholen(v1, a2) {
    var t = 2 * v1 / a2;
    return { t: t, s: v1 * t };
  }

  /** mulberry32: kleiner Zufallsgenerator mit Seed, liefert Zahlen in [0, 1). */
  function rnd(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Ganze Zahl von min bis max (einschließlich) in Schritten. */
  function ganz(r, min, max, schritt) {
    schritt = schritt || 1;
    var n = Math.floor((max - min) / schritt) + 1;
    return min + Math.floor(r() * n) * schritt;
  }

  /** Dezimalkomma, höchstens `stellen` Nachkommastellen, ohne Nullen am Ende, Minus als U+2212. */
  function fmt(x, stellen) {
    if (stellen == null) stellen = 2;
    if (typeof x !== 'number' || !isFinite(x)) return '';
    var s = x.toFixed(stellen);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    return s.replace('-', '−').replace('.', ',');
  }

  /** Passt die Eingabe zur Antwort (oder einem Wert aus `auch`)? Relative Toleranz, Standard 1 %.
      „1.125“ ist mehrdeutig (Tausenderpunkt oder Dezimalpunkt): Dann gilt jede der beiden Lesarten. */
  function passt(eingabe, antwort, auch, tolRel) {
    if (tolRel == null) tolRel = 0.01;
    var e = typeof eingabe === 'number' ? eingabe : W.text.parseZahl(eingabe);
    if (typeof e !== 'number' || isNaN(e)) return false;
    var lesarten = [e];
    var m = typeof eingabe === 'string' && eingabe.replace(/[−–]/g, '-').match(/^\s*(-?\d{1,3}\.\d{3})(?:\s*[^\d\s.,][^\d]*)?\s*$/);
    if (m) lesarten.push(parseFloat(m[1]));
    return [antwort].concat(auch || []).some(function (soll) {
      return lesarten.some(function (x) { return Math.abs(x - soll) <= Math.max(Math.abs(soll) * tolRel, 1e-9); });
    });
  }

  var FEHLER = {
    mal36: { erkl: 'Von km/h nach m/s teilst du durch 3,6. Du hast mal 3,6 gerechnet.' },
    durch36: { erkl: 'Von m/s nach km/h multiplizierst du mit 3,6. Du hast durch 3,6 geteilt.' },
    halbVergessen: { erkl: 'In s = a/2·t² steckt die Hälfte. Du hast sie vergessen.' },
    quadratVergessen: { erkl: 'In s = a/2·t² steht die Zeit im Quadrat. Du hast t nur einfach genommen.' },
    wurzelVergessen: { erkl: 'Bei t = √(2s/a) musst du am Ende die Wurzel ziehen. Du hast bei t² aufgehört.' },
    gleichfoermig: { erkl: 'Das ist die Formel für konstante Geschwindigkeit. Hier wird beschleunigt.' },
    kehrwert: { erkl: 'Du hast den Bruch auf den Kopf gestellt. Die Zeit gehört in den Nenner, wenn du eine Geschwindigkeit oder Beschleunigung ausrechnest.' },
    vorzeichen: { erkl: 'Beim Bremsen nimmt die Geschwindigkeit ab. Die Beschleunigung ist negativ, der Betrag bleibt gleich.' },
    intervallAnfang: { erkl: 'Das ist der Wert am Anfang des Intervalls. Bei der Mittelpunkt-Regel gehört der Wert zur Mitte des Intervalls.' },
    messwertStattDifferenz: { erkl: 'Du hast einen Messwert abgelesen. Gefragt ist die Änderung: Endwert minus Anfangswert, geteilt durch die Zeitspanne.' },
    zweiVergessen: { erkl: 'Bei a = 2s/t² steht oben die 2. Du hast sie vergessen.' }
  };

  W.physik = {
    G: G, kmh: kmh, ms: ms,
    vGleich: vGleich, tGleich: tGleich, sGleich: sGleich,
    vBeschl: vBeschl, sBeschl: sBeschl, tAusS: tAusS, aAusS: aAusS, aAusV: aAusV,
    bremsZeit: bremsZeit, bremsWeg: bremsWeg, sBrems: sBrems,
    mittel: mittel, einholen: einholen, rnd: rnd, ganz: ganz, fmt: fmt, passt: passt, FEHLER: FEHLER
  };
})();
