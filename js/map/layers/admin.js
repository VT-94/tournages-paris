// =====================
// COUCHES ADMINISTRATIVES
// =====================

import { ARRONDISSEMENTS_URL, COMMUNES_URL } from "../../config.js";

const adminFormat = new ol.format.GeoJSON({
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
});

const adminStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({ color: "rgb(0, 0, 0)", width: 0.3 }),
  fill: new ol.style.Fill({ color: "transparent" }),
});

export const arrondissementsLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    format: adminFormat,
    url: ARRONDISSEMENTS_URL,
    strategy: ol.loadingstrategy.all,
  }),
  style: adminStyle,
});

export const communesLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    format: adminFormat,
    url: COMMUNES_URL,
    strategy: ol.loadingstrategy.all,
  }),
  style: adminStyle,
});
