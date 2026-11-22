/* Spiellogik und Fortschritt: Akten-Status, Rang, Note, Nachermittlung, Prüfung, Speicher. */
const laden = require('./laden');
const { test, ok, eq, fertig } = require('./mini');
const DATEIEN = ['js/util.js', 'js/text.js', 'js/logic.js', 'js/state.js'];

function neu() { const W = laden(DATEIEN); return { W, ctx: laden.kontext }; }

const AKTE = {
  id: 'a', nr: 3,
  ueben: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (n > 10 ? { id: 'a-u' + n, plus: true } : { id: 'a-u' + n })),
  gutachten: [{ id: 'a-g1' }]
};

test('akteStatus: geschlossen, offen, neu, folgt', () => {
  const { W } = neu();
  const S = W.state, L = W.logic;
  S.load();
  eq(L.akteStatus(AKTE, S.data).status, 'neu');
  eq(L.akteStatus({ id: 'z', nr: 9, folgt: true }, S.data).status, 'folgt');
  [1, 2, 3, 4, 5, 6, 7].forEach((n) => S.itemErgebnis('a-u' + n, true));
  S.abschlussSetzen('a');
  const st = L.akteStatus(AKTE, S.data);
  eq(st.status, 'offen');
  ok(st.fehlt.indexOf('Noch 1 Übung richtig lösen') >= 0, st.fehlt.join('; '));
  S.itemErgebnis('a-u8', true);
  const g = L.akteStatus(AKTE, S.data);
  eq(g.status, 'geschlossen');
  eq(g.quote, 0.8, 'Plus-Item zählt nicht');
  eq(g.gutachten, true);
  eq(g.fehlt, []);
});

test('akteStatus: ohne Gutachten bleibt die Akte offen und nennt es', () => {
  const { W } = neu();
  W.state.load();
  [1, 2, 3, 4, 5, 6, 7, 8].forEach((n) => W.state.itemErgebnis('a-u' + n, true));
  const st = W.logic.akteStatus(AKTE, W.state.data);
  eq(st.status, 'offen');
  eq(st.gutachten, false);
  ok(st.fehlt.indexOf('Gutachten') >= 0, st.fehlt.join('; '));
});

test('akteStatus: Karte gesehen reicht für offen', () => {
  const { W } = neu();
  W.state.load();
  W.state.karteGesehen('a', 0);
  eq(W.logic.akteStatus(AKTE, W.state.data).status, 'offen');
});

test('rang: Praktikant, Junior-Gutachter, Gutachter, Sachverständiger', () => {
  const { W } = neu();
  const L = W.logic, S = W.state;
  S.load();
  const akten = [];
  for (let i = 0; i < 8; i++) akten.push({ id: 'x' + i, nr: i, ueben: [], gutachten: [] });
  eq(L.rang(S.data, akten).titel, 'Praktikant');
  S.abschlussSetzen('x0');
  eq(L.rang(S.data, akten).titel, 'Praktikant');
  S.abschlussSetzen('x1');
  eq(L.rang(S.data, akten).titel, 'Junior-Gutachter');
  S.abschlussSetzen('x2'); S.abschlussSetzen('x3');
  eq(L.rang(S.data, akten).titel, 'Junior-Gutachter');
  S.abschlussSetzen('x4');
  const r = L.rang(S.data, akten);
  eq(r.titel, 'Gutachter');
  eq(r.geschlossen, 5);
  S.pruefungBeenden([{ teil: 1, punkte: 31, max: 40 }]);
  eq(L.rang(S.data, akten).titel, 'Gutachter', '31/40 < 80 %');
  S.pruefungBeenden([{ teil: 1, punkte: 32, max: 40 }]);
  eq(L.rang(S.data, akten).titel, 'Sachverständiger');
});

test('note und punkteRunden', () => {
  const { W } = neu();
  const L = W.logic;
  eq(L.note(100), 1); eq(L.note(87.5), 1); eq(L.note(87.4), 2); eq(L.note(72.5), 2);
  eq(L.note(57.5), 3); eq(L.note(45), 4); eq(L.note(20), 5); eq(L.note(19.9), 6);
  eq(L.punkteRunden(0.66, 3), 1.5);
  eq(L.punkteRunden(1, 3), 3);
  eq(L.punkteRunden(0.49, 1), 0);
});

test('Nachermittlung: zweimal hintereinander richtig behebt', () => {
  const { W } = neu();
  const S = W.state;
  S.load();
  S.itemErgebnis('a', false);
  eq(S.wvListe(), ['a']);
  eq(S.itemErgebnis('a', true).behoben, false);
  S.itemErgebnis('a', false);
  S.itemErgebnis('a', true);
  eq(S.itemErgebnis('a', true).behoben, true);
  eq(S.wvListe(), []);
  ok(S.data.items.a.ok, 'einmal richtig bleibt richtig');
});

test('Nachermittlung: Erklärung unter 60 % rein, ab 80 % raus', () => {
  const { W } = neu();
  const S = W.state;
  S.load();
  S.erklSpeichern('e1', { text: '', haken: [], prozent: 0.5 });
  eq(S.wvListe(), ['e:e1']);
  S.erklSpeichern('e1', { text: '', haken: [0], prozent: 0.7 });
  eq(S.wvListe(), ['e:e1']);
  S.erklSpeichern('e1', { text: '', haken: [0, 1], prozent: 0.9 });
  eq(S.wvListe(), []);
  eq(S.data.erkl.e1.best, 0.9);
});

test('Speicher: kaputtes JSON und werfendes localStorage', () => {
  const a = neu();
  a.ctx.localStorage.setItem('bremsspur-v1', '{kaputt');
  a.W.state.load();
  eq(a.W.state.data.v, 1);
  eq(a.W.state.data.name, '');
  const b = neu();
  b.ctx.localStorage.getItem = () => { throw new Error('gesperrt'); };
  b.ctx.localStorage.setItem = () => { throw new Error('gesperrt'); };
  b.W.state.load();
  b.W.state.setName('Test');
  eq(b.W.state.data.name, 'Test');
});

test('Prüfung: laufende Prüfung übersteht Neuladen', () => {
  const a = neu();
  a.W.state.load();
  a.W.state.pruefungStarten(1, 12345, 45);
  a.W.state.pruefungAntwort('1a', 'Lebewesen');
  const gespeichert = a.ctx.localStorage.getItem('bremsspur-v1');
  const b = neu();
  b.ctx.localStorage.setItem('bremsspur-v1', gespeichert);
  b.W.state.load();
  const l = b.W.state.pruefungLaufend();
  eq(l.teil, 1); eq(l.seed, 12345); eq(l.dauerMin, 45);
  eq(l.antworten['1a'], 'Lebewesen');
  b.W.state.pruefungBeenden([{ teil: 1, punkte: 25, max: 50 }]);
  eq(b.W.state.pruefungLaufend(), null);
  eq(b.W.state.data.pruefung.best['1'], 0.5);
});

test('Fortschritt übertragen: Export und Import', () => {
  const a = neu();
  a.W.state.load();
  a.W.state.setName('Kim');
  a.W.state.itemErgebnis('f-u1', true);
  const code = a.W.state.exportCode();
  ok(code.indexOf('BREMSSPUR:') === 0);
  const b = neu();
  b.W.state.load();
  eq(b.W.state.importCode('Unsinn'), false);
  eq(b.W.state.importCode(code), true);
  eq(b.W.state.data.name, 'Kim');
  ok(b.W.state.data.items['f-u1'].ok);
});

test('Speicher: gültiges JSON mit falscher Struktur wird repariert', () => {
  const a = neu();
  a.ctx.localStorage.setItem('bremsspur-v1', JSON.stringify({ v: 1, wv: null, items: 5, erkl: 'x', pruefung: null, radar: [] }));
  a.W.state.load();
  eq(typeof a.W.state.data.wv, 'object'); ok(a.W.state.data.wv !== null);
  eq(a.W.state.wvListe(), []);
  a.W.state.itemErgebnis('x', false);
  eq(a.W.state.wvListe(), ['x']);
  ok(a.W.state.data.pruefung.best && typeof a.W.state.data.pruefung.best === 'object');
});

test('Erklärung: Entwurf wird gespeichert, ohne die Bewertung zu ändern', () => {
  const a = neu();
  a.W.state.load();
  a.W.state.erklEntwurf('e9', 'halber Satz');
  eq(a.W.state.erklText('e9'), 'halber Satz');
  eq(a.W.state.data.erkl.e9 && a.W.state.data.erkl.e9.best || 0, 0);
  eq(a.W.state.wvListe(), []);
  a.W.state.erklSpeichern('e9', { text: 'fertig', haken: [0], prozent: 0.7 });
  a.W.state.erklEntwurf('e9', 'neuer Versuch');
  eq(a.W.state.data.erkl.e9.best, 0.7);
  eq(a.W.state.erklText('e9'), 'neuer Versuch');
});

test('Speicher: kaputter Stand ergibt frischen Stand, fehlende formeln werden ergänzt', () => {
  const a = neu();
  a.ctx.localStorage.setItem('bremsspur-v1', '{');
  a.W.state.load();
  eq(a.W.state.data.v, 1);
  eq(a.W.state.data.formeln, {});
  eq(a.W.state.data.radar, { best: 0 });
  const b = neu();
  b.ctx.localStorage.setItem('bremsspur-v1', JSON.stringify({ v: 1, name: 'Kim', items: {} }));
  b.W.state.load();
  eq(b.W.state.data.name, 'Kim');
  eq(b.W.state.data.formeln, {});
});

test('formelRichtig zählt je Schlüssel hoch', () => {
  const { W } = neu();
  W.state.load();
  W.state.formelRichtig('v=s/t');
  eq(W.state.data.formeln['v=s/t'], 1);
  W.state.formelRichtig('v=s/t');
  eq(W.state.data.formeln['v=s/t'], 2);
  eq(W.state.data.formeln['a=v/t'], undefined);
});

fertig('logic');
