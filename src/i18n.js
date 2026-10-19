// -----------------------------------------------------------------------------
// Texts of the integration, in English, French, German and Spanish (English
// fallback).
//
// The manifest carries its own labels; these are the texts the code writes at
// runtime: calendar and event names, widget contents, scene summaries, status
// of the Configuration screen. The first names and feasts stay as the French
// calendar writes them. Vocabulary of the Gladys interface: Mes calendriers /
// My calendars / Meine Kalender / Mis calendarios.
// -----------------------------------------------------------------------------

const LANGUAGES = ['en', 'fr', 'de', 'es'];

const TEXTS = {
  // calendar
  calendarName: { en: 'Name days', fr: 'Fêtes du jour', de: 'Namenstage', es: 'Santoral' },
  calendarDescription: {
    en: 'The name day of each day, from the traditional French calendar ({source}).',
    fr: 'La fête de chaque jour, d’après le calendrier traditionnel français ({source}).',
    de: 'Der Namenstag jedes Tages nach dem traditionellen französischen Kalender ({source}).',
    es: 'El santo de cada día, según el calendario tradicional francés ({source}).',
  },
  sourceList: {
    en: 'built-in list',
    fr: 'liste intégrée',
    de: 'integrierte Liste',
    es: 'lista integrada',
  },
  sourceApi: { en: 'fetedujour.fr', fr: 'fetedujour.fr', de: 'fetedujour.fr', es: 'fetedujour.fr' },
  eventName: {
    en: 'Name day: {name}',
    fr: 'Bonne fête {name}',
    de: 'Namenstag: {name}',
    es: 'Santo: {name}',
  },
  eventDescription: {
    en: 'Source: {source}.',
    fr: 'Source : {source}.',
    de: 'Quelle: {source}.',
    es: 'Fuente: {source}.',
  },

  // scene summaries
  summaryName_today: {
    en: 'Today is the name day of {name}.',
    fr: 'Aujourd’hui, nous fêtons les {name}.',
    de: 'Heute ist der Namenstag von {name}.',
    es: 'Hoy es el santo de {name}.',
  },
  summaryName_tomorrow: {
    en: 'Tomorrow is the name day of {name}.',
    fr: 'Demain, nous fêterons les {name}.',
    de: 'Morgen ist der Namenstag von {name}.',
    es: 'Mañana es el santo de {name}.',
  },
  summaryFeast_today: {
    en: 'Today: {feast}.',
    fr: 'Aujourd’hui : {feast}.',
    de: 'Heute: {feast}.',
    es: 'Hoy: {feast}.',
  },
  summaryFeast_tomorrow: {
    en: 'Tomorrow: {feast}.',
    fr: 'Demain : {feast}.',
    de: 'Morgen: {feast}.',
    es: 'Mañana: {feast}.',
  },
  summaryBoth_today: {
    en: 'Today: {feast}, and the name day of {name}.',
    fr: 'Aujourd’hui : {feast}, et nous fêtons les {name}.',
    de: 'Heute: {feast}, und der Namenstag von {name}.',
    es: 'Hoy: {feast}, y el santo de {name}.',
  },
  summaryBoth_tomorrow: {
    en: 'Tomorrow: {feast}, and the name day of {name}.',
    fr: 'Demain : {feast}, et nous fêterons les {name}.',
    de: 'Morgen: {feast}, und der Namenstag von {name}.',
    es: 'Mañana: {feast}, y el santo de {name}.',
  },

  // widget
  today: { en: 'Today', fr: 'Aujourd’hui', de: 'Heute', es: 'Hoy' },
  tomorrow: { en: 'Tomorrow', fr: 'Demain', de: 'Morgen', es: 'Mañana' },
  widgetWish: {
    en: 'Happy name day to all the {name}!',
    fr: 'Bonne fête aux {name} !',
    de: 'Alles Gute zum Namenstag, {name}!',
    es: '¡Feliz santo a los {name}!',
  },

  // status of the Configuration screen
  statusList: {
    en: 'Built-in list: {count} first names, no connection needed.',
    fr: 'Liste intégrée : {count} prénoms, sans connexion.',
    de: 'Integrierte Liste: {count} Vornamen, ohne Verbindung.',
    es: 'Lista integrada: {count} nombres, sin conexión.',
  },
  statusFilling: {
    en: 'fetedujour.fr: {read} of 366 days read; the built-in list gives the others meanwhile.',
    fr: 'fetedujour.fr : {read} jours sur 366 lus ; la liste intégrée donne les autres en attendant.',
    de: 'fetedujour.fr: {read} von 366 Tagen gelesen; die integrierte Liste liefert die übrigen solange.',
    es: 'fetedujour.fr: {read} de 366 días leídos; la lista integrada da los demás mientras tanto.',
  },
  statusComplete: {
    en: 'fetedujour.fr: the 366 days are read.',
    fr: 'fetedujour.fr : les 366 jours sont lus.',
    de: 'fetedujour.fr: Die 366 Tage sind gelesen.',
    es: 'fetedujour.fr: los 366 días están leídos.',
  },
  statusRefused: {
    en: 'fetedujour.fr refused the key (it is tied to a fixed public IP address): the built-in list is used. Next try in 6 hours.',
    fr: 'fetedujour.fr a refusé la clé (elle est liée à une adresse IP publique fixe) : la liste intégrée prend le relais. Nouvel essai dans 6 heures.',
    de: 'fetedujour.fr hat den Schlüssel abgelehnt (er ist an eine feste öffentliche IP-Adresse gebunden): Die integrierte Liste wird verwendet. Neuer Versuch in 6 Stunden.',
    es: 'fetedujour.fr ha rechazado la clave (está vinculada a una dirección IP pública fija): se usa la lista integrada. Nuevo intento dentro de 6 horas.',
  },
  statusUnreachable: {
    en: 'fetedujour.fr does not answer ({reason}): the built-in list is used meanwhile.',
    fr: 'fetedujour.fr ne répond pas ({reason}) : la liste intégrée prend le relais en attendant.',
    de: 'fetedujour.fr antwortet nicht ({reason}): Solange wird die integrierte Liste verwendet.',
    es: 'fetedujour.fr no responde ({reason}): mientras tanto se usa la lista integrada.',
  },
  statusInvalidKey: {
    en: 'The fetedujour.fr key holds unexpected characters: the built-in list is used.',
    fr: 'La clé fetedujour.fr contient des caractères inattendus : la liste intégrée est utilisée.',
    de: 'Der Schlüssel von fetedujour.fr enthält unerwartete Zeichen: Die integrierte Liste wird verwendet.',
    es: 'La clave de fetedujour.fr contiene caracteres inesperados: se usa la lista integrada.',
  },
};

/**
 * @description Whether a value is one of the languages of the integration.
 * @param {unknown} value - The value.
 * @returns {boolean} True for en, fr, de, es.
 */
function isLanguage(value) {
  return LANGUAGES.includes(value);
}

/**
 * @description A text in a language (English fallback), with its
 * substitutions.
 * @param {string} key - The TEXTS key.
 * @param {string} language - The language.
 * @param {object} [values] - The substitutions.
 * @returns {string} The text.
 * @example
 * t('eventName', 'fr', { name: 'Valérie' }); // -> 'Bonne fête Valérie'
 */
function t(key, language, values = {}) {
  const entry = TEXTS[key];
  if (!entry) {
    return key;
  }
  const template = entry[language] ?? entry.en;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}

/**
 * @description The text in every language, for a multi-language message.
 * @param {string} key - The TEXTS key.
 * @param {object} [values] - The substitutions.
 * @returns {{ en: string, fr: string, de: string, es: string }} The message.
 */
function all(key, values = {}) {
  return Object.fromEntries(LANGUAGES.map((language) => [language, t(key, language, values)]));
}

/**
 * @description Truncate a text to a bound, with an ellipsis.
 * @param {string} value - The text.
 * @param {number} max - The bound.
 * @returns {string} The text.
 */
function clip(value, max) {
  const text = String(value ?? '');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

const locale = (language) => (isLanguage(language) ? language : 'en');

/**
 * @description A calendar day written in a language: "Tuesday, April 28"
 * (long), "Thu, Apr 30" (short). Never shifted by a timezone.
 * @param {string} iso - YYYY-MM-DD.
 * @param {string} language - The language.
 * @param {'long'|'short'} [style] - The style.
 * @returns {string} The text.
 * @example
 * formatDay('2026-04-28', 'fr'); // -> 'mardi 28 avril'
 */
function formatDay(iso, language, style = 'long') {
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale(language), {
    weekday: style,
    day: 'numeric',
    month: style,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export { LANGUAGES, TEXTS, isLanguage, t, all, clip, formatDay };
