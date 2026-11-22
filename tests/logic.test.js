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

test('Speicher: kaputte Prüfungsdaten werden gefiltert (laeufe, best, laufend ohne Uhr)', () => {
  const a = neu();
  a.ctx.localStorage.setItem('bremsspur-v1', JSON.stringify({ v: 1, pruefung: {
    laeufe: [null, 5, 'x', { teil: 1, punkte: 'viel', max: 40 }, { teil: 1, punkte: 30, max: 40, datum: 'd', teile: [{ nr: 1, b: 'a', punkte: 2, p: 2 }] }],
    best: { '1': 'x', '2': NaN, '3': 7, '4': 0.5 },
    laufend: { teil: 1, seed: 3, antworten: { '2b': { auto: 'abc' }, '1a': null } } } }));
  const vorher = Date.now();
  a.W.state.load();
  const pr = a.W.state.data.pruefung;
  eq(pr.laeufe.length, 1);
  eq(pr.laeufe[0].punkte, 30);
  eq(pr.laeufe[0].teile, [{ nr: 1, b: 'a', punkte: 2, p: 2 }], 'neues Feld teile bleibt erhalten');
  eq(pr.best, { '4': 0.5 });
  const l = a.W.state.pruefungLaufend();
  eq(l.dauerMin, 45, 'Standarddauer');
  ok(typeof l.start === 'number' && l.start >= vorher && l.start <= Date.now(), 'Start = jetzt');
  eq(l.antworten['2b'], { auto: 'abc' }, 'Antworten bleiben, die Ansicht liest sie tolerant');
  eq(a.W.logic.rang(a.W.state.data, []).titel, 'Praktikant');
});

test('Prüfung: letzte Auswertung wird mit Teilen, Seed und Antworten gespeichert', () => {
  const a = neu();
  a.W.state.load();
  a.W.state.pruefungStarten(1, 77, 45);
  a.W.state.pruefungAntwort('1a', { auto: '20' });
  a.W.state.pruefungBeenden([{ teil: 1, punkte: 2, max: 40, teile: [{ nr: 1, b: 'a', punkte: 2, p: 2 }] }]);
  const b = neu();
  b.ctx.localStorage.setItem('bremsspur-v1', a.ctx.localStorage.getItem('bremsspur-v1'));
  b.W.state.load();
  const x = b.W.state.data.pruefung.laeufe[0];
  eq([x.teil, x.punkte, x.max, x.seed], [1, 2, 40, 77]);
  eq(x.teile, [{ nr: 1, b: 'a', punkte: 2, p: 2 }]);
  eq(x.antworten, { '1a': { auto: '20' } });
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

/* ---------- Labor (Bewegungs-Simulator) und Radarfalle ---------- */
const { near } = require('./mini');
const AKTEN_IDS = ['einheiten', 'mittel', 'gleichfoermig', 'beschleunigt', 'diagramme', 'messdaten', 'einholen', 'bremsen', 'fall'];
function alles() { const W = laden(); return { W, ctx: laden.kontext }; }

test('Labor: anfahren mit a = 2 m/s² nach 5 s: s = 25 m, v = 10 m/s', () => {
  const { W } = alles();
  const z = W.labor.zustand('anfahren', { a: 2 }, 5);
  eq(z.length, 1);
  near(z[0].s, 25); near(z[0].v, 10); near(z[0].a, 2);
});

test('Labor: bremsen von 9 m/s mit 4,5 m/s² steht ab 2 s bei s = 9 m, ohne rückwärts zu fahren', () => {
  const { W } = alles();
  const z = W.labor.zustand('bremsen', { v0: 9, a: 4.5 }, 3)[0];
  near(z.v, 0); near(z.s, 9); near(z.a, 0);
  const z1 = W.labor.zustand('bremsen', { v0: 9, a: 4.5 }, 1)[0];
  near(z1.v, 4.5); near(z1.s, 6.75); near(z1.a, -4.5);
  near(W.labor.zustand('bremsen', { v0: 9, a: 4.5 }, 10)[0].s, 9);
});

test('Labor: einholen (Blatt 2 A1): beide Fahrzeuge nach 6 s bei 28 m', () => {
  const { W } = alles();
  const z = W.labor.zustand('einholen', { v1: 28 / 6, a2: 14 / 9 }, 6);
  eq(z.length, 2);
  near(z[0].s, 28, 1e-6); near(z[1].s, 28, 1e-6);
  near(z[0].a, 0); near(z[1].a, 14 / 9);
  const tp = W.labor.treffpunkt({ v1: 28 / 6, a2: 14 / 9 });
  near(tp.t, 6, 1e-9); near(tp.s, 28, 1e-9);
});

test('Labor: gleichförmig und freier Fall', () => {
  const { W } = alles();
  const g = W.labor.zustand('gleichfoermig', { v: 10 }, 3)[0];
  near(g.s, 30); near(g.v, 10); near(g.a, 0);
  const f = W.labor.zustand('fall', { g: 9.81, h: 20 }, 1)[0];
  near(f.s, 4.905); near(f.v, 9.81); near(f.a, 9.81);
  const unten = W.labor.zustand('fall', { g: 9.81, h: 20 }, 5)[0];
  near(unten.s, 20); near(unten.v, 0);
  near(W.labor.dauer('fall', { g: 9.81, h: 20 }), Math.sqrt(40 / 9.81), 1e-9);
});

test('Labor: fünf Voreinstellungen mit Reglern und Grundwerten im Reglerbereich', () => {
  const { W } = alles();
  eq(W.labor.PRESETS, ['gleichfoermig', 'anfahren', 'bremsen', 'fall', 'einholen']);
  W.labor.PRESETS.forEach((p) => {
    const def = W.labor.preset(p);
    ok(def.titel && def.regler.length, p);
    def.regler.forEach((r) => ok(r.wert >= r.min && r.wert <= r.max && r.label && r.einheit, p + ' ' + r.key));
    const z = W.labor.zustand(p, {}, 1);
    ok(z.every((x) => isFinite(x.s) && isFinite(x.v) && isFinite(x.a)), p + ': Grundwerte');
    ok(W.labor.dauer(p, {}) > 0, p + ': Dauer');
  });
});

test('Labor: Zahlen mit 2 Nachkommastellen, kleine Werte mit gültigen Ziffern', () => {
  const { W } = alles();
  const P = W.physik;
  eq(W.labor.zahl(P.tAusS(20, P.G)), '2,02');
  eq(W.labor.zahl(0.05), '0,05');
  eq(W.labor.zahl(P.bremsWeg(1, 7)), '0,071');
  eq(W.labor.zahl(9), '9');
  eq(W.labor.zahl(0), '0');
  // Werte-Zeile: t mit 2 Nachkommastellen, kleiner Bremsweg nicht auf 0,1 gerundet
  eq(W.labor.zeilen('fall', { h: 20, g: P.G }, P.tAusS(20, P.G))[0], ['t = 2,02 s']);
  eq(W.labor.zeilen('bremsen', { v0: 1, a: 10 }, 1)[1], ['s = 0,05 m', 'v = 0 m/s', 'a = 0 m/s²']);
  eq(W.labor.zeilen('einholen', {}, 0).length, 3);
});

test('Labor: Ergebnistext gerundet wie in der Werte-Zeile', () => {
  const { W } = alles();
  const P = W.physik;
  const t5 = P.tAusS(5, P.G);
  eq(W.labor.ereignis('fall', { h: 5, g: P.G }).text, 'Aufprall nach t ≈ ' + P.fmt(t5) + ' s mit v ≈ ' + P.fmt(P.vBeschl(P.G, t5)) + ' m/s.');
  ok(/Aufprall nach t ≈ 1,01 s/.test(W.labor.ereignis('fall', { h: 5, g: P.G }).text), 'Fall 5 m');
  eq(W.labor.ereignis('bremsen', { v0: 9, a: 4.5 }).text, 'Stillstand nach t = 2 s. Bremsweg s = 9 m.');
  eq(W.labor.ereignis('bremsen', { v0: 1, a: 10 }).text, 'Stillstand nach t = 0,1 s. Bremsweg s = ' + P.fmt(P.bremsWeg(1, 10)) + ' m.');
  ok(/Bremsweg s = 0,05 m/.test(W.labor.ereignis('bremsen', { v0: 1, a: 10 }).text), 'kleiner Bremsweg');
  const e = P.einholen(4.67, 1.56);
  eq(W.labor.ereignis('einholen', {}).text, 'Treffpunkt nach t ≈ ' + P.fmt(e.t) + ' s bei s ≈ ' + P.fmt(e.s) + ' m.');
});

test('Labor: realistische Reglerbereiche, Grundwerte wie auf den Blättern', () => {
  const { W } = alles();
  const r = (p, k) => W.labor.preset(p).regler.find((x) => x.key === k);
  const bereich = (p, k) => [r(p, k).min, r(p, k).max, r(p, k).wert];
  eq(bereich('anfahren', 'a'), [0.1, 1.5, 0.5]);
  eq(bereich('bremsen', 'v0'), [1, 12.5, 9]);
  eq(bereich('bremsen', 'a'), [0.5, 7, 4.5]);
  ok(r('einholen', 'v1').max <= 7 && r('einholen', 'v1').wert === 4.67, 'v₁');
  ok(r('einholen', 'a2').max <= 2 && r('einholen', 'a2').wert === 1.56, 'a₂');
  ok(/1,84/.test(r('fall', 'g').hinweis || r('fall', 'g').label), 'g-Regler: Hinweis auf die Tafelaufgabe Mond 1,84');
});

test('Labor: Zeitraffer ganzzahlig, Echtzeit bis 10 s, Zeitlupe unter 2 s', () => {
  const { W } = alles();
  [0.14, 0.5, 1.01, 1.99].forEach((T) => {
    const k = W.labor.tempo(T);
    ok(k < 1 && T / k >= 2 - 1e-9 && Number.isInteger(1 / k), 'Zeitlupe bei T = ' + T + ': ' + k);
  });
  [2, 5, 10].forEach((T) => eq(W.labor.tempo(T), 1, 'Echtzeit bei T = ' + T));
  [10.5, 20, 87.5].forEach((T) => {
    const k = W.labor.tempo(T);
    ok(Number.isInteger(k) && k >= 2 && T / k <= 10 + 1e-9, 'Zeitraffer bei T = ' + T + ': ' + k);
  });
  eq(W.labor.tempoText(2), 'Zeitraffer: 2-fach');
  eq(W.labor.tempoText(1), '');
  eq(W.labor.tempoText(0.5), 'Zeitlupe: 2-fach verlangsamt');
});

test('Labor in den Akten: je Akte eine Demo an der passenden Verstehen-Karte', () => {
  const { W } = alles();
  const soll = { gleichfoermig: [3, 'labor:gleichfoermig'], beschleunigt: [2, 'labor:anfahren'], diagramme: [1, 'labor:anfahren'],
    einholen: [0, 'labor:einholen'], bremsen: [1, 'labor:bremsen'], fall: [3, 'labor:fall'] };
  const mitKarten = W.akten.filter((a) => (a.karten || []).length);
  Object.keys(soll).forEach((id) => ok(mitKarten.some((a) => a.id === id), 'Akte fehlt: ' + id));
  mitKarten.forEach((a) => {
    const demos = (a.karten || []).map((k, i) => [i, k.demo]).filter((x) => x[1]);
    demos.forEach((d) => ok(W.labor.PRESETS.indexOf(d[1].replace(/^labor:/, '')) >= 0, a.id + ': unbekannte Demo ' + d[1]));
    if (soll[a.id]) eq(demos, [soll[a.id]], a.id);
    else eq(demos, [], a.id);
  });
});

test('Akte 4, Karte „Achsen beschriften“: a(t)-Sprünge gestrichelt, eine Beschriftung', () => {
  const { W } = alles();
  const k = W.ansichten.akteNachId('diagramme').karten.find((x) => /Achsen beschriften/.test(x.titel));
  const sprung = k.abb.kurven.filter((x) => x.gestrichelt);
  ok(sprung.length === 3 && sprung.every((x) => x.punkte.length === 2 && x.punkte[0][0] === x.punkte[1][0]), 'drei senkrechte Sprünge');
  eq(k.abb.kurven.filter((x) => x.label !== false).length, 1, 'eine Beschriftung');
  ok(W.diagramm.markup(k.abb).svg.indexOf('dia-kurve--gestrichelt') >= 0, 'Markup');
});

test('Radarfalle: mindestens 40 Aussagen, jede mit Erklärung und Akte, alle neun Akten, halb wahr', () => {
  const { W } = alles();
  const A = W.radar.aussagen;
  ok(A.length >= 40, 'nur ' + A.length);
  A.forEach((a, i) => {
    ok(a.text && typeof a.stimmt === 'boolean' && a.erkl, 'Aussage ' + i);
    ok(AKTEN_IDS.indexOf(a.akte) >= 0, 'Akte unbekannt bei ' + i + ': ' + a.akte);
    ok(!/\d\.\d/.test(a.text + a.erkl), 'Dezimalpunkt statt Komma bei ' + i);
    ok(!/(^|[\s(=])-\s?\d/.test(a.text + a.erkl), 'Bindestrich statt Minuszeichen bei ' + i);
  });
  AKTEN_IDS.forEach((id) => ok(A.filter((a) => a.akte === id).length >= 4, 'zu wenig Aussagen zu ' + id));
  eq(A.filter((a) => a.stimmt).length, A.filter((a) => !a.stimmt).length, 'gleich viele wahre und falsche');
  eq(new Set(A.map((a) => a.text)).size, A.length, 'doppelte Aussage');
});

test('Radarfalle: Punkte = richtig minus falsch, nie unter 0', () => {
  const { W } = alles();
  eq(W.radar.punkte(5, 2), 3);
  eq(W.radar.punkte(1, 4), 0);
  eq(W.radar.DAUER, 60);
});

test('Radarfalle: Fehler kommen als r:<i> in die Nachermittlung und lösen sich auf', () => {
  const { W } = alles();
  W.state.load();
  const i = W.radar.aussagen.findIndex((a) => !a.stimmt);
  const it = W.ansichten.itemNachId('r:' + i);
  eq(it.typ, 'wahl');
  eq(it.id, 'r:' + i);
  eq(it.optionen, ['Stimmt', 'Stimmt nicht']);
  eq(it.richtig, 1);
  ok(W.aufgaben.optErklOk(it), 'optErkl');
  ok(it.frage.indexOf(W.radar.aussagen[i].text) >= 0, 'Frage ohne Aussage');
  eq(W.ansichten.itemNachId('r:99999'), null);
  W.state.itemErgebnis('r:' + i, false);
  eq(W.ansichten.nmAnzahl(), 1);
  W.state.itemErgebnis('r:' + i, true);
  W.state.itemErgebnis('r:' + i, true);
  eq(W.ansichten.nmAnzahl(), 0);
});

test('Radarfalle: Ids r:<i> bleiben stabil (54 Aussagen, abwechselnd wahr und falsch, nur hinten anhängen)', () => {
  const { W } = alles();
  const A = W.radar.aussagen;
  ok(A.length >= 54, 'Aussagen gelöscht');
  for (let i = 0; i < 54; i++) eq(A[i].stimmt, i % 2 === 0, 'stimmt bei r:' + i);
});

test('Radarfalle: eindeutige Aussagen aus dem Fachreview', () => {
  const { W } = alles();
  const A = W.radar.aussagen, P = W.physik;
  eq(A[27].text, 'Ein waagerechter s(t)-Graph bedeutet: Das Fahrzeug fährt mit konstanter Geschwindigkeit.');
  eq(A[48].text, 'Im freien Fall auf der Erde beträgt die Beschleunigung g = 9,81 m/s².');
  eq(A[48].erkl, 'Ohne Luftwiderstand fallen auf der Erde alle Körper mit dieser Beschleunigung. Auf dem Mond ist g kleiner.');
  ok(/alle ungefähr 9,8 m\/s², ist die Bewegung gleichförmig\.$/.test(A[35].text), 'r:35');
  eq(A[33].text, 'Beim Sprung vom Turm erhältst du die Geschwindigkeit bei t = 0,4 s, indem du s(0,4 s) durch 0,4 s teilst.');
  const s04 = P.sBeschl(P.G, 0.4);
  eq(P.fmt(s04, 3), '0,785'); eq(P.fmt(s04 / 0.4), '1,96'); near(P.vBeschl(P.G, 0.4), 2 * s04 / 0.4, 1e-9);
  eq(A[33].erkl, 'Das ist die mittlere Geschwindigkeit von 0 bis 0,4 s. Sie gehört zur Intervallmitte 0,2 s (' + P.fmt(s04, 3) + ' m : 0,4 s ≈ ' + P.fmt(s04 / 0.4) + ' m/s). Bei 0,4 s ist der Springer schon doppelt so schnell.');
  eq(A[41].text, 'Ein Fahrzeug, das aus dem Stand immer weiter gleichmäßig beschleunigt, kann ein gleichförmig fahrendes nie einholen.');
  ok(/muss die ganze Zeit genau 30 km\/h schnell gefahren sein\.$/.test(A[7].text), 'r:7');
  ok(/gleichmäßig beschleunigt/.test(A[22].text) && /aus dem Stand/.test(A[22].text), 'r:22');
  ok(/gleichmäßig beschleunigt/.test(A[26].text) && /aus dem Stand/.test(A[26].text), 'r:26');
  ok(A[29].erkl.indexOf('(in v = v₀ − a·t steht nur der Betrag)') >= 0, 'r:29');
  eq(P.fmt(P.kmh(84.7 / 61.5)), '4,96');
  ok(A[8].erkl.indexOf('etwa 4,96 km/h') >= 0, 'r:8');
});

test('Radarfalle: Nachermittlung erklärt die falsche Option aus Sicht der Wahl', () => {
  const { W } = alles();
  const falsch = W.ansichten.itemNachId('r:27');   // stimmt nicht
  eq(falsch.optErkl[0], 'Du hast ‚Stimmt‘ gewählt – die Aussage stimmt aber nicht.');
  eq(falsch.optErkl[1], W.radar.aussagen[27].erkl);
  const wahr = W.ansichten.itemNachId('r:48');     // stimmt
  eq(wahr.optErkl[1], 'Du hast ‚Stimmt nicht‘ gewählt – die Aussage stimmt aber.');
  eq(wahr.optErkl[0], W.radar.aussagen[48].erkl);
});

test('Radarfalle: Ergebnis mit Einheit, Sperre nach Fehler 3 s', () => {
  const { W } = alles();
  eq(W.radar.punkteText(0), '0 Punkte');
  eq(W.radar.punkteText(1), '1 Punkt');
  eq(W.radar.punkteText(7), '7 Punkte');
  eq(W.radar.SPERRE_MS, 3000);
});

fertig('logic');
