// =====================
// DONNÉES DES TOURNAGES
// =====================

import { TOURNAGES_URL } from "../config.js";
import { normalizeText } from "../utils/text.js";
import { toDayNumber } from "../utils/dates.js";

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

    // Période en numéros de jour, pour les filtres de date
    const debut = toDayNumber(item.date_debut);
    const fin = toDayNumber(item.date_fin) ?? debut;

    const feature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),

      nom_tournage: item.nom_tournage,

      type_tournage: item.type_tournage,

      adresse_lieu: item.adresse_lieu,

      annee_tournage: item.annee_tournage,

      date_debut: item.date_debut,

      date_fin: item.date_fin,

      nom_realisateur: item.nom_realisateur,

      // Versions simplifiées pour la recherche (sans majuscules ni accents)
      titre_cle: normalizeText(item.nom_tournage),

      realisateur_cle: normalizeText(item.nom_realisateur),

      debut_jour: Math.min(debut, fin),

      fin_jour: Math.max(debut, fin),
    });

    features.push(feature);
  });

  return features;
}

export function getSeenTypes(data) {
  return new Set(data.map((item) => item.type_tournage).filter(Boolean));
}
