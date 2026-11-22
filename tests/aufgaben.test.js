/* Aufgaben-Engine (reiner Teil): Jede Musterlösung ist richtig, falsche Antworten nicht, Teilpunkte stimmen. */
const laden = require('./laden');
const { test, ok, eq, fertig } = require('./mini');
const W = laden(['js/util.js', 'js/text.js', 'js/logic.js', 'js/state.js', 'js/aufgaben.js']);
const A = W.aufgaben;

const BEISPIELE = {
  wahl: { id: 'w', typ: 'wahl', frage: 'q', optionen: ['a', 'b', 'c'], richtig: 1 },
  mehrfach: { id: 'm', typ: 'mehrfach', frage: 'q', optionen: ['a', 'b', 'c'], richtig: [0, 2] },
  luecke: { id: 'l', typ: 'luecke', text: 'Das {Zwerchfell|Herz} zieht sich {zusammen|auseinander}.' },
  eingabe: { id: 'e', typ: 'eingabe', frage: 'q', akzeptiert: ['Alveolen', 'Lungenbläschen'] },
  liste: { id: 'li', typ: 'liste', frage: 'q', anzahl: 2, gruppen: [['Kohlenhydrate'], ['Fette'], ['Eiweiße', 'Proteine']] },
  zuordnen: { id: 'z', typ: 'zuordnen', frage: 'q', paare: [['Amylase', 'Stärke'], ['Lipase', 'Fette'], ['Lactase', 'Milchzucker']] },
  reihenfolge: { id: 'r', typ: 'reihenfolge', frage: 'q', schritte: ['Nase', 'Rachen', 'Kehlkopf', 'Luftröhre'] },
  tabelle: { id: 't', typ: 'tabelle', frage: 'q', spalten: ['Merkmal', 'Arterien', 'Venen'], zeilen: [
    { kopf: 'Richtung', zellen: [{ optionen: ['vom Herzen weg', 'zum Herzen hin'], richtig: 0 }, { optionen: ['vom Herzen weg', 'zum Herzen hin'], richtig: 1 }] },
    { kopf: 'Wand', zellen: [{ fix: 'dick' }, { optionen: ['dick', 'dünn'], richtig: 1 }] }] },
  matrix: { id: 'x', typ: 'matrix', frage: 'q', zeilenKopf: 'Spender', spaltenKopf: 'Empfänger', zeilen: ['0', 'A'], spalten: ['0', 'A'], richtig: [[true, true], [false, true]] },
  zahl: { id: 'n', typ: 'zahl', frage: 'q', antwort: 192, tol: 0.5, einheit: 'kcal', auch: [197.4] },
  behauptung: { id: 'bh', typ: 'behauptung', aussage: 'Arterien führen immer sauerstoffreiches Blut.', stimmt: false, gruende: ['g0', 'g1'], richtig: 1 }
};

const FALSCH = {
  wahl: 0, mehrfach: [0], luecke: ['Herz', 'zusammen'], eingabe: 'Bronchien', liste: ['Fette', 'Fett'],
  zuordnen: [1, 0, 2], reihenfolge: [1, 0, 2, 3],
  tabelle: [[0, 0], [null, 1]], matrix: [[true, true], [true, true]],
  zahl: '180', behauptung: { stimmt: true, grund: 1 }
};

Object.keys(BEISPIELE).forEach((typ) => {
  test(typ + ': Musterlösung ist richtig', () => {
    const it = BEISPIELE[typ];
    ok(A.richtig(it, A.loesung(it)), JSON.stringify(A.loesung(it)));
    eq(A.score(it, A.loesung(it)), 1);
    ok(typeof A.loesungText(it) === 'string' && A.loesungText(it).length > 0);
  });
  test(typ + ': falsche Antwort ist nicht richtig', () => {
    ok(A.score(BEISPIELE[typ], FALSCH[typ]) < 1);
    ok(!A.richtig(BEISPIELE[typ], FALSCH[typ]));
  });
  test(typ + ': leere Antwort ergibt 0 Punkte ohne Fehler', () => {
    eq(A.score(BEISPIELE[typ], undefined), 0);
  });
});

test('tabelle: Teilpunkte nur über die offenen Zellen', () => {
  eq(A.score(BEISPIELE.tabelle, [[0, 0], [null, 1]]), 2 / 3);
});

test('zahl: Toleranz und alternative Werte', () => {
  ok(A.richtig(BEISPIELE.zahl, '192 kcal'));
  ok(A.richtig(BEISPIELE.zahl, '197,4'));
  ok(!A.richtig(BEISPIELE.zahl, '193'));
});

test('behauptung: nur Urteil richtig gibt halbe Punktzahl', () => {
  eq(A.score(BEISPIELE.behauptung, { stimmt: false, grund: 0 }), 0.5);
});

test('liste: Synonyme und doppelte Nennung', () => {
  ok(A.richtig(BEISPIELE.liste, ['Proteine', 'Kohlenhydrate']));
  eq(A.score(BEISPIELE.liste, ['Fette', 'Fett']), 0.5);
});

test('leer: keine Antwort wird erkannt, eine Teilantwort nicht', () => {
  ok(A.leer(BEISPIELE.wahl, null));
  ok(A.leer(BEISPIELE.mehrfach, []));
  ok(A.leer(BEISPIELE.eingabe, '   '));
  ok(A.leer(BEISPIELE.luecke, [null, null]));
  ok(!A.leer(BEISPIELE.luecke, [null, 'zusammen']));
  ok(A.leer(BEISPIELE.matrix, [[false, false], [false, false]]));
  ok(A.leer(BEISPIELE.behauptung, { stimmt: null, grund: null }));
  ok(A.leer(BEISPIELE.reihenfolge, []));
  ok(!A.leer(BEISPIELE.wahl, 0));
  ok(!A.leer(BEISPIELE.zahl, '12'));
  ok(!A.leer(BEISPIELE.tabelle, [[0, null], [null, null]]));
});

test('luecke: Lösungstext setzt die richtigen Wörter ein', () => {
  eq(A.loesungText(BEISPIELE.luecke), 'Das Zwerchfell zieht sich zusammen.');
});

test('leer: Behauptung ohne Urteil ist leer, mit Urteil nicht; feste Reihenfolge ohne Auswahl ist leer', () => {
  ok(A.leer(BEISPIELE.behauptung, { stimmt: null, grund: 1 }));
  ok(!A.leer(BEISPIELE.behauptung, { stimmt: false, grund: null }));
  const fest = Object.assign({}, BEISPIELE.reihenfolge, { startFest: true });
  ok(A.leer(fest, [0]));
  ok(!A.leer(fest, [0, 2]));
});

test('eingabe: Sperrliste des Items wird beachtet', () => {
  const it = { id: 'e2', typ: 'eingabe', frage: 'q', akzeptiert: ['Bronchiolen'], nicht: ['Bronchien'] };
  ok(!A.richtig(it, 'Bronchien'));
  ok(A.richtig(it, 'Bronchiolen'));
});

fertig('aufgaben');
