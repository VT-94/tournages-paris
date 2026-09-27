// =====================
// RECHERCHE ADRESSE
// =====================

import {
  SEARCH_MIN_CHARS,
  SEARCH_DEBOUNCE_DELAY,
  SEARCH_BLUR_DELAY,
  SEARCH_ZOOM,
  ANIMATION_DURATION,
} from "../config.js";
import { map } from "../map/map.js";
import { searchSource } from "../map/layers/search.js";
import { searchAddresses } from "../data/geocoding.js";

const searchInput = document.getElementById("search-input");
const searchResultsList = document.getElementById("search-results");
let searchTimeout = null;

async function fetchAddresses(q) {
  try {
    const features = await searchAddresses(q);

    searchResultsList.innerHTML = "";
    if (features.length === 0) {
      searchResultsList.classList.remove("visible");
      return;
    }

    features.forEach((feature) => {
      const li = document.createElement("li");
      li.textContent = feature.properties.label;
      li.addEventListener("click", () => selectAddress(feature));
      searchResultsList.appendChild(li);
    });

    searchResultsList.classList.add("visible");
  } catch (e) {
    console.error("Erreur BAN :", e);
  }
}

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
  searchResultsList.innerHTML = "";
  searchResultsList.classList.remove("visible");
}

export function initSearch() {
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length < SEARCH_MIN_CHARS) {
      searchResultsList.innerHTML = "";
      searchResultsList.classList.remove("visible");
      return;
    }
    searchTimeout = setTimeout(() => fetchAddresses(q), SEARCH_DEBOUNCE_DELAY);
  });

  searchInput.addEventListener("blur", function () {
    setTimeout(
      () => searchResultsList.classList.remove("visible"),
      SEARCH_BLUR_DELAY,
    );
  });
}
