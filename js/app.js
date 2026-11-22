/* Start, Router (Hash), Kopfzeile mit Bremsspur und Namensschild, Navigation. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var h = function () { return W.h.apply(null, arguments); };

  var NAV = [['#/', 'Akten', 'akten'], ['#/nachermittlung', 'Nachermittlung', 'nachermittlung'], ['#/pruefung', 'Prüfung', 'pruefung'], ['#/formelkarte', 'Formelkarte', 'formelkarte']];

  /** Zwei parallele Bremsspuren, die nach rechts kräftiger werden. */
  function spurSvg() {
    return W.frag('<svg class="spur" viewBox="0 0 64 24" aria-hidden="true"><defs><linearGradient id="spur-verlauf" x1="0" x2="1" y1="0" y2="0">' +
      '<stop offset="0" stop-color="currentColor" stop-opacity=".12"/><stop offset="1" stop-color="currentColor" stop-opacity="1"/></linearGradient></defs>' +
      '<path d="M2 8.5 C 22 8, 40 7.2, 58 7" stroke="url(#spur-verlauf)" stroke-width="4.2" stroke-linecap="round" fill="none"/>' +
      '<path d="M2 17.5 C 22 17, 40 16.2, 58 16" stroke="url(#spur-verlauf)" stroke-width="4.2" stroke-linecap="round" fill="none"/></svg>');
  }

  function kopf() {
    var el = document.getElementById('kopf');
    if (!el) return;
    var d = W.state.data;
    var rang = W.logic.rang(d, W.ansichten.akten());
    el.innerHTML = '';
    el.appendChild(h('div', { class: 'kopf__innen' },
      h('a', { href: '#/', class: 'marke', 'aria-label': 'Bremsspur, zum Aktenschrank' }, spurSvg(),
        h('span', { class: 'marke__text' }, h('span', { class: 'marke__name mono' }, 'BREMSSPUR'), h('span', { class: 'marke__zusatz' }, 'Gutachterbüro'))),
      h('nav', { class: 'nav', id: 'nav', 'aria-label': 'Hauptnavigation' }),
      h('a', { href: '#/einstellungen', class: 'schild', 'aria-label': 'Namensschild und Einstellungen' },
        h('span', { class: 'schild__name' }, d.name || 'Namensschild'),
        h('span', { class: 'schild__rang' }, rang.titel))));
    nav(aktivAus(route()));
  }

  function nav(aktiv) {
    var el = document.getElementById('nav');
    if (!el) return;
    var nm = W.ansichten.nmAnzahl();
    el.innerHTML = '';
    NAV.forEach(function (n) {
      el.appendChild(h('a', { href: n[0], class: 'nav__punkt' + (aktiv === n[2] ? ' nav__punkt--an' : ''), 'aria-current': aktiv === n[2] ? 'page' : null },
        h('span', null, n[1]), n[2] === 'nachermittlung' && nm ? h('span', { class: 'nav__zahl mono', 'aria-label': nm + ' offen' }, String(nm)) : null));
    });
  }

  function route() {
    var teile = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
    return { name: teile[0] || 'akten', args: teile.slice(1) };
  }
  function aktivAus(r) { return r.name === 'akte' ? 'akten' : r.name; }

  function zeige() {
    var r = route();
    var main = document.getElementById('inhalt');
    main.innerHTML = '';
    try {
      kopf();
      switch (r.name) {
        case 'akte': W.ansichten.akte(main, r.args[0], r.args[1]); break;
        case 'nachermittlung': W.ansichten.nachermittlung(main); break;
        case 'einstellungen': W.ansichten.einstellungen(main); break;
        case 'pruefung':
          if (W.pruefungAnsicht && W.pruefung && W.pruefung.erzeuge) W.pruefungAnsicht(main, r.args);
          else W.extras.folgt(main, 'Sachverständigenprüfung', 'Prüfung folgt. 45 Minuten, zwei große Aufgaben wie auf den Blättern, bei jedem Start neue Zahlen.');
          break;
        case 'formelkarte': W.extras.formelkarte(main); break;
        case 'radarfalle': W.extras.radarfalle(main); break;
        case 'labor': W.extras.labor(main, r.args); break;
        default: W.ansichten.aktenschrank(main);
      }
    } catch (e) {
      main.appendChild(h('div', { class: 'seite' }, h('p', null, 'Hier ist etwas schiefgegangen. '), h('a', { href: '#/' }, 'Zurück zum Aktenschrank')));
      if (window.console) console.error(e);
    }
    window.scrollTo(0, 0);
  }

  W.app = { zeige: zeige, kopf: kopf };

  function start() {
    W.state.load();
    window.addEventListener('hashchange', zeige);
    // Kopf nur neu bauen, wenn sich Name, Rang oder Nachermittlung ändern.
    var signatur = '';
    W.state.on(function () {
      var s = [W.state.data.name, W.logic.rang(W.state.data, W.ansichten.akten()).titel, W.ansichten.nmAnzahl()].join('|');
      if (s === signatur) return;
      signatur = s;
      kopf();
    });
    zeige();
    if (!W.state.data.begruesst) W.ansichten.begruessung(zeige);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
