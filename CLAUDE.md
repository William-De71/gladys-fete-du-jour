# CLAUDE.md

Project rules for coding assistants (Claude Code reads this file) and for human
contributors.

## What this is

A Gladys Assistant **external integration** for the name days of the
traditional French calendar ("fête du jour"): a Node.js service (Node 22+, ESM,
no build step) that runs in its own sandboxed Docker container and talks to
Gladys through
[`@gladysassistant/integration-sdk`](https://github.com/GladysAssistant/integration-sdk-js),
its only runtime dependency.

A **calendar integration** (`type: "calendar"`, Gladys 5.2.0+): one "Fêtes du
jour" calendar for every user who enabled it in "My calendars", one scene
trigger, one scene action and one dashboard widget. No devices: Gladys does not
let one manifest be both.

The names come from a **built-in list** (`src/days.js`, derived from
monsieurm/scriptable-fete-du-jour, MIT, see NOTICE) and, when the user set a
key, from the **fetedujour.fr API** (free, but the key is tied to ONE fixed
public IP address). Transport: local, and cloud with a key.

## Commands

```bash
npm install
npm test                                  # node --test, never touches the network
node --test test/app.test.js              # one file
DEBUG=gladys-integration-sdk npm test     # with the SDK debug logs
npm run lint                              # ESLint
npm run format:check                      # Prettier, as the CI runs it
npm run format                            # Prettier, fix in place
npx github:GladysAssistant/integration-store . --skip-image-check   # store checks
node scripts/sync-names.mjs               # first names of src/days.js -> manifest filter
scripts/build-cover.sh                    # cover.jpg from docs/assets/cover.svg
docs/illustrations/render.sh              # docs/assets/widgets.<lang>.png
node .github/scripts/release.mjs next     # the version the next release would get
```

## Architecture

```
index.js                SDK wiring only (new GladysIntegration + createApp)
src/app.js              every handler, registered before connect(); the clock (tick)
src/days.js             the built-in list: 366 days, feasts, keys of the first names
src/names.js            the name day of a day from both sources, its title and sentence
src/fetedujour.js       HTTP client of fetedujour.fr (one day per request)
src/store.js            /data/state.json: names read, day of the last scene event, language
src/calendar.js         one calendar per user, one all-day event a day
src/events.js           scene trigger payload and scene action outputs
src/widgets.js          the `today` widget (pure, reused by docs/illustrations/gen.mjs)
src/config.js           configuration (key, event hour, language)
src/i18n.js             runtime texts, en / fr / de / es
src/dates.js            YYYY-MM-DD arithmetic, pure
src/time.js             timezone helpers (TZ given by the supervisor)
gladys-assistant-integration.json   manifest
docs/{en,fr,de,es}.md   user documentation, re-hosted by the store
docs/illustrations/     generated widget images (render.sh, gen.mjs, render.js)
.github/scripts/release.mjs         version, changelog, bump (tested in test/)
```

## Rules

- **Keys are forever**: the first-name keys of `src/days.js` (`nameKey`: lower
  case, no accent, hyphens — scenes store them in the `name_key` filter), the
  calendar id `ext:<selector>:<user>:name-days`, the event ids
  `ext:<selector>:<user>:day-<YYYY-MM-DD>`, the keys of `config_schema`, of the
  widget and its setting, of the scene trigger (field, variables) and of the
  scene action (field, options, outputs). A first name removed from the list
  stays an option of the filter (`scripts/sync-names.mjs` never drops one).
- **The list.** One entry a day: a first name (string) or `{ feast, name? }`.
  Change a day only with a source (Wikipedia day page, liturgical calendar);
  then run `node scripts/sync-names.mjs` and `npm run format`.
  `test/manifest.test.js` fails when the manifest misses a name.
- **Be gentle with fetedujour.fr.** It asks not to be called needlessly: each
  day of the year is asked once and kept in /data (the names never change),
  one request every 30 seconds, today first. A refused key (401/403) waits 6
  hours, any other failure 15 minutes; never a retry in a loop. A new key
  starts again at once. Without a key, no request at all.
- **The list always answers.** fetedujour.fr only replaces the first name of
  an ordinary day it read; a feast of the list stays as the list writes it.
  The filter key always comes from the list.
- **Days are calendar days in the timezone of Gladys** (`TZ`): never compute a
  day from UTC.
- **Calendar.** Events from 7 days back to 366 ahead, all-day, in the language
  of each user (`account.user.language`); pushed at connection, when an
  account changes, at midnight and every 30 names read (and at the end). The
  push window starts 30 days back: the core prunes only inside the window, so
  the old days are deleted instead of piling up. At most 30 writes a minute
  (spaced by 2.1 s); a calendar with `sync: false` is skipped. It starts
  private: the user shares it in "My calendars".
- **Scene event.** Once a day at the event hour, remembered in /data (a
  restart never fires it twice); a refused event is fired again at the next
  tick. A scene action or a widget never fires it.
- **The container rootfs is read-only.** Write only under `/data`.
- **Four languages.** Every user-facing text (manifest, `src/i18n.js`,
  `docs/*.md`, README) exists in English, French, German and Spanish
  (`test/i18n.test.js`), except the options of the first-name filter: proper
  nouns, one `en` label (the manifest stays under 100 KB). First names and
  feasts stay as the French calendar writes them. Use the words of the Gladys
  UI (Mes calendriers / My calendars / Meine Kalender / Mis calendarios,
  Activer pour moi, Partager avec le foyer…).
- **Widget images.** After any change to the content of the widget, run
  `docs/illustrations/render.sh` again and look at the four PNG files.
- **Versions belong to the Release workflow**: never edit `version` in
  `package.json`, the lockfile or the manifest, nor the `docker_image` tag.
  The version stays below 1.0.0 until the maintainer runs the Release workflow
  with `release-as: 1.0.0`.
- **Changelog.** Never edit CHANGELOG.md by hand, it is generated at the
  release. Write the PR title as the line the user will read.
- **Commits and PR titles** follow Conventional Commits, in English: `feat` ->
  minor, `fix` / `perf` -> patch, `!` or `BREAKING CHANGE:` -> major (minor
  below 1.0.0); `docs`, `chore`, `ci`, `test`, `style`, `refactor`, `build`
  release nothing.
- **Manifest.** Texts are objects `{ "en", "fr", "de", "es" }`; the catalog
  `description` holds 10 to 100 characters per language; the file stays under
  100 KB (351 first names in the filter: mind it). `type: "calendar"` needs
  `gladys_version >=5.2.0`. Transport: `["local", "cloud"]`. No permission.
- **Forum drafts** (`.github/forum-*.md`) are never committed.
- **Style.** Prettier formats, ESLint catches mistakes. Comments explain why,
  in English. Tests never touch the network (`test/helpers.js` fakes
  fetedujour.fr).

## Pitfalls

- fetedujour.fr documents neither its errors nor the format of its keys: a
  wrong key or another IP address gives HTTP 403 (checked on 2026-10-19 with a
  made-up key); an answer whose `day`/`month` differ from the request is
  refused as invalid. Never tested with a real key yet.
- A widget card holds 2 texts at most (1 body): the day and the wish share
  the body, on two lines.
- The trigger filters compare with `===`: the filter is a multi-select of
  keys, never a typed first name (accents and case would never match).
