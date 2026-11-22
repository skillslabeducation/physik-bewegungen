/* Erklär-Training: tippen oder auf Papier schreiben, Fachbegriff-Radar, Erwartungshorizont zum Abhaken, Musterantwort. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };

  var BAUSTEINE = ['Das liegt daran, dass …', 'Dadurch …', 'Deshalb …', 'Im Gegensatz zu …', 'Zuerst … danach …', 'Das bedeutet, dass …'];

  function summe(punkte) { return punkte.reduce(function (s, p) { return s + p.p; }, 0); }
  function pText(p) { return String(p).replace('.', ',') + (p === 1 ? ' Punkt' : ' Punkte'); }

  /** host: Element. erkl: Erkl-Objekt. opts: { onFertig(prozent), speichern: true, modus: 'ueben'|'pruefung', text } */
  function render(host, erkl, opts) {
    opts = opts || {};
    var modus = null;
    var text = opts.text != null ? opts.text : W.state.erklText(erkl.id);

    function kopf() {
      return h('div', { class: 'erkl__kopf' },
        erkl.plus ? h('span', { class: 'tag tag--plus' }, 'Plus') : null,
        h('div', { class: 'frage', html: erkl.frage }),
        erkl.abb && W.diagramm ? h('figure', { class: 'abb' }, W.diagramm.zeichne(erkl.abb)) : null,
        h('p', { class: 'hinweis-klein' }, 'Erwartet: ' + pText(summe(erkl.punkte)) + '. Schreib in ganzen Sätzen und benutze Fachbegriffe.'));
    }

    function start() {
      host.innerHTML = '';
      var tipp = erkl.tipp ? h('details', { class: 'tipp' }, h('summary', null, 'Tipp'), h('p', null, erkl.tipp)) : null;
      var bausteine = h('details', { class: 'tipp' }, h('summary', null, 'Satzbausteine'), h('ul', { class: 'bausteine' }, BAUSTEINE.map(function (b) { return h('li', null, b); })));
      host.appendChild(h('div', { class: 'erkl' }, kopf(), tipp, bausteine,
        h('p', { class: 'hinweis-klein' }, 'In der Arbeit schreibst du von Hand. Papier ist das beste Training.'),
        h('div', { class: 'aktionen aktionen--zwei' },
          h('button', { type: 'button', class: 'btn', onclick: function () { modus = 'papier'; papier(); } }, 'Auf Papier'),
          h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { modus = 'tippen'; tippen(); } }, 'Hier tippen'))));
    }

    function tippen() {
      host.innerHTML = '';
      var ta = h('textarea', { class: 'erkl__text', rows: '7', placeholder: 'Deine Erklärung …', spellcheck: 'true' });
      ta.value = text;
      ta.addEventListener('input', function () { text = ta.value; if (opts.speichern !== false) W.state.erklEntwurf(erkl.id, ta.value); });
      host.appendChild(h('div', { class: 'erkl' }, kopf(), ta,
        h('div', { class: 'aktionen' },
          h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { text = ta.value; bewerten(); } }, 'Fertig, vergleichen'))));
      ta.focus();
    }

    function papier() {
      host.innerHTML = '';
      host.appendChild(h('div', { class: 'erkl' }, kopf(),
        h('div', { class: 'papier' }, h('p', null, 'Schreib deine Antwort jetzt auf ein Blatt. Erst wenn du fertig bist, vergleichst du mit dem Erwartungshorizont.')),
        h('div', { class: 'aktionen' },
          h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { bewerten(); } }, 'Fertig, vergleichen'))));
    }

    function bewerten() {
      host.innerHTML = '';
      var haken = [];
      var radar = modus === 'tippen' && text.trim() ? W.text.radar(text, erkl.begriffe) : null;
      var max = summe(erkl.punkte);
      var anzeige = h('span', { class: 'mono' }, '0 / ' + String(max).replace('.', ','));
      function neu() {
        var s = haken.reduce(function (a, i) { return a + erkl.punkte[i].p; }, 0);
        anzeige.textContent = String(s).replace('.', ',') + ' / ' + String(max).replace('.', ',');
      }
      var liste = h('ul', { class: 'check' }, erkl.punkte.map(function (p, i) {
        var b = h('button', { type: 'button', class: 'check__punkt', 'aria-pressed': 'false', onclick: function () {
          var k = haken.indexOf(i);
          if (k >= 0) haken.splice(k, 1); else haken.push(i);
          b.classList.toggle('an', k < 0);
          b.setAttribute('aria-pressed', k < 0 ? 'true' : 'false');
          neu();
        } }, h('span', { class: 'check__box' }), h('span', { class: 'check__text' }, p.text), h('span', { class: 'check__p mono' }, String(p.p).replace('.', ',') + ' P.'));
        return h('li', null, b);
      }));
      host.appendChild(h('div', { class: 'erkl' }, kopf(),
        modus === 'tippen' && text.trim() ? h('blockquote', { class: 'erkl__eigen' }, text) : null,
        radar ? h('div', { class: 'radar' }, h('p', { class: 'radar__titel' }, 'Fachbegriff-Radar'),
          h('div', { class: 'chips' }, radar.map(function (r) { return h('span', { class: 'chip-klein ' + (r.gefunden ? 'chip-klein--an' : '') }, (r.gefunden ? '✓ ' : '· ') + r.name); })),
          h('p', { class: 'hinweis-klein' }, 'Nur ein Hinweis: Grün heißt, das Wort kommt vor, nicht, dass der Satz stimmt.')) : null,
        h('div', { class: 'horizont' }, h('p', { class: 'horizont__titel' }, 'Erwartungshorizont ', anzeige),
          h('p', { class: 'hinweis-klein' }, 'Hake ehrlich ab, was in deiner Antwort sinngemäß und fachlich richtig vorkommt.'), liste),
        h('details', { class: 'muster', open: modus === 'papier' }, h('summary', null, 'Musterantwort'), h('p', { html: erkl.muster })),
        h('div', { class: 'aktionen' }, h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { speichern(haken, max); } }, 'Bewertung speichern'))));
    }

    function speichern(haken, max) {
      var s = haken.reduce(function (a, i) { return a + erkl.punkte[i].p; }, 0);
      var prozent = max ? s / max : 0;
      if (opts.speichern !== false) W.state.erklSpeichern(erkl.id, { text: text, haken: haken, prozent: prozent });
      if (opts.direkt) { opts.onFertig(prozent, haken, text); return; }
      host.innerHTML = '';
      var gut = prozent >= W.logic.ERKL_OK;
      host.appendChild(h('div', { class: 'erkl erkl--ende' },
        h('p', { class: 'ergebnis mono' }, String(s).replace('.', ',') + ' / ' + String(max).replace('.', ',')),
        h('p', null, gut ? (prozent >= 0.99 ? 'Vollständig. So sieht eine Antwort für volle Punkte aus.' : 'Reicht für den Fall. Für volle Punkte schau dir an, was gefehlt hat.')
          : 'Noch zu dünn. Die Aufgabe kommt in die Nachermittlung. Lies die Musterantwort und schreib sie später noch einmal mit eigenen Worten.'),
        h('div', { class: 'aktionen aktionen--zwei' },
          h('button', { type: 'button', class: 'btn', onclick: start }, 'Nochmal schreiben'),
          h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { if (opts.onFertig) opts.onFertig(prozent); } }, 'Fertig'))));
    }

    if (opts.sofortBewerten) { modus = opts.modus || 'tippen'; bewerten(); } else start();
  }

  W.erklaeren = { render: render, summe: summe };
})();
