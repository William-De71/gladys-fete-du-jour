# Fête du jour

## Überblick

Diese Integration bringt den Namenstag jedes Tages des traditionellen französischen Kalenders in Gladys: „Namenstag: Valérie“ am 28. April, „Fête nationale · Namenstag: Camille“ am 14. Juli.

- Ein **Gladys-Kalender** „Namenstage“ für jeden Benutzer, der ihn aktiviert: ein ganztägiges Ereignis pro Tag, von 7 Tagen zurück bis ein Jahr voraus.
- Ein **Szenen-Auslöser** „Namenstag“, jeden Tag zur gewählten Stunde, oder nur am Namenstag der gewählten Vornamen (Ihrer, die Ihrer Familie).
- Eine **Szenen-Aktion** „Namenstag abrufen“ (heute oder morgen), mit einem fertigen Satz zum Versenden.
- Ein **Widget** „Namenstag“: der Namenstag von heute und der nächsten Tage.

![Das Widget Namenstag (generierte Illustration, kein Screenshot)](https://raw.githubusercontent.com/William-De71/gladys-fete-du-jour/main/docs/assets/widgets.de.png)

Das Bild oben ist eine generierte Illustration, kein Screenshot.

## Voraussetzungen

- Gladys Assistant 5.2.0 oder neuer (Kalender-Integrationen).
- Die Zeitzone von Gladys richtig eingestellt (**Einstellungen > System**): Die Tage wechseln um ihre Mitternacht.
- Sonst nichts mit der integrierten Liste. Für fetedujour.fr: ein kostenloser Schlüssel und eine **feste** öffentliche IP-Adresse (siehe unten).

## Konfiguration

| Feld                          | Beschreibung                                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stunde des Szenen-Ereignisses | Die Stunde (0 bis 23), zu der der Auslöser „Namenstag“ jeden Tag startet. Standard: 8.                                                                                                                 |
| Sprache der Texte             | Szenen-Zusammenfassungen und Status. Automatisch: die Sprache Ihres Dashboards, sobald das Widget angezeigt wurde, vorher aus der Zeitzone abgeleitet. Der Kalender folgt der Sprache jedes Benutzers. |
| fetedujour.fr-Schlüssel       | Optional. Leer: die integrierte Liste.                                                                                                                                                                 |

Klicken Sie dann im Block **Meine Kalender** der Integrationsseite auf **Für mich aktivieren**: Ihr Kalender „Namenstage“ erscheint im Kalender von Gladys. Er ist zunächst **privat**: Um ihn in Szenen zu nutzen oder dem Haushalt zu zeigen, aktivieren Sie **Mit dem Haushalt teilen**. Jeder Benutzer aktiviert seinen eigenen.

## Woher die Namen kommen

- **Integrierte Liste** (Standard): der traditionelle französische Kalender, ein Heiliger pro Tag (351 Vornamen), mit den Festen und Feiertagen (Toussaint, Noël, Fête nationale …). Hat ein Fest einen zugehörigen Vornamen, wird er mitgeliefert: Martin am 11. November, Camille am 14. Juli, Marie am 15. August. Keine Verbindung nötig. Der 29. Februar (Auguste) existiert nur in Schaltjahren.
- **fetedujour.fr** (optional): Erzeugen Sie einen kostenlosen Schlüssel auf [fetedujour.fr/api](https://fetedujour.fr/api/) mit der öffentlichen IP-Adresse Ihres Routers und fügen Sie ihn in die Konfiguration ein. **Der Schlüssel funktioniert nur von dieser IP-Adresse aus**: Gibt Ihnen Ihr Anbieter eine wechselnde Adresse, funktioniert der Schlüssel irgendwann nicht mehr. Die Integration fragt jeden Tag des Jahres nur einmal ab (eine Anfrage alle 30 Sekunden, beim ersten Mal etwa drei Stunden, heute zuerst) und behält die Antworten; die Feste der integrierten Liste bleiben unverändert. Solange ein Tag nicht gelesen ist, und immer wenn fetedujour.fr den Schlüssel ablehnt oder nicht antwortet, übernimmt die integrierte Liste.

Der Status oben auf der Konfigurationsseite zeigt die verwendete Quelle und den Fortschritt („fetedujour.fr: 120 von 366 Tagen gelesen“).

## Verwendung

### Kalender

Der Kalender „Namenstage“ erscheint in der Kalenderansicht von Gladys, neben den anderen. Der Gladys-Auslöser „Kalenderereignis steht bevor“ funktioniert auch damit, sobald der Kalender mit dem Haushalt geteilt ist.

### Widget

**Namenstag**: der Vorname des Tages groß (oder das Fest), das Datum und ein „Alles Gute zum Namenstag, Valérie!“, dann die nächsten Tage (0 bis 7, Einstellung „Nächste Tage“). Feste sind blau.

### Szenen

Auslöser **Namenstag**, einmal am Tag zur Stunde der Konfiguration (nie zweimal am selben Tag; war Gladys zu dieser Stunde gestoppt, kommt er bei der Rückkehr, am selben Tag). Filter **Vornamen**: leer startet die Szene jeden Tag, sonst nur am Namenstag der gewählten Vornamen.

Variablen: Vorname des Tages, Fest oder Feiertag (meist leer), Tag (JJJJ-MM-TT) und ein fertiger Satz („Heute ist der Namenstag von Valérie.“).

Aktion **Namenstag abrufen**: heute oder morgen; liefert den Vornamen, das Fest, den Tag und den Satz („Morgen ist der Namenstag von Catherine de Sienne.“).

Beispiele:

- Jeden Tag um 8:00 (Auslöser Namenstag) → „{{triggerEvent.data.summary}}“ an den Familien-Messenger senden.
- Namenstag, Vornamen Valérie und Martin → eine Nachricht senden, um das Gratulieren nicht zu vergessen.
- Jeden Abend um 20:00 → den Namenstag von morgen abrufen → ihn über den Lautsprecher im Wohnzimmer ansagen.

### Transport

Lokal mit der integrierten Liste: Nichts verlässt Ihr Gladys. Mit einem Schlüssel ruft die Integration zusätzlich fetedujour.fr auf (Cloud), und nur diese Seite.

## Fehlerbehebung

- **„fetedujour.fr hat den Schlüssel abgelehnt“**: Der Schlüssel ist an eine feste öffentliche IP-Adresse gebunden. Prüfen Sie, ob die Adresse Ihres Routers die bei der Erstellung angegebene ist, sonst erzeugen Sie einen neuen. Solange wird die integrierte Liste verwendet; die Integration versucht es alle 6 Stunden erneut, und sofort nach einem Schlüsselwechsel.
- **Der Kalender erscheint nicht**: Aktivieren Sie die Integration für sich unter „Meine Kalender“. Für Szenen teilen Sie ihn mit dem Haushalt.
- **Der Namenstag ist um einen Tag verschoben**: Prüfen Sie die Zeitzone von Gladys (Einstellungen > System).
- **Etwas anderes**: Öffnen Sie ein Issue auf GitHub (https://github.com/William-De71/gladys-fete-du-jour/issues) mit den Versionen von Gladys und der Integration, der verwendeten Quelle, dem in der Konfiguration angezeigten Status und den Protokollen der Integration (Einstellungen > Supervision). Fügen Sie nie Ihren Schlüssel ein.
