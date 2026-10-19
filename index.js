// -----------------------------------------------------------------------------
// Entry point of the Fête du jour external integration.
//
// Brings the name days of the traditional French calendar into Gladys:
//   - calendar: "Fêtes du jour", one all-day event a day, for every user who
//     enabled the integration in "My calendars" (src/calendar.js);
//   - scene trigger: the name day of today (filter: chosen first names);
//   - scene action: the name day of today or tomorrow;
//   - dashboard widget: the name day of today and of the next days.
// The names come from a built-in list, or from fetedujour.fr with the key of
// the user.
//
// This file only wires the SDK client: the handlers are in src/app.js.
//
// Environment variables provided by the Gladys supervisor:
//   GLADYS_HOST_API_URL / GLADYS_INTEGRATION_TOKEN / GLADYS_INTEGRATION_SELECTOR
//   TZ (the timezone of Gladys: a day starts at its midnight)
// The SDK reads the first three: `new GladysIntegration()` is enough.
// -----------------------------------------------------------------------------

import { readFileSync } from 'node:fs';
import { GladysIntegration, logger } from '@gladysassistant/integration-sdk';
import { createApp } from './src/app.js';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const gladys = new GladysIntegration();
createApp(gladys, {
  userAgent: `gladys-fete-du-jour/${version} (+https://github.com/William-De71/gladys-fete-du-jour)`,
});

// --- Startup -----------------------------------------------------------------------
logger.info(`Starting the Fête du jour integration ${version}...`);
gladys.connect().catch((err) => {
  logger.error('Initial connection failed', err);
  process.exit(1);
});
