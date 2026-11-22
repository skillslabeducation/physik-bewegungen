/* Physik-Logik: alle Lösungen der Blätter und der Tafel. */
const laden = require('./laden');
const { test, ok, eq, near, fertig } = require('./mini');
const W = laden(['js/util.js', 'js/text.js', 'js/physik.js']);
const P = W.physik;

function nearArr(a, b, tol, msg) {
  eq(a.length, b.length, msg);
  a.forEach((x, i) => near(x, b[i], tol, msg));
}

test('Umrechnung km/h und m/s', () => {
  near(P.kmh(18.75), 67.5, 0.01);
  near(P.ms(135), 37.5, 0.01);
  near(P.ms(300), 83.33, 0.01);
  near(P.ms(100), 27.78, 0.01);
});

test('Blatt 1 und Treffpunkt', () => {
  near(P.vGleich(750, 40), 18.75, 0.01);
  near(P.tGleich(2400, 18.75), 128, 0.01);
  near(P.vBeschl(0.5, 60), 30, 0.01);
  near(P.tAusS(1000, 0.5), 63.25, 0.01);
  near(P.einholen(18.75, 0.5).t, 75, 0.01);
  near(P.einholen(18.75, 0.5).s, 1406.25, 0.01);
});

test('Sprungturm', () => {
  const a = P.mittel([0, 0.2, 0.4, 0.6, 0.8], [0, 0.196, 0.785, 1.766, 3.139]);
  nearArr(a.t, [0.1, 0.3, 0.5, 0.7], 0.01);
  nearArr(a.wert, [0.98, 2.945, 4.905, 6.865], 0.01);
  const b = P.mittel(a.t, a.wert);
  nearArr(b.t, [0.2, 0.4, 0.6], 0.01);
  nearArr(b.wert, [9.825, 9.8, 9.8], 0.01);
  near(P.tAusS(5, P.G), 1.01, 0.01);
});

test('Blatt 2 A1', () => {
  near(P.vGleich(28, 6), 4.667, 0.01);
  near(P.kmh(28 / 6), 16.8, 0.01);
  near(P.aAusS(28, 6), 1.556, 0.01);
  near(P.tAusS(50, 14 / 9), 8.02, 0.01);
  near(P.tAusS(50, 1.56), 8.01, 0.01);
  near(P.aAusS(P.vGleich(28, 6) * 5, 5), 1.867, 0.01);
});

test('Blatt 2 A2', () => {
  const a = P.mittel([0, 0.5, 1, 1.5, 2], [0, 3.9375, 6.75, 8.4375, 9]);
  nearArr(a.wert, [7.875, 5.625, 3.375, 1.125], 0.01);
  nearArr(a.t, [0.25, 0.75, 1.25, 1.75], 0.01);
  const b = P.mittel(a.t, a.wert);
  nearArr(b.wert, [-4.5, -4.5, -4.5], 0.01);
  nearArr(b.t, [0.5, 1, 1.5], 0.01);
  near(P.sBrems(9, 4.5, 2), 9, 0.01);
  near(P.kmh(9), 32.4, 0.01);
});

test('Tafel', () => {
  near(P.vGleich(84.7, 61.5), 1.377, 0.01);
  near(P.tGleich(11200, 5), 2240, 0.01);
  near(P.tAusS(1000, P.G), 14.28, 0.01);
  near(P.vBeschl(P.G, P.tAusS(1000, P.G)), 140.07, 0.01);
  near(P.aAusS(10, 3.3), 1.837, 0.01);
  near(P.aAusS(1000, 18), 6.173, 0.01);
  near(2 * 1000 / 18, 111.1, 0.02);
  near(P.aAusV(37.5, 60), 0.625, 0.001);
  near(83.333 / 0.625, 133.33, 0.01);
  near(P.sBeschl(0.625, 133.333), 5555.6, 0.1);
  near(P.bremsZeit(P.ms(300), 0.74074), 112.5, 0.01);
  near(P.sBrems(27.78, 5.556, 5), 69.45, 0.01);
  near(P.sBrems(27.78, 9.259, 3), 41.67, 0.01);
  const l = P.mittel([0, 20, 40, 60, 80, 100], [0, 40, 88, 144, 200, 248]);
  nearArr(l.wert, [2, 2.4, 2.8, 2.8, 2.4], 0.001);
  nearArr(P.mittel(l.t, l.wert).wert, [0.02, 0.02, 0, -0.02], 0.001);
  near(P.aAusS(400, 10), 8, 0.001);
  near(P.tAusS(200, 8), 7.07, 0.01);
  near(P.bremsWeg(80, 12), 266.67, 0.01);
  const d = P.mittel([0, 2, 4, 6], [0, 5, 12, 20]);
  nearArr(d.wert, [2.5, 3.5, 4], 0.001);
  nearArr(P.mittel(d.t, d.wert).wert, [0.5, 0.25], 0.001);
});

test('Rakete (Plus)', () => {
  near(P.vBeschl(5.5, 30), 165, 0.01);
  near(P.sBeschl(5.5, 30), 2475, 0.01);
  near(P.bremsZeit(165, P.G), 16.82, 0.01);
  near(2475 + P.bremsWeg(165, P.G), 3862.6, 1);
  near(P.sBeschl(2, 3, 4, 5), 5 + 12 + 9, 1e-9);
});

test('fmt', () => {
  eq(P.fmt(18.75), '18,75');
  eq(P.fmt(30), '30');
  eq(P.fmt(63.2456), '63,25');
  eq(P.fmt(0.5), '0,5');
  eq(P.fmt(-4.5), '\u22124,5');
  eq(P.fmt(1125), '1125');
  eq(P.fmt(3.14159, 3), '3,142');
});

test('fmt rundet kaufmännisch trotz Gleitkomma', () => {
  eq(P.fmt(2.945), '2,95');
  eq(P.fmt(9.825), '9,83');
  eq(P.fmt(1.005), '1,01');
  eq(P.fmt(4.905), '4,91');
  eq(P.fmt(6.865), '6,87');
  eq(P.fmt(-4.5), '−4,5');
  eq(P.fmt(-2.945), '−2,95');
  eq(P.fmt(-0.001), '0');
  eq(P.fmt(0.0625, 3), '0,063');
  eq(P.fmt(1406.25, 1), '1406,3');
});

test('passt', () => {
  ['18,75', '18.75', ' 18,75 ', '18,75 m/s', 18.75].forEach((e) => ok(P.passt(e, 18.75), String(e)));
  ok(P.passt('1.125', 1125));
  ok(P.passt('1 125', 1125));
  ok(!P.passt('19', 18.75));
  ok(P.passt('8,01', 8.018));
  ok(P.passt('8,02', 8.018));
  ok(P.passt('5', 18.75, [5]));
  ok(!P.passt('abc', 18.75));
  ok(P.passt('0', 0));
  // 1.125 ist mehrdeutig (Tausenderpunkt oder Dezimalpunkt): beide Lesarten gelten.
  ok(P.passt('1.125', 1.125));
  ok(P.passt('1.125 m', 1.125));
  ok(P.passt('1.125', 1125));
  ok(!P.passt('1,125', 1125));
});

test('rnd und ganz', () => {
  const r1 = P.rnd(42), r2 = P.rnd(42);
  const f1 = [r1(), r1(), r1()], f2 = [r2(), r2(), r2()];
  eq(f1, f2);
  f1.forEach((x) => ok(x >= 0 && x < 1));
  const r = P.rnd(7);
  const seen = {};
  for (let i = 0; i < 300; i++) seen[P.ganz(r, 2, 8, 2)] = true;
  eq(Object.keys(seen).sort(), ['2', '4', '6', '8']);
});

test('FEHLER: alle Schlüssel mit Erklärung', () => {
  const keys = ['mal36', 'durch36', 'halbVergessen', 'quadratVergessen', 'wurzelVergessen', 'gleichfoermig', 'kehrwert', 'vorzeichen', 'intervallAnfang', 'messwertStattDifferenz', 'zweiVergessen'];
  eq(Object.keys(P.FEHLER).sort(), keys.slice().sort());
  keys.forEach((k) => ok(typeof P.FEHLER[k].erkl === 'string' && P.FEHLER[k].erkl.length > 10, k));
  eq(P.FEHLER.mal36.erkl, 'Von km/h nach m/s teilst du durch 3,6. Du hast mal 3,6 gerechnet.');
  eq(P.FEHLER.halbVergessen.erkl, 'In s = a/2·t² steckt die Hälfte. Du hast sie vergessen.');
  eq(P.FEHLER.gleichfoermig.erkl, 'Das ist die Formel für konstante Geschwindigkeit. Hier wird beschleunigt.');
});

fertig('physik');
