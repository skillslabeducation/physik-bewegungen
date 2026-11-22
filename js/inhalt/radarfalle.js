/* Radarfalle: 60 Sekunden „stimmt“ oder „stimmt nicht“ zu allen neun Akten.
   Gleich viele wahre und falsche Aussagen (Raten bringt im Schnitt nichts). Falsche Aussagen sind typische Fehler.
   Fehler gehen als Aufgabe r:<index> in die Nachermittlung. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});

  function A(akte, stimmt, text, erkl) { return { akte: akte, stimmt: stimmt, text: text, erkl: erkl }; }

  // Neue Aussagen immer nur hinten anhängen: Die Nachermittlung speichert sie über ihre Position (r:<index>).
  var AUSSAGEN = [
    // Akte 0: Einheiten
    A('einheiten', true, '36 km/h sind 10 m/s.', '36 : 3,6 = 10. Von km/h nach m/s teilst du durch 3,6.'),
    A('einheiten', false, 'Von km/h nach m/s rechnest du mal 3,6.', 'Umgekehrt: km/h → m/s geteilt durch 3,6, m/s → km/h mal 3,6.'),
    A('einheiten', true, 'Die Einheit der Beschleunigung ist m/s².', 'a = Δv/Δt: m/s geteilt durch s ergibt m/s².'),
    A('einheiten', false, '20 m/s sind ungefähr 5,6 km/h.', 'm/s → km/h mal 3,6: 20 m/s = 72 km/h. 5,6 km/h wäre geteilt statt mal.'),
    A('einheiten', true, '1 m/s ist langsamer als 5 km/h.', '1 m/s = 3,6 km/h, das ist weniger als 5 km/h.'),
    A('einheiten', false, '100 km/h sind mehr als 30 m/s.', '100 : 3,6 ≈ 27,8 m/s, also weniger als 30 m/s.'),
    // Akte 1: mittlere Geschwindigkeit
    A('mittel', true, 'Die mittlere Geschwindigkeit ist der gesamte Weg geteilt durch die gesamte Zeit: v̄ = Δs/Δt.', 'So rechnest du auch, wenn unterwegs mal schneller und mal langsamer gefahren wird.'),
    A('mittel', false, 'Wer 60 km in 2 h fährt, muss die ganze Zeit genau 30 km/h schnell gefahren sein.', '30 km/h ist nur die mittlere Geschwindigkeit. Unterwegs kann das Tempo schwanken.'),
    A('mittel', true, 'Wer 84,7 m in 61,5 s geht, hat eine mittlere Geschwindigkeit von etwa 1,38 m/s.', 'v̄ = 84,7 m : 61,5 s ≈ 1,38 m/s, das sind etwa 4,96 km/h.'),
    A('mittel', false, 'Die mittlere Geschwindigkeit ist immer der Mittelwert aus Anfangs- und Endgeschwindigkeit.', 'Das klappt nur bei gleichmäßiger Beschleunigung. Allgemein gilt v̄ = Δs/Δt.'),
    A('mittel', true, 'Wer 1 h mit 60 km/h und danach 1 h mit 100 km/h fährt, hat eine mittlere Geschwindigkeit von 80 km/h.', '160 km in 2 h ergeben 80 km/h. Hier sind beide Zeiten gleich lang.'),
    A('mittel', false, 'Wer 60 km mit 60 km/h und danach 60 km mit 120 km/h fährt, hat eine mittlere Geschwindigkeit von 90 km/h.', '1 h plus 0,5 h: 120 km in 1,5 h sind 80 km/h. Die langsame Strecke dauert länger und zählt mehr.'),
    // Akte 2: gleichförmige Bewegung
    A('gleichfoermig', true, 'Bei einer gleichförmigen Bewegung ist die Beschleunigung null.', 'v = konst, die Geschwindigkeit ändert sich nicht. Also ist a = 0.'),
    A('gleichfoermig', false, 'Bei einer gleichförmigen Bewegung legt das Fahrzeug in jeder Sekunde mehr Weg zurück.', 'In gleichen Zeiten legt es gleiche Wege zurück. Mehr Weg pro Sekunde hieße: Es wird schneller.'),
    A('gleichfoermig', true, 'Ein Güterzug fährt konstant mit 18,75 m/s. In 40 s legt er 750 m zurück.', 's = v·t = 18,75 m/s · 40 s = 750 m.'),
    A('gleichfoermig', false, 'Ein Zug mit konstant 20 m/s braucht für 1000 m genau 20 s.', 't = s/v = 1000 m : 20 m/s = 50 s.'),
    A('gleichfoermig', true, 'Bei konstanter Geschwindigkeit gilt s = v·t, wenn bei t = 0 auch s = 0 ist.', 'Sonst rechnest du mit s = s₀ + v·t.'),
    A('gleichfoermig', false, 'Doppelte Geschwindigkeit bedeutet für dieselbe Strecke doppelte Fahrzeit.', 't = s/v: Doppelte Geschwindigkeit halbiert die Zeit.'),
    // Akte 3: gleichmäßig beschleunigte Bewegung
    A('beschleunigt', true, 'Ein Auto beschleunigt aus dem Stand mit 2 m/s². Nach 5 s ist es 10 m/s schnell.', 'v = a·t = 2 m/s² · 5 s = 10 m/s.'),
    A('beschleunigt', false, 'Ein Auto beschleunigt aus dem Stand mit 2 m/s². In 5 s legt es 50 m zurück.', 's = a/2·t² = 1 m/s² · 25 s² = 25 m. Die 50 m entstehen, wenn du die Hälfte vergisst.'),
    A('beschleunigt', true, 'a = 2 m/s² heißt: Die Geschwindigkeit nimmt in jeder Sekunde um 2 m/s zu.', 'a = Δv/Δt. In 1 s kommen 2 m/s dazu.'),
    A('beschleunigt', false, 'Beschleunigt ein Fahrzeug aus dem Stand gleichmäßig, legt es in der doppelten Zeit den doppelten Weg zurück.', 's = a/2·t²: doppelte Zeit, vierfacher Weg.'),
    A('beschleunigt', true, 'Bei gleichmäßig beschleunigter Bewegung aus dem Stand gilt t = √(2s/a).', 's = a/2·t² nach t umgestellt: | ·2 | :a | √.'),
    A('beschleunigt', false, 'Bei einer beschleunigten Bewegung rechnest du den Weg mit s = v·t und der Endgeschwindigkeit aus.', 's = v·t gilt nur bei konstanter Geschwindigkeit. Aus dem Stand gilt s = a/2·t², mit der Endgeschwindigkeit käme der doppelte Weg heraus.'),
    // Akte 4: Diagramme
    A('diagramme', true, 'Bei einer gleichförmigen Bewegung ab s = 0 ist der s(t)-Graph eine Ursprungsgerade.', 'Die Steigung der Geraden ist die Geschwindigkeit v.'),
    A('diagramme', false, 'Ein waagerechter v(t)-Graph oberhalb der t-Achse bedeutet: Das Fahrzeug steht.', 'Waagerecht heißt v = konst, das Fahrzeug fährt gleichförmig. Stehen heißt v = 0, also eine Linie auf der t-Achse.'),
    A('diagramme', true, 'Beim gleichmäßig beschleunigten Anfahren aus dem Stand ist der s(t)-Graph eine Parabel, die immer steiler wird.', 's = a/2·t²: eine halbe Parabel, nach oben offen.'),
    A('diagramme', false, 'Ein waagerechter s(t)-Graph bedeutet: Das Fahrzeug fährt mit konstanter Geschwindigkeit.', 'Waagerecht im s(t)-Diagramm heißt: s ändert sich nicht, das Fahrzeug steht.'),
    A('diagramme', true, 'Die Steigung des v(t)-Graphen ist die Beschleunigung.', 'a = Δv/Δt, das ist das Steigungsdreieck im v(t)-Diagramm.'),
    A('diagramme', false, 'Beim Bremsen liegt der a(t)-Graph oberhalb der t-Achse.', 'Beim Bremsen ist a negativ: eine waagerechte Linie unterhalb der t-Achse (in v = v₀ − a·t steht nur der Betrag).'),
    // Akte 5: Messtabellen und Mittelpunkt-Regel
    A('messdaten', true, 'Die mittlere Geschwindigkeit zwischen t = 0,2 s und t = 0,4 s gehört zum Zeitpunkt t = 0,3 s.', 'Mittelpunkt-Regel: t₁₂ = (t₁ + t₂)/2.'),
    A('messdaten', false, 'Die mittlere Geschwindigkeit zwischen zwei Messungen gehört zum Anfang des Zeitintervalls.', 'Sie gehört zur Mitte des Intervalls: t₁₂ = (t₁ + t₂)/2.'),
    A('messdaten', true, 'Aus 5 Messwerten für s erhältst du 4 Geschwindigkeiten und 3 Beschleunigungen.', 'Aus n Messwerten werden n − 1 Geschwindigkeiten und n − 2 Beschleunigungen.'),
    A('messdaten', false, 'Beim Sprung vom Turm erhältst du die Geschwindigkeit bei t = 0,4 s, indem du s(0,4 s) durch 0,4 s teilst.', 'Das ist die mittlere Geschwindigkeit von 0 bis 0,4 s. Sie gehört zur Intervallmitte 0,2 s (0,785 m : 0,4 s ≈ 1,96 m/s). Bei 0,4 s ist der Springer schon doppelt so schnell.'),
    A('messdaten', true, 'Aus s = 0 m bei 0 s und s = 0,196 m bei 0,2 s folgt v̄(0,1 s) = 0,98 m/s.', 'v̄ = (0,196 m − 0 m)/(0,2 s − 0 s) = 0,98 m/s, der Wert gehört zur Intervallmitte 0,1 s.'),
    A('messdaten', false, 'Sind die mittleren Beschleunigungen aus einer Tabelle alle ungefähr 9,8 m/s², ist die Bewegung gleichförmig.', 'Konstante Beschleunigung heißt gleichmäßig beschleunigt. Gleichförmig wäre a = 0.'),
    // Akte 6: Einholen
    A('einholen', true, 'Beim Einholen sind beide Fahrzeuge zur gleichen Zeit am gleichen Ort: s₁(t) = s₂(t).', 'Deshalb setzt du die beiden Weg-Zeit-Gesetze gleich.'),
    A('einholen', false, 'Im Moment des Einholens sind beide Fahrzeuge gleich schnell.', 'Gleich ist der Ort, nicht die Geschwindigkeit. Das schnellere Fahrzeug zieht gerade vorbei.'),
    A('einholen', true, 'Im s(t)-Diagramm ist der Treffpunkt der Schnittpunkt der beiden Graphen.', 'Dort haben beide zur gleichen Zeit denselben Weg zurückgelegt.'),
    A('einholen', false, 'Im v(t)-Diagramm zeigt der Schnittpunkt der Graphen, wann ein Fahrzeug das andere einholt.', 'Im v(t)-Diagramm schneiden sich die Graphen, wenn beide gleich schnell sind. Eingeholt wird am Schnittpunkt im s(t)-Diagramm.'),
    A('einholen', true, 'Ein E-Bike fährt konstant mit 4,67 m/s. Ein zweites startet daneben aus dem Stand und holt es nach 6 s ein. Beide sind dann etwa 28 m gefahren.', 's₁ = v₁·t = 4,67 m/s · 6 s ≈ 28 m.'),
    A('einholen', false, 'Ein Fahrzeug, das aus dem Stand immer weiter gleichmäßig beschleunigt, kann ein gleichförmig fahrendes nie einholen.', 'Doch: Seine Geschwindigkeit wächst immer weiter. Irgendwann ist es schneller und holt das andere ein.'),
    // Akte 7: Bremsen
    A('bremsen', true, 'Beim Bremsen ist die Beschleunigung negativ, zum Beispiel a = −4,5 m/s².', 'Die Geschwindigkeit nimmt ab. In v = v₀ − a·t steht a für den Betrag 4,5 m/s².'),
    A('bremsen', false, 'Ein E-Bike bremst von 9 m/s mit 4,5 m/s². Bis zum Stillstand braucht es 4 s.', 't = v₀/a = 9 m/s : 4,5 m/s² = 2 s.'),
    A('bremsen', true, 'Ein E-Bike bremst von 9 m/s mit 4,5 m/s². Der Bremsweg beträgt 9 m.', 's = v₀·t − a/2·t² = 9 m/s · 2 s − 2,25 m/s² · 4 s² = 18 m − 9 m = 9 m.'),
    A('bremsen', false, 'Bei gleicher Bremsbeschleunigung bedeutet doppelte Anfangsgeschwindigkeit doppelten Bremsweg.', 'Doppelt so schnell heißt doppelte Bremszeit und vierfacher Bremsweg: Setze t = v₀/a in s = v₀·t − a/2·t² ein.'),
    A('bremsen', true, 'Beim Bremsen ist der v(t)-Graph eine fallende Gerade, die beim Stillstand die t-Achse erreicht.', 'v = v₀ − a·t nimmt gleichmäßig ab, bis v = 0 ist.'),
    A('bremsen', false, 'Die Formel v = v₀ − a·t gilt auch nach dem Stillstand weiter.', 'Nur bis zum Stillstand bei t = v₀/a. Danach steht das Fahrzeug: v bleibt 0, es fährt nicht rückwärts.'),
    // Akte 8: freier Fall
    A('fall', true, 'Im freien Fall auf der Erde beträgt die Beschleunigung g = 9,81 m/s².', 'Ohne Luftwiderstand fallen auf der Erde alle Körper mit dieser Beschleunigung. Auf dem Mond ist g kleiner.'),
    A('fall', false, 'Ohne Luftwiderstand fällt ein schwerer Stein schneller als ein leichter.', 'Im freien Fall fallen alle Körper gleich schnell, die Masse spielt keine Rolle.'),
    A('fall', true, 'Ein Stein fällt in der ersten Sekunde etwa 4,9 m tief.', 's = g/2·t² = 4,905 m/s² · (1 s)² ≈ 4,9 m.'),
    A('fall', false, 'Ein Stein ist nach 2 s freiem Fall 9,81 m/s schnell.', 'v = g·t = 9,81 m/s² · 2 s = 19,62 m/s.'),
    A('fall', true, 'Ein Sprung aus 5 m Höhe dauert etwa 1 s.', 't = √(2s/g) = √(2 · 5 m : 9,81 m/s²) ≈ 1,01 s.'),
    A('fall', false, 'Im freien Fall ist die Geschwindigkeit konstant 9,81 m/s.', '9,81 m/s² ist die Beschleunigung. Die Geschwindigkeit wächst in jeder Sekunde um 9,81 m/s.')
  ];

  /** Aufgabe für die Nachermittlung: Stimmt das? */
  function itemNachId(id) {
    var m = /^r:(\d+)$/.exec(id || '');
    var a = m ? AUSSAGEN[+m[1]] : null;
    if (!a) return null;
    // Aus Sicht der falschen Wahl: Wer „Stimmt“ wählt, obwohl die Aussage nicht stimmt, und umgekehrt.
    var daneben = a.stimmt ? 'Du hast ‚Stimmt nicht‘ gewählt – die Aussage stimmt aber.' : 'Du hast ‚Stimmt‘ gewählt – die Aussage stimmt aber nicht.';
    return {
      id: id, typ: 'wahl', fest: true,
      frage: 'Radarfalle: Stimmt das? „' + a.text + '“',
      optionen: ['Stimmt', 'Stimmt nicht'],
      richtig: a.stimmt ? 0 : 1,
      optErkl: a.stimmt ? [a.erkl, daneben] : [daneben, a.erkl]
    };
  }

  /** Punkte einer Runde: richtig minus falsch, nie unter 0. */
  function punkte(richtig, falsch) { return Math.max(0, richtig - falsch); }

  /** „1 Punkt“, „0 Punkte“ */
  function punkteText(n) { return n + (n === 1 ? ' Punkt' : ' Punkte'); }

  W.radar = { aussagen: AUSSAGEN, itemNachId: itemNachId, punkte: punkte, punkteText: punkteText, DAUER: 60, SPERRE_MS: 3000 };
})();
