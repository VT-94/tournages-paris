// =====================
// FONDS DE CARTE
// =====================

import { CARTO_API_KEY } from "../config.js";

export const basemaps = [
  {
    id: "carto-light",
    name: "Fond gris",
    url: `https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
    attribution: "© OpenStreetMap contributors © CARTO",
  },
  {
    id: "osm",
    name: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  {
    id: "google-satellite",
    name: "Google Satellite",
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: "© Google",
  },
  {
    id: "ign-ortho",
    name: "IGN Ortho",
    url: "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg",
    attribution: "© IGN",
  },
];

export const basemapLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: basemaps[0].url,
    attributions: basemaps[0].attribution,
  }),
});

export function setBasemap(bm) {
  basemapLayer.setSource(
    new ol.source.XYZ({ url: bm.url, attributions: bm.attribution }),
  );
}
