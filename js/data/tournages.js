// =====================
// DONNÉES DES TOURNAGES
// =====================

import { TOURNAGES_URL } from "../config.js";

export async function fetchTournages() {
  const response = await fetch(TOURNAGES_URL);

  if (!response.ok) {
    throw new Error(`Erreur API ${response.status}`);
  }

  return response.json();
}

export function toFeatures(data) {
  const features = [];

  data.forEach((item) => {
    if (!item.geo_point_2d) return;

    const lon = item.geo_point_2d.lon;

    const lat = item.geo_point_2d.lat;

    const feature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),

      nom_tournage: item.nom_tournage,

      type_tournage: item.type_tournage,

      adresse_lieu: item.adresse_lieu,

      annee_tournage: item.annee_tournage,

      date_debut: item.date_debut,

      date_fin: item.date_fin,

      nom_realisateur: item.nom_realisateur,
    });

    features.push(feature);
  });

  return features;
}

export function getSeenTypes(data) {
  return new Set(data.map((item) => item.type_tournage).filter(Boolean));
}
