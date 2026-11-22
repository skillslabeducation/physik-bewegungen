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
    eq(A.score(item, P.fmt(x.wert)), 0, m + 'Fehlerwert ' + x.fehler + ' zählt nicht als richtig');
  });

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

test('unbekannte id wirft einen Fehler', () => {
  let geworfen = false;
  try { T.erzeuge('gibtsnicht', P.rnd(1)); } catch (e) { geworfen = true; }
  ok(geworfen);
});

fertig('trainer');
