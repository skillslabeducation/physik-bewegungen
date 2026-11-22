/* Reine Spiellogik: Aktenstatus, Rang, Note. Ohne DOM, ohne Datum. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});

  W.akten = W.akten || [];

  var QUOTE = 0.8;
  var ERKL_OK = 0.6;

  /** Status einer Akte: neu, offen, geschlossen oder folgt (Platzhalter). */
  function akteStatus(akte, data) {
    if (akte.folgt) return { status: 'folgt', quote: 0, gutachten: false, fehlt: [] };
    var items = data.items || {};
    var pflicht = (akte.ueben || []).filter(function (u) { return !u.plus; });
    var richtig = pflicht.filter(function (u) { return items[u.id] && items[u.id].ok; }).length;
    var quote = pflicht.length ? richtig / pflicht.length : 1;
    var fehlt = [];
    var noetig = Math.ceil(QUOTE * pflicht.length - 1e-9) - richtig;
    if (noetig > 0) fehlt.push('Noch ' + noetig + (noetig === 1 ? ' Übung' : ' Übungen') + ' richtig lösen');
    var gutachten = !!(data.abschluss && data.abschluss[akte.id]);
    if (!gutachten) fehlt.push('Gutachten');
    var geschlossen = gutachten && quote >= QUOTE - 1e-9;
    var angefasst = (data.karten && data.karten[akte.id] != null) ||
      (akte.ueben || []).concat(akte.gutachten || []).some(function (u) { return items[u.id]; }) ||
      (akte.erklaeren || []).some(function (e) { return data.erkl && data.erkl[e.id]; }) || gutachten;
    return {
      status: geschlossen ? 'geschlossen' : angefasst ? 'offen' : 'neu',
      quote: quote, gutachten: gutachten, fehlt: geschlossen ? [] : fehlt
    };
  }

  function geschlossenAnzahl(data, akten) {
    return akten.filter(function (a) { return akteStatus(a, data).status === 'geschlossen'; }).length;
  }

  function rang(data, akten) {
    var n = geschlossenAnzahl(data, akten);
    var best = (data.pruefung && data.pruefung.best) || {};
    if (n >= 5 && best['1'] >= 0.8) return { titel: 'Sachverständiger', naechster: null, geschlossen: n };
    if (n >= 5) return { titel: 'Gutachter', naechster: 'Sachverständiger: Prüfung mit mindestens 80 %', geschlossen: n };
    if (n >= 2) return { titel: 'Junior-Gutachter', naechster: 'Gutachter: 5 Akten schließen', geschlossen: n };
    return { titel: 'Praktikant', naechster: 'Junior-Gutachter: 2 Akten schließen', geschlossen: n };
  }

  /** Richtwert-Note aus Prozent. */
  function note(prozent) {
    if (prozent >= 87.5) return 1;
    if (prozent >= 72.5) return 2;
    if (prozent >= 57.5) return 3;
    if (prozent >= 45) return 4;
    if (prozent >= 20) return 5;
    return 6;
  }

  /** Anteil × Punkte, auf halbe Punkte abgerundet. */
  function punkteRunden(anteil, punkte) {
    return Math.floor(anteil * punkte * 2 + 1e-9) / 2;
  }

  W.logic = {
    akteStatus: akteStatus, rang: rang, note: note, punkteRunden: punkteRunden, ERKL_OK: ERKL_OK
  };
})();
