# Bremsspur – Lern- und Übungsseite Physik (Klasse 9)

Interaktive Lernseite zu Geschwindigkeit, Beschleunigung und freiem Fall, optimiert für den Rechner (Chrome), dazu Handy und Tablet.

**Online:** https://skillslabeducation.github.io/physik-bewegungen/

## Die Idee

Du bist Praktikant im Gutachterbüro „Bremsspur“. Auf dem Schreibtisch liegen neun Akten, jede ein Fall aus dem Straßenverkehr oder dem Alltag. Du liest den Auftrag, verstehst die Physik dahinter, übst mit Rechenaufgaben, beschreibst Graphen in eigenen Worten und schließt die Akte mit einem Gutachten ab. Am Ende wartet die Sachverständigenprüfung als Probearbeit.

## Inhalt

| Akte | Fall | Thema |
|------|------|-------|
| 0 | Erster Tag im Büro: "Wie lange zu Fuß nach Wladiwostok?" | Größen, Einheiten und Formeln umstellen |
| 1 | Lkw im Elbtunnel: "Ich war nicht zu schnell." | Mittlere Geschwindigkeit |
| 2 | Güterzug auf der Hafenbahn | Gleichförmige Bewegung |
| 3 | Anfahrender Personenzug und ein Auto beim Beschleunigungsrennen | Gleichmäßig beschleunigte Bewegung |
| 4 | Fahrtenschreiber eines ICE | Diagramme: s(t), v(t) und a(t) |
| 5 | Alibi per Lauf-App | Messtabellen auswerten |
| 6 | Zwei E-Bikes an der Ampel | Einholen und Treffpunkt |
| 7 | Beinahe-Unfall auf dem Radweg | Bremsen |
| 8 | Sprung vom 5-m-Brett | Freier Fall |

Jede Akte hat **Auftrag**, **Verstehen** (Karten mit Abbildungen und Video-Links), **Üben** (Auswahl, Zahlen, Tabellen, Punkte setzen im Graphen, geführtes Rechnen mit Rechentrainer), **Beschreiben** und **Gutachten**.

Dazu kommen:
- **Nachermittlung:** Falsch gelöste Aufgaben kommen zurück, bis sie zweimal hintereinander sitzen. Rechentrainer-Aufgaben kommen mit neuen Zahlen.
- **Sachverständigenprüfung:** Probearbeit mit Timer und Auswertung. Eine laufende Prüfung übersteht das Neuladen.
- **Formelkarte:** alle Formeln mit Umstellungen, km/h und m/s, die drei Bewegungsarten mit ihren Graphen, Mittelpunkt-Regel und Rechenweg auf einer A4-Seite zum Drucken.

Inhalte über den Unterricht hinaus sind als **Plus** markiert und kommen in der Prüfung nicht vor. Die Videos sind nur Links zu YouTube, es wird nichts eingebettet.

## Technik

- Reines HTML, CSS und JavaScript, ohne Build-Schritt und ohne externe Dienste
- Alle Abbildungen und Graphen sind selbst gezeichnetes SVG
- Fortschritt nur lokal im Browser (localStorage), kein Konto, kein Tracking
- Schriften: IBM Plex Sans und IBM Plex Mono (SIL Open Font License), lokal in `fonts/`
- Auf dem iPhone oder iPad in Safari „Teilen → Zum Home-Bildschirm“ wählen, dann startet die Seite wie eine App

## Tests

```
node tests/ansichten.test.js    # Ansichten und Routen
node tests/aufgaben.test.js     # alle Aufgabentypen
node tests/inhalt.test.js       # alle Akten: vollständig, jede Aufgabe mit ihrer Lösung lösbar
node tests/logic.test.js        # Fortschritt, Nachermittlung, Rang, Speicher
node tests/physik.test.js       # Formeln, Umrechnung, Mittelpunkt-Auswertung, Lösungen der Blätter
node tests/privat.test.js       # keine privaten Namen im Code
node tests/pruefung.test.js       # Prüfung: Punkte, Varianten, Auswertung
node tests/text.test.js         # Eingaben, Dezimalkomma, Tippfehler
node tests/trainer.test.js      # Rechentrainer mit Startwert
```
