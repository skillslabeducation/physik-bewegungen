/* Eingaben normalisieren und vergleichen, Fachbegriff-Radar. */
const laden = require('./laden');
const { test, ok, eq, fertig } = require('./mini');
const W = laden(['js/util.js', 'js/text.js']);
const T = W.text;

test('norm: klein, Umlaute, ß, tiefgestellte Ziffern, Satzzeichen', () => {
  eq(T.norm('  Lungenbläschen! '), 'lungenblaeschen');
  eq(T.norm('Straße'), 'strasse');
  eq(T.norm('CO₂'), 'co2');
  eq(T.norm('Rechter   Vorhof.'), 'rechter vorhof');
});

test('passt: Singular und Plural', () => {
  ok(T.passt('Alveole', ['Alveolen']));
  ok(T.passt('Bronchie', ['Bronchien']));
  ok(T.passt('Kapillaren', ['Kapillare']));
});

test('passt: Umlaut-Ersatz', () => {
  ok(T.passt('lungenblaeschen', ['Lungenbläschen']));
  ok(T.passt('Lungenblaschen', ['Lungenbläschen']));
});

test('passt: Synonyme aus der Liste', () => {
  ok(T.passt('Kohlendioxid', ['Kohlenstoffdioxid', 'Kohlendioxid', 'CO2']));
  ok(T.passt('co₂', ['CO2']));
  ok(T.passt('Glukose', ['Glucose', 'Traubenzucker', 'Glukose']));
});

test('passt: ein Tippfehler bei mittellangen Wörtern', () => {
  ok(T.passt('Mitochondrin', ['Mitochondrien']));
  ok(T.passt('Zwerchfel', ['Zwerchfell']));
  ok(T.passt('Hohlvenne', ['Hohlvene']));
});

test('passt: falsche Begriffe werden nicht akzeptiert', () => {
  ok(!T.passt('Arterie', ['Aorta']));
  ok(!T.passt('Vene', ['Venenklappe']));
  ok(!T.passt('', ['Aorta']));
  ok(!T.passt('Lipase', ['Lactase']));
  ok(!T.passt('Amylase', ['Lipase']));
});

test('passt: Enzym und Substrat (-ase/-ose) sind kein Tippfehler', () => {
  ok(!T.passt('Lactose', ['Lactase']));
  ok(!T.passt('Lactase', ['Lactose', 'Milchzucker']));
  ok(!T.passt('Maltase', ['Maltose']));
  ok(T.passt('Laktase', ['Lactase']));
  ok(T.passt('Laktose', ['Lactose']));
});

test('liste: jede Gruppe zählt nur einmal', () => {
  const g = [['Wachstum', 'wachsen'], ['Bewegung', 'bewegen'], ['Stoffwechsel']];
  eq(T.liste(['wachstum', 'bewegung', 'Wachstum'], g, 3).treffer, 2);
  eq(T.liste(['Stoffwechsel', 'wächst', 'Bewegung'], g, 3).treffer, 2);
  eq(T.liste(['Stoffwechsel', 'wachsen', 'Bewegung'], g, 3).treffer, 3);
  eq(T.liste(['', '', ''], g, 3).treffer, 0);
});

test('radar: findet Wortstämme auch in zusammengesetzten Wörtern', () => {
  const b = [{ name: 'Diffusion', muster: ['diffus'] }, { name: 'Konzentration', muster: ['konzentration'] }, { name: 'Kapillare', muster: ['kapillar'] }];
  const r = T.radar('Durch Diffusion wandert O2 vom Ort hoher Sauerstoffkonzentration ins Blut.', b);
  eq(r.map((x) => x.gefunden), [true, true, false]);
  eq(r[0].name, 'Diffusion');
});

test('radar: Muster aus mehreren Wörtern müssen nicht zusammenhängen', () => {
  const b = [{ name: 'zieht sich zusammen', muster: ['zieht sich zusammen'] }];
  eq(T.radar('Beim Einatmen zieht sich das Zwerchfell zusammen.', b)[0].gefunden, true);
  eq(T.radar('Das Zwerchfell zieht nach unten.', b)[0].gefunden, false);
});

test('parseZahl: Komma und Punkt, Einheit wird ignoriert', () => {
  eq(T.parseZahl('192'), 192);
  eq(T.parseZahl('197,4 kcal'), 197.4);
  eq(T.parseZahl('25.5'), 25.5);
  ok(isNaN(T.parseZahl('')));
  ok(isNaN(T.parseZahl('abc')));
});

test('parseZahl: nimmt die letzte Zahl (ca., Rechenweg)', () => {
  eq(T.parseZahl('ca. 192'), 192);
  eq(T.parseZahl('ca.197,4 kcal'), 197.4);
  eq(T.parseZahl('25*4+8*9+5*4=192'), 192);
  eq(T.parseZahl('= 310 kcal'), 310);
  eq(T.parseZahl('-3'), -3);
});

test('passt: Sperrliste geht vor der Tippfehler-Toleranz', () => {
  ok(!T.passt('Bronchien', ['Bronchiolen', 'Bronchiole'], ['Bronchien', 'Bronchie']));
  ok(!T.passt('Bronchie', ['Bronchiolen', 'Bronchiole'], ['Bronchien', 'Bronchie']));
  ok(T.passt('Bronchiolen', ['Bronchiolen', 'Bronchiole'], ['Bronchien', 'Bronchie']));
  ok(T.passt('Bronchiolem', ['Bronchiolen'], ['Bronchien']));
});

test('passt: C02 und H20 mit Null statt O', () => {
  ok(T.passt('C02', ['CO2']));
  ok(T.passt('H20', ['H2O', 'Wasser']));
});

test('radar: kurze Muster nur am Wortanfang (o2 nicht in co2)', () => {
  const b = [{ name: 'Sauerstoff', muster: ['sauerstoff', 'o2'] }];
  eq(T.radar('Das CO2 wird ausgeatmet.', b)[0].gefunden, false);
  eq(T.radar('O2 geht ins Blut.', b)[0].gefunden, true);
});

fertig('text');
