// =====================
// RECHERCHE : TITRE, RÉALISATEUR, ADRESSE
// =====================

import {
  SEARCH_MIN_CHARS,
  SEARCH_RESULTS_LIMIT,
  SEARCH_DEBOUNCE_DELAY,
  SEARCH_BLUR_DELAY,
  SEARCH_ZOOM,
  SEARCH_LOCAL_MIN_CHARS,
  SEARCH_LOCAL_LIMIT,
  SEARCH_ADDRESS_LIMIT,
  FILTER_FIT_PADDING,
  FILTER_FIT_MAX_ZOOM,
  ANIMATION_DURATION,
} from "../config.js";
import { state } from "../state.js";
import { applyFilters, getShownExtent } from "../filters.js";
import { map } from "../map/map.js";
import { searchSource } from "../map/layers/search.js";
import { searchAddresses } from "../data/geocoding.js";
import { buildSearchIndex, searchIndex } from "../data/search-index.js";

const searchInput = document.getElementById("search-input");
const searchResultsList = document.getElementById("search-results");
const searchChips = document.getElementById("search-chips");

const TEXT_FILTERS = [
  { kind: "titre", name: "Titre" },
  { kind: "realisateur", name: "Réalisateur" },
];

let index = null;
let currentQuery = "";
let addressResults = [];
let searchTimeout = null;

// Suggestions affichées, pour la navigation au clavier
let items = [];
let activeItem = -1;

export function setSearchFeatures(features) {
  index = buildSearchIndex(features);
}

// ---------- Saisie ----------

function onInput() {
  clearTimeout(searchTimeout);
  currentQuery = searchInput.value.trim();
  addressResults = [];

  if (currentQuery.length < SEARCH_LOCAL_MIN_CHARS) {
    hideResults();
    return;
  }

  renderResults();

  if (currentQuery.length >= SEARCH_MIN_CHARS) {
    const q = currentQuery;
    searchTimeout = setTimeout(() => fetchAddresses(q), SEARCH_DEBOUNCE_DELAY);
  }
}

async function fetchAddresses(q) {
  try {
    const features = await searchAddresses(q, SEARCH_RESULTS_LIMIT);
    // Ignore une réponse arrivée après une nouvelle saisie
    if (q !== currentQuery) return;
    addressResults = features;
    renderResults();
  } catch (e) {
    console.error("Erreur BAN :", e);
  }
}

// ---------- Suggestions ----------

function renderResults() {
  const titres = index
    ? searchIndex(index.titres, currentQuery, SEARCH_LOCAL_LIMIT)
    : [];
  const realisateurs = index
    ? searchIndex(index.realisateurs, currentQuery, SEARCH_LOCAL_LIMIT)
    : [];
  const hasLocal = titres.length > 0 || realisateurs.length > 0;
  const adresses = hasLocal
    ? addressResults.slice(0, SEARCH_ADDRESS_LIMIT)
    : addressResults;

  searchResultsList.innerHTML = "";
  items = [];
  activeItem = -1;

  addGroup(
    "Titres",
    titres.map((entry) => ({
      label: entry.label,
      count: entry.count,
      onSelect: () => selectTextFilter("titre", entry),
    })),
  );
  addGroup(
    "Réalisateurs",
    realisateurs.map((entry) => ({
      label: entry.label,
      count: entry.count,
      onSelect: () => selectTextFilter("realisateur", entry),
    })),
  );
  addGroup(
    "Adresses",
    adresses.map((feature) => ({
      label: feature.properties.label,
      onSelect: () => selectAddress(feature),
    })),
  );

  searchResultsList.classList.toggle("visible", items.length > 0);
}

function addGroup(title, entries) {
  if (entries.length === 0) return;

  const header = document.createElement("li");
  header.className = "search-group";
  header.textContent = title;
  searchResultsList.appendChild(header);

  entries.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "search-item";

    const label = document.createElement("span");
    label.className = "search-item-label";
    label.textContent = entry.label;
    li.appendChild(label);

    if (entry.count) {
      const count = document.createElement("span");
      count.className = "search-item-count";
      count.textContent = `${entry.count} lieu${entry.count > 1 ? "x" : ""}`;
      li.appendChild(count);
    }

    // Garde le focus dans le champ pendant le clic
    li.addEventListener("mousedown", (e) => e.preventDefault());
    li.addEventListener("click", entry.onSelect);

    searchResultsList.appendChild(li);
    items.push({ li, onSelect: entry.onSelect });
  });
}

function hideResults() {
  searchResultsList.innerHTML = "";
  searchResultsList.classList.remove("visible");
  items = [];
  activeItem = -1;
}

function setActiveItem(i) {
  items[activeItem]?.li.classList.remove("search-item--active");
  activeItem = i;
  const item = items[activeItem];
  if (!item) return;
  item.li.classList.add("search-item--active");
  item.li.scrollIntoView({ block: "nearest" });
}

function onKeyDown(e) {
  if (!searchResultsList.classList.contains("visible")) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActiveItem((activeItem + 1) % items.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActiveItem((activeItem - 1 + items.length) % items.length);
  } else if (e.key === "Enter") {
    e.preventDefault();
    items[Math.max(activeItem, 0)]?.onSelect();
  } else if (e.key === "Escape") {
    hideResults();
  }
}

// ---------- Choix d'un titre ou d'un réalisateur ----------

function selectTextFilter(kind, entry) {
  state.filters[kind] = { key: entry.key, label: entry.label };

  searchInput.value = "";
  currentQuery = "";
  hideResults();
  renderChips();

  applyFilters();
  zoomToShown();
}

function zoomToShown() {
  const extent = getShownExtent();
  if (!extent) return;
  map.getView().fit(extent, {
    padding: FILTER_FIT_PADDING,
    maxZoom: FILTER_FIT_MAX_ZOOM,
    duration: ANIMATION_DURATION,
  });
}

// Étiquettes des filtres actifs, avec une croix pour les retirer
function renderChips() {
  searchChips.innerHTML = "";

  TEXT_FILTERS.forEach(({ kind, name }) => {
    const filter = state.filters[kind];
    if (!filter) return;

    const chip = document.createElement("span");
    chip.className = "search-chip";

    const kindEl = document.createElement("span");
    kindEl.className = "search-chip-kind";
    kindEl.textContent = name;

    const labelEl = document.createElement("span");
    labelEl.className = "search-chip-label";
    labelEl.textContent = filter.label;

    const remove = document.createElement("button");
    remove.className = "search-chip-remove";
    remove.type = "button";
    remove.textContent = "✕";
    remove.title = "Retirer ce filtre";
    remove.setAttribute("aria-label", `Retirer le filtre ${name.toLowerCase()}`);
    remove.addEventListener("click", () => {
      state.filters[kind] = null;
      renderChips();
      applyFilters();
    });

    chip.append(kindEl, labelEl, remove);
    searchChips.appendChild(chip);
  });
}

// ---------- Choix d'une adresse ----------

function selectAddress(feature) {
  const [lon, lat] = feature.geometry.coordinates;
  const coords = ol.proj.fromLonLat([lon, lat]);

  searchSource.clear();
  searchSource.addFeature(
    new ol.Feature({ geometry: new ol.geom.Point(coords) }),
  );

  map
    .getView()
    .animate({ center: coords, zoom: SEARCH_ZOOM, duration: ANIMATION_DURATION });

  searchInput.value = feature.properties.label;
  hideResults();
}

export function initSearch() {
  searchInput.addEventListener("input", onInput);
  searchInput.addEventListener("keydown", onKeyDown);

  searchInput.addEventListener("blur", function () {
    setTimeout(
      () => searchResultsList.classList.remove("visible"),
      SEARCH_BLUR_DELAY,
    );
  });

  searchInput.addEventListener("focus", function () {
    if (items.length > 0) searchResultsList.classList.add("visible");
  });
}
