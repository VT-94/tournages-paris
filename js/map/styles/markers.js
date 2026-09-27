// =====================
// MARQUEURS INDIVIDUELS
// =====================

import { svgToDataUri } from "../../utils/svg.js";
import { getColor, typeIconInners } from "./types.js";

export function makeSvgMarker(color, innerSvg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28"><circle cx="14" cy="14" r="12.5" fill="${color}" stroke="white" stroke-width="2"/>${innerSvg}</svg>`;
  return svgToDataUri(svg);
}

export function makeSvgBadgeIcon(innerSvg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="20" height="20">${innerSvg}</svg>`;
  return svgToDataUri(svg);
}

const markerStyleCache = {};

export function getMarkerStyle(type) {
  if (markerStyleCache[type]) return markerStyleCache[type];
  const color = getColor(type);
  const inner = typeIconInners[type] || typeIconInners["Autre"];
  markerStyleCache[type] = new ol.style.Style({
    image: new ol.style.Icon({
      src: makeSvgMarker(color, inner),
      anchor: [0.5, 0.5],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
    }),
  });
  return markerStyleCache[type];
}
