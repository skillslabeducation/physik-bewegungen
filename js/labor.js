/* Labor: Bewegungs-Simulator. Ein Fahrzeug (oder zwei) auf einer Strecke, Regler, live s(t), v(t) und a(t).
   Reine Physik in zustand() (in Node testbar), Anzeige in mount(). Beim Bremsen bleibt das Fahrzeug bei v = 0 stehen.
   prefers-reduced-motion: keine Animation, Graphen ganz gezeichnet, Zeitpunkt über einen Regler. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };
  var s = function () { return W.s.apply(null, arguments); };
  function fmt(x, st) { return W.physik.fmt(x, st); }
  function rund(x) { return Math.round(x * 1e6) / 1e6; }

  function R(key, label, einheit, min, max, schritt, wert, hinweis) {
    return { key: key, label: label, einheit: einheit, min: min, max: max, schritt: schritt, wert: wert, hinweis: hinweis || '' };
  }

  var PRESETS = ['gleichfoermig', 'anfahren', 'bremsen', 'fall', 'einholen'];
  var DEF = {
    gleichfoermig: {
      titel: 'Gleichförmig', fahrzeuge: ['auto'], namen: ['Auto'],
      text: 'Ein Auto fährt mit konstanter Geschwindigkeit: a = 0, s = v·t.',
      regler: [R('v', 'Geschwindigkeit v', 'm/s', 1, 30, 0.5, 10)]
    },
    anfahren: {
      titel: 'Anfahren', fahrzeuge: ['zug'], namen: ['Zug'],
      text: 'Ein Zug fährt aus dem Stand gleichmäßig beschleunigt an: v = a·t, s = a/2·t².',
      regler: [R('a', 'Beschleunigung a', 'm/s²', 0.1, 1.5, 0.1, 0.5)]
    },
    bremsen: {
      titel: 'Bremsen', fahrzeuge: ['ebike'], namen: ['E-Bike'],
      text: 'Ein E-Bike bremst gleichmäßig bis zum Stillstand: v = v₀ − a·t, s = v₀·t − a/2·t². Der Regler stellt den Betrag a ein, die Beschleunigung selbst ist negativ.',
      regler: [R('v0', 'Anfangsgeschwindigkeit v₀', 'm/s', 1, 12.5, 0.5, 9), R('a', 'Bremsbeschleunigung a (Betrag)', 'm/s²', 0.5, 7, 0.5, 4.5)]
    },
    fall: {
      titel: 'Freier Fall', fahrzeuge: ['stein'], namen: ['Stein'],
      text: 'Ein Stein fällt aus der Ruhe, ohne Luftwiderstand: a = g, v = g·t, s = g/2·t².',
      regler: [R('h', 'Fallhöhe h', 'm', 1, 100, 1, 20), R('g', 'Fallbeschleunigung g', 'm/s²', 1.62, 9.81, 0.01, 9.81, 'Mond 1,62 (Aufgabe Tafel: 1,84)')]
    },
    einholen: {
      titel: 'Einholen', fahrzeuge: ['ebike', 'ebike'], namen: ['E-Bike 1', 'E-Bike 2'],
      text: 'E-Bike 1 fährt gleichförmig. E-Bike 2 startet im selben Moment daneben aus dem Stand und beschleunigt. Eingeholt ist es, wenn s₁(t) = s₂(t).',
      regler: [R('v1', 'Geschwindigkeit v₁', 'm/s', 1, 7, 0.01, 4.67), R('a2', 'Beschleunigung a₂', 'm/s²', 0.2, 2, 0.01, 1.56)]
    }
  };

  function preset(p) { return DEF[p] || null; }

  /** Reglerwerte mit Grundwerten auffüllen. */
  function werte(p, regler) {
    var o = {};
    DEF[p].regler.forEach(function (r) {
      var x = regler ? regler[r.key] : undefined;
      o[r.key] = typeof x === 'number' && isFinite(x) && x > 0 ? x : r.wert;
    });
    return o;
  }

  /** Einholen aus dem Stand neben einem gleichförmig fahrenden Fahrzeug: v₁·t = a₂/2·t² → t = 2v₁/a₂. */
  function treffpunkt(regler) {
    var w = werte('einholen', regler);
    var t = 2 * w.v1 / w.a2;
    return { t: t, s: w.v1 * t };
  }

  /** Zustand zur Zeit t: [{ s, v, a }] je Fahrzeug. */
  function zustand(p, regler, t) {
    var w = werte(p, regler);
    t = Math.max(0, t || 0);
    switch (p) {
      case 'gleichfoermig': return [{ s: w.v * t, v: w.v, a: 0 }];
      case 'anfahren': return [{ s: w.a / 2 * t * t, v: w.a * t, a: w.a }];
      case 'bremsen': {
        var ts = w.v0 / w.a;
        if (t > ts) return [{ s: w.v0 * w.v0 / (2 * w.a), v: 0, a: 0 }];   // steht, fährt nicht rückwärts
        return [{ s: w.v0 * t - w.a / 2 * t * t, v: w.v0 - w.a * t, a: -w.a }];
      }
      case 'fall': {
        var tf = Math.sqrt(2 * w.h / w.g);
        if (t > tf) return [{ s: w.h, v: 0, a: 0 }];   // liegt am Boden
        return [{ s: w.g / 2 * t * t, v: w.g * t, a: w.g }];
      }
      case 'einholen': return [{ s: w.v1 * t, v: w.v1, a: 0 }, { s: w.a2 / 2 * t * t, v: w.a2 * t, a: w.a2 }];
    }
    return [];
  }

  /** Simulierte Zeitspanne in s. */
  function dauer(p, regler) {
    var w = werte(p, regler);
    switch (p) {
      case 'gleichfoermig': return 10;
      case 'anfahren': return 20;
      case 'bremsen': return 1.25 * w.v0 / w.a;
      case 'fall': return Math.sqrt(2 * w.h / w.g);
      case 'einholen': return 1.25 * treffpunkt(w).t;
    }
    return 10;
  }

  /** Nachkommastellen der Anzeige: 2, unter 0,1 drei (Bremsweg 0,071 m statt 0,07 m). */
  function stellen(x) { return x !== 0 && Math.abs(x) < 0.1 ? 3 : 2; }
  function zahl(x) { return fmt(x, stellen(x)); }

  /** „= 2“ oder „≈ 5,99“ */
  function gleich(x) { var m = Math.pow(10, stellen(x)); return (Math.abs(Math.round(x * m) / m - x) > 1e-9 ? '≈ ' : '= ') + zahl(x); }

  /** Werte-Zeilen zur Zeit t: [['t = … s'], [Name:, 's = … m', 'v = … m/s', 'a = … m/s²'] …], Name nur bei zwei Fahrzeugen. */
  function zeilen(p, regler, t) {
    var zwei = DEF[p].fahrzeuge.length === 2;
    return [['t = ' + zahl(t) + ' s']].concat(zustand(p, regler, t).map(function (z, k) {
      return (zwei ? [DEF[p].namen[k] + ':'] : []).concat(['s = ' + zahl(z.s) + ' m', 'v = ' + zahl(z.v) + ' m/s', 'a = ' + zahl(z.a) + ' m/s²']);
    }));
  }

  /** Abspieltempo: Echtzeit bis 10 s, darüber ganzzahliger Zeitraffer (höchstens 10 s), unter 2 s Zeitlupe (mindestens 2 s). */
  function tempo(T) {
    if (T < 2) return 1 / Math.ceil(2 / T);
    return T <= 10 ? 1 : Math.ceil(T / 10);
  }
  function tempoText(k) {
    if (k > 1) return 'Zeitraffer: ' + k + '-fach';
    return k < 1 ? 'Zeitlupe: ' + Math.round(1 / k) + '-fach verlangsamt' : '';
  }

  /** Besonderer Moment (Stillstand, Aufprall, Treffpunkt) mit Text. */
  function ereignis(p, regler) {
    var w = werte(p, regler);
    if (p === 'bremsen') {
      var ts = w.v0 / w.a;
      return { t: ts, text: 'Stillstand nach t ' + gleich(ts) + ' s. Bremsweg s ' + gleich(w.v0 * w.v0 / (2 * w.a)) + ' m.' };
    }
    if (p === 'fall') {
      var tf = Math.sqrt(2 * w.h / w.g);
      return { t: tf, text: 'Aufprall nach t ' + gleich(tf) + ' s mit v ' + gleich(w.g * tf) + ' m/s.' };
    }
    if (p === 'einholen') {
      var tp = treffpunkt(w);
      return { t: tp.t, s: tp.s, text: 'Treffpunkt nach t ' + gleich(tp.t) + ' s bei s ' + gleich(tp.s) + ' m.' };
    }
    return null;
  }

  /** Achseneinteilung: Schritt 1, 2, 2,5 oder 5 mal Zehnerpotenz, höchstens fünf Schritte. */
  function skala(x) {
    if (!(x > 0)) x = 1;
    var roh = x / 5;
    var p = Math.pow(10, Math.floor(Math.log(roh) / Math.LN10));
    var f = [1, 2, 2.5, 5, 10], m = 10 * p;
    for (var i = 0; i < f.length; i++) if (f[i] * p >= roh * (1 - 1e-9)) { m = f[i] * p; break; }
    m = rund(m);
    return { max: rund(Math.ceil(x / m - 1e-9) * m), schritt: m };
  }

  /** Achsen für s, v, a aus den Werten über die ganze Dauer. */
  function achsen(p, regler, T) {
    var sMax = 0, vMax = 0, aMax = 0, aMin = 0;
    for (var i = 0; i <= 100; i++) {
      zustand(p, regler, T * i / 100).forEach(function (z) {
        sMax = Math.max(sMax, z.s); vMax = Math.max(vMax, z.v); aMax = Math.max(aMax, z.a); aMin = Math.min(aMin, z.a);
      });
    }
    var a;
    if (aMin < 0) { var k = skala(-aMin); a = { min: -k.max, max: k.schritt, schritt: k.schritt }; }
    else if (aMax > 0) a = skala(aMax);
    else a = { max: 1, schritt: 1 };
    return { t: skala(T), s: skala(sMax), v: skala(vMax), a: a };
  }

  var EINHEIT = { s: 'm', v: 'm/s', a: 'm/s²' };
  var INDEX = ['₁', '₂'];

  /** Punkte eines Graphen von 0 bis tBis; an Knicken (Stillstand) zusätzlich direkt davor und danach. */
  function punkte(p, regler, k, g, tBis, ev) {
    var n = 80, ts = [];
    for (var i = 0; i <= n; i++) ts.push(tBis * i / n);
    if (ev && ev.t < tBis) ts.push(ev.t, ev.t + 1e-6);
    ts.sort(function (x, y) { return x - y; });
    return ts.map(function (t) { return [t, zustand(p, regler, t)[k][g]]; });
  }

  /* ---------- Fahrzeuge (Front bei x = 0, Räder auf y = 0) ---------- */
  function fahrzeug(art, nr) {
    var g = s('g', { class: 'labor-fz' + (nr === 1 ? ' labor-fz--2' : '') });
    if (art === 'auto') {
      g.appendChild(s('path', { class: 'labor-fz__koerper', d: 'M-46 -6 L-46 -14 Q-46 -17 -43 -17 L-34 -17 L-27 -26 L-12 -26 L-5 -17 L-2 -17 Q0 -17 0 -14 L0 -6 Z' }));
      g.appendChild(s('path', { class: 'labor-fz__fenster', d: 'M-31 -18 L-26 -24 L-13 -24 L-8 -18 Z' }));
      [-36, -10].forEach(function (x) { g.appendChild(s('circle', { class: 'labor-fz__rad', cx: x, cy: -5, r: 5 })); });
    } else if (art === 'zug') {
      g.appendChild(s('path', { class: 'labor-fz__koerper', d: 'M-70 -6 L-70 -32 L-8 -32 Q0 -32 0 -22 L0 -6 Z' }));
      [-64, -50, -36, -22].forEach(function (x) { g.appendChild(s('rect', { class: 'labor-fz__fenster', x: x, y: -28, width: 10, height: 9, rx: 1.5 })); });
      g.appendChild(s('path', { class: 'labor-fz__fenster', d: 'M-10 -28 L-4 -28 Q-1 -27 -1 -20 L-10 -20 Z' }));
      [-60, -48, -20, -8].forEach(function (x) { g.appendChild(s('circle', { class: 'labor-fz__rad', cx: x, cy: -4, r: 4 })); });
    } else {
      // E-Bike mit Fahrer als Strichfigur
      [-30, -6].forEach(function (x) { g.appendChild(s('circle', { class: 'labor-fz__reifen', cx: x, cy: -8, r: 8 })); });
      g.appendChild(s('path', { class: 'labor-fz__rahmen', d: 'M-30 -8 L-21 -20 L-9 -20 L-6 -8 M-21 -20 L-18 -8 L-30 -8 M-18 -8 L-9 -20 M-23 -23 L-17 -23 M-9 -20 L-8 -27 L-4 -27' }));
      g.appendChild(s('rect', { class: 'labor-fz__koerper', x: -20, y: -17, width: 8, height: 4, rx: 1 }));
      g.appendChild(s('path', { class: 'labor-fz__rahmen', d: 'M-20 -24 L-15 -40 L-6 -28 M-15 -40 L-6 -32' }));
      g.appendChild(s('circle', { class: 'labor-fz__koerper', cx: -13, cy: -45, r: 4.5 }));
    }
    return g;
  }

  /* ---------- Strecke ---------- */
  function strecke(p, regler, T, ev) {
    var def = DEF[p];
    if (p === 'fall') return fallStrecke(regler, ev);
    var sEnde = 0;
    zustand(p, regler, T).forEach(function (z) { sEnde = Math.max(sEnde, z.s); });
    var sk = skala(sEnde);
    var B = 640, links = 78, rechts = 26, breite = B - links - rechts;
    var zwei = def.fahrzeuge.length === 2;
    var spuren = zwei ? [62, 122] : [70];
    var H = zwei ? 172 : 120, yS = H - 26;
    function x(sv) { return rund(links + sv / sk.max * breite); }
    var svg = s('svg', { class: 'labor__strecke', viewBox: '0 0 ' + B + ' ' + H, role: 'img', 'aria-label': 'Strecke: ' + def.namen.join(' und ') + ', Weg in m' });
    spuren.forEach(function (y) { svg.appendChild(s('line', { class: 'labor-strasse', x1: 8, y1: y + 1, x2: B - 8, y2: y + 1 })); });
    // Skala
    svg.appendChild(s('line', { class: 'labor-skala', x1: x(0), y1: yS, x2: x(sk.max), y2: yS }));
    for (var v = 0; v <= sk.max + 1e-9; v = rund(v + sk.schritt)) {
      svg.appendChild(s('line', { class: 'labor-skala', x1: x(v), y1: yS - 4, x2: x(v), y2: yS + 4 }));
      svg.appendChild(s('text', { class: 'labor-zahl', x: x(v), y: yS + 18, 'text-anchor': 'middle' }, fmt(v)));
    }
    svg.appendChild(s('text', { class: 'labor-zahl', x: x(sk.max) + 18, y: yS - 8, 'text-anchor': 'end' }, 's in m'));
    svg.appendChild(s('line', { class: 'labor-start', x1: x(0), y1: spuren[0] - 62, x2: x(0), y2: spuren[spuren.length - 1] + 8 }));
    // Bei zwei Fahrzeugen links der Startlinie, sonst läge die Nummer von Fahrzeug 1 darauf.
    svg.appendChild(s('text', { class: 'labor-zahl', x: zwei ? x(0) - 6 : x(0) + 6, y: spuren[0] - 50, 'text-anchor': zwei ? 'end' : 'start' }, p === 'bremsen' ? 'Bremsbeginn' : 'Start'));
    var spur = p === 'bremsen' ? s('line', { class: 'labor-spur', x1: x(0), y1: spuren[0], x2: x(0), y2: spuren[0] }) : null;
    if (spur) svg.appendChild(spur);
    var treff = null;
    if (p === 'einholen' && ev) {
      treff = s('g', { class: 'labor-treff', visibility: 'hidden' },
        s('line', { x1: x(ev.s), y1: spuren[0] - 44, x2: x(ev.s), y2: spuren[1] + 8 }),
        s('text', { class: 'labor-zahl labor-treff__text', x: x(ev.s), y: spuren[0] - 54, 'text-anchor': 'middle' }, 'Treffpunkt'));
      svg.appendChild(treff);
    }
    var fz = def.fahrzeuge.map(function (art, k) {
      var g = fahrzeug(art, zwei ? k : 0);
      if (zwei) g.appendChild(s('text', { class: 'labor-fz__nr', x: -17, y: -52, 'text-anchor': 'middle' }, String(k + 1)));
      svg.appendChild(g);
      return g;
    });
    return {
      svg: svg,
      setze: function (zst, t) {
        zst.forEach(function (z, k) { fz[k].setAttribute('transform', 'translate(' + x(z.s) + ' ' + spuren[k] + ')'); });
        if (spur) spur.setAttribute('x2', String(Math.max(x(0), x(zst[0].s) - 8)));
        if (treff) treff.setAttribute('visibility', t >= ev.t - 1e-9 ? 'visible' : 'hidden');
      }
    };
  }

  function fallStrecke(regler, ev) {
    var w = werte('fall', regler);
    var sk = skala(w.h);
    var oben = 30, unten = 222, H = 260;
    function y(sv) { return rund(oben + sv / w.h * (unten - oben)); }
    var svg = s('svg', { class: 'labor__strecke labor__strecke--fall', viewBox: '0 0 170 ' + H, role: 'img', 'aria-label': 'Fallstrecke des Steins, Höhe ' + fmt(w.h) + ' m' });
    svg.appendChild(s('line', { class: 'labor-skala', x1: 44, y1: y(0), x2: 44, y2: y(w.h) }));
    for (var v = 0; v <= w.h + 1e-9; v = rund(v + sk.schritt)) {
      svg.appendChild(s('line', { class: 'labor-skala', x1: 40, y1: y(v), x2: 48, y2: y(v) }));
      svg.appendChild(s('text', { class: 'labor-zahl', x: 36, y: y(v) + 4, 'text-anchor': 'end' }, fmt(v)));
    }
    svg.appendChild(s('text', { class: 'labor-zahl', x: 4, y: 16 }, 's in m'));
    svg.appendChild(s('line', { class: 'labor-start', x1: 66, y1: oben, x2: 118, y2: oben }));
    svg.appendChild(s('text', { class: 'labor-zahl', x: 122, y: oben + 4 }, 'Start'));
    svg.appendChild(s('rect', { class: 'labor-boden', x: 56, y: unten, width: 108, height: 12 }));
    svg.appendChild(s('text', { class: 'labor-zahl', x: 110, y: unten + 30, 'text-anchor': 'middle' }, 'Boden'));
    var stein = s('g', { class: 'labor-fz' }, s('path', { class: 'labor-fz__koerper', d: 'M-9 -2 L-6 -8 L1 -10 L8 -6 L9 1 L5 8 L-3 9 L-8 5 Z' }));
    svg.appendChild(stein);
    return {
      svg: svg,
      setze: function (zst) { stein.setAttribute('transform', 'translate(92 ' + rund(y(zst[0].s) - 10) + ')'); }
    };
  }

  /* ---------- Anzeige ---------- */
  function mount(el, p, opts) {
    opts = opts || {};
    if (PRESETS.indexOf(p) < 0) p = PRESETS[0];
    var def = DEF[p];
    var ruhig = W.reducedMotion ? W.reducedMotion() : false;
    var regler = {};
    def.regler.forEach(function (r) { regler[r.key] = r.wert; });
    var t = 0, T = 1, laeuft = false, raf = null, zuletzt = 0, zuletztGraph = 0, tempo = 1, ev = null, ax = null, bahn = null, ergebnisText = '';
    var zwei = def.fahrzeuge.length === 2;

    function reglerEl(r) {
      var wert = h('output', { class: 'regler__wert mono' });
      var inp = h('input', { type: 'range', min: String(r.min), max: String(r.max), step: String(r.schritt), value: String(r.wert), 'data-key': r.key });
      function text() { var x = +inp.value; wert.textContent = fmt(x) + ' ' + r.einheit; inp.setAttribute('aria-valuetext', fmt(x) + ' ' + r.einheit); }
      inp.addEventListener('input', function () { regler[r.key] = +inp.value; text(); neu(); });
      text();
      return h('label', { class: 'regler' }, h('span', { class: 'regler__kopf' }, h('span', null, r.label), wert), inp,
        r.hinweis ? h('span', { class: 'regler__hinweis' }, r.hinweis) : null);
    }

    var knopf = h('button', { type: 'button', class: 'btn btn--haupt labor__start', onclick: startPause }, 'Start');
    var zurueck = h('button', { type: 'button', class: 'btn labor__zurueck', onclick: zuruecksetzen }, 'Zurücksetzen');
    var raffer = h('span', { class: 'hinweis-klein labor__raffer' });
    var tWert = h('output', { class: 'regler__wert mono' });
    var tRegler = ruhig ? h('input', { type: 'range', min: '0', max: '1', step: '0.01', value: '1', class: 'labor__t' }) : null;
    if (tRegler) tRegler.addEventListener('input', function () { t = Math.min(T, Math.max(0, +tRegler.value)); zeichne(false); });
    var werteEl = h('div', { class: 'labor__werte mono' });
    var ergebnisEl = h('p', { class: 'labor__ergebnis', 'aria-live': 'polite' });
    var bahnHost = h('div', { class: 'labor__bahn' + (p === 'fall' ? ' labor__bahn--fall' : '') });
    var figuren = { s: h('figure', { class: 'abb labor__graph' }), v: h('figure', { class: 'abb labor__graph' }), a: h('figure', { class: 'abb labor__graph' }) };

    el.innerHTML = '';
    el.appendChild(h('div', { class: 'labor' + (p === 'fall' ? ' labor--fall' : ''), 'data-preset': p },
      h('p', { class: 'labor__text' }, def.text),
      h('div', { class: 'labor__regler' }, def.regler.map(reglerEl)),
      ruhig
        ? h('label', { class: 'regler labor__zeit' }, h('span', { class: 'regler__kopf' }, h('span', null, 'Zeitpunkt t'), tWert), tRegler)
        : h('div', { class: 'labor__steuer' }, knopf, zurueck, raffer),
      bahnHost, h('div', { class: 'labor__anzeige' }, werteEl, ergebnisEl),
      h('div', { class: 'labor__graphen' }, figuren.s, figuren.v, figuren.a),
      zwei ? h('p', { class: 'hinweis-klein' }, 'In den Graphen: durchgezogen ' + def.namen[0] + ', gestrichelt ' + def.namen[1] + ' (auf der Strecke grün).') : null,
      ruhig ? h('p', { class: 'hinweis-klein' }, 'Ohne Animation, weil „Bewegung reduzieren“ eingestellt ist: Die Graphen sind ganz gezeichnet, den Zeitpunkt wählst du mit dem Regler t.') : null,
      opts.eingebettet ? h('p', { class: 'hinweis-klein labor__mehr' }, h('a', { href: '#/labor/' + p }, 'Im Labor öffnen →')) : null));

    function stop() {
      laeuft = false;
      if (raf != null && window.cancelAnimationFrame) window.cancelAnimationFrame(raf);
      raf = null;
    }

    /** Nach jeder Regleränderung: Dauer, Achsen und Strecke neu, Zeit auf Anfang (ohne Animation: auf Ende). */
    function neu() {
      stop();
      T = dauer(p, regler);
      ev = ereignis(p, regler);
      ax = achsen(p, regler, T);
      tempo = W.labor.tempo(T);
      t = ruhig ? T : 0;
      bahn = strecke(p, regler, T, ev);
      bahnHost.innerHTML = '';
      bahnHost.appendChild(bahn.svg);
      knopf.textContent = 'Start';
      raffer.textContent = tempoText(tempo);
      if (tRegler) { tRegler.max = String(T); tRegler.step = String(T / 100); tRegler.value = String(T); }
      zeichne(true);
    }

    function graph(g, zst) {
      var tBis = ruhig ? T : t;
      var kurven = [];
      // Beschriftung erst, wenn die Kurve weit genug rechts ist: sonst läge sie auf den Zahlen der Hochachse.
      var mitLabel = tBis >= 0.22 * ax.t.max;
      def.fahrzeuge.forEach(function (f, k) {
        var pts = punkte(p, regler, k, g, tBis, ev), label = mitLabel ? g + (zwei ? INDEX[k] : '') + '(t)' : false;
        if (p === 'bremsen' && g === 'a' && tBis > ev.t) {
          // Kein senkrechter Strich beim Stillstand: Bremsphase und Stehen als zwei Stücke.
          kurven.push({ punkte: pts.filter(function (q) { return q[0] <= ev.t; }), farbe: g, label: label });
          kurven.push({ punkte: pts.filter(function (q) { return q[0] > ev.t; }), farbe: g, label: false });
        } else kurven.push({ punkte: pts, farbe: g, label: label });
      });
      var marken = zst.map(function (z) { return [t, z[g]]; });
      if (p === 'einholen' && g === 's' && t >= ev.t - 1e-9) marken.push([ev.t, ev.s]);
      var y = ax[g];
      var svg = W.diagramm.zeichne({
        achsen: { x: { g: 't', e: 's', max: ax.t.max, schritt: ax.t.schritt }, y: { g: g, e: EINHEIT[g], min: y.min, max: y.max, schritt: y.schritt } },
        kurven: kurven, marken: marken, klein: true
      });
      if (zwei) {
        var pf = svg.querySelectorAll('.dia-kurve'), lb = svg.querySelectorAll('.dia-label');
        if (pf[1]) pf[1].classList.add('labor-kurve--2');
        // Beschriftungen, die übereinander lägen, auseinanderziehen.
        if (lb.length === 2) {
          var y0 = +lb[0].getAttribute('y'), y1 = +lb[1].getAttribute('y');
          if (Math.abs(y0 - y1) < 15) lb[y0 <= y1 ? 1 : 0].setAttribute('y', String(Math.min(y0, y1) + 16));
        }
      }
      figuren[g].innerHTML = '';
      figuren[g].appendChild(svg);
    }

    /** Alle drei Graphen im selben Maßstab (gleiche Schriftgröße), höchstens in Originalgröße. */
    function gleichGross() {
      var svgs = ['s', 'v', 'a'].map(function (g) { return figuren[g].querySelector('svg'); });
      var breiten = svgs.map(function (sv) { return +sv.getAttribute('viewBox').split(' ')[2]; });
      var platz = figuren.s.clientWidth - 14;
      var k = platz > 0 ? Math.min(1, platz / Math.max.apply(null, breiten)) : 1;
      svgs.forEach(function (sv, i) { sv.style.width = Math.floor(breiten[i] * k) + 'px'; });
    }

    function zeichne(mitGraphen) {
      var zst = zustand(p, regler, t);
      bahn.setze(zst, t);
      werteEl.innerHTML = '';
      zeilen(p, regler, t).forEach(function (z, k) {
        werteEl.appendChild(h('div', { class: 'labor__zeile' }, z.map(function (x, i) { return h('span', { class: k && zwei && !i ? 'labor__name' : null }, x); })));
      });
      var text = ev && t >= ev.t - 1e-9 ? ev.text : '';
      if (text !== ergebnisText) { ergebnisText = text; ergebnisEl.textContent = text; }
      if (tRegler) tWert.textContent = zahl(t) + ' s';
      if (mitGraphen) { ['s', 'v', 'a'].forEach(function (g) { graph(g, zst); }); gleichGross(); }
    }

    function schritt(jetzt) {
      if (!laeuft) return;
      if (!document.body.contains(el)) { stop(); return; }
      var dt = Math.min(0.1, Math.max(0, (jetzt - zuletzt) / 1000));
      zuletzt = jetzt;
      t = Math.min(T, t + dt * tempo);
      var fertig = t >= T;
      var mitGraphen = fertig || jetzt - zuletztGraph > 50;
      if (mitGraphen) zuletztGraph = jetzt;
      zeichne(mitGraphen);
      if (fertig) { stop(); knopf.textContent = 'Nochmal'; }
      else raf = window.requestAnimationFrame(schritt);
    }

    function startPause() {
      if (laeuft) { stop(); knopf.textContent = 'Weiter'; return; }
      if (t >= T) t = 0;
      laeuft = true;
      knopf.textContent = 'Pause';
      zuletzt = window.performance ? window.performance.now() : Date.now();
      raf = window.requestAnimationFrame(schritt);
    }

    function zuruecksetzen() {
      stop();
      t = 0;
      knopf.textContent = 'Start';
      zeichne(true);
    }

    neu();
    return { stop: stop, zustand: function () { return zustand(p, regler, t); }, zeit: function () { return t; } };
  }

  W.labor = {
    PRESETS: PRESETS, preset: preset, zustand: zustand, dauer: dauer, treffpunkt: treffpunkt,
    ereignis: ereignis, skala: skala, zahl: zahl, zeilen: zeilen, tempo: tempo, tempoText: tempoText, mount: mount
  };
})();
