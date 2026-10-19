// -----------------------------------------------------------------------------
// Calendar days as YYYY-MM-DD texts (pure functions, no clock, no timezone):
// "today" comes from src/time.js, in the timezone of Gladys.
// -----------------------------------------------------------------------------

const MS_PER_DAY = 86400000;

/**
 * @description Read a YYYY-MM-DD day.
 * @param {string} iso - The day.
 * @returns {{ year: number, month: number, day: number }} The date.
 */
function parseDay(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  return { year, month, day };
}

/**
 * @description Write a date as YYYY-MM-DD.
 * @param {{ year: number, month: number, day: number }} date - The date.
 * @returns {string} The day.
 */
function toIso({ year, month, day }) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * @description Add days to a YYYY-MM-DD day.
 * @param {string} iso - The day.
 * @param {number} days - Days to add (negative: before).
 * @returns {string} The day.
 * @example
 * addDays('2026-12-31', 1); // -> '2027-01-01'
 */
function addDays(iso, days) {
  const { year, month, day } = parseDay(iso);
  const date = new Date(Date.UTC(year, month - 1, day) + days * MS_PER_DAY);
  return toIso({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

/**
 * @description The day of the year of a day, as the "MM-DD" key of the names.
 * @param {string} iso - YYYY-MM-DD.
 * @returns {string} MM-DD.
 * @example
 * monthDay('2026-04-28'); // -> '04-28'
 */
const monthDay = (iso) => String(iso).slice(5, 10);

/**
 * @description Every MM-DD of a leap year, from 01-01 to 12-31 (366 days).
 * @returns {string[]} The keys.
 */
function allMonthDays() {
  const days = [];
  for (let iso = '2028-01-01'; iso <= '2028-12-31'; iso = addDays(iso, 1)) {
    days.push(monthDay(iso));
  }
  return days;
}

export { parseDay, toIso, addDays, monthDay, allMonthDays };
