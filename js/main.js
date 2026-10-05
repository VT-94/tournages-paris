// =====================
// POINT D'ENTRÉE
// =====================

import { vectorSource } from "./map/layers/tournages.js";
import { fitAndLockToExtent } from "./map/map.js";
import { fetchTournages, toFeatures, getSeenTypes } from "./data/tournages.js";
import { setFeatures, applyFilters } from "./filters.js";
import { initPopup } from "./ui/popup.js";
import { initLegend, buildLegend } from "./ui/legend.js";
import { initSearch, setSearchFeatures } from "./ui/search.js";
import { initTimeline } from "./ui/timeline.js";
import { initGeolocation } from "./ui/geolocation.js";
import { initBasemapPicker } from "./ui/basemap-picker.js";
import { hideLoading, showError } from "./ui/loading.js";

async function loadData() {
  try {
    const data = await fetchTournages();
    const features = toFeatures(data);

    buildLegend(getSeenTypes(data));

    setFeatures(features);
    vectorSource.addFeatures(features);

    fitAndLockToExtent(vectorSource.getExtent());

    setSearchFeatures(features);
    initTimeline(features);
    applyFilters();

    hideLoading();
    console.log(`${features.length} points chargés`);
  } catch (error) {
    console.error(error);
    showError(`Impossible de charger les tournages (${error.message})`);
  }
}

initPopup();
initLegend();
initSearch();
initGeolocation();
initBasemapPicker();

loadData();
