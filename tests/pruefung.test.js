/* Sachverständigenprüfung: Punkte, Varianten, Lösbarkeit, Auswertung, gleicher Seed = gleiche Prüfung. */
const laden = require('./laden');
const { test, ok, eq, near, fertig } = require('./mini');
const W = laden();
const P = W.physik;
const A = W.aufgaben;
const SEEDS = 500;

function alle(fn) { for (let s = 1; s <= SEEDS; s++) fn(W.pruefung.erzeuge(s), s); }
function teile(pr) { const out = []; pr.aufgaben.forEach((a) => a.teile.forEach((t) => out.push({ a, t, key: a.nr + t.b }))); return out; }
function summe(liste) { return (liste || []).reduce((s, x) => s + x.p, 0); }
function zahlenIn(text) {
  return (String(text).replace(/<[^>]*>/g, ' ').match(/−?\d+(?:,\d+)?/g) || []).map((z) => parseFloat(z.replace('−', '-').replace(',', '.')));
}
/** Volle Antworten: Musterlösung jedes Auto-Teils, alle Haken. */
function vollAntworten(pr) {
  const ant = {};
  teile(pr).forEach(({ t, key }) => {
    const liste = t.erkl ? t.erkl.punkte : (t.rechenweg || []);
    ant[key] = { auto: t.item ? A.loesung(t.item) : undefined, haken: liste.map((x, i) => i) };
  });
  return ant;
}

test('Schnittstelle: erzeuge, auswerten, Kopf', () => {
  ok(W.pruefung && typeof W.pruefung.erzeuge === 'function' && typeof W.pruefung.auswerten === 'function', 'W.pruefung fehlt');
  const pr = W.pruefung.erzeuge(1);
  eq([pr.titel, pr.dauerMin, pr.max, pr.aufgaben.length], ['Sachverständigenprüfung', 45, 40, 2]);
  eq(pr.aufgaben.map((a) => a.nr), [1, 2]);
});

test('für 500 Seeds: Summe aller p = 40 = max, je Aufgabe 20', () => {
  alle((pr, s) => {
    const sum = teile(pr).reduce((x, { t }) => x + t.p, 0);
    ok(sum === 40 && pr.max === 40, 'Seed ' + s + ': Summe ' + sum);
    pr.aufgaben.forEach((a) => ok(summe(a.teile) === 20, 'Seed ' + s + ' Aufgabe ' + a.nr + ': ' + summe(a.teile)));
  });
});

test('Teile: Buchstaben a, b, c … ohne Lücke; Auto-Teil oder Beschreibe-Teil; Rechenweg ≤ p − 0,5', () => {
  alle((pr, s) => {
    pr.aufgaben.forEach((a) => {
      eq(a.teile.map((t) => t.b).join(''), 'abcdefgh'.slice(0, a.teile.length), 'Seed ' + s + ' Buchstaben');
      a.teile.forEach((t) => {
        const tag = 'Seed ' + s + ' ' + a.nr + t.b;
        ok(!!t.item !== !!t.erkl, tag + ': genau item oder erkl');
        ok(t.p > 0 && Number.isInteger(t.p * 2), tag + ': p');
        if (t.item) {
          ok(t.item.typ !== 'rechnung', tag + ': kein rechnung-Typ in der Prüfung');
          ok(['zahl', 'punkte', 'terme', 'tabelle'].indexOf(t.item.typ) >= 0, tag + ': Typ ' + t.item.typ);
          eq(t.item.id, 'p:' + a.nr + t.b, tag + ' id');
          ok(summe(t.rechenweg) <= t.p - 0.5, tag + ': Rechenweg zu groß');
          (t.rechenweg || []).forEach((r) => ok(Number.isInteger(r.p * 2), tag + ': Rechenweg-Punkt in halben Punkten'));
          if (t.rechenweg && t.item.typ === 'zahl') ok(t.rechenweg.some((r) => /Einheit/.test(r.text) && /Ergebnis/.test(r.text)), tag + ': Haken für die Einheit fehlt');
          eq(W.pruefung.pAuto(t), t.p - summe(t.rechenweg), tag + ' pAuto');
          (t.rechenweg || []).forEach((r) => ok(r.text && r.p > 0, tag + ': Rechenweg-Punkt'));
          if (t.rechenweg) ok(t.item.loesung, tag + ': Rechenteil ohne Musterlösung');
          ok(W.trainer.IDS.indexOf(t.trainer) >= 0, tag + ': Trainer-id ' + t.trainer);
        } else {
          ok(t.erkl.id && t.erkl.frage && t.erkl.muster && t.erkl.punkte.length, tag + ': Erkl unvollständig');
          eq(summe(t.erkl.punkte), t.p, tag + ': Erwartungshorizont = p');
        }
        ok(W.AKTEN_LISTE.some((e) => e.id === t.akte), tag + ': Akte ' + t.akte);
        ok(t.kurz, tag + ': Kurztitel');
      });
    });
  });
});

test('jedes Auto-Item mit eigener Lösung voll, auch mit gerundeter Eingabe wie von Hand', () => {
  alle((pr, s) => {
    teile(pr).forEach(({ t, key }) => {
      if (!t.item) return;
      const it = t.item, tag = 'Seed ' + s + ' ' + key;
      ok(A.score(it, A.loesung(it)) === 1, tag + ': Lösung nicht voll');
      if (it.typ === 'zahl') {
        ok(A.score(it, P.fmt(it.antwort)) === 1, tag + ': ' + P.fmt(it.antwort) + ' nicht akzeptiert (Soll ' + it.antwort + ')');
        ok(A.score(it, P.fmt(it.antwort) + ' ' + it.einheit) === 1, tag + ': mit Einheit nicht akzeptiert');
        ok(A.score(it, String(it.antwort * 1.05)) === 0, tag + ': 5 % daneben akzeptiert');
      }
      if (it.typ === 'tabelle') {
        const gerundet = it.zeilen.map((z) => z.zellen.map((c) => (c.zahl != null ? P.fmt(c.zahl) : null)));
        ok(A.score(it, gerundet) === 1, tag + ': auf zwei Stellen gerundete Tabelle nicht voll');
      }
      if (it.typ === 'punkte') {
        const gerastet = it.soll.map((y) => W.diagramm.einrasten(y, it.achsen.y.schritt / 2));
        ok(A.score(it, gerastet) === 1, tag + ': eingerastete Punkte nicht voll');
        ok(it.soll.every((y) => y >= (it.achsen.y.min || 0) && y <= it.achsen.y.max), tag + ': Punkt außerhalb der Achse');
        ok(it.xs.every((x) => x > (it.achsen.x.min || 0) && x <= it.achsen.x.max), tag + ': Zeitpunkt außerhalb der Achse');
      }
      if (it.typ === 'terme') {
        const gerundet = it.terme.map((z) => z.filter((x) => typeof x !== 'string').map((x) => P.fmt(x.zahl, 3)));
        ok(A.score(it, gerundet) === 1, tag + ': auf drei Stellen gerundete Terme nicht voll');
        ok(it.loesung, tag + ': Terme ohne Musterlösung');
      }
      ok(A.score(it, null) === 0 && A.leer(it, null), tag + ': leere Antwort');
    });
  });
});

test('Punkte: v = s/t 2 P., Funktionsterme 1 P. je Term mit Teilpunkten', () => {
  alle((pr, s) => {
    const t = {};
    teile(pr).forEach((x) => { t[x.key] = x.t; });
    eq(t['1a'].p, 2, 'Seed ' + s + ' 1a');
    [['1d', 2], ['2e', 3]].forEach(([key, n]) => {
      const tt = t[key], tag = 'Seed ' + s + ' ' + key;
      eq(tt.item.typ, 'terme', tag);
      eq([tt.p, tt.item.terme.length, W.pruefung.pAuto(tt)], [n, n, n], tag + ' Punkte');
      const voll = A.loesung(tt.item);
      for (let k = 0; k < n; k++) {
        const ant = voll.map((z, i) => (i === k ? z : z.map(() => '0')));
        eq(W.pruefung.auswerten(pr, { [key]: { auto: ant } }).punkte, 1, tag + ': ein richtiger Term');
      }
    });
  });
});

test('Funktionsterme verraten keine Ergebnisse anderer Teile', () => {
  alle((pr, s) => {
    teile(pr).filter(({ t }) => t.item && t.item.typ === 'terme').forEach(({ t, key }) => {
      const sichtbar = t.item.frage + t.item.terme.map((z) => z.filter((x) => typeof x === 'string').join(' ')).join(' ');
      ok(zahlenIn(sichtbar.replace(/[₀-₉]|t²|m\/s²/g, '')).length === 0, 'Seed ' + s + ' ' + key + ': Zahl im Term-Text: ' + sichtbar);
    });
  });
});

test('neue Zahlen: keine Tabelle wie auf den Blättern (Δt = 0,2 s im Fall, v₀ = 9 m/s beim Bremsen), mehr Vielfalt im Fall', () => {
  const dts = new Set(), varianten = new Set();
  alle((pr, s) => {
    const a = pr.aufgaben[1];
    const tab = a.text.match(/<table[\s\S]*?<\/table>/)[0];
    const ts = zahlenIn(tab.split('</tr>')[0]);
    if (a.variante === 'fall') {
      ok(Math.abs(ts[1] - 0.2) > 1e-9, 'Seed ' + s + ': Δt = 0,2 s wie Blatt 1 A3');
      dts.add(ts[1]);
      varianten.add(a.titel + '|' + a.text.replace(/<div class="tab-wrap">[\s\S]*$/, ''));
      const zellen = tab.split('</tr>')[1].match(/<td>[^<]*<\/td>/g).slice(1);
      zellen.forEach((z) => ok(/<td>\d+,\d{3}<\/td>/.test(z), 'Seed ' + s + ': Fallstrecke nicht dreistellig: ' + z));
    } else {
      ok(Math.abs(a.teile[5].item.antwort - 9) > 1e-9, 'Seed ' + s + ': v₀ = 9 m/s wie Blatt 2 A2');
    }
  });
  ok(dts.size >= 4, 'nur ' + dts.size + ' verschiedene Δt');
  ok(varianten.size >= 12, 'Fall nur ' + varianten.size + ' Varianten');
});

test('Realismus über 3000 Seeds: Geschwindigkeiten passen zum Ort', () => {
  const GRENZE = { 'E-Bikes an der Ampel': 45, 'Güterzug und Personenzug': 160, 'Lkw und Auto': 100 };
  for (let s = 1; s <= 3000; s++) {
    const a = W.pruefung.erzeuge(s).aufgaben[0];
    const v1 = a.teile[0].item.antwort, v2 = 2 * v1;
    ok(GRENZE[a.titel], 'Seed ' + s + ': unbekannter Kontext ' + a.titel);
    ok(v2 * 3.6 <= GRENZE[a.titel] + 1e-9, 'Seed ' + s + ' ' + a.titel + ': v₂ = ' + P.fmt(v2 * 3.6) + ' km/h');
    if (a.titel === 'Lkw und Auto') {
      ok(/Landstraße/.test(a.text), 'Seed ' + s + ': Lkw nicht auf der Landstraße');
      ok(v1 * 3.6 <= 60 + 1e-9, 'Seed ' + s + ': Lkw schneller als 60 km/h');
    }
  }
});

test('zwei verschiedene Seeds liefern verschiedene Zahlen; viele verschiedene Prüfungen', () => {
  ok(JSON.stringify(W.pruefung.erzeuge(1)) !== JSON.stringify(W.pruefung.erzeuge(2)), 'Seed 1 = Seed 2');
  const t1 = new Set(), t2 = new Set();
  alle((pr) => { t1.add(pr.aufgaben[0].text); t2.add(pr.aufgaben[1].text); });
  ok(t1.size >= 40, 'Aufgabe 1 nur ' + t1.size + ' Varianten');
  ok(t2.size >= 20, 'Aufgabe 2 nur ' + t2.size + ' Varianten');
});

test('beide Varianten von Aufgabe 2 kommen vor (freier Fall und Bremsen)', () => {
  const n = { fall: 0, bremsen: 0 };
  alle((pr) => { n[pr.aufgaben[1].variante]++; });
  ok(n.fall > 100 && n.bremsen > 100, JSON.stringify(n));
});

test('gleicher Seed → identisches Objekt', () => {
  [1, 7, 123456789, 4294967295].forEach((s) => eq(JSON.stringify(W.pruefung.erzeuge(s)), JSON.stringify(W.pruefung.erzeuge(s)), 'Seed ' + s));
});

test('auswerten: alle Lösungen und alle Haken → 40, leer → 0', () => {
  alle((pr, s) => {
    const voll = W.pruefung.auswerten(pr, vollAntworten(pr));
    ok(voll.punkte === 40 && voll.max === 40, 'Seed ' + s + ': ' + voll.punkte);
    eq(voll.teile.length, teile(pr).length);
    voll.teile.forEach((x) => ok(x.punkte === x.p, 'Seed ' + s + ' ' + x.nr + x.b));
    const leer = W.pruefung.auswerten(pr, {});
    ok(leer.punkte === 0 && leer.max === 40, 'Seed ' + s + ' leer: ' + leer.punkte);
  });
  eq(W.pruefung.auswerten(W.pruefung.erzeuge(3)).punkte, 0, 'ohne Antworten');
});

test('Rechenweg-Haken allein ohne Ergebnis geben nur die Rechenweg-Punkte', () => {
  alle((pr, s) => {
    teile(pr).forEach(({ t, key }) => {
      if (!t.rechenweg) return;
      const ant = {};
      ant[key] = { haken: t.rechenweg.map((x, i) => i) };
      const e = W.pruefung.auswerten(pr, ant);
      ok(e.punkte === summe(t.rechenweg), 'Seed ' + s + ' ' + key + ': ' + e.punkte);
      ant[key].auto = A.loesung(t.item);
      ok(W.pruefung.auswerten(pr, ant).punkte === t.p, 'Seed ' + s + ' ' + key + ' mit Ergebnis');
      ant[key] = { auto: A.loesung(t.item), haken: [] };
      ok(W.pruefung.auswerten(pr, ant).punkte === W.pruefung.pAuto(t), 'Seed ' + s + ' ' + key + ' nur Ergebnis');
    });
  });
});

test('auswerten: Haken doppelt oder außerhalb zählen nicht, Teilpunkte auf halbe Punkte', () => {
  const pr = W.pruefung.erzeuge(5);
  const rt = teile(pr).filter(({ t }) => t.rechenweg)[0];
  const ant = {};
  ant[rt.key] = { haken: [0, 0, 0, 99, -1, 'x'] };
  eq(W.pruefung.auswerten(pr, ant).punkte, rt.t.rechenweg[0].p);
  const tab = teile(pr).filter(({ t }) => t.item && t.item.typ === 'tabelle')[0];
  const halb = A.loesung(tab.t.item).map((z) => z.map((c, i) => (i % 2 ? '0' : c)));
  const e = W.pruefung.auswerten(pr, { [tab.key]: { auto: halb } });
  ok(e.punkte > 0 && e.punkte < W.pruefung.pAuto(tab.t) && Number.isInteger(e.punkte * 2), 'Teilpunkte Tabelle: ' + e.punkte);
  const er = teile(pr).filter(({ t }) => t.erkl)[0];
  eq(W.pruefung.auswerten(pr, { [er.key]: { text: 'x', haken: [0] } }).punkte, er.t.erkl.punkte[0].p, 'Beschreibe-Teil');
});

test('Aufgabe 1: Ergebnisse aus den Zahlen im Text nachgerechnet', () => {
  alle((pr, s) => {
    const a = pr.aufgaben[0];
    const [s0, t0, tA, sA] = zahlenIn(a.text.replace(/E-Bike \d|= 0/g, ''));
    const v1 = s0 / t0, acc = 2 * sA / (tA * tA), T = 2 * v1 / acc;
    const t = {};
    a.teile.forEach((x) => { t[x.b] = x; });
    const tag = 'Seed ' + s;
    near(t.a.item.antwort, v1, 1e-9, tag + ' v₁');
    near(t.b.item.antwort, v1 * 3.6, 1e-9, tag + ' km/h');
    near(t.c.item.antwort, acc, 1e-9, tag + ' a₂');
    const S = zahlenIn(t.f.item.frage.replace(/E-Bike \d/g, ''))[0];
    near(t.f.item.antwort, Math.sqrt(2 * S / acc), 1e-9, tag + ' Zeit für ' + S + ' m');
    near(t.g.item.antwort, T, 1e-9, tag + ' Einholzeit');
    near(t.h.item.antwort, v1 * T, 1e-9, tag + ' Treffpunkt');
    ok(Math.abs(t.f.item.antwort - T) / T > 0.05, tag + ': Zeit für Strecke zu nah an der Einholzeit');
    ok(tA < T, tag + ': Messzeit nach dem Einholen');
    t.e.item.xs.forEach((x, i) => near(t.e.item.soll[i], acc / 2 * x * x, 1e-9, tag + ' Graph'));
    ok(/beschleunigt/.test(a.text) && /konstant/.test(a.text), tag + ': Text');
  });
});

test('Aufgabe 2: Tabellenwerte nach der Mittelpunkt-Regel, Endfrage nachgerechnet', () => {
  alle((pr, s) => {
    const a = pr.aufgaben[1];
    const tag = 'Seed ' + s + ' (' + a.variante + ')';
    const tab = a.text.match(/<table[\s\S]*?<\/table>/)[0];
    const zeilen = tab.split('</tr>').slice(0, 2).map((z) => zahlenIn(z));
    const ts = zeilen[0], ss = zeilen[1];
    eq(ts.length, 5, tag + ' fünf Zeitpunkte');
    const v = P.mittel(ts, ss), acc = P.mittel(v.t, v.wert);
    const t = {};
    a.teile.forEach((x) => { t[x.b] = x; });
    ok(t.a.erkl, tag + ': a) Beschreibe');
    t.b.item.zeilen[0].zellen.forEach((c, i) => near(c.zahl, v.wert[i], 1e-9, tag + ' v̄'));
    eq(t.b.item.spalten.slice(1), v.t.map((x) => P.fmt(x, 3)), tag + ' Zeitpunkte v̄');
    t.c.item.soll.forEach((y, i) => near(y, v.wert[i], 1e-9, tag + ' Graph v'));
    t.d.item.zeilen[0].zellen.forEach((c, i) => near(c.zahl, acc.wert[i], 1e-9, tag + ' ā'));
    eq(t.d.item.spalten.slice(1), acc.t.map((x) => P.fmt(x, 3)), tag + ' Zeitpunkte ā');
    if (a.variante === 'fall') {
      const H = zahlenIn(a.text)[0];
      near(t.f.item.antwort, Math.sqrt(2 * H / 9.81), 1e-9, tag + ' Fallzeit');
      ok(ss[4] < H, tag + ': Tabelle reicht unter die Wasseroberfläche');
      acc.wert.forEach((x) => ok(Math.abs(x - 9.81) < 0.1, tag + ': ā = ' + x));
      t.d.item.zeilen[0].zellen.forEach((c) => ok(A.score({ typ: 'tabelle', zeilen: [{ zellen: [c] }] }, [['9,81']]) === 1, tag + ': 9,81 nicht akzeptiert'));
    } else {
      near(t.f.item.antwort, 2 * ss[4] / ts[4], 1e-9, tag + ' v₀ aus dem Bremsweg');
      acc.wert.forEach((x) => near(x, acc.wert[0], 1e-9, tag + ': ā nicht konstant'));
      ok(acc.wert[0] < 0, tag + ': Bremsen mit negativer Beschleunigung');
      near(ss[4] - ss[3], ss[1] / 7, 1e-9, tag + ': Stillstand am Ende der Tabelle');
    }
  });
});

test('Nachermittlung: falsche Auto-Teile als Trainer-id, schwache Beschreibung als Erklär-id', () => {
  const pr = W.pruefung.erzeuge(11);
  const leer = W.pruefung.nachermittlung(pr, {});
  const soll = [...new Set(teile(pr).filter(({ t }) => t.item).map(({ t }) => 't:' + t.trainer))];
  eq(leer.trainer.slice().sort(), soll.sort());
  ok(leer.trainer.every((id) => /^t:/.test(id)), 'nur t:-ids');
  eq(leer.erkl.length, 1, 'Beschreibe-Teil fehlt');
  const voll = W.pruefung.nachermittlung(pr, vollAntworten(pr));
  eq(voll.trainer, []);
  eq(voll.erkl, []);
  ok(leer.akten.length >= 2 && voll.akten.length === 0, 'Akten zum Wiederholen');
});

test('erklNachId: Beschreibe-Teile beider Varianten findet die Nachermittlung wieder', () => {
  const ids = new Set();
  alle((pr) => ids.add(pr.aufgaben[1].teile[0].erkl.id));
  eq(ids.size, 2);
  ids.forEach((id) => {
    const e = W.pruefung.erklNachId(id);
    ok(e && e.id === id && e.punkte.length, id);
  });
  eq(W.pruefung.erklNachId('gibtsnicht'), null);
});

test('Texte: Schreibweisen wie im Unterricht', () => {
  alle((pr, s) => {
    pr.aufgaben.forEach((a) => {
      const texte = [a.text].concat(a.teile.map((t) => (t.item ? t.item.frage + (t.item.loesung || '') + (t.item.optionen || []).join(' ') : t.erkl.frage + t.erkl.muster)));
      texte.forEach((x) => {
        const ohne = String(x).replace(/<[^>]*>/g, ' ');
        ok(!/\d\.\d/.test(ohne), 'Seed ' + s + ': Dezimalpunkt in „' + ohne.slice(0, 80) + '“');
        ok(!/m\/s2|m\/s\^2/.test(ohne), 'Seed ' + s + ': m/s² falsch geschrieben');
        ok(!/ -\d/.test(ohne), 'Seed ' + s + ': Minus als Bindestrich');
      });
    });
  });
});

fertig('pruefung');
