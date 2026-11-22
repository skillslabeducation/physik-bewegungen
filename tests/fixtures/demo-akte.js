/* Testvorlage, nicht in index.html: kleine Demo-Akte, um Ansichten und Tastatur im Browser zu testen,
   solange die echten Akten fehlen. Ersetzt den Platzhalter von Akte 3. Wird nur vom Browsertest geladen. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  W.akten = W.akten || [];
  W.akten.push({
    id: 'beschleunigt', nr: 3, titel: 'Gleichmäßig beschleunigte Bewegung', fall: 'Anfahrender Personenzug (Demo)',
    auftrag: {
      text: '<p>Ein Personenzug fährt in Hamburg-Harburg aus dem Stand an. Der Lokführer sagt, er habe nach 1000 m schon nach einer Minute die volle Fahrt erreicht.</p>',
      daten: '<table><tr><th>t in s</th><td>0</td><td>10</td><td>20</td></tr><tr><th>v in m/s</th><td>0</td><td>5</td><td>10</td></tr></table>',
      chefin: 'Akte 3. Der Zug beschleunigt gleichmäßig. Prüf die Minute nach.',
      leitfrage: 'Wie lange braucht der Zug für die ersten 1000 m?'
    },
    karten: [
      { titel: 'Beschleunigung', text: '<p>Die Beschleunigung gibt an, wie schnell sich die Geschwindigkeit ändert: a = Δv/Δt.</p>',
        abb: { achsen: { x: { g: 't', e: 's', max: 20, schritt: 5 }, y: { g: 'v', e: 'm/s', max: 10, schritt: 2 } }, kurven: [{ punkte: [[0, 0], [20, 10]], farbe: 'v' }] },
        merk: 'a = Δv/Δt, Einheit m/s².' },
      { titel: 'Weg aus dem Stand', text: '<p>Aus dem Stand gilt s = a/2·t².</p>', achtung: '<p>Die Hälfte nicht vergessen.</p>' },
      { titel: 'Zeit für eine Strecke', text: '<p>Umgestellt: t = √(2s/a).</p>', plus: true }
    ],
    ueben: [
      { id: 'beschleunigt-u1', typ: 'wahl', frage: 'Welche Einheit hat die Beschleunigung?', optionen: ['m/s²', 'm/s', 'km/h'], richtig: 0,
        optErkl: ['Richtig: Geschwindigkeitsänderung pro Sekunde, also m/s pro s.', 'Das ist die Einheit der Geschwindigkeit.', 'Auch das ist eine Geschwindigkeit.'] },
      { id: 'beschleunigt-u2', typ: 'rechnung', frage: 'Der Zug fährt mit a = 0,5 m/s² an. Wie lange braucht er für 1000 m?',
        gegeben: '<p>s = 1000 m, a = 0,5 m/s²</p>', antwort: 63.2456, auch: [63.25], einheit: 's', formel: 't-beschl',
        loesung: '<p>s = a/2·t² ⇒ t = √(2s/a)</p><p>t = √(2·1000 m / 0,5 m/s²) ≈ 63,25 s</p>',
        schritte: [
          { art: 'formel', optionen: ['s = a/2·t²', 's = v·t'], richtig: 0, optErkl: ['Richtig: beschleunigt aus dem Stand.', 'Gilt nur bei konstanter Geschwindigkeit.'] },
          { art: 'umstellen', optionen: ['t = √(2s/a)', 't = 2s/a'], richtig: 0, optErkl: ['Richtig.', 'Die Wurzel fehlt.'] }
        ] },
      { id: 'beschleunigt-u3', typ: 'zahl', frage: 'Welche Geschwindigkeit hat der Zug nach 10 s (a = 0,5 m/s²)?', antwort: 5, einheit: 'm/s' }
    ],
    trainer: ['v-at', 's-beschl', 't-beschl'],
    erklaeren: [
      { id: 'beschleunigt-e1', frage: 'Beschreibe den v(t)-Graphen des anfahrenden Zuges.',
        abb: { achsen: { x: { g: 't', e: 's', max: 20, schritt: 5 }, y: { g: 'v', e: 'm/s', max: 10, schritt: 2 } }, kurven: [{ punkte: [[0, 0], [20, 10]], farbe: 'v' }] },
        punkte: [{ text: 'Ursprungsgerade', p: 1 }, { text: 'v nimmt gleichmäßig zu', p: 1 }],
        begriffe: [{ name: 'Gerade', muster: ['gerade'] }], muster: 'Der Graph ist eine Ursprungsgerade: v nimmt gleichmäßig zu.' }
    ],
    gutachten: [
      { id: 'beschleunigt-g1', typ: 'rechnung', frage: 'Wie lange braucht der Zug für die ersten 1000 m (a = 0,5 m/s²)?',
        antwort: 63.2456, auch: [63.25], einheit: 's', formel: 't-beschl',
        loesung: '<p>t = √(2·1000 m / 0,5 m/s²) ≈ 63,25 s</p>',
        schritte: [{ art: 'formel', optionen: ['s = a/2·t²', 's = v·t'], richtig: 0, optErkl: ['Richtig.', 'Gilt nur bei konstanter Geschwindigkeit.'] }],
        satz: { optionen: ['Der Zug braucht rund 63 s, also etwas mehr als eine Minute.', 'Der Zug braucht genau eine Minute.'], richtig: 0 } }
    ],
    ergebnis: '<p><strong>Ergebnis:</strong> Der Zug braucht für 1000 m rund 63 s. Die Angabe „eine Minute“ ist knapp zu kurz.</p>'
  });
})();
