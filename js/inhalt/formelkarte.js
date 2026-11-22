/* Formelkarte: Spickzettel auf einer A4-Seite. Reiner Inhalt, die Seite baut W.formelkarte.erzeuge(). */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };

  var SPALTEN = [
    {
      id: 'gleich', titel: 'Gleichförmige Bewegung', kern: 'a = 0, v = konst',
      formeln: ['v = s/t', 's = v·t', 't = s/v', 's = s₀ + v·t  (wenn s nicht bei 0 startet)'],
      graphen: [['s-gleich', 'Ursprungsgerade, Steigung v'], ['v-gleich', 'waagerecht'], ['a-gleich', 'a = 0, auf der t-Achse']]
    },
    {
      id: 'beschl', titel: 'Beschleunigen aus dem Stand', kern: 'a = Δv/Δt = konst',
      formeln: ['v = a·t', 's = a/2·t²', 'a = v/t', 't = v/a', 'a = 2s/t²', 't = √(2s/a)'],
      graphen: [['s-beschl', 'Halbparabel nach oben'], ['v-beschl', 'Ursprungsgerade, Steigung a'], ['a-beschl', 'waagerecht']]
    },
    {
      id: 'brems', titel: 'Gleichmäßig bremsen', kern: 'a ist hier der Betrag',
      formeln: ['v = v₀ − a·t', 's = v₀·t − a/2·t²'],
      graphen: [['s-brems', 'Parabel nach unten bis zum Scheitel'], ['v-brems', 'fallende Gerade bis 0'], ['a-brems', 'waagerecht unter der t-Achse']],
      hinweis: 'Die Beschleunigung selbst ist negativ, zum Beispiel a = −4,5 m/s². In den Formeln steht der Betrag 4,5 m/s², das Minus steckt im „−“ davor.'
    }
  ];

  var SCHEMA = ['Gegeben', 'Gesucht', 'Formel', 'Umstellen', 'Einsetzen', 'Ergebnis', 'Antwortsatz'];

  function spalte(sp) {
    return h('section', { class: 'fk-spalte fk-spalte--' + sp.id },
      h('h2', { class: 'fk-titel' }, sp.titel),
      h('p', { class: 'fk-kern mono' }, sp.kern),
      h('ul', { class: 'fk-formeln mono' }, sp.formeln.map(function (f) { return h('li', null, f); })),
      sp.hinweis ? h('p', { class: 'fk-hinweis' }, sp.hinweis) : null,
      h('div', { class: 'fk-graphen' }, sp.graphen.map(function (g) {
        return h('figure', { class: 'fk-graph' }, h('div', { html: W.diagramm.mini(g[0]) }), h('figcaption', null, g[1]));
      })));
  }

  function kasten(titel, kind) {
    return h('section', { class: 'fk-kasten' }, h('h2', { class: 'fk-titel' }, titel), kind);
  }

  function erzeuge() {
    return h('article', { class: 'formelkarte' },
      h('header', { class: 'fk-kopf' },
        h('h1', null, 'Formelkarte'),
        h('p', { class: 'fk-unter' }, 'Bewegungen: Geschwindigkeit und Beschleunigung. s in m, t in s, v in m/s, a in m/s².')),
      h('div', { class: 'fk-spalten' }, SPALTEN.map(spalte)),
      h('div', { class: 'fk-unten' },
        kasten('km/h und m/s', h('p', { class: 'mono' }, 'km/h → m/s: geteilt durch 3,6', h('br'), 'm/s → km/h: mal 3,6', h('br'), '36 km/h = 10 m/s')),
        kasten('Freier Fall', h('p', { class: 'mono' }, 'a = g = 9,81 m/s²', h('br'), 'v = g·t, s = g/2·t²')),
        kasten('Umstellen', h('p', null, 'Seitentausch mit dem Rechenzeichen am Strich: ', h('span', { class: 'mono' }, 'v = a·t  | :a  →  t = v/a'))),
        kasten('Mittelwerte', h('p', { class: 'mono' }, 'v̄ = Δs/Δt', h('br'), 'ā = Δv/Δt')),
        kasten('Mittelpunkt-Regel',
          h('p', null, 'Die mittlere Geschwindigkeit zwischen zwei Messungen gehört zur Mitte des Zeitintervalls: ', h('span', { class: 'mono' }, 't₁₂ = (t₁ + t₂)/2'),
            '. Die mittlere Beschleunigung aus zwei solchen Geschwindigkeiten gehört zur Mitte zwischen deren Zeitpunkten. Aus n Messwerten werden n−1 Geschwindigkeiten und n−2 Beschleunigungen.')),
        kasten('Rechenweg', h('ol', { class: 'fk-schema' }, SCHEMA.map(function (s) { return h('li', null, s); })))),
      h('div', { class: 'aktionen nicht-drucken' },
        h('button', { type: 'button', class: 'btn btn--haupt', onclick: function () { window.print(); } }, 'Drucken'),
        h('a', { href: '#/', class: 'btn' }, 'Zum Aktenschrank')));
  }

  W.formelkarte = { erzeuge: erzeuge, SPALTEN: SPALTEN, SCHEMA: SCHEMA };
})();
