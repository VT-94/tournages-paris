// =====================
// RECHERCHE D'ADRESSE (API ADRESSE / BAN)
// =====================

import {
  ADRESSE_API_URL,
  PARIS_CENTER,
  SEARCH_RESULTS_LIMIT,
} from "../config.js";

export async function searchAddresses(q) {
  const url = `${ADRESSE_API_URL}?q=${encodeURIComponent(q)}&limit=${SEARCH_RESULTS_LIMIT}&lat=${PARIS_CENTER.lat}&lon=${PARIS_CENTER.lon}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.features;
}
