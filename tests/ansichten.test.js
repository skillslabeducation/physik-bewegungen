/* Aktenschrank-Daten: neun Akten mit Platzhaltern, Inhalt ersetzt Platzhalter, Rechentrainer-ids, Videos.
   Der Fall „ohne Inhalt“ lädt alle Skripte außer den Akten-Dateien; die übrigen Tests gelten mit und ohne Inhalt. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { test, ok, eq, fertig } = require('./mini');
const laden = require('./laden');

const IDS = ['einheiten', 'mittel', 'gleichfoermig', 'beschleunigt', 'diagramme', 'messdaten', 'einholen', 'bremsen', 'fall'];
const ohneAkten = laden.skripte().filter((f) => !/^js\/inhalt\/akte\d/.test(f));

function mitDemo(W, ctx) {
  const datei = path.join(__dirname, 'fixtures', 'demo-akte.js');
  vm.runInContext(fs.readFileSync(datei, 'utf8'), ctx, { filename: datei });
}

/* ---------- ohne Inhalt ---------- */
{
  const W = laden(ohneAkten);
  const ctx = laden.kontext;

  test('Liste der neun Akten mit Nummern 0 bis 8', () => {
    eq(W.AKTEN_LISTE.map((a) => a.nr), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    eq(W.AKTEN_LISTE.map((a) => a.id), IDS);
    W.AKTEN_LISTE.forEach((a) => ok(a.titel && a.fall, 'Titel oder Fall fehlt: ' + a.id));
  });

  test('folgt.js schiebt Platzhalter für Akten 0, 1 und 4', () => {
    eq(W.akten.filter((a) => a.folgt).map((a) => a.id).sort(), ['diagramme', 'einheiten', 'mittel']);
  });

  test('ohne Inhalt zeigt der Aktenschrank alle neun Akten als „folgt“', () => {
    const alle = W.ansichten.akten();
    eq(alle.map((a) => a.id), IDS);
    eq(alle.map((a) => W.logic.akteStatus(a, W.state.data).status), Array(9).fill('folgt'));
    eq(W.ansichten.naechsteAkte(), null);
  });

  test('eine Akte außerhalb der Liste kommt hinten dazu und wird zur nächsten Akte', () => {
    mitDemo(W, ctx);
    const alle = W.ansichten.akten();
    eq(alle.length, 10);
    eq(alle[9].id, 'demo');
    eq(W.ansichten.naechsteAkte().id, 'demo');
    eq(W.ansichten.itemNachId('demo-u2').typ, 'rechnung');
  });

  test('geladene Akte ersetzt ihren Platzhalter, egal in welcher Reihenfolge', () => {
    W.akten.push({ id: 'mittel', nr: 1, titel: 'x', fall: 'y', ueben: [], gutachten: [] });
    const a1 = W.ansichten.akteNachId('mittel');
    ok(!a1.folgt, 'Platzhalter nicht ersetzt');
    eq(W.ansichten.akten().filter((a) => a.id === 'mittel').length, 1);
    W.akten.pop();
  });
}

/* ---------- mit allem, was index.html lädt (mit oder ohne Inhalt) ---------- */
{
  const W = laden();
  const ctx = laden.kontext;

  test('Aktenschrank hat genau die neun Akten der Liste, jede mit Inhalt oder als Platzhalter', () => {
    const alle = W.ansichten.akten();
    eq(alle.map((a) => a.id), IDS);
    alle.forEach((a) => ok(a.folgt || (Array.isArray(a.ueben) && Array.isArray(a.gutachten)), 'weder Inhalt noch Platzhalter: ' + a.id));
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

  test('Demo-Akte erfüllt das Format und kollidiert mit keiner echten Akte', () => {
    mitDemo(W, ctx);
    ok(W.AKTEN_LISTE.every((e) => e.id !== 'demo'), 'Demo-id steht in der Liste');
    const a = W.ansichten.akteNachId('demo');
    eq(W.ansichten.akten().length, 10);
    a.ueben.concat(a.gutachten).forEach((it) => {
      ok(W.aufgaben.optErklOk(it), 'optErkl: ' + it.id);
      const l = it.typ === 'rechnung' ? W.physik.fmt(it.antwort) : W.aufgaben.loesung(it);
      eq(W.aufgaben.score(it, l), 1, it.id);
    });
  });
}

fertig('ansichten');
