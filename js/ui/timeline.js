// =====================
// FRISE ET MENUS DE DATE
// =====================

// La frise et les menus Année / Mois / Jour modifient le même filtre de date
// (state.filters.date) et restent synchronisés :
// - choisir dans les menus place les poignées de la frise ;
// - déplacer les poignées vide les menus.

import { state, hasActiveType } from "../state.js";
import {
  applyFilters,
  onFiltersChange,
  getAllFeatures,
  getDateRange,
  matchesText,
  countShown,
} from "../filters.js";
import {
  MONTH_NAMES,
  toParts,
  fromParts,
  daysInMonth,
  startOfMonth,
  endOfMonth,
  formatDay,
  formatMonth,
} from "../utils/dates.js";

const timeline = document.getElementById("timeline");
const toggleBtn = document.getElementById("timeline-toggle");
const labelEl = document.getElementById("timeline-label");
const countEl = document.getElementById("timeline-count");
const yearSelect = document.getElementById("date-year");
const monthSelect = document.getElementById("date-month");
const daySelect = document.getElementById("date-day");
const resetBtn = document.getElementById("date-reset");
const histogram = document.getElementById("timeline-histogram");
const band = document.getElementById("timeline-band");
const startInput = document.getElementById("timeline-start");
const endInput = document.getElementById("timeline-end");
const yearsEl = document.getElementById("timeline-years");

// Domaine de la frise, en numéros de jour : du 1er jour du premier mois
// au dernier jour du dernier mois des données
let minDay = 0;
let maxDay = 0;

// Un élément par mois de la frise : { start, end, year, month, column, bar, count }
let months = [];

// Infobulle affichée au survol d'une barre
const tooltip = document.createElement("div");
tooltip.className = "timeline-tooltip";
tooltip.setAttribute("role", "tooltip");
tooltip.hidden = true;
let hoveredMonth = null;

let pendingFrame = null;

// Les poignées représentent des « bornes » entre deux jours :
// début = premier jour inclus, fin = lendemain du dernier jour inclus.
function percent(boundary) {
  return ((boundary - minDay) / (maxDay + 1 - minDay)) * 100;
}

// ---------- Construction ----------

export function initTimeline(features) {
  minDay = startOfMonth(
    features.reduce((min, f) => Math.min(min, f.get("debut_jour")), Infinity),
  );
  maxDay = endOfMonth(
    features.reduce((max, f) => Math.max(max, f.get("fin_jour")), -Infinity),
  );

  buildMonths();
  buildMenus();
  buildYearLabels();

  [startInput, endInput].forEach((input) => {
    input.min = minDay;
    input.max = maxDay + 1;
  });

  startInput.addEventListener("input", () => onSliderInput(startInput));
  endInput.addEventListener("input", () => onSliderInput(endInput));
  [yearSelect, monthSelect, daySelect].forEach((select) =>
    select.addEventListener("change", onMenuChange),
  );
  resetBtn.addEventListener("click", resetDate);
  toggleBtn.addEventListener("click", () =>
    setCollapsed(!timeline.classList.contains("timeline--collapsed")),
  );

  // Sur petit écran, la frise démarre repliée pour laisser voir la carte
  setCollapsed(window.matchMedia("(max-width: 700px)").matches);

  syncSlider();
  onFiltersChange(update);
  timeline.hidden = false;
}

function buildMonths() {
  months = [];
  histogram.innerHTML = "";

  for (let start = minDay; start <= maxDay; start = endOfMonth(start) + 1) {
    const end = endOfMonth(start);
    const { year, month } = toParts(start);

    // Colonne sur toute la hauteur : plus facile à survoler qu'une barre basse
    const column = document.createElement("div");
    column.className = "timeline-column";
    column.style.left = `${percent(start)}%`;
    column.style.width = `${percent(end + 1) - percent(start)}%`;

    const bar = document.createElement("div");
    bar.className = "timeline-bar";
    column.appendChild(bar);

    const entry = { start, end, year, month, column, bar, count: 0 };
    column.addEventListener("click", () => selectMonth(year, month));
    column.addEventListener("mouseenter", () => showTooltip(entry));
    column.addEventListener("mouseleave", hideTooltip);
    histogram.appendChild(column);

    months.push(entry);
  }

  histogram.appendChild(tooltip);
}

function showTooltip(month) {
  hoveredMonth = month;
  tooltip.innerHTML = "";

  const title = document.createElement("strong");
  title.textContent = capitalize(formatMonth(month.start));

  const count = document.createElement("span");
  count.className = "timeline-tooltip-count";
  count.textContent = `${month.count.toLocaleString("fr-FR")} tournage${month.count > 1 ? "s" : ""}`;

  const hint = document.createElement("span");
  hint.className = "timeline-tooltip-hint";
  hint.textContent = "Cliquer pour choisir ce mois";

  tooltip.append(title, count, hint);
  tooltip.hidden = false;

  // Centrée au-dessus de la barre, sans dépasser les bords de la frise
  const center = month.column.offsetLeft + month.column.offsetWidth / 2;
  const half = tooltip.offsetWidth / 2;
  const left = Math.min(
    Math.max(center, half),
    histogram.offsetWidth - half,
  );
  tooltip.style.left = `${left}px`;
  tooltip.style.setProperty("--arrow-offset", `${center - left}px`);
}

function hideTooltip() {
  hoveredMonth = null;
  tooltip.hidden = true;
}

function buildMenus() {
  const firstYear = toParts(minDay).year;
  const lastYear = toParts(maxDay).year;
  for (let year = firstYear; year <= lastYear; year++) {
    yearSelect.add(new Option(year, year));
  }
  MONTH_NAMES.forEach((name, i) => {
    monthSelect.add(new Option(name.charAt(0).toUpperCase() + name.slice(1), i + 1));
  });
  fillDays();
}

// Propose 28 à 31 jours selon l'année et le mois choisis
function fillDays() {
  const year = Number(yearSelect.value) || 2024; // 2024 : année bissextile
  const month = Number(monthSelect.value);
  const count = month ? daysInMonth(year, month) : 31;
  const selected = Number(daySelect.value);

  daySelect.length = 1;
  for (let day = 1; day <= count; day++) {
    daySelect.add(new Option(day, day));
  }
  daySelect.value = selected && selected <= count ? selected : "";
}

function buildYearLabels() {
  yearsEl.innerHTML = "";
  for (let year = toParts(minDay).year; year <= toParts(maxDay).year; year++) {
    const start = Math.max(fromParts(year, 1, 1), minDay);
    const label = document.createElement("span");
    label.className = "timeline-year";
    label.style.left = `${percent(start)}%`;
    label.textContent = year;
    yearsEl.appendChild(label);
  }
}

function setCollapsed(collapsed) {
  timeline.classList.toggle("timeline--collapsed", collapsed);
  toggleBtn.setAttribute("aria-expanded", String(!collapsed));
}

// ---------- Choix de l'utilisateur ----------

function onMenuChange() {
  fillDays();

  const year = Number(yearSelect.value) || null;
  const month = Number(monthSelect.value) || null;
  const day = Number(daySelect.value) || null;

  state.filters.date =
    year || month || day ? { kind: "menus", year, month, day } : null;

  syncSlider();
  scheduleApply();
}

function selectMonth(year, month) {
  yearSelect.value = year;
  monthSelect.value = month;
  daySelect.value = "";
  onMenuChange();
}

function resetDate() {
  yearSelect.value = "";
  monthSelect.value = "";
  daySelect.value = "";
  onMenuChange();
}

// Borne de mois la plus proche
function nearestMonthBoundary(boundary) {
  const start = startOfMonth(Math.min(boundary, maxDay));
  const next = endOfMonth(start) + 1;
  return boundary - start <= next - boundary ? start : next;
}

function onSliderInput(movedInput) {
  let start = nearestMonthBoundary(Number(startInput.value));
  let end = nearestMonthBoundary(Number(endInput.value));

  // Au moins un mois entre les deux poignées
  if (end <= start) {
    if (movedInput === startInput) start = startOfMonth(end - 1);
    else end = endOfMonth(start) + 1;
  }

  // La frise remplace les menus
  yearSelect.value = "";
  monthSelect.value = "";
  daySelect.value = "";
  fillDays();

  state.filters.date =
    start === minDay && end === maxDay + 1
      ? null
      : { kind: "range", start, end: end - 1 };

  syncSlider();
  scheduleApply();
}

// Regroupe les mises à jour pendant qu'on fait glisser une poignée
function scheduleApply() {
  if (pendingFrame) return;
  pendingFrame = requestAnimationFrame(() => {
    pendingFrame = null;
    applyFilters();
  });
}

// ---------- Affichage ----------

// Place les poignées et la bande selon le filtre de date
function syncSlider() {
  const date = state.filters.date;
  const range = getDateRange(date);

  let start = minDay;
  let end = maxDay + 1;
  if (range) {
    start = range.start;
    end = range.end + 1;
  } else if (date?.year) {
    // Date récurrente dans une année (ex. : le 14 de chaque mois de 2021)
    start = fromParts(date.year, 1, 1);
    end = fromParts(date.year + 1, 1, 1);
  }
  start = Math.min(Math.max(start, minDay), maxDay);
  end = Math.min(Math.max(end, start + 1), maxDay + 1);

  startInput.value = start;
  endInput.value = end;

  // Poignée de début au-dessus quand celle de fin est tout à droite,
  // pour pouvoir les séparer si elles se superposent
  startInput.classList.toggle("timeline-input--top", end === maxDay + 1);

  // Pour une date récurrente, ce sont les barres qui montrent la sélection
  const recurring = date && !range;
  band.hidden = recurring;
  band.style.left = `${percent(start)}%`;
  band.style.width = `${percent(end) - percent(start)}%`;
}

function isMonthSelected(month, date) {
  if (!date) return true;
  const range = getDateRange(date);
  if (range) return month.start <= range.end && month.end >= range.start;
  return (
    (!date.year || month.year === date.year) &&
    (!date.month || month.month === date.month)
  );
}

// Met à jour l'histogramme, le résumé et le compteur
function update() {
  const date = state.filters.date;
  const firstMonth = months[0];

  // Nombre de tournages par mois, selon les types cochés et le titre /
  // réalisateur choisi (sans tenir compte de la date)
  const counts = new Array(months.length).fill(0);
  getAllFeatures().forEach((f) => {
    if (!hasActiveType(f) || !matchesText(f)) return;
    const from = monthIndex(f.get("debut_jour"), firstMonth);
    const to = monthIndex(f.get("fin_jour"), firstMonth);
    for (let i = Math.max(from, 0); i <= Math.min(to, months.length - 1); i++) {
      counts[i]++;
    }
  });

  const max = Math.max(...counts, 1);
  months.forEach((month, i) => {
    const count = counts[i];
    month.count = count;
    month.bar.style.height = count ? `max(2px, ${(count / max) * 100}%)` : "0";
    month.column.classList.toggle(
      "timeline-column--off",
      !isMonthSelected(month, date),
    );
    month.column.setAttribute(
      "aria-label",
      `${formatMonth(month.start)} : ${count} tournage${count > 1 ? "s" : ""}`,
    );
  });

  // L'infobulle ouverte suit les nouveaux chiffres
  if (hoveredMonth) showTooltip(hoveredMonth);

  labelEl.textContent = describeDate(date);
  const shown = countShown();
  countEl.textContent = `${shown.toLocaleString("fr-FR")} tournage${shown > 1 ? "s" : ""}`;
}

function monthIndex(dayNumber, firstMonth) {
  const { year, month } = toParts(dayNumber);
  return (year - firstMonth.year) * 12 + (month - firstMonth.month);
}

function describeDate(date) {
  if (!date) {
    return `Toute la période (${toParts(minDay).year} – ${toParts(maxDay).year})`;
  }

  if (date.kind === "range") {
    const wholeMonths =
      date.start === startOfMonth(date.start) && date.end === endOfMonth(date.end);
    if (!wholeMonths) return `${formatDay(date.start)} → ${formatDay(date.end)}`;
    if (startOfMonth(date.start) === startOfMonth(date.end)) {
      return capitalize(formatMonth(date.start));
    }
    return `${capitalize(formatMonth(date.start))} → ${formatMonth(date.end)}`;
  }

  const { year, month, day } = date;
  const monthName = month && MONTH_NAMES[month - 1];
  const dayName = day === 1 ? "1er" : day;

  if (year && month && day) return `${dayName} ${monthName} ${year}`;
  if (year && month) return capitalize(`${monthName} ${year}`);
  if (year && day) return `Le ${dayName} de chaque mois de ${year}`;
  if (year) return `Année ${year}`;
  if (month && day) return `Chaque ${dayName} ${monthName}`;
  if (month) return `Chaque année en ${monthName}`;
  return `Le ${dayName} de chaque mois`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
