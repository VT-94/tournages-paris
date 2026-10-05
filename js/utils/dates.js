// =====================
// CALCULS DE DATES
// =====================

// Les dates sont manipulées en « numéros de jour » (nombre de jours depuis le
// 1er janvier 1970) : comparer deux dates revient à comparer deux nombres.

const DAY_MS = 86400000;

export const MONTH_NAMES = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

// "2021-07-14" → numéro de jour
export function toDayNumber(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  return fromParts(y, m, d);
}

// (2021, 7, 14) → numéro de jour
export function fromParts(year, month, day) {
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

// numéro de jour → { year, month, day }
export function toParts(dayNumber) {
  const date = new Date(dayNumber * DAY_MS);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function startOfMonth(dayNumber) {
  const { year, month } = toParts(dayNumber);
  return fromParts(year, month, 1);
}

export function endOfMonth(dayNumber) {
  const { year, month } = toParts(dayNumber);
  return fromParts(year, month, daysInMonth(year, month));
}

// numéro de jour → « 14 juillet 2021 »
export function formatDay(dayNumber) {
  const { year, month, day } = toParts(dayNumber);
  return `${day === 1 ? "1er" : day} ${MONTH_NAMES[month - 1]} ${year}`;
}

// numéro de jour → « juillet 2021 »
export function formatMonth(dayNumber) {
  const { year, month } = toParts(dayNumber);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}
