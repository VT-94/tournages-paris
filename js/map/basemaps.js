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
    id: "ign-ortho",
    name: "IGN Ortho",
    url: "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg",
    attribution: "© IGN",
  },
];

// ---------------------------------------------------------------------
// FOND GOOGLE SATELLITE : RETIRÉ
// ---------------------------------------------------------------------
// Ancienne définition, retirée de la liste :
//
//   {
//     id: "google-satellite",
//     name: "Google Satellite",
//     url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
//     attribution: "© Google",
//   },
//
// Pourquoi : cette adresse est interne à Google Maps. L'utiliser sans clé
// est contraire aux conditions d'utilisation de Google et peut cesser de
// fonctionner à tout moment.
//
// Pour le réintégrer proprement : passer par la « Map Tiles API » officielle
// de Google (compte Google Cloud avec facturation activée + clé API).
// Principe, à vérifier dans la documentation Google au moment de le faire :
//   1. créer une session au chargement de la page :
//      POST https://tile.googleapis.com/v1/createSession?key=CLÉ
//      avec { "mapType": "satellite", "language": "fr-FR", "region": "FR" }
//   2. utiliser le jeton de session reçu dans l'adresse des images :
//      https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=JETON&key=CLÉ
//   3. afficher l'attribution fournie par Google (elle varie selon la zone).
// Penser à limiter la clé au domaine du site, comme pour CARTO.

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
