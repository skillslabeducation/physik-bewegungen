/* Aktenschrank-Daten: neun Akten mit Platzhaltern, Inhalt ersetzt Platzhalter, Rechentrainer-ids, Videos. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test, ok, eq, fertig } = require('./mini');
const laden = require('./laden');

const W = laden();
const ctx = laden.kontext;

test('Liste der neun Akten mit Nummern 0 bis 8', () => {
  eq(W.AKTEN_LISTE.map((a) => a.nr), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  eq(W.AKTEN_LISTE.map((a) => a.id), ['einheiten', 'mittel', 'gleichfoermig', 'beschleunigt', 'diagramme', 'messdaten', 'einholen', 'bremsen', 'fall']);
  W.AKTEN_LISTE.forEach((a) => ok(a.titel && a.fall, 'Titel oder Fall fehlt: ' + a.id));
});

test('folgt.js schiebt Platzhalter für Akten 0, 1 und 4', () => {
  const p = W.akten.filter((a) => a.folgt).map((a) => a.id).sort();
  eq(p, ['diagramme', 'einheiten', 'mittel']);
});

test('ohne Inhalt zeigt der Aktenschrank alle neun Akten als „folgt“', () => {
  const alle = W.ansichten.akten();
  eq(alle.length, 9);
  ok(alle.every((a) => a.folgt), 'alle Platzhalter erwartet');
  eq(alle.map((a) => W.logic.akteStatus(a, W.state.data).status), Array(9).fill('folgt'));
  eq(W.ansichten.naechsteAkte(), null);
});

test('jede Akte der Liste hat Video-Links mit Titel und Kanal', () => {
  W.AKTEN_LISTE.forEach((a) => {
    const v = W.videos[a.id] || [];
    ok(v.length >= 1, 'keine Videos: ' + a.id);
    v.forEach((x) => ok(x.id && x.titel && x.kanal, 'unvollständig: ' + a.id));
  });
});

test('Rechentrainer-ids lösen sich mit neuen Zahlen auf', () => {
  const it = W.ansichten.itemNachId('t:v-at');
  ok(it && it.typ === 'rechnung' && it.id === 't:v-at', 'kein Trainer-Item');
  eq(W.ansichten.itemNachId('t:gibtsnicht'), null);
  eq(W.ansichten.itemNachId('gibtsnicht-u1'), null);
});

test('eine geladene Akte ersetzt ihren Platzhalter und wird zur nächsten Akte', () => {
  const datei = path.join(__dirname, 'fixtures', 'demo-akte.js');
  vm.runInContext(fs.readFileSync(datei, 'utf8'), ctx, { filename: datei });
  const alle = W.ansichten.akten();
  eq(alle.length, 9);
  const a3 = alle.find((a) => a.nr === 3);
  ok(!a3.folgt && a3.ueben.length > 0, 'Akte 3 nicht ersetzt');
  eq(alle.filter((a) => a.folgt).length, 8);
  eq(W.ansichten.naechsteAkte().id, 'beschleunigt');
  ok(W.ansichten.itemNachId('beschleunigt-u2').typ === 'rechnung', 'Item der Akte nicht gefunden');
});

test('Demo-Akte erfüllt das Format', () => {
  const a = W.ansichten.akteNachId('beschleunigt');
  a.ueben.concat(a.gutachten).forEach((it) => {
    ok(W.aufgaben.optErklOk(it), 'optErkl: ' + it.id);
    const l = it.typ === 'rechnung' ? W.physik.fmt(it.antwort) : W.aufgaben.loesung(it);
    eq(W.aufgaben.score(it, l), 1, it.id);
  });
});

fertig('ansichten');
