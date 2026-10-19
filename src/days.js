// -----------------------------------------------------------------------------
// The built-in list of the name days: the traditional French calendar, one
// saint a day (the one printed on the calendars of the French Post), with the
// feasts and holidays where the calendar gives one instead of a first name.
//
// Source: the list of monsieurm/scriptable-fete-du-jour (MIT, see NOTICE),
// corrected against the French Wikipedia day pages and the liturgical
// calendar: movable feasts and solstices removed from fixed days (21/02 Pierre
// Damien, 21/06 Gonzague, 23/09 Constant, 21/12 Pierre Canisius), the
// duplicate of 31/05 (Pétronille), spelling and accents (Eugénie, Baudouin,
// Séverin, Édouard, Éric…). A feast day carries the first name celebrated
// with it when there is a clear one (11/11 Martin, 14/07 Camille, 15/08
// Marie…).
//
// 29 February (Auguste) only exists in leap years. Each first name gets a
// key (lower case, no accent, hyphens): the value of the scene filter, kept
// for ever.
// -----------------------------------------------------------------------------

// prettier-ignore
const CALENDAR = [
  // January
  [
    { feast: "Jour de l'An" }, 'Basile', 'Geneviève', 'Odilon', 'Édouard', 'Mélaine', 'Raymond',
    'Lucien', 'Alix', 'Guillaume', 'Pauline', 'Tatiana', 'Yvette', 'Nina', 'Rémi', 'Marcel',
    'Roseline', 'Prisca', 'Marius', 'Sébastien', 'Agnès', 'Vincent', 'Barnard',
    'François de Sales', { feast: 'Conversion de Paul' }, 'Paule', 'Angèle', "Thomas d'Aquin",
    'Gildas', 'Martine', 'Marcelle',
  ],
  // February
  [
    'Ella', { feast: 'Présentation du Seigneur' }, 'Blaise', 'Véronique', 'Agathe', 'Gaston',
    'Eugénie', 'Jacqueline', 'Apolline', 'Arnaud', { feast: 'Notre-Dame de Lourdes' }, 'Félix',
    'Béatrice', 'Valentin', 'Claude', 'Julienne', 'Alexis', 'Bernadette', 'Gabin', 'Aimée',
    'Pierre Damien', 'Isabelle', 'Lazare', 'Modeste', 'Roméo', 'Nestor', 'Honorine', 'Romain',
    'Auguste',
  ],
  // March
  [
    'Aubin', 'Charles le Bon', 'Guénolé', 'Casimir', 'Olive', 'Colette', 'Félicité',
    'Jean de Dieu', 'Françoise', 'Vivien', 'Rosine', 'Justine', 'Rodrigue', 'Mathilde', 'Louise',
    'Bénédicte', 'Patrice', 'Cyrille', 'Joseph', 'Herbert', 'Clémence', 'Léa', 'Victorien',
    'Karine', { feast: 'Annonciation', name: 'Humbert' }, 'Larissa', 'Habib', 'Gontran',
    'Gwladys', 'Amédée', 'Benjamin',
  ],
  // April
  [
    'Hugues', 'Sandrine', 'Richard', 'Isidore', 'Irène', 'Marcellin', 'Jean-Baptiste de la Salle',
    'Julie', 'Gautier', 'Fulbert', 'Stanislas', 'Jules', 'Ida', 'Maxime', 'Paterne',
    'Benoît-Joseph', 'Anicet', 'Parfait', 'Emma', 'Odette', 'Anselme', 'Alexandre', 'Georges',
    'Fidèle', 'Marc', 'Alida', 'Zita', 'Valérie', 'Catherine de Sienne', 'Robert',
  ],
  // May
  [
    { feast: 'Fête du Travail', name: 'Joseph' }, 'Boris', 'Philippe', 'Sylvain', 'Judith',
    'Prudence', 'Gisèle', { feast: 'Victoire 1945', name: 'Désiré' }, 'Pacôme', 'Solange',
    'Estelle', 'Achille', 'Rolande', 'Matthias', 'Denise', 'Honoré', 'Pascal', 'Éric', 'Yves',
    'Bernardin', 'Constantin', 'Émile', 'Didier', 'Donatien', 'Sophie', 'Bérenger', 'Augustin',
    'Germain', 'Aymar', 'Ferdinand', 'Pétronille',
  ],
  // June
  [
    'Justin', 'Blandine', 'Kévin', 'Clotilde', 'Igor', 'Norbert', 'Gilbert', 'Médard', 'Diane',
    'Landry', 'Barnabé', 'Guy', 'Antoine de Padoue', 'Élisée', 'Germaine', 'Jean-François Régis',
    'Hervé', 'Léonce', 'Romuald', 'Silvère', 'Gonzague', 'Alban', 'Audrey', 'Jean-Baptiste',
    'Prosper', 'Anthelme', 'Fernand', 'Irénée', 'Pierre', 'Martial',
  ],
  // July
  [
    'Thierry', 'Martinien', 'Thomas', 'Florent', 'Antoine', 'Mariette', 'Raoul', 'Thibault',
    'Amandine', 'Ulrich', 'Benoît', 'Olivier', 'Henri',
    { feast: 'Fête nationale', name: 'Camille' }, 'Donald',
    { feast: 'Notre-Dame du Mont-Carmel' }, 'Charlotte', 'Frédéric', 'Arsène', 'Marina', 'Victor',
    'Marie-Madeleine', 'Brigitte', 'Christine', 'Jacques', 'Anne', 'Nathalie', 'Samson', 'Marthe',
    'Juliette', 'Ignace de Loyola',
  ],
  // August
  [
    'Alphonse', 'Julien Eymard', 'Lydie', 'Jean-Marie Vianney', 'Abel',
    { feast: 'Transfiguration' }, 'Gaétan', 'Dominique', 'Amour', 'Laurent', 'Claire', 'Clarisse',
    'Hippolyte', 'Évrard', { feast: 'Assomption', name: 'Marie' }, 'Armel', 'Hyacinthe', 'Hélène',
    'Jean-Eudes', 'Bernard', 'Christophe', 'Fabrice', 'Rose de Lima', 'Barthélemy', 'Louis',
    'Natacha', 'Monique', 'Augustin', 'Sabine', 'Fiacre', 'Aristide',
  ],
  // September
  [
    'Gilles', 'Ingrid', 'Grégoire', 'Rosalie', 'Raïssa', 'Bertrand', 'Reine',
    { feast: 'Nativité de Marie' }, 'Alain', 'Inès', 'Adelphe', 'Apollinaire', 'Aimé',
    { feast: 'Croix glorieuse' }, 'Roland', 'Édith', 'Renaud', 'Nadège', 'Émilie', 'Davy',
    'Matthieu', 'Maurice', 'Constant', 'Thècle', 'Hermann', 'Côme', 'Vincent de Paul',
    'Venceslas', 'Michel', 'Jérôme',
  ],
  // October
  [
    "Thérèse de l'Enfant Jésus", 'Léger', 'Gérard', "François d'Assise", 'Fleur', 'Bruno',
    'Serge', 'Pélagie', 'Denis', 'Ghislain', 'Firmin', 'Wilfried', 'Géraud', 'Juste',
    "Thérèse d'Avila", 'Edwige', 'Baudouin', 'Luc', 'René', 'Adeline', 'Céline', 'Élodie',
    'Jean de Capistran', 'Florentin', 'Crépin', 'Dimitri', 'Émeline', 'Jude', 'Narcisse',
    'Bienvenue', 'Quentin',
  ],
  // November
  [
    { feast: 'Toussaint' }, { feast: 'Défunts' }, 'Hubert', 'Charles', 'Sylvie', 'Bertille',
    'Carine', 'Geoffroy', 'Théodore', 'Léon', { feast: 'Armistice 1918', name: 'Martin' },
    'Christian', 'Brice', 'Sidoine', 'Albert', 'Marguerite', 'Élisabeth', 'Aude', 'Tanguy',
    'Edmond', { feast: 'Présentation de Marie' }, 'Cécile', 'Clément', 'Flora', 'Catherine',
    'Delphine', 'Séverin', 'Jacques de la Marche', 'Saturnin', 'André',
  ],
  // December
  [
    'Florence', 'Viviane', 'François-Xavier', 'Barbara', 'Gérald', 'Nicolas', 'Ambroise',
    { feast: 'Immaculée Conception' }, 'Pierre Fourier', 'Romaric', 'Daniel',
    'Jeanne-Françoise de Chantal', 'Lucie', 'Odile', 'Ninon', 'Alice', 'Gaël', 'Gatien', 'Urbain',
    'Théophile', 'Pierre Canisius', 'Françoise-Xavière', 'Armand', 'Adèle',
    { feast: 'Noël', name: 'Emmanuel' }, 'Étienne', 'Jean', { feast: 'Saints Innocents' },
    'David', 'Roger', 'Sylvestre',
  ],
];

/**
 * @description The key of a first name: lower case, no accent, hyphens.
 * @param {string} name - The name.
 * @returns {string} The key.
 * @example
 * nameKey('Thérèse d’Avila'); // -> 'therese-d-avila'
 */
function nameKey(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * @description The entry of a day of the year.
 * @param {number} month - 1-12.
 * @param {number} day - 1-31.
 * @returns {{ name: string|null, feast: string|null, key: string|null }|null}
 * The first name celebrated (null on a feast without one), the feast, the key
 * of the first name; null for a day that does not exist.
 * @example
 * dayEntry(4, 28); // -> { name: 'Valérie', feast: null, key: 'valerie' }
 */
function dayEntry(month, day) {
  const raw = CALENDAR[month - 1]?.[day - 1];
  if (raw === undefined) {
    return null;
  }
  const name = typeof raw === 'string' ? raw : (raw.name ?? null);
  return {
    name,
    feast: typeof raw === 'string' ? null : raw.feast,
    key: name === null ? null : nameKey(name),
  };
}

/**
 * @description Every first name of the list, once, sorted (the options of
 * the scene filter).
 * @returns {Array<{ key: string, name: string }>} The names.
 */
function allNames() {
  const byKey = new Map();
  CALENDAR.forEach((days, m) =>
    days.forEach((_, d) => {
      const entry = dayEntry(m + 1, d + 1);
      if (entry.key !== null && !byKey.has(entry.key)) {
        byKey.set(entry.key, entry.name);
      }
    }),
  );
  return [...byKey.entries()]
    .map(([key, name]) => ({ key, name }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export { CALENDAR, nameKey, dayEntry, allNames };
