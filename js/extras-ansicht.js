/* Nebenseiten: Formelkarte (Inhalt folgt), Radarfalle und Labor (Etappe 2). */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };

  /** Seite für etwas, das noch kommt: Titel, ein Satz, zurück zum Aktenschrank. */
  function folgt(host, titel, text) {
    host.appendChild(h('div', { class: 'seite' },
      h('div', { class: 'seitenkopf' }, h('p', { class: 'seitenkopf__ort mono' }, 'Folgt'), h('h1', null, titel)),
      W.ansichten.karte('', h('p', null, text),
        h('div', { class: 'aktionen' }, h('a', { href: '#/', class: 'btn btn--haupt' }, 'Zum Aktenschrank')))));
  }

  W.extras = {
    folgt: folgt,
    formelkarte: function (host) {
      folgt(host, 'Formelkarte', 'Die Formelkarte folgt: alle Formeln mit Umstellungen, km/h und m/s, die drei Bewegungsarten mit ihren Graphen und das Rechenweg-Schema auf einer A4-Seite zum Drucken.');
    },
    radarfalle: function (host) {
      folgt(host, 'Radarfalle', 'Die Radarfalle folgt: 60 Sekunden „stimmt“ oder „stimmt nicht“ zu allen Themen, mit Bestwert.');
    },
    labor: function (host) {
      folgt(host, 'Labor', 'Das Labor folgt: ein Fahrzeug auf der Strecke, Regler für v₀ und a, dazu live s(t), v(t) und a(t).');
    }
  };
})();
