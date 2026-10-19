# Changelog

All notable changes to this integration are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions
follow [Semantic Versioning](https://semver.org/). This file is generated at
each release from the Conventional Commits: do not edit it by hand.

## [0.1.0] - 2026-10-19

### Added

- A "Name days" Gladys calendar for every user who enables the integration in "My calendars": one all-day event a day ("Bonne fête Valérie", "Fête nationale · Bonne fête Camille"), from 7 days back to a year ahead, in the language of each user.
- The traditional French calendar built in (351 first names and the feasts), corrected against Wikipedia: works offline, with nothing to set.
- Optional fetedujour.fr source with the key of the user (tied to a fixed public IP address): each day asked once, one request every 30 seconds, kept in /data; the built-in list takes over whenever the key is refused or the site does not answer.
- Scene trigger "Name day", every day at a chosen hour, optionally only on the name day of chosen first names.
- Scene action "Get the name day" (today or tomorrow), with a ready-made sentence.
- Dashboard widget "Name day": the name day of today and of the next days.
- English, French, German and Spanish everywhere: settings, calendar, widget, scenes and documentation.

[0.1.0]: https://github.com/William-De71/gladys-fete-du-jour/releases/tag/v0.1.0
