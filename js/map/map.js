// =====================
// CARTE
// =====================

import {
  PARIS_CENTER,
  INITIAL_ZOOM,
  FIT_PADDING,
  FIT_MAX_ZOOM,
} from "../config.js";
import { basemapLayer } from "./basemaps.js";
import { communesLayer, arrondissementsLayer } from "./layers/admin.js";
import { vectorLayer } from "./layers/tournages.js";
import { searchLayer } from "./layers/search.js";
import { userLayer } from "./layers/user.js";

export const map = new ol.Map({
  target: "map",

  layers: [
    basemapLayer,
    communesLayer,
    arrondissementsLayer,
    vectorLayer,
    searchLayer,
    userLayer,
  ],

  view: new ol.View({
    center: ol.proj.fromLonLat([PARIS_CENTER.lon, PARIS_CENTER.lat]),

    zoom: INITIAL_ZOOM,
  }),
});

// Cadre la carte sur les données puis empêche d'en sortir
// (pas de dézoom ni de déplacement au-delà de cette emprise)
export function fitAndLockToExtent(extent) {
  map.getView().fit(extent, {
    padding: FIT_PADDING,

    maxZoom: FIT_MAX_ZOOM,
  });

  const fittedZoom = map.getView().getZoom();
  const fittedCenter = map.getView().getCenter();
  const fittedExtent = map.getView().calculateExtent(map.getSize());

  map.setView(
    new ol.View({
      center: fittedCenter,
      zoom: fittedZoom,
      minZoom: fittedZoom,
      extent: fittedExtent,
    }),
  );
}
