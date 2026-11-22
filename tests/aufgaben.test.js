/* Aufgaben-Engine (reiner Teil): Jede Musterlösung ist richtig, falsche Antworten nicht, Teilpunkte stimmen. */
const laden = require('./laden');
const { test, ok, eq, fertig } = require('./mini');
const W = laden(['js/util.js', 'js/text.js', 'js/physik.js', 'js/logic.js', 'js/state.js', 'js/diagramm.js', 'js/aufgaben.js']);
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
  zahl: { id: 'n', typ: 'zahl', frage: 'q', antwort: 192, tol: 0.5, einheit: 'kcal', auch: [197.4] },
  behauptung: { id: 'bh', typ: 'behauptung', aussage: 'Arterien führen immer sauerstoffreiches Blut.', stimmt: false, gruende: ['g0', 'g1'], richtig: 1 },
  rechnung: { id: 'rc', typ: 'rechnung', frage: 'Wie lange dauert die Fahrt?', antwort: 63.2456, auch: [63.25], einheit: 's', formel: 's-beschl',
    loesung: '<p>t = √(2s/a) ≈ 63,25 s</p>',
    schritte: [{ art: 'formel', optionen: ['s = a/2·t²', 's = v·t'], richtig: 0, optErkl: ['Richtig, hier wird beschleunigt.', 'Das ist die Formel für konstante Geschwindigkeit.'] }] },
  punkte: { id: 'pk', typ: 'punkte', frage: 'Trage die Punkte ein.', achsen: { x: { g: 't', e: 's', max: 60, schritt: 10 }, y: { g: 's', e: 'm', max: 1250, schritt: 250 } },
    xs: [0, 20, 40, 60], soll: [0, 375, 750, 1125], kurve: [[0, 0], [60, 1125]] },
  zahltabelle: { id: 'zt', typ: 'tabelle', frage: 'q', spalten: ['', 'v̄ in m/s', 'ā in m/s²'], zeilen: [
    { kopf: 'Intervall 1', zellen: [{ zahl: 0.98 }, { zahl: 2.945, auch: [2.95] }] }] },
  terme: { id: 'tm', typ: 'terme', frage: 'Gib die Funktionsterme an.', tolRel: 0.01, terme: [
    ['a(t) = ', { zahl: -4.5 }, ' m/s²'],
    ['v(t) = ', { zahl: 9 }, ' m/s − ', { zahl: 4.5 }, ' m/s² · t'],
    ['s(t) = ', { zahl: 9 }, ' m/s · t − ', { zahl: 2.25 }, ' m/s² · t²']] }
};

const FALSCH = {
  wahl: 0, mehrfach: [0], luecke: ['Herz', 'zusammen'], eingabe: 'Bronchien', liste: ['Fette', 'Fett'],
  zuordnen: [1, 0, 2], reihenfolge: [1, 0, 2, 3],
  tabelle: [[0, 0], [null, 1]],
  zahl: '180', behauptung: { stimmt: true, grund: 1 },
  rechnung: '62', punkte: [0, 375, 750, null], zahltabelle: [['0,98', '3']],
  terme: [['-4,5'], ['9', '4,5'], ['9', '4,5']]
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

/* ---------- Physik-Typen ---------- */

test('rechnung: Ergebnis mit relativer Toleranz, Einheit im Lösungstext', () => {
  const it = BEISPIELE.rechnung;
  eq(A.score(it, '63,25'), 1);
  eq(A.score(it, '63.2'), 1);
  eq(A.score(it, '62'), 0);
  // 63 liegt nur 0,4 % daneben: mit dem Standard tolRel 0.01 (Datenformate, ENTWURF ±1 %) richtig, mit strengerer Toleranz nicht.
  eq(A.score(it, '63'), 1);
  eq(A.score(Object.assign({}, it, { tolRel: 0.001 }), '63'), 0);
  eq(A.score(it, ''), 0);
  ok(A.leer(it, ''));
  ok(!A.leer(it, '63'));
  ok(A.loesungText(it).indexOf('63,25 s') >= 0, A.loesungText(it));
});

test('punkte: Anteil der Zeitpunkte innerhalb der Toleranz (Standard y.schritt/4: nur der nächste Rasterpunkt)', () => {
  const it = BEISPIELE.punkte;
  eq(A.score(it, [0, 375, 750, 1125]), 1);
  eq(A.score(it, [0, 375, 750, null]), 0.75);
  eq(A.score(it, [0, 500, 750, 1125]), 0.75);   // Nachbar-Rasterpunkt (125 daneben) zählt nicht mehr
  const schief = { id: 'pk2', typ: 'punkte', frage: 'q', achsen: { x: { g: 't', e: 's', max: 6, schritt: 1 }, y: { g: 's', e: 'm', max: 10, schritt: 1 } }, xs: [3], soll: [4.67] };
  eq(A.score(schief, [W.diagramm.einrasten(4.67, 0.5)]), 1);   // nächster Rasterpunkt 4,5
  eq(A.score(schief, [4.5]), 1);
  eq(A.score(schief, [5]), 0);
  eq(A.score(it, [0, 510, 750, 1125]), 0.75);
  ok(A.leer(it, [null, null, null, null]));
  ok(!A.leer(it, [null, 375, null, null]));
  eq(A.score(Object.assign({}, it, { tol: 10 }), [0, 380, 750, 1125]), 1);
  eq(A.score(Object.assign({}, it, { tol: 10 }), [0, 400, 750, 1125]), 0.75);
});

test('diagramm.einrasten: auf das Raster runden', () => {
  eq(W.diagramm.einrasten(137, 50), 150);
  eq(W.diagramm.einrasten(110, 50), 100);
  eq(W.diagramm.einrasten(380, 125), 375);
  eq(W.diagramm.einrasten(0.31, 0.1), 0.3);
});

test('diagramm.kurve: n Abschnitte von bis', () => {
  const k = W.diagramm.kurve((t) => t * t, 0, 4, 4);
  eq(k, [[0, 0], [1, 1], [2, 4], [3, 9], [4, 16]]);
  eq(W.diagramm.kurve((t) => t, 0, 1).length, 41);
});

test('diagramm.markup: Karo, Achsentitel, Farben je Größe', () => {
  const m = W.diagramm.markup({ achsen: BEISPIELE.punkte.achsen, kurven: [{ punkte: [[0, 0], [60, 1125]], farbe: 's' }] }).svg;
  ok(m.indexOf('t in s') >= 0 && m.indexOf('s in m') >= 0, 'Achsentitel');
  ok(m.indexOf('dia-karo') >= 0, 'Karo');
  ok(m.indexOf('dia-kurve--s') >= 0, 'Farbe s');
  ok(m.indexOf('s(t)') >= 0, 'Kurve beschriftet');
  ok(m.indexOf('1250') >= 0, 'Skala');
});

test('diagramm.mini: alle Arten liefern beschriftetes SVG in der richtigen Farbe', () => {
  ['s-gleich', 'v-gleich', 'a-gleich', 's-beschl', 'v-beschl', 'a-beschl', 's-brems', 'v-brems', 'a-brems', 's-ruhe', 'v-ruhe'].forEach((art) => {
    const m = W.diagramm.mini(art);
    ok(/^<svg[^>]*aria-label="[^"]+"/.test(m), art + ': aria-label');
    ok(m.indexOf('dia-kurve--' + art[0]) >= 0, art + ': Farbe');
  });
});

test('tabelle: Zahlzellen mit relativer Toleranz', () => {
  const it = BEISPIELE.zahltabelle;
  eq(A.score(it, [['0,98', '2,95']]), 1);
  eq(A.score(it, [['0,98', '3']]), 0.5);
  eq(A.score(it, [['0.98', '2,945']]), 1);
  ok(A.leer(it, [['', '']]));
  ok(A.loesungText(it).indexOf('0,98') >= 0, A.loesungText(it));
});

test('terme: ein Punktanteil je Term, ein Term zählt nur mit allen Zahlen', () => {
  const it = BEISPIELE.terme;
  eq(A.loesung(it), [['-4.5'], ['9', '4.5'], ['9', '2.25']]);
  eq(A.score(it, [['−4,5'], ['9', '4,5'], ['9', '2,25']]), 1);
  eq(A.score(it, [['-4,5'], ['9', '4,5'], ['9', '4,5']]), 2 / 3);
  eq(A.score(it, [['4,5'], ['9', ''], ['9', '2,25']]), 1 / 3);
  eq(A.score(it, [['-4.5'], ['9 m/s', '4,5'], ['9', '2,25']]), 1);
  eq(A.score(it, 'kaputt'), 0);
  ok(A.leer(it, [[''], ['', ''], ['', '']]));
  ok(!A.leer(it, [[''], ['9', ''], ['', '']]));
  eq(A.loesungText(it), 'a(t) = −4,5 m/s²; v(t) = 9 m/s − 4,5 m/s² · t; s(t) = 9 m/s · t − 2,25 m/s² · t²');
});

test('rechnung: Lösungstext mit drei Nachkommastellen, wenn zwei das Ergebnis verfälschen', () => {
  const it = Object.assign({}, BEISPIELE.rechnung, { antwort: 0.625, auch: [], einheit: 'm/s²' });
  eq(A.loesungText(it), '0,625 m/s²');
  eq(A.loesungText(Object.assign({}, it, { antwort: 63.2456 })), '63,25 m/s²');
  eq(A.loesungText(Object.assign({}, it, { antwort: 1.5 })), '1,5 m/s²');
  eq(A.fmtErgebnis(0.625), '0,625');
  eq(A.fmtErgebnis(2.25), '2,25');
  eq(A.fmtErgebnis(56.568542), '56,57');
});

test('erklaerungen: führendes „Richtig:“ im Erklärsatz der richtigen Option fällt weg, wenn sie nachgereicht wird', () => {
  const w = { typ: 'wahl', optionen: ['a', 'b'], richtig: 1, optErkl: ['Falsch gerechnet.', 'Richtig: So geht es.'] };
  eq(A.erklaerungen(w, 0).map((e) => e.text), ['Falsch gerechnet.', 'So geht es.']);
  eq(A.erklaerungen(w, 1).map((e) => e.text), ['Richtig: So geht es.']);
  const m = { typ: 'mehrfach', optionen: ['a', 'b'], richtig: [0, 1], optErkl: ['Richtig:  A.', 'Richtig, B.'] };
  eq(A.erklaerungen(m, [0]).map((e) => e.text), ['Richtig:  A.', 'Richtig, B.']);
});

test('wahl: Lösungstext einer Diagramm-Option ist die Beschreibung, kein SVG-Rest', () => {
  const it = { id: 'wd', typ: 'wahl', frage: 'q', optionen: [W.diagramm.mini('v-gleich'), W.diagramm.mini('v-beschl')], richtig: 1, optErkl: ['a', 'b'] };
  const t = A.loesungText(it);
  ok(t.indexOf('v-t-Diagramm') === 0, t);
});

test('optErklOk: Inhalts-Regel ein Erklärsatz je Option', () => {
  const w = { typ: 'wahl', optionen: ['a', 'b', 'c'], richtig: 0 };
  ok(A.optErklOk(Object.assign({}, w, { optErkl: ['x', 'y', 'z'] })), 'passend');
  ok(!A.optErklOk(Object.assign({}, w, { optErkl: ['x', 'y'] })), 'zu kurz');
  ok(!A.optErklOk(w), 'fehlt bei wahl');
  ok(!A.optErklOk({ typ: 'mehrfach', optionen: ['a', 'b'], richtig: [0] }), 'fehlt bei mehrfach');
  ok(A.optErklOk(BEISPIELE.zahl), 'Nicht-Auswahltyp ohne optErkl');
  ok(A.optErklOk(BEISPIELE.rechnung), 'rechnung mit passenden Schritten');
  const kaputt = JSON.parse(JSON.stringify(BEISPIELE.rechnung));
  kaputt.schritte[0].optErkl = ['nur einer'];
  ok(!A.optErklOk(kaputt), 'rechnung-Schritt zu kurz');
});

test('erklaerungen: gewählte Option, bei Fehler zusätzlich die richtige', () => {
  const w = { typ: 'wahl', optionen: ['a', 'b', 'c'], richtig: 1, optErkl: ['ea', 'eb', 'ec'] };
  eq(A.erklaerungen(w, 1).map((e) => e.text), ['eb']);
  eq(A.erklaerungen(w, 0).map((e) => e.text), ['ea', 'eb']);
  eq(A.erklaerungen(w, 0).map((e) => e.gewaehlt), [true, false]);
  const m = { typ: 'mehrfach', optionen: ['a', 'b', 'c'], richtig: [0, 2], optErkl: ['ea', 'eb', 'ec'] };
  eq(A.erklaerungen(m, [0, 2]).map((e) => e.text), ['ea', 'ec']);
  eq(A.erklaerungen(m, [0, 1]).map((e) => e.text), ['ea', 'eb', 'ec']);
  eq(A.erklaerungen({ typ: 'wahl', optionen: ['a'], richtig: 0 }, 0), []);
});

test('Engine kennt die Bio-Spezialtypen nicht mehr', () => {
  ['kreuzung', 'matrix', 'beschriften'].forEach((t) => ok(A.TYPEN.indexOf(t) < 0, t));
  ['rechnung', 'punkte'].forEach((t) => ok(A.TYPEN.indexOf(t) >= 0, t));
});

fertig('aufgaben');
