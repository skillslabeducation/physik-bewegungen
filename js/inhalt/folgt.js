/* Die neun Akten des Gutachterbüros (feste Liste) und Platzhalter für Akten, deren Inhalt noch folgt.
   Eine Inhaltsdatei, die ihre Akte mit derselben id in W.akten schiebt, ersetzt den Platzhalter. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  W.akten = W.akten || [];

  W.AKTEN_LISTE = [
    { id: 'einheiten', nr: 0, titel: 'Größen, Einheiten und Formeln umstellen', fall: 'Erster Tag im Büro: Wie lange zu Fuß nach Wladiwostok?' },
    { id: 'mittel', nr: 1, titel: 'Mittlere Geschwindigkeit', fall: 'Lkw im Elbtunnel: „Ich war nicht zu schnell.“' },
    { id: 'gleichfoermig', nr: 2, titel: 'Gleichförmige Bewegung', fall: 'Güterzug auf der Hafenbahn' },
    { id: 'beschleunigt', nr: 3, titel: 'Gleichmäßig beschleunigte Bewegung', fall: 'Anfahrender Personenzug' },
    { id: 'diagramme', nr: 4, titel: 'Diagramme: s(t), v(t) und a(t)', fall: 'Fahrtenschreiber eines ICE' },
    { id: 'messdaten', nr: 5, titel: 'Messtabellen auswerten', fall: 'Alibi per Lauf-App' },
    { id: 'einholen', nr: 6, titel: 'Einholen und Treffpunkt', fall: 'Zwei E-Bikes an der Ampel' },
    { id: 'bremsen', nr: 7, titel: 'Bremsen', fall: 'Beinahe-Unfall auf dem Radweg' },
    { id: 'fall', nr: 8, titel: 'Freier Fall', fall: 'Sprung vom 5-m-Brett' }
  ];

  /** Platzhalter einer Akte aus der Liste: { id, nr, titel, fall, folgt: true }. */
  W.aktePlatzhalter = function (id) {
    var e = W.AKTEN_LISTE.filter(function (a) { return a.id === id; })[0];
    return e ? { id: e.id, nr: e.nr, titel: e.titel, fall: e.fall, folgt: true } : null;
  };

  // Etappe 2: Einheiten, mittlere Geschwindigkeit, Diagramme.
  ['einheiten', 'mittel', 'diagramme'].forEach(function (id) { W.akten.push(W.aktePlatzhalter(id)); });
})();
