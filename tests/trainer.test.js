/* Rechentrainer: jede id, viele Seeds, berechnete Fehleroptionen, Nachrechnen aus dem Aufgabentext. */
const laden = require('./laden');
const { test, ok, eq, near, fertig } = require('./mini');
const W = laden();
const P = W.physik;
const T = W.trainer;
const A = W.aufgaben;

const IDS = ['kmh-ms', 'ms-kmh', 'v-gleich', 's-gleich', 't-gleich', 'a-dv', 'v-at', 't-va', 's-beschl', 't-beschl',
  'a-beschl', 'einholen', 'brems-a', 'bremsweg', 'fall-t', 'fall-v'];
const NEGATIV = ['brems-a'];
const SEEDS = 2000;

/* Unabhängige Nachrechnung aus den Zahlen im Fragetext (in Reihenfolge des Auftretens). */
const NACH = {
  'kmh-ms': ([v]) => v / 3.6,
  'ms-kmh': ([v]) => v * 3.6,
  'v-gleich': ([s, t]) => s / t,
  's-gleich': ([t, v]) => v * t,
  't-gleich': ([v, s]) => s / v,
  'a-dv': ([t, v1, v2]) => (v2 - v1) / t,
  'v-at': ([a, t]) => a * t,
  't-va': ([a, v]) => v / a,
  's-beschl': ([a, t]) => 0.5 * a * t * t,
  't-beschl': ([a, s]) => Math.sqrt(2 * s / a),
  'a-beschl': ([t, s]) => 2 * s / (t * t),
  'einholen': ([v1, a]) => 2 * v1 / a,
  'brems-a': ([v0, t]) => -v0 / t,
  'bremsweg': ([v0, a]) => v0 * v0 / (2 * a),
  'fall-t': ([s]) => Math.sqrt(2 * s / 9.81),
  'fall-v': ([t]) => 9.81 * t
};

function zahlenIn(text) {
  return (text.replace(/<[^>]*>/g, ' ').match(/−?\d+(?:,\d+)?/g) || []).map((z) => parseFloat(z.replace('−', '-').replace(',', '.')));
}

/* Rechenweg: Jede Zeile der Lösung wird an „=“ und „≈“ zerlegt. Rein numerische Abschnitte (Einheiten weg)
   werden ausgerechnet; Nachbarn mit „=“ müssen exakt gleich sein, mit „≈“ bis auf Rundung auf 2 Stellen. */
function abschnittWert(seg) {
  let x = seg.replace(/\b(km\/h|m\/s²|m\/s|s²|m|s)(?![\wäöüß])/g, ' ').trim();
  x = x.replace(/ : /g, ' / ').replace(/·/g, '*').replace(/−/g, '-').replace(/,/g, '.');
  // Nur Ziffern, Rechenzeichen, Klammern, Wurzel und Quadrat: sonst ist der Abschnitt symbolisch.
  if (!x || /[^\d.\s()*\/+\-√²]/.test(x)) return null;
  x = x.replace(/√/g, 'Math.sqrt').replace(/²/g, '**2');
  return Function('return (' + x + ');')();
}
function pruefeRechenweg(loesung, m) {
  loesung.split(/<\/p>/).map((z) => z.replace(/<[^>]*>/g, '')).forEach((zeile) => {
    zeile.split('⇒').forEach((teil) => {
      const stuecke = teil.split(/\s*([=≈])\s*/);
      for (let i = 2; i < stuecke.length; i += 2) {
        const links = stuecke[i - 2], rechts = stuecke[i];
        if ((links.indexOf('km/h') >= 0) !== (rechts.indexOf('km/h') >= 0)) continue;
        const l = abschnittWert(links), r = abschnittWert(rechts);
        if (l == null || r == null) continue;
        const tol = stuecke[i - 1] === '=' ? 1e-9 * Math.max(1, Math.abs(l)) : 0.0051 + 1e-9 * Math.abs(l);
        ok(Math.abs(l - r) <= tol, m + 'Rechenweg „' + links + ' ' + stuecke[i - 1] + ' ' + rechts + '“ (' + l + ' gegen ' + r + ')');
      }
    });
  });
}

/* Realistische Grenzen je Fahrzeug: Anfahren, Bremsen, Höchstgeschwindigkeit (m/s²; m/s). */
const GRENZE = {
  'E-Bike': { a: 3, brems: 4.5, v: 10 },
  'Auto': { a: 6, brems: 8, v: 40 },
  'Zug': { a: 1.5, brems: 1.5, v: 70 },
  'Läufer': { a: 3, brems: 3, v: 10 },
  'Radfahrer': { a: 3, brems: 4, v: 12 }
};
/* Je id: Liste [Fahrzeug-Index im Text (0 erstes, 1 zweites genanntes), a, v, Bremsen?] aus den Zahlen im Fragetext. */
const REAL = {
  'kmh-ms': ([v]) => [[0, null, v / 3.6]],
  'ms-kmh': ([v]) => [[0, null, v]],
  'v-gleich': ([s, t]) => [[0, null, s / t]],
  's-gleich': ([t, v]) => [[0, null, v]],
  't-gleich': ([v]) => [[0, null, v]],
  'a-dv': ([t, v1, v2]) => [[0, (v2 - v1) / t, v2]],
  'v-at': ([a, t]) => [[0, a, a * t]],
  't-va': ([a, v]) => [[0, a, v]],
  's-beschl': ([a, t]) => [[0, a, a * t]],
  't-beschl': ([a, s]) => [[0, a, Math.sqrt(2 * a * s)]],
  'a-beschl': ([t, s]) => [[0, 2 * s / (t * t), 2 * s / t]],
  // Beim Einholen hat das anfahrende Fahrzeug die doppelte Geschwindigkeit: a·t = 2·v₁.
  'einholen': ([v1, a]) => [[0, null, v1], [1, a, 2 * v1]],
  'brems-a': ([v0, t]) => [[0, v0 / t, v0, true]],
  'bremsweg': ([v0, a]) => [[0, a, v0, true]],
  'fall-t': () => [],
  'fall-v': () => []
};
function pruefeRealistisch(id, item, m) {
  const fz = (item.frage.match(/E-Bike|Auto|Güterzug|Personenzug|Zug|Läufer|Radfahrer/g) || []).map((x) => (/zug$/i.test(x) ? 'Zug' : x));
  REAL[id](zahlenIn(item.frage)).forEach(([wo, a, v, brems]) => {
    const name = fz[wo];
    const g = GRENZE[name];
    ok(g, m + 'Fahrzeug erkannt in "' + item.frage + '"');
    if (a != null) ok(a > 0 && a <= (brems ? g.brems : g.a) + 1e-9, m + name + ': a = ' + a + ' unrealistisch in "' + item.frage + '"');
    if (v != null) ok(v > 0 && v <= g.v + 1e-9, m + name + ': v = ' + v + ' unrealistisch in "' + item.frage + '"');
  });
}

function pruefeItem(id, item, wo) {
  const m = id + ' ' + wo + ': ';
  eq(item.typ, 'rechnung', m + 'typ');
  eq(item.id, 't:' + id, m + 'id');
  eq(item.formel, id, m + 'formel');
  ok(typeof item.frage === 'string' && item.frage.length > 10, m + 'frage');
  ok(typeof item.einheit === 'string' && item.einheit.length > 0, m + 'einheit');
  ok(typeof item.loesung === 'string' && item.loesung.indexOf('<p>') === 0, m + 'loesung');
  ok(typeof item.antwort === 'number' && isFinite(item.antwort), m + 'antwort endlich');
  if (NEGATIV.indexOf(id) >= 0) ok(item.antwort < 0, m + 'antwort negativ'); else ok(item.antwort > 0, m + 'antwort > 0');
  eq(A.score(item, P.fmt(item.antwort)), 1, m + 'score der formatierten Antwort');
  ok(A.optErklOk(item), m + 'optErklOk');

  const arten = item.schritte.map((s) => s.art);
  eq(arten[0], 'gg', m + 'erster Schritt');
  eq(arten[1], 'formel', m + 'zweiter Schritt');
  eq(arten[arten.length - 1], 'einsetzen', m + 'letzter Schritt');
  ok(arten.length === 3 || (arten.length === 4 && arten[2] === 'umstellen'), m + 'Schrittfolge ' + arten.join(','));
  item.schritte.forEach((s) => {
    ok(s.optionen.length >= 2 && s.optionen.length <= 4, m + s.art + ' Anzahl');
    eq(s.optErkl.length, s.optionen.length, m + s.art + ' optErkl');
    ok(s.optionen.every((o, i) => typeof o === 'string' && o && s.optionen.indexOf(o) === i), m + s.art + ' Optionen verschieden: ' + JSON.stringify(s.optionen));
    ok(s.optErkl.every((e) => typeof e === 'string' && e.length > 5), m + s.art + ' Erklärsätze');
    ok(Number.isInteger(s.richtig) && s.richtig >= 0 && s.richtig < s.optionen.length, m + s.art + ' richtig');
  });

  const fw = item.fehlerwerte;
  ok(Array.isArray(fw) && fw.length >= 2 && fw.length <= 3, m + 'fehlerwerte 2–3');
  const ein = item.schritte[item.schritte.length - 1];
  eq(ein.optionen.length, fw.length + 1, m + 'einsetzen = richtig + Fehler');
  const texte = [P.fmt(item.antwort)].concat(fw.map((x) => P.fmt(x.wert)));
  ok(texte.every((t, i) => t !== '' && texte.indexOf(t) === i), m + 'formatierte Werte verschieden: ' + texte.join(' | '));
  fw.forEach((x) => {
    ok(isFinite(x.wert), m + 'Fehlerwert endlich');
    ok(typeof x.fehler === 'string' && x.fehler, m + 'Fehlertyp');
    ok(!P.passt(P.fmt(x.wert), item.antwort, null, item.tolRel), m + 'Fehlerwert ' + x.fehler + ' passt nicht zur Antwort');
    // Ausnahme brems-a: Der Betrag steht bewusst in auch (Bremsverzögerung wie im Unterricht).
    if (!(item.auch || []).some((w) => P.passt(P.fmt(x.wert), w))) eq(A.score(item, P.fmt(x.wert)), 0, m + 'Fehlerwert ' + x.fehler + ' zählt nicht als richtig');
  });

  pruefeRechenweg(item.loesung, m);
  pruefeRealistisch(id, item, m);

  const z = zahlenIn(item.frage);
  const soll = NACH[id](z);
  ok(Math.abs(soll - item.antwort) <= Math.abs(soll) * 1e-9, m + 'Nachrechnung aus "' + item.frage + '": ' + soll + ' statt ' + item.antwort);
}

test('IDS: alle 16 Trainer, jeder mit Titel', () => {
  eq(T.IDS, IDS);
  IDS.forEach((id) => ok(typeof T.titel(id) === 'string' && T.titel(id).length > 0, id));
});

IDS.forEach((id) => {
  test(id + ': Seeds 1..' + SEEDS + ' ergeben gültige Aufgaben', () => {
    for (let seed = 1; seed <= SEEDS; seed++) pruefeItem(id, T.erzeuge(id, P.rnd(seed)), 'Seed ' + seed);
  });
  test(id + ': gleicher Seed ergibt gleiche Aufgabe', () => {
    eq(JSON.stringify(T.erzeuge(id, P.rnd(42))), JSON.stringify(T.erzeuge(id, P.rnd(42))));
  });
  test(id + ': Grenzfälle des Zufalls (immer 0, immer fast 1) mit Rückfallzahlen', () => {
    pruefeItem(id, T.erzeuge(id, () => 0), 'rnd 0');
    pruefeItem(id, T.erzeuge(id, () => 0.9999), 'rnd 0,9999');
  });
});

test('Seeds erzeugen Abwechslung', () => {
  IDS.forEach((id) => {
    const fragen = new Set();
    for (let seed = 1; seed <= 200; seed++) fragen.add(T.erzeuge(id, P.rnd(seed)).frage);
    ok(fragen.size >= 8, id + ': nur ' + fragen.size + ' verschiedene Fragen');
  });
});

test('t-beschl: Fehlertypen wie im Plan (Wurzel, 2, gleichförmig)', () => {
  const it = T.erzeuge('t-beschl', P.rnd(7));
  const [a, s] = zahlenIn(it.frage);
  const fw = {};
  it.fehlerwerte.forEach((x) => { fw[x.fehler] = x.wert; });
  near(fw.wurzelVergessen, 2 * s / a, 1e-9);
  near(fw.zweiVergessen, Math.sqrt(s / a), 1e-9);
  near(fw.gleichfoermig, s / a, 1e-9);
});

test('Erklärungen der falschen Einsetz-Optionen nennen den Fehler aus W.physik.FEHLER', () => {
  const it = T.erzeuge('s-beschl', P.rnd(3));
  const ein = it.schritte[it.schritte.length - 1];
  ok(ein.optErkl.some((e) => e.indexOf(P.FEHLER.halbVergessen.erkl) === 0), 'halbVergessen');
  ok(ein.optErkl.some((e) => e.indexOf(P.FEHLER.quadratVergessen.erkl) === 0), 'quadratVergessen');
});

test('Rückfallzahlen jeder id bestehen die eigene Prüfung', () => {
  IDS.forEach((id) => ok(T.rueckfallOk(id), id));
});

test('Rechenweg-Prüfung erkennt falsche Zwischenwerte', () => {
  let fehler = false;
  try { pruefeRechenweg('<p>s = 0,25 m/s² / 2 · (10 s)² = 0,13 m/s² · 100 s² = 12,5 m</p>', ''); } catch (e) { fehler = true; }
  ok(fehler);
  pruefeRechenweg('<p>s = 0,25 m/s² / 2 · (10 s)² = 0,125 m/s² · 100 s² = 12,5 m</p>', '');
});

test('brems-a: Betrag zählt als Bremsverzögerung, Lösung erklärt beides', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const it = T.erzeuge('brems-a', P.rnd(seed));
    eq(A.score(it, P.fmt(-it.antwort)), 1, 'Betrag');
    eq(A.score(it, P.fmt(it.antwort)), 1, 'negativ');
    ok(it.loesung.indexOf('der Betrag ' + P.fmt(-it.antwort) + ' m/s² ist die Bremsverzögerung') >= 0, it.loesung);
    ok(it.loesung.indexOf('(a = ' + P.fmt(it.antwort) + ' m/s²)') >= 0, it.loesung);
  }
});

test('fall-t: Erklärsätze sprechen von g, nicht von a', () => {
  const it = T.erzeuge('fall-t', P.rnd(11));
  it.schritte.slice(2).forEach((s) => s.optErkl.forEach((e) => ok(e.indexOf('2s/a') < 0, e)));
});

test('bremsweg: t statt t² behauptet keine Einheit Meter', () => {
  const it = T.erzeuge('bremsweg', P.rnd(4));
  const ein = it.schritte[it.schritte.length - 1];
  const e = ein.optErkl.find((x) => x.indexOf('Zeit im Quadrat') >= 0);
  ok(e && !/\d m\./.test(e), e);
});

test('unbekannte id wirft einen Fehler', () => {
  let geworfen = false;
  try { T.erzeuge('gibtsnicht', P.rnd(1)); } catch (e) { geworfen = true; }
  ok(geworfen);
});

fertig('trainer');
