// =====================
// FILTRES DES TOURNAGES
// =====================

// Combine les filtres (titre, réalisateur, date) et met la carte à jour.
// Les types de la légende sont vérifiés à part, dans isShown (state.js).

import { state, isShown } from "./state.js";
import { refreshTournagesLayer } from "./map/layers/tournages.js";
import { fromParts, daysInMonth, toParts } from "./utils/dates.js";

let allFeatures = [];
const listeners = [];

export function setFeatures(features) {
  allFeatures = features;
}

export function getAllFeatures() {
  return allFeatures;
}

// Appelle `callback` après chaque changement de filtre
export function onFiltersChange(callback) {
  listeners.push(callback);
}

// ---------- Titre et réalisateur ----------

export function matchesText(feature) {
  const { titre, realisateur } = state.filters;
  if (titre && feature.get("titre_cle") !== titre.key) return false;
  if (realisateur && feature.get("realisateur_cle") !== realisateur.key)
    return false;
  return true;
}

// ---------- Date ----------

// Un filtre de date est soit :
// - { kind: "range", start, end } : une période choisie sur la frise ;
// - { kind: "menus", year, month, day } : les menus, chacun pouvant être vide.

// Période continue correspondant au filtre de date,
// ou null s'il s'agit d'une date « récurrente » (ex. : tous les mois de juillet)
export function getDateRange(date) {
  if (!date) return null;
  if (date.kind === "range") return { start: date.start, end: date.end };

  const { year, month, day } = date;
  if (!year || (day && !month)) return null;
  if (!month) return { start: fromParts(year, 1, 1), end: fromParts(year, 12, 31) };
  if (!day)
    return {
      start: fromParts(year, month, 1),
      end: fromParts(year, month, daysInMonth(year, month)),
    };
  const d = fromParts(year, month, day);
  return { start: d, end: d };
}

function dayMatchesMenus(dayNumber, { year, month, day }) {
  const p = toParts(dayNumber);
  return (
    (!year || p.year === year) &&
    (!month || p.month === month) &&
    (!day || p.day === day)
  );
}

// Un tournage correspond dès que sa période touche la période choisie
export function matchesDate(feature, date = state.filters.date) {
  if (!date) return true;
  const start = feature.get("debut_jour");
  const end = feature.get("fin_jour");

  const range = getDateRange(date);
  if (range) return start <= range.end && end >= range.start;

  for (let d = start; d <= end; d++) {
    if (dayMatchesMenus(d, date)) return true;
  }
  return false;
}

// ---------- Application ----------

export function applyFilters() {
  state.matching = new Set(
    allFeatures.filter((f) => matchesText(f) && matchesDate(f)),
  );
  refreshTournagesLayer();
  listeners.forEach((callback) => callback());
}

export function countShown() {
  return allFeatures.filter(isShown).length;
}

export function getShownExtent() {
  const shown = allFeatures.filter(isShown);
  if (shown.length === 0) return null;
  const extent = ol.extent.createEmpty();
  shown.forEach((f) => ol.extent.extend(extent, f.getGeometry().getExtent()));
  return extent;
}
