/* Inhaltstest: jede Akte vollständig, jede Aufgabe mit ihrer eigenen Lösung lösbar, Quellen der Blätter abgedeckt. */
const { test, ok, eq, fertig } = require('./mini');
const laden = require('./laden');
/* AKTE=js/inhalt/akte3-beschleunigt.js lädt nur diese eine Akte (für paralleles Arbeiten). */
const nur = process.env.AKTE ? laden.skripte().filter((f) => !/^js\/inhalt\/akte\d/.test(f) || f === process.env.AKTE) : undefined;
const W = laden(nur);

const PFLICHT = {
  gleichfoermig: ['Blatt 1, A1 a', 'Blatt 1, A1 b', 'Blatt 1, A1 c', 'Tafel 17.11.'],
  beschleunigt: ['Blatt 1, A2 a', 'Blatt 1, A2 b', 'Blatt 1, A2 c', 'Tafel S. 3', 'Tafel S. 7', 'Tafel S. 9', 'Tafel S. 10', 'Tafel S. 14'],
  messdaten: ['Tafel 17.11.', 'Tafel S. 13'],
  einholen: ['Blatt 2, A1 a', 'Blatt 2, A1 b', 'Blatt 2, A1 c', 'Blatt 2, A1 d', 'Blatt 2, A1 e', 'Blatt 2, A1 f', 'Blatt 2, A1 g', 'Blatt 1, A2 d'],
  bremsen: ['Blatt 2, A2 a', 'Blatt 2, A2 b', 'Blatt 2, A2 c', 'Blatt 2, A2 d', 'Blatt 2, A2 e', 'Blatt 2, A2 f', 'Blatt 2, A2 g', 'Tafel S. 12', 'Tafel S. 14'],
  fall: ['Blatt 1, A3 a', 'Blatt 1, A3 b', 'Blatt 1, A3 c', 'Blatt 1, A3 d', 'Blatt 1, A3 e', 'Tafel S. 8', 'Tafel S. 9'],
  einheiten: ['Tafel S. 2', 'Tafel S. 10'],
  mittel: ['Tafel S. 1'],
  diagramme: ['Tafel 17.11.', 'Tafel S. 3', 'Tafel S. 12']
};

const akten = (W.akten || []).filter((a) => !a.folgt);
const quellen = (x) => (x.quelle == null ? [] : Array.isArray(x.quelle) ? x.quelle : [x.quelle]);
const alleItems = (a) => (a.ueben || []).concat(a.gutachten || []);

function eigeneLoesung(item) {
  if (item.typ === 'rechnung') return W.physik.fmt(item.antwort);
  return W.aufgaben.loesung(item);
}

test('es gibt Akten mit Inhalt', () => ok(akten.length > 0, 'keine Akte geladen'));

const ids = {};
akten.forEach((a) => {
  const t = (n, fn) => test('Akte ' + a.nr + ' (' + a.id + '): ' + n, fn);

  t('Pflichtfelder', () => {
    ['id', 'nr', 'titel', 'fall', 'auftrag', 'karten', 'ueben', 'gutachten', 'ergebnis'].forEach((k) => ok(a[k] != null, 'fehlt: ' + k));
    ['text', 'chefin', 'leitfrage'].forEach((k) => ok(a.auftrag[k], 'auftrag.' + k + ' fehlt'));
    ok(a.karten.length >= 3 && a.karten.length <= 8, '3–6 Karten (bis 8 mit Plus), sind ' + a.karten.length);
    const pflichtUeben = a.ueben.filter((u) => !u.plus).length;
    ok(pflichtUeben >= 10, 'mindestens 10 Pflicht-Übungen, sind ' + pflichtUeben);
    ok(a.gutachten.length >= 3 && a.gutachten.length <= 4, '3–4 Gutachten-Fragen, sind ' + a.gutachten.length);
    ok(a.gutachten.some((g) => g.typ === 'rechnung'), 'Gutachten ohne Rechnung');
    ok(a.ueben.filter((u) => u.typ === 'rechnung').length >= 3, 'weniger als 3 Rechnungen im Üben');
    ok(a.ueben.some((u) => u.typ === 'punkte' || (u.typ === 'wahl' && /<svg/.test(u.optionen.join('')))), 'kein Diagramm-Item (punkte oder Graph-Auswahl)');
  });

  t('Trainer gültig', () => {
    ok(Array.isArray(a.trainer) && a.trainer.length > 0, 'trainer fehlt');
    a.trainer.forEach((id) => ok(W.trainer.IDS.indexOf(id) >= 0, 'unbekannter Trainer ' + id));
  });

  t('Videos vorhanden', () => {
    if (!(W.videos && W.videos[a.id] && W.videos[a.id].length)) console.log('WARNUNG: keine Videos für ' + a.id);
  });

  alleItems(a).forEach((item) => {
    t('Item ' + item.id + ' eindeutig', () => {
      ok(item.id, 'Item ohne id');
      ok(!ids[item.id], 'doppelte id ' + item.id);
      ids[item.id] = true;
    });
    t('Item ' + item.id + ' mit eigener Lösung lösbar', () => {
      eq(W.aufgaben.score(item, eigeneLoesung(item)), 1, item.id);
    });
    t('Item ' + item.id + ' hat Erklärung je Option', () => ok(W.aufgaben.optErklOk(item), 'optErkl fehlt oder Länge falsch'));
    if (item.typ === 'rechnung') {
      t('Rechnung ' + item.id + ' vollständig', () => {
        ok(item.loesung && item.einheit && item.formel, 'loesung, einheit oder formel fehlt');
        ok(Array.isArray(item.schritte) && item.schritte.length >= 2, 'zu wenige Schritte');
        item.schritte.forEach((s, i) => {
          ok(s.richtig >= 0 && s.richtig < s.optionen.length, 'Schritt ' + i + ': richtig außerhalb');
          ok(Array.isArray(s.optErkl) && s.optErkl.length === s.optionen.length, 'Schritt ' + i + ': optErkl');
          ok(new Set(s.optionen).size === s.optionen.length, 'Schritt ' + i + ': doppelte Optionen');
        });
        ok(isFinite(item.antwort), 'antwort keine Zahl');
      });
    }
  });

  (a.erklaeren || []).forEach((e) => {
    t('Beschreiben ' + e.id + ' vollständig', () => {
      ok(e.id && e.frage && e.muster && Array.isArray(e.punkte) && e.punkte.length, 'Erkl unvollständig');
      ok(!ids[e.id], 'doppelte id ' + e.id);
      ids[e.id] = true;
    });
  });

  t('Quellen der Blätter und der Tafel abgedeckt', () => {
    const vorhanden = [];
    alleItems(a).concat(a.erklaeren || []).forEach((x) => quellen(x).forEach((q) => vorhanden.push(q)));
    (PFLICHT[a.id] || []).forEach((p) => ok(vorhanden.some((q) => q.indexOf(p) === 0), 'Quelle fehlt: ' + p));
  });
});

/* Fachliche Stichproben gegen W.physik (nur wenn die Akte geladen ist). */
function mitQuelle(akteId, q) {
  const a = akten.filter((x) => x.id === akteId)[0];
  if (!a) return null;
  return alleItems(a).filter((x) => quellen(x).some((s) => s.indexOf(q) === 0));
}
const stich = [
  ['gleichfoermig', 'Blatt 1, A1 c', 128],
  ['beschleunigt', 'Blatt 1, A2 a', 30],
  ['beschleunigt', 'Blatt 1, A2 c', W.physik.tAusS(1000, 0.5)],
  ['einholen', 'Blatt 1, A2 d', 75],
  ['einholen', 'Blatt 2, A1 f', W.physik.tAusS(50, 2 * 28 / 36)],
  ['bremsen', 'Blatt 2, A2 g', 9],
  ['fall', 'Blatt 1, A3 e', W.physik.tAusS(5, W.physik.G)]
];
stich.forEach(([akte, q, wert]) => {
  const items = mitQuelle(akte, q);
  if (!items) return;
  test('Stichprobe ' + akte + ' ' + q + ' ≈ ' + W.physik.fmt(wert), () => {
    const rechnungen = items.filter((x) => x.typ === 'rechnung' || x.typ === 'zahl');
    ok(rechnungen.length > 0, 'keine Rechnung mit Quelle ' + q);
    ok(rechnungen.some((x) => W.physik.passt(W.physik.fmt(wert), x.antwort, x.auch, x.tolRel)), 'keine Rechnung mit Ergebnis ≈ ' + wert);
  });
});

fertig('inhalt');
