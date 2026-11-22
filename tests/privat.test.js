/* Datenschutz: Keine privaten Namen in veröffentlichten Dateien.
   Die Namensliste steht in tests/privat-namen.txt (per .gitignore nicht im Repo). */
const fs = require('fs');
const path = require('path');
const { test, ok, fertig } = require('./mini');

const ROOT = path.join(__dirname, '..');
const LISTE = path.join(__dirname, 'privat-namen.txt');

function dateien(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === '.superpowers' || e.name === 'fonts') return;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) dateien(p, out);
    else if (!/\.(png|woff2|jpg)$/i.test(e.name) && p !== LISTE) out.push(p);
  });
  return out;
}

function treffer(namen) {
  const funde = [];
  dateien(ROOT, []).forEach((f) => {
    const t = fs.readFileSync(f, 'utf8').toLowerCase();
    namen.forEach((n) => { if (t.indexOf(n.toLowerCase()) >= 0) funde.push(path.relative(ROOT, f) + ': ' + n); });
  });
  return funde;
}

if (!fs.existsSync(LISTE)) {
  console.log('privat-namen.txt fehlt, Test übersprungen');
} else {
  const namen = fs.readFileSync(LISTE, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  test('keine privaten Namen im Projekt', () => {
    const f = treffer(namen);
    ok(f.length === 0, 'gefunden: ' + f.join(', '));
  });
}

fertig('privat');
